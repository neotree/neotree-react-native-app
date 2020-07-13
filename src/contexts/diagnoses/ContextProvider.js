import React from 'react';
import PropTypes from 'prop-types';
import useRouter from '@/utils/useRouter';
// import useDataRefresherAfterSync from '../useDataRefresherAfterSync';
import Context from './Context';

import _getDiagnoses from './_getDiagnoses';

export default function Provider({ children }) {
  const router = useRouter();
  const { scriptId } = router.match.params;

  const [state, _setState] = React.useState({
    diagnoses: [],
    loadingDiagnoses: false,
    loadDiagnosesError: null,
    diagnosesInitialised: false,
  });

  const setState = s => _setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  const getDiagnoses = _getDiagnoses({ state, setState, router });

  const initialisePage = (opts = {}) => {
    if (opts.force || !state.diagnosesInitialised) {
      getDiagnoses();
    }
  };

  // useDataRefresherAfterSync('diagnoses', ({ event }) => {
  //   const shouldGetDiagnoses = event.diagnoses.reduce((acc, s) => {
  //     if (state.diagnoses.map(s => s.id).indexOf(s.id) > -1) acc = true;
  //     return acc;
  //   }, false);
  //
  //   if (shouldGetDiagnoses) getDiagnoses(null, { showLoader: false });
  // });

  React.useEffect(() => { initialisePage(); }, [scriptId]);

  return (
    <Context.Provider
      value={{
        state,
        setState,
        initialisePage,
        getDiagnoses,
      }}
    >{children}</Context.Provider>
  );
}

Provider.propTypes = {
  children: PropTypes.node,
};
