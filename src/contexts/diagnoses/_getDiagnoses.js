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

  getDiagnoses({ script_id: scriptId, ...payload })
    .then(res => {
      setState({
        diagnoses: res.diagnoses || [],
        diagnosesInitialised: true,
        loadDiagnosesError: res.error,
        loadingDiagnoses: false,
      });
    })
    .catch(e => setState({
      loadDiagnosesError: e,
      diagnosesInitialised: true,
      loadingDiagnoses: false,
    }));
};
