import dropTables from './_dropTables';
import createTablesIfNotExist from './_createTablesIfNotExist';

export default () => new Promise((resolve, reject) => {
  dropTables()
    .catch(reject)
    .then(dropTables => {
      createTablesIfNotExist()
        .catch(reject)
        .then(createTables => resolve({ dropTables, createTables }));
    });
});
