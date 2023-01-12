export interface VnsQueryRes<T> {
  more: boolean;
  num: number;
  status: string;
  searchType: string;
  results: Array<T>;
}

export type VnItem = VnBasic | VnDetails | VnStats;
export type VnListItem = VnBasic & VnStats;
export type Vn = VnBasic & VnDetails & VnStats;
export interface VnBasic {
  id: number;
  title: string;
  original: string | null;
  released: string | null;
  languages: string[];
  orig_lang: string[];
  platforms: string[];
}

export interface VnDetails {
  aliases: string | null;
  length: number | null;
  description: string | null;
  links: {
    [key: string]: null | string;
  } | null;
  image: string | null;
  image_nsfw: boolean;
  image_flagging: any;
}

export interface VnStats {
  popularity: number;
  rating: number;
  votecount: number;
}

export enum CharacterGender {
  m,
  f,
  b,
}

export enum CharacterBloodt {
  a,
  b,
  o,
  ab,
}

export enum CharacterRole {
  main,
  primary,
  side,
}

export type Character = CharacterBasic &
  CharacterDetails &
  CharacterMeas &
  CharacterVns;

export interface CharacterBasic {
  id: number;
  name: string;
  original: string | null;
  gender: keyof typeof CharacterGender | null;
  spoil_gender: keyof typeof CharacterGender | null;
  bloodt: keyof typeof CharacterBloodt | null;
  /** birthday: [day, month] */
  birthday: [number | null, number | null];
}

export interface CharacterDetails {
  /** split by \n */
  aliases: string | null;
  description: string | null;
  age: number;
  image: string;
  image_flagging: any;
}

export interface CharacterMeas {
  bust: number | null;
  waist: number | null;
  hip: number | null;
  height: number | null;
  weight: number | null;
  cup_size: string | null;
}

export interface CharacterVns {
  /** [vnid, unknown, unknown, role] */
  vns: [number, number, number, keyof typeof CharacterRole][];
}
