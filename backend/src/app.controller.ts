import { Controller, Get, Res, Headers, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { join } from 'path';
import * as fs from 'fs';
import { pushVideoStream } from './media/video';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cats')
  getCats(): string {
    return this.appService.getCats();
  }

  @Get('getVideo')
  async getVideo(@Headers() headers, @Res() res) {
    const videoPath = join(__dirname, '../public/outputbase.mp4');
    // 非fMP4不支持range播放？
    // const videoPath = join(__dirname, '../public/test1.mp4');
    const videoSize = fs.statSync(videoPath).size;
    console.log('videoSize', videoSize);
    console.log('headers', headers);
    console.log('headers', headers.range);
    const range = headers.range || headers.Range;
    // debain 直接获取range失败
    if (range) {
      const arr = range.replace('bytes=', '').split('-');
      const start = Number(arr[0]);
      const end = Number(arr[1]);
      console.log('start,end', range, arr, start, end);
      const contentLength = end - start + 1;
      const headers = {
        'Content-Range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, headers);
      const videoStream = fs.createReadStream(videoPath, { start, end });
      videoStream.pipe(res);
    } else {
      console.log('videoSize', videoSize);
      const head = {
        'Content-Length': videoSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      const stream = fs.createReadStream(videoPath);
      stream.pipe(res);
    }
  }

  // live 直播
  @Get('setLiveOpen')
  setLiveOpen() {
    return this.appService.setLiveOpen();
  }
}
