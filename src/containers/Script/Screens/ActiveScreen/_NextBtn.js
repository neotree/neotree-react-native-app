import React from 'react';
import PropTypes from 'prop-types';
import { useScreensContext } from '@/contexts/screens';
import { Icon } from 'native-base';
import { TouchableOpacity } from 'react-native';
import theme from '@/native-base-theme/variables/commonColor';

const NextBtn = ({ onNext, }) => {
  const {
    goToSummary,
    canSave,
    goToScreen,
  } = useScreensContext();

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          if (canSave()) return goToSummary();
          goToScreen('next');
          if (onNext) onNext();
        }}
        style={[
          {
            backgroundColor: theme.brandInfo,
            height: 50,
            width: 50,
            borderRadius: 25,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            right: 20,
            bottom: 20,
            elevation: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
          }
        ]}
      ><Icon style={{ color: '#fff' }} name="arrow-forward" /></TouchableOpacity>
    </>
  );
};

NextBtn.propTypes = {
  onNext: PropTypes.func,
};

export default NextBtn;