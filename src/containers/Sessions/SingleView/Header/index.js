import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-native';
import useBackButton from '@/utils/useBackButton';
import { Icon } from 'native-base';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import { TouchableOpacity } from 'react-native';
import PrintSessionForm from '../../PrintSessionForm';

const HeaderComponent = ({ session, showConfidential, }) => {
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
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            <PrintSessionForm session={session} showConfidential={showConfidential} />
          </>
        )}
      />
    </>
  );
};

HeaderComponent.propTypes = {
  session: PropTypes.object.isRequired,
  showConfidential: PropTypes.bool,
};

export default HeaderComponent;
