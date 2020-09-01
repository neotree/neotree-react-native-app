import React from 'react';
import Context from './Context';
import useContextValue from './ContextValue';

export * from './Context';

export function provideScreensContext(Component) {
  return function ScreensContextProvider(props) {
    const value = useContextValue(props);

    const { screensInitialised } = value.state;
    const { location, match: { params: { scriptId } } } = value.router;

    React.useEffect(() => value.onLocationChange(), [screensInitialised, location]);
    React.useEffect(() => { value.initialiseScreens(); }, [scriptId]);

    return (
      <Context.Provider value={value}>
        <Component {...props} />
      </Context.Provider>
    );
  };
}
