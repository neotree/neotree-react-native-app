import React from 'react';
import NetInfo from '@react-native-community/netinfo';
import Context from './Context';
import * as defaults from './_defaults';

export * from './Context';

export { default as useOverlayLoaderState } from './_useOverlayLoaderState';

export const provideAppContext = Component => function AppContextProvider(props) {
  const [state, _setState] = React.useState(defaults.defaultState);

  const value = new (class ContextValue {
    constructor() {
      this.state = state;
      this._setState = _setState;
      this.defaults = defaults;
      this.props = props;
    }

    setState = s => this._setState(prevState => ({
      ...prevState,
      ...(typeof s === 'function' ? s(prevState) : s)
    }));
  
    loadFonts = require('./_loadFonts').default.bind(this);
  
    initialiseApp = require('./_initialiseApp').default.bind(this);
  
    initialiseData = require('./_initialiseData').default.bind(this);
  
    signIn = require('./_signIn').default.bind(this);
  
    signOut = require('./_signOut').default.bind(this);
  
    getSplashScreenInfo = require('./_getSplashScreenInfo').default.bind(this);
  
    displayOverlayLoader = require('./_displayOverlayLoader').default.bind(this);
  
    sync = require('./_sync').default.bind(this);
  
    addSocketEventsListeners = require('./_addSocketEventsListeners').default.bind(this);
  
    getAuthenticatedUser = require('./_getAuthenticatedUser').default.bind(this);
  
    isDataReady = require('./_isDataReady').default.bind(this);
  })();

  const { sync, setState, state: { authenticatedUser, networkState, } } = value;

  React.useEffect(() => value.initialiseApp(), []);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(s => setState({
      networkState: s,
      networkStateInitialised: true, 
    }));
    return () => unsubscribe();
  }, []);

  React.useEffect(() => { if (authenticatedUser) sync(); }, [networkState]);

  return (
    <Context.Provider
      value={value}
    >
      <Component {...props} />
    </Context.Provider>
  );
};
