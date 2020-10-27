import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { View } from 'react-native';
import Content from '@/components/Content';
import { useParams } from 'react-router-native';
import PreviewSessionForm from '../PreviewSessionForm';
import Header from './Header';

const Wrapper = props => <Content {...props} />;

const Session = () => {
  const { sessionId } = useParams();

  const { state: { sessions, showConfidential, }, setState, } = useSessionsContext();

  const session = sessions.filter(f => f.id.toString() === sessionId)[0];

  React.useEffect(() => { 
    return () => setState({ showConfidential: false }); 
  }, []);

  return (
    <>
      <Header session={session} showConfidential={showConfidential} />
      <View style={[{ flex: 1 }]}>
        <PreviewSessionForm
          Wrapper={Wrapper}
          session={session}
          onShowConfidential={() => setState({ showConfidential: true })}
          showConfidential={showConfidential}
        />
      </View>
    </>
  );
};

export default Session;
