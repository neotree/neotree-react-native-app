import React from 'react';
import { useTheme } from '@/components/ui';
import { useScriptContext } from '../../Context';
import { ScreenComponentProps, ScreenDiagnosisComponentProps, EntryValueDiagnosis } from '../../types';
import { Select } from './Select';
import { AgreeDisagree } from './AgreeDisagree';
import { Manage } from './Manage';

const sections = {
    SELECT: 'select',
    MANAGE: 'manage',
    AGREE_DISAGREE: 'agree_disagree',
};

const getDefaultDiagnosis = (d?: EntryValueDiagnosis) => ({
    symptoms: [],
    name: '',
    suggested: false,
    priority: null,
    how_agree: null,
    hcw_follow_instructions: null,
    hcw_reason_given: null,
    isPrimaryProvisionalDiagnosis: false,
    ...d,
});

const diagnosisToEntryValue = (d: EntryValueDiagnosis) => ({
    label: d.name,
    key: d.name,
    value: d.name,
    valueText: d.name,
    type: 'diagnosis',
    dataType: 'diagnosis',
    diagnosis: {
      ...getDefaultDiagnosis(),
      ...d,
    },
});

export function Diagnosis(props: ScreenComponentProps) {
    const {} = props;
    const theme = useTheme();
    const { 
        setNavigationOptions, 
        setScreenOptions, 
        onBack: _onBack,
        activeScreenCachedEntry,
        getSuggestedDiagnoses,
    } = useScriptContext();
    const [section, setSection] = React.useState(sections.SELECT);
    const [entry, setEntry] = React.useState({ values: [], ...activeScreenCachedEntry });
    const [activeDiagnosisIndex, setActiveDiagnosisIndex] = React.useState(null);

    const diagnoses = entry.values.map(v => v.diagnosis);
    const acceptedDiagnoses = diagnoses.filter(d => d.how_agree !== 'No');
    
    const onBack = () => {
        if (activeDiagnosisIndex === null) {
            if (section === sections.MANAGE) {
                setSection(sections.AGREE_DISAGREE);
            } else if (section === sections.AGREE_DISAGREE) {
                setSection(sections.SELECT);
            } else if (section === sections.SELECT) _onBack();
        } else {
            const nextIndex = activeDiagnosisIndex - 1;
            if (nextIndex < 0) {
                setActiveDiagnosisIndex(null);
            } else if (acceptedDiagnoses[nextIndex]) {
                setActiveDiagnosisIndex(nextIndex);
            }
        }
        return false;
    };

    React.useEffect(() => {
        setNavigationOptions({
            onBack,
            customTitle: 'XOXO',
            customSubtitle: section,
        });
        setScreenOptions({ onBack, scrollable: false });
    }, [section]);

    // reset to default navigation options
    React.useEffect(() => () => {
        setNavigationOptions();
        setScreenOptions(null);
    }, []);

    return (
        <>
            {(() => {
                let Component: React.ComponentType<ScreenDiagnosisComponentProps> = null;
                switch (section) {
                    case sections.SELECT:
                        Component = Select;
                        break;
                    case sections.AGREE_DISAGREE:
                        Component = AgreeDisagree;
                        break;
                    case sections.MANAGE:
                        Component = Manage;
                        break;
                    default:
                        break;
                }
                return !Component ? null : (
                    <Component 
                        {...props}
                        setSection={setSection}
                        value={entry}
                        onDiagnosisChange={d => setEntry(prev => ({
                            ...prev,
                            values: prev.values.map(v => v?.diagnosis?.name).includes(d?.name) ?
                                prev.values.filter(v => v?.diagnosis?.name !== d?.name)
                                :
                                [...prev.values, diagnosisToEntryValue({ priority: prev.values.length, ...d })],
                        }))}
                    />
                );
            })()}
        </>
    );
}
