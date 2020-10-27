import React from 'react';
import { View, FlatList, Alert, BackHandler, } from 'react-native';
import * as api from '@/api';
import { Link } from 'react-router-native';
import { Body, Card, CardItem } from 'native-base';
import Text from '@/components/Text';
import Content from '@/components/Content';
import { useSocketEventEffect } from '@/AppContext';

const Scripts = () => {
  const [scripts, setScripts] = React.useState([]);
  const [loadingScripts, setLoadingScripts] = React.useState(false);

  const getScripts = React.useCallback((opts = {}) => {
    const { loader } = opts;

    (async () => {
      setLoadingScripts((loader === undefined) || loader);

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
        );
      }
      setLoadingScripts(false);
    })();
  }, []);

  React.useEffect(() => { getScripts(); }, []);

  useSocketEventEffect(e => {
    if (['delete_scripts', 'update_scripts', 'create_scripts'].includes(e.name)) {
      getScripts({ loader: false, });
    }
  });

  return (
    <>
      <View style={{ flex: 1, }}>
        <FlatList
          data={scripts}
          onRefresh={getScripts}
          refreshing={loadingScripts}
          renderItem={({ item }) => (
            <Content>
              <Link
                to={`/script/${item.script_id}`}
              >
                <Card>
                  <CardItem>
                    <Body>
                      <Text>{item.data.title}</Text>
                      <Text style={{ color: '#999', marginTop: 8 }}>{item.data.description}</Text>
                    </Body>
                  </CardItem>
                </Card>
              </Link>
            </Content>
          )}
          keyExtractor={item => item.id}
        />
      </View>
    </>
  );
};

export default Scripts;
