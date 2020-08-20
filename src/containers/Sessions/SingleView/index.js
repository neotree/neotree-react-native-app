import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { View } from 'react-native';
import Content from '@/components/Content';
import { useParams } from 'react-router-native';
import PreviewSessionForm from '../PreviewSessionForm';
import Header from './Header';

const Wrapper = props => <Content {...props} />;

const SingleView = () => {
  const { sessionId } = useParams();

  const { state: { sessions }, getJSON } = useSessionsContext();

  const session = sessions.filter(f => f.id.toString() === sessionId)[0];

  getJSON(sessions);

  return (
    <>
      <Header session={session} />
      <View style={[{ flex: 1 }]}>
        <PreviewSessionForm
          Wrapper={Wrapper}
          session={session}
        />
      </View>
    </>
  );
};

export default SingleView;
