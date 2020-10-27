import React from 'react';
import * as api from '@/api';
import { View, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useHistory } from 'react-router-native';
import { ListItem, Left, Right, Switch, Icon } from 'native-base';
import Content from '@/components/Content';
import Text from '@/components/Text';
import useBackButton from '@/utils/useBackButton';
import Header from '@/components/Header';
import colorStyles from '@/styles/colorStyles';
import { useSocketEventEffect } from '@/AppContext';

const Configuration = () => {
  const history = useHistory();

  const [configKeys, setConfigKeys] = React.useState([]);
  const [loadingConfigKeys, setLoadingConfigKeys] = React.useState(false);

  const [configuration, setConfiguration] = React.useState({});
  const [, setSavingConfiguration] = React.useState(false);

  const goBack = () => {
    history.entries = [];
    history.push('/');
  };

  useBackButton(() => { goBack(); }, []);

  const getConfigKeys = (opts = {}) => new Promise((resolve, reject) => {
    const { loader } = opts;

    (async () => {
      setLoadingConfigKeys((loader === undefined) || loader);
      try {
        const keys = await api.getConfigKeys();
        setConfigKeys(keys || []);
        resolve(keys || []);
      } catch (e) {
        Alert.alert(
          'Failed to load config keys',
          e.message || e.msg || JSON.stringify(e),
          [
            {
              text: 'Cancel',
              onPress: () => history.push('/'),
              type: 'cancel',
            },
            {
              text: 'Try again',
              onPress: () => getConfigKeys(),
            },
          ]
        );
        reject(e);
      }
      setLoadingConfigKeys(false);
    })();
  });

  const saveConfiguration = params => new Promise((resolve, reject) => {
    const conf = { ...configuration, ...params };
    setConfiguration(conf);
    (async () => {
      setSavingConfiguration(true);
      try {
        const rslts = await api.saveConfiguration(conf);
        resolve(rslts);
      } catch (e) {
        Alert.alert(
          'Failed to save config keys',
          e.message || e.msg || JSON.stringify(e),
          [
            {
              text: 'Cancel',
              onPress: () => {},
              type: 'cancel',
            },
          ]
        );
        reject(e);
      }
      setSavingConfiguration(false);
    })();
  });

  useSocketEventEffect(e => {
    if (['delete_config_keys', 'update_config_keys', 'create_config_keys'].includes(e.name)) {
      getConfigKeys({ loader: false, });
    }
  });

  React.useEffect(() => {
    (async () => {
      setLoadingConfigKeys(true);

      try {
        const conf = await api.getConfiguration();
        setConfiguration({ ...(conf || {}).data });
      } catch (e) { /* Do nothing */ }

      try { await getConfigKeys(); } catch (e) { /* Do nothing */ }
    })();
  }, []);

  return (
    <>
      <Header
        title="Configuration"
        leftActions={(
          <>
            <TouchableOpacity
              onPress={() => goBack()}
            >
              <Icon style={[colorStyles.primaryColor]} name="arrow-back" />
            </TouchableOpacity>
          </>
        )}
      />

      <View style={[{ flex: 1 }]}>
        <FlatList
          data={configKeys}
          onRefresh={getConfigKeys}
          refreshing={loadingConfigKeys}
          renderItem={({ item }) => {
            const selected = !!configuration[item.data.configKey];
            const onPress = () => saveConfiguration({ [item.data.configKey]: !selected });
            return (
              <Content>
                <ListItem selected={false}>
                  <Left>
                    <Text>{item.data.label}</Text>
                  </Left>
                  <Right>
                    <Switch
                      value={selected}
                      onValueChange={() => onPress()}
                    />
                  </Right>
                </ListItem>
              </Content>
            );
          }}
          keyExtractor={item => item.id}
        />
      </View>
    </>
  );
};

export default Configuration;
