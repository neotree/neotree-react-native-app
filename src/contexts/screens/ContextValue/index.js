import React from 'react';
import useRouter from '@/utils/useRouter';
import { useScriptContext } from '@/contexts/script';
import { useDiagnosesContext } from '@/contexts/diagnoses';
import Value, { defaults } from './Value';

export default props => {
  const router = useRouter();
  const scriptContext = useScriptContext();
  const diagnosesContext = useDiagnosesContext();
  const { state: { diagnoses } } = useDiagnosesContext();

  const [state, setState] = React.useState(defaults.defaultState);

  return new Value({
    props,
    state,
    setState,
    router,
    diagnoses,
    scriptContext,
    diagnosesContext,
  });
};
