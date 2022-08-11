import request, { Api } from '~/query/bgm/request';
import { saveState, loadState } from '~/utils/context';
import { APP_ID, APP_SECRET } from '~/query/bgm/env';
import { executeCommand } from '~/utils/command';
import Logger from '~/utils/logger';
import * as vscode from 'vscode';

export const refreshToken = async () => {
  if (!loadState('bgm_refresh_token')) return;
  const refreshToken = loadState('bgm_refresh_token');
  const { data } = await request.post('https://bgm.tv/oauth/access_token', {
    grant_type: 'refresh_token',
    client_id: APP_ID,
    client_secret: APP_SECRET,
    refresh_token: refreshToken,
    redirect_uri: 'http://localhost:10721/oauth',
  });
  if (data.access_token) {
    saveState('bgm_token', data.access_token);
    saveState('bgm_refresh_token', data.refresh_token);
    const user = await Api.get('/v0/me');
    saveState('bgm_user', user);
    Logger.success('Refresh Token Success!', data);
    return true;
  } else {
    vscode.window
      .showErrorMessage(
        'Refresh Token Action Error!\n Please login manually.',
        'login'
      )
      .then((action) => {
        action === 'login' && executeCommand('authBangumi');
      });
    return false;
  }
};
