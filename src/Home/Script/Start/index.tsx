import React, { Fragment, useState } from 'react';
import { Keyboard, ScrollView } from 'react-native';
import { Box, Button, Content, Text } from '../../../components';
import { useContext } from '../Context';
import { Field } from './field';
import * as types from '../../../types';

export function Start() {
    const { 
        evaluateCondition,
        parseCondition,
        setNuidSearchForm,
        setActiveScreen,
        saveSession,
        setActiveScreenIndex,
        screens, 
        matched, 
        script: { 
            data: {
                nuidSearchFields = [], 
            },
        }, 
    } = useContext()||{};

    const [keyboardIsOpen, setKeyboardIsOpen] = React.useState(false);

    const [fields, setFields] = useState<types.NuidSearchFormField[]>(nuidSearchFields.map((f: any) => ({
        key: f.key,
        value: null,
        condition: f.condition,
        type: f.type,
        results: null,
    })));

    const evaluateFieldCondition = (f: any) => {
        let conditionMet = true;
        const values = fields;
        if (f.condition) conditionMet = evaluateCondition(parseCondition(f.condition, [{ values }])) as boolean;
        return conditionMet;
    };

    React.useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardIsOpen(true));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardIsOpen(false));
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

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
                                    onChange={value => {
                                        let results = null;

                                        if (field.type === 'text') {
                                            results = value;
                                            value = value?.uid || null;
                                        }

                                        const newState = fields.map((f, j) => {
                                            if (j === i) return { ...f, value, results, };
                                            return f;
                                        });
                                        setFields(newState);
                                    }}
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
                            disabled={!screens?.length}
                            onPress={() => {
                                (async () => {
									try {
                                        setNuidSearchForm(fields);
										setActiveScreen(screens[0]);
										setActiveScreenIndex(0);
										saveSession();
									} catch(e) { /**/ }
								})();
                            }}
                        >{matched?.session ? 'Continue' : 'Start'}</Button>
                    </Content>
                </Box>
            )}
        </Box>
    );
}
