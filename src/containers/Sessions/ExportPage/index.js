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
  const { exportJSON, exportEXCEL, exportToApi, state: { exporting } } = useSessionsContext();

  const [format, setFormat] = React.useState('excel');

  const opts = [
    { label: 'Excel Spreadsheet', value: 'excel' },
    { label: 'JSON', value: 'json' },
    { label: 'JSONAPI', value: 'jsonapi' },
  ];

  useOverlayLoaderState('exporting_sessions', exporting);

  return (
    <>
      <Header />

      <Content containerProps={{ style: { flex: 1 } }} padder>
        <Card style={{ padding: 20 }}>
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
              }}
            >
              <Text>Export</Text>
            </Button>
          </View>
        </Card>
      </Content>
    </>
  );
};

export default ExportPage;
