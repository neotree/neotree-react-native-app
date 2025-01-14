import { ScreenEntry, DrugField, DrugsLibraryItem } from "@/src/types";

export function evaluateDrugsScreen({
    entries,
    screen,
    drugsLibrary
}: {
    entries: ScreenEntry[];
    drugsLibrary: DrugsLibraryItem[];
    screen: any;
}) {
    const metadata = { ...screen.data?.metadata, };
    const screenDrugs = (metadata.drugs || []) as DrugField[];

    const drugs = drugsLibrary
        .map(d => {
            if (screenDrugs.map(d => d.key).includes(d.key)) return d;
            return null!;
        })
        .filter(d => d)
        .map(d => {
            let age: number | null = null;
            let weight: number | null = null;
            let gestation: number | null = null;
            let diagnosis: string | null = null;
            let filled = [] as any[];

            entries.forEach(e => {
                const values = [
                    ...(e.value || []),
                    ...(e.values || []),
                ];

                filled = values.reduce((acc, v) => {
                    return [...acc, ...(v.value?.map ? v.value : [v.value])];
                }, [] as any[]);

                values.forEach(v => {
                    if ((v.key === d.ageKey) && (v.calculateValue || v.value)) {
                        age = Number(v.calculateValue);
                        if (isNaN(age)) age = null;
                    }

                    if ((v.key === d.weightKey) && v.value) {
                        weight = Number(v.value);
                        if (isNaN(weight)) weight = null;
                    }

                    if ((v.key === d.gestationKey) && v.value) {
                        gestation = Number(v.value);
                        if (isNaN(gestation)) gestation = null;
                    }

                    if (filled.includes(d.diagnosisKey)) diagnosis = d.diagnosisKey;
                });
            });

            return {
                ...d,
                weight,
                gestation,
                diagnosis,
                age,
            };
        })
        .filter(d => {
            if (
                (d.weight === null) ||
                (d.gestation === null) ||
                (d.diagnosis === null) ||
                (d.age === null)
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
            const dosage = (d.dosage! * d.dosageMultiplier!) * d.weight!;
            return {
                ...d,
                dosage,
            };
        });

    metadata.drugs = drugs;

    return {
        ...screen,
        data: {
            ...screen.data,
            metadata,
        },
    };
}
