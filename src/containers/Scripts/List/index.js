import React from 'react';
import { useScriptsContext } from '@/contexts/scripts';
import { View, FlatList } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import { LayoutCard } from '@/components/Layout';
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
        ListHeaderComponent={(
          <LayoutCard style={[styles.header]}>
            <Typography
              variant="h2"
              style={{ fontWeight: 'normal' }}
            >Scripts</Typography>
          </LayoutCard>
        )}
      />
    </View>
  );
};

export default List;
