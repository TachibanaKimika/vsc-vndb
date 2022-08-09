import axios, { Axios, AxiosResponse, AxiosRequestConfig } from 'axios';
import { loadState } from '~/utils/context';
import { APP_ID, APP_SECRET } from './env';
import * as vscode from 'vscode';
import Logger from '~/utils/logger';
const request = axios.create({});

interface Request extends Axios {
  get<T = any>(url: string, config?: AxiosRequestConfig<T>): Promise<any>;
  post<T = any>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig<T>
  ): Promise<any>;
}

request.interceptors.request.use((config) => {
  loadState('AccessToken') &&
    (config.headers['Authorization'] =
      'Bearer ' + loadState<string>('AccessToken'));
  config.headers['client_id'] = APP_ID;
  config.headers['client_secret'] = APP_SECRET;
  return config;
});

const Api: Request = axios.create({
  baseURL: 'https://api.bgm.tv/',
});

Api.interceptors.request.use((config) => {
  loadState<string>('bgm_token') &&
    (config.headers['Authorization'] =
      'Bearer ' + loadState<string>('bgm_token'));
  config.headers['Accept'] = 'application/json';
  config.headers['User-Agent'] = 'vsc-vndb/' + vscode.version;
  return config;
});

Api.interceptors.response.use((config) => {
  if (config.status === 200) {
    return config.data;
  } else {
    Logger.error('query error', config);
    vscode.window.showErrorMessage(config.data);
    throw new Error(config.data);
  }
});

export { Api, APP_ID, APP_SECRET };
export default request;
