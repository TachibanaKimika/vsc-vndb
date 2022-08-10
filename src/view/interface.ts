class BgmPanelState {
  panelType: string;
  pageNum: number;
  total: number;
  args: any[];
  constructor(panelType = '', pageNum = 1, total = -1) {
    this.panelType = panelType;
    this.pageNum = pageNum;
    this.total = total;
  }

  public newQuery(query: string, total: number, ...args: any[]) {
    this.panelType = query;
    this.total = total;
    this.args = args || [];
  }

  public nextPage() {
    if (this.pageNum * 20 < this.total) {
      this.pageNum += 1;
      return {
        query: this.panelType,
        pageNum: this.pageNum,
        args: this.args,
      };
    } else {
      return false;
    }
  }

  public previousPage() {
    if (this.pageNum > 1) {
      this.pageNum -= 1;
      return {
        query: this.panelType,
        pageNum: this.pageNum,
        args: this.args,
      };
    } else {
      return false;
    }
  }

  public jumpPage(newPage: number) {
    if (newPage > 0 && newPage * 20 <= this.total) {
      this.pageNum = newPage;
      return {
        query: this.panelType,
        pageNum: this.pageNum,
        args: this.args,
      };
    } else {
      return false;
    }
  }
}

export const initBgmPanelState = () => {
  return new BgmPanelState();
};
