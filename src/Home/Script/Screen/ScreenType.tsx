import React from 'react';
import { ScrollView } from 'react-native';
import { useContext } from '../Context';
import { Box, Content, Text } from '../../../components';
import * as types from '../../../types';

import { TypeForm } from './_TypeForm';
import { TypeChecklist } from './_TypeChecklist';
import { TypeList } from './_TypeList';
import { TypeMultiSelect } from './_TypeMultiSelect';
import { TypeProgress } from './_TypeProgress';
import { TypeSingleSelect } from './_TypeSingleSelect';
import { TypeTimer } from './_TypeTimer';
import { TypeYesNo } from './_TypeYesNo';
import { TypeManagement } from './_TypeManagement';
import { Diagnosis } from './Diagnosis';
import { EdlizSummaryTable } from './EdlizSummaryTable';

type ScreenTypeProps = {
    searchVal: string;
};

export function ScreenType({ searchVal }: ScreenTypeProps) {
    const ctx = useContext();

    const highlightedText = ctx?.activeScreen?.data?.contentText;

    return (
        <ScrollView>
            <>
                {!!highlightedText && (
                    <Box backgroundColor="highlight">
                        <Content>
                            <Text
                                color="primary"
                            >{highlightedText}</Text>
                        </Content>
                    </Box>
                )}

                <Content>
                    {(() => {
                        let Component: null | React.ComponentType<types.ScreenTypeProps> = null;

                        switch (ctx?.activeScreen?.type) {
                            case 'yesno':
                                Component = TypeYesNo;
                                break;
                            case 'checklist':
                                Component = TypeChecklist;
                                break;
                            case 'multi_select':
                                Component = TypeMultiSelect;
                                break;
                            case 'single_select':
                                Component = TypeSingleSelect;
                                break;
                            case 'form':
                                Component = TypeForm;
                                break;
                            case 'timer':
                                Component = TypeTimer;
                                break;
                            case 'progress':
                                Component = TypeProgress;
                                break;
                            case 'management':
                                Component = TypeManagement;
                                break;
                            case 'list':
                                Component = TypeList;
                                break;
                            case 'diagnosis':
                                Component = Diagnosis;
                                break;
                            case 'zw_edliz_summary_table':
                                Component = EdlizSummaryTable;
                                break;
                            case 'mwi_edliz_summary_table':
                                Component = EdlizSummaryTable;
                                break;
                            case 'edliz_summary_table':
                                Component = EdlizSummaryTable;
                                break;
                            default:
                                // do nothing
                        }

                        if (!Component) return null;

                        return <Component searchVal={searchVal} />;
                    })()}
                </Content>
            </>
        </ScrollView>
    );
}
