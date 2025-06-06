import React from 'react';
import { ActivityIndicator, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import moment from 'moment';
import { Box, Br, Button, NeotreeIDInput, Text, Dropdown, Radio, theme, Modal } from '../../../../components';
import * as api from '../../../../data';
import * as types from '../../../../types';
import { QRCodeScan } from '@/src/components/Session/QRScan/QRCodeScan';
import { getDaysDifference } from '@/src/utils/formatDate'


const { width, height } = Dimensions.get("window");


type SearchProps = {
    label: string;
    autofillKeys?: string[];
    prePopulateWithUID?: boolean;
    onSession: (data: null | types.MatchedSession) => void;
    filterEntries?: (entry: any) => any;
};

function getSessionFacility(session: any) {
    const birthFacility = session?.data?.entries?.BirthFacility?.values;
    const otherBirthFacility = session?.data?.entries?.OtherBirthFacility?.values;
    const birthFacilityLabel = birthFacility?.label ? birthFacility.label[0] : '';
    const birthFacilityValue = birthFacility?.value ? birthFacility.value[0] : '';
    const otherBirthFacilityValue = otherBirthFacility?.value ? otherBirthFacility.value[0] : '';
    return { label: birthFacilityLabel, value: birthFacilityValue, other: otherBirthFacilityValue, };
}

export function Search({
    label,
    autofillKeys,
    prePopulateWithUID,
    onSession,
    filterEntries
}: SearchProps) {

    const [uid, setUID] = React.useState('');
    const [sessions, setSessions] = React.useState<Awaited<ReturnType<typeof api.getExportedSessionsByUID>>>([]);
    const [sessionType, setSessionType] = React.useState('admission');
    const [selectedSession, setSelectedSession] = React.useState<any>(null);
    const [searched, setSearched] = React.useState('');
    const [searching, setSearching] = React.useState(false);
    const [qrSession, setQRSession] = React.useState<any>([]);
    const [showQR, setShowQR] = React.useState(false);
    const [toClear, setToClear] = React.useState(false);
    const [validationMessage, setValidationMessage] = React.useState('');

    const openQRscanner = () => {
        setShowQR(true);
    };

    const onQrRead = (qrtext: any) => {
        if (qrtext) {
            const session = qrtext
            const sessions = []
            if (session['uid']) {
                sessions.push(session)
                setUID(session['uid'])
                setQRSession(sessions)
                if (sessions.filter(s => s.data.type === 'drecord').length > 0) {
                    setSessionType('drecord')
                }

            } else {
                setUID(session)
            }

        }
        setShowQR(false);

    };

    const validateSearchResultDates = React.useCallback((matched: any) => {
        if (matched != null) {

            const completedDate = matched?.session?.completed_at
            const type = matched?.session?.type
            setSelectedSession(matched)
            if (completedDate && type === 'drecord') {
                const dateDiff = getDaysDifference(new Date(), completedDate);
                if (dateDiff === 1) {
                    setToClear(false)
                    onSession(matched)
                } else {
                    setToClear(true)
                    if (dateDiff === 0) {
                        setValidationMessage("The Scanned Record was created today. Do you want to proceed auto populating?")
                    } else {
                        setValidationMessage(`The Scanned Record was created ${dateDiff} days ago. Do you want to proceed auto populating?`)
                    }
                }

            } else {
                setToClear(false)

                onSession(matched)
            }
        } else {
            onSession(matched)
        }

    }, []);


    const search = React.useCallback(() => {
        (async () => {
            setSearching(true);
            let sessions = qrSession;

            if (!sessions || sessions.length <= 0) {
                sessions = await api.getExportedSessionsByUID(uid);
            }

            const error = sessions?.[0]

            if (error && error.error) {
                setToClear(true)
                setValidationMessage(
                    `${error.error} error occured. Do you want to proceed auto populating with the current Neotree-ID?`
                )
                setSearching(false);
            }
            else if (sessions) {

                setSessions(sessions);
                setSearching(false);
                setSearched(uid);
            } else {
                setToClear(true)
                setSearching(false);
                setValidationMessage(
                    "No Matched Sessions Found. Do you want to proceed auto populating with the current Neotree-ID?"
                );
            }

        })();
    }, [uid, toClear]);


    const handleYesPress = () => {
        setToClear(false)
        if (selectedSession) {
            onSession(selectedSession)
        } else {
            onSession({
                session: { uid },
                uid,
                autoFill: { uid },
                prePopulateWithUID: prePopulateWithUID !== false,
            })
        }
    };

    const handleNoPress = (error?: boolean) => {
        setToClear(false)
        if (!error) {
            setUID('')
            setSearched('')
        }
        setSessions([])
        setQRSession([])
        setSelectedSession(null)
    }

    const admissionSessions = sessions.filter(s => s?.data?.type === 'admission' || s?.data?.script?.title.match(/admission/gi) || (s.data?.script?.type === 'admission'));
    const neolabSessions = sessions.filter(s => s?.data?.type === 'neolab' || s?.data?.script?.title.match(/neolab/gi) || (s.data?.script?.type === 'neolab'));
    const dischargeSessions = sessions.filter(s => s?.data?.type === 'discharge' || s?.data?.script?.title.match(/discharge/gi) || (s?.data?.script?.type === 'discharge'));
    const dailyRecordsSessions = sessions.filter(s => s?.data?.type === 'drecord' || s?.data?.script?.title.match(/daily record/gi) || (s?.data?.script?.type === 'drecord'));

    function renderList(sessions: any[]) {
        return (
            <>
                {sessions.map((s: any, index: number) => {
                    let selected = selectedSession != null
                    return (
                        <React.Fragment key={index}>
                            <Box
                                borderBottomColor="divider"
                                borderBottomWidth={1}
                                paddingVertical="m"
                            >
                                <Radio
                                    value={s.data.unique_key}
                                    checked={selected}
                                    onChange={() => {
                                        if (selected) {
                                            selected = false
                                        } else {
                                            selected = true
                                        }
                                        const session = selected ? s : null;

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
                                        if (selected) {
                                            setSelectedSession(session)
                                        } else {
                                            selectedSession(null)
                                        }
                                        const matched = session ? {
                                            session,
                                            uid,
                                            autoFill,
                                            prePopulateWithUID: prePopulateWithUID !== false,
                                        } : null

                                        validateSearchResultDates(matched);
                                    }}
                                    label={(
                                        <>
                                            <Text variant="title3">{s?.data?.title || s?.data?.script?.title}</Text>
                                            <Text variant="caption" color="textSecondary">
                                                {[
                                                    getSessionFacility(s).other || getSessionFacility(s).value,
                                                    `${moment(s.ingested_at).format('llll')}`
                                                ].filter(s => s).join(' - ')}
                                            </Text>
                                        </>
                                    )}
                                />
                                <Modal
                                    open={toClear && !searching}
                                    onClose={() => { setToClear(false) }}
                                    title="Validate Selected Session."
                                    actions={[
                                        {
                                            color: 'error',
                                            label: 'RE-SCAN',
                                            onPress: () => handleNoPress(),
                                        },
                                        {
                                            color: 'primary',
                                            label: 'Continue',
                                            onPress: handleYesPress,

                                        },
                                    ]}
                                >
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'maroon' }}>
                                        {validationMessage || ''}
                                    </Text>
                                </Modal>

                            </Box>
                        </React.Fragment>
                    );
                })}

                {!sessions.length && <Text textAlign="center" color="textSecondary">{`No ${sessionType} sessions found`}</Text>}
            </>
        );
    }

    return (
        <>

            {showQR === true ? <SafeAreaView
                style={{ width, height, marginLeft: -50 }}
            ><QRCodeScan onRead={onQrRead} /></SafeAreaView>
                :
                <Box >
                    <NeotreeIDInput
                        label={label}
                        onChange={uid => setUID(uid)}
                        value={uid}
                    />
                    <Br spacing='l' />
                    <>
                        <Br />
                        <Button disabled={searching || uid != ''}
                            color="primary"
                            onPress={() => openQRscanner()}>
                            Scan QR
                        </Button>
                    </>
                    <Br spacing='l' />

                    <Button
                        color="secondary"
                        disabled={searching || !uid}
                        onPress={() => search()}
                    >
                        {searching ? <ActivityIndicator size={24} color={theme.colors.primary} /> : 'Search'}
                    </Button>

                    <ScrollView>
                        <Br spacing="xl" />

                        {sessions.length ? (
                            <>
                                <Text color="textDisabled" variant="caption">{admissionSessions?.length} Admission sessions found</Text>
                                <Text color="textDisabled" variant="caption">{neolabSessions?.length} Neolab sessions found</Text>
                                <Text color="textDisabled" variant="caption">{dischargeSessions?.length} Discharge sessions found</Text>
                                <Text color="textDisabled" variant="caption">{dailyRecordsSessions?.length} Daily Records sessions found</Text>

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
                                        ]}
                                    />
                                </Box>

                                <Br spacing="xl" />

                                {renderList((() => {
                                    if (sessionType === 'admission') return admissionSessions;
                                    if (sessionType === 'neolab') return neolabSessions;
                                    if (sessionType === 'discharge') return dischargeSessions;
                                    if (sessionType === 'drecord') return dailyRecordsSessions;
                                    return [];
                                })())}
                            </>
                        ) : (
                            <>
                                <Modal
                                    open={toClear && !searching}
                                    onClose={() => { setToClear(false) }}
                                    title="Continue With Current Neotree ID."
                                    actions={[
                                        {
                                            color: 'error',
                                            label: 'RE-SCAN',
                                            onPress:()=> handleNoPress(true),
                                        },
                                        {
                                            color: 'primary',
                                            label: 'Continue',
                                            onPress: handleYesPress,

                                        },
                                    ]}
                                >
                                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'maroon' }}>
                                        {validationMessage || ''}
                                    </Text>
                                </Modal>
                                {!searched && !toClear ? null : <Text textAlign="center" color="textSecondary">No results found</Text>}
                            </>
                        )}
                    </ScrollView>
                </Box>}
        </>

    );
}


