import React from 'react';

import { useScriptContext } from '@/src/contexts/script';
import * as types from '../../../../types';
import { ProblemsList } from './components/ProblemsList';
import { ScrollView } from 'react-native';

type AgreeDisagreeProps = types.ProblemSectionProps & {
    
};

export function AgreeDisagree(props: AgreeDisagreeProps) {
    const { activeScreen, } = useScriptContext();

    return (
        <ScrollView>
            <ProblemsList
                {...props}
                divider={false}
                sortable={false}
                canAgreeDisagree={false}
                canDelete
                title="HCW Problems"
                // subtitle="Please order the problems by priority"
                filter={d => d.isHcwProblem}
                instructions={activeScreen?.data?.hcwProblemsInstructions}
                scrollable={false}
            />

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
