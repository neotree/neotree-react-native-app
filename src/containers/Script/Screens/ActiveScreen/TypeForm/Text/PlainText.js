import React from 'react';
import PropTypes from 'prop-types';
import { Input, Form, Item } from 'native-base';
import Text from '@/components/Text';
import { TouchableOpacity } from 'react-native';

const PlainText = ({ field, onChange, value, conditionMet, screens, entry }) => {
  const [error] = React.useState(null);
  const refScreen = screens.filter(s => s.data.metadata && field.refKey && (s.data.metadata.key === field.refKey))[0];
  let opts = [];
  if (refScreen) {
    opts = (refScreen.data.metadata.items || []).map(item => ({
      value: item.id,
      valueText: item.label,
      label: item.label,
      key: refScreen.data.metadata.key,
      type: refScreen.data.metadata.dataType,
      dataType: item.dataType,
      exclusive: item.exclusive,
      confidential: item.confidential,
      screenId: refScreen.id,
    }));
  }

  return (
    <>
      <Form>
        <Text
          style={[
            error ? { color: '#b20008' } : {},
            !conditionMet ? { color: '#999' } : {},
          ]}
        >{field.label}{field.optional ? '' : ' *'}</Text>
        <Item regular error={error ? true : false}>
          <Input
            autoCorrect={false}
            editable={conditionMet}
            value={value || ''}
            defaultValue={value || ''}
            onChange={e => {
              const value = e.nativeEvent.text;
              onChange(value, {
                error,
                valueText: value,
                referencedEntry: opts.filter(o => o.label === value)[0]
              });
            }}
            // placeholder={field.label}
            // label={`${field.label}${field.optional ? '' : ' *'}`}
          />
        </Item>
      </Form>

      {opts
        .filter(o => value ? `${o.label}`.match(new RegExp(value, 'gi')) : false)
        .filter(o => o.key !== field.key)
        .filter(o => entry && !entry.values.filter(v => v.referencedEntry).map(v => v.referencedEntry.key).includes(o.key))
        .map(o => (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.label, {
              valueText: o.label,
            })}
            style={{ paddingVertical: 3 }}
          >
            <Text variant="caption">{o.label}</Text>
          </TouchableOpacity>
        ))}

      {!error ? null : (
        <>
          <Text style={{ color: '#b20008' }}>
            {error}
          </Text>
        </>
      )}
    </>
  );
};

PlainText.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
  screens: PropTypes.arrayOf(PropTypes.object).isRequired,
  entry: PropTypes.object.isRequired,
};

export default PlainText;
