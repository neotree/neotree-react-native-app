import { ScreenEntry, DrugField, DrugsLibraryItem } from "@/src/types";

export type EvaluateDrugsScreenParams = {
    entries: ScreenEntry[];
    drugsLibrary: DrugsLibraryItem[];
    screen: any;
    evaluateCondition: (condition: string) => boolean;
};

export function evaluateDrugsScreen({
    entries,
    screen,
    drugsLibrary,
    evaluateCondition
}: EvaluateDrugsScreenParams) {
    const metadata = { ...screen.data?.metadata, };
    const screenDrugs = (metadata.drugs || []) as DrugField[];

    const drugs = drugsLibrary
        .filter(item => item.type === 'drug')
        .map(d => {
            const screenDrugIndex = screenDrugs.map(d => `${d.key}`.toLowerCase()).indexOf(`${d.key}`.toLowerCase());
            const screenDrug = screenDrugs[screenDrugIndex];
            if (screenDrug) {
                return {
                    ...d,
                    position: screenDrugIndex,
                };
            }
            return null!;
        })
        .filter(d => d)
        .sort((a, b) => a.position - b.position)
        .map(d => {
            const weightKeys = `${d.weightKey}`.toLowerCase().split(',').map(key => key.trim());
            const condition = `${d.condition || ''}`;
            const diagnosisKeys = `${d.diagnosisKey || ''}`.split(',');
            const ageKeys = `${d.ageKey}`.toLowerCase().split(',').map(key => key.trim());
            const gestationKey = `${d.gestationKey}`.toLowerCase();

            let conditionMet = !condition ? true : false;

            const entriesKeyVal: { [key: string]: any[]; } = {};
            const diagnoses: string[] = [];

            entries.forEach(e => {
                const values = [
                    ...(e.value || []),
                    ...(e.values || []),
                ];

                values.forEach(v => {
                    if (v.key) {
                        let key = `${v.key}`.toLowerCase();

                        let value = !v.value ? [] : v.value?.map ? v.value : [v.value];
                        if ((v.calculateValue !== undefined) && (v.calculateValue !== null)) value = [v.calculateValue];
                        if (v.diagnosis?.key) {
                            diagnoses.push(v.diagnosis.key);
                            value = [v.diagnosis.key];
                        }
                        if (condition) {
                            conditionMet = evaluateCondition(condition);
                        }
                        entriesKeyVal[key] = value;
                    }
                });
            });

            const weights = weightKeys.map(key => (entriesKeyVal[key] || [])[0])
                .filter(n => (n !== undefined) || (n !== null) || (n !== ''))
                .map(n => Number(n))
                .filter(n => !isNaN(n));

            const weight: number | null = !weights.length ? null : Math.max(...weights);
            // let weight: number | null = (entriesKeyVal[weightKey] || [])[0];
            // weight = weight === null ? null : (isNaN(Number(weight)) ? null : Number(weight));

            const ages = ageKeys.map(key => (entriesKeyVal[key] || [])[0])
                .filter(n => (n !== undefined) || (n !== null) || (n !== ''))
                .map(n => Number(n))
                .filter(n => !isNaN(n));

            const age: number | null = !ages.length ? null : Math.max(...ages);
            // let age: number | null = (entriesKeyVal[ageKey] || [])[0];
            // age = age === null ? null : (isNaN(Number(age)) ? null : Number(age));

            let gestation: number | null = (entriesKeyVal[gestationKey] || [])[0];
            gestation = gestation === null ? null : (isNaN(Number(gestation)) ? null : Number(gestation));

            const matchedDiagnoses = diagnosisKeys.filter(key => 
                diagnoses.map(d => d.toLowerCase()).includes(key.toLowerCase()));

            return {
                ...d,
                weight,
                gestation,
                diagnoses: matchedDiagnoses,
                age,
                conditionMet,
            };
        })
        .filter(d => {
            if (d.validationType === 'condition') return d.conditionMet;

            if (
                (d.weight === null) ||
                (d.gestation === null) ||
                (d.age === null) ||
                !d.diagnoses.length ||
                !d.conditionMet
            ) return false;

            const isCorrectWeight = (d.weight >= d.minWeight!) && (d.weight <= d.maxWeight!);
            const isCorrectAge = (d.age >= d.minAge!) && (d.age <= d.maxAge!);
            const isCorrectGestation = (d.gestation >= d.minGestation!) && (d.gestation <= d.maxGestation!);
            
            return (
                isCorrectWeight &&
                isCorrectAge &&
                isCorrectGestation
            );
        }).map(d => {
            let dosage = d.dosage! * d.dosageMultiplier!;
            if (!d.weight !== null) dosage = dosage * d.weight!

            dosage = isNaN(dosage) ? dosage : Math.round(dosage);

            return {
                ...d,
                dosage,
            };
        });

    metadata.drugs = drugs
        .filter((d, i) => drugs.map(d => d.key).indexOf(d.key) === i); // remove duplicates

    return {
        ...screen,
        data: {
            ...screen.data,
            metadata,
        },
    };
}
