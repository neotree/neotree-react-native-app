import React, { useCallback, useMemo } from 'react';
import { Alert, TextProps } from 'react-native';

import { useScriptContext } from '@/src/contexts/script';
import { Box } from '../../../../components';
import * as types from '../../../../types';
import { SelectDiagnoses } from './_SelectDiagnoses';
import { AgreeDisagree } from './_AgreeDisagree';
import { SortPriority } from './_SortPriority';
import { FullDiagnosis } from './_FullDiagnosis';
import { SectionContainer } from './section-container';

type DiagnosisProps = types.ScreenTypeProps & {
    
};

const getDefaultDiagnosis = (d?: types.Diagnosis) => ({
    symptoms: [],
    name: '',
    suggested: false,
    priority: null,
    how_agree: null,
    hcw_follow_instructions: null,
    hcw_reason_given: null,
    isPrimaryProvisionalDiagnosis: false,
    isSecondaryProvisionalDiagnosis: false,
    ...d,
});

const diagnosisToEntryValue = (d: types.Diagnosis): types.ScreenEntryValue => ({
    label: d.name,
    key: d.key || d.name,
    value: d.customValue || d.key || d.name,
    valueText: d.customValue || d.name,
    type: 'diagnosis',
    dataType: 'diagnosis',
    diagnosis: {
        ...getDefaultDiagnosis(),
        ...d,
    },
});

export function Diagnosis(props: DiagnosisProps) {
    const mounted = React.useRef(false);
    const autoFilled = React.useRef(false);

    const {
        activeScreenEntry,
        activeScreen,
        goNext: ctxGoNext,
        goBack:ctxGoBack,
        setMoreNavOptions:ctxSetMoreNavOptions,
        mountedScreens,
        nuidSearchForm,
        diagnoses: allDiagnoses,
        getFieldPreferences,
        setEntryValues,
        getSuggestedDiagnoses,
    } = useScriptContext();

    const canAutoFill = !mountedScreens[activeScreen?.id];
    const matchedDiagnoses: any[] = nuidSearchForm.filter(f => f.results)[0]?.results?.session?.data?.diagnoses;

    const [section, setSection] = React.useState('select');
    const [values, setValues] = React.useState<types.ScreenEntryValue[]>(
		(activeScreenEntry?.values || []).filter(v => !v?.diagnosis?.suggested)
	); // React.useState(ctx.getSuggestedDiagnoses().map(d => diagnosisToEntryValue(d)) || []);
    const [hcwDiagnoses, setHcwDiagnoses] = React.useState<types.ScreenEntryValue[]>(
		(activeScreenEntry?.values || []).filter(v => v?.diagnosis?.isHcwDiagnosis).map(v => v.diagnosis)
	); // React.useState<types.Diagnosis[]>(ctx.getSuggestedDiagnoses() || []);

    const diagnoses = useMemo(() => values.map(v => v.diagnosis), [values]);
    const acceptedDiagnoses = useMemo(() => diagnoses.filter(d => d.how_agree !== 'No'), [diagnoses]);

    const [activeDiagnosisIndex, setActiveDiagnosisIndex] = React.useState<null | number>(null);

    const [, setOrderBySeverity] = React.useState(true);
    const [loading, setLoading] = React.useState(false);

    const setDiagnoses = useCallback((diagnoses: types.Diagnosis[] = []) => {
        const entryValues = diagnoses.map(d => diagnosisToEntryValue(d));
        setValues(entryValues);
        setEntryValues(entryValues);
    }, [setEntryValues]);

    const done = useCallback(() => {
        setEntryValues(values, {
            lastSection: section, 
            lastActiveDiagnosisIndex: activeDiagnosisIndex, 
        });
        ctxGoNext();
    }, [section, activeDiagnosisIndex, setEntryValues, ctxGoNext]);

    const goNext = React.useCallback((opts?: {
        force?: boolean;
    }) => {
        if ((opts?.force !== true) && !loading) {
            setLoading(true);
            setTimeout(() => goNext({ force: true, }), 500);
            return;
        }

        if (activeDiagnosisIndex === null) {
            if (section === 'select') {
				const suggested = (getSuggestedDiagnoses() || []) as types.Diagnosis[];   
                
                const suggestedEntries = suggested
                    .filter(d => !values.map(item => item.key).includes(d.key || d.name))
                    .map(d => diagnosisToEntryValue({
                        ...d,
                        suggested: true,
                    }));

                const allEntries = [
                    ...values,
                    ...suggestedEntries,
                ];

                // sort by severyity_order

                let entries = [
                    ...allEntries.filter(d => d.diagnosis.severity_order || (d.diagnosis.severity_order === 0))
                        .sort((a, b) => a.diagnosis.severity_order - b.diagnosis.severity_order),
                    ...allEntries.filter(d => 
                        (d.diagnosis.severity_order === null) || 
                        (d.diagnosis.severity_order === undefined) || 
                        (d.diagnosis.severity_order === '')
                    ),
                ];

                // sort by priority
                // if (!orderBySeverity) {
                //     entries = [
                //         ...values.filter(d => d.diagnosis.priority || (d.diagnosis.priority === 0))
                //             .sort((a, b) => a.diagnosis.priority - b.diagnosis.priority),
                //         ...values.filter(d => (d.diagnosis.priority === null) || (d.diagnosis.priority === undefined) || (d.diagnosis.priority === '')),
                //         ...suggestedEntries.filter(d => d.diagnosis.priority || (d.diagnosis.priority === 0))
                //             .sort((a, b) => a.diagnosis.priority - b.diagnosis.priority),
                //         ...suggestedEntries.filter(d => (d.diagnosis.priority === null) || (d.diagnosis.priority === undefined) || (d.diagnosis.priority === '')),
                //     ];
                // }

				setValues(entries);
				setEntryValues(entries);
                setSection('agree_disagree');
            } else if (section === 'agree_disagree') {
                if (!diagnoses.length) {
                    Alert.alert(
                        'Warning',
                        'Continue without selecting diagnoses?',
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
                    setSection('sort_priority');
                }
            } else if (section === 'sort_priority') {
                // setDiagnoses(diagnoses
                //     .sort((a, b) => a.isSecondaryProvisionalDiagnosis > b.isSecondaryProvisionalDiagnosis ? -1 : 1)
                //     .sort((a, b) => a.isPrimaryProvisionalDiagnosis > b.isPrimaryProvisionalDiagnosis ? -1 : 1));
                if (acceptedDiagnoses[0]) {
                    setActiveDiagnosisIndex(0);
                } else {
                    done();
                }
            }        
        } else {
            const activeIndex = activeDiagnosisIndex + 1;
            if (activeIndex < acceptedDiagnoses.length) {
                setActiveDiagnosisIndex(activeIndex);
            } else {
                done();
            }
        }
    }, [
        loading,
        activeDiagnosisIndex,
        acceptedDiagnoses,
        getSuggestedDiagnoses,
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

        if (activeDiagnosisIndex === null) {
            // if (section === 'manage') return setSection('sort_priority');
            if (section === 'sort_priority') return setSection('agree_disagree');
            if (section === 'agree_disagree') return setSection('select');
            if (section === 'select') ctxGoBack();
        } else {
            const nextIndex = activeDiagnosisIndex - 1;
            if (nextIndex < 0) {
            	setActiveDiagnosisIndex(null);
            } else if (acceptedDiagnoses[nextIndex]) {
            	setActiveDiagnosisIndex(nextIndex);
            }
        }
    }, [
        loading,
        activeDiagnosisIndex,
        acceptedDiagnoses,
        ctxGoBack,
    ]);

    const hideFAB = useMemo(() => {
        let hide = false;
        if (section === 'agree_disagree') {
            hide = !!values.find(v => !v.diagnosis?.how_agree);
        }
        return hide;
    }, [section, values, getSuggestedDiagnoses]);

    const setMoreNavOptions = useCallback(() => {
        ctxSetMoreNavOptions({
            goBack,
            goNext,
            showFAB: !hideFAB,
            hideHeaderRight: false,
            hideSearch: section !== 'select',
            ...(() => {
                let title: undefined | string = undefined;
                let titleStyle: undefined | TextProps['style'] = undefined;

                if (activeDiagnosisIndex !== null) {
                    title = `${acceptedDiagnoses[activeDiagnosisIndex]?.customName || acceptedDiagnoses[activeDiagnosisIndex]?.name}`;
                } else {
                    if (section === 'agree_disagree') {
                        title = `${activeScreen?.data?.title2 || ''}`;
                        titleStyle = getFieldPreferences('title2')?.style;
                    }

                    if (section === 'sort_priority') {
                        title = `${activeScreen?.data?.title3 || ''}`;
                        titleStyle = getFieldPreferences('title3')?.style;
                    }
                }

                return { title, titleStyle, };
            })(),
        });
    }, [
        hideFAB,
        section,
        activeDiagnosisIndex,
        goBack,
        goNext,
        ctxSetMoreNavOptions,
    ]);

    const sectionProps: types.DiagnosisSectionProps = useMemo(() => ({
        ...props,        
        diagnoses,
        acceptedDiagnoses,
        activeDiagnosisIndex,
        hcwDiagnoses,
        loading,
        setLoading,
        setOrderBySeverity,
        setMoreNavOptions,
        getDefaultDiagnosis,
        setActiveDiagnosisIndex,
        diagnosisToEntryValue,
        setDiagnoses,
        _setHcwDiagnoses: setHcwDiagnoses,
        setHcwDiagnoses: (diagnoses = []) => {
            const entryValues = diagnoses.map(d => diagnosisToEntryValue(d));          
            setHcwDiagnoses(diagnoses);
            const entries = [...entryValues, ...values.filter(d => !diagnoses.map(d => d.name).includes(d.diagnosis.name))];
            setValues(entries);
            setEntryValues(entries);
        },
    }), [
        props,
        diagnoses,
        acceptedDiagnoses,
        activeDiagnosisIndex,
        hcwDiagnoses,
        loading,
        setOrderBySeverity,
        setMoreNavOptions,
        getDefaultDiagnosis,
        setDiagnoses,
        setEntryValues,
    ]);

    React.useEffect(() => { 
        if (!mounted.current) setEntryValues([]); 
        mounted.current = true;
    }, [setEntryValues]);

    React.useEffect(() => { setMoreNavOptions(); }, [setMoreNavOptions]);

    React.useEffect(() => () => ctxSetMoreNavOptions(null), []);

    // auto populate diagnoses
    React.useEffect(() => {
        if (canAutoFill && !autoFilled.current) {
            autoFilled.current = true;
            const items = activeScreen?.data?.metadata?.items || [];
            const diagnoses = matchedDiagnoses
                .map((m = {}) => {
                    const [key] = Object.keys(m);
                    const [value]: any[] = Object.values(m);

                    let diagnosis = allDiagnoses.map(d => d.data).find((d: any) => (d.key === key) || (d.name === key));
                    let hcwDiagnosis = items.find((item: any) => item.id === key);

                    let sevOrder = diagnosis?.severity_order || (diagnosis?.severity_order === 0) ? Number(diagnosis.severity_order) : null;
                    if (isNaN(Number(sevOrder))) sevOrder = null;

                    let itemSevOrder = hcwDiagnosis.severity_order || (hcwDiagnosis.severity_order === 0) ? Number(hcwDiagnosis.severity_order) : null;
                    if (isNaN(Number(itemSevOrder))) itemSevOrder = null;

                    if (hcwDiagnosis) {
                        hcwDiagnosis = sectionProps.getDefaultDiagnosis({
                            key: hcwDiagnosis.key || hcwDiagnosis.id,
                            severity_order: itemSevOrder,
                            isHcwDiagnosis: true,
                            suggested: false,
                            how_agree: value.hcw_agree,
                            hcw_follow_instructions: null,
                            hcw_reason_given: null,
                            isPrimaryProvisionalDiagnosis: false,
                            isSecondaryProvisionalDiagnosis: false,
                            priority: value.priority,
                            name: hcwDiagnosis.label,
                            ...(!diagnosis ? null : {
                                text1: diagnosis.text1,
                                image1: diagnosis.image1,
                                text2: diagnosis.text2,
                                image2: diagnosis.image2,
                                text3: diagnosis.text3,
                                image3: diagnosis.image3,
                                symptoms: diagnosis.symptoms || [],
                                severity_order: itemSevOrder || sevOrder,
                            }),
                        });
                    } else if (diagnosis) {
                        diagnosis = {
                            ...diagnosis,
                            how_agree: value.hcw_agree,
                            priority: value.priority,
                        };
                    }
                    
                    return {
                        priority: value.Priority,
                        suggested: value.Suggested,
                        how_agree: value.hcw_agree,
                        hcw_reason_given: value.hcw_reason_given,
                        hcw_follow_instructions: value.hcw_follow_instructions,
                        hcwDiagnosis,
                        diagnosis: !diagnosis || !value.Suggested ? undefined : getDefaultDiagnosis({
                            ...diagnosis,
                            suggested: true,
                            priority: value.priority,
                            how_agree: value.hcw_agree,
                        }),
                    };
                });

            sectionProps.setHcwDiagnoses(diagnoses.filter(d => d.hcwDiagnosis && !d.suggested).map(d => d.hcwDiagnosis));
			sectionProps.setDiagnoses(diagnoses.filter(d => d.hcwDiagnosis || d.diagnosis).map(d => !d.suggested ? d.hcwDiagnosis : d.diagnosis));
        }
    }, [canAutoFill, matchedDiagnoses, activeScreen, allDiagnoses, sectionProps]);

    return (
        <Box>
            {activeDiagnosisIndex !== null ? (
                <SectionContainer {...sectionProps} >
                    <FullDiagnosis {...sectionProps} />
                </SectionContainer>
            ) : (
                <>
                    {section === 'select' && (
                        <SectionContainer {...sectionProps} >
                            <SelectDiagnoses {...sectionProps} />
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
