import {
  insertEhrNeotree as _insertEhrNeotree,
  getEhrNeotree as _getEhrNeotree,
} from '../database/ehr_neotree';

export const insertEhrNeotree = (opts = '') => new Promise((resolve, reject) => {
  _insertEhrNeotree(opts)
    .then(resolve)
    .catch(e=>{
    });
});

export const getEhrNeotree = (opts = {}) => _getEhrNeotree(opts);

