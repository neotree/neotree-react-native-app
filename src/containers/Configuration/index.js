import React from 'react';
import { provideConfigKeysContext, useConfigKeysContext } from '@/contexts/config_keys';
import { View, FlatList } from 'react-native';
import Header from './Header';
import ListItem from './ListItem';

const Configuration = () => {
  const { state: { config_keys, loadingConfigKeys }, getConfigKeys } = useConfigKeysContext();

  return (
    <>
      <Header />

      <View style={[{ flex: 1 }]}>
        <FlatList
          data={config_keys}
          onRefresh={getConfigKeys}
          refreshing={loadingConfigKeys}
          renderItem={({ item }) => <ListItem item={item} />}
          keyExtractor={item => item.id}
        />
      </View>
    </>
  );
};

export default provideConfigKeysContext(Configuration);
