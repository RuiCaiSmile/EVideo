import { FC, useEffect, useState } from 'react';
import { Descriptions, Input, Select, Button, Space, Modal } from 'antd';
import { v4 as uuid } from 'uuid';
import './index.less';
import _ from 'lodash';
import { useHistory } from 'umi';
import { loginParams } from '@/@types/chat';
import { useTitle } from 'ahooks';

const { Option } = Select;
const Start: FC<any> = (props) => {
  const history = useHistory();
  useTitle('EVideo');
  const [chatData, setChatData] = useState<loginParams>({
    name: '张三',
    limit: 10,
    type: 'video',
    token: '',
    chat: true,
    userToken: '',
  });

  const [visible, setvisible] = useState(false);

  useEffect(() => {
    const token = uuid();
    setChatData({
      ...chatData,
      token: uuid(),
      userToken: token,
    });
    history.push(`./?token=${token}`);
  }, []);

  const onNameChanged = (e: any) => {
    setChatData({
      ...chatData,
      name: e.target.value,
    });
  };

  const onTokenChanged = (e: any) => {
    setChatData({
      ...chatData,
      token: e.target.value,
    });
  };

  const onJoin = () => {
    setvisible(true);
  };

  const onCreate = (isJoin?: any) => {
    const data = _.cloneDeep(chatData);
    if (isJoin) {
      data.chat = true;
    }
    const storageData = JSON.stringify(data);
    localStorage.setItem(`${data.userToken}`, storageData);
    history.push(`/Chat?token=${data.userToken}`);
  };

  const onModalOk = () => {
    setChatData({
      ...chatData,
      chat: true,
    });
    onCreate(true);
    setvisible(false);
  };

  const onModalCancel = () => {
    setvisible(false);
  };
  const onTypeChanged = (value: string) => {
    setChatData({
      ...chatData,
      type: value,
    });
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <Descriptions column={1} bordered>
        <Descriptions.Item label="房间Token">
          {chatData.token}
        </Descriptions.Item>
        <Descriptions.Item label="使用昵称">
          <Input
            style={{ width: 200 }}
            onChange={onNameChanged}
            value={chatData.name}
          ></Input>
        </Descriptions.Item>
        {/* <Descriptions.Item label="限制人数">
          <Select defaultValue={chatData.limit} style={{ width: 200 }}>
            <Option value="2">2</Option>
            <Option value="5">5</Option>
            <Option value="10">10</Option>
            <Option value="all">不限制</Option>
          </Select>
        </Descriptions.Item> */}
        <Descriptions.Item label="聊天设置">
          <Select
            defaultValue={chatData.type}
            onChange={onTypeChanged}
            style={{ width: 200 }}
          >
            <Option value="video">视频聊天</Option>
            {/* <Option value="audio">语音聊天</Option> */}
            <Option value="screen">屏幕分享</Option>
          </Select>
        </Descriptions.Item>
      </Descriptions>
      <div className="join-box">
        <Space>
          <Button type="primary" onClick={onCreate}>
            创建房间
          </Button>
          <div style={{ width: 40, textAlign: 'center' }}>or</div>
          <Button type="primary" onClick={onJoin}>
            加入房间
          </Button>
        </Space>
      </div>
      {visible && (
        <Modal
          title="加入房间"
          onOk={onModalOk}
          onCancel={onModalCancel}
          visible={visible}
        >
          房间Token: <Input onChange={onTokenChanged} />
        </Modal>
      )}
    </div>
  );
};
export default Start;
