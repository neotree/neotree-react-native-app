import React from 'react';
import Typography from '@/ui/Typography';
import { useExportDataContext } from '@/contexts/export-data';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import { LayoutCard } from '@/components/Layout';
import { useParams } from 'react-router-native';
import PageTitle from '@/components/PageTitle';

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
      <PageTitle title="Session details" />
      <View style={[styles.root]}>
        <LayoutCard>
          {item.data.form.map(({ entry }) => {
            return (
              <View key={id}>
                
              </View>
            );
          })}
        </LayoutCard>
      </View>
    </>
  );
};

export default SingleView;
