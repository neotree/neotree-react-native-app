import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { View, FlatList } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import ListItem from './ListItem';
import Header from './Header';

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1
  },
  header: {
    margin: theme.spacing()
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  selectAllItem: {
    marginLeft: theme.spacing(),
  }
}));

const List = () => {
  const styles = useStyles();

  const { state: { sessions, loadingSessions, selectedItems, canSelectItems }, selectItems, getSessions } = useSessionsContext();

  return (
    <>
      <Header />

      <View style={[styles.root]}>
        <FlatList
          data={sessions}
          onRefresh={getSessions}
          refreshing={loadingSessions}
          renderItem={({ item }) => (
            <ListItem
              selectItems={selectItems}
              canSelectItems={canSelectItems}
              item={item}
              selectedItems={selectedItems}
            />
          )}
          keyExtractor={item => `${item.id}`}
        />
      </View>
    </>
  );
};

export default List;
