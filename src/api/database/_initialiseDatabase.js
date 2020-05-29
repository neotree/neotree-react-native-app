import createTablesIfNotExist from './_createTablesIfNotExist';
import syncDatabase from './_syncDatabase';

export default () => new Promise((resolve, reject) => {
  // create tables if not exist
  createTablesIfNotExist()
    .catch(reject)
    .then(() => syncDatabase().then(resolve).catch(reject));
});
