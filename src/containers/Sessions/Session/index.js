import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Content from '@/components/Content';
import { useParams, useHistory } from 'react-router-native';
import { Icon } from 'native-base';
import useBackButton from '@/utils/useBackButton';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import PrintSessionForm from '../PrintSessionForm';
import PreviewSessionForm from '../PreviewSessionForm';
import { useSessionsContext } from '../SessionsContext';

const Wrapper = props => <Content {...props} />;

const Session = () => {
  const history = useHistory();
  const { sessionId } = useParams();
  const { sessions } = useSessionsContext();
  const [showConfidential, setShowConfidential] = React.useState(false);
  const session = sessions.filter(f => f.id.toString() === sessionId)[0];

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
              style={{ paddingHorizontal: 10 }}
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
      <View style={[{ flex: 1 }]}>
        <PreviewSessionForm
          Wrapper={Wrapper}
          session={session}
          onShowConfidential={() => setShowConfidential(true)}
          showConfidential={showConfidential}
        />
      </View>
    </>
  );
};

export default Session;