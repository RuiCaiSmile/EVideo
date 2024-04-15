import { Row, Col } from 'antd';
import React, { useEffect, useState, FC } from 'react';

interface detailProps {
  data: logsItem;
}

const Detail: FC<detailProps> = ({ data }) => {
  const { _showLabel, _showKey, _time, _key, _from, _show, ...rest } = data;
  const origin = { ...rest };
  return (
    <div style={{ paddingLeft: '10px' }}>
      <Row>
        <Col span={3}>from:</Col>
        <Col>{data._from}</Col>
      </Row>
      <Row>
        <Col span={3}>event:</Col>
        <Col>{data._showLabel}</Col>
      </Row>
      <Row>
        <Col span={3}>time:</Col>
        <Col>{data._time}</Col>
      </Row>
      {data._showKey && (
        <Row>
          <Col span={3}>key:</Col>
          <Col>{data._showKey}</Col>
        </Row>
      )}
      {data._show && (
        <>
          <div>show:</div>
          <pre> {data._show}</pre>
        </>
      )}
      <div>origin:</div>
      <pre> {JSON.stringify(origin, null, '\t')}</pre>
    </div>
  );
};
export default Detail;
