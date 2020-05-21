import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Checkbox from '@/ui/Checkbox';

const YesNo = ({ screen, context }) => {
  const { metadata } = screen.data;

  const { setForm, state: { form } } = context;

  const [localForm, _setLocalForm] = React.useState({});
  const setLocalForm = s => _setLocalForm(prevState => ({ ...prevState, ...s }));

  React.useEffect(() => {
    setForm({
      [screen.id]: !Object.keys(localForm).length ? undefined : {
        key: metadata ? metadata.key : undefined,
        localForm: null,
      }
    });
  }, [localForm]);

  return (
    <>
      <View>
        {(metadata.items || []).map((item) => {
          return (
            <React.Fragment key={item.label}>
              <Checkbox
                label={item.label}
                value={item.id}
                checked={localForm[item.id]}
                onChange={() => setLocalForm({ [item.id]: !localForm[item.id] })}
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
