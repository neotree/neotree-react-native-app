import { countSessions } from '@/api/sessions';

export default function _countSessions(payload, opts = {}) {
  const {
    setState,
    router: {
      match: { params: { scriptId } }
    }
  } = this;

  setState({
    countSessionsError: null,
    countingSessions: opts.showLoader !== false
  });

  countSessions({ script_id: scriptId, ...payload })
    .then(res => {
      setState({
        uid: `${this.uid_prefix}-${`000${res.count + 1}`.slice(-4)}`,
        sessionsCount: res.count,
        countSessionsError: res.error,
        countingSessions: false,
      });
    })
    .catch(e => setState({
      countSessionsError: e,
      scriptInitialised: true,
      countingSessions: false,
    }));
}
