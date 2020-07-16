import React from 'react';
import PropTypes from 'prop-types';
import { Input, Form, Item } from 'native-base';
import Text from '@/components/Text';
import moment from 'moment';

function diffDays(d1, d2) {
  const diff = d1.getTime() - d2.getTime();
  return Math.round(diff / (1000 * 3600 * 24));
}

function diffHrs(d1, d2) {
  let diff = (d1.getTime() - d2.getTime()) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
}

const Period = ({ form, field, onChange, value, conditionMet, }) => {
  const [error] = React.useState(null);
  const calc = form.values.filter(v => `$${v.key}` === field.calculation)[0];

  const [_value, set_value] = React.useState('');

  React.useEffect(() => {
    if (calc.value) {    
      const days = diffDays(new Date(), new Date(calc.value));
      const hrs = Math.round(diffHrs(new Date(), new Date(calc.value)) % (days ? days * 24 : 1));
  
      const v = [];
      if (days) v.push(`${days} day(s)`);
      v.push(hrs ? `${hrs} hour(s)` : 'Less than an hour');
      
      set_value(v.join(', '));
    }
  }, [calc]);

  React.useEffect(() => { onChange(_value); }, [_value]);
  
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
            autocorrect={false}
            editable={!field.calculation && conditionMet}
            value={_value || ''}
            defaultValue={_value || ''}
            onChange={e => {
              const value = e.nativeEvent.text;
              set_value(value);
            }}
            // placeholder={field.label}
            // label={`${field.label}${field.optional ? '' : ' *'}`}
          />
        </Item>
      </Form>

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

Period.propTypes = {
  form: PropTypes.object.isRequired,
  field: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  conditionMet: PropTypes.bool,
};

export default Period;
