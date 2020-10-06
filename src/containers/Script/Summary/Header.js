import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-native';
import { Icon } from 'native-base';
import { TouchableOpacity } from 'react-native';
import PrintSessionForm from '@/containers/Sessions/PrintSessionForm';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';

const HeaderComponent = ({ session, }) => {
  const history = useHistory();

  return (
    <>
      <Header
        title="Summary"
        leftActions={(
          <>
            <TouchableOpacity
              transparent
              onPress={() => history.goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            <PrintSessionForm session={session} showConfidential />
          </>
        )}
      />
    </>
  );
};

HeaderComponent.propTypes = {
  session: PropTypes.object.isRequired,
};

export default HeaderComponent;
