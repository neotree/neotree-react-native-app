import React from 'react';
import PropTypes from 'prop-types';
import { Picker, Form, Icon, Item } from 'native-base';
import Text from '@/components/Text';

const DropDown = ({ field, onChange, value, conditionMet, }) => {
  const [error] = React.useState(null);

  const opts = (field.values || '').split('\n')
    .map((v = '') => v.trim())
    .filter(v => v)
    .map(v => {
      v = v.split(',');
      return { value: v[0], label: v[1] };
    });

  React.useEffect(() => {
    if (opts[0]) onChange(opts[0].value || '');
  }, []);

  return (
    <>
      <Form>
        <Text
          style={[
            error ? { color: '#b20008' } : {},
            !conditionMet ? { color: '#999' } : {},
          ]}
        >{field.label}</Text>
        <Item regular>
          <Picker
            enabled={conditionMet}
            mode="dialog"
            iosIcon={<Icon name="arrow-down" />}
            placeholder={field.label}
            placeholderStyle={{ color: '#bfc6ea' }}
            placeholderIconColor="#007aff"
            style={{ width: undefined }}
            selectedValue={value}
            onValueChange={v => onChange(v)}
            prompt={field.label}
          >
            {opts.map(opt => (
              <Picker.Item
                key={opt.value}
                label={opt.label}
                value={opt.value}
              />
            ))}
          </Picker>
        </Item>
      </Form>
    </>
  );
};

DropDown.propTypes = {
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default DropDown;
