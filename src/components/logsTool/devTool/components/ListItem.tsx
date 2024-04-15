import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DoubleRightOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { Col, Row } from 'antd';
import React, { useEffect, useState, FC } from 'react';
import style from '../index.less';

interface detailProps {
  data: logsItem;
  selected?: boolean;
  onClick?: (data: logsItem) => void;
}

const ListItem: FC<detailProps> = ({ data, selected, onClick }) => {
  const onItemClick = () => {
    onClick && onClick(data);
  };

  return (
    <div className={style.listItem}>
      <Row>
        <Col span={2}>
          {data._from === 'client' ? (
            <ArrowUpOutlined style={{ color: 'green' }} />
          ) : (
            <ArrowDownOutlined style={{ color: 'red' }} />
          )}
        </Col>
        <Col span={4}>{data._from}</Col>
        <Col span={10}>{data._showLabel}</Col>
        <Col span={6}>{data._time.slice(10)}</Col>
        <Col span={2}>
          {selected ? (
            <DoubleRightOutlined style={{ color: 'green' }} />
          ) : (
            <RightOutlined onClick={onItemClick} />
          )}
        </Col>
      </Row>
    </div>
  );
};
export default ListItem;
