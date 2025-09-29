require('dotenv').config();
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');
const { PrismaClient } = require('@prisma/client');
const WS = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = 3002;
const prisma = new PrismaClient();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url, true);

    // 只处理我们自己的 TTS 请求
    if (pathname === '/api/tts/stream') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // 对于不认识的 WebSocket 请求直接销毁连接
      socket.destroy();
    }
  });

  // --- WebSocket 的处理逻辑 ---
  wss.on('connection', (ws) => {
    console.log('[Custom Server] 前端 WebSocket 已连接');

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        const { character_id, text } = data;

        if (!character_id || !text) {
          ws.send(JSON.stringify({ error: '缺少 character_id 或 text 参数' }));
          return ws.close();
        }

        const binding = await prisma.ttsBinding.findUnique({
          where: { characterId: parseInt(character_id, 10) }, 
        });
        const voiceId = binding?.voiceId || 'male-qn-jingying-jingpin';

        const minimaxUrl = `wss://api.minimaxi.com/ws/v1/t2a_v2`;
        const minimaxWs = new WS(minimaxUrl, {
          headers: { 'Authorization': `Bearer ${process.env.MINIMAX_API_KEY}` }
        });

        minimaxWs.on('open', () => {
          console.log(`[Custom Server] 已连接到 Minimax，准备开始任务...`);
          // 发送“任务开始”事件
          minimaxWs.send(JSON.stringify({
            event: "task_start",
            model: "speech-02-turbo",
            voice_setting: {       
              voice_id: voiceId,   
              speed: 1.0,          
            }
          }));
        });

        minimaxWs.on('message', (data, isBinary) => {
          // 从 Minimax 收到的消息总是文本（JSON）
          const rawMessage = data.toString();
          const msg = JSON.parse(rawMessage);
          
          if (msg.data && msg.data.audio && msg.data.audio.length > 0) {
            // 获取十六进制的音频字符串
            const hexAudio = msg.data.audio; 
            // 将十六进制字符串转换为二进制数据 (Buffer)
            const audioBuffer = Buffer.from(hexAudio, 'hex');
            // 将真正的二进制音频数据发送给前端
            console.log(`[Custom Server] 正在向前端转发一个大小为 ${audioBuffer.length} 字节的音频数据块...`);
            ws.send(audioBuffer);
          }

          // 处理事件消息的逻辑
          if (msg.base_resp && msg.base_resp.status_code !== 0) {
            console.error('[Custom Server] Minimax 返回错误:', msg.base_resp.status_msg);
            minimaxWs.close();
          }

          switch (msg.event) {
            case "connected_success":
              console.log(`[Custom Server] Minimax 连接成功, session_id: ${msg.session_id}`);
              break;
            case "task_started":
              console.log("[Custom Server] Minimax 任务已开始，发送文本...");
              minimaxWs.send(JSON.stringify({ event: "task_continue", text: text }));
              minimaxWs.send(JSON.stringify({ event: "task_finish" }));
              break;
            case "task_finished":
              console.log("[Custom Server] Minimax 任务已完成。");
              minimaxWs.close();
              break;
            case "task_failed":
              console.error("[Custom Server] Minimax 任务失败:", msg.base_resp.status_msg);
              minimaxWs.close();
              break;
          }
        });

        minimaxWs.on('close', () => ws.close());
        minimaxWs.on('error', (error) => {
          console.error('[Custom Server] Minimax WebSocket 错误:', error);
          ws.close();
        });

      } catch (error) {
        console.error('[Custom Server] 处理 TTS 请求时发生错误:', error);
        ws.close();
      }
    });

    ws.on('close', () => console.log('[Custom Server] 前端 WebSocket 已断开'));
  });
  // --- WebSocket 逻辑结束 ---

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});