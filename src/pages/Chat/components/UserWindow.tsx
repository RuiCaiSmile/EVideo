import {
  AudioMutedOutlined,
  AudioOutlined,
  createFromIconfontCN,
} from '@ant-design/icons';
import { FC } from 'react';
import './UserWindow.less';

const IconFont = createFromIconfontCN({
  scriptUrl: ['//at.alicdn.com/t/font_3241726_1ajop47rzkz.js'],
});
interface UserWindowProps {
  isSelf?: boolean;
  isMute?: boolean;
  isMicOpen?: boolean;
  type: ChatType;
  containerId: string;
  info: {
    name: string;
    isMute: boolean;
    isMicOpen: boolean;
  };
  onMicChanged: (id: string, isMicOpen: boolean) => void;
  onMuted: (id: string, mute: boolean) => void;
  onHangUp: (id: string) => void;
}

const style = {
  fontSize: '25px',
  color: '#fff',
};

const UserWindow: FC<UserWindowProps> = (props) => {
  const { containerId, info, isSelf, onMicChanged, onMuted, onHangUp } = props;
  return (
    <div className="user-window-container">
      <div className="userWindow userWindow-normal">
        <div className="videoParentBox">
          <div className="videoBox" id={containerId}></div>
        </div>
        <div className="videoTitle">{info?.name}</div>

        {isSelf && (
          <div className="videoControl">
            {/* {isSelf && info?.isMicOpen && (
              <AudioOutlined
                style={style}
                title="麦克风打开"
                onClick={() => {
                  onMicChanged(containerId, false);
                }}
              />
            )}
            {isSelf && !info?.isMicOpen && (
              <AudioMutedOutlined
                style={style}
                title="麦克风关闭"
                onClick={() => {
                  onMicChanged(containerId, true);
                }}
              />
            )} */}
            {!isSelf && info?.isMute && (
              <IconFont
                type="icon-shengyinjingyin"
                style={style}
                title="音量关闭"
                onClick={() => {
                  onMuted(containerId, false);
                }}
              />
            )}
            {!isSelf && !info?.isMute && (
              <IconFont
                type="icon-shengyinkai"
                style={style}
                title="音量打开"
                onClick={() => {
                  onMuted(containerId, true);
                }}
              />
            )}

            {isSelf && (
              <IconFont
                type="icon-guaduan"
                style={style}
                title="挂断"
                onClick={() => {
                  onHangUp(containerId);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default UserWindow;
