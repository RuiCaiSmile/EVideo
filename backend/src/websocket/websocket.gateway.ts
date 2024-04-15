import { Server } from 'ws';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import {
  joinRoom,
  getUserList,
  leaveRoom,
  releasedDisconnected,
  broadcastInOrOut,
  broadcastRoom,
  setClients,
  updateJSON,
  wbSignal,
  exchangeSignal,
  getVideo,
} from './login.info';
import { msgRep } from '../common/common.utils';

@WebSocketGateway(9002)
export class SignalGateway implements OnGatewayDisconnect, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // 链接成功
  handleConnection() {
    console.log('进入连接');
  }

  // 链接断开
  handleDisconnect() {
    // 断开时是拿不到clients的
    console.log('断开连接');
    releasedDisconnected();
  }

  // 登录
  //  这里的clients是同一个，存入的token是同一个,是对象引用的问题
  @SubscribeMessage(wbSignal.login)
  async handleLoginEvent(
    @MessageBody() data: loginParams,
    @ConnectedSocket() client,
  ) {
    // token: string;
    // roomToken: string;
    // name: string;
    // client: WebSocket;

    if (data?.name && data?.token) {
      const res = joinRoom(data);
      if (res === true) {
        const userClient = {
          token: data.userToken,
          roomToken: data.token,
          name: data.name,
          client: client,
        };
        setClients(userClient);

        const joinData: room = {
          token: data.token,
          limit: 0,
          user: [
            {
              token: data.userToken,
              name: data.name,
              type: 'audio',
            },
          ],
        };
        updateJSON();
        broadcastInOrOut(joinData, true);
        const list = getUserList(userClient);
        const resParams = {
          list,
          message: 'login success',
        };
        return msgRep(wbSignal['login-rsp'], resParams, true);
      }
      return msgRep(wbSignal['login-rsp'], res, false);
    } else {
      return msgRep(wbSignal['login-rsp'], '参数错误', false);
    }
  }

  // 新加入聊天
  @SubscribeMessage(wbSignal['new-connection'])
  async handleChatReqEvent(
    @MessageBody() data: { target: string },
    @ConnectedSocket() client,
  ) {}

  // candidate交互
  @SubscribeMessage(wbSignal['room-chat-candidate'])
  async handleCandidateEvent(
    @MessageBody() data: any,
    @ConnectedSocket() client,
  ) {
    if (data) {
      exchangeSignal(data, wbSignal['room-chat-candidate']);
    }
  }

  // offer交互
  @SubscribeMessage(wbSignal['room-chat-offer'])
  async handleOfferEvent(@MessageBody() data: any, @ConnectedSocket() client) {
    if (data) {
      exchangeSignal(data, wbSignal['room-chat-offer']);
    }
  }

  // offer交互
  @SubscribeMessage(wbSignal['room-chat-restart'])
  async handleRestart(@MessageBody() data: any, @ConnectedSocket() client) {
    if (data) {
      exchangeSignal(data, wbSignal['room-chat-restart']);
    }
  }

  // 请求websocket视频流
  @SubscribeMessage('video-stream')
  async handleGetVideo(@MessageBody() data: any, @ConnectedSocket() client) {
    getVideo(client);
  }
}
