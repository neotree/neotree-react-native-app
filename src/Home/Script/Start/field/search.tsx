import React from 'react';
import { ActivityIndicator, ScrollView,SafeAreaView,Dimensions} from 'react-native';
import moment from 'moment';
import { Box, Br, Button, NeotreeIDInput, Text, Dropdown, Radio, theme } from '../../../../components';
import * as api from '../../../../data';
import * as types from '../../../../types';
import { QRCodeScan } from '@/src/components/Session/QRScan/QRCodeScan';


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
    const [qrSession, setQRSession]= React.useState<any>([]);
    const [showQR, setShowQR] = React.useState(false);

    const openQRscanner = () => {
        setShowQR(true);
    };
 
    const onQrRead = (qrtext: any) => {
        if (qrtext) {
            const session = qrtext
            const sessions = []
            if(session['uid']){
            sessions.push(session)
                setUID(session['uid'])
                setQRSession(sessions)
                
            }else{
                setUID(session) 
            }
           
        }
        setShowQR(false);
    };

  
    const search = React.useCallback(() => {
        (async () => {
            setSearching(true);
            let sessions = qrSession
            if(!sessions){
            sessions = await api.getExportedSessionsByUID(uid);
            }
            setSessions(sessions);
            setSearching(false);
            setSearched(uid);
        })();
    }, [uid]);

    const admissionSessions = sessions.filter(s =>s?.data?.type==='admission' || s?.data?.script?.title.match(/admission/gi) || (s.data?.script?.type === 'admission'));
    const neolabSessions = sessions.filter(s =>s?.data?.type==='neolab' || s?.data?.script?.title.match(/neolab/gi) || (s.data?.script?.type === 'neolab'));
    const dischargeSessions = sessions.filter(s => s?.data?.type==='discharge' || s?.data?.script?.title.match(/discharge/gi) || (s?.data?.script?.type === 'discharge'));

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
											autoFill, 
											prePopulateWithUID: prePopulateWithUID !== false,
										} : null;
                                        setSelectedSession(session);
                                        onSession(matched);
                                    }}
                                    label={(
                                        <>
                                            <Text variant="title3">{s?.data?.title || s?.data?.script?.title }</Text>
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
           <>
           
            {showQR===true ? <SafeAreaView
            style={{width,height,marginLeft:-50}}
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
               <Button disabled={searching || uid!=''}
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
                        <Text color="textDisabled" variant="caption">{admissionSessions.length} Admission sessions found</Text>
                        <Text color="textDisabled" variant="caption">{neolabSessions.length} Neolab sessions found</Text>
                        <Text color="textDisabled" variant="caption">{dischargeSessions.length} Discharge sessions found</Text>

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
                                ]}
                            />
                        </Box>

                        <Br spacing="xl" />

                        {renderList((() => {
                            if (sessionType === 'admission') return admissionSessions;
                            if (sessionType === 'neolab') return neolabSessions;
                            if (sessionType === 'discharge') return dischargeSessions;
                            return [];
                        })())}
                    </>
                ) : (
                    <>
                        {!searched ? null : <Text textAlign="center" color="textSecondary">No results found</Text>}
                    </>
                )}
            </ScrollView>   
        </Box>}
     </>

    );
}


