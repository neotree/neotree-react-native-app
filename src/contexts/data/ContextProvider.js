import React from 'react';
import { initialiseDatabase } from '@/api/database';
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

    initialiseDatabase()
      .then(rslts => done(rslts))
      .catch(done);
  }, []);

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
      }}
    />
  );
}
