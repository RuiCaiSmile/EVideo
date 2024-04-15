import { subscribe } from 'valtio';
import { LogsModal } from './devTool';
import DevTool from './devTool';

subscribe(LogsModal, () => {
  // console.log('LogsModal', LogsModal);
});

window.openLog = () => {
  LogsModal.show = true;
};

export { writeLogs } from './log';

export default DevTool;
