import express from 'express';
import request, { APP_ID, APP_SECRET } from '../query/bgm/request';
import Logger from '../utils/logger';
import { saveState } from '../utils/context';

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
        saveState('bgm_token', res.access_token);
        saveState('bgm_refresh_token', res.refresh_token);
        saveState('bgm_user_id', res.user_id);
        Logger.success('Auth Success!', data);
        res.send('success!');
        return;
      }
      res.send('ERROR:' + JSON.stringify(data));
    } catch (e) {
      res.send('ERROR!' + e);
    }
  });

  app.listen(10721, () => {
    Logger.success('Bangumi OAuth app listening on port 10721!');
  });
};

export default initService;
