import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import moment from 'moment';

import { useScriptContext } from '@/src/contexts/script';
import { Box, Br, Button, NeotreeIDInput, Text, Dropdown, Radio, theme, Modal } from '../../../components';
import * as api from '../../../data';
import * as types from '../../../types';
import { QRCodeScan } from '@/src/components/Session/QRScan/QRCodeScan';

type SearchProps = {
    onSession?: (data: null | types.MatchedSession) => void;
    label: string;
    autofillKeys?: string[];
    filterEntries?: (entry: any) => any;
    prePopulateWithUID?: boolean;
    useSearchedUidForSession?: boolean;
    noRecordTitle?: string;
    noRecordMessage?: (uid: string) => string;
};

const getSessionKey = (session: any, index?: number) => {
    return `${session?.data?.unique_key || session?.data?.uid || session?.uid || session?.data?.id || (index ?? '')}`;
};

const getSessionTitle = (session: any) => {
    return session?.data?.title || session?.data?.script?.title || session?.data?.script?.data?.title || 'Unknown script';
};

const getSessionType = (session: any) => {
    return session?.data?.type || session?.data?.script?.type || '';
};

const getSessionDate = (session: any) => {
    return session?.data?.completed_at || session?.data?.started_at || session?.ingested_at || session?.created_at;
};

function getSessionFacility(session: any) {
    const birthFacility = session?.data?.entries?.BirthFacility?.values;
    const otherBirthFacility = session?.data?.entries?.OtherBirthFacility?.values;
    const birthFacilityLabel = birthFacility?.label ? birthFacility.label[0] : '';
    const birthFacilityValue = birthFacility?.value ? birthFacility.value[0] : '';
    const otherBirthFacilityValue = otherBirthFacility?.value ? otherBirthFacility.value[0] : '';
    return { label: birthFacilityLabel, value: birthFacilityValue, other: otherBirthFacilityValue, };
}

const hasFullQrSession = (session: any) => {
    return !!session && typeof session === 'object' && Object.keys(session).length > 1;
};

const normalizeQrSession = (session: any) => {
    if (!hasFullQrSession(session)) return session;
    if (session?.data) {
        return {
            ...session,
            uid: session.uid || session.data?.uid,
        };
    }

    return {
        uid: session.uid || session.data?.uid,
        data: {
            ...session,
            uid: session.uid,
            entries: session.entries || {},
            script: session.script || {
                type: session.type,
                title: session.title || session.scriptTitle,
                id: session.script_id || session.scriptId,
            },
        },
    };
};

const mergeSearchResults = (...groups: any[][]) => {
    const seen = new Set<string>();
    return groups.flat().filter((session, index) => {
        if (!session || session.error) return false;
        const key = getSessionKey(session, index);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};


export function Search({
    onSession,
    label,
    autofillKeys,
    filterEntries,
    prePopulateWithUID,
    useSearchedUidForSession = prePopulateWithUID !== false,
    noRecordTitle = 'No matching record found',
    noRecordMessage,
}: SearchProps) {
    const { setMatched } = useScriptContext();

    const [uid, setUID] = React.useState('');
    const [sessions, setSessions] = React.useState<Awaited<ReturnType<typeof api.getExportedSessionsByUID>>>([]);
    const [sessionType, setSessionType] = React.useState('admission');
    const [selectedSession, setSelectedSession] = React.useState<any>(null);
    const [facility, setFacility] = React.useState<null | types.Facility>(null);
    const [searched, setSearched] = React.useState('');
    const [showQR, setShowQR] = React.useState(false);
    const [qrSession, setQRSession] = React.useState<any>(null);
    const [searchedFromQR, setSearchedFromQR] = React.useState(false);
    const [recommendedSessionKey, setRecommendedSessionKey] = React.useState('');
    const [recommendedSession, setRecommendedSession] = React.useState<any>(null);
    const [confirmNoRecord, setConfirmNoRecord] = React.useState(false);
    const qrSessionRef = React.useRef<any[]>([]);
    const qrUidRef = React.useRef('');

    const openQRscanner = () => {
        setShowQR(true);
    };

    const resetSearchState = React.useCallback(() => {
        setSessions([]);
        setSelectedSession(null);
        setFacility(null);
        setSessionType('admission');
        setSearched('');
        setQRSession(null);
        qrSessionRef.current = [];
        qrUidRef.current = '';
        setSearchedFromQR(false);
        setRecommendedSessionKey('');
        setRecommendedSession(null);
        setConfirmNoRecord(false);
        setMatched(null);
        if (onSession) onSession(null);
    }, [onSession, setMatched]);

    const handleUIDChange = React.useCallback((nextUID: string) => {
        if (qrUidRef.current && (!nextUID || nextUID === qrUidRef.current)) {
            setUID(qrUidRef.current);
            return;
        }
        setUID(nextUID);
        resetSearchState();
    }, [resetSearchState]);

    const onQrRead = (qrtext: any) => {
        if (qrtext) {
            resetSearchState();
            setSearchedFromQR(true);
            const session = normalizeQrSession(qrtext)
            if (session['uid']) {
                qrUidRef.current = session['uid']
                setUID(session['uid'])
                if (Object.keys(session).length > 1) {
                    const sessions = [session];
                    qrSessionRef.current = sessions;
                    setQRSession(sessions)
                    setRecommendedSessionKey(getSessionKey(session, 0))
                    setRecommendedSession(session)
                    setSessionType('qr')
                }

            } else {
                setUID(session)
            }

        }
        setShowQR(false);
    };


    const [searching, setSearching] = React.useState(false);

    const buildMatchedSession = React.useCallback((session: any) => {
        let autoFill = session ? JSON.parse(JSON.stringify(session)) : null;

        if (autoFill) {
            if (filterEntries) {
                autoFill.data.entries = Object.keys(autoFill.data.entries).reduce((acc: any, key) => {
                    if (filterEntries(autoFill.data.entries[key])) acc[key] = autoFill.data.entries[key];
                    return acc;
                }, {});
            }
            if (autofillKeys) {
                autoFill.data.entries = autofillKeys.reduce((acc: any, key) => {
                    if (autoFill.data.entries[key]) acc[key] = autoFill.data.entries[key];
                    return acc;
                }, {});
            }
        }

        return session ? {
            session,
            uid,
            facility: facility as types.Facility,
            autoFill,
            prePopulateWithUID,
            useSearchedUidForSession,
        } : null;
    }, [autofillKeys, facility, filterEntries, prePopulateWithUID, uid, useSearchedUidForSession]);

    const resolveUIDWithoutMatch = React.useCallback(() => {
        const initialSession = {
            session: null,
            uid: useSearchedUidForSession ? uid : '',
            searchedUid: uid,
            facility: facility as types.Facility,
            autoFill: null,
            prePopulateWithUID: prePopulateWithUID !== false,
            continueWithoutPrePopulation: true,
            useSearchedUidForSession,
        }
        setConfirmNoRecord(false);
        if (onSession) onSession(initialSession);
        setMatched(initialSession);
    }, [facility, onSession, prePopulateWithUID, setMatched, uid, useSearchedUidForSession]);

    const search = React.useCallback(() => {
        (async () => {
            try {
                setMatched(null);
                if (onSession) onSession(null);
                setSelectedSession(null);
                setSearching(true);
                const qrResults = qrSessionRef.current?.length
                    ? qrSessionRef.current
                    : (qrUidRef.current === uid && qrSession?.length ? qrSession : []);
                let lookupResults: any[] = [];
                let lookupError: any = null;

                try {
                    lookupResults = await api.getExportedSessionsByUID(uid);
                } catch (error) {
                    lookupError = error;
                }
                if (lookupResults?.[0]?.error) lookupError = lookupResults[0];

                const sessions = mergeSearchResults(qrResults, lookupResults || []);
                setSessions(sessions);
                setSearching(false);
                setSearched(uid);
                if (lookupError && !sessions.length) {
                    setConfirmNoRecord(true);
                    return;
                }
                if (!sessions?.length) {
                    setConfirmNoRecord(true);
                    return;
                }

                if (searchedFromQR && sessions?.length) {
                    const recommended = sessions[0];
                    const matched = buildMatchedSession(recommended);
                    setRecommendedSessionKey(getSessionKey(recommended, 0));
                    setRecommendedSession(recommended);
                    setSelectedSession(recommended);
                    setMatched(matched);
                    if (onSession) onSession(matched);
                }
            } catch {
                setSearching(false);
            }
        })();
    }, [buildMatchedSession, onSession, qrSession, searchedFromQR, setMatched, uid]);



    const admissionSessions = sessions?.filter(s => s?.data?.type === 'admission' || getSessionTitle(s).match(/admission/gi) || (s?.data?.script?.type === 'admission'));
    const neolabSessions = sessions?.filter(s => s?.data?.type === 'neolab' || getSessionTitle(s).match(/neolab/gi) || (s?.data?.script?.type === 'neolab'));
    const dischargeSessions = sessions?.filter(s => s?.data?.type === 'discharge' || getSessionTitle(s).match(/discharge/gi) || (s?.data?.script?.type === 'discharge'));
    const dailyRecordsSessions = sessions?.filter(s => s?.data?.type === 'drecord' || getSessionTitle(s).match(/daily record/gi) || (s?.data?.script?.type === 'drecord'));
    const qrSessions = searchedFromQR ? (qrSessionRef.current?.length ? qrSessionRef.current : (qrSession?.length ? qrSession : [])) : [];

    function renderList(sessions: any[]) {
        return (
            <>
                {sessions.map((s: any, index: number) => {
                    const sessionKey = getSessionKey(s, index);
                    const selected = !!selectedSession && (selectedSession === s || sessionKey === getSessionKey(selectedSession));
                    const recommended = recommendedSession === s || sessionKey === recommendedSessionKey;
                    return (
                        <React.Fragment key={sessionKey}>
                            <Box
                                borderBottomColor="divider"
                                borderBottomWidth={1}
                                paddingVertical="m"
                            >
                                <Radio
                                    value={getSessionKey(s, index)}
                                    checked={selected}
                                    onChange={() => {
                                        const session = selected ? null : s;
                                        const matched = buildMatchedSession(session);


                                        setSelectedSession(session);
                                        setFacility(null);
                                        setMatched(matched);
                                        if (onSession) onSession(matched);
                                    }}
                                    label={(
                                        <>
                                            <Box flexDirection="row" alignItems="center">
                                                <Text variant="title3">{getSessionTitle(s)}</Text>
                                                {recommended ? (
                                                    <Box
                                                        marginLeft="s"
                                                        paddingHorizontal="s"
                                                        paddingVertical="s"
                                                        borderRadius="s"
                                                        backgroundColor="primary-200"
                                                    >
                                                        <Text variant="caption" color="primary">Recommended</Text>
                                                    </Box>
                                                ) : null}
                                            </Box>
                                            <Text variant="caption" color="textSecondary">
                                                {[
                                                    s?.data?.uid || s?.uid || uid,
                                                    getSessionType(s),
                                                    getSessionFacility(s).other || getSessionFacility(s).value,
                                                    getSessionDate(s) ? `${moment(getSessionDate(s)).format('llll')}` : ''
                                                ].filter(s => s).join(' - ')}
                                            </Text>
                                        </>
                                    )}
                                />
                            </Box>
                        </React.Fragment>
                    );
                })}

                {!sessions.length && <Text textAlign="center" color="textSecondary">{`No ${sessionType} sessions found`}</Text>}
            </>
        );
    }

    return (
        <Box>
            <NeotreeIDInput
                label={label}
                onChange={handleUIDChange}
                value={uid}

            />

            <Br spacing='s' />
            <>
                <Br />
                <Button disabled={searching || uid !== ''}
                    color="primary"
                    onPress={() => openQRscanner()}>
                    Scan QR
                </Button>
                {showQR ? <QRCodeScan onRead={onQrRead} /> : null}
            </>
            <Br spacing='s' />
            <Button
                color="secondary"
                disabled={searching || !uid}
                onPress={() => search()}
            >
                {searching ? <ActivityIndicator size={24} color={theme.colors.primary} /> : 'Search'}
            </Button>

            <Br spacing='s' />

            <ScrollView>
                <Br spacing="xl" />

                {sessions?.length ? (
                    <>
                        <Text color="textDisabled" variant="caption">{admissionSessions?.length} Admission sessions found</Text>
                        <Text color="textDisabled" variant="caption">{neolabSessions?.length} Neolab sessions found</Text>
                        <Text color="textDisabled" variant="caption">{dischargeSessions?.length} Discharge sessions found</Text>
                        <Text color="textDisabled" variant="caption">{dailyRecordsSessions?.length} Daily Record sessions found</Text>
                        <Text color="textDisabled" variant="caption">{qrSessions?.length} QR-code sessions found</Text>
                        <Br spacing="xl" />

                        <Box width={200}>
                            <Dropdown
                                title="Select session type"
                                value={sessionType}
                                onChange={t => setSessionType(t as string)}
                                options={[
                                    {
                                        value: 'admission',
                                        label: 'Admissions',
                                    },
                                    {
                                        value: 'neolab',
                                        label: 'Neolabs',
                                    },
                                    {
                                        value: 'discharge',
                                        label: 'Discharge',
                                    },
                                    {
                                        value: 'drecord',
                                        label: 'Daily Records',
                                    },
                                    {
                                        value: 'qr',
                                        label: 'QR-code Record',
                                    },
                                ]}
                            />
                        </Box>

                        <Br spacing="xl" />

                        {renderList((() => {
                            if (sessionType === 'admission') return admissionSessions;
                            if (sessionType === 'neolab') return neolabSessions;
                            if (sessionType === 'discharge') return dischargeSessions;
                            if (sessionType === 'drecord') return dailyRecordsSessions;
                            if (sessionType === 'qr') return qrSessions;
                            return [];
                        })())}
                    </>
                ) : (
                    <>
                        {!searched ? null : <Text textAlign="center" color="textSecondary">No results found</Text>}
                    </>
                )}
            </ScrollView>

            <Modal
                open={confirmNoRecord && !searching}
                onClose={() => setConfirmNoRecord(false)}
                title={noRecordTitle}
                actions={[
                    {
                        color: 'error',
                        label: 'RE-SCAN',
                        onPress: () => {
                            setConfirmNoRecord(false);
                            resetSearchState();
                            setUID('');
                        },
                    },
                    {
                        color: 'primary',
                        label: 'Continue',
                        onPress: resolveUIDWithoutMatch,
                    },
                ]}
            >
                <Text color="textSecondary">
                    {noRecordMessage
                        ? noRecordMessage(uid)
                        : `No patient record was found for ${uid}. Continue without pre-population only if this is the correct Neotree ID. ${useSearchedUidForSession ? 'The script NUID will use the current Neotree ID.' : 'A new Neotree ID will be generated for this baby.'}`}
                </Text>
            </Modal>
        </Box>
    );
}
