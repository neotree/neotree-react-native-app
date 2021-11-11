import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme, Text, Br, View } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { Entry, ScreenComponentProps } from '../../types';

export function SingleSelect({
    canAutoFill,
    setEntry: onChange,
}: ScreenComponentProps) {
    const theme = useTheme();
    const { 
        autoFill,
        activeScreen, 
        activeScreenEntry: value, 
    } = useScriptContext();
    const metadata = { ...activeScreen.data.metadata };
    console.log(value);

    const [entry, _setEntry] = React.useState<Partial<Entry>>(value || { values: [] });
    const setEntry = item => _setEntry({
        values: [{
        value: item.id,
        valueText: item.label,
        label: item.label,
        key: metadata.key,
        type: item.type,
        dataType: metadata.dataType,
        confidential: item.confidential,
        }]
    });

    React.useEffect(() => {
        onChange(!entry.values.length ? undefined : entry);
    }, [entry]);

    const options = (metadata.items || []).map(item => ({
        label: item.label,
        value: item.id,
        item,
    }));

    const autoFillFields = React.useCallback(() => {
        if (autoFill.session && canAutoFill) {
            const autoFillObj = autoFill.session.data.entries[metadata.key];
            let autoFillVal = null;
            if (autoFillObj) {
            autoFillVal = autoFillObj.values.value[0];
            if ((autoFillVal !== null) || (autoFillVal !== undefined)) autoFillVal = autoFillVal.toString();
            const opt = options.filter(o => o.value === autoFillVal)[0];
            if (opt) setEntry({ ...opt, value: autoFillVal, });
            }
        }
    }, [options, canAutoFill, autoFill, metadata, entry]);

    React.useEffect(() => { autoFillFields(); }, [autoFill]);

    return (
        <>
            {options.map(o => {
                const isSelected = entry.values.map(v => v.value).includes(o.value);
                return (
                    <React.Fragment key={o.value}>
                        <View 
                            variant="elevated"
                            style={[
                                !isSelected ? {} : { backgroundColor: theme.palette.primary.main },
                            ]}
                        >
                            <TouchableOpacity 
                                style={{ padding: theme.spacing(), }}
                                onPress={() => setEntry(o.item)}
                            >
                                <Text
                                    variant="subtitle1"
                                    style={[
                                        { textAlign: 'center' },
                                        !isSelected ? {} : { color: theme.palette.primary.contrastText },
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
