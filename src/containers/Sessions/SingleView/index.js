import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { View } from 'react-native';
import { Content } from 'native-base';
import { useParams } from 'react-router-native';
import PreviewSessionForm from '../PreviewSessionForm';
import Header from './Header';

const Wrapper = props => <Content {...props} padder />;

const SingleView = () => {
  const { sessionId } = useParams();

  const { state: { sessions } } = useSessionsContext();

  const form = sessions.filter(f => f.id.toString() === sessionId)
    .map(f => f.data.form)[0];

  return (
    <>
      <Header form={form} />
      <View style={[{ flex: 1 }]}>
        <PreviewSessionForm Wrapper={Wrapper} form={form} />
      </View>
    </>
  );
};

export default SingleView;
