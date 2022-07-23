import VNDB = require('vndb-api');

let vndb: VNDB | null = null;

const initVndb = () => {
  if (vndb) {
    return;
  }
  vndb = new VNDB('clientname', {
    // optionally, override any connection options you need to here, like
    minConnection: 1,
    maxConnection: 10,
  });
};

export const destroyVndb = () => {
  if (!vndb) {
    return;
  }
  vndb.destroy();
  vndb = null;
};

export const getVndb = (): VNDB => {
  if (!vndb) {
    initVndb();
  }
  return vndb as VNDB;
};
