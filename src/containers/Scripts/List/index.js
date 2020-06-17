import React from 'react';
import { useScriptsContext } from '@/contexts/scripts';
import { View, FlatList } from 'react-native';
import ListItem from './ListItem';

const List = () => {
  const { state: { scripts, loadingScripts }, getScripts } = useScriptsContext();

  return (
    <View style={[{ flex: 1 }]}>
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
