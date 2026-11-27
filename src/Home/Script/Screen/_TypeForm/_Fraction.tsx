import React from 'react';

import { Box, Text, TextInput } from '@/src/components';
import * as types from '@/src/types';
import { buildFractionFieldValue, getFractionLabels } from '@/src/utils/fraction-values';

type FractionFieldProps = types.ScreenFormTypeProps & {};

/**
 * A fraction, e.g. blood pressure 120 / 80: two number inputs labelled from the data key
 * (Systolic / Diastolic). The field's value holds both numbers; the form stores them as
 * <key>_numerator and <key>_denominator (see src/utils/fraction-values.ts).
 */
export function FractionField({ field, onChange, conditionMet, entryValue, repeatable, editable }: FractionFieldProps) {
    const canEdit = repeatable ? editable : true;
    const { numeratorLabel, denominatorLabel } = getFractionLabels(field);

    const [numerator, setNumerator] = React.useState<string>(`${entryValue?.numerator ?? ''}`);
    const [denominator, setDenominator] = React.useState<string>(`${entryValue?.denominator ?? ''}`);
    const [touched, setTouched] = React.useState(false);

    const current = React.useMemo(
        () => buildFractionFieldValue(field, numerator, denominator),
        [field, numerator, denominator],
    );

    const update = React.useCallback((nextNumerator: string, nextDenominator: string) => {
        setNumerator(nextNumerator);
        setDenominator(nextDenominator);
        onChange(buildFractionFieldValue(field, nextNumerator, nextDenominator));
    }, [field, onChange]);

    React.useEffect(() => {
        if (!conditionMet) {
            setNumerator('');
            setDenominator('');
            onChange(buildFractionFieldValue(field, '', ''));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conditionMet]);

    const pairError = touched && !current.numeratorError && !current.denominatorError ? current.error : '';
    const unit = `${field?.unit ?? ''}`.trim();

    return (
        <Box>
            <Text color="textSecondary" mb="s">
                {`${field.label || ''}${field.optional ? '' : ' *'}${unit ? ` (${unit})` : ''}`}
            </Text>

            <Box flexDirection="row" alignItems="flex-start" columnGap="s">
                <Box flex={1}>
                    <TextInput
                        label={numeratorLabel}
                        value={numerator}
                        keyboardType="numeric"
                        errors={current.numeratorError ? [current.numeratorError] : []}
                        editable={conditionMet && canEdit}
                        onChangeText={value => update(value, denominator)}
                        onBlur={() => setTouched(true)}
                    />
                </Box>

                <Box pt="xl" alignItems="center" justifyContent="center">
                    <Text variant="title2" color="textSecondary">/</Text>
                </Box>

                <Box flex={1}>
                    <TextInput
                        label={denominatorLabel}
                        value={denominator}
                        keyboardType="numeric"
                        errors={current.denominatorError ? [current.denominatorError] : []}
                        editable={conditionMet && canEdit}
                        onChangeText={value => update(numerator, value)}
                        onBlur={() => setTouched(true)}
                    />
                </Box>
            </Box>

            {!!pairError && (
                <Text color="error" mt="s" variant="caption">{pairError}</Text>
            )}
        </Box>
    );
}
