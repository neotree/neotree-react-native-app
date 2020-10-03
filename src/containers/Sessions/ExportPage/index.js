import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { useOverlayLoaderState } from '@/contexts/app';
import { ListItem, Right, Left, Radio, Button, Card, } from 'native-base';
import { View } from 'react-native';
import Text from '@/components/Text';
import Content from '@/components/Content';
import Divider from '@/components/Divider';
import Header from './Header';

const ExportPage = () => {
  const { exportJSON, exportEXCEL, exportToApi,exportToEhr, state: { exporting } } = useSessionsContext();

  const [format, setFormat] = React.useState('excel');

  const opts = [
    { label: 'Excel Spreadsheet', value: 'excel' },
    { label: 'JSON', value: 'json' },
    { label: 'JSONAPI', value: 'jsonapi' },
    { label: 'EHR', value: 'ehr' },
  ];

  useOverlayLoaderState('exporting_sessions', exporting);

  return (
    <>
      <Header />

      <Content containerProps={{ style: { flex: 1 } }}>
        <View 
          style={{ 
            padding: 20,
          }}
        >
          {opts.map(opt => (
            <ListItem
              key={opt.value}
              selected={format === opt.value}
              onPress={() => setFormat(opt.value)}
            >
              <Left>
                <Text>{opt.label}</Text>
              </Left>
              <Right>
                <Radio
                  selected={format === opt.value}
                  onPress={() => setFormat(opt.value)}
                />
              </Right>
            </ListItem>
          ))}

          <Divider border={false} spacing={2} />

          <View style={{ alignItems: 'flex-end' }}>
            <Button
              disabled={!format}
              onPress={() => {
                if (format === 'excel') return exportEXCEL();
                if (format === 'json') return exportJSON();
                if (format === 'jsonapi') return exportToApi();
                if (format === 'ehr') return exportToEhr();
              }}
            >
              <Text>Export</Text>
            </Button>
          </View>
        </View>
      </Content>
    </>
  );
};

export default ExportPage;
