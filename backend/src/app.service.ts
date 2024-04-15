import { Injectable, Res } from '@nestjs/common';
import { join } from 'path';
import { pushVideoStream } from './media/video';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getCats(): string {
    return 'This is a Chinese pastoral cat.';
  }

  setLiveOpen() {
    const videoPath = join(__dirname, '../public/outputbase.mp4');
    pushVideoStream({ videoPath, isHttp: true });
    console.log('setLiveOpen');
    return 'start live';
  }
}
