import React from 'react';
import PropTypes from 'prop-types';
import { ScreenFormFieldComponentProps } from '../../types';

export const Field = ({ 
    onChange, 
    setCache, 
    value, 
    valueCache, 
    children, 
    conditionMet 
}: Partial<ScreenFormFieldComponentProps> & { valueCache: any; children: React.ReactNode; setCache?: (value: any) => void; }) => {
  const ref = React.useRef({ mounted: false });

  React.useEffect(() => {
    if (!conditionMet) {
      setCache(value);
      onChange(null);
    } else {
      onChange(valueCache);
    }
  }, [conditionMet]);

  React.useEffect(() => { ref.current.mounted = true; }, []);

  if (!ref.current.mounted) return null;

  return (
    <>
      {children}
    </>
  );
};
