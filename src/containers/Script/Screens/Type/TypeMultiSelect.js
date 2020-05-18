import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Checkbox from '@/ui/Checkbox';

const YesNo = ({ screen, context }) => {
  const { metadata } = screen.data;

  const [form, _setForm] = React.useState({});
  const setForm = s => _setForm(prevState => ({ ...prevState, ...s }));

  React.useEffect(() => {
    context.setForm({
      [screen.id]: !Object.keys(form).length ? undefined : { key: metadata.key, value: form }
    });
  }, [form]);

  return (
    <>
      <View>
        {(metadata.items || []).map((item) => {
          return (
            <React.Fragment key={item.label}>
              <Checkbox
                label={item.label}
                value={item.id}
                checked={form[item.id]}
                onChange={() => setForm({ [item.id]: !form[item.id] })}
              />
            </React.Fragment>
          );
        })}
      </View>
    </>
  );
};

YesNo.propTypes = {
  screen: PropTypes.object,
  context: PropTypes.object.isRequired,
};

export default YesNo;
