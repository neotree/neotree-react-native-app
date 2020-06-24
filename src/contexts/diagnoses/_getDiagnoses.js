import { getDiagnoses } from '@/api/diagnoses';

export default ({
  setState,
  router: {
    match: { params: { scriptId } }
  }
}) => (payload, opts = {}) => {
  setState({
    loadDiagnosesError: null,
    loadingDiagnoses: opts.showLoader !== false,
    // diagnosesInitialised: false
  });

  getDiagnoses({ payload: { script_id: scriptId, ...payload } })
    .then(payload => {
      setState({
        diagnoses: payload.diagnoses || [],
        diagnosesInitialised: true,
        loadDiagnosesError: payload.error,
        loadingDiagnoses: false,
      });
    })
    .catch(e => setState({
      loadDiagnosesError: e,
      diagnosesInitialised: true,
      loadingDiagnoses: false,
    }));
};
