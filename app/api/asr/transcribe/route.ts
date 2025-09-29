import { NextResponse } from 'next/server';
// 阿里云的SDK，我们之前已经安装过了
import RPCClient from '@alicloud/pop-core';

// 这是一个辅助函数，用来将音频流转换为Node.js的Buffer
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
    const chunks: Buffer[] = [];
    const reader = stream.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
}

// 初始化 Qwen 的客户端
const client = new RPCClient({
    accessKeyId: process.env.QWEN_ACCESS_KEY_ID!,
    accessKeySecret: process.env.QWEN_ACCESS_KEY_SECRET!,
    endpoint: 'https://nls-gateway.cn-shanghai.aliyuncs.com',
    apiVersion: '2019-02-28',
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File | null;

        if (!audioFile) {
            return NextResponse.json({ error: '没有提供音频文件' }, { status: 400 });
        }

        // 将文件流转为 buffer，再转为 base64
        const audioBuffer = await streamToBuffer(audioFile.stream());
        const audioBase64 = audioBuffer.toString('base64');

        // 调用 Qwen 的一句话识别服务
        // 详细参数可以参考 Qwen 官方文档
        const asrResponse: any = await client.request(
            'PostFileTrans', // API Action
            {
                appkey: process.env.QWEN_ASR_APP_KEY,
                file: audioBase64,
                format: "wav", // 这里假设前端传的是wav，可以根据需要修改
                sample_rate: 16000,
            },
            { method: 'POST' }
        );

        if (asrResponse.Status === 200 && asrResponse.Result) {
            // 成功，返回识别出的文本
            return NextResponse.json({ text: asrResponse.Result.Sentence });
        } else {
            console.error('Qwen ASR 识别失败:', asrResponse);
            return NextResponse.json({ error: '语音识别服务失败', details: asrResponse.Message }, { status: 500 });
        }

    } catch (error) {
        console.error('ASR 接口错误:', error);
        return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
    }
}