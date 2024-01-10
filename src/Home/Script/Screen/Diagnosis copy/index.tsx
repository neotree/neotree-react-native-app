import React from 'react';
import { useSharedValue } from 'react-native-reanimated';
import * as types from '../../../../types';
import { useContext, useDiagnoses } from '../../Context';
import { SelectHcwDiagnoses } from './SelectHcwDiagnoses';
import { AgreeDisagree } from './AgreeDisagree';

type DiagnosisProps = types.ScreenTypeProps & {};

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
	const { activeScreenEntry, activeScreen, setMoreNavOptions } = useContext();
	const { diagnoses } = useDiagnoses();

	const [section, setSection] = React.useState('select');

	const hcwDiagnoses = diagnoses.map(d => {
		return {
			...d,
			isHcwDiagnosis: true,
			how_agree: useSharedValue('Yes'),
			hcw_reason_given: useSharedValue(null),
			hcw_follow_instructions: useSharedValue('Yes'),
			selected: useSharedValue(
				!!(activeScreenEntry?.values || [])
					.filter(v => v?.diagnosis?.isHcwDiagnosis)
					.map(v => v.diagnosis)
					.filter(_d => _d.name === d.name).length
			),
		};
	});

	const suggestedDiagnoses = [
		{
			...diagnoses[diagnoses.length - 1],
			suggested: true,
			how_agree: useSharedValue(null),
			hcw_reason_given: useSharedValue(null),
			hcw_follow_instructions: useSharedValue(null),
			selected: useSharedValue(true),
		},
		{
			...diagnoses[diagnoses.length - 2],
			suggested: true,
			how_agree: useSharedValue(null),
			hcw_reason_given: useSharedValue(null),
			hcw_follow_instructions: useSharedValue(null),
			selected: useSharedValue(true),
		},
		...(activeScreenEntry?.values || [])
			.filter(v => !v?.diagnosis?.isHcwDiagnosis)
			.map(v => ({
				...v.diagnosis,
				selected: useSharedValue(true),
				how_agree: useSharedValue(v.diagnosis.how_agree),
				hcw_reason_given: useSharedValue(v.diagnosis.hcw_reason_given),
				hcw_follow_instructions: useSharedValue(v.diagnosis.hcw_follow_instructions),
			}))
	];

	const goNext = React.useCallback(() => {
		if (section === 'select') setSection('agree_disagree');
	}, [section]);

	const goBack = React.useCallback(() => {
		if (section === 'agree_disagree') setSection('select');
	}, [section]);

	React.useEffect(() => {
		setMoreNavOptions({
            goBack,
            goNext,
            showFAB: false,
            hideHeaderRight: false,
            hideSearch: section !== 'select',
            title: (() => {
                if (section === 'agree_disagree') return `${activeScreen.data.title2 || ''}`;
                if (section === 'sort_priority') return `${activeScreen.data.title3 || ''}`;
                return;
            })(),
        });
	}, [section, setMoreNavOptions, activeScreen]);

	return (
		<>
			{section === 'select' && (
				<SelectHcwDiagnoses 
					{...props}
					hcwDiagnoses={hcwDiagnoses}
					suggestedDiagnoses={suggestedDiagnoses}
					onNext={() => {
						setSection('agree_disagree');
					}}
				/>
			)}

			{section === 'agree_disagree' && (
				<AgreeDisagree 
					{...props}
					hcwDiagnoses={hcwDiagnoses}
					suggestedDiagnoses={suggestedDiagnoses}
					onNext={() => {
						
					}}
				/>
			)}
		</>
	);
}
