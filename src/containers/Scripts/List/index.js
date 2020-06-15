import React from 'react';
import { useScriptsContext } from '@/contexts/scripts';
import { View, FlatList } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import ListItem from './ListItem';

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1,
  },
  header: {
    margin: theme.spacing()
  }
}));

const List = () => {
  const { state: { scripts, loadingScripts }, getScripts } = useScriptsContext();

  const styles = useStyles();

  return (
    <View style={[styles.root]}>
      <FlatList
        data={scripts}
        onRefresh={getScripts}
        refreshing={loadingScripts}
        renderItem={({ item }) => <ListItem item={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default List;
