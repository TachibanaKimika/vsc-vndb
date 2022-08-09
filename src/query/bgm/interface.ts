export interface ImageBase {
  large: string;
  medium: string;
  small: string;
}

export interface UserState {
  avatar: ImageBase;
  username: string;
  nickname: string;
  id: number;
  user_group: number;
}

export interface ListRes<T> {
  total: number;
  limit: number;
  offset: number;
  data: T[];
}

export interface SearchListRes<T = Subject> {
  results: number;
  list: T[];
}

export interface CollectionItem<T = Subject> {
  comment: string | null;
  ep_status: number;
  private: boolean;
  rate: number;
  subject: T;
  subject_id: number;
  subject_type: number;
  updated_at: string;
  /** Collection Type */
  type: number;
  /** Taged By User */
  tags: string[];
}

export interface SubjectTags {
  name: string;
  count: number;
}

export interface Subject {
  collection_total: number;
  date: null | string;
  id: number;
  images?: ImageBase & { grid: string; common: string };
  name: string;
  name_cn: string | null;
  rank: number;
  score: number;
  short_summary: string;
  tags: SubjectTags[];
  type: number;
  /** unknown */
  eps: unknown;
  /** unknown */
  volumes: unknown;
}

export interface PersonItem {
  id: number;
  name: string;
  type: number;
  career: number;
  images?: ImageBase;
}

export interface CharacterItem {
  id: number;
  name: string;
  type: 1;
  images?: ImageBase & { grid: string };
  relation: string;
  actors: PersonItem[];
}
