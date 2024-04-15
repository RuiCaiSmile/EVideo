import websockets from './websockets';

const createWebsocket = () => {
  const easyW = new websockets();

  return easyW;
};

export { createWebsocket };
