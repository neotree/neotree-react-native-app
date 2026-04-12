import React, { useCallback, useMemo } from 'react';
import { Alert, TextProps } from 'react-native';

import { useScriptContext } from '@/src/contexts/script';
import { Box } from '../../../../components';
import * as types from '../../../../types';
import { SelectProblems } from './_SelectProblems';
import { AgreeDisagree } from './_AgreeDisagree';
import { SortPriority } from './_SortPriority';
import { FullProblem } from './_FullProblem';
import { SectionContainer } from './section-container';
import { DischargeProblems } from './discharge-problems';
import { SuggestedProblems } from './suggested-problems';

type ProblemProps = types.ScreenTypeProps & {
    
};

const getDefaultProblem = (d?: types.Problem) => ({
    symptoms: [],
    name: '',
    suggested: false,
    priority: null,
    how_agree: null,
    value: null,
    hcw_follow_instructions: null,
    hcw_reason_given: null,
    isPrimaryProvisionalProblem: false,
    isSecondaryProvisionalProblem: false,
    ...d,
});

const problemToEntryValue = (d: types.Problem): types.ScreenEntryValue => {
    const valueText = d.customValue || d.name;
    return {
        label: d.name,
        key: d.key || d.name,
        value: d.customValue || d.key || d.name,
        valueText,
        type: 'problem',
        dataType: 'problem',
        problem: {
            ...getDefaultProblem(),
            ...d,
            value: valueText,
        },
    };
};

export function Problems(props: ProblemProps) {
    const mounted = React.useRef(false);

    const {
        script,
        activeScreenEntry,
        activeScreen,
        goNext: ctxGoNext,
        goBack:ctxGoBack,
        setMoreNavOptions:ctxSetMoreNavOptions,
        getFieldPreferences,
        setEntryValues,
        getSuggestedProblems,
    } = useScriptContext();

    const initialEntries = React.useMemo(() => {
        const suggestedProblems = (getSuggestedProblems() || []) as types.Problem[];
        const allValues = activeScreenEntry?.values || [];
        const suggestedValues = allValues.filter(v => v?.problem?.suggested);
        const hcwValues = allValues.filter(v => v?.problem?.isHcwProblem);

        if (
            JSON.stringify(suggestedProblems.map(p => p?.id).sort((a, b) => a - b)) !==
            JSON.stringify(suggestedValues.map(p => p?.problem?.id).sort((a, b) => a - b))
        ) {
            return [
                ...suggestedProblems
                    .filter(d => !allValues.map(item => item.key).includes(d.key || d.name))
                    .map(d => problemToEntryValue({
                        ...d,
                        suggested: true,
                    })),
                ...hcwValues,
            ];
        }

        return allValues;
    }, [getSuggestedProblems, activeScreenEntry?.values]);

    const isDischarge = (script.type || script.data?.type) === 'discharge';

    const [section, setSection] = React.useState('suggested');
    const [values, setValues] = React.useState<types.ScreenEntryValue[]>(initialEntries);
    const [hcwProblems, setHcwProblems] = React.useState<types.ScreenEntryValue[]>(
		(activeScreenEntry?.values || []).filter(v => v?.problem?.isHcwProblem).map(v => v.problem)
	); // React.useState<types.Problem[]>(ctx.getSuggestedProblems() || []);

    const problems = useMemo(() => values.map(v => v.problem), [values]);
    const acceptedProblems = useMemo(() => problems.filter(d => d.how_agree !== 'No'), [problems]);

    const [activeProblemIndex, setActiveProblemIndex] = React.useState<null | number>(null);

    const [, setOrderBySeverity] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    const setProblems = useCallback((problems: types.Problem[] = []) => {
        const entryValues = problems.map(d => problemToEntryValue(d));
        setValues(entryValues);
        setEntryValues(entryValues);
    }, [setEntryValues]);

    const done = useCallback(() => {
        setEntryValues(values, {
            lastSection: section, 
            lastActiveProblemIndex: activeProblemIndex, 
        });
        ctxGoNext();
    }, [section, activeProblemIndex, setEntryValues, ctxGoNext]);

    const goNext = React.useCallback((opts?: {
        force?: boolean;
    }) => {
        if (isDischarge) {
            done();
            return;
        }

        if ((opts?.force !== true) && !loading) {
            setLoading(true);
            setTimeout(() => goNext({ force: true, }), 500);
            return;
        }

        if (activeProblemIndex === null) {
            const allEntries = [
                ...values,
            ];

            // sort by severyity_order
            let entries = [
                ...allEntries.filter(d => d.problem.severity_order || (d.problem.severity_order === 0))
                    .sort((a, b) => a.problem.severity_order - b.problem.severity_order),
                ...allEntries.filter(d => 
                    (d.problem.severity_order === null) || 
                    (d.problem.severity_order === undefined) || 
                    (d.problem.severity_order === '')
                ),
            ];

            if (section === 'suggested') {
                setValues(entries);
				setEntryValues(entries);
                setSection('select');
            } else if (section === 'select') {
                if (!problems.length) {
                    Alert.alert(
                        'Warning',
                        'Continue without selecting problems?',
                        [
                        {
                            text: 'No',
                            onPress: () => {},
                            style: 'cancel'
                        },
                        {
                            text: 'Yes',
                            onPress: () => {
                                setEntryValues(values);
                                setTimeout(() => done(), 10);
                            },
                            style: 'cancel'
                        },
                        ]
                    );
                } else {
                    setValues(entries);
                    setEntryValues(entries);
                    setSection('sort_priority');
                }
            } else {
                done();   
            }   
        }
    }, [
        loading,
        activeProblemIndex,
        acceptedProblems,
        isDischarge,
        getSuggestedProblems,
        setEntryValues,
        done,
    ]);

    const goBack = useCallback((opts?: {
        force?: boolean;
    }) => {
        if ((opts?.force !== true) && !loading) {
            setLoading(true);
            setTimeout(() => goBack({ force: true, }), 0);
            return;
        }

        if (activeProblemIndex === null) {
            if (section === 'sort_priority') return setSection('select');
            if (section === 'select') return setSection('suggested');
            if (section === 'suggested') ctxGoBack();
        } else {
            const nextIndex = activeProblemIndex - 1;
            if (nextIndex < 0) {
            	setActiveProblemIndex(null);
            } else if (acceptedProblems[nextIndex]) {
            	setActiveProblemIndex(nextIndex);
            }
        }
    }, [
        loading,
        activeProblemIndex,
        acceptedProblems,
        ctxGoBack,
    ]);

    const hideFAB = useMemo(() => {
        let hide = false;
        if ((section === 'agree_disagree') || (section === 'suggested')) {
            hide = !!values.find(v => !v.problem?.how_agree);
        }
        return hide;
    }, [section, values, getSuggestedProblems]);

    const setMoreNavOptions = useCallback(() => {
        ctxSetMoreNavOptions({
            goBack,
            goNext,
            showFAB: !hideFAB,
            hideHeaderRight: false,
            hideSearch: isDischarge || section !== 'select',
            ...(() => {
                let title: undefined | string = undefined;
                let titleStyle: undefined | TextProps['style'] = undefined;

                if (activeProblemIndex !== null) {
                    title = `${acceptedProblems[activeProblemIndex]?.customName || acceptedProblems[activeProblemIndex]?.name}`;
                } else {
                    if (section === 'suggested') {
                        title = `${activeScreen?.data?.title1 || ''}`;
                        titleStyle = getFieldPreferences('title1')?.style;
                    }

                    if (section === 'select') {
                        title = `${activeScreen?.data?.title2 || ''}`;
                        titleStyle = getFieldPreferences('title2')?.style;
                    }

                    if (section === 'sort_priority') {
                        title = `${activeScreen?.data?.title3 || ''}`;
                        titleStyle = getFieldPreferences('title3')?.style;
                    }

                    if (isDischarge) {
                        title = 'Problems';
                    }
                }

                return { title, titleStyle, };
            })(),
        });
    }, [
        hideFAB,
        section,
        activeProblemIndex,
        isDischarge,
        goBack,
        goNext,
        ctxSetMoreNavOptions,
    ]);

    const sectionProps: types.ProblemSectionProps = useMemo(() => ({
        ...props,        
        problems,
        acceptedProblems,
        activeProblemIndex,
        hcwProblems,
        loading,
        setLoading,
        setOrderBySeverity,
        setMoreNavOptions,
        getDefaultProblem,
        setActiveProblemIndex,
        problemToEntryValue,
        setProblems,
        _setHcwProblems: setHcwProblems,
        setHcwProblems: (problems = []) => {
            const entryValues = problems.map(d => problemToEntryValue(d));          
            setHcwProblems(problems);
            const entries = [...entryValues, ...values.filter(d => !problems.map(d => d.name).includes(d.problem.name))];
            setValues(entries);
            setEntryValues(entries);
        },
    }), [
        props,
        problems,
        acceptedProblems,
        activeProblemIndex,
        hcwProblems,
        loading,
        setOrderBySeverity,
        setMoreNavOptions,
        getDefaultProblem,
        setProblems,
        setEntryValues,
    ]);

    React.useEffect(() => { 
        if (!mounted.current) setEntryValues([]); 
        mounted.current = true;
    }, [setEntryValues]);

    React.useEffect(() => { setMoreNavOptions(); }, [setMoreNavOptions]);

    React.useEffect(() => () => ctxSetMoreNavOptions(null), []);

    if (isDischarge) {
        return (
            <SectionContainer {...sectionProps}>
                <DischargeProblems 
                    {...sectionProps}
                />
            </SectionContainer>
        );
    }

    return (
        <Box>
            {activeProblemIndex !== null ? (
                <SectionContainer {...sectionProps} >
                    <FullProblem {...sectionProps} />
                </SectionContainer>
            ) : (
                <>
                    {section === 'suggested' && (
                        <SectionContainer {...sectionProps} >
                            <SuggestedProblems {...sectionProps} />
                        </SectionContainer>
                    )}

                    {section === 'select' && (
                        <SectionContainer {...sectionProps} >
                            <SelectProblems {...sectionProps} />
                        </SectionContainer>
                    )}

                    {section === 'agree_disagree' && (
                        <SectionContainer {...sectionProps} >
                            <AgreeDisagree {...sectionProps} />
                        </SectionContainer>
                    )}

                    {section === 'sort_priority' && (
                        <SectionContainer {...sectionProps} >
                            <SortPriority {...sectionProps} />
                        </SectionContainer>
                    )}
                </>
            )}
        </Box>
    );
}
