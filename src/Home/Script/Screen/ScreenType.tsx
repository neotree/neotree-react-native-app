import React from 'react';
import { ScrollView } from 'react-native';
import { useContext } from '../Context';
import { Box, Content, Text } from '../../../components';

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

};

export function ScreenType({}: ScreenTypeProps) {
    const ctx = useContext();

    return (
        <ScrollView>
            <>
                {!!ctx?.activeScreen?.data?.actionText && (
                    <Box backgroundColor="primary">
                        <Content>
                            <Box 
                                flexDirection="row"                            
                            >
                                <Box flex={1}>
                                    <Text
                                        color="primaryContrastText"
                                    >{ctx?.activeScreen?.data?.actionText}</Text>
                                </Box>

                                {!!ctx?.activeScreen?.data?.step && (
                                    <Box>
                                        <Text
                                            color="primaryContrastText"
                                        >{ctx?.activeScreen?.data?.step}</Text>
                                    </Box>
                                )}
                            </Box>
                        </Content>
                    </Box>
                )}

                {!!ctx?.activeScreen?.data?.instructions && (
                    <Box backgroundColor="highlight">
                        <Content>
                            <Text
                                color="primary"
                            >{ctx?.activeScreen?.data?.instructions}</Text>
                        </Content>
                    </Box>
                )}

                {(() => {
                    let Component: null | React.ComponentType = null;

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

                    return <Component />;
                })()}
            </>
        </ScrollView>
    );
}
