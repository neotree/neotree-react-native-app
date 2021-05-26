import React from 'react';
import PropTypes from 'prop-types';
import Content from '@/components/Content';
import { TouchableOpacity } from 'react-native';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import useBackButton from '@/utils/useBackButton';
import { useHistory } from 'react-router-native';
import { FormAndDiagnosesSummary, Print } from '@/components/Session';
import { MaterialIcons } from '@expo/vector-icons';
import Fab from '@/components/Fab';

const Wrapper = props => <Content {...props} />;

const Summary = ({ savedSession }) => {
  const history = useHistory();
  useBackButton(() => { history.push('/'); });

  return (
    <>
      <Header
        title="Summary"
        leftActions={(
          <>
            <TouchableOpacity
              style={{ padding: 10 }}
              onPress={() => history.push('/')}
            >
              <MaterialIcons size={24} color="black" style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            <Print session={savedSession} showConfidential />
          </>
        )}
      />

      <FormAndDiagnosesSummary
        session={savedSession}
        Wrapper={Wrapper}
        showConfidential
      />

      <Fab onPress={() => history.push('/')}>
        <MaterialIcons size={24} color="black" style={{ color: '#fff' }} name="check" />
      </Fab>
    </>
  );
};

Summary.propTypes = {
  savedSession: PropTypes.object.isRequired,
  // clearSummary: PropTypes.func.isRequired
};

export default Summary;
