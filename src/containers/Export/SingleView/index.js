import React from 'react';
import { useExportDataContext } from '@/contexts/export-data';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import { LayoutCard } from '@/components/Layout';
import { useParams } from 'react-router-native';
import PageTitle from '@/components/PageTitle';
import FormPreview from '@/components/FormPreview';
import Print from '@/components/Print';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1
  },
}));

const SingleView = () => {
  const styles = useStyles();

  const { formId } = useParams();

  const { state: { data } } = useExportDataContext();

  const item = data.filter(f => f.id.toString() === formId)[0];

  return (
    <>
      <PageTitle title="Session details">
        <Print options={{ html: '<h1>Hello world</h1>' }} />
      </PageTitle>
      <View style={[styles.root]}>
        <FormPreview Wrapper={LayoutCard} form={item} />
      </View>
    </>
  );
};

export default SingleView;
