import React from 'react';
import ReactDOM from 'react-dom/client';
import WorkSpace from './WorkSpace';
import './index.less';
import { ConfigProvider } from 'antd';
import { db } from './Data';
import { start } from './Node';
import reportWebVitals from './reportWebVitals';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Scrollbars from 'react-custom-scrollbars-2';
dayjs.extend(relativeTime);
import './tracker';

console.log(
  '%c[邀请]:你已经看到这了,可以来github共建此项目 https://github.com/JianGuoKe/workhome',
  'color: #43bb88; font-weight: bold; '
);

db.init()
  .then(start)
  .then(() => {
    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
      <React.StrictMode>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1677ff',
            },
          }}
        >
          <Scrollbars style={{ width: '100%', height: '100%' }} autoHide>
            <WorkSpace />
          </Scrollbars>
        </ConfigProvider>
      </React.StrictMode>
    );
  });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
