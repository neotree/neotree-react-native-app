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
            const weightKey = `${d.weightKey}`.toLowerCase();
            const condition = `${d.condition || ''}`;
            const ageKey = `${d.ageKey}`.toLowerCase();
            const gestationKey = `${d.gestationKey}`.toLowerCase();

            let conditionMet = !condition ? true : false;

            const entriesKeyVal: { [key: string]: any[]; } = {};

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
                        if (condition) {
                            conditionMet = evaluateCondition(condition);
                        }
                        entriesKeyVal[key] = value;
                    }
                });
            });

            let weight: number | null = (entriesKeyVal[weightKey] || [])[0];
            weight = weight === null ? null : (isNaN(Number(weight)) ? null : Number(weight));

            let age: number | null = (entriesKeyVal[ageKey] || [])[0];
            age = age === null ? null : (isNaN(Number(age)) ? null : Number(age));

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
            let dosage = d.dosage! * d.dosageMultiplier!;
            if (d.weight !== null) dosage = dosage * d.weight!

            dosage = isNaN(dosage) ? dosage : Math.round(dosage);

            let hourlyDosage = dosage / (d.hourlyFeedDivider || 1);
            hourlyDosage = isNaN(hourlyDosage) ? hourlyDosage : Math.round(hourlyDosage);

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
