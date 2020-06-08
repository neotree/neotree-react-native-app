import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import Checkbox from '@/ui/Checkbox';

const Checklist = ({ screen, value, onChange }) => {
  const metadata = screen.data.metadata || {};

  const [entry, setEntry] = React.useState(value || { value: [] });

  React.useEffect(() => {
    onChange(!entry.value.length ? undefined : entry);
  }, [entry]);

  return (
    <>
      <View>
        {(metadata.items || [])
          .map((item) => {
            return (
              <React.Fragment key={item.label}>
                <Checkbox
                  label={item.label}
                  value={item.key}
                  checked={entry.value.map(s => s.value).indexOf(item.key) > -1}
                  onChange={e => {
                    const value = e.value;
                    const exclusives = metadata.items
                      .filter(item => item.exclusive)
                      .map(item => item.key);
                    if (item.exclusive) {
                      setEntry(entry => {
                        return {
                          ...entry,
                          value: e.checked ? [{ value, item }] : []
                        };
                      });
                    } else {
                      setEntry(entry => {
                        return {
                          ...entry,
                          value: (
                            e.checked ?
                              [...entry.value, { value, item }]
                              :
                              entry.value.filter(s => s.value !== value)
                          ).filter(s => exclusives.indexOf(s.value) < 0)
                        };
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

Checklist.propTypes = {
  screen: PropTypes.object,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
};

export default Checklist;
