import db, { hospitals } from "@/database";
import logger from "@/lib/logger";
import { DataResponse } from "@/types";

export async function getHospitals(): Promise<DataResponse<typeof hospitals.$inferSelect[]>> {
    try {
        const res = await db.query.hospitals.findMany();
        return { data: res, };
    } catch(e: any) {
        logger.log('getHospitals ERROR', e.message);
        return { errors: [e.message], data: [], }
    }
}