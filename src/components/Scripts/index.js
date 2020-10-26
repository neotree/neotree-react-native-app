import React from 'react';
import { View, FlatList, Alert, BackHandler, } from 'react-native';
import * as api from '@/api';
import ListItem from './ListItem';

const Scripts = () => {
  const [scripts, setScripts] = React.useState([]);
  const [loadingScripts, setLoadingScripts] = React.useState(false);

  const getScripts = React.useCallback(() => {
    (async () => {
      setLoadingScripts(true);

      try {
        const scripts = await api.getScripts();
        setScripts(scripts || []);
      } catch (e) {
        Alert.alert(
          'Failed to load scripts',
          e.message || e.msg || JSON.stringify(e),
          [
            {
              text: 'Try again',
              onPress: getScripts,
            },
            {
              text: 'Exit app',
              onPress: () => BackHandler.exitApp(),
              style: 'cancel'
            },
          ]
        )
      }
      setLoadingScripts(false);
    })();
  }, []);

  React.useEffect(() => { getScripts(); }, []);

  return (
    <>
      <View style={{ flex: 1, }}>
        <FlatList
          data={scripts}
          onRefresh={getScripts}
          refreshing={loadingScripts}
          renderItem={({ item }) => <ListItem item={item} />}
          keyExtractor={item => item.id}
        />
      </View>
    </>
  );
};

export default Scripts;
