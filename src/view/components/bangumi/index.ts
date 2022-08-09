import * as BgmInterface from '~/query/bgm/interface';

export const renderSubjectList = (data: BgmInterface.CollectionItem[]) => {
  return `${data.map((item) => `${item.subject.name}`).join('\n')}`;
};
