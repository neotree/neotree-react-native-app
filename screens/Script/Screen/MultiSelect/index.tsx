import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, Text, Br, View } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { Entry, EntryValue, ScreenComponentProps } from '../../types';

export function MultiSelect({
    canAutoFill,
    setEntry: onChange,
}: ScreenComponentProps) {
    const theme = useTheme();
    const { activeScreen, activeScreenCachedEntry: _entry, autoFill, } = useScriptContext();
    const metadata = { ...activeScreen.data.metadata };

    const value = _entry ? _entry.values.reduce((acc, { value }) => ({ values: [...acc.values, ...value] }), { values: [] }) : null;

    const [entry, setEntry] = React.useState<{ values: any[], autoFill?: boolean }>(value || { values: [] });

    const options = (activeScreen.data?.metadata.items || []).map(item => ({
        label: item.label,
        value: item.id,
        item
    }));

    const autoFillFields = React.useCallback(() => {
        if (canAutoFill && autoFill.session) {
            const entries = autoFill.session.data.entries[metadata.key];
            if (entries) {
            const autoFillObj = entries.values;
            
            setEntry({
                values: autoFillObj.value.map(v => {
                    return {
                        value: v,
                        label: autoFillObj.label[autoFillObj.label.indexOf(v)],
                        key: metadata.key,
                        type: metadata.dataType ? metadata.dataType : null,
                        valueText: autoFillObj.label[autoFillObj.value.indexOf(v)],
                        confidential: autoFillObj.confidential ? autoFillObj.confidential : false }; 
                    }
                ),
                autoFill: false,
            });
            }
        } 
    }, [canAutoFill, autoFill, metadata, entry]);

    React.useEffect(() => { autoFillFields(); }, [autoFill]);

    React.useEffect(() => {
        onChange(!entry.values.length ? undefined : {
            values: [{
                key: metadata.key,
                type: metadata.dataType,
                value: entry.values,
            }],
        });
    }, [entry]);

    return (
        <>
            {options.map(o => {
                const isSelected = entry.values.map(v => v.value).includes(o.value);
                const exclusive = entry.values.reduce((acc: any, item) => {
                    if (item.exclusive) acc = item.value;
                    return acc;
                }, null);
                const disabled = exclusive ? exclusive !== o.value : false;

                return (
                    <React.Fragment key={o.value}>
                        <View 
                            variant={disabled ? undefined : 'elevated'}
                            style={[
                                !isSelected ? {} : { backgroundColor: theme.palette.primary.main },
                                !disabled ? {} : { backgroundColor: theme.palette.action.disabledBackground },
                            ]}
                        >
                            <TouchableOpacity 
                                disabled={disabled}
                                style={{ padding: theme.spacing(), }}
                                onPress={() => {
                                    const item = o.item;
                                    const checked = entry.values.map(s => s.value).indexOf(item.id) > -1;
                                    const value = item.id;
                                    const _checked = !checked;
                                    const exclusives = metadata.items
                                        .filter(item => item.exclusive)
                                        .map(item => item.id);
                            
                                    const _entry = {
                                        value,
                                        valueText: item.label,
                                        label: item.label,
                                        key: metadata.key,
                                        type: metadata.dataType,
                                        dataType: item.dataType,
                                        exclusive: item.exclusive,
                                        confidential: item.confidential,
                                    };
                            
                                    if (item.exclusive) {
                                        setEntry(entry => {
                                        return {
                                            ...entry,
                                            values: _checked ? [_entry] : []
                                        };
                                        });
                                    } else {
                                        setEntry(entry => {
                                        return {
                                            ...entry,
                                            values: (
                                            _checked ?
                                                [...entry.values, _entry]
                                                :
                                                entry.values.filter(s => s.value !== value)
                                            ).filter(s => exclusives.indexOf(s.value) < 0)
                                        };
                                        });
                                    }
                                }}
                            >
                                <Text
                                    variant="subtitle1"
                                    style={[
                                        { textAlign: 'center' },
                                        !isSelected ? {} : { color: theme.palette.primary.contrastText },
                                        !disabled ? {} : { color: theme.palette.action.disabled },
                                    ]}
                                >{o.label}</Text>
                            </TouchableOpacity>
                        </View>
                        <Br />
                    </React.Fragment>
                );
            })}
        </>
    );
}
