import React from 'react';
import { ScrollView } from 'react-native';
import { Box, Dropdown, DropdownOption } from '../../../../components';
import * as types from '../../../../types';
import { DiagnosesList } from './components/DiagnosesList';

type SortPriorityProps = types.DiagnosisSectionProps & {
    
};

export function SortPriority(props: SortPriorityProps) {
    const { setDiagnoses, diagnoses, setOrderBySeverity, } = props;
    const filterCompiled = (d: types.Diagnosis) => d.how_agree !== 'No';

    const [mounted, setMounted] = React.useState(false);
    const [pickerValue, setPickerValue] = React.useState("");

    React.useEffect(() => {
        if (!mounted) setDiagnoses(diagnoses.map((d, i) => ({ ...d, priority: i + 1, })));
        setMounted(true);
      }, [diagnoses, mounted]);

    return (
        <ScrollView>
            <Box>
                <DiagnosesList
                    {...props}
                    divider
                    canAgreeDisagree={false}
                    canDelete={false}
                    title="Compiled Diagnoses"
                    subtitle="Please order the diagnoses by priority"
                    filter={filterCompiled}
                    itemWrapper={((card, { item: d, index: i }) => {
                        // const onChange = (value: any) => setDiagnoses(diagnoses.map((d, index) => index !== i ? d : {
                        //     ...d,
                        //     ...value,
                        // }));

                        // const disablePrimary = !!diagnoses.filter(d => d.isPrimaryProvisionalDiagnosis).length;
                        // const disableSecondary = !!diagnoses.filter(d => d.isSecondaryProvisionalDiagnosis).length;

                        // const onPrimary = () => onChange({ 
                        //     isPrimaryProvisionalDiagnosis: true,
                        //     isSecondaryProvisionalDiagnosis: false, 
                        // });
                        // const onSecondary = () => onChange({ 
                        //     isPrimaryProvisionalDiagnosis: false,
                        //     isSecondaryProvisionalDiagnosis: true, 
                        // });
                        // const onOther = () => onChange({ 
                        //     isPrimaryProvisionalDiagnosis: false,
                        //     isSecondaryProvisionalDiagnosis: false, 
                        // });

                        return (
                            <Box>
                                <Box
                                    flexDirection="row"
                                    alignItems="center"
                                >
                                    <Box flex={1}>{card}</Box>
                                    <Box style={{ width: 110 }}>
                                        <Dropdown
                                            title={d?.name}
                                            placeholder="Move"
                                            options={diagnoses.filter(filterCompiled).map((_, j) => {
                                                const to = j + 1;
                                                if ((to > diagnoses.filter(filterCompiled).length) || (i === j)) return null;
                                                return {
                                                    value: `${j}`,
                                                    label: `Move to position ${to}`,
                                                };
                                            }).filter(o => o) as DropdownOption[]}
                                            value={pickerValue}
                                            onChange={value => {
                                                if (!isNaN(Number(value))) {
                                                    const d = [...diagnoses].filter((_, j) => j === i)[0];
                                                    const items = [...diagnoses].filter((_, j) => j !== i);
                                                    items.splice(Number(value), 0, d);
                                                    setDiagnoses(items.map((d, i) => ({ ...d, priority: i + 1, })));
                                                    setOrderBySeverity(false);
                                                }
                                                setPickerValue('');
                                            }} 
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}
                />
            </Box>
        </ScrollView>
    );
}
