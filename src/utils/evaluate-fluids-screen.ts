import { DrugField } from "@/src/types";
import { EvaluateDrugsScreenParams } from '@/src/utils/evaluate-drugs-screen';

export function evaluateFluidsScreen({
    entries,
    screen,
    drugsLibrary,
    evaluateCondition,
}: EvaluateDrugsScreenParams) {
    const metadata = { ...screen.data?.metadata, };
    const screenFluids = (metadata.fluids || []) as DrugField[];

    const fluids = drugsLibrary
        .filter(item => item.type === 'fluid')
        .map(d => {
            const screenDrugIndex = screenFluids.map(d => `${d.key}`.toLowerCase()).indexOf(`${d.key}`.toLowerCase());
            const screenDrug = screenFluids[screenDrugIndex];
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
            const ageKeys = `${d.ageKey}`.toLowerCase().split(',').map(key => key.trim());
            const gestationKey = `${d.gestationKey}`.toLowerCase();

            let conditionMet = !condition ? true : false;

            const entriesKeyVal: { [key: string]: any[]; } = {};

            const values = entries.reduce((acc: any[], e) => [
                ...acc,
                ...(e.value || []),
                ...(e.values || []),
            ], []);

            values.forEach(v => {
                if (v.key) {
                    let key = `${v.key}`.toLowerCase();

                    let value = !v.value ? [] : v.value?.map ? v.value : [v.value];
                    if ((v.calculateValue !== undefined) && (v.calculateValue !== null)) value = [v.calculateValue];
                    if (condition) {
                        conditionMet = evaluateCondition(condition);
                    }
                    entriesKeyVal[key] = value;
                }
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

            return {
                ...d,
                weight,
                gestation,
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
            let dosage = 0;
            let hourlyDosage = 0;
            const dosageMultiplier = d.dosageMultiplier || 1;
            const hourlyFeedDivider = d.hourlyFeedDivider || 1;

            if (d.dosage) {
                if (d.validationType === 'condition') {
                    dosage = Number((d.dosage * dosageMultiplier).toFixed(2));
                } else {
                    dosage = d.dosage! * dosageMultiplier!;
                    if (d.weight !== null) dosage = dosage * d.weight!

                    // dosage = isNaN(dosage) ? dosage : Math.round(dosage);
                    if (!isNaN(dosage) && dosage > 1) {
                        dosage = Math.round(dosage);
                    }
                }

                hourlyDosage = dosage / hourlyFeedDivider;
                hourlyDosage = isNaN(hourlyDosage) ? hourlyDosage : Math.round(hourlyDosage);
            }

            return {
                ...d,
                dosage,
                hourlyDosage,
            };
        });

    metadata.fluids = fluids
        .filter((d, i) => fluids.map(d => d.key).indexOf(d.key) === i); // remove duplicates

    return {
        ...screen,
        data: {
            ...screen.data,
            metadata,
        },
    };
}
