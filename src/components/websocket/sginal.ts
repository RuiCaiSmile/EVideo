export enum wbSignal {
  //  登录，发送房间token
  'login' = 'login',
  //  登录回复
  'login-rsp' = 'login-rsp',
  // 房间新加入
  'new-connection' = 'new-connection',
  // 房间退出
  'new-disconnection' = 'new-disconnection',
  // 已准备
  'ready-to-chat' = 'ready-to-chat',
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
