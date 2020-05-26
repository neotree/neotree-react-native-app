import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Checkbox from '@/ui/Checkbox';

const YesNo = ({ screen, context }) => {
  const { metadata } = screen.data;

  const _value = context.state.form[screen.id] ? context.state.form[screen.id].form : null;

  const [selected, setSelected] = React.useState(_value || []);

  React.useEffect(() => {
    context.setForm({
      [screen.id]: !selected.length ? undefined : {
        key: metadata ? metadata.key : undefined,
        form: selected,
      }
    });
  }, [selected]);

  return (
    <>
      <View>
        {(metadata.items || []).map((item) => {
          return (
            <React.Fragment key={item.label}>
              <Checkbox
                label={item.label}
                value={item.id}
                checked={selected.indexOf(item.id) > -1}
                onChange={e => {
                  const v = e.value;
                  const exclusives = metadata.items.filter(item => item.exclusive).map(item => item.id);
                  if (item.exclusive) {
                    setSelected(e.checked ? [v] : []);
                  } else {
                    setSelected(selected => {
                      return (e.checked ? [...selected, v] : selected.filter(s => s !== v))
                        .filter(s => exclusives.indexOf(s) < 0);
                    });
                  }
                }}
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
