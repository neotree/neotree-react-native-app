import React from 'react';
import useRouter from '@/utils/useRouter';
import { useAppContext } from '@/contexts/app';
import { useScriptContext } from '@/contexts/script';
import Value, { defaults } from './Value';

export default props => {
  const router = useRouter();
  const appContext = useAppContext();
  const scriptContext = useScriptContext();

  const [state, setState] = React.useState(defaults.defaultState);

  return new Value({
    props,
    state,
    setState,
    router,
    appContext,
    scriptContext,
  });
};
