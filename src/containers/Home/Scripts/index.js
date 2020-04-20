import React from 'react';
import { useHomeContext } from '@/contexts/home';
import { View, FlatList } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';
import Script from './Script';

const useStyles = makeStyles(() => ({
  root: {
    flex: 1
  }
}));

const Scripts = () => {
  const { state: { scripts } } = useHomeContext();

  const styles = useStyles();

  return (
    <View style={[styles.root]}>
      <FlatList
        data={scripts}
        renderItem={({ item }) => <Script item={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

export default Scripts;
