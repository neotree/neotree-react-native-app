import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, } from 'react-native';
import Divider from '@/components/Divider';
import Text from '@/components/Text';
import { Card, CardItem, Body, Radio, } from 'native-base';
import { useContext } from '../../Context';

const TypeChecklist = ({ screen, entry: value, setEntry: onChange }) => {
  const metadata = screen.data.metadata || {};

  const { state: { autoFill } } = useContext();
  const [entry, setEntry] = React.useState(value || { values: [] });

  const autoFillFields = React.useCallback(() => {
    if (autoFill.session) {
      const keys = metadata.items.map(i => {
        return i.key;
      });
      const entries = autoFill.session.data.entries;
      const autoFillObj = Object.keys(entries).filter(k => keys.includes(k)).map(k => {
        const newEntry = entries[k];
        return {
          key: k,
          dataType: newEntry.type ? newEntry.type : null,
          exclusive: newEntry.exclusive ? newEntry.exclusive : null,
          label: newEntry.values.label[0],
          value: newEntry.values.value[0],
          valueText: newEntry.values.label[0]
        };
      });

      setEntry({
        values: autoFillObj.map(o => ({
          key: o.key,
          value: o.key,
          valueText: o.valueText,
          exclusive: o.exclusive,
          label: o.label,
          dataType: o.dataType
        })),
        autoFill: false,
      });
    }
  }, [autoFill, metadata, entry]);
 
  React.useEffect(() => { autoFillFields(); }, [autoFill]);

  React.useEffect(() => {
    onChange(!entry.values.length ? undefined : entry);
  }, [entry]);
 
  const items = metadata.items || [];
  const exclusiveItems = items.filter(item => item.exclusive).map(item => item.key);

  return (
    <>
      {items.map((item, i) => {
        const key = `${i}`;
        const selected = entry.values.map(e => e.value).includes(item.key);

        const _onChange = (selectValue) => {
          const value = item.key;
          const _entry = {
            value,
            valueText: item.label,
            label: item.label,
            key: metadata.key || item.key,
            type: item.type,
            dataType: item.dataType,
            exclusive: item.exclusive,
          };

          if (!selectValue) {
            return setEntry(entry => ({
              ...entry,
              values: entry.values.filter(s => s.value !== value)
            }));
          }

          if (item.exclusive) return setEntry(entry => ({ ...entry, values: [_entry] }));

          setEntry(entry => ({
            ...entry,
            values: [...entry.values, _entry].filter(e => !e.exclusive)
          }));
        };

        return (
          <React.Fragment key={key}>
            <Card>
              <CardItem>
                <Body>
                  <Text>{item.label}</Text>
                  <View
                    style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1, width: '100%', }}
                  >
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 10, }}
                      onPress={() => _onChange(true)}
                    >
                      <Radio selected={selected} />
                      <Text style={{ marginLeft: 5 }}>Yes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 10, }}
                      onPress={() => _onChange(false)}
                    >
                      <Radio selected={!selected} />
                      <Text style={{ marginLeft: 5 }}>No</Text>
                    </TouchableOpacity>
                  </View>
                </Body>
              </CardItem>
            </Card>

            <Divider border={false} />
          </React.Fragment>
        );
      })}
    </>
  );
};

TypeChecklist.propTypes = {
  screen: PropTypes.object,
  entry: PropTypes.object,
  setEntry: PropTypes.func.isRequired,
};

export default TypeChecklist;
