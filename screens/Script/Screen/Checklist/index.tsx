import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, Text, Br, View, Radio } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { Entry, EntryValue, ScreenComponentProps } from '../../types';
import { YES, NO } from '@/constants/copy/script';

export function Checklist({
    canAutoFill,
    setEntry: onChange,
}: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen, activeScreenCachedEntry: _entry, autoFill, } = useScriptContext();
    const metadata = { ...activeScreen.data.metadata };

    const value = _entry ? _entry.values.reduce((acc, { value }) => ({ values: [...acc.values, ...value] }), { values: [] }) : null;

    const [entry, setEntry] = React.useState<{ values: any[], autoFill?: boolean }>(value || { values: [] });

    const options = (metadata.items || []).map(item => ({
        label: item.label,
        value: item.id,
        item
    }));

    const autoFillFields = React.useCallback(() => {
        if (canAutoFill && autoFill.session) {
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
    }, [canAutoFill, autoFill, metadata, entry]);
    
    React.useEffect(() => { autoFillFields(); }, [autoFill]);

    React.useEffect(() => {
        onChange(!entry.values.length ? undefined : entry);
    }, [entry]);
    
    const items = metadata.items || [];
    const exclusiveItems = items.filter(item => item.exclusive).map(item => item.key);

    console.log(entry);

    return (
        <>
            {options.map((o, i) => {
                const item = o.item;
                const key = `${i}`;
                const isSelected = entry.values.map(e => e.value).includes(item.key);
        
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
                        <View 
                            variant="elevated"
                            style={{ padding: theme.spacing() }}
                        >
                            <Text>{o.label}</Text>
                            <Br />
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                }}
                            >
                                {[
                                    { value: true, label: YES, checked: isSelected, onChange: () => _onChange(true), },
                                    { value: false, label: NO, checked: !isSelected, onChange: () => _onChange(false), },
                                ].map(o => (
                                    <View key={o.label} mr={theme.spacing(2)}>
                                        <Radio
                                            checked={o.checked}
                                            onChange={o.onChange}
                                        >
                                            <Text>{o.label}</Text>
                                        </Radio>
                                    </View>
                                ))}
                            </View>
                        </View>
                        <Br />
                    </React.Fragment>
                );
            })}
        </>
    );
}
