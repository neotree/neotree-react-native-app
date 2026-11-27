/**
 * CSV export of tables and repeatable forms (NEOAPP-1575). The session CSV has one line per session,
 * so rows of a table or repeatable form cannot fit in it; each collection gets a CSV of its own with
 * one line per row, linked to its session by the Neotree ID.
 *
 * Kept free of React Native imports so it can be checked outside the app.
 */
import { getFractionStorageKeys, isFractionType } from './fraction-values';
import { TABLE_ROW_KEY } from './screen-table';

type AnyValue = Record<string, any>;

export type CollectionColumns = {
    collectionName: string;
    /** The keys a row stores, in column order (a table's fixed row name first, a fraction as two numbers). */
    rowKeys: string[];
};

/** The keys a form field stores: its own key, or a fraction's two number keys. */
export function fieldStorageKeys(field: AnyValue): string[] {
    const key = `${field?.key ?? ''}`.trim();
    if (!key) return [];
    if (isFractionType(field?.type)) {
        const { numeratorKey, denominatorKey } = getFractionStorageKeys(key);
        return [numeratorKey, denominatorKey];
    }
    return [key];
}

/** The rows a screen stores, or null when it is not a table or repeatable form. */
export function screenCollectionColumns(metadata: AnyValue | null | undefined): CollectionColumns | null {
    const collectionName = `${metadata?.collectionName ?? ''}`.trim();
    if (!metadata?.repeatable || !collectionName) return null;
    const fixed = metadata?.tableConfig?.rowMode === 'fixed';
    return {
        collectionName,
        rowKeys: [
            ...(fixed ? [TABLE_ROW_KEY] : []),
            ...(metadata.fields || []).flatMap(fieldStorageKeys),
        ],
    };
}

const cellText = (cell: any) => {
    if (cell === null || cell === undefined) return '';
    const value = typeof cell === 'object' && !Array.isArray(cell) && 'value' in cell ? cell.value : cell;
    if (Array.isArray(value)) return value.filter(v => v !== null && v !== undefined && v !== '').join(', ');
    return value === null || value === undefined ? '' : `${value}`;
};

/**
 * One sheet per collection that has rows: columns "Neotree ID", "Row", then the row keys. Sessions are
 * the exported ones (formatExportableSession), whose rows sit in entries.repeatables[collectionName].
 */
export function buildCollectionSheets(sessions: AnyValue[], collections: CollectionColumns[]) {
    const seen = new Set<string>();
    return collections
        .filter(c => {
            const id = c.collectionName.toLowerCase();
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        })
        .map(({ collectionName, rowKeys }) => {
            const columns = ['Neotree ID', 'Row', ...rowKeys];
            const rows: AnyValue[] = [];
            (sessions || []).forEach(session => {
                const list = session?.entries?.repeatables?.[collectionName];
                if (!Array.isArray(list)) return;
                list.forEach((row: AnyValue, i: number) => {
                    if (!row || typeof row !== 'object') return;
                    rows.push({
                        'Neotree ID': session?.uid || '',
                        Row: i + 1,
                        ...Object.fromEntries(rowKeys.map(k => [k, cellText(row[k])])),
                    });
                });
            });
            return { collectionName, columns, rows };
        })
        .filter(sheet => sheet.rows.length);
}
