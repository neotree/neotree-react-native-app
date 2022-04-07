import React from 'react';
import PropTypes from 'prop-types';
import Select from '@/components/Select';
import Text from '@/components/Text';
import { View, TouchableOpacity } from 'react-native';
import theme from '~/native-base-theme/variables/commonColor';
import { useContext } from '../../Context';
import setPageOptions from '../../setPageOptions';

const EdlizSummaryTable = (props) => {
    const { canAutoFill, entry: _entry, screen, setEntry: onChange, goNext } = props;
    const value = _entry ? _entry.values.reduce((acc, { value }) => ({ values: [...acc, ...value] }), []) : null;
    const metadata = screen.data.metadata || {};
    const [searchVal, setSearchVal] = React.useState('');
    const [activeTab, setActiveTab] = React.useState(0);

    setPageOptions({
        onSearch: value => setSearchVal(value),
        onNext: (activeTab === 0) ? () => setActiveTab(1) : undefined,
    }, [activeTab]);

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
        onChange({
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
                        const score = values.reduce((acc, v) => {
                            if (v.type === 'major_criteria') acc += 2;
                            if (v.type === 'minor_criteria') acc += 1;
                            return acc;
                        }, 0);
                        return {
                            ...entry,
                            values,
                            value: [{
                                value: score,
                                label: metadata.label,
                                key: metadata.key,
                                type: metadata.dataType ? metadata.dataType : null,
                                valueText: score,
                            }]
                        };
                    });
                }}
            />
        );
    };

    return (
        <>
            <View 
                style={{ 
                    flexDirection: 'row', 
                    marginBottom: 10,
                }}
            >
                {[
                    'Major criteria',
                    'Minor criteria'
                ].map((label, i) => (
                    <TouchableOpacity
                        key={label}
                        style={{ 
                            flex: 1,
                            borderBottomWidth: 2, 
                            borderColor: activeTab === i ? theme.brandPrimary : '#ddd',  
                            padding: 10,
                        }}
                        onPress={() => setActiveTab(i)}
                    >
                        <Text
                            style={{
                                // textTransform: 'uppercase',
                                color: activeTab === i ? theme.brandPrimary : '#999',
                                // fontWeight: 'bold',
                                textAlign: 'center',
                            }}
                        >{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            
            <View style={{ flex: 1 }}>
                {(activeTab === 0) && renderItems((metadata.items || [])
                    .map((item, index) => ({ ...item, index }))
                    .filter(item => item.type === 'major_criteria'))}  

                {(activeTab === 1) && renderItems((metadata.items || [])
                    .map((item, index) => ({ ...item, index }))
                    .filter(item => item.type === 'minor_criteria'))}  
            </View>
        </>
    );

//   return (
//     <>
//       <Select
//         variant="checkbox"
//         value={entry.values.map(e => e.value)}
//         options={(metadata.items || []).map(item => ({
//           label: item.label,
//           value: item.id,
//           hide: searchVal ? !`${item.label}`.match(new RegExp(searchVal, 'gi')) : false,
//           disabled: (() => {
//             const exclusive = entry.values.reduce((acc, item) => {
//               if (item.exclusive) acc = item.value;
//               return acc;
//             }, null);
//             return exclusive ? exclusive !== item.id : false;
//           })(),
//         }))}
//         onChange={(opt, i) => {
//           const item = (metadata.items || [])[i];
//           const checked = entry.values.map(s => s.value).indexOf(item.id) > -1;
//           const value = item.id;
//           const _checked = !checked;
//           const exclusives = metadata.items
//             .filter(item => item.exclusive)
//             .map(item => item.id);

//           const _entry = {
//             value,
//             valueText: item.label,
//             label: item.label,
//             key: item.key,
//             type: item.type,
//             dataType: item.dataType,
//             exclusive: item.exclusive,
//             confidential: item.confidential,
//           };

//           if (item.exclusive) {
//             setEntry(entry => {
//               return {
//                 ...entry,
//                 values: _checked ? [_entry] : []
//               };
//             });
//           } else {
//             setEntry(entry => {
//               return {
//                 ...entry,
//                 values: (
//                   _checked ?
//                     [...entry.values, _entry]
//                     :
//                     entry.values.filter(s => s.value !== value)
//                 ).filter(s => exclusives.indexOf(s.value) < 0)
//               };
//             });
//           }
//         }}
//       />
//     </>
//   );
};

EdlizSummaryTable.propTypes = {
  entry: PropTypes.object,
  screen: PropTypes.object.isRequired,
  setEntry: PropTypes.func.isRequired,
  canAutoFill: PropTypes.bool,
};

export default EdlizSummaryTable;
