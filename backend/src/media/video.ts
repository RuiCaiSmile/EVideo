const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const process = require('process');

const streamUrl = 'rtmp://localhost:1935/living/testLive.flv';
let buffers = [];

// 将本地视频推送到webRTC 或 websocket
export const pushVideoStream = ({ videoPath, server, isHttp = false }: any) => {
  let ffmpegArgs = ['-i', videoPath, '-c:v', 'copy', '-f', 'h264', '-'];
  if (isHttp) {
    ffmpegArgs = ['-re', '-i', videoPath, '-c', 'copy', '-f', 'flv', streamUrl];
  }
  console.log('ffmpegArgs', ffmpegArgs);
  const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
    stdio: ['ignore', 'pipe', 'inherit'],
    shell: process.platform === 'win32',
    // detached: true,
  });

  // 将FFmpeg输出数据流写入server
  ffmpeg.stdout.on('data', (data) => {
    if (!isHttp) {
      if (server.readyState === 1) {
        // server.send(JSON.stringify({ event: 'video-stream', data: data }));
        buffers.push(data);
      }
    } else {
      // server(streamUrl);
    }
  });
  ffmpeg.on('error', (error) => {
    console.log('FFmpeg process error:', error);
  });
  ffmpeg.on('close', (code) => {
    console.log('FFmpeg process exited with code:', code);
    if (!isHttp) {
      const finalData = Buffer.concat(buffers);
      server.send(JSON.stringify({ event: 'video-stream', data: finalData }));
      server.send(JSON.stringify({ event: 'video-stream', data: 'end' }));

      buffers = [];
    }
  });

  // 终止FFmpeg进程及WebSocket连接
  if (!isHttp) {
    server.onclose = () => {
      if (!isHttp) {
        ffmpeg.kill();
      }
    };
  }
};

//
