import React from 'react';
import { useSessionsContext } from '@/contexts/sessions';
import { ListItem, Text, Right, Left, Radio, Button } from 'native-base';
import Content from '@/components/Content';
import Header from './Header';

const ExportPage = () => {
  const [format, setFormat] = React.useState('excel');

  const opts = [
    { label: 'Excel Spreadsheet', value: 'excel' },
    { label: 'JSON', value: 'json' },
    { label: 'JSONAPI', value: 'jsonapi' },
  ];

  return (
    <>
      <Header />

      <Content padder>
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

        <Button
          block
          disabled={!format}
        >
          <Text>Export</Text>
        </Button>
      </Content>
    </>
  );
};

export default ExportPage;
