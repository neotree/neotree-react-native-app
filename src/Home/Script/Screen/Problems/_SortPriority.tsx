import React from 'react';
import { ScrollView } from 'react-native';
import { Box, Dropdown, DropdownOption } from '../../../../components';
import * as types from '../../../../types';
import { ProblemsList } from './components/ProblemsList';

type SortPriorityProps = types.ProblemSectionProps & {
    
};

export function SortPriority(props: SortPriorityProps) {
    const { setProblems, problems, setOrderBySeverity, } = props;
    const filterCompiled = (d: types.Problem) => d.how_agree !== 'No';

    const [mounted, setMounted] = React.useState(false);
    const [pickerValue, setPickerValue] = React.useState("");

    React.useEffect(() => {
        if (!mounted) setProblems(problems.map((d, i) => ({ ...d, priority: i + 1, })));
        setMounted(true);
      }, [problems, mounted]);

    return (
        <ScrollView>
            <Box>
                <ProblemsList
                    {...props}
                    divider
                    canAgreeDisagree={false}
                    canDelete={false}
                    title="Compiled Admission Problems"
                    subtitle="Please order the problems by priority"
                    filter={filterCompiled}
                    itemWrapper={((card, { item: d, index: i }) => {
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
                                            options={problems.filter(filterCompiled).map((_, j) => {
                                                const to = j + 1;
                                                if ((to > problems.filter(filterCompiled).length) || (i === j)) return null;
                                                return {
                                                    value: `${j}`,
                                                    label: `Move to position ${to}`,
                                                };
                                            }).filter(o => o) as DropdownOption[]}
                                            value={pickerValue}
                                            onChange={value => {
                                                if (!isNaN(Number(value))) {
                                                    const d = [...problems].filter((_, j) => j === i)[0];
                                                    const items = [...problems].filter((_, j) => j !== i);
                                                    items.splice(Number(value), 0, d);
                                                    setProblems(items.map((d, i) => ({ ...d, priority: i + 1, })));
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
