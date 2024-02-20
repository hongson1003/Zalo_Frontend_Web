import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { Provider } from 'react-redux';
import store from './redux/store';
import {
  RouterProvider,
} from "react-router-dom";
import { router } from './route.jsx'; // Import từ file routes đã tạo


ReactDOM.createRoot(document.getElementById('root')).render(

  <React.StrictMode>
    <Provider store={store}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </Provider>

  </React.StrictMode>

);
