import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import { LayoutCard } from '@/components/Layout';
import { useParams } from 'react-router-native';
import PageTitle from '@/components/PageTitle';
import PreviewSessionForm from '../PreviewSessionForm';
import PrintSessionForm from '../PrintSessionForm';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1
  },
}));

const SingleView = () => {
  const styles = useStyles();

  const { sessionId } = useParams();

  const { state: { data } } = useSessionsContext();

  const session = data.filter(f => f.id.toString() === sessionId)
    .map(f => f.data.session)[0];

  return (
    <>
      <PageTitle title="Session details">
        <PrintSessionForm form={session.form} />
      </PageTitle>
      <View style={[styles.root]}>
        <PreviewSessionForm Wrapper={LayoutCard} form={session.form} />
      </View>
    </>
  );
};

export default SingleView;
