import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from 'moment';

import { Form } from '@/src/Authentication/SignIn/Form';
import { Modal, Text } from './index';

export function SessionModal() {
    const appState = useRef(AppState.currentState);
    const [shouldLogin, setShouldLogin] = useState(false);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            (async () => {
                if (appState.current === 'active') {
                    if (nextAppState.match(/inactive|background/)) {
                        // App has moved to the background
                        AsyncStorage.setItem('SESSION_TIMEOUT_DATE', new Date().toISOString());
                    }
                }

                if (nextAppState === 'active') {
                    const sessionTimeoutDate = await AsyncStorage.getItem('SESSION_TIMEOUT_DATE');
                    if (sessionTimeoutDate) {
                        AsyncStorage.removeItem('SESSION_TIMEOUT_DATE');
                        const dateNow = moment(new Date());
                        const timeoutDate = moment(sessionTimeoutDate);
                        const minutes = dateNow.diff(timeoutDate, 'minutes', true);

                        if (minutes > 30) setShouldLogin(true);
                    }
                }

                appState.current = nextAppState;
            })();
        });

        return () => {
            subscription.remove();
        };
    }, []);

    const onSignInSuccess = useCallback(async () => {
        setShouldLogin(false);
    }, []);

    return (
        <>
            <Modal
                open={shouldLogin}
                onRequestClose={() => {}}
                onClose={() => {}}
                scrollable={true}
                title="Sign in"
            >
                <Form 
                    onSignInSuccess={onSignInSuccess}
                    message={(
                        <Text
                            mb="l"
                            color="error"
                        >Your session expired, please sign in again!</Text>
                    )}
                />
            </Modal>
        </>
    );
}
