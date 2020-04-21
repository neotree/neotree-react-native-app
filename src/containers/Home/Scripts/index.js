import React from 'react';
import { useHomeContext } from '@/contexts/home';
import { View, FlatList } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Typography from '@/ui/Typography';
import Script from './Script';

const useStyles = makeStyles(theme => ({
  root: {
    flex: 1
  },
  header: {
    margin: theme.spacing()
  }
}));

const Scripts = () => {
  const { state: { scripts, loadingScripts }, getScripts } = useHomeContext();

  const styles = useStyles();

  return (
    <View style={[styles.root]}>
      <FlatList
        data={scripts}
        onRefresh={getScripts}
        refreshing={loadingScripts}
        renderItem={({ item }) => <Script item={item} />}
        keyExtractor={item => item.id}
        ListHeaderComponent={<Typography style={[styles.header]} variant="h1">Scripts</Typography>}
      />
    </View>
  );
};

export default Scripts;
