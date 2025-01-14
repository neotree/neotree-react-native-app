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
import { TypeDrugs } from './drugs';
import { EdlizSummaryTable } from './EdlizSummaryTable';

type ScreenTypeProps = {
    searchVal: string;
};

export function ScreenType({ searchVal }: ScreenTypeProps) {
    const {activeScreen,getFieldPreferences,entries} = useContext()||{};
    const highlightedText = activeScreen?.data?.contentText;

    return (
		<>
			{!!highlightedText && (
				<Box backgroundColor="highlight">
					<Content>
						<Text 
                            color="primary"
                            style={getFieldPreferences('contentText')?.style}
                        >{`${highlightedText || ''}`.replace(/^\s+|\s+$/g, '')}</Text>
					</Content>
				</Box>
			)}

			{(() => {
				let Component: null | React.ComponentType<types.ScreenTypeProps> = null;
				let scrollable = true;
				let useContentWidth = true;

				switch (activeScreen?.type) {
					case 'drugs':
						Component = TypeDrugs;
						break;
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
						scrollable = false;
						useContentWidth = false;
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

				let node = !Component ? null : (
					<Component 
						searchVal={searchVal} 
						entry={entries.filter(e => {
							return e.screen.screen_id === activeScreen.screen_id;
						})[0]}
						setEntry={() => {
							
						}}
					/>
				);

				if (useContentWidth) node = <Content>{node}</Content>;

				if (scrollable) node = <ScrollView>{node}</ScrollView>;

				return node;
			})()}
		</>
    );
}
