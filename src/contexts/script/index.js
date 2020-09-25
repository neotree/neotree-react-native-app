import React from 'react';
import useRouter from '@/utils/useRouter';
import * as defaults from './_defaults';

export const Context = React.createContext(null);

export const useScriptContext = () => React.useContext(Context);

export function provideScriptContext(Component) {
  return function ScriptContextProvider(props) {
    const router = useRouter();
    const [state, setState] = React.useState(defaults.defaultState);
    const { match: { params: { scriptId } } } = router;

    const value = new (class ContextValue {
      constructor() {
        this.defaults = defaults;
        this.state = state;
        this._setState = setState;
        this.router = router;
      }
    
      setState = s => this._setState(prevState => ({
        ...prevState,
        ...(typeof s === 'function' ? s(prevState) : s)
      }));
    
      getScript = require('./_getScript').default.bind(this);
    
      getDiagnoses = require('./_getDiagnoses').default.bind(this);
    
      initialiseScript = require('./_initialiseScript').default.bind(this);
    })();

    React.useEffect(() => { value.initialiseScript(); }, [scriptId]);

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
