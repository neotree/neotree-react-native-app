import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ListItem, Right, Left, Radio, Button } from 'native-base';
import Text from '@/components/Text';
import { CONFIG } from '@/constants';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import { useAppContext } from '@/AppContext';

function SetLocationScreen() {
  const { setState: setAppState } = useAppContext();
  const [country, setCountry] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  return (
    <>
      <View style={{ flex: 1, justifyContent: 'center', }}>
        <Content>
          <Text style={{ textAlign: 'center' }} variant="h3">Set location</Text>

          <Divider border={false} spacing={2} />

          {CONFIG.countries.map(c => {
            return (
              <ListItem
                key={c}
                selected={country === c}
                onPress={() => setCountry(c)}
                disabled={saving}
              >
                <Left>
                  <Text style={{ textTransform: 'capitalize' }}>{c}</Text>
                </Left>
                <Right>
                  <Radio
                    selected={country === c}
                    onPress={() => setCountry(c)}
                    disabled={saving}
                  />
                </Right>
              </ListItem>
            );
          })}

          <Divider border={false} spacing={2} />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            {saving ? <ActivityIndicator /> : (
              <Button
                onPress={() => {
                  (async () => {
                    setSaving(true);

                    setSaving(false);
                    setAppState({ appIsReady: false });
                  })();
                }}
              ><Text>Save</Text></Button>
            )}
          </View>
        </Content>
      </View>
    </>
  );
}

export default SetLocationScreen;
