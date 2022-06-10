import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';
import Text from '@/components/Text';
import { View, TouchableOpacity } from 'react-native';
import ucFirst from '@/utils/ucFirst';
import theme from '~/native-base-theme/variables/commonColor';
import { useContext } from '../../Context';
import setPageOptions from '../../setPageOptions';

const EdlizSummaryTable = (props) => {
    const { canAutoFill, entry: _entry, screen, setEntry: onChange, goNext } = props;
    const value = _entry ? _entry.values.reduce((acc, { value }) => ({ values: [...acc, ...value] }), []) : null;
    const metadata = screen.data.metadata || {};
    const [searchVal, setSearchVal] = React.useState('');

    setPageOptions({
        onSearch: value => setSearchVal(value),
    }, []);

    const [entry, setEntry] = React.useState(value || { values: [] });

    const { state: { autoFill } } = useContext();
 
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
            }),
            autoFill: false,
            });
        }
        } 
    }, [canAutoFill, autoFill, metadata, entry]);

    React.useEffect(() => { autoFillFields(); }, [autoFill]);

    React.useEffect(() => {
        let score = 0;
        if (entry) {
            score = entry.values.reduce((acc, v) => {
                if (v.type === 'major_criteria') acc += 2;
                if (v.type === 'minor_criteria') acc += 1;
                if (screen.type === 'mwi_edliz_summary_table') acc += 1;
                return acc;
            }, 0);
        }
        console.log(score);
        onChange({
            value: [{
                value: score,
                label: metadata.label,
                key: metadata.key,
                type: metadata.dataType ? metadata.dataType : null,
                valueText: score,
            }],
            values: [{
                key: metadata.key,
                type: metadata.dataType,
                value: entry.values,
            }],
        });
    }, [entry]);

    const renderItems = (items = []) => {
        return (
            <Select
                variant="checkbox"
                value={entry.values.map(e => e.value)}
                options={items.map(item => ({
                    label: item.label,
                    value: item.id,
                    hide: searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false,
                }))}
                onChange={(opt, i) => {
                    const { index } = items[i];
                    const item = (metadata.items || [])[index];
                    const checked = entry.values.map(s => s.value).indexOf(item.id) > -1;
                    const value = item.id;
                    const _checked = !checked;

                    const _entry = {
                        value,
                        valueText: item.label,
                        label: item.label,
                        key: item.key,
                        type: item.type,
                        dataType: item.dataType,
                        exclusive: item.exclusive,
                        confidential: item.confidential,
                    };

                    setEntry(entry => {
                        const values = _checked ?
                            [...entry.values, _entry]
                            :
                            entry.values.filter(s => s.value !== value);
                        return {
                            ...entry,
                            values,
                        };
                    });
                }}
            />
        );
    };

    return (
        <>            
            <View style={{ flex: 1 }}>
                {Object.keys(metadata.items.reduce((acc, item) => ({
                    ...acc,
                    [item.type]: [...(acc[item.type] || []), item],
                }), {})).map(type => {
                    return (
                        <React.Fragment key={type}>
                            <Text variant="h5">{ucFirst((type || '').replace(/_/gi, ' '))}</Text>
                            {renderItems((metadata.items || [])
                                .map((item, index) => ({ ...item, index }))
                                .filter(item => item.type === type))}
                        </React.Fragment>
                    );
                })} 
            </View>
        </>
    );
};

EdlizSummaryTable.propTypes = {
  entry: PropTypes.object,
  screen: PropTypes.object.isRequired,
  setEntry: PropTypes.func.isRequired,
  canAutoFill: PropTypes.bool,
};

export default EdlizSummaryTable;
