import React from 'react';
import db from '@/utils/database';
import Context from './Context';

export default function Provider(props) {
  const [state, _setState] = React.useState({
    dbTablesInitialised: false,
    createDBTablesError: null,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  React.useEffect(() => {
    const done = (err) => {
      setState({
        dbTablesInitialised: true,
        createDBTablesError: err,
      });
    };

    db.transaction(
      tx => {
        tx.executeSql(
          'create table if not exists scripts (id string primary key not null, data longtext, createdAt datetime, updatedAt datetime);'
        );
        tx.executeSql(
          'create table if not exists screens (id number primary key not null, data longtext, createdAt datetime, updatedAt datetime);'
        );
      },
      done,
      rslts => done(null, rslts)
    );
  }, []);

  return (
    <Context.Provider
      {...props}
      value={{
        db,
        state,
        setState,
      }}
    />
  );
}
