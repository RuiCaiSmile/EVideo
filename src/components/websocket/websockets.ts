import _ from 'lodash';
import { writeLogs } from '../logsTool';

interface config {
  url: string;
  userName?: string;
  password?: string;
}

type fun = any;

interface subMessageParams {
  event: string;
  handleFunction?: fun;
  id: string;
  context?: string;
  extend?: any;
}

interface socketFunction {
  onmessage?: fun;
  onerror?: fun;
  onopen?: fun;
  onclose?: fun;
  send?: fun;
  close?: fun;
}

const key = ['data.offer.sdp', 'data.candidate.candidate'];

let video: any = null;
const getVideo = () => {
  return video;
};

class EasyWebsocket {
  websocket: WebSocket | socketFunction = {};

  websocketServer = '';

  keepAliveSymbol = false;

  keepAliveTime = 18000;

  answerTime = 0;

  messageSubPool: subMessageParams[] = [];

  // 连接
  connect = (config: config) => {
    this.websocketServer = config.url;
    this.create()
      .then(() => {
        this.setWebsocketOnError();
        // return this.login(config)
      })
      .catch((err) => {
        throw err;
      });
  };
  // 创建
  create = () => {
    try {
      this.websocket = new WebSocket(this.websocketServer);
      const result = new Promise((resolve, reject) => {
        if (this.websocket) {
          this.websocket.onopen = () => {
            resolve(true);
          };
          this.websocket.onerror = () => {
            reject(false);
          };
        }
      });
      return result;
    } catch (e) {
      console.error(`${e.message}`);
      return Promise.reject(false);
    }
  };
  // 登录
  login = (config: config) => {
    return new Promise((resolve, reject) => {
      if (this.websocket && config) {
        const subParams = {
          event: 'loginRsp',
          id: `${config.userName}login${new Date().getTime()}`,
          handleFunction: this.getLoginRsp,
        };
        this.subMessage(subParams);
        this.pubMessage({
          userName: config.userName,
          password: config.password,
        });
      }
    });
  };

  // 登录回调
  getLoginRsp = (data: any) => {
    if (data.code === 200) {
    }
  };

  // 保活
  keepAlive = () => {};

  // 订阅消息
  subMessage = (params: subMessageParams) => {
    if (params.event && params.handleFunction) {
      this.messageSubPool.push(params);
      this.messageSubPool = _.uniqBy(this.messageSubPool, 'id');
      this.setWebsocketOnMessage();
    }
  };

  // 取消订阅
  unSubMessage = (params: string[]): void => {
    if (params) {
      params.forEach((item) => {
        const removeBySubID = (value: subMessageParams) => value.id === item;
        _.remove(this.messageSubPool, removeBySubID);
      });
      this.setWebsocketOnMessage();
    }
  };

  // 发送消息
  pubMessage = (params: any) => {
    if (this.websocket?.send) {
      writeLogs(JSON.stringify(params), 'client', key);
      this.websocket.send(JSON.stringify(params));
    }
  };

  // 设置onmessage
  setWebsocketOnMessage = () => {
    // console.log('item',item)
    this.websocket.onmessage = (data: any) => {
      if (data?.data && typeof data.data !== 'string') {
        console.log('typeof data.data', typeof data.data);
        video = data.data;
        // console.log(localStorage.getItem('video'));
      }

      if (data?.data && typeof data.data === 'string') {
        const res = JSON.parse(data.data);
        writeLogs(data?.data, 'server', key);
        this.messageSubPool.forEach((item) => {
          let isSameType;
          // id的优先级最高，其次是event
          if (res?.id) {
            isSameType = `${res.id}${res.event}` === item.id;
          } else {
            isSameType = res.event === item.event;
          }
          const result = {
            ...res,
            extend: item.extend || null,
          };
          if (isSameType && !item.context && item.handleFunction) {
            item.handleFunction(result);
          }
          if (
            isSameType &&
            item.context &&
            item.context === res.context &&
            item.handleFunction
          ) {
            item.handleFunction(result);
          }
        });
      }
    };
  };
  // setWebsocketOnMessage = () => {
  //   this.websocket.onmessage = (data: any) => {
  //     if (data?.data) {
  //       const res = JSON.parse(data.data);
  //       this.messageSubPool.forEach((item) => {
  //         const isSameType = res.event === item.event;
  //         const result = {
  //           ...res,
  //           extend: item.extend || null,
  //         };
  //         if (isSameType && !item.context && item.handleFunction) {
  //           item.handleFunction(result);
  //         }
  //         if (
  //           isSameType &&
  //           item.context &&
  //           item.context === res.context &&
  //           item.handleFunction
  //         ) {
  //           item.handleFunction(result);
  //         }
  //       });
  //     }
  //   };
  // };

  setWebsocketOnError = () => {
    if (this.websocket) {
      this.websocket.onerror = (data: any) => {
        throw data;
      };
      this.websocket.onclose = (data: any) => {
        throw data;
      };
    }
  };
}

export default EasyWebsocket;
export { getVideo };
