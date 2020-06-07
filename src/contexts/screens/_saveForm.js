import { saveForm } from '@/api/forms';

export default ({ setState, state: { form, activeScreen } }) => payload =>
  new Promise((resolve, reject) => {
    setState({ savingForm: true });

    const done = (err, rslts) => {
      setState({ savingForm: false });
      if (err) return reject(err);
      resolve(rslts);
    };

    saveForm({ ...payload, data: form, script_id: activeScreen.script_id })
      .then(rslts => done(null, rslts))
      .catch(done);
  });
