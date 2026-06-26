import React, { Fragment, useState } from 'react';
import { Alert, Keyboard, ScrollView } from 'react-native';

import { useScriptContext } from '@/src/contexts/script';
import { hasBidStillBirthOutcomeOptions } from '@/src/utils/bid-stillbirth-outcome';
import { Box, Button, Content, Text } from '../../../components';
import { Field } from './field';
import * as types from '../../../types';

function isStandardNuidSearchField(field: any) {
    const key = `${field?.key ?? ''}`.toLowerCase();
    const label = `${field?.label ?? ''}`.toLowerCase();

    return field?.type === 'text'
        && !key.includes('twin')
        && !label.includes('twin')
        && !key.includes('transfer')
        && !key.includes('transfered')
        && !key.includes('transferred')
        && !label.includes('transfer')
        && !label.includes('transferred');
}

export function Start() {
    const { 
        evaluateCondition,
        parseCondition,
        setNuidSearchForm,
        setStartSessionMode,
        setActiveScreen,
        saveSession,
        setActiveScreenIndex,
        screens, 
        matched, 
        script: { 
            type,
            data: {
                nuidSearchFields = [], 
            },
        }, 
    } = useScriptContext();


    const [keyboardIsOpen, setKeyboardIsOpen] = React.useState(false);
    const [starting, setStarting] = React.useState(false);

    const [fields, setFields] = useState<types.NuidSearchFormField[]>(nuidSearchFields.map((f: any) => ({
        key: f.key,
        value: null,
        condition: f.condition,
        type: f.type,
        results: null,
    })));

    const evaluateFieldCondition = React.useCallback((f: any) => {
        let conditionMet = true;
        const values = fields;
        if (f.condition) conditionMet = evaluateCondition(parseCondition(f.condition, [{ values }])) as boolean;
        return conditionMet;
    }, [evaluateCondition, fields, parseCondition]);

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardIsOpen(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardIsOpen(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    const hasResolvedVisibleSearchFields = nuidSearchFields.every((field: any, i: number) => {
        if (field.type !== 'text') return true;
        if (!evaluateFieldCondition(field)) return true;
        return Boolean(fields[i]?.results && (fields[i]?.value || fields[i]?.results?.continueWithoutPrePopulation));
    });

    const canStart = Boolean(screens?.length) && hasResolvedVisibleSearchFields;
    const canStartWithoutNuid = Boolean(screens?.length) && nuidSearchFields.some((field: any) => (
        isStandardNuidSearchField(field) && evaluateFieldCondition(field)
    ));

    const startSession = React.useCallback(async (
        nextFields: types.NuidSearchFormField[],
        nextStartSessionMode: null | 'bidStillBirth' = null
    ) => {
        try {
            setStarting(true);
            setNuidSearchForm(nextFields);
            setStartSessionMode(nextStartSessionMode);
            await saveSession({
                nuidSearchForm: nextFields,
                startSessionMode: nextStartSessionMode,
            });
            setActiveScreen(screens[0]);
            setActiveScreenIndex(0);
        } catch (error) {
            const message = error instanceof Error ? error.message : '';
            if (!message.includes('requires the searched Neotree ID')) {
                Alert.alert(
                    'Unable to start session',
                    message
                        ? `The session could not be started because: ${message}`
                        : 'The session could not be started. Please check the form setup and try again.'
                );
            }
        } finally {
            setStarting(false);
        }
    }, [saveSession, screens, setActiveScreen, setActiveScreenIndex, setNuidSearchForm, setStartSessionMode]);

    const startSessionWithoutNuid = React.useCallback(() => {
        if (!hasBidStillBirthOutcomeOptions(screens)) {
            Alert.alert(
                'BID/StillBirth outcome unavailable',
                'The current script does not have any NeoTreeOutcome options related to BID or StillBirth.'
            );
            return;
        }

        const nextFields = fields.map((field, i) => {
            const searchField = nuidSearchFields[i];
            if (!isStandardNuidSearchField(searchField) || !evaluateFieldCondition(searchField)) return field;

            return {
                ...field,
                value: null,
                results: {
                    session: null,
                    uid: '',
                    searchedUid: '',
                    prePopulateWithUID: false,
                    continueWithoutPrePopulation: true,
                    useSearchedUidForSession: false,
                },
            };
        });

        setFields(nextFields);
        startSession(nextFields, 'bidStillBirth');
    }, [evaluateFieldCondition, fields, nuidSearchFields, screens, startSession]);

    return (
        <Box flex={1} paddingTop="xl">
            <ScrollView
                contentContainerStyle={{ minHeight: '100%', }}
            >
                <Content>
                    {nuidSearchFields.map((field: any, i: number) => {
                        const conditionMet = evaluateFieldCondition(field);

                        if (!conditionMet) return null;

                        return (
                            <Fragment key={i}>
                                <Field 
                                    field={field}
                                    value={fields[i].value}
                                    script_type ={type}
                                    onChange={value => {
                                        let results: types.NuidSearchResults | null = null;

                                        if (field.type === 'text') {
                                            results = value;
                                            value = value?.uid || null;
                                        }

                                        const newState = fields.map((f, j) => {
                                            if (j === i) return { ...f, value, results, };
                                            return f;
                                        });
                                        setFields(newState);
                                        
                                    }
                                  
                                }
                                />
                                <Box marginVertical="l" />
                            </Fragment>
                        )
                    })}
                </Content>

                {keyboardIsOpen && <Box height={300} />}
            </ScrollView>

            {keyboardIsOpen ? null : (
                <Box  
                    borderTopColor="divider"
                    borderTopWidth={1}
                >
                    <Content>
                        {!matched?.session && (
                            <Box
                                padding="m"
                            >
                                <Text textAlign="center">Start a new session</Text>
                            </Box>
                        )}

                        <Button
                            disabled={!canStart || starting}
                            onPress={() => startSession(fields)}
                        >{matched?.session ? 'Continue' : 'Start'}</Button>

                        {canStartWithoutNuid ? (
                            <>
                                <Box marginVertical="s" />
                                <Button
                                    color="secondary"
                                    disabled={starting || !screens?.length}
                                    onPress={startSessionWithoutNuid}
                                >BID/StillBirth</Button>
                            </>
                        ) : null}
                    </Content>
                </Box>
            )}
        </Box>
    );
}
