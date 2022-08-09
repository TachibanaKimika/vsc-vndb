import * as vscode from 'vscode';
import request, { APP_ID, APP_SECRET } from '../query/bgm/request';
import { saveState, loadState } from './context';
export const authBangumi = async () => {
  vscode.commands.executeCommand(
    'vscode.open',
    vscode.Uri.parse(
      `https://bgm.tv/oauth/authorize?client_id=${APP_ID}&response_type=code&redirect_uri=http://localhost:10721/oauth`
    )
  );
};

export const refreshToken = async () => {
  const { data } = await request.post('https://bgm.tv/oauth/access_token', {
    grant_type: 'refresh_token',
    client_id: APP_ID,
    client_secret: APP_SECRET,
    refresh_token: loadState('bgm_refresh_token'),
    redirect_uri: 'http://localhost:10721/oauth',
  });
  if (data.access_token) {
    saveState('bgm_token', data.access_token);
    saveState('bgm_refresh_token', data.refresh_token);
    return true;
  }
  return false;
};
