import React, { useEffect, useState, FC, useRef } from 'react';
import WebRTCControl from '@/components/webRTC/webRTCControl';
import { createWebsocket } from '@/components/websocket';
import UserWindow from './components/UserWindow';
import { wbSignal } from '@/components/websocket/sginal';
import { v4 as uuid } from 'uuid';
import { getLocalItem } from '@/utils';
import _ from 'lodash';
import useUrlParams from '@/components/hooks/useUrlParams';
import { message } from 'antd';
import { useHistory } from 'umi';
import classNames from 'classnames';
import './index.less';
import { useTitle } from 'ahooks';

const Chat: FC<any> = (props) => {
  const wbRef = useRef<{ wb: any }>({ wb: {} });
  const chattingWindow = useRef<any[]>([]);
  const chattingRTC = useRef<any>({});
  const [localSetting, setLocalSetting] = useState<any>({});
  const [refresh, setRefresh] = useState('abc');
  const { token: localToken, live } = useUrlParams(['token', 'live']);
  const history = useHistory();
  const mediaSource = useRef<any>();
  useTitle('Chat');

  useEffect(() => {
    console.log('props', props);
    window.addEventListener('beforeunload', listener);

    const loginData = getLocalItem(localToken);
    console.log('live', live);
    if (live) {
      mediaSource.current = new MediaSource();
      const dom: HTMLVideoElement | null = document.querySelector('#localBox');
      let video: HTMLVideoElement | null = document.createElement('video');
      console.log('hasVideo', video);
      if (video) {
        video.src = URL.createObjectURL(mediaSource.current);
        if (dom) {
          dom.append(video);
        }
        mediaSource.current.addEventListener('sourceopen', sourceOpen);
      }
    } else {
      WebRTCControl.addLocalStream({ type: loginData.type }).then(() => {
        setLocalSetting({ isMicOpen: true });
        const wb = createWebsocket();
        const isLocal = window.location.host.indexOf('localhost') > -1;
        if (isLocal) {
          wb.connect({ url: 'ws://localhost:9002' });
        } else {
          wb.connect({ url: 'wss://chat.deepline.cc/api/webrtc/websocket' });
        }
        // wb.connect({ url: 'wss://chat.deepline.cc/api/webrtc/websocket' });
        wbRef.current.wb = wb;
        wb.websocket.onopen = () => {
          login();
        };
      });
    }

    return () => {
      window.removeEventListener('beforeunload', listener);
      WebRTCControl.closeLocalStream();
    };
  }, []);

  const sourceOpen = (_) => {
    console.log('_', _, this);
    const wb = createWebsocket();
    const isLocal = window.location.host.indexOf('localhost') > -1;
    const sourceBuffer = mediaSource.current.addSourceBuffer(
      'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
    );
    // sourceBuffer.addEventListener('updateend', function () {
    //   mediaSource.current.endOfStream();

    //   console.log('updateend');
    // });

    if (isLocal) {
      wb.connect({ url: 'ws://localhost:9002' });
    } else {
      wb.connect({ url: 'wss://chat.deepline.cc/api/webrtc/websocket' });
    }
    // wb.connect({ url: 'wss://chat.deepline.cc/api/webrtc/websocket' });
    wbRef.current.wb = wb;
    wb.websocket.onopen = () => {
      wb.subMessage({
        event: 'video-stream',
        id: uuid(),
        handleFunction: getVideoListener,
      });
      wb.websocket.send(
        JSON.stringify({
          event: 'video-stream',
          id: uuid(),
          data: {},
        }),
      );
    };
  };

  const getVideoListener = (data: any) => {
    // console.log('getVideoListener', data);
    const video = data.data; // 接收到的二进制数据
    console.log('video', typeof video, video);
    const sourceBuffer = mediaSource.current.addSourceBuffer(
      'video/mp4;codecs="avc1.640028"',
    );
    sourceBuffer.addEventListener('updateend', function () {
      mediaSource.current.endOfStream();
      sourceBuffer.appendBuffer(video);
      console.log('updateend');
    });
  };

  const listener = () => {
    wbRef.current.wb.websocket.close();
  };

  //  登录
  const login = () => {
    const loginData = getLocalItem(localToken);
    // 监听登录回复
    const getLoginRsp = {
      event: wbSignal['login-rsp'],
      id: uuid(),
      handleFunction: (res: any) => {
        if (res.code === 200) {
          if (res.data?.list) {
            initReceiveOffer(res.data?.list);
          }
          newConnection();
        }
        // 监听关闭与退出
        hasDisconnection();
      },
    };
    wbRef.current.wb.subMessage(getLoginRsp);
    wbRef.current.wb.pubMessage({
      event: wbSignal.login,
      data: {
        mid: uuid(),
        ...loginData,
      },
    });
  };

  // 等待建立聊天
  const initReceiveOffer = (list: any[]) => {
    const chatList: any = [];
    list?.forEach((item) => {
      startChat(item?.token, false);
      chatList.push({
        containerId: `A${item.token}`,
        info: { ...item, isMute: false },
      });
    });
    chattingWindow.current = _.uniqBy(chatList, 'containerId');
    setRefresh(uuid());
  };

  // 房间增加成员
  const newConnection = () => {
    const getNewConnection = {
      event: wbSignal['new-connection'],
      id: uuid(),
      handleFunction: (res: any) => {
        // 并不安全，但是可以使用
        // 最好再加一个ready to chat信令
        // 问题在服务器同时返回信令，最新的客户端在建立好对象之前，新的信令就到了
        setTimeout(() => {
          const chatList = chattingWindow.current;
          chatList.push({
            containerId: `A${res?.data?.user[0].token}`,
            info: {
              ...res?.data?.user[0],
              isMute: false,
            },
          });
          chattingWindow.current = _.uniqBy(chatList, 'containerId');
          startChat(res?.data?.user[0].token);
          message.info(`${res?.data?.user[0].name}加入聊天`);
        }, 1000);
      },
    };
    // initWebRTC
    wbRef.current.wb.subMessage(getNewConnection);
  };

  // 主动建立聊天
  const startChat = (targetToken: string, isSponsor = true) => {
    const pubMsg = (data: any) => {
      wbRef.current.wb.pubMessage(data);
    };

    const subMsg = (data: any) => {
      wbRef.current.wb.subMessage(data);
    };

    const myVideo = class Super extends WebRTCControl {
      constructor() {
        super();
      }
    };
    const easyVideo = new myVideo();
    chattingRTC.current[`A${targetToken}`] = easyVideo;
    const loginData = getLocalItem(localToken);
    const userData = {
      sendOffer: wbSignal['room-chat-offer'],
      sendCandidate: wbSignal['room-chat-candidate'],
      receiveOffer: wbSignal['room-chat-offer'],
      receiveCandidate: wbSignal['room-chat-candidate'],
      containerId: `A${targetToken}`,
      targetToken,
      isSponsor,
      userToken: loginData.userToken,
    };
    easyVideo.setConnect(pubMsg, subMsg);
    easyVideo.setUserData(userData);
    easyVideo.startConnect();
    setRefresh(uuid());
  };

  // 房间退出成员
  const hasDisconnection = () => {
    const getDisconnection = {
      event: wbSignal['new-disconnection'],
      id: uuid(),
      handleFunction: (res: any) => {
        if (res?.data?.user?.length > 0) {
          const disID = `A${res?.data?.user[0].token}`;
          message.warning(`${res?.data?.user[0].name}退出聊天`);
          if (chattingRTC.current?.[disID]) {
            chattingRTC.current?.[disID].destroy();
            delete chattingRTC.current?.[disID];
          }
          chattingWindow.current = removeSameKey(
            chattingWindow.current,
            {
              containerId: disID,
            },
            'containerId',
          ) as any[];
        }
        setRefresh(uuid());
      },
    };
    wbRef.current.wb.subMessage(getDisconnection);
  };

  const onMicChanged = (id: string, micOpen: boolean) => {
    console.log('onMicChanged', id, micOpen);
    if (id === 'localBox') {
      // 调整自己的麦克风
      for (const key in chattingRTC.current) {
        chattingRTC.current[key].reSetStream(micOpen, true);
      }
      setLocalSetting({ isMicOpen: micOpen });
    }
  };

  // 音量调整
  const onMuted = (id: string, mute: boolean) => {
    if (id !== 'localBox') {
      chattingRTC.current[id]?.setMute(mute);
      chattingWindow.current?.forEach((item) => {
        if (item.containerId === id) {
          item.info.isMute = mute;
        }
      });
      setRefresh(uuid());
    }
  };

  // 挂断
  const onHangUp = (id: string) => {
    for (const key in chattingRTC.current) {
      chattingRTC.current[key].destroy();
    }
    listener();
    history.go(-1);
  };

  const layoutClass = classNames({
    'video-layout': true,
    'video-layout-large': chattingWindow.current.length < 4,
    'video-layout-small': chattingWindow.current.length > 10,
    'video-layout-normal':
      chattingWindow.current.length > 3 && chattingWindow.current.length < 11,
  });
  return (
    <div className="chat-container">
      <div className={layoutClass}>
        <UserWindow
          isSelf={true}
          type="video"
          info={{
            name: '本地',
            isMicOpen: localSetting?.isMicOpen,
            isMute: false,
          }}
          containerId="localBox"
          onMicChanged={onMicChanged}
          onHangUp={onHangUp}
          onMuted={onMuted}
        ></UserWindow>
        {chattingWindow.current.map((item: any) => {
          return (
            <UserWindow
              {...item}
              key={item.containerId}
              onMuted={onMuted}
              onMicChanged={onMicChanged}
            ></UserWindow>
          );
        })}
      </div>
    </div>
  );
};
export default Chat;

export const removeSameKey = (array: any[], value: any, key: string) => {
  if (!value[key]) {
    throw 'value格式不对';
  }
  const cloneArray = _.cloneDeep(array);
  const data = _.remove(cloneArray, (item) => {
    return item[key] === value[key];
  });
  return cloneArray;
};
