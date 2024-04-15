---
order: 2
---

# webRTC Control

供 EasyVideo 使用的，封装了 webRTC 的基础功能

## 属性

data 属性，挂载在对象内的 userData 下

| 方法             | 含义                     | 参数   | 备注 |
| ---------------- | ------------------------ | ------ | ---- |
| sendOffer        | 发送 offer 信令          | string |      |
| receiveOffer     | 接受 offer 信令          | string |      |
| sendCandidate    | 发送 candidate 信令      | string |      |
| receiveCandidate | 接受 candidate 信令      | string |      |
| containerId      | track 挂载的 DOM 容器 ID | string |      |

## 方法

| 方法         | 含义             | 参数 | 备注 |
| ------------ | ---------------- | ---- | ---- |
| setUserData  | 设置 userData    |      |      |
| startConnect | 建立 webRTC 连接 |      |
| onError      | 抛出连接错误     |      |      |
| onInfo       | 抛出连接消息     |      |      |
| destroy      | 销毁 RTC 对象    |      |      |
| setConfig    | 设置 webRTC 配置 |      |      |

```js
const userData = {
  sendOffer: wbSignal["CTC-offer"],
  sendCandidate: wbSignal["CTC-candidate"],
  receiveOffer: wbSignal["CTC-offer"],
  receiveCandidate: wbSignal["CTC-candidate"],
  containerId: "#video",
  // 后加入者即为发起方
  isSponsor,
  // 启用STUN
  needSTUN: false,
  // 发送能力集
  chatOffer: "video | audio | all | deskpot",
};
```

```js
const configData = {
  // 接受能力集
  video: false,
  audio: true,
};

rtc.setConfig(configData);
```
