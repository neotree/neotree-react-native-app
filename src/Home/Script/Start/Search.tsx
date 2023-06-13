import React from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import moment from 'moment';
import { Box, Br, Button, NeotreeIDInput, Text, Dropdown, Radio, theme } from '../../../components';
import { api } from '../../../data';
import * as types from '../../../types';
import { useContext } from '../Context';

type SearchProps = {
    onSession?: (data: null | types.MatchedSession) => void;
    label: string;
	autofillKeys?: string[];
};

function getSessionFacility(session: any) {
    const birthFacility = session?.data?.entries?.BirthFacility?.values;
    const otherBirthFacility = session?.data?.entries?.OtherBirthFacility?.values;
    const birthFacilityLabel = birthFacility?.label ? birthFacility.label[0] : '';
    const birthFacilityValue = birthFacility?.value ? birthFacility.value[0] : '';
    const otherBirthFacilityValue = otherBirthFacility?.value ? otherBirthFacility.value[0] : '';
    return { label: birthFacilityLabel, value: birthFacilityValue, other: otherBirthFacilityValue, };
}

export function Search({ onSession, label, autofillKeys }: SearchProps) {    
    const ctx = useContext();

    const [uid, setUID] = React.useState('');
    const [sessions, setSessions] = React.useState<Awaited<ReturnType<typeof api.getExportedSessionsByUID>>>([]);
    const [sessionType, setSessionType] = React.useState('admission');
    const [selectedSession, setSelectedSession] = React.useState<any>(null);
    const [facility, setFacility] = React.useState<null | types.Facility>(null);
    const [searched, setSearched] = React.useState('');

    const [searching, setSearching] = React.useState(false);

    const search = React.useCallback(() => {
        (async () => {
            setSearching(true);
            const sessions = await api.getExportedSessionsByUID(uid);
            setSessions(sessions);
            setSearching(false);
            setSearched(uid);
        })();
    }, [uid]);

    const admissionSessions = sessions.filter(s => s.data.script.title.match(/admission/gi) || (s.data.script.type === 'admission'));
    const neolabSessions = sessions.filter(s => s.data.script.title.match(/neolab/gi) || (s.data.script.type === 'neolab'));
    const dischargeSessions = sessions.filter(s => s.data.script.title.match(/discharge/gi) || (s.data.script.type === 'discharge'));

    function renderList(sessions: any[]) {
        return (
            <>
                {sessions.map((s: any) => {
                    const selected = s.id === selectedSession?.id;
                    return (
                        <React.Fragment key={s.id}>
                            <Box
                                borderBottomColor="divider"
                                borderBottomWidth={1}
                                paddingVertical="m"
                            >
                                <Radio
                                    value={s.id}
                                    checked={selected}
                                    onChange={() => {
                                        const session = selected ? null : s;
										let autoFill = session ? JSON.parse(JSON.stringify(session)) : null;
										if (autoFill && autofillKeys) {
											autoFill.data.entries = autofillKeys.reduce((acc: any, key) => {
												if (autoFill.data.entries[key]) acc[key] = autoFill.data.entries[key];
                                                return acc;
											}, {});
										}
                                        const matched = session ? { session, uid, facility: facility as types.Facility, autoFill, } : null;
                                        setSelectedSession(session);
                                        setFacility(session ? null : getSessionFacility(session));
                                        ctx?.setMatched(matched);
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
                application={ctx?.application}
            />
            
            <Br />

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
        </Box>
    );
}
