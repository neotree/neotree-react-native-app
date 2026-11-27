import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Box, Br, Button, Text, useTheme } from '@/src/components';
import { fieldsTypes } from '@/src/constants';
import {
    buildStoredRow,
    findStoredFixedRow,
    getColumnHeading,
    getRowCellValue,
    getRowsHeading,
    getTableRowLimits,
    isRowComplete,
    isRowEmpty,
    validateTableRows,
    type ScreenTableConfig,
    type ScreenTableRowConfig,
} from '@/src/utils/screen-table';
import { getRowCellText } from '@/src/utils/screen-table';
import { normalizeFieldType } from '@/src/utils/fraction-values';
import { NumberField } from './_Number';
import { DateField } from './_Date';
import { TextField } from './_Text';
import { DropDownField } from './_DropDown';
import { PeriodField } from './_Period';
import { TimeField } from './_Time';
import { MultiSelectField } from './_MultiSelect';
import { FractionField } from './_Fraction';

type TableFormProps = {
    config: ScreenTableConfig;
    collectionName: string;
    /** The screen's fields: the table's columns, in order. */
    fields: any[];
    onChange: (data: Record<string, any[]>) => void;
    /** Whether a column applies to a row (its condition, evaluated on the row's values). */
    evaluateCondition: (field: any, form?: any) => boolean;
    allValues?: any;
    /** Rows already stored for this table (this session, or carried over from an earlier one). */
    allRepeatableValues?: any[];
    /** The screen cannot be skipped: the table must be filled in. */
    required?: boolean;
};

type RowState = {
    id: number;
    createdAt: string;
    rowConfig: ScreenTableRowConfig | null;
    /** In-form value of each column, by field key (a fraction holds both numbers). */
    cells: Record<string, any>;
};

type RowStatus = {
    row: RowState;
    /** The row as it is stored (columns that do not apply to it left empty). */
    stored: Record<string, any>;
    empty: boolean;
    complete: boolean;
};

const COLUMN_WIDTH = 140;
const ROW_NAME_WIDTH = 130;
const STATUS_WIDTH = 34;

let rowSeq = 0;
const newRowId = () => Date.now() * 1000 + (rowSeq++ % 1000);

const dateIsToday = (value: string) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return date.getDate() === today.getDate()
        && date.getMonth() === today.getMonth()
        && date.getFullYear() === today.getFullYear();
};

function getFieldComponent(type: any): React.ComponentType<any> | null {
    switch (normalizeFieldType(type)) {
        case fieldsTypes.NUMBER: return NumberField;
        case fieldsTypes.DATE:
        case fieldsTypes.DATETIME: return DateField;
        case fieldsTypes.DROPDOWN: return DropDownField;
        case fieldsTypes.PERIOD: return PeriodField;
        case fieldsTypes.TEXT: return TextField;
        case fieldsTypes.TIME: return TimeField;
        case fieldsTypes.MULTI_SELECT: return MultiSelectField;
        case fieldsTypes.FRACTION: return FractionField;
        default: return null;
    }
}

function rowFromStored(stored: any, fields: any[], rowConfig: ScreenTableRowConfig | null): RowState {
    const cells: Record<string, any> = {};
    fields.forEach(field => {
        const v = getRowCellValue(stored, field);
        if (v) cells[field.key] = v;
    });
    const createdAt = stored?.createdAt && !isNaN(new Date(stored.createdAt).getTime())
        ? new Date(stored.createdAt).toISOString()
        : new Date().toISOString();
    return {
        id: Number(stored?.id) || newRowId(),
        createdAt,
        rowConfig,
        cells,
    };
}

function emptyRow(rowConfig: ScreenTableRowConfig | null): RowState {
    return { id: newRowId(), createdAt: new Date().toISOString(), rowConfig, cells: {} };
}

/**
 * A table screen (NEOAPP-1575): the rows shown as a grid, one column per field. Tapping a row opens
 * it below the grid with the usual inputs. Rows are stored like repeatable form entries.
 */
export default function TableForm({
    config,
    collectionName,
    fields,
    onChange,
    evaluateCondition,
    allValues,
    allRepeatableValues,
    required,
}: TableFormProps) {
    const theme = useTheme();
    const isFixed = config.rowMode === 'fixed';
    const { max } = getTableRowLimits(config);

    const [rows, setRows] = React.useState<RowState[]>(() => {
        const stored = Array.isArray(allRepeatableValues) ? allRepeatableValues : [];
        if (isFixed) {
            return config.rows.map(rowConfig => {
                const match = findStoredFixedRow(stored, rowConfig);
                return match ? rowFromStored(match, fields, rowConfig) : emptyRow(rowConfig);
            });
        }
        const existing = stored
            .filter(r => r && typeof r === 'object')
            .map(r => rowFromStored(r, fields, null));
        if (existing.length) return existing;
        // Start with the rows the table needs (at least one) so there is something to fill in.
        return Array.from({ length: Math.max(config.minRows || 0, 1) }, () => emptyRow(null));
    });
    const [openRowId, setOpenRowId] = React.useState<number | null>(null);

    // The row in its stored shape (a fraction as its two numbers), as conditions see it.
    const toStored = React.useCallback((row: RowState, requiredComplete = true) => buildStoredRow({
        fields,
        cells: row.cells,
        id: row.id,
        createdAt: row.createdAt,
        rowConfig: row.rowConfig,
        rowsHeading: getRowsHeading(config),
        requiredComplete,
    }), [config, fields]);

    const isShown = React.useCallback((row: RowState, field: any) => {
        if (!`${field?.condition ?? ''}`.trim()) return true;
        return !!evaluateCondition(field, { values: toStored(row) });
    }, [evaluateCondition, toStored]);

    const rowStatus = React.useCallback((row: RowState): RowStatus => {
        const visible = fields.filter(f => isShown(row, f));
        const cells = { ...row.cells };
        // a column that does not apply to the row keeps no value
        fields.forEach(f => { if (!visible.includes(f)) delete cells[f.key]; });
        const checked = toStored({ ...row, cells });
        const empty = isRowEmpty(checked, fields);
        const complete = isRowComplete(checked, fields, f => visible.includes(f));
        return { row, stored: { ...checked, requiredComplete: complete }, empty, complete };
    }, [fields, isShown, toStored]);

    // Each row is checked once until it changes (typing touches one row), so a long table stays
    // quick. A row's columns depend only on its own values and on earlier screens, which do not
    // change while this screen is open; new columns or settings start the cache again.
    const statusCache = React.useRef<{ fields: any[]; config: ScreenTableConfig; map: WeakMap<RowState, RowStatus>; } | null>(null);
    if (!statusCache.current || statusCache.current.fields !== fields || statusCache.current.config !== config) {
        statusCache.current = { fields, config, map: new WeakMap() };
    }
    const statuses = React.useMemo(() => {
        const cache = statusCache.current!.map;
        return rows.map(r => {
            let status = cache.get(r);
            if (!status) {
                status = rowStatus(r);
                cache.set(r, status);
            }
            return status;
        });
    }, [rows, rowStatus]);

    // Stored rows: the rows that hold something (a fixed row left empty did not happen).
    const storedRows = React.useMemo(() => statuses.filter(s => !s.empty).map(s => s.stored), [statuses]);

    const tableErrors = validateTableRows(config, storedRows.length);
    const incompleteCount = statuses.filter(s => !s.empty && !s.complete).length;
    // Why the screen cannot be finished yet, in plain words.
    const messages = [
        ...tableErrors,
        ...(required && !storedRows.length && !tableErrors.length
            ? [isFixed ? 'Fill in at least 1 row.' : 'Add at least 1 row.']
            : []),
        ...(incompleteCount
            ? [`Complete the row${incompleteCount === 1 ? '' : 's'} marked ! (${incompleteCount}).`]
            : []),
    ];

    // Report the stored rows when they change (rows keep their identity until edited).
    const onChangeRef = React.useRef(onChange);
    React.useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    const lastSent = React.useRef<Record<string, any>[] | null>(null);
    React.useEffect(() => {
        const previous = lastSent.current;
        if (previous && previous.length === storedRows.length && previous.every((r, i) => r === storedRows[i])) return;
        lastSent.current = storedRows;
        onChangeRef.current({ [collectionName]: storedRows });
    }, [collectionName, storedRows]);

    const onRowPress = React.useCallback((rowId: number) => {
        setOpenRowId(current => (current === rowId ? null : rowId));
    }, []);

    const setCell = React.useCallback((rowId: number, field: any, value: any) => {
        setRows(prev => prev.map(row => {
            if (row.id !== rowId) return row;
            const previous = row.cells[field.key] || {};
            return {
                ...row,
                cells: {
                    ...row.cells,
                    [field.key]: {
                        ...previous,
                        ...value,
                        key: field.key,
                        type: value?.type || field.type,
                        label: field.label,
                        printable: field.printable !== false,
                        confidential: field.confidential,
                        prePopulate: field.prePopulate,
                        unit: field.unit,
                        ips: field.ips,
                    },
                },
            };
        }));
    }, []);

    const addRow = () => {
        if (max !== null && rows.length >= max) return;
        const row = emptyRow(null);
        setRows(prev => [...prev, row]);
        setOpenRowId(row.id);
    };

    const removeRow = (rowId: number) => {
        setRows(prev => prev.filter(r => r.id !== rowId));
        setOpenRowId(null);
    };

    const rowName = (row: RowState, index: number) => row.rowConfig?.label || `Row ${index + 1}`;
    const openIndex = rows.findIndex(r => r.id === openRowId);
    const openRow = openIndex > -1 ? rows[openIndex] : null;
    const openRowEditable = !!openRow && dateIsToday(openRow.createdAt);
    const nextRow = openIndex > -1 ? rows[openIndex + 1] : undefined;
    const formEntries = React.useMemo(() => Object.entries(openRow?.cells || {})
        .filter(([, v]) => v && typeof v === 'object')
        .map(([key, v]) => ({ key, ...(v as any) })), [openRow?.cells]);

    return (
        <Box style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator>
                <View>
                    <View style={[styles.row, { backgroundColor: theme.colors.primary }]}>
                        <View style={[styles.cell, { width: STATUS_WIDTH }]} />
                        {isFixed && (
                            <View style={[styles.cell, { width: ROW_NAME_WIDTH }]}>
                                <Text style={styles.headingText}>{getRowsHeading(config)}</Text>
                            </View>
                        )}
                        {fields.map(field => (
                            <View key={field.key} style={[styles.cell, { width: COLUMN_WIDTH }]}>
                                <Text style={styles.headingText}>
                                    {`${getColumnHeading(field)}${field.optional ? '' : ' *'}`}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {statuses.map((status, index) => (
                        <TableGridRow
                            key={status.row.id}
                            status={status}
                            index={index}
                            name={rowName(status.row, index)}
                            showName={isFixed}
                            isOpen={status.row.id === openRowId}
                            fields={fields}
                            errorColor={theme.colors.error}
                            onPress={onRowPress}
                        />
                    ))}
                </View>
            </ScrollView>

            <Br spacing="s" />
            <Text color="textSecondary" variant="caption">
                {openRow ? 'Fill in the row below, then tap Done.' : 'Tap a row to fill it in.'}
            </Text>

            {messages.map(message => (
                <Text key={message} color="error" mt="s">{message}</Text>
            ))}

            {!!openRow && (
                <Box mt="m" padding="m" borderRadius="s" style={styles.editor}>
                    <Text variant="title3" mb="m">
                        {isFixed ? rowName(openRow, openIndex) : `Row ${openIndex + 1}`}
                    </Text>

                    {fields.map((field, i) => {
                        const Component = getFieldComponent(field.type);
                        if (!Component || !isShown(openRow, field)) return null;
                        return (
                            <Box key={`${openRow.id}-${field.key}`} mb="l">
                                <Component
                                    field={{ ...field, label: getColumnHeading(field) }}
                                    fieldIndex={i}
                                    entryValue={openRow.cells[field.key]}
                                    formValues={formEntries}
                                    allValues={allValues || []}
                                    repeatable
                                    editable={field.editable || openRowEditable}
                                    conditionMet
                                    formIndex={openIndex}
                                    onChange={(val: any) => setCell(openRow.id, field, val)}
                                    onLinkedFieldChange={(targetKey: string, val: any) => {
                                        const target = fields.find(f => `${f.key}`.toLowerCase() === `${targetKey}`.toLowerCase());
                                        if (target) setCell(openRow.id, target, val);
                                    }}
                                />
                            </Box>
                        );
                    })}

                    <Box flexDirection="row" columnGap="m" justifyContent="flex-end">
                        {!isFixed && openRowEditable && (
                            <Button color="error" onPress={() => removeRow(openRow.id)}>
                                Remove row
                            </Button>
                        )}
                        {!!nextRow && (
                            <Button color="secondary" onPress={() => setOpenRowId(nextRow.id)}>Next row</Button>
                        )}
                        <Button onPress={() => setOpenRowId(null)}>Done</Button>
                    </Box>
                </Box>
            )}

            {!isFixed && (max === null || rows.length < max) && (
                <Box mt="m" alignItems="flex-start">
                    <Button onPress={addRow}>Add row</Button>
                </Box>
            )}

            <Br spacing="xl" />
            <Br spacing="xl" />
        </Box>
    );
}

/** One row of the grid. Memoised: typing in a row re-renders that row only. */
const TableGridRow = React.memo(function TableGridRow({
    status,
    index,
    name,
    showName,
    isOpen,
    fields,
    errorColor,
    onPress,
}: {
    status: RowStatus;
    index: number;
    name: string;
    showName: boolean;
    isOpen: boolean;
    fields: any[];
    errorColor: string;
    onPress: (rowId: number) => void;
}) {
    const { row, empty, complete, stored } = status;
    const needsWork = !empty && !complete;
    const done = !empty && complete;
    return (
        <TouchableOpacity
            onPress={() => onPress(row.id)}
            accessibilityRole="button"
            accessibilityLabel={`${name}${needsWork ? ', incomplete' : (done ? ', complete' : ', empty')}`}
            style={[
                styles.row,
                { backgroundColor: isOpen ? 'rgba(112,164,135,0.15)' : (index % 2 ? '#fafafa' : '#fff') },
            ]}
        >
            <View style={[styles.cell, { width: STATUS_WIDTH, alignItems: 'center' }]}>
                <Text style={{ color: needsWork ? errorColor : (done ? 'green' : '#999') }}>
                    {needsWork ? '!' : (done ? '✓' : '·')}
                </Text>
            </View>
            {showName && (
                <View style={[styles.cell, { width: ROW_NAME_WIDTH }]}>
                    <Text style={{ fontWeight: 'bold' }}>{name}</Text>
                </View>
            )}
            {fields.map(field => {
                const text = getRowCellText(stored, field);
                return (
                    <View key={field.key} style={[styles.cell, { width: COLUMN_WIDTH }]}>
                        <Text color={text ? undefined : 'textDisabled'}>{text || '—'}</Text>
                    </View>
                );
            })}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    cell: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        justifyContent: 'center',
    },
    headingText: {
        color: 'white',
        fontWeight: 'bold',
    },
    editor: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
});
