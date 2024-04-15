import { Card } from 'antd';
import Start from './Start';
import './index.less';

export default function IndexPage() {
  return (
    <div className="EVideoContainer">
      <Card title={RenderTitle()}>
        <div>1.使用页面上的token创建房间</div>
        <div>2.将token发给朋友</div>
        <div>3.输入该token加入聊天吧</div>
      </Card>
      <Start></Start>
    </div>
  );
}

const RenderTitle = () => {
  return <div>使用说明</div>;
};
