import { loadState } from '~/utils/context';
import { Api } from './request';
import Logger from '~/utils/logger';
import { UserState, ListRes, CollectionItem, SearchListRes } from './interface';

export const getMyCollection = async (
  pageNum = 1,
  /** 暂时只支持4 */
  pageSize = 20,
  subject_type = 4
): Promise<ListRes<CollectionItem>> => {
  const user = loadState<UserState>('bgm_user');
  const data = await Api.get(`/v0/users/${user.username}/collections`, {
    params: {
      subject_type,
      limit: pageSize,
      offset: pageSize * (pageNum * 1 - 1),
    },
  });
  Logger.success('getMyCollection', data);
  return data;
};

export const searchSubject = async (
  keywords: string,
  offset = 0,
  pageSize = 20,
  responseGroup = 'medium',
  type = 4
): Promise<SearchListRes> => {
  const data = await Api.get(`/search/subject/${keywords}`, {
    params: {
      start: offset,
      max_results: pageSize,
      responseGroup,
      type,
    },
  });
  Logger.success('searchSubject', data);
  return data;
};

export const getCharactersById = async (subjectId: string | number) => {
  const data = await Api.get(`/v0/subjects/${subjectId}/characters`);
  Logger.success('getCharactersById', data);
  return data;
};

export const getCalendar = async () => {
  const data = await Api.get('/calendar');
  return data;
};
