import { DiagnosisData } from '@/types';
import { dbTransaction } from './db';
import { Diagnosis, DiagnosisRow, QueryFilter, } from './types';

export const getDiagnoses = (options: QueryFilter = {}) => new Promise<Diagnosis[]>((resolve, reject) => {
  (async () => {
    try {
      const { order: _order, ..._where } = options || {};

      const orderValue = (_order || [['position', 'ASC']]);
      const order = (orderValue.map ? orderValue : [])
        .map(keyVal => (!keyVal.map ? '' : `${keyVal[0] || ''} ${keyVal[1] || ''}`).trim())
        .filter(clause => clause)
        .join(',');

      const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
        .join(',');

      let q = 'select * from diagnoses';
      q = where ? `${q} where ${where}` : q;
      q = order ? `${q} order by ${order}` : q;

      const rows = await dbTransaction<DiagnosisRow>(`${q};`.trim(), null);
      resolve(rows.map(s => ({ ...s, data: JSON.parse(s.data || '{}') as DiagnosisData } as Diagnosis)));
    } catch (e) { reject(e); }
  })();
});

export const saveDiagnoses = (data = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      data = data || [];
      if (!data.length) return resolve(null);

      const res = await Promise.all(data.map(s => {
        const columns = ['id', 'diagnosis_id', 'script_id', 'position', 'type', 'data', 'createdAt', 'updatedAt'].join(',');
        const values = ['?', '?', '?', '?', '?', '?', '?', '?'].join(',');
        return dbTransaction<DiagnosisRow>(`insert or replace into diagnoses (${columns}) values (${values});`, [
          s.id,
          s.diagnosis_id,
          s.script_id,
          s.position,
          s.type,
          JSON.stringify(s.data || {}),
          s.createdAt,
          s.updatedAt
        ]);
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});

export const deleteDiagnoses = (params = []) => new Promise((resolve, reject) => {
  (async () => {
    try {
      params = params || [];
      if (!params.map) params = [params];

      const res = await Promise.all(params.map(_where => {
        const where = Object.keys(_where).map(key => `${key}=${JSON.stringify(_where[key])}`)
          .join(',');
        let q = 'delete from diagnoses';
        q = where ? `${q} where ${where}` : q;

        return dbTransaction<DiagnosisRow>(`${q};`.trim());
      }));
      resolve(res);
    } catch (e) { reject(e); }
  })();
});