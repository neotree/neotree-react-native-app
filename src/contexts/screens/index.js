import React from 'react';
import useRouter from '@/utils/useRouter';
import { useAppContext } from '@/contexts/app';
import { useScriptContext } from '@/contexts/script';
import * as defaults from './_defaults';

export const Context = React.createContext(null);

export const useScreensContext = () => React.useContext(Context);

export function provideScreensContext(Component) {
  return function ScreensContextProvider(props) {
    const router = useRouter();
    const { state: { script, diagnoses, } } = useScriptContext();
    const [state, setState] = React.useState(defaults.defaultState);
    const { screensInitialised } = state;
    const { match: { params: { scriptId } } } = router;

    const value = new (class ContextValue {
      constructor() {
        this.defaults = defaults;
        this.state = state;
        this._setState = setState;
        this.router = router;
        this.script = script;
        this.diagnoses = diagnoses;
      }
    
      setState = s => this._setState(prevState => ({
        ...prevState,
        ...(typeof s === 'function' ? s(prevState) : s)
      }));
    
      setForm = s => this._setState(prevState => ({
        ...prevState,
        form: { ...prevState.form, ...typeof s === 'function' ? s(prevState.form) : s }
      }));
    
      onLocationChange = require('./_onLocationChange').default.bind(this);
    
      isLastScreen = () => this.state.activeScreen && (this.state.activeScreen.id === this.getLastScreen().id);
    
      getScreen = require('./_getScreen').default.bind(this);
    
      getLastScreen = require('./_getLastScreen').default.bind(this);
    
      getScreens = require('./_getScreens').default.bind(this);
    
      parseScreenCondition = require('./_parseScreenCondition').default.bind(this);
    
      getDiagnoses = require('./_getDiagnoses').default.bind(this);
    
      canSave = require('./_canSave').default.bind(this);
    
      saveForm = require('./_saveForm').default.bind(this);
    
      getConfiguration = require('./_getConfiguration').default.bind(this);
    
      createSessionSummary = require('./_createSessionSummary').default.bind(this);

      goToSummary = require('./_goToSummary').default.bind(this);

      goToScreen = require('./_goToScreen').default.bind(this);

      initialiseScreens = require('./_initialiseScreens').default.bind(this);
    })();

    // React.useEffect(() => value.onLocationChange(), [screensInitialised, location]);
    React.useEffect(() => value.goToScreen('initial'), [screensInitialised]);
    React.useEffect(() => { value.initialiseScreens(); }, [scriptId]);

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
