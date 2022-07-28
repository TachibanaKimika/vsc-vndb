import * as vscode from 'vscode';
import { getVndb } from './instance';
import dayjs from 'dayjs';
import { VnsQueryRes, VnListItem, Vn, Character } from './interface';
import { capitalizeFirstLetter } from '../utils/string';
import { logger, loading } from '../utils/decorators';
import { get, set } from 'lodash';

type IVndb = any;

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
  items: VnListItem[];
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

class VnQuery {
  /** VNDB Conn Instance */
  private _vndb: IVndb;
  /** Query Cache */
  private _cache: ICache = {} as any;
  /** Qurey Type Now that has cache */
  private _type: keyof typeof EQueryType | string = 'monthly';
  private _isInQuery = false;
  constructor() {
    this._vndb = getVndb();
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
        items: [],
        page: 1,
        more: true,
      });
      return false;
    } else {
      const cache = get(this._cache, type);
      if (
        (cache?.page ?? 0) * 10 <= (cache?.items ?? []).length ||
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
    vns: VnListItem[],
    more: boolean
  ): GetVnRes {
    set(this._cache, type, {
      items: [...get(this._cache, type).items, ...vns],
      page: get(this._cache, type).page,
      more,
    });
    return get(this._cache, type);
  }

  private async _getCharacterByVnId(vnId: string): Promise<Character[]> {
    let page = 1,
      more = true,
      character: Character[] = [];
    const fetchData: (p: number) => Promise<VnsQueryRes<Character>> = (p) =>
      this._vndb.query(
        `get character basic,details,meas,traits,voiced,vns (vn=${vnId}) {"page":${p}}`
      );
    while (more) {
      const res = await fetchData(page);
      if (res.items.length > 0) {
        character = [...character, ...res.items];
      }
      more = res.more;
      page++;
    }
    return character;
  }

  @loading
  public async getDailyVn() {
    const vnsRes: VnsQueryRes<VnListItem> = await this._vndb.query(`
      get vn basic,stats (released="${dayjs().format('YYYY-MM-DD')}")
    `);
    if (vnsRes.num > 0) {
      return vnsRes.items[0];
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
    const pageOption = {
      page,
      sort: 'popularity',
      reverse: true,
    };

    const vnsRes: VnsQueryRes<VnListItem> = await this._vndb.query(`
      get vn basic,stats (released="${dayjs().format(
        'YYYY-MM-DD'
      )}") ${JSON.stringify(pageOption)}
    `);

    return this._cacheNewVns('daily', vnsRes.items ?? [], vnsRes.more ?? true);
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
    const pageOption = {
      page,
      sort: 'popularity',
      reverse: true,
    };

    const vnsRes: VnsQueryRes<VnListItem> = await this._vndb.query(`
      get vn basic,stats (released>="${dayjs().format(
        'YYYY-MM'
      )}-01" and released<"${dayjs()
      .subtract(-1, 'month')
      .format('YYYY-MM')}-01") ${JSON.stringify(pageOption)}
    `);

    return this._cacheNewVns(
      'monthly',
      vnsRes.items ?? [],
      vnsRes.more ?? true
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
    const pageOption = {
      page,
      sort: 'popularity',
      reverse: true,
    };

    const vnsRes: VnsQueryRes<VnListItem> = await this._vndb.query(`
      get vn basic,stats (released>="${dayjs().format(
        'YYYY'
      )}-01-01" and released<"${dayjs()
      .subtract(-1, 'year')
      .format('YYYY')}-01-01") ${JSON.stringify(pageOption)}
    `);

    return this._cacheNewVns('yearly', vnsRes.items ?? [], vnsRes.more ?? true);
  }

  /**
   * @param id
   */
  @loading
  public async getVnDetails(
    id: string
  ): Promise<(Vn & { characters: Character[] }) | null> {
    const vnRes: VnsQueryRes<Vn> = await this._vndb.query(
      `get vn basic,details,stats (id=${id})`
    );

    if (vnRes) {
      const characters = await this._getCharacterByVnId(id);
      return {
        ...vnRes.items[0],
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

    console.log('vndb search TYPE && CACHE', this._type, this._cache);
    const vnsRes: VnsQueryRes<VnListItem> = await this._vndb.query(
      `get vn basic,stats (search~"${keyword}") ${JSON.stringify(options)}`
    );
    if (vnsRes) {
      return this._cacheNewVns(
        cachePath,
        vnsRes.items ?? [],
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
    console.log('vndb loadmore', this);
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

  public async reconnect() {
    if (!this._vndb) {
      this._vndb = getVndb();
    }
  }

  public destroy() {
    this._vndb.destroy();
  }
}

export const vnQuery = new VnQuery();
