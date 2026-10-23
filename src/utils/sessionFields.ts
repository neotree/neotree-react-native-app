/**
 * Accessors for session fields that sit at different paths depending on where
 * the session came from.
 *
 * Rows read from the local sqlite db hold the raw session, whose `script` is
 * the scripts-table row (`script.data.title`). Rows fetched from a hospital's
 * local server hold the exported payload built by `formatExportableSession`,
 * whose `script` is flattened to `{ id, title, type }`.
 */

/** The Neotree ID: a column on local rows, inside `data` on fetched ones. */
export function getSessionUID(session: any): string {
    return session?.data?.uid || session?.uid || '';
}

/** The script's display title, whichever shape the session has. */
export function getSessionScriptTitle(session: any, fallback = ''): string {
    return session?.data?.title
        || session?.data?.script?.title
        || session?.data?.script?.data?.title
        || fallback;
}
