import React from 'react';
import Typography from '@/ui/Typography';
import { useExportDataContext } from '@/contexts/export-data';
import { View, FlatList } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import { LayoutCard } from '@/components/Layout';
import PageTitle from '@/components/PageTitle';
import ListItem from './ListItem';

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1
  },
  header: {
    margin: theme.spacing()
  }
}));

const List = () => {
  const styles = useStyles();

  const { state: { data, loadingData }, getData } = useExportDataContext();

  return (
    <>
      <PageTitle title="Session history" />
      <View style={[styles.root]}>
        <FlatList
          data={data}
          onRefresh={getData}
          refreshing={loadingData}
          renderItem={({ item }) => <ListItem item={item} />}
          keyExtractor={item => item.id}
          ListHeaderComponent={(
            <LayoutCard style={[styles.header]}>
              <Typography
                variant="h2"
                style={{ fontWeight: 'normal' }}
              >Forms</Typography>
            </LayoutCard>
          )}
        />
      </View>
    </>
  );
};

export default List;
