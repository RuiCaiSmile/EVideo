//@ts-ignore
import _ from 'lodash';
//@ts-ignore
import { v4 as uuid } from 'uuid';
import { wbFormat } from './common';
import { wbSignal } from '../websocket/sginal';

type chatOffer = 'video' | 'audio' | 'all' | 'desktop';

interface userData {
  sendOffer: any;
  receiveOffer?: any;
  sendCandidate: any;
  receiveCandidate?: any;
  containerId: string;
  isSponsor?: boolean;
  needSTUN?: boolean;
  chatOffer?: chatOffer;
  targetToken: string;
  userToken: string;
}

interface wsmessage {
  event: string;
  data: any;
}

interface message {
  type: string;
  message?: string;
}

// TODO 补充userStatus
enum userStatus {
  'idle' = 'idle',
  'offerExchanging' = 'offerExchanging',
  'candidateExchanging' = 'candidateExchanging',
  'connected' = 'connected',
}
// TODO 考虑是否可以再抽取，同时web/node使用
// 非contorl工具使用方法包裹即可

class WebRTCControl {
  // 本地显示视频相关方法
  static localStream: MediaStream | null = null;
  static addLocalStream = async (config: any) => {
    let videoConfig: any = { facingMode: 'user' };
    const { type } = config;
    if (window.orientation === 180 || window.orientation === 0) {
      videoConfig.width = { min: 600 };
      videoConfig.height = { min: 800 };
    }
    if (window.orientation === 90 || window.orientation === -90) {
      videoConfig.width = { min: 800 };
      videoConfig.height = { min: 600 };
    }
    if (type === 'video') {
      WebRTCControl.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: videoConfig,
      });
    }
    if (type === 'audio') {
      WebRTCControl.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    }
    if (type === 'screen') {
      WebRTCControl.localStream =
        await navigator.mediaDevices.getDisplayMedia();
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioStream.getAudioTracks().forEach((track) => {
        WebRTCControl.localStream?.addTrack(track);
      });
    }
    let outBoundStream = new MediaStream();
    const localBox = document.querySelector('#localBox');
    let video: HTMLVideoElement | null = document.createElement('video');
    video.srcObject = outBoundStream;
    video.autoplay = true;
    video.muted = true;
    video.style.width = '100%';
    WebRTCControl.localStream?.getTracks().forEach((track) => {
      outBoundStream.addTrack(track);
    });
    video.setAttribute('playsinline', 'true');
    video.setAttribute('muted', 'true');
    video.setAttribute('autoplay', 'true');
    if (localBox) {
      localBox.append(video);
    }
  };

  static closeLocalStream = async () => {
    if (WebRTCControl.localStream) {
      WebRTCControl.localStream.getTracks()[0].stop();
      WebRTCControl.localStream.getTracks()?.[1]?.stop();
      WebRTCControl.localStream = null;
    }
  };

  constructor() {
    // @ts-ignore
    this.RTC = null;
  }

  RTC: RTCPeerConnection;

  trackSenderList: any[] = [];

  videoDom: HTMLVideoElement | null = null;

  userStatus: userStatus = userStatus.idle;

  userData: userData = {
    sendOffer: wbSignal['room-chat-offer'],
    sendCandidate: wbSignal['room-chat-candidate'],
    containerId: '',
    receiveOffer: '',
    receiveCandidate: '',
    isSponsor: false,
    needSTUN: true,
    chatOffer: 'all',
    targetToken: '',
    userToken: '',
  };

  pubMessage: any;
  subMessage: any;

  // 配置信息
  setUserData = (userData: userData) => {
    const limit =
      userData.hasOwnProperty('sendOffer') &&
      userData.hasOwnProperty('sendCandidate') &&
      userData.hasOwnProperty('receiveOffer') &&
      userData.hasOwnProperty('receiveCandidate') &&
      userData.hasOwnProperty('containerId');
    if (limit) {
      this.userData = { ...userData };
      this.subMessage({
        id: `${userData.targetToken}${userData.receiveOffer}`,
        handleFunction: this.getOffer,
        event: userData.receiveOffer,
      });
      this.subMessage({
        id: `${userData.targetToken}${userData.receiveCandidate}`,
        handleFunction: this.getCandidate,
        event: userData.receiveCandidate,
      });
    } else {
      throw 'missing params';
    }
  };

  // 开始连接
  startConnect = () => {
    this.createRTC();
  };

  // 初始化消息函数
  setConnect = (pubMsg: any, subMsg: any) => {
    this.pubMessage = pubMsg;
    this.subMessage = subMsg;
  };

  // 获取媒体流
  // getUserMedia必须要要在前面
  getMedia = (audio = false, video = { facingMode: 'user' }) => {
    return navigator.mediaDevices.getUserMedia({
      audio: audio,
      video: video,
    });
  };

  // 创建RTC
  createRTC = async () => {
    try {
      const PeerConnection = window.RTCPeerConnection || RTCPeerConnection;
      // 必须使用turn，不然穿透不了
      // 使用turn必须安装c插件
      this.RTC = new PeerConnection({
        iceServers: [
          {
            urls: ['turn:208.64.228.112:3478'],
            username: 'easyuse',
            credential: 'easyvideo',
          },
        ],
        iceTransportPolicy: 'all',
      });
      (WebRTCControl.localStream as MediaStream)
        .getTracks()
        .forEach((track) => {
          const sender = this.RTC.addTrack(
            track,
            WebRTCControl.localStream as MediaStream,
          );
          this.trackSenderList.push(sender);
        });
      this.RTC.ontrack = this.SetRTCTrack;
      this.RTCLifeCycleManage();
      this.RTCSendCandidate();
      if (this.userData.isSponsor) {
        await this.RTCSignaling();
      }
    } catch (e: any) {
      console.error(`${e?.message}`);
    }
    // this.RTC.addTransceiver('audio');
    // this.RTC.addTransceiver('video');
  };

  // 重新设置流
  reSetStream = async (audio = true, video = true) => {
    this.trackSenderList.forEach((item) => {
      this.RTC.removeTrack(item);
    });
    console.log('vide，audio', video, audio);
    if (audio && video) {
      (WebRTCControl.localStream as MediaStream)
        .getTracks()
        .forEach((track) => {
          const sender = this.RTC.addTrack(
            track,
            WebRTCControl.localStream as MediaStream,
          );
          this.trackSenderList.push(sender);
        });
    }
    if (!audio) {
      (WebRTCControl.localStream as MediaStream)
        .getVideoTracks()
        .forEach((track) => {
          const sender = this.RTC.addTrack(
            track,
            WebRTCControl.localStream as MediaStream,
          );
          this.trackSenderList.push(sender);
        });
    }
    if (!video) {
      (WebRTCControl.localStream as MediaStream)
        .getAudioTracks()
        .forEach((track) => {
          const sender = this.RTC.addTrack(
            track,
            WebRTCControl.localStream as MediaStream,
          );
          this.trackSenderList.push(sender);
        });
    }
    this.reStartRTC();
  };

  // 重新协商
  reStartRTC = () => {
    this.RTC.ontrack = this.SetRTCTrack;
    const offerOptions = {
      iceRestart: true,
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };
    this.RTCSignaling(offerOptions);
  };

  // 监听收到offer操作
  //  发送local
  getOffer = async (data: wsmessage) => {
    const eventData = data.data;
    if (this.RTC && eventData.offer) {
      try {
        await this.RTC.setRemoteDescription(eventData.offer);
        if (!this.userData.isSponsor) {
          const answer = await this.RTC.createAnswer();
          await this.RTC.setLocalDescription(answer);
          this.RTCSendOffer(answer);
        }
      } catch (e) {
        console.log('设置RemoteDescription失败', e);
      }
    }
  };

  // 监听收到candidate操作
  getCandidate = (data: wsmessage) => {
    const eventData = data.data;
    if (this.RTC && this.RTC?.remoteDescription && eventData.candidate) {
      const candidate = new RTCIceCandidate(eventData.candidate);
      this.RTC.addIceCandidate(candidate)
        .then(() => {
          // TODO status
        })
        .catch((res) => {
          console.log('设置RemoteCandidate失败', res);
        });
    }
  };

  // 信令交互
  RTCSignaling = async (options?: any) => {
    try {
      //  TODO 临时
      const offerOptions = options
        ? options
        : {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          };
      const offer = await this.RTC.createOffer(offerOptions);
      await this.RTC.setLocalDescription(offer);
      this.RTCSendOffer(offer);
    } catch (error) {
      console.log('err', error);
    }
  };

  // 发送candidate
  RTCSendCandidate = () => {
    this.RTC.onicecandidate = async (event) => {
      // const sleep = (delaytime = 1000) => {
      //   return new Promise(resolve => setTimeout(resolve, delaytime))
      // }
      // await sleep(1000)
      // if (
      //   event?.candidate?.candidate &&
      //   this.RTC?.remoteDescription?.type &&
      //   this.RTC?.localDescription?.type
      // ) {
      //   const message = {
      //     event: this.userData.sendCandidate,
      //     token: uuid(),
      //     data: {
      //       candidate: event.candidate,
      //       targetToken: this.userData.targetToken,
      //       token: this.userData.userToken,
      //     },
      //   };
      //   this.pubMessage(message);
      // }
      // console.log('1s',)
      // TODO 可以将本地的ip变成local的模式
      // TODO 验证是否还是要用setInterval
      // 应该可以在收到/发出 offer信令时判断是否发出，可以不使用intertval
      const candidateInterval = setInterval(() => {
        //TODO FireFox会创建空candidate,可以找找为什么出现
        if (
          event?.candidate?.candidate &&
          this.RTC?.remoteDescription?.type &&
          this.RTC?.localDescription?.type
        ) {
          const str = event.candidate?.candidate as string;
          //  拦截局域网ip，验证用
          // const notLocal = str.indexOf('192.') === -1 || str.indexOf('192.') > 35
          const message = {
            event: this.userData.sendCandidate,
            token: uuid(),
            data: {
              candidate: event.candidate,
              targetToken: this.userData.targetToken,
              token: this.userData.userToken,
            },
          };
          this.pubMessage(message);
          clearInterval(candidateInterval);

          console.log('仍再循环');
        } else {
          clearInterval(candidateInterval);
        }
      }, 1000);
    };
  };

  // 发送offer
  RTCSendOffer = (offer: RTCSessionDescriptionInit) => {
    const message = {
      event: this.userData.sendOffer,
      data: {
        offer,
        targetToken: this.userData.targetToken,
        token: this.userData.userToken,
      },
    };
    this.pubMessage(message);
  };

  // 生命周期监听
  RTCLifeCycleManage = () => {
    this.RTC.onnegotiationneeded = () => {
      const message = {
        type: 'onnegotiationneeded',
        message: 'onnegotiationneeded',
      };
      this.onInfo(message);
    };
    this.RTC.onconnectionstatechange = (event) => {
      const message = {
        type: 'onconnectionstatechange',
        message: '',
      };
      switch (this.RTC.connectionState) {
        case 'new':
        case 'connecting':
        case 'connected':
          message.message = `connectionState变更为${this.RTC.connectionState}`;
          this.onInfo(message);
          console.log('event', event);
          break;
        case 'disconnected':
        case 'closed':
          message.message = `connectionState变更为${this.RTC.connectionState}`;
          this.onError(message);
          console.log('event', event);
          break;
        case 'failed':
          message.message = `connectionState变更为${this.RTC.connectionState}`;
          this.onError(message);
          console.log('event', event);
          break;
        default:
      }
    };
    this.RTC.oniceconnectionstatechange = (event) => {
      const message = {
        type: 'oniceconnectionstatechange',
        message: '',
      };
      // TODO 确认是否是此处的disconnect
      switch (this.RTC.iceConnectionState) {
        case 'connected':
        case 'completed':
        case 'disconnected':
          message.message = `connectionState变更为${this.RTC.iceConnectionState}`;
          this.onInfo(message);
          console.log('oniceconnectionstatechange', 'event', event);
          break;
        case 'closed':
        case 'failed':
          message.message = `connectionState变更为${this.RTC.iceConnectionState}`;
          this.onError(message);
          console.log('oniceconnectionstatechange', 'event', event);
          break;
        default:
      }
    };
    this.RTC.onsignalingstatechange = () => {
      const message = {
        type: 'onsignalingstatechange',
        message: '',
      };
      // TODO 补充其他阶段
      switch (this.RTC.signalingState) {
        case 'closed':
          message.message = `signalingState变更${this.RTC.signalingState}`;
          this.onError(message);
          break;
        default:
      }
    };
  };

  // 设置track
  SetRTCTrack = (event: RTCTrackEvent) => {
    const domId = this.userData.containerId;
    const id = `${this.userData.containerId}video`;
    let videoBox: HTMLElement | null = document.querySelector(`#${domId}`);
    let videoQuery = document.querySelector(`#${id}`);
    if (videoBox && !videoQuery) {
      let video: HTMLVideoElement | null = document.createElement('video');
      video.autoplay = true;
      if (event.streams && event.streams[0]) {
        console.log('这是1');
        console.log('event', event);
        video.srcObject = event.streams[0];
      } else {
        console.log('这是2');
        console.log('event', event);
        let inboundStream = new MediaStream();
        inboundStream.addTrack(event.track);
        video.srcObject = inboundStream;
      }
      video.onclick = () => {
        console.log(this.RTC);
      };
      video.id = id;
      video.style.width = '100%';
      video.controls = true;
      video.disablePictureInPicture = true;

      video.setAttribute('playsinline', 'true');
      video.setAttribute('controlsList', 'nodownload');
      if (videoBox) {
        videoBox.append(video);
      } else {
        console.log('没有videoBox');
      }
      this.videoDom = video;
      video = null;
    }
    if (videoBox && videoQuery) {
      if (event.streams && event.streams[0]) {
        console.log('这是1');
        console.log('event', event);
        (videoQuery as HTMLVideoElement).srcObject = event.streams[0];
      } else {
        console.log('这是2');
        let inboundStream = new MediaStream();
        inboundStream.addTrack(event.track);
        console.log('event', event);
        (videoQuery as HTMLVideoElement).srcObject = inboundStream;
      }
    }
    videoQuery = null;
    videoBox = null;
  };

  // 静音
  setMute = (mute: boolean) => {
    if (this.videoDom) {
      console.log('mute', mute);
      this.videoDom.muted = mute;
    }
  };

  // 报错
  onError = (message: message) => {
    console.log(message);
  };

  // 消息
  onInfo = (message: message) => {
    console.log(message);
  };

  // 销毁
  destroy = () => {
    if (this.userData.containerId) {
      const videoId = `${this.userData.containerId}video`;
      const videoDom = document.getElementById(`${videoId}`);
      if (videoDom) {
        videoDom.remove();
      }
    }
    // RTC销毁
    if (this.RTC) {
      this.RTC.ontrack = null;
      this.RTC.onicecandidate = null;
      this.RTC.oniceconnectionstatechange = null;
      this.RTC.onconnectionstatechange = null;
      this.RTC.onsignalingstatechange = null;
      this.RTC.onicegatheringstatechange = null;
      this.RTC.onnegotiationneeded = null;
      this.RTC.close();
      //@ts-ignore
      this.RTC = null;
    }
    this.videoDom = null;
    this.userData = {
      sendOffer: wbSignal['room-chat-offer'],
      sendCandidate: wbSignal['room-chat-candidate'],
      containerId: '',
      receiveOffer: '',
      receiveCandidate: '',
      isSponsor: false,
      needSTUN: true,
      chatOffer: 'all',
      targetToken: '',
      userToken: '',
    };
    //  TODO 销毁订阅的资源
  };
}

export default WebRTCControl;
