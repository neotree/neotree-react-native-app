import React from 'react';
import PropTypes from 'prop-types';
import Content from '@/components/Content';
import { Icon } from 'native-base';
import { TouchableOpacity } from 'react-native';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import useBackButton from '@/utils/useBackButton';
import { useHistory } from 'react-router-native';
import { FormAndDiagnosesSummary, Print } from '@/components/Session';

const Wrapper = props => <Content {...props} />;

const Summary = ({ summary }) => {
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
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            <Print session={summary} showConfidential />
          </>
        )}
      />

      <FormAndDiagnosesSummary
        session={summary}
        diagnoses={summary.data.diagnoses}
        Wrapper={Wrapper}
        showConfidential
      />
    </>
  );
};

Summary.propTypes = {
  summary: PropTypes.object.isRequired,
  // clearSummary: PropTypes.func.isRequired
};

export default Summary;
