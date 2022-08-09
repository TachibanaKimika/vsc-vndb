import axios from 'axios';
import { loadState } from '../../utils/context';
import { APP_ID, APP_SECRET } from './env';
const request = axios.create({});

request.interceptors.request.use((config) => {
  loadState('AccessToken') &&
    (config.headers['Authorization'] =
      'Bearer ' + (loadState('AccessToken') as string));
  config.headers['client_id'] = APP_ID;
  config.headers['client_secret'] = APP_SECRET;
  return config;
});
export { APP_ID, APP_SECRET };
export default request;
