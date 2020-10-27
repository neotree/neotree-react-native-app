import React from 'react';
import PropTypes from 'prop-types';
import PreviewSessionForm from '@/containers/Sessions/PreviewSessionForm';
import Content from '@/components/Content';
import { Icon } from 'native-base';
import { TouchableOpacity } from 'react-native';
import PrintSessionForm from '@/containers/Sessions/PrintSessionForm';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import useBackButton from '@/utils/useBackButton';

const Wrapper = props => <Content {...props} />;

const Summary = ({ summary, clearSummary, }) => {
  useBackButton(() => { clearSummary(); });

  return (
    <>
      <Header
        title="Summary"
        leftActions={(
          <>
            <TouchableOpacity
              transparent
              onPress={() => clearSummary()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
        rightActions={(
          <>
            <PrintSessionForm session={summary} showConfidential />
          </>
        )}
      />

      <PreviewSessionForm
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
  clearSummary: PropTypes.func.isRequired
};

export default Summary;
