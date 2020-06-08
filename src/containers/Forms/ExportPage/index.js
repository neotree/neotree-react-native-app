import React from 'react';
import { useFormsContext } from '@/contexts/forms';
import { LayoutCard } from '@/components/Layout';
import PageTitle from '@/components/PageTitle';
import Radio from '@/ui/Radio';
import RadioGroup from '@/ui/RadioGroup';
import Divider from '@/ui/Divider';
import Button from '@/ui/Button';
import { View } from 'react-native';
import makeStyles from '@/ui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  form: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: theme.spacing(),
  },
}));

const ExportPage = () => {
  const [format, setFormat] = React.useState('excel');

  const styles = useStyles();

  return (
    <>
      <PageTitle title="Export" />

      <Divider border={false} spacing={2} />

      <LayoutCard>
        <View style={[styles.form]}>
          <RadioGroup
            name="format"
            value={format}
            onChange={e => setFormat(e.value)}
          >
            <Radio
              value="excel"
              label="Excel Spreadsheet"
            />
            <Radio
              value="json"
              label="JSON"
            />
            <Radio
              value="jsonapi"
              label="JSONAPI"
            />
          </RadioGroup>
        </View>

        <Divider border={false} spacing={2} />

        <Button
          variant="outlined"
          color="secondary"
        >
          Export
        </Button>
      </LayoutCard>
    </>
  );
};

export default ExportPage;
