import { getDiagnoses } from '@/api/diagnoses';

export default function _getDiagnoses(payload, opts = {}) {
  const {
    setState,
    router: {
      match: { params: { scriptId } }
    }
  } = this;

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
}
