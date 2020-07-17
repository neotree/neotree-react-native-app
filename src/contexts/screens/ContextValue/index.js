import getScreens from './_getScreens';
import parseScreenCondition from './_parseScreenCondition';
import canSave from './_canSave';
import saveForm from './_saveForm';
import getConfiguration from './_getConfiguration';
import getScreen from './_getScreen';
import getScreenLink from './_getScreenLink';
import getLastScreen from './_getLastScreen';

export default class ContextValue {
  constructor({ 
    state, 
    setState, 
    router,  
    diagnoses,
    script,
  }) {
    this.state = state;
    this._setState = setState;
    this.router = router;
    this.script = script;
    this.diagnoses = diagnoses;
  };

  setState = s => this._setState(
    typeof s === 'function' ? s : prevState => ({ ...prevState, ...s })
  );

  setForm = s => this._setState(prevState => ({
    ...prevState,
    form: { ...prevState.form, ...typeof s === 'function' ? s(prevState.form) : s }
  }));

  initialisePage = () => {
    this.getScreens();
    this.getConfiguration();
  };

  canGoToNextScreen = () => {
    if (!this.getScreenLink('next')) return false;
    if (!this.state.form.filter(({ screen }) => screen.id === this.state.activeScreen.id)[0]) return false;
    return true;
  };

  canGoToPrevScreen = () => !!this.getScreenLink('back');

  isLastScreen = () => this.state.activeScreen && (this.state.activeScreen.id === this.getLastScreen().id); 

  getScreen = getScreen.bind(this);
  getScreenLink = getScreenLink.bind(this);
  getLastScreen = getLastScreen.bind(this);   
  getScreens = getScreens.bind(this);
  parseScreenCondition = parseScreenCondition.bind(this);
  canSave = canSave.bind(this);
  saveForm = saveForm.bind(this);
  getConfiguration = getConfiguration.bind(this);
}
