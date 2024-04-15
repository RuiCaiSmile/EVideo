import React, { useEffect, useState, FC } from 'react';
import { PortalRender } from '@/components/PortalRender';
import { proxy, useSnapshot } from 'valtio';
import { config, logs } from '../log';
import style from './index.less';
import ListItem from './components/ListItem';
import {
  ClearOutlined,
  CloseOutlined,
  MinusOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import Detail from './components/detail';

const baseStyle = {};

export const LogsModal: logsmodal = proxy({
  show: false,
  selectedItem: '',
});

const Index: FC<any> = (props) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState();

  const logsState = useSnapshot(logs);
  const configState = useSnapshot(config);
  const logsModalState = useSnapshot(LogsModal);

  const clear = () => {
    logs.length = 0;
    LogsModal.selectedItem = '';
  };

  const onShowClick = (item: logsItem) => {
    LogsModal.selectedItem = item._key;
  };

  const detailData = logsState.filter(
    (item) => item._key === LogsModal.selectedItem,
  );

  const onCloseDetail = () => {
    LogsModal.selectedItem = '';
  };
  const onClose = () => {
    LogsModal.show = false;
  };

  return (
    <PortalRender visible={logsModalState.show}>
      <div className={style.logsContainer}>
        <div className={style.title}>
          <div></div>
          <div>welcome~~</div>
          <div className={style.toolBox}>
            <ToolOutlined />
            <ClearOutlined onClick={clear} />
            <MinusOutlined onClick={onClose} />
          </div>
        </div>
        <div className={style.content}>
          {logsState?.map((item, index) => {
            return (
              <ListItem
                data={item}
                key={index}
                onClick={onShowClick}
                selected={logsModalState.selectedItem === item._key}
              />
            );
          })}
        </div>
      </div>
      {logsModalState.selectedItem && (
        <div className={style.logsDetail}>
          <div className={style.title}>
            <div></div>detail~~ <CloseOutlined onClick={onCloseDetail} />
          </div>
          <div className={style.content}>
            {detailData?.length === 1 && <Detail data={detailData[0]}></Detail>}
          </div>
        </div>
      )}
    </PortalRender>
  );
};
export default Index;
