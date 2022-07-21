import React from 'react';
import PropTypes from 'prop-types';
import { MaterialIcons } from '@expo/vector-icons';
import Fab from '@/components/Fab';
import { useContext } from '../../Context';

export default function FloatingButton({
  activeScreenEntry,
  summary,
  goNext,
  onPress,
}) {
  const { state: { pageOptions } } = useContext();
  const [hide, setHide] = React.useState(false);

  React.useEffect(() => { 
    if (hide) {
      if (pageOptions && pageOptions.onNext) {
        pageOptions.onNext(goNext);
      } else {
        goNext();
      }
      if (onPress) onPress();
      setTimeout(() => setHide(false), 50); 
    }
  }, [hide, pageOptions]);

  if (hide || (pageOptions && pageOptions.hideFAB)) return null;

  return (
    <>
      {!!activeScreenEntry && (
        <Fab
          onPress={() => { setHide(true); }}
        ><MaterialIcons size={24} color="black" style={{ color: '#fff' }} name={summary ? 'check' : 'arrow-forward'} /></Fab>
      )}
    </>
  );
}

FloatingButton.propTypes = {
  activeScreenEntry: PropTypes.object,
  summary: PropTypes.object,
  goNext: PropTypes.func.isRequired,
  onPress: PropTypes.func,
};
