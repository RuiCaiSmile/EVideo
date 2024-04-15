import { defineConfig } from 'umi';
const { MOCK_ENV = 'dev' } = process.env;

const domains = {
  dev: {
    api: 'http://localhost:8002',
    living: 'http://localhost:8003',
  },
  online: {
    api: 'https://chat.deepline.cc/',
    living: 'https://chat.deepline.cc/',
  },
};
const domain = MOCK_ENV === 'dev' ? domains.dev : domains.online;

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      exact: false,
      path: '/',
      component: '@/layouts/index',
      routes: [
        { exact: true, path: '/', component: '@/pages/index' },
        { exact: true, path: '/chat', component: '@/pages/Chat' },
        { exact: true, path: '/about', component: '@/pages/About' },
      ],
    },
  ],
  proxy: {
    '/api/': {
      target: domain.api,
      pathRewrite: {
        '^/api': '',
      },
      changeOrigin: true,
    },
    '/living/': {
      target: domain.living,
      changeOrigin: true,
    },
  },
  fastRefresh: {},
  404: true,
});
