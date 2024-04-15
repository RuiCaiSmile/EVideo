import { useEffect, useState, FC } from 'react';
import { Layout, Menu } from 'antd';
import { useHistory } from 'umi';
import useUrlParams from '@/components/hooks/useUrlParams';
import DevTool from '@/components/logsTool';

const menuData = [
  {
    label: 'Chat',
    url: '/',
  },
];

const { Header, Content, Footer } = Layout;
const Layouts: FC<any> = (props) => {
  const history = useHistory();
  let defaultKey = '1';
  if (history?.location?.pathname === '/live') {
    defaultKey = '2';
  }
  if (history?.location?.pathname === '/record') {
    defaultKey = '3';
  }
  if (history?.location?.pathname === '/about') {
    defaultKey = '4';
  }
  return (
    <Layout className="EVideo-layout">
      <DevTool />
      <Header>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={[defaultKey]}>
          {menuData.map((item, index) => {
            const key = index + 1;
            return (
              <Menu.Item
                key={key}
                onClick={() => {
                  history.push(item.url);
                }}
              >
                {item.label}
              </Menu.Item>
            );
          })}
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">{props.children}</div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Created By Rui.Cai</Footer>
    </Layout>
  );
};
export default Layouts;
