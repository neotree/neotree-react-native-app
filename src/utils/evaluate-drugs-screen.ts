import { ScreenEntry, DrugField, DrugsLibraryItem } from "@/src/types";

export type EvaluateDrugsScreenParams = {
    entries: ScreenEntry[];
    drugsLibrary: DrugsLibraryItem[];
    screen: any;
    scriptType?: string;
    evaluateCondition: (condition: string) => boolean;
};

export function evaluateDrugsScreen({
    entries,
    screen,
    drugsLibrary,
    scriptType,
    evaluateCondition
}: EvaluateDrugsScreenParams) {
    const isCalculator = scriptType === 'dff_calculator';

    const metadata = { ...screen.data?.metadata, };
    const screenDrugs = (metadata.drugs || []) as DrugField[];
    const screenDrugKeys = screenDrugs.map(d => `${d.key}`.toLowerCase());

    // The session values, key/value map and diagnoses list are identical for
    // every drug, so build them once instead of once per library item.
    const values = entries.reduce((acc: any[], e) => {
        acc.push(...(e.value || []), ...(e.values || []));
        return acc;
    }, []);

    const entriesKeyVal: { [key: string]: any[]; } = {};
    const diagnoses: string[] = [];
    let hasKeyedValue = false;

    values.forEach(v => {
        if (v.key) {
            hasKeyedValue = true;
            const key = `${v.key}`.toLowerCase();

            let value = !v.value ? [] : v.value?.map ? v.value : [v.value];
            if ((v.calculateValue !== undefined) && (v.calculateValue !== null)) value = [v.calculateValue];
            if (v.diagnosis?.key) {
                diagnoses.push(v.diagnosis.key);
                value = [v.diagnosis.key];
            }
            entriesKeyVal[key] = value;
        }
    });

    const diagnosesLower = diagnoses.map(d => d.toLowerCase());

    // evaluateCondition runs a full parseCondition over the session per call;
    // drugs often share condition strings, so resolve each string once.
    // Matching the previous behaviour, conditions only evaluate when the
    // session has at least one keyed value (otherwise they stay unmet).
    const conditionResultCache = new Map<string, boolean>();
    const resolveCondition = (condition: string) => {
        if (!condition) return true;
        if (!hasKeyedValue) return false;
        if (!conditionResultCache.has(condition)) {
            conditionResultCache.set(condition, evaluateCondition(condition));
        }
        return conditionResultCache.get(condition)!;
    };

    const drugs = drugsLibrary
        .filter(item => item.type === 'drug')
        .map(d => {
            const screenDrugIndex = screenDrugKeys.indexOf(`${d.key}`.toLowerCase());
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
        // .filter(d => {
        //     const condition = `${d.condition || ''}`;
        //     const diagnosisKeys = `${d.diagnosisKey || ''}`.split(',');

        //     let conditionMet = !condition ? true : false;

        //     const entriesKeyVal: { [key: string]: any[]; } = {};
        //     const diagnoses: string[] = [];

        //     entries.forEach(e => {
        //         const values = [
        //             ...(e.value || []),
        //             ...(e.values || []),
        //         ];

        //         values.forEach(v => {
        //             if (v.key) {
        //                 let key = `${v.key}`.toLowerCase();

        //                 let value = !v.value ? [] : v.value?.map ? v.value : [v.value];
        //                 if ((v.calculateValue !== undefined) && (v.calculateValue !== null)) value = [v.calculateValue];
        //                 if (v.diagnosis?.key) {
        //                     diagnoses.push(v.diagnosis.key);
        //                     value = [v.diagnosis.key];
        //                 }
        //                 if (condition) {
        //                     conditionMet = evaluateCondition(condition);
        //                 }
        //                 entriesKeyVal[key] = value;
        //             }
        //         });
        //     });

        //     const matchedDiagnoses = diagnosisKeys.filter(key => 
        //         diagnoses.map(d => d.toLowerCase()).includes(key.toLowerCase()));

        //     return !!matchedDiagnoses.length || conditionMet;
        // })
        .map(d => {
            const weightKeys = `${d.weightKey}`.toLowerCase().split(',').map(key => key.trim());
            const ageKeys = `${d.ageKey}`.toLowerCase().split(',').map(key => key.trim());
            const gestationKey = `${d.gestationKey}`.toLowerCase();

            let condition = `${d.condition || ''}`;
            let diagnosisKeys = `${d.diagnosisKey || ''}`.split(',');

            if (isCalculator) {
                condition = `${d.calculator_condition || ''}`;
                diagnosisKeys = [];
            }

            const conditionMet = resolveCondition(condition);

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
                diagnosesLower.includes(key.toLowerCase()));

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
            if (!isCalculator && (d.validationType === 'condition')) {
                return d.conditionMet && (!d.diagnosisKey ? true : !!d.diagnoses.length);
            }

            if (
                (d.weight === null) ||
                (d.gestation === null) ||
                (d.age === null) ||
                // !d.diagnoses.length ||
                !d.conditionMet
            ) return false;

            if (!isCalculator && !d.diagnoses.length) return false; 

            const isCorrectWeight = (d.weight >= d.minWeight!) && (d.weight <= d.maxWeight!);
            const isCorrectAge = (d.age >= d.minAge!) && (d.age <= d.maxAge!);
            const isCorrectGestation = (d.gestation >= d.minGestation!) && (d.gestation <= d.maxGestation!);
            
            return (
                isCorrectWeight &&
                isCorrectAge &&
                isCorrectGestation
            );
        }).map(d => {
            let dosage = 0;
            const dosageMultiplier = d.dosageMultiplier || 1;
            
            if (d.dosage) {
                if (!isCalculator && (d.validationType === 'condition')) {
                    dosage = Number((d.dosage * dosageMultiplier).toFixed(2));
                } else {
                    dosage = d.dosage! * dosageMultiplier!;
                    if (d.weight !== null) dosage = dosage * d.weight!

                    // dosage = isNaN(dosage) ? dosage : Math.round(dosage);
                    if (!isNaN(dosage)) {
                        if (dosage > 1) {
                            dosage = Math.round(dosage);
                        } else {
                            dosage = Number(dosage.toFixed(2));
                        }
                    }
                }
            }

            return {
                ...d,
                dosage,
            };
        });

    const seenDrugKeys = new Set<string>();
    metadata.drugs = drugs.filter(d => {
        if (seenDrugKeys.has(d.key)) return false; // remove duplicates
        seenDrugKeys.add(d.key);
        return true;
    });

    return {
        ...screen,
        data: {
            ...screen.data,
            metadata,
        },
    };
}
