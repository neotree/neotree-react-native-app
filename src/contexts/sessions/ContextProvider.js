import React from 'react';
import Context from './Context';
import _getSessions from './_getSessions';
import _deleteSessions from './_deleteSessions';
import _export from './_export';

function Provider(props) {
  const [state, _setState] = React.useState({
    sessions: [],
    canSelectItems: false,
    selectedItems: [],
    loadingSessions: false,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const selectItems = ids => {
    ids = ids && ids.map ? ids : [ids];
    setState(prevState => {
      const addIds = ids.filter(id => prevState.selectedItems.indexOf(id) === -1);
      const removeIds = ids.filter(id => prevState.selectedItems.indexOf(id) >= 0);

      return {
        ...prevState,
        selectedItems: [
          ...addIds,
          ...prevState.selectedItems.filter(id => removeIds.indexOf(id) < 0)
        ]
      };
    });
  };

  const getSessions = _getSessions({ state, setState });

  const deleteSessions = _deleteSessions({ state, setState });

  React.useEffect(() => { getSessions(); }, []);

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        getSessions,
        selectItems,
        deleteSessions,
        ..._export({ state, setState }),
      }}
    />
  );
}

export default Provider;
