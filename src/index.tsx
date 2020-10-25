import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import axios from 'axios';
import configureStore from './store';
import door from 'service/door';
import { PersistGate } from 'redux-persist/integration/react';

axios.interceptors.request.use(request => {
  console.log('[Axios] Starting Request', request);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('[Axios] Receive Response', response);
  return response;
});

const { store, persistor } = configureStore();

// Debug door APIs (i.e. getCourses(), getNotices(), ...)
(window as any).door = door;

// Debug current redux state (store.getState())
(window as any).store = store;

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App/>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
