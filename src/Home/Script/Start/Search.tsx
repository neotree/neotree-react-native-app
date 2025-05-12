import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import moment from 'moment';
import { Box, Br, Button, NeotreeIDInput, Text, Dropdown, Radio, theme } from '../../../components';
import * as api from '../../../data';
import * as types from '../../../types';
import { useContext } from '../Context';
import { QRCodeScan } from '@/src/components/Session/QRScan/QRCodeScan';

type SearchProps = {
    onSession?: (data: null | types.MatchedSession) => void;
    label: string;
    autofillKeys?: string[];
    filterEntries?: (entry: any) => any;
    prePopulateWithUID?: boolean;
};

function getSessionFacility(session: any) {
    const birthFacility = session?.data?.entries?.BirthFacility?.values;
    const otherBirthFacility = session?.data?.entries?.OtherBirthFacility?.values;
    const birthFacilityLabel = birthFacility?.label ? birthFacility.label[0] : '';
    const birthFacilityValue = birthFacility?.value ? birthFacility.value[0] : '';
    const otherBirthFacilityValue = otherBirthFacility?.value ? otherBirthFacility.value[0] : '';
    return { label: birthFacilityLabel, value: birthFacilityValue, other: otherBirthFacilityValue, };
}


export function Search({ onSession, label, autofillKeys, filterEntries, prePopulateWithUID, }: SearchProps) {
    const {setMatched} = useContext()||{};

    const [uid, setUID] = React.useState('');
    const [sessions, setSessions] = React.useState<Awaited<ReturnType<typeof api.getExportedSessionsByUID>>>([]);
    const [sessionType, setSessionType] = React.useState('admission');
    const [selectedSession, setSelectedSession] = React.useState<any>(null);
    const [facility, setFacility] = React.useState<null | types.Facility>(null);
    const [searched, setSearched] = React.useState('');
    const [showQR, setShowQR] = React.useState(false);
    const [qrSession, setQRSession]= React.useState<any>(null);

    const openQRscanner = () => {
        setShowQR(true);
    };

    const onQrRead = (qrtext: any) => {
        if (qrtext) {
            const session = qrtext
            console.log("---KINGI...",qrtext)
            if(session['uid']){
                setUID(session['uid'])
                setQRSession([qrtext])
            }else{
                setUID(session) 
            }
           
        }
        setShowQR(false);
    };


    const [searching, setSearching] = React.useState(false);

    const search = React.useCallback(() => {
        (async () => {
            try{
            setSearching(true);
            let sessions = qrSession
            if(!sessions){
            sessions = await api.getExportedSessionsByUID(uid);
            }
            setSessions(sessions);
            setSearching(false);
            setSearched(uid);
        }catch(err){
           
        }
        })();
    }, [uid]);



    const admissionSessions = sessions.filter(s => s?.data?.type==='admission' || s?.data?.script?.title.match(/admission/gi) || (s?.data?.script?.type === 'admission'));
    const neolabSessions = sessions.filter(s =>s?.data?.type==='neolab' || s?.data?.script?.title.match(/neolab/gi) || (s?.data?.script?.type === 'neolab'));
    const dischargeSessions = sessions.filter(s => s?.data?.type==='discharge' || s?.data?.script?.title.match(/discharge/gi) || (s?.data?.script?.type === 'discharge'));
    const dailyRecordsSessions = sessions.filter(s => s?.data?.type==='drecord' || s?.data?.script?.title.match(/daily record/gi) || (s?.data?.script?.type === 'drecord'));

    function renderList(sessions: any[]) {
        return (
            <>
                {sessions.map((s: any) => {
                    const selected = s.data.unique_key === selectedSession?.data?.unique_key;
                    return (
                        <React.Fragment key={s.data.unique_key}>
                            <Box
                                borderBottomColor="divider"
                                borderBottomWidth={1}
                                paddingVertical="m"
                            >
                                <Radio
                                    value={s.data.unique_key}
                                    checked={selected}
                                    onChange={() => {
                                        const session = selected ? null : s;
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
                                        const matched = session ? {
                                            session,
                                            uid,
                                            facility: facility as types.Facility,
                                            autoFill,
                                            prePopulateWithUID: prePopulateWithUID !== false,
                                        } : {
                                            session:{uid},
                                            uid,
                                            facility: facility as types.Facility,
                                            prePopulateWithUID: prePopulateWithUID
                                        };

                                        setSelectedSession(session);
                                        setFacility(session ? null : getSessionFacility(session));
                                        setMatched(matched);
                                        if (onSession) onSession(matched);
                                    }}
                                    label={(
                                        <>
                                            <Text variant="title3">{s.data.script.title}</Text>
                                            <Text variant="caption" color="textSecondary">
                                                {[
                                                    getSessionFacility(s).other || getSessionFacility(s).value,
                                                    `${moment(s.ingested_at).format('llll')}`
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
                onChange={uid => setUID(uid)}
                value={uid}
            
            />

            <Br spacing='s' />
            <>
                <Br />
               <Button disabled={searching || uid!==''}
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

                {sessions.length ? (
                    <>
                        <Text color="textDisabled" variant="caption">{admissionSessions.length} Admission sessions found</Text>
                        <Text color="textDisabled" variant="caption">{neolabSessions.length} Neolab sessions found</Text>
                        <Text color="textDisabled" variant="caption">{dischargeSessions.length} Discharge sessions found</Text>
                        <Text color="textDisabled" variant="caption">{dailyRecordsSessions.length} Daily Record sessions found</Text>
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
                        {!searched ? null : <Text textAlign="center" color="textSecondary">No results found</Text>}
                    </>
                )}
            </ScrollView>
        </Box>
    );
}
