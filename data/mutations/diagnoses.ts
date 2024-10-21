import { eq, inArray } from "drizzle-orm";

import { Diagnosis } from "@/types";
import { db } from "../db";
import { diagnoses } from '../schema';

export async function deleteAllDiagnoses() {
    try {
        await db.delete(diagnoses);
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function deleteDiagnoses(diagnosesIds: string[]) {
    try {
        if (diagnosesIds.length) await db.delete(diagnoses).where(inArray(diagnoses.diagnosisId, diagnosesIds));
        return true;
    } catch(e: any) {
        throw e;
    }
}

export async function saveDiagnoses(data: Diagnosis[]) {
    try {
        const savedDiagnosesIds = !data.length ? [] : await db.query.diagnoses.findMany({
            where: inArray(diagnoses.diagnosisId, data.map(d => d.diagnosisId)),
            columns: { diagnosisId: true, },
        });

        const diagnosesInserts = data
            .filter(d => !savedDiagnosesIds.map(d => d.diagnosisId).includes(d.diagnosisId));

        const diagnosesUpdates = data
            .filter(d => savedDiagnosesIds.map(d => d.diagnosisId).includes(d.diagnosisId));

        if (diagnosesInserts.length) {
            await db.insert(diagnoses).values(diagnosesInserts.map(d => {
                return {
                    ...d,
                    isDraft: d.isDraft ? 1 : 0,
                    symptoms: JSON.stringify(d.symptoms || []),
                    preferences: JSON.stringify({ ...d.preferences, }),
                    image1: d.image1 === undefined ? undefined : JSON.stringify({ ...d.image1, }),
                    image2: d.image2 === undefined ? undefined : JSON.stringify({ ...d.image2, }),
                    image3: d.image3 === undefined ? undefined : JSON.stringify({ ...d.image3, }),
                };
            }));
        }

        if (diagnosesUpdates.length) {
            for (const d of diagnosesUpdates) {
                await db.update(diagnoses)
                    .set({
                        ...d,
                        isDraft: d.isDraft === undefined ? undefined : d.isDraft ? 1 : 0,
                        symptoms: d.symptoms === undefined ? undefined : JSON.stringify(d.symptoms || []),
                        preferences: d.preferences === undefined ? undefined : JSON.stringify({ ...d.preferences, }),
                        image1: d.image1 === undefined ? undefined : JSON.stringify({ ...d.image1, }),
                        image2: d.image2 === undefined ? undefined : JSON.stringify({ ...d.image2, }),
                        image3: d.image3 === undefined ? undefined : JSON.stringify({ ...d.image3, }),
                    })
                    .where(eq(diagnoses.diagnosisId, d.diagnosisId));
            }
        }

        return true;
    } catch(e: any) {
        throw e;
    }
}