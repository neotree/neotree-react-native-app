/**
 * Table screens (NEOAPP-1575). A table is a repeatable form screen whose metadata carries a
 * `tableConfig` (set in the editor): its fields are the columns and each collection entry is a row.
 * Rows are stored exactly like repeatable form entries (entry.repeatables[collectionName]), so the
 * session format, exports, QR code and conditions need no change. A fixed row also stores its name
 * under TABLE_ROW_KEY.
 *
 * Kept free of React Native imports so it can be checked outside the app.
 */
import { expandFractionValue, isFractionType, collapseFractionValue, getFractionStorageKeys } from './fraction-values';

export type ScreenTableRowConfig = { rowId: string; label: string; };

export type ScreenTableConfig = {
    title: string;
    rowMode: 'dynamic' | 'fixed';
    rowsHeading?: string;
    rows: ScreenTableRowConfig[];
    minRows?: number | null;
    maxRows?: number | null;
};

/** Where a fixed row keeps its name in a stored row. */
export const TABLE_ROW_KEY = 'tableRow';

// Row bookkeeping kept by repeatable forms; never a column.
export const TABLE_ROW_META_KEYS = ['id', 'createdAt', 'requiredComplete', 'hasCollectionField'];

type AnyValue = Record<string, any>;

const toCount = (v: any) => {
    if (v === null || v === undefined || `${v}`.trim() === '') return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 ? n : null;
};

/** The table settings of a screen, or null when it is not a table (old apps ignore the setting). */
export function getScreenTableConfig(metadata: AnyValue | null | undefined): ScreenTableConfig | null {
    const config = metadata?.tableConfig;
    if (!metadata?.repeatable || !config || typeof config !== 'object') return null;
    const rowMode = config.rowMode === 'fixed' ? 'fixed' : 'dynamic';
    const rows: ScreenTableRowConfig[] = (Array.isArray(config.rows) ? config.rows : [])
        .map((r: any, i: number) => ({
            rowId: `${r?.rowId ?? ''}`.trim() || `row-${i + 1}`,
            label: `${r?.label ?? ''}`.trim(),
        }))
        .filter((r: ScreenTableRowConfig) => r.label);
    if (rowMode === 'fixed' && !rows.length) return null;
    return {
        title: `${config.title ?? ''}`.trim(),
        rowMode,
        rowsHeading: `${config.rowsHeading ?? ''}`.trim(),
        rows,
        minRows: rowMode === 'dynamic' ? toCount(config.minRows) : null,
        maxRows: rowMode === 'dynamic' ? toCount(config.maxRows) : null,
    };
}

/** The heading of a column: the field's own table heading, else its label. */
export function getColumnHeading(field: AnyValue) {
    return `${field?.tableHeading ?? ''}`.trim() || `${field?.label ?? ''}`.trim() || `${field?.key ?? ''}`;
}

/** The heading of the row-name column of a fixed table. */
export function getRowsHeading(config: ScreenTableConfig | null | undefined) {
    return `${config?.rowsHeading ?? ''}`.trim() || 'Row';
}

/** How many rows the table must have and may have (fixed: exactly its rows). */
export function getTableRowLimits(config: ScreenTableConfig) {
    if (config.rowMode === 'fixed') return { min: config.rows.length, max: config.rows.length };
    return { min: config.minRows ?? 0, max: config.maxRows ?? null };
}

/** The keys a column stores in a row: its own key, or a fraction's two number keys. */
export function getColumnStorageKeys(field: AnyValue): string[] {
    if (isFractionType(field?.type)) {
        const { numeratorKey, denominatorKey } = getFractionStorageKeys(field?.key);
        return [numeratorKey, denominatorKey];
    }
    return [`${field?.key ?? ''}`];
}

/**
 * The value a column shows and edits in a row. For a fraction, the in-form value is rebuilt from
 * the two stored numbers; for other fields it is the stored value itself.
 */
export function getRowCellValue(row: AnyValue | null | undefined, field: AnyValue): AnyValue | null {
    if (!row) return null;
    if (isFractionType(field?.type)) return collapseFractionValue(field, row);
    const v = row[field?.key];
    return v && typeof v === 'object' ? v : null;
}

/** The text a cell shows ('' when empty). */
export function getRowCellText(row: AnyValue | null | undefined, field: AnyValue) {
    const v = getRowCellValue(row, field);
    if (!v) return '';
    if (Array.isArray(v.value)) {
        return v.value.map((item: any) => item?.valueText || item?.value).filter(Boolean).join(', ');
    }
    const text = v.valueText ?? v.value;
    if (text === null || text === undefined) return '';
    const s = `${text}`;
    return v.value2 ? `${s} (${v.value2})` : s;
}

const hasCellValue = (v: AnyValue | null | undefined) => {
    if (!v) return false;
    if (Array.isArray(v.value)) return v.value.length > 0;
    return v.value !== null && v.value !== undefined && `${v.value}` !== '';
};

/**
 * Whether every required column of a row is filled in without errors. Columns whose condition is not
 * met (per `isColumnShown`) are skipped, as on a form.
 */
export function isRowComplete(
    row: AnyValue | null | undefined,
    fields: AnyValue[],
    isColumnShown: (field: AnyValue) => boolean = () => true,
) {
    return fields.every(field => {
        if (!isColumnShown(field)) return true;
        const v = getRowCellValue(row, field);
        if (v?.error) return false;
        if (field?.optional) return true;
        return hasCellValue(v);
    });
}

/** Whether a row holds anything at all (an empty dynamic row is not saved). */
export function isRowEmpty(row: AnyValue | null | undefined, fields: AnyValue[]) {
    return !fields.some(field => hasCellValue(getRowCellValue(row, field)));
}

/**
 * A row as it is stored: the row name (fixed rows) first, then every column in order (a fraction as
 * its two numbers), then the row bookkeeping. Every row has the same keys, which the QR export needs.
 */
export function buildStoredRow({
    fields,
    cells,
    id,
    createdAt,
    rowConfig,
    rowsHeading,
    requiredComplete,
}: {
    fields: AnyValue[];
    cells: Record<string, AnyValue | null>;
    id: number;
    createdAt: string;
    rowConfig?: ScreenTableRowConfig | null;
    rowsHeading?: string;
    requiredComplete: boolean;
}): AnyValue {
    const row: AnyValue = {};
    if (rowConfig) {
        row[TABLE_ROW_KEY] = {
            value: rowConfig.label,
            valueText: rowConfig.label,
            exportValue: rowConfig.label,
            exportLabel: rowConfig.label,
            label: rowsHeading || 'Row',
            rowId: rowConfig.rowId,
            exportType: 'text',
            type: 'text',
            printable: true,
        };
    }
    fields.forEach(field => {
        const cell = cells[field.key] || null;
        if (isFractionType(field?.type)) {
            const [numeratorKey, denominatorKey] = getColumnStorageKeys(field);
            const parts = cell ? expandFractionValue({ ...cell, key: field.key, label: field.label, unit: field.unit }) : [];
            row[numeratorKey] = parts.find(p => p.key === numeratorKey) || null;
            row[denominatorKey] = parts.find(p => p.key === denominatorKey) || null;
            return;
        }
        row[field.key] = hasCellValue(cell) ? cell : null;
    });
    row.id = id;
    row.createdAt = createdAt;
    row.requiredComplete = requiredComplete;
    row.hasCollectionField = true;
    return row;
}

/** Problems with the table as a whole (row counts). Empty when it can be saved. */
export function validateTableRows(config: ScreenTableConfig, rowCount: number): string[] {
    const { min, max } = getTableRowLimits(config);
    if (config.rowMode === 'fixed') return [];
    if (min && rowCount < min) return [`Add at least ${min} row${min === 1 ? '' : 's'}.`];
    if (max !== null && rowCount > max) return [`No more than ${max} row${max === 1 ? '' : 's'}.`];
    return [];
}

/**
 * Whether a table screen is done: enough rows and every stored row complete. Used to show the
 * Next button.
 */
export function isTableComplete(config: ScreenTableConfig, rows: AnyValue[] | null | undefined) {
    const list = Array.isArray(rows) ? rows : [];
    if (validateTableRows(config, list.length).length) return false;
    return list.every(r => r?.requiredComplete !== false);
}

/** The stored row of a fixed table row (matched by row id, else by name). */
export function findStoredFixedRow(rows: AnyValue[] | null | undefined, rowConfig: ScreenTableRowConfig) {
    const list = Array.isArray(rows) ? rows : [];
    return list.find(r => r?.[TABLE_ROW_KEY]?.rowId === rowConfig.rowId)
        || list.find(r => `${r?.[TABLE_ROW_KEY]?.value ?? ''}`.trim().toLowerCase() === rowConfig.label.toLowerCase())
        || null;
}

/** The columns a session entry describes (kept on the entry so summaries and print need no script). */
export type StoredTableColumn = { key: string; heading: string; type: string; unit?: string; storageKeys: string[]; };

export function describeTableColumns(fields: AnyValue[]): StoredTableColumn[] {
    return (fields || []).map(field => ({
        key: `${field?.key ?? ''}`,
        heading: getColumnHeading(field),
        type: `${field?.type ?? ''}`,
        unit: field?.unit || undefined,
        storageKeys: getColumnStorageKeys(field),
    }));
}

/**
 * A stored table laid out for display: the column headings (with the row-name column for fixed rows)
 * and, per row, the text of each cell. A fraction cell shows "120 / 80".
 */
export function layoutTableForDisplay({
    config,
    columns,
    rows,
    isVisible = () => true,
}: {
    config: ScreenTableConfig | AnyValue | null | undefined;
    columns: StoredTableColumn[];
    rows: AnyValue[];
    isVisible?: (value: AnyValue | null | undefined) => boolean;
}) {
    const fixed = config?.rowMode === 'fixed';
    const headings = [
        ...(fixed ? [getRowsHeading(config as ScreenTableConfig)] : []),
        ...columns.map(c => c.heading),
    ];
    const body = (rows || []).map(row => {
        const cells = columns.map(column => {
            const values = column.storageKeys.map(k => row?.[k]).filter(v => v && typeof v === 'object');
            if (!values.length || !values.every(isVisible)) return '';
            if (isFractionType(column.type)) {
                const [num, den] = column.storageKeys.map(k => row?.[k]?.value);
                if (num === null || num === undefined || den === null || den === undefined) {
                    return values.map(v => `${v.label || ''}: ${v.valueText ?? v.value}`).join(', ');
                }
                const unit = column.unit ? ` ${column.unit}` : '';
                return `${num} / ${den}${unit}`;
            }
            const v = values[0];
            if (Array.isArray(v.value)) {
                return v.value.map((item: any) => item?.valueText || item?.value).filter(Boolean).join(', ');
            }
            const text = `${v.valueText ?? v.value ?? ''}`;
            if (!text) return '';
            const withManual = v.value2 ? `${text} (${v.value2})` : text;
            return column.unit && ['number', 'text'].includes(`${column.type}`) ? `${withManual} ${column.unit}` : withManual;
        });
        return fixed ? [`${row?.[TABLE_ROW_KEY]?.valueText ?? row?.[TABLE_ROW_KEY]?.value ?? ''}`, ...cells] : cells;
    });
    return { headings, rows: body };
}

/**
 * The table a session entry holds, for summaries and print: its settings, columns and stored rows.
 * Works for entries captured on this device (the screen's layout is kept on entry.screen.metadata) and
 * for sessions rebuilt from an export (metadata is then the script screen's own). Null for other entries.
 */
export function getEntryTable(entry: AnyValue | null | undefined) {
    const metadata = entry?.screen?.metadata;
    if (!metadata?.tableConfig) return null;
    const config = getScreenTableConfig({ ...metadata, repeatable: true });
    if (!config) return null;
    const columns: StoredTableColumn[] = Array.isArray(metadata.tableColumns) && metadata.tableColumns.length
        ? metadata.tableColumns
        : describeTableColumns(metadata.fields || []);
    const groups = entry?.repeatables && typeof entry.repeatables === 'object' ? entry.repeatables : {};
    const rows = (metadata.collectionName && Array.isArray(groups[metadata.collectionName]))
        ? groups[metadata.collectionName]
        : (Object.values(groups).find(Array.isArray) as AnyValue[] | undefined) || [];
    return { config, columns, rows: rows.filter((r: AnyValue) => r && typeof r === 'object') };
}

const escapeHTML = (s: any) => `${s ?? ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** A stored table as an HTML table for print (headings repeat on each printed page). */
export function tableToHTML(
    table: NonNullable<ReturnType<typeof getEntryTable>>,
    { title, isVisible }: { title?: string; isVisible?: (value: AnyValue | null | undefined) => boolean; } = {},
) {
    const layout = layoutTableForDisplay({ ...table, isVisible });
    if (!layout.rows.length) return '';
    const cell = 'border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top;';
    return `
      <div style="margin:10px 0;">
        ${!title ? '' : `<div style="font-weight:bold;margin:6px 0;">${escapeHTML(title)}</div>`}
        <table style="width:100%;border-collapse:collapse;font-size:12px;page-break-inside:auto;">
          <thead style="display:table-header-group;">
            <tr>${layout.headings.map(h => `<th style="${cell}background:#eee;">${escapeHTML(h)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${layout.rows.map(r => `<tr style="page-break-inside:avoid;">${r.map(c => `<td style="${cell}">${escapeHTML(c) || '&nbsp;'}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
}
