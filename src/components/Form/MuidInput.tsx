import React from 'react';
import { Box, Text } from '../Theme';
import { Br } from '../Br';
import { TextInput } from './TextInput';
import { formatNeotreeIDInput, looksLikeMuid, NEOTREE_ID_MAX_LENGTH } from '@/src/utils/neotreeId';
import { MUID_LENGTH, normaliseMuid, validateMuid } from '@/src/utils/muid';
import { validateUID } from '@/src/utils/uid-validate';

export type MuidInputProps = {
    label?: string;
    /** "muid": only MUIDs are accepted. "any": a MUID or a NUID (screens that aren't tied to a script). */
    accept?: 'muid' | 'any';
    autoGenerateValue?: boolean;
    defaultValue?: string;
    generatedUID?: string;
    onChange: (value: string, isManual?: boolean) => void;
    value?: any;
    disabled?: boolean;
};

/**
 * One field for a MUID (M0K7Q-000001R). The hyphen goes in by itself after the tablet part, it can be typed
 * in any case, and O/I/L are read as 0/1/1. It reports the stored form (with the hyphen), and only once
 * the check character matches; a half-typed or mistyped ID reports ''.
 */
export function MuidInput({
    label, accept = 'muid', autoGenerateValue, defaultValue, generatedUID, onChange, value, disabled,
}: MuidInputProps) {
    const initial = `${value || (autoGenerateValue ? (defaultValue || generatedUID || '') : '')}`;
    const [text, setText] = React.useState(() => formatNeotreeIDInput(initial));
    const manualRef = React.useRef(false);
    const onChangeRef = React.useRef(onChange);

    React.useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

    const check = React.useCallback((t: string): { ok: boolean; stored: string; errors: string[] } => {
        if (!t) return { ok: false, stored: '', errors: [] };
        if (accept === 'any' && !looksLikeMuid(t)) {
            const nuid = validateUID(t);
            return { ok: nuid.isValid, stored: nuid.isValid ? t : '', errors: [] };
        }
        const v = validateMuid(t);
        // Say nothing until the ID is complete, except for a character that can never be right.
        const early = normaliseMuid(t).length < MUID_LENGTH && v.problem === 'length';
        return { ok: v.isValid, stored: v.stored, errors: v.isValid || early ? [] : [v.message] };
    }, [accept]);

    const { stored, errors } = check(text);

    // Report changes (and the first value) to the form.
    React.useEffect(() => {
        onChangeRef.current(stored, manualRef.current);
        manualRef.current = false;
    }, [stored]);

    // Follow a value set from outside (a scanned QR code, a searched session).
    React.useEffect(() => {
        if (!value) return;
        const next = formatNeotreeIDInput(`${value}`);
        setText(current => (normaliseMuid(current) === normaliseMuid(next) ? current : next));
    }, [value]);

    return (
        <Box>
            {!!label && (
                <>
                    <Text>{label}</Text>
                    <Br spacing="s" />
                </>
            )}
            <TextInput
                autoCorrect={false}
                autoCapitalize="characters"
                // The shared default keyboard ignores autoCapitalize on Android; this one honours it.
                keyboardType="default"
                editable={!disabled}
                maxLength={NEOTREE_ID_MAX_LENGTH}
                value={text}
                placeholder={accept === 'muid' ? 'M0K7Q-000001R' : 'M0K7Q-000001R or FB8E-1230042'}
                onChangeText={raw => {
                    manualRef.current = true;
                    setText(formatNeotreeIDInput(raw, text));
                }}
                errors={disabled ? undefined : errors}
            />
        </Box>
    );
}
