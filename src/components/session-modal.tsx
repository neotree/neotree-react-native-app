import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { Form } from '@/src/Authentication/SignIn/Form';
import { Modal } from './index';

export function SessionModal() {
    const appState = useRef(AppState.currentState);
    const [shouldLogin, setShouldLogin] = useState(false);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
                console.log('App has moved to the background. Save data here!');
                // Insert your quick cleanup logic or AsyncStorage saving here
                setShouldLogin(true);
            }
            appState.current = nextAppState;
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
                />
            </Modal>
        </>
    );
}
