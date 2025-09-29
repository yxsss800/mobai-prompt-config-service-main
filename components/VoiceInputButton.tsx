'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button'; // 我们使用项目已有的Button组件

export default function VoiceInputButton() {
  // --- State and Refs ---
  // isRecording: 是否正在录音的状态，用于改变按钮文字
  const [isRecording, setIsRecording] = useState(false);
  // transcribedText: 存储从后端返回的识别结果
  const [transcribedText, setTranscribedText] = useState('');
  // error: 存储可能发生的错误信息
  const [error, setError] = useState('');

  // mediaRecorderRef: 用来存储 MediaRecorder 的实例
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // audioChunksRef: 用来存储录音产生的音频数据块
  const audioChunksRef = useRef<Blob[]>([]);

  // --- Function to handle starting the recording ---
  const handleStartRecording = async () => {
    // 重置之前的状态
    setTranscribedText('');
    setError('');
    setIsRecording(true);

    try {
      // 1. 请求麦克风权限并获取音频流
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. 创建 MediaRecorder 实例
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = []; // 清空上一次的音频数据

      // 3. 当有音频数据块可用时，存入数组
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // 4. 当录音停止时，将数据块组合并发送到后端
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
          setError('正在识别中，请稍候...');
          const response = await fetch('/api/asr/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('服务器响应错误');
          }

          const result = await response.json();
          if (result.text) {
            setTranscribedText(result.text);
            setError(''); // 清除“识别中”的提示
          } else {
            throw new Error(result.error || '未能识别出文本');
          }

        } catch (apiError: any) {
          console.error('语音识别API调用失败:', apiError);
          setError(`识别失败: ${apiError.message}`);
        }
      };

      // 5. 开始录音
      recorder.start();

    } catch (err) {
      console.error('获取麦克风失败:', err);
      setError('无法获取麦克风权限，请在浏览器设置中允许访问。');
      setIsRecording(false);
    }
  };

  // --- Function to handle stopping the recording ---
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    // 停止麦克风轨道，这样浏览器上的录音图标会消失
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <Button
        onMouseDown={handleStartRecording} // 鼠标按下开始
        onMouseUp={handleStopRecording}   // 鼠标松开结束
        onTouchStart={handleStartRecording} // 触摸开始
        onTouchEnd={handleStopRecording}     // 触摸结束
        className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
      >
        {isRecording ? '松开结束' : '按住说话'}
      </Button>

      {/* 显示识别结果或错误信息 */}
      <div className="mt-4 p-2 border rounded min-h-[40px] text-center">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <p>{transcribedText || '识别结果将显示在这里'}</p>
        )}
      </div>
    </div>
  );
}