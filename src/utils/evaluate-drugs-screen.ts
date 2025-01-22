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
            const weightKey = `${d.weightKey}`.toLowerCase();
            const diagnosisKeys = `${d.diagnosisKey || ''}`.split(',');
            const ageKey = `${d.ageKey}`.toLowerCase();
            const gestationKey = `${d.gestationKey}`.toLowerCase();

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
                        if (v.calculateValue) value = [v.calculateValue];
                        if (v.diagnosis?.key) {
                            diagnoses.push(v.diagnosis.key);
                            value = [v.diagnosis.key];
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

            const matchedDiagnoses = diagnosisKeys.filter(key => 
                diagnoses.map(d => d.toLowerCase()).includes(key.toLowerCase()));

            return {
                ...d,
                weight,
                gestation,
                diagnoses: matchedDiagnoses,
                age,
            };
        })
        .filter(d => {
            if (
                (d.weight === null) ||
                (d.gestation === null) ||
                (d.age === null) ||
                !d.diagnoses.length
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
