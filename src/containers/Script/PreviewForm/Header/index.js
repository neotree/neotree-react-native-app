import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Button, Icon } from 'native-base';
import PrintSessionForm from '@/containers/Sessions/PrintSessionForm';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';

const HeaderComponent = ({ session }) => {
  const history = useHistory();

  const goBack = () => {
    history.entries = [];
    history.push('/');
  };

  useBackButton(() => { goBack(); }, []);

  return (
    <>
      <Header
        title="Summary"
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
