import React from 'react';

import { useScriptContext } from '@/src/contexts/script';
import * as types from '../../../../types';
import { ProblemsList } from './components/ProblemsList';
import { ScrollView } from 'react-native';

type SuggestedProblemsProps = types.ProblemSectionProps & {
    
};

export function SuggestedProblems(props: SuggestedProblemsProps) {
    const { activeScreen, } = useScriptContext();

    return (
        <ScrollView>
            <ProblemsList
                {...props}
                divider
                sortable={false}
                title="Suggested Problems"
                canDelete={false}
                // subtitle="Please order the problems by priority"
                filter={d => !d.isHcwProblem && (d.how_agree !== 'No')}
                instructions={activeScreen?.data?.suggestedProblemsInstructions}
                emptyListMessage="No suggested problems"
                scrollable={false}
            />

            <ProblemsList
                {...props}
                divider
                sortable={false}
                canDelete={false}
                title="Problems rejected"
                filter={d => !d.isHcwProblem && (d.how_agree === 'No')}
                scrollable={false}
            />
        </ScrollView>
    );
}
