import React from 'react';

export const AppContext = React.createContext(null);

export const useAppContext = () => React.useContext(AppContext);

export const useSocketEventEffect = handler => {
  const { state: { lastSocketEvent } } = useAppContext();
  const ref = React.useRef(false);
  React.useEffect(() => {
    if (ref.current && lastSocketEvent) handler(lastSocketEvent);
    ref.current = true;
  }, [lastSocketEvent]);
};

export default AppContext;
