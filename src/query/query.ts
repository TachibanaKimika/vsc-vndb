import * as vscode from 'vscode';
import dayjs from 'dayjs';
import { VnsQueryRes, VnListItem } from './interface';
import { Vn, VnField, Character, api } from 'vndb-api-kana';
import { capitalizeFirstLetter } from '../utils/string';
import { loading } from '../utils/decorators';
import Logger from '../utils/logger';
import axios from 'axios';
import { get, set } from 'lodash';

type ICache = {
  [key in EQueryType]: GetVnRes;
} & {
  [key: string]: GetVnRes;
};

enum EQueryType {
  monthly = 'monthly',
  yearly = 'yearly',
  daily = 'daily',
}

interface GetVnRes {
  /** VnListItem */
  results: Vn[];
  /** now page num */
  page: number;
  /** db has more vns */
  more: boolean;
}

export enum SortType {
  released = 'released',
  rating = 'rating',
  votecount = 'votecount',
  popularity = 'popularity',
}

export interface SearchOption {
  sort: keyof typeof SortType;
  reverse: boolean;
}

const usedVnListFields: VnField[] = [
  'id',
  'title',
  'titles.official',
  'titles.title',
  'released',
  'votecount',
  'popularity',
  'rating',
];

const vnDetailsFields: VnField[] = [
  'id',
  'title',
  'titles.official',
  'titles.title',
  'description',
  'aliases',
  'released',
  'length',
  'popularity',
  'rating',
  'votecount',
];

class VnQuery {
  /** Query Cache */
  private _cache: ICache = {} as any;
  /** Qurey Type Now that has cache */
  private _type: keyof typeof EQueryType | string = 'monthly';
  private _isInQuery = false;
  constructor() {
    // this._vndb = getVndb();
  }

  /**
   *
   * @param type monthly | yearly
   * @returns false | GetVnRes
   */
  private _searchCache(
    type: keyof typeof EQueryType | string
  ): false | GetVnRes {
    if (!get(this._cache, type)) {
      set(this._cache, type, {
        results: [],
        page: 1,
        more: true,
      });
      return false;
    } else {
      const cache = get(this._cache, type);
      if (
        (cache?.page ?? 0) * 10 <= (cache?.results ?? []).length ||
        !cache?.more
      ) {
        return cache;
      } else {
        return false;
      }
    }
  }

  /**
   *
   * @param type monthly | yearly
   * @param vns VnListItem[]
   * @param more boolean
   * @returns GetVnRes
   */
  private _cacheNewVns(
    type: keyof typeof EQueryType | string,
    vns: Vn[],
    more: boolean
  ): GetVnRes {
    set(this._cache, type, {
      results: [...get(this._cache, type).results, ...vns],
      page: get(this._cache, type).page,
      more,
    });
    return get(this._cache, type);
  }

  private async _getCharacterByVnId(vnId: string): Promise<Character[]> {
    let page = 1,
      more = true,
      character: Character[] = [];
    const fetchData = (p: number) => {
      return api.getCharacter({
        filters: ['vn', '=', ['id', '=', vnId]],
        fields: [
          'id',
          'name',
          'birthday',
          'description',
          'vns.role',
          'weight',
          'cup',
          'height',
          'bust',
          'waist',
          'hips',
          'sex',
        ],
        page: p,
      });
    };
    while (more) {
      const res = await fetchData(page);
      if (res.results.length > 0) {
        character = [...character, ...res.results];
      }
      more = res.more;
      page++;
    }
    return character;
  }

  @loading
  public async getDailyVn() {
    const vnRes = await api.getVn({
      filters: ['released', '=', dayjs().format('YYYY-MM-DD')],
      fields: usedVnListFields,
      results: 1,
    });
    if (vnRes.count > 0) {
      return vnRes.results[0];
    }
    return null;
  }

  @loading
  public async getDailyVns(): Promise<GetVnRes> {
    this._type = 'daily';
    const cache = this._searchCache(this._type);
    if (cache) {
      return cache;
    }

    // not hit cache
    const { page } = this._cache.daily;

    const vnRes = await api.getVn({
      filters: ['released', '=', dayjs().format('YYYY-MM-DD')],
      fields: usedVnListFields,
      page,
      count: true,
      sort: 'popularity',
    });

    return this._cacheNewVns('daily', vnRes.results ?? [], vnRes.more ?? true);
  }

  /**
   * @type monthly
   */
  @loading
  public async getMonthlyVns(): Promise<GetVnRes> {
    this._type = 'monthly';
    // hit cache
    const cache = this._searchCache('monthly');
    if (cache) {
      return cache;
    }

    // not hit cache
    const { page } = this._cache.monthly;

    const vnRes = await api.getVn({
      filters: [
        'and',
        ['released', '<', `${dayjs().format('YYYY-MM-DD')}`],
        [
          'released',
          '>',
          `${dayjs().subtract(1, 'month').format('YYYY-MM-DD')}`,
        ],
      ],
      fields: usedVnListFields,
      page,
      sort: 'popularity',
      reverse: true,
    });

    return this._cacheNewVns(
      'monthly',
      vnRes.results ?? [],
      vnRes.more ?? true
    );
  }

  /**
   * @type yearly
   */
  @loading
  public async getYearlyVns(): Promise<GetVnRes> {
    this._type = 'yearly';
    // hit cache
    const cache = this._searchCache('yearly');
    if (cache) {
      return cache;
    }

    // not hit cache
    const { page } = this._cache.yearly;

    const vnsRes = await api.getVn({
      filters: [
        'and',
        ['released', '<', `${dayjs().format('YYYY-MM-DD')}`],
        [
          'released',
          '>',
          `${dayjs().subtract(1, 'year').format('YYYY-MM-DD')}`,
        ],
      ],
      fields: usedVnListFields,
      page,
      sort: 'popularity',
      reverse: true,
    });

    return this._cacheNewVns(
      'yearly',
      vnsRes.results ?? [],
      vnsRes.more ?? true
    );
  }

  /**
   * @param id
   * TODO: Type => Vn & { characters: Character[] }
   */
  @loading
  public async getVnDetails(
    id: string
  ): Promise<(Vn & { characters: Character[] }) | null> {
    const vnRes = await api.getVn({
      filters: ['id', '=', id],
      fields: vnDetailsFields,
    });

    Logger.success('Details', vnRes);

    if (vnRes.results.length > 0) {
      const characters = await this._getCharacterByVnId(id);
      return {
        ...vnRes.results?.[0],
        characters,
      };
    } else {
      return null;
    }
  }

  @loading
  public async searchVns(keyword: string, option: SearchOption): Promise<any> {
    this._type = `${keyword}:${JSON.stringify(option)}`;
    const cachePath = `${keyword}:${JSON.stringify(option)}`;
    const cache = this._searchCache(cachePath);
    if (cache) {
      return cache;
    }
    const { page }: GetVnRes = get(this._cache, cachePath);
    const options = {
      page,
      ...option,
    };

    Logger.log('vndb search TYPE && CACHE', this._type, this._cache);
    const vnsRes = await api.getVn({
      filters: ['search', '=', keyword],
      fields: usedVnListFields,
      ...options,
    });
    if (vnsRes) {
      return this._cacheNewVns(
        cachePath,
        vnsRes.results ?? [],
        vnsRes.more ?? true
      );
    } else {
      throw new Error('vndb search error');
    }
  }

  /**
   * @description loadmore
   */
  public async loadMore(): Promise<GetVnRes | null> {
    Logger.log('vndb loadmore', this);
    if (!this._type) {
      vscode.window.showErrorMessage('Please select a query type first.');
      return null;
    }
    let fetchData: () => Promise<GetVnRes> | null = null;
    if (
      (this as any)['get' + capitalizeFirstLetter(this._type as string) + 'Vns']
    ) {
      fetchData = (this as any)[
        'get' + capitalizeFirstLetter(this._type as string) + 'Vns'
      ].bind(this);
    } else {
      const [kw, ...options] = this._type.split(':');
      fetchData = this.searchVns.bind(this, kw, JSON.parse(options.join(':')));
    }
    if (typeof fetchData === 'function') {
      if (!get(this._cache, this._type)?.more) {
        vscode.window.showInformationMessage('No more data.');
        return null;
      }
      get(this._cache, this._type)?.page &&
        (get(this._cache, this._type).page += 1);
      const res = await fetchData();
      return res;
    } else {
      vscode.window.showErrorMessage('Could not find type: ' + this._type);
      return null;
    }
  }

  public destroy() {
    this._isInQuery = false;
    // this._vndb.destroy();
  }
}

export const vnQuery = new VnQuery();
