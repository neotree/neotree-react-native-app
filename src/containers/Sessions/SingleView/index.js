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

  const { state: { sessions } } = useSessionsContext();

  const session = sessions.filter(f => f.id.toString() === sessionId).map(s => s.data)[0];
  const form = session ? session.form : null;
  const scriptId = session ? session.script.id : null;

  return (
    <>
      <Header form={form} />
      <View style={[{ flex: 1 }]}>
        <PreviewSessionForm scriptId={scriptId} Wrapper={Wrapper} form={form} />
      </View>
    </>
  );
};

export default SingleView;
