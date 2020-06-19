import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { View, FlatList } from 'react-native';
import ListItem from './ListItem';
import Header from './Header';

const List = () => {
  const { state: { sessions, loadingSessions, selectedItems, canSelectItems }, selectItems, getSessions } = useSessionsContext();

  return (
    <>
      <Header />

      <View style={[{ flex: 1 }]}>
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
