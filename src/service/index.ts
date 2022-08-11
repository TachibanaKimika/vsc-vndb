import express from 'express';
import request, { APP_ID, APP_SECRET, Api } from '~/query/bgm/request';
import Logger from '~/utils/logger';
import { saveState, loadState } from '~/utils/context';

const initService = () => {
  const app = express();
  app.get('/oauth', async (req, res) => {
    try {
      const { data } = await request.post('https://bgm.tv/oauth/access_token', {
        grant_type: 'authorization_code',
        client_id: APP_ID,
        client_secret: APP_SECRET,
        code: req.query.code,
        redirect_uri: 'http://localhost:10721/oauth',
      });
      if (data.access_token) {
        saveState('bgm_token', data.access_token);
        saveState('bgm_refresh_token', data.refresh_token);
        saveState('bgm_user_id', data.user_id);
        const user = await Api.get('/v0/me');
        saveState('bgm_user', user);
        Logger.success('Auth Success!', data);
        res.send('Auth Success!');
        return;
      }
      res.send('ERROR:' + JSON.stringify(data));
    } catch (e) {
      res.send('ERROR!<br>' + e + '<br>' + JSON.stringify(e));
    }
  });

  app.listen(10721, () => {
    Logger.success('Bangumi OAuth app listening on port 10721!');
  });
};

export default initService;
