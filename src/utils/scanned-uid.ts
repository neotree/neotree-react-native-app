import { formatMuid, validateMuid } from './muid';
import { looksLikeMuid } from './neotreeId';
import { validateUID } from './uid-validate';

/**
 * Whether an ID read from a QR code fits what the script expects. The script's ID type alone decides the
 * format; there is no separate key.
 *
 *   muid  must be a valid MUID (any case, with or without hyphens); returned in its stored form (M0K7Q-000001R)
 *   nuid  anything that isn't a MUID, left as scanned so older NUID codes keep working
 *   any   either (screens that aren't tied to a script, e.g. printing a QR code)
 */
export type ScannedUidCheck = { ok: true; uid: string } | { ok: false; message: string };

export function checkScannedUid(raw: unknown, idType: 'nuid' | 'muid' | 'any' = 'nuid'): ScannedUidCheck {
    const text = `${raw ?? ''}`.trim();
    if (!text) return { ok: false, message: 'The QR code has no ID in it.' };

    const muid = validateMuid(text);

    if (idType === 'muid') {
        if (muid.isValid) return { ok: true, uid: muid.stored };
        if (validateUID(text).isValid) {
            return { ok: false, message: `This QR code holds a NUID (${text}), but this script uses MUIDs (like ${formatMuid('M0K7Q000001R')}). Scan a MUID.` };
        }
        return { ok: false, message: `This QR code isn't a valid MUID. ${muid.message}`.trim() };
    }

    if (idType === 'nuid') {
        if (looksLikeMuid(text)) {
            return { ok: false, message: `This QR code holds a MUID (${formatMuid(text)}), but this script uses NUIDs (like FB8E-1230042). Scan a NUID.` };
        }
        return { ok: true, uid: text };
    }

    return { ok: true, uid: muid.isValid ? muid.stored : text };
}
