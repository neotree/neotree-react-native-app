import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Button, Icon } from 'native-base';
import Header from '@/components/Header';
import PrintSessionForm from '../../PrintSessionForm';

const HeaderComponent = ({ form }) => {
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
              <Icon name="arrow-back" />
            </Button>
          </>
        )}
        rightActions={(
          <>
            <PrintSessionForm form={form} />
          </>
        )}
      />
    </>
  );
};

HeaderComponent.propTypes = {
  form: PropTypes.array.isRequired
};

export default HeaderComponent;
