import React from 'react';
import moment from 'moment';
import { ScrollView } from 'react-native';

import { useScriptContext } from '@/src/contexts/script';
import { Box, Br, Button, Content, DatePicker, Dropdown, Modal, Radio, Text } from '@/src/components';
import { parseFieldItems } from '@/src/utils/script-fields-and-items';
import { diffHours } from '@/src/utils/diffHours';
import { toLocalISOString } from '@/src/utils/toLocalISOString';
import * as types from '@/src/types';

type EligibilityCriteriaProps = {
    onEligible: () => void;
};

type EligibilityValue = {
    value: any;
    valueText?: string | null;
    option?: any;
};

const normalizeKey = (key?: string | null) => `${key || ''}`.replace(/^\$/, '').trim().toLowerCase();

const normalizeFieldType = (type?: string | null) => `${type || ''}`.trim().toLowerCase().replace(/[\s-]+/g, '_');

const parseDate = (value: any): Date | null => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    const parsed = new Date(`${value}`.replace(' ', 'T'));
    return isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (value: Date, type: string) => (
    normalizeFieldType(type) === 'date'
        ? moment(value).format('YYYY-MM-DD')
        : moment(value).format('YYYY-MM-DD HH:mm')
);

const dateToValueText = (value: Date | null, format: 'days_hours' | 'years_months' = 'days_hours') => {
    if (!value) return null;

    const hrs = moment().diff(value, 'hours', true);
    const days = moment().diff(value, 'days', true);
    const months = moment().diff(value, 'months', true);
    const years = moment().diff(value, 'years', true);

    if (format === 'years_months') {
        if (months < 12) return `${Math.floor(months)} month${Math.floor(months) === 1 ? '' : 's'}`;
        const yearCount = Math.floor(years);
        const monthCount = Math.min(11, Math.round(months % 12));
        return `${yearCount} year${yearCount > 1 ? 's' : ''}${monthCount ? ` ${monthCount} month${monthCount > 1 ? 's' : ''}` : ''}`;
    }

    if (hrs < 24) {
        const hourCount = hrs < 1 ? parseFloat(hrs.toFixed(2)) : Math.floor(hrs);
        return `${hourCount} hour${hourCount === 1 ? '' : 's'}`;
    }

    const dayCount = Math.floor(days);
    const hourCount = Math.min(23, Math.round(hrs % 24));
    return `${dayCount} day${dayCount > 1 ? 's' : ''}${hourCount ? ` ${hourCount} hour${hourCount > 1 ? 's' : ''}` : ''}`;
};

const makeDateEntry = (key: string, value: Date, label: string, type: string): types.ScreenEntryValue => {
    const valueText = formatDateLabel(value, type);
    return {
        key,
        label,
        value: toLocalISOString(value),
        valueText,
        valueLabel: valueText,
        exportValue: valueText,
        exportLabel: valueText,
        exportType: 'date',
        type,
    };
};

const makeDropdownEntry = (key: string, value: any, option: any, label: string): types.ScreenEntryValue => ({
    key,
    label,
    value,
    valueText: option?.label || `${value}`,
    valueLabel: label,
    exportValue: value,
    exportLabel: option?.label || `${value}`,
    exportType: 'dropdown',
    type: 'dropdown',
});

const getConditionValue = (entry?: types.ScreenEntryValue | null) => {
    if (!entry) return null;
    if (entry.calculateValue !== null && entry.calculateValue !== undefined) {
        const numericValue = Number(entry.calculateValue);
        if (normalizeFieldType(entry.type) === 'period' && !isNaN(numericValue)) {
            return numericValue / 24;
        }
        return entry.calculateValue;
    }
    return entry.value ?? entry.valueText;
};

/**
 * Safely evaluates a condition expression without using eval().
 * Converts condition string to a safe JavaScript expression and evaluates it.
 */
const evaluateEligibilityCondition = (
    condition: string,
    values: types.ScreenEntryValue[],
    self: any,
) => {
    if (!condition) return false;

    const record = values.reduce((acc, entry) => {
        if (entry.key) acc[normalizeKey(entry.key)] = getConditionValue(entry);
        return acc;
    }, { self } as Record<string, any>);

    const expression = condition
        .replace(/\band\b/gi, '&&')
        .replace(/\bor\b/gi, '||')
        .replace(/([^<>=!])=([^=])/g, '$1==$2')
        .replace(/\$([A-Za-z0-9_.-]+)/g, (_, rawKey) => JSON.stringify(record[normalizeKey(rawKey)] ?? null));

    try {
        // Use Function constructor instead of eval for better security and performance
        // This is still safer than eval as it doesn't have access to local scope
        const evaluator = new Function('record', `return ${expression}`);
        return Boolean(evaluator(record));
    } catch (error) {
        console.warn('Failed to evaluate condition:', condition, error);
        return false;
    }
};

export function EligibilityCriteria({ onEligible }: EligibilityCriteriaProps) {
    const {
        navigation,
        script,
        screens,
        setEligibilityAutoFillValues,
    } = useScriptContext();

    const criteria = script?.data?.eligibilityCriteria;
    const [feasibility, setFeasibility] = React.useState<EligibilityValue | null>(null);
    const [mainValue, setMainValue] = React.useState<EligibilityValue | null>(null);
    const [alternativeValue, setAlternativeValue] = React.useState<EligibilityValue | null>(null);
    const [showBlockedModal, setShowBlockedModal] = React.useState(false);
    const [showClosingModal, setShowClosingModal] = React.useState(false);
    const [closingCountdown, setClosingCountdown] = React.useState(5);
    const criteriaFailureMessage = criteria?.failure_message || null;

    const closeScript = React.useCallback(() => {
        setShowClosingModal(false);
        navigation.navigate('Home');
    }, [navigation]);

    React.useEffect(() => {
        if (!showClosingModal) return undefined;
        if (closingCountdown <= 0) {
            closeScript();
            return undefined;
        }

        const timeout = setTimeout(() => {
            setClosingCountdown(currentCountdown => currentCountdown - 1);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [closeScript, closingCountdown, showClosingModal]);

    const hasAlternative = Boolean(criteria?.alternative_criteria_type && criteria?.alternative_criteria_condition);
    const feasibilityEntry = React.useMemo<types.ScreenEntryValue | null>(() => {
        if (!feasibility) return null;
        return {
            key: 'feasibilityprompt',
            value: feasibility.valueText || feasibility.value,
            valueText: feasibility.valueText || `${feasibility.value}`,
            label: criteria?.feasibilityprompt?.criteria_label,
            type: 'yesno',
        };
    }, [criteria?.feasibilityprompt?.criteria_label, feasibility]);

    const useAlternative = React.useMemo(() => {
        if (!hasAlternative || !feasibilityEntry) return false;
        if (criteria?.alternative_activation_condition) {
            return evaluateEligibilityCondition(
                criteria.alternative_activation_condition,
                [feasibilityEntry],
                feasibilityEntry.valueText || feasibilityEntry.value,
            );
        }
        return `${feasibilityEntry.valueText || feasibilityEntry.value}`.toLowerCase() === 'no';
    }, [criteria?.alternative_activation_condition, feasibilityEntry, hasAlternative]);

    React.useEffect(() => {
        setMainValue(null);
        setAlternativeValue(null);
    }, [useAlternative]);

    const activeDefinition = React.useMemo(() => {
        if (useAlternative) {
            return {
                type: criteria?.alternative_criteria_type,
                label: criteria?.alternative_criteria_label,
                autoFills: criteria?.alternative_auto_fills,
                condition: criteria?.alternative_criteria_condition,
                items: criteria?.alternative_items || [],
                minDate: criteria?.alternative_min_date_current ? 'date_now' : criteria?.alternative_min_date,
                maxDate: criteria?.alternative_max_date_current ? 'date_now' : criteria?.alternative_max_date,
                value: alternativeValue,
            };
        }

        return {
            type: criteria?.criteria_type,
            label: criteria?.criteria_label,
            autoFills: criteria?.auto_fills,
            condition: criteria?.criteria_condition,
            items: criteria?.items || [],
            minDate: criteria?.min_date_current ? 'date_now' : criteria?.min_date,
            maxDate: criteria?.max_date_current ? 'date_now' : criteria?.max_date,
            value: mainValue,
        };
    }, [alternativeValue, criteria, mainValue, useAlternative]);

    const allScriptFields = React.useMemo(() => {
        const result: any[] = [];
        screens.forEach(screen => {
            if (!screen) return;
            const fields = screen?.data?.metadata?.fields || [];
            if (screen?.data?.metadata?.key) {
                result.push({
                    ...screen.data.metadata,
                    type: screen.type,
                    condition: screen.data?.condition,
                });
            }
            result.push(...fields);
        });
        return result;
    }, [screens]);


    const buildAutoFillValues = React.useCallback(() => {
        const values: types.ScreenEntryValue[] = [];
        const autoFillKey = activeDefinition.autoFills;
        const picked = activeDefinition.value;

        if (!autoFillKey || !picked?.value) return values;

        const type = normalizeFieldType(activeDefinition.type);
        if (['date', 'datetime'].includes(type)) {
            const parsed = parseDate(picked.value);
            if (parsed) values.push(makeDateEntry(autoFillKey, parsed, activeDefinition.label || autoFillKey, type));
        } else if (type === 'dropdown') {
            values.push(makeDropdownEntry(autoFillKey, picked.value, picked.option, activeDefinition.label || autoFillKey));
        } else if (type === 'yesno') {
            values.push({
                key: autoFillKey,
                label: activeDefinition.label || autoFillKey,
                value: picked.valueText || picked.value,
                valueText: picked.valueText || `${picked.value}`,
                exportValue: picked.valueText || picked.value,
                exportLabel: picked.valueText || `${picked.value}`,
                exportType: 'yesno',
                type: 'yesno',
            });
        }

        const knownKeys = new Set(values.map(v => normalizeKey(v.key)));
        allScriptFields.forEach(field => {
            const fieldType = normalizeFieldType(field?.type);
            if (fieldType !== 'period') return;
            const refKey = normalizeKey(field?.calculation || field?.refKey);
            if (!refKey || !knownKeys.has(refKey)) return;

            const source = values.find(v => normalizeKey(v.key) === refKey);
            const sourceDate = parseDate(source?.value);
            if (!sourceDate) return;

            const calculateValue = diffHours(sourceDate, new Date());

            // Validate diffHours result
            if (typeof calculateValue !== 'number' || isNaN(calculateValue)) {
                console.warn(`Invalid diffHours result for field ${field?.key}`);
                return;
            }

            const valueText = dateToValueText(sourceDate, field?.format);
            values.push({
                key: field.key,
                label: field.label,
                value: toLocalISOString(sourceDate),
                valueText,
                valueLabel: valueText,
                exportLabel: valueText,
                exportValue: calculateValue,
                calculateValue,
                exportType: 'number',
                type: field.type,
            });
            knownKeys.add(normalizeKey(field.key));
        });

        // Only auto-fill the specific criteria?.auto_fills or criteria?.alternative_auto_fills field.
        // Don't infer any other values from field conditions.
        return values;
    }, [activeDefinition, allScriptFields]);

    const activeValues = React.useMemo(() => {
        const values = buildAutoFillValues();
        if (feasibilityEntry) values.push(feasibilityEntry);
        return values;
    }, [buildAutoFillValues, feasibilityEntry]);

    if (!criteria) return null;

    const renderYesNo = React.useCallback((
        label: string,
        value: EligibilityValue | null,
        onChange: (value: EligibilityValue) => void,
        items?: any[],
    ) => {
        const options = (items?.length ? items : [
            { itemId: 'yes', value: 'yes', label: 'Yes' },
            { itemId: 'no', value: 'no', label: 'No' },
        ]);

        return (
            <Box>
                <Text>{label}</Text>
                <Br spacing="m" />
                {options.map(item => {
                    const itemValue = String(item.value);
                    const selectedValue = String(value?.value ?? '');
                    const isChecked = selectedValue === itemValue;

                    return (
                        <React.Fragment key={item.itemId || item.value}>
                            <Radio
                                value={item.value}
                                checked={isChecked}
                                label={item.label}
                                onChange={() => onChange({ value: item.value, valueText: item.label, option: item })}
                            />
                            <Br spacing="m" />
                        </React.Fragment>
                    );
                })}
            </Box>
        );
    }, []);

    const renderCriterionInput = React.useCallback(() => {
        const type = normalizeFieldType(activeDefinition.type);
        const value = activeDefinition.value;
        const setValue = useAlternative ? setAlternativeValue : setMainValue;

        // Validate required properties
        if (!type) {
            console.warn('Invalid field type in activeDefinition');
            return <Text>Invalid field type</Text>;
        }

        if (!activeDefinition.autoFills) {
            console.warn('Missing autoFills in activeDefinition');
            return <Text>Configuration error</Text>;
        }

        if (['date', 'datetime'].includes(type)) {
            return (
                <DatePicker
                    label={activeDefinition.label}
                    mode={type === 'date' ? 'date' : 'datetime'}
                    value={parseDate(value?.value)}
                    valueText={value?.valueText || undefined}
                    minDate={activeDefinition.minDate || undefined}
                    maxDate={activeDefinition.maxDate || undefined}
                    fieldKey={activeDefinition.autoFills}
                    onChange={date => setValue({
                        value: date ? toLocalISOString(date) : null,
                        valueText: date ? formatDateLabel(date, type) : null,
                    })}
                />
            );
        }

        if (type === 'dropdown') {
            const options = parseFieldItems({ items: activeDefinition.items || [] });
            return (
                <Dropdown
                    label={activeDefinition.label}
                    title={activeDefinition.label}
                    searchable={options.length > 5}
                    options={options}
                    value={value?.value}
                    onChange={(nextValue, option) => setValue({
                        value: nextValue,
                        valueText: option.label as string,
                        option,
                    })}
                />
            );
        }

        if (type === 'yesno') {
            return renderYesNo(activeDefinition.label || '', value, setValue, activeDefinition.items);
        }

        return null;
    }, [activeDefinition, useAlternative]);

    const canContinue = !(
        activeDefinition.value?.value === null ||
        activeDefinition.value?.value === undefined ||
        activeDefinition.value?.value === ''
    );

    return (
        <Box flex={1} paddingTop="xl" backgroundColor="white">
            <ScrollView contentContainerStyle={{ minHeight: '100%' }}>
                <Content>
                    {criteria.feasibilityprompt && (
                        <>
                            {renderYesNo(
                                criteria.feasibilityprompt.criteria_label,
                                feasibility,
                                setFeasibility,
                                criteria.feasibilityprompt.items,
                            )}
                            <Br spacing="l" />
                        </>
                    )}

                    {(!criteria.feasibilityprompt || feasibility) && renderCriterionInput()}
                </Content>
            </ScrollView>

            <Box borderTopColor="divider" borderTopWidth={1}>
                <Content>
                    <Button
                        disabled={!canContinue}
                        onPress={() => {
                            // Validate activeDefinition has required properties
                            if (!activeDefinition.autoFills) {
                                console.warn('Missing autoFills in activeDefinition');
                                return;
                            }

                            // Always validate the eligibility condition to ensure unmet criteria is properly handled
                            const autoFillNormalizedKey = normalizeKey(activeDefinition.autoFills);
                            const autoFillEntry = activeValues.find(v => normalizeKey(v.key) === autoFillNormalizedKey);
                            const selfValue = getConditionValue(autoFillEntry) ?? activeDefinition.value?.valueText ?? activeDefinition.value?.value;

                            const passed = evaluateEligibilityCondition(
                                activeDefinition.condition || '',
                                activeValues,
                                selfValue,
                            );

                            if (passed) {
                                setEligibilityAutoFillValues(buildAutoFillValues());
                                onEligible();
                            } else {
                                setShowBlockedModal(true);
                            }
                        }}
                    >Continue</Button>
                </Content>
            </Box>

            <Modal
                open={showBlockedModal}
                onClose={() => setShowBlockedModal(false)}
                title={<Text variant="title2" fontWeight="bold" style={{ color: '#800000' }}>Eligibility criteria not met</Text>}
                actions={[
                    {
                        label: 'Review',
                        color: 'success',
                        onPress: () => setShowBlockedModal(false),
                    },
                    {
                        label: 'Proceed',
                        color: 'error',
                        onPress: () => {
                            setShowBlockedModal(false);
                            setEligibilityAutoFillValues([]);
                            setClosingCountdown(5);
                            setShowClosingModal(true);
                        },
                    },
                ]}
            >
                <Box
                    padding="m"
                    borderRadius="s"
                    style={{ backgroundColor: 'rgba(128, 0, 0, 0.08)' }}
                >
                    <Text fontWeight="bold" style={{ color: '#800000' }}>
                        {criteriaFailureMessage || (
                            <>
                                The eligibility criteria has not been met. If you are sure that you have entered the correct information press{' '}
                                <Text fontWeight="bold" color="error">Proceed</Text>
                                {' '}to exit the form. If not, press{' '}
                                <Text fontWeight="bold" color="success">Review</Text>
                                {' '}to adjust the information.
                            </>
                        )}
                    </Text>
                </Box>
            </Modal>

            <Modal
                open={showClosingModal}
                onClose={closeScript}
                onRequestClose={closeScript}
                title={<Text variant="title2" fontWeight="bold" color="info">Closing script</Text>}
                actions={[
                    {
                        label: 'OK',
                        color: 'info',
                        onPress: closeScript,
                    },
                ]}
            >
                <Box
                    padding="m"
                    borderRadius="s"
                    style={{ backgroundColor: 'rgba(2, 136, 209, 0.08)' }}
                >
                    <Text fontWeight="bold" color="info">
                        We are closing the script in {closingCountdown}...
                    </Text>
                </Box>
            </Modal>
        </Box>
    );
}
