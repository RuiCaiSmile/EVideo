import {
  getSameKeyIndex,
  getSameKeyValue,
  makeToken,
  removeSameKey,
  removeSameKeyArray,
  setNewArray,
} from '../common/common.utils';
import { pushVideoStream } from '../media/video';
// 直接import os / fs 会失败,谁require或者 *
import * as os from 'os';
import * as fs from 'fs';
import { join } from 'path';

const _ = require('lodash');
const { resolve } = require('path');

export enum wbSignal {
  //  登录，发送房间token
  'login' = 'login',
  //  登录回复
  'login-rsp' = 'login-rsp',
  // 房间新加入
  'new-connection' = 'new-connection',
  // 房间退出
  'new-disconnection' = 'new-disconnection',
  // 聊天offer
  'room-chat-offer' = 'room-chat-offer',
  // 聊天candidate
  'room-chat-candidate' = 'room-chat-candidate',
  // RTC失败通知
  'room-chat-RTC-error' = 'room-chat-RTC-error',
  // 重新协商连接
  'room-chat-restart' = 'room-chat-restart',
  // 退出
  'end-connection' = 'end-connection',
  // 强制退出
  'force-end-connection' = 'force-end-connection',
  // 更换token
  'change-room-token' = 'change-room-token',
}

// room.user的第一位用户即为“管理员”

// 房间列表
const RoomList: room[] = [];
// 服务列表
const clients: client[] = [];

//  加入房间
export const joinRoom = (loginParams: loginParams) => {
  let hasRoom = false;
  let isEnter = false;
  const user = {
    token: loginParams.userToken,
    name: loginParams.name,
    type: loginParams.type,
  };

  RoomList.forEach((item: room) => {
    if (item.token === loginParams.token) {
      hasRoom = true;
      if (item.limit > item.user.length) {
        item.user.push(user);
        isEnter = true;
      }
    }
  });
  if (!hasRoom) {
    const room = {
      token: loginParams.token,
      user: [user],
      limit: loginParams.limit,
      name: loginParams.name,
    };
    RoomList.push(room);
    isEnter = true;
  }

  // console.log('RoomList', RoomList)
  if (isEnter) return true;
  return '房间人员已满，请联系房间创建者';
};

// 获取房间用户的tokenList，作为订阅收到offer的ID
export const getUserList = ({ token, roomToken }) => {
  let list = [];
  RoomList.forEach((item: room) => {
    if (item.token === roomToken) {
      list = removeSameKey(item.user, { token }, 'token');
    }
  });
  return list;
};

// 离开房间
export const leaveRoom = (room: room) => {
  const index = getSameKeyIndex(RoomList, room, 'token');
  console.log('key', index);
  if ((index || index === 0) && RoomList[index]?.user) {
    const list = removeSameKey(RoomList[index].user, room.user?.[0], 'token');
    if (list.length > 0) {
      RoomList[index].user = list;
    } else {
      RoomList.splice(index, 1);
    }

    const wsIndex = getSameKeyIndex(clients, room.user?.[0], 'token');
    clients.splice(wsIndex, 1);
    updateJSON();
    broadcastInOrOut(room, false);
  }
};

// 广播用户进入、离开房间
export const broadcastInOrOut = (room: room, isEnter?: boolean) => {
  const sendData = {
    event: isEnter ? wbSignal['new-connection'] : wbSignal['new-disconnection'],
    data: {
      ...room,
    },
  };
  clients.forEach((client) => {
    if (
      client.token !== room.user[0].token &&
      client.roomToken === room.token
    ) {
      console.log('广播');
      client.client.send(JSON.stringify(sendData));
    }
  });
};

// 房间内广播
// 如果有user，则不对user发送
export const broadcastRoom = (room: room, sendData: any) => {
  clients.forEach((client) => {
    if (
      client.token !== room.user[0].token &&
      client.roomToken === room.token
    ) {
      client.client.send(JSON.stringify(sendData));
    }
  });
};

// 设置服务器
export const setClients = (client: client) => {
  clients.push(client);
};

// 重新保存服务器
export const updateClients = (token, client) => {
  const index = getSameKeyIndex(clients, { token }, 'token');
  if (index !== -1) {
    clients[index].client = client;
  }
};

// 获取服务器（用户token）
export const getClient = (token: string) => {
  return getSameKeyIndex(clients, { token }, 'token');
};

// 释放资源
export const releasedDisconnected = () => {
  clients.forEach((client) => {
    if (client?.client?.readyState === 3 || client?.client?.readyState === 2) {
      const leaveData: room = {
        token: client.roomToken,
        limit: 0,
        user: [
          {
            token: client.token,
            name: client.name,
            type: 'audio',
          },
        ],
      };
      leaveRoom(leaveData);
    }
  });
};

// 修改房间token
export const changeRoomToken = (room: room) => {
  const index = getSameKeyIndex(RoomList, room, 'token');
  if (room.user[0].token !== RoomList[index].user[0].token) return '没有权限';
  const oldToken = RoomList[index].token;
  const newToken = makeToken();
  RoomList[index].token = newToken;
  clients.forEach((clients) => {
    if (clients.roomToken === oldToken) {
      clients.roomToken = newToken;
    }
  });
  const data = {
    event: wbSignal['change-room-token'],
    data: {
      newToken,
    },
  };
  broadcastRoom(RoomList[index], data);
};

// 判断环境，写入文件，本地使用
const isWindows = () => {
  console.log('os.platform()', os.platform());
  return /windows|win32/i.test(os.platform());
};

export const updateJSON = () => {
  // if (RoomList.length > 0 && clients.length > 0) {
  //   if (isWindows()) {
  //     fs.writeFileSync(
  //       `D:/code/EVideo/backend/data.json`,
  //       JSON.stringify({ RoomList, clients }, null, '\t'),
  //     );
  //   } else {
  //     fs.writeFileSync(
  //       `/Users/cairui/Coding/EVideo/backend/data.json`,
  //       JSON.stringify({ RoomList, clients }, null, '\t'),
  //     );
  //   }
  // }
};

enum signStatus {
  'offer',
  'candidate',
  'success',
  'idle',
}

enum webRTCSignal {
  candidate = 'candidate',
  offer = 'offer',
}

export interface signal {
  token: string;
  type: string;
  status: signStatus;
}

// 直接使用Token是不安全的做法，不过目前不必优化
interface signalExchanedParams {
  token: string;
  userToken: string;
  targetToken: string;
  roomToken: string;
  type: string;
  data: any;
}

// 信令交换处理
export const exchangeSignal = (params: signalExchanedParams, event) => {
  const index = getClient(params.targetToken);
  if (index || index === 0) {
    const newParams = {
      event,
      id: params.token,
      data: {
        ...params,
        token: params.token,
      },
    };
    clients[index].client.send(JSON.stringify(newParams));
    return true;
  }
  // 对方已离开
  return false;
};

//直接请求视频流
export const getVideo = (server) => {
  const videoPath = join(__dirname, '../../public/video-fragmented.mp4');
  console.log('videoPath', videoPath);
  pushVideoStream({ videoPath, server });
  // const stream = fs.createReadStream(videoPath);
  // const data = [];
  // stream.on('data', function (chunk) {
  //   data.push(chunk);
  // });
  // stream.on('end', function (chunk) {
  //   const finalData = Buffer.concat(data);
  //   // const uint8Array = new Uint8Array(finalData);
  //   // const textDecoder = new TextDecoder();
  //   // const decodedString = textDecoder.decode(uint8Array);
  //   server.send(JSON.stringify({ event: 'video-stream', data: finalData }));
  //   // server.send(finalData);
  // });
  // console.log('path', videoPath);
};
