import React from 'react';
import { useFormsContext } from '@/contexts/forms';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import { LayoutCard } from '@/components/Layout';
import { useParams } from 'react-router-native';
import PageTitle from '@/components/PageTitle';
import FormPreview from '@/components/FormPreview';
import Print from '@/components/Print';
import generateHTML from './generateHTML';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1
  },
}));

const SingleView = () => {
  const styles = useStyles();

  const { formId } = useParams();

  const { state: { data } } = useFormsContext();

  const item = data.filter(f => f.id.toString() === formId)[0];

  return (
    <>
      <PageTitle title="Session details">
        <Print options={{ html: generateHTML(item) }} />
      </PageTitle>
      <View style={[styles.root]}>
        <FormPreview Wrapper={LayoutCard} form={item} />
      </View>
    </>
  );
};

export default SingleView;
