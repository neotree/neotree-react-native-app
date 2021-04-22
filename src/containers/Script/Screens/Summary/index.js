import React from 'react';
import PropTypes from 'prop-types';
import PreviewSessionForm from '@/containers/Sessions/PreviewSessionForm';
import Content from '@/components/Content';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import PrintSessionForm from '@/containers/Sessions/PrintSessionForm';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import useBackButton from '@/utils/useBackButton';
import { useHistory } from 'react-router-native';

const SummaryPage = props => {
  const [diagnoses, setDiagnoses] = React.useState([]);
  const [session, setSession] = React.useState(null);

  const _props = { ...props, session, setSession, diagnoses, setDiagnoses, };

  if (!session) return <Diagnoses {..._props} />;

  createSessionSummary();

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
  // clearSummary: PropTypes.func.isRequired
};

export default SummaryPage;
