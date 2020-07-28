import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Button, Icon } from 'native-base';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import PrintSessionForm from '../../PrintSessionForm';

const HeaderComponent = ({ session }) => {
  const history = useHistory();

  const goBack = () => {
    history.entries = [];
    history.push('/sessions');
  };

  useBackButton(() => { goBack(); }, []);

  return (
    <>
      <Header
        title="Session details"
        leftActions={(
          <>
            <Button
              transparent
              onPress={() => goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </Button>
          </>
        )}
        rightActions={(
          <>
            <PrintSessionForm session={session} />
          </>
        )}
      />
    </>
  );
};

HeaderComponent.propTypes = {
  session: PropTypes.object.isRequired
};

export default HeaderComponent;
