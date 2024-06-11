import React from 'react';
import { Alert } from 'react-native';
import { Box } from '../../../../components';
import { useContext } from '../../Context';
import * as types from '../../../../types';

import { SelectDiagnoses } from './_SelectDiagnoses';
import { AgreeDisagree } from './_AgreeDisagree';
import { SortPriority } from './_SortPriority';
import { FullDiagnosis } from './_FullDiagnosis';

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
    key: d.name,
    value: d.customValue || d.name,
    valueText: d.customValue || d.name,
    type: 'diagnosis',
    dataType: 'diagnosis',
    diagnosis: {
        ...getDefaultDiagnosis(),
        ...d,
    },
});

export function Diagnosis(props: DiagnosisProps) {
    const ctx = useContext();
    const navigation = ctx.navigation;

    const [section, setSection] = React.useState('select');
    const [values, setValues] = React.useState<types.ScreenEntryValue[]>(
		(ctx.activeScreenEntry?.values || []).filter(v => !v?.diagnosis?.suggested)
	); // React.useState(ctx.getSuggestedDiagnoses().map(d => diagnosisToEntryValue(d)) || []);
    const [hcwDiagnoses, setHcwDiagnoses] = React.useState<types.ScreenEntryValue[]>(
		(ctx.activeScreenEntry?.values || []).filter(v => v?.diagnosis?.isHcwDiagnosis).map(v => v.diagnosis)
	); // React.useState<types.Diagnosis[]>(ctx.getSuggestedDiagnoses() || []);

    const diagnoses = values.map(v => v.diagnosis);
    const acceptedDiagnoses = diagnoses.filter(d => d.how_agree !== 'No');

    const [activeDiagnosisIndex, setActiveDiagnosisIndex] = React.useState<null | number>(null);

    const setDiagnoses = (diagnoses: types.Diagnosis[] = []) => {
        const entryValues = diagnoses.map(d => diagnosisToEntryValue(d));
        setValues(entryValues);
        ctx.setEntryValues(entryValues);
    };

    const done = () => {
        ctx.setEntryValues(values, {
            lastSection: section, 
            lastActiveDiagnosisIndex: activeDiagnosisIndex, 
        });
        ctx.goNext();
    };

    const goNext = () => {
        if (activeDiagnosisIndex === null) {
            if (section === 'select') {
				const suggested = (ctx.getSuggestedDiagnoses() || []) as types.Diagnosis[];        
				const _entries = [
					...values, 
					...suggested.filter(d => !values.map(item => item.label).includes(d.name)).map(d => diagnosisToEntryValue({
						...d,
						suggested: true,
					})),
				];

                const entries = [
                    ..._entries.filter(d => d.diagnosis.severity_order || (d.diagnosis.severity_order === 0))
                        .sort((a, b) => a.diagnosis.severity_order - b.diagnosis.severity_order),
                    ..._entries.filter(d => (d.diagnosis.severity_order === null) || (d.diagnosis.severity_order === undefined) || (d.diagnosis.severity_order === '')),
                ];

				setValues(entries);
				ctx.setEntryValues(entries);
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
                                ctx.setEntryValues(values);
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
                setDiagnoses(diagnoses
                    .sort((a, b) => a.isSecondaryProvisionalDiagnosis > b.isSecondaryProvisionalDiagnosis ? -1 : 1)
                    .sort((a, b) => a.isPrimaryProvisionalDiagnosis > b.isPrimaryProvisionalDiagnosis ? -1 : 1));
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
    };

    const goBack = () => {
        if (activeDiagnosisIndex === null) {
            // if (section === 'manage') return setSection('sort_priority');
            if (section === 'sort_priority') return setSection('agree_disagree');
            if (section === 'agree_disagree') return setSection('select');
            if (section === 'select') ctx.goBack();
        } else {
            const nextIndex = activeDiagnosisIndex - 1;
            if (nextIndex < 0) {
            	setActiveDiagnosisIndex(null);
            } else if (acceptedDiagnoses[nextIndex]) {
            	setActiveDiagnosisIndex(nextIndex);
            }
        }
    };

    const setMoreNavOptions = () => {
        ctx.setMoreNavOptions({
            goBack,
            goNext,
            showFAB: true,
            hideHeaderRight: false,
            hideSearch: section !== 'select',
            title: (() => {
                if (activeDiagnosisIndex !== null) return acceptedDiagnoses[activeDiagnosisIndex]?.customName || acceptedDiagnoses[activeDiagnosisIndex]?.name;
                if (section === 'agree_disagree') return `${ctx.activeScreen?.data?.title2 || ''}`;
                if (section === 'sort_priority') return `${ctx.activeScreen?.data?.title3 || ''}`;
                return;
            })(),
        });
    };

    const sectionProps: types.DiagnosisSectionProps = {
        ...props,        
        diagnoses,
        acceptedDiagnoses,
        activeDiagnosisIndex,
        hcwDiagnoses,
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
            ctx.setEntryValues(entries);
        },
    };

    React.useEffect(() => { setMoreNavOptions(); }, [navigation, hcwDiagnoses, section, values, activeDiagnosisIndex]);

    React.useEffect(() => () => ctx.setMoreNavOptions(null), []);

    return (
        <Box>
            {activeDiagnosisIndex !== null ? (
                <FullDiagnosis 
                    {...sectionProps} 
                />
            ) : (
                <>
                    {section === 'select' && (
                        <SelectDiagnoses 
                            {...sectionProps} 
                        />
                    )}

                    {section === 'agree_disagree' && (
                        <AgreeDisagree 
                            {...sectionProps} 
                        />
                    )}

                    {section === 'sort_priority' && (
                        <SortPriority 
                            {...sectionProps} 
                        />
                    )}
                </>
            )}
        </Box>
    );
}
