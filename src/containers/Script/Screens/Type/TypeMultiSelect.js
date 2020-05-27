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
        {(metadata.items || [])
          .map((item) => {
            return (
              <React.Fragment key={item.label}>
                <Checkbox
                  label={item.label}
                  value={item.id || item.key}
                  checked={selected.map(s => s.value).indexOf(item.id || item.key) > -1}
                  onChange={e => {
                    const value = e.value;
                    const exclusives = metadata.items
                      .filter(item => item.exclusive)
                      .map(item => item.id || item.key);
                    if (item.exclusive) {
                      setSelected(e.checked ? [{ value }] : []);
                    } else {
                      setSelected(selected => {
                        return (
                          e.checked ?
                            [...selected, { value, id: item.id, key: item.key }]
                            :
                            selected.filter(s => s.value !== value)
                        ).filter(s => exclusives.indexOf(s.value) < 0);
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
