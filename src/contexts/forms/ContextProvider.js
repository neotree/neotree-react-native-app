import React from 'react';
import Context from './Context';
import _getData from './_getData';
import _deleteForms from './_deleteForms';

function Provider(props) {
  const [state, _setState] = React.useState({
    data: [],
    canSelectItems: false,
    selectedItems: [],
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

  const getData = _getData({ state, setState });

  const deleteForms = _deleteForms({ state, setState });

  React.useEffect(() => { getData(); }, []);

  return (
    <Context.Provider
      {...props}
      value={{
        state,
        setState,
        getData,
        selectItems,
        deleteForms,
      }}
    />
  );
}

export default Provider;
