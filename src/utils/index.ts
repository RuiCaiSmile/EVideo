import { detect } from 'detect-browser';

export const getLocalItem = (key: string) => {
  const res = localStorage.getItem(key);
  if (res) return JSON.parse(res);
  return null;
};

export const toJS = (data: any) => {
  return JSON.parse(JSON.stringify(data));
};

// 校验函数
export const detectBrowser = () => {
  const detectResult = detect();
  let browser;
  switch (detectResult && detectResult.name) {
    case 'chrome':
      browser = {
        browser: 'chrome',
        version: detectResult?.version || '',
        code: 'success',
        message: '',
      };
      break;
    case 'firefox':
      browser = {
        browser: 'firefox',
        version: detectResult?.version || '',
        code: 'success',
        message: '',
      };
      break;
    case 'edge-chromium':
      browser = {
        browser: 'edge-chromium',
        version: detectResult?.version || '',
        code: 'success',
        message: '',
      };
      break;
    // @ts-ignore
    case 'react-native':
      browser = {
        browser: 'react-native',
        version: detectResult?.version || '',
        // code: 'error',
        code: 'success',
        message: '目前不支持React-Native环境',
      };
      break;
    default:
      browser = {
        browser: detectResult?.name || '',
        version: detectResult?.version || '',
        code: 'success',
        // code: 'error',
        message:
          '本系统仅支持chrome、firefox及edge(高版本)浏览器，请更换浏览器使用！',
      };
  }
  console.log(browser);
  return browser;
};
