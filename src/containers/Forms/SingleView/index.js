import React from 'react';
import { useFormsContext } from '@/contexts/forms';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import { LayoutCard } from '@/components/Layout';
import { useParams } from 'react-router-native';
import PageTitle from '@/components/PageTitle';
import PreviewForm from '../PreviewForm';
import Print from '../PrintForm';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1
  },
}));

const SingleView = () => {
  const styles = useStyles();

  const { formId } = useParams();

  const { state: { data } } = useFormsContext();

  const form = data.filter(f => f.id.toString() === formId)
    .map(f => f.data.form)[0];

  return (
    <>
      <PageTitle title="Session details">
        <Print form={form} />
      </PageTitle>
      <View style={[styles.root]}>
        <PreviewForm Wrapper={LayoutCard} form={form} />
      </View>
    </>
  );
};

export default SingleView;
