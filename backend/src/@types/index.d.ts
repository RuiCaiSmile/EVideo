type chatType = 'video' | 'audio' | 'screen';

interface user {
  name: string;
  // 用户token
  token: string;
  type: chatType;
}

interface loginParams {
  name: string;
  limit: number;
  type: chatType;
  token: string;
  chat: boolean;
  userToken: string;
}

interface room {
  token: string;
  user: user[];
  limit?: number;
  name?: string;
}

interface client {
  token: string;
  roomToken: string;
  name: string;
  client: WebSocket;
}
