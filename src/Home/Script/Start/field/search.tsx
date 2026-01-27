import React from 'react';
import { ActivityIndicator, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import moment from 'moment';
import { Box, Br, Button, NeotreeIDInput, Text, Dropdown, Radio, theme, Modal } from '@/src/components';
import * as api from '@/src/data';
import * as types from '@/src/types';
import { QRCodeScan } from '@/src/components/Session/QRScan/QRCodeScan';
import { getDaysDifference } from '@/src/utils/formatDate'
import { mergeSessions } from '@/src/contexts/script'

const { width, height } = Dimensions.get("window");

type SearchProps = {
    label: string;
    autofillKeys?: string[];
    prePopulateWithUID?: boolean;
    onSession: (data: null | types.MatchedSession) => void;
    filterEntries?: (entry: any) => any;
    script_type?: string;
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
    filterEntries,
    script_type
}: SearchProps) {
    const [uid, setUID] = React.useState('');
    const [sessions, setSessions] = React.useState<Awaited<ReturnType<typeof api.getLocalSessionsByUID>>>([]);
    const [merged, setMerged] = React.useState<any>([])
    const [sessionType, setSessionType] = React.useState('admission');
    const [selectedSession, setSelectedSession] = React.useState<any>(null);
    const [pendingNeolab, setPendingNeolab] = React.useState<any>(null);
    const [neolabGateOpen, setNeolabGateOpen] = React.useState(false);
    const [neolabResultsOpen, setNeolabResultsOpen] = React.useState(false);
    const [viewedNeolabKeys, setViewedNeolabKeys] = React.useState<string[]>([]);
    const [pendingPatientSelection, setPendingPatientSelection] = React.useState<any>(null);
    const [patientSummaryOpen, setPatientSummaryOpen] = React.useState(false);
    const [searched, setSearched] = React.useState('');
    const [searching, setSearching] = React.useState(false);
    const [qrSession, setQRSession] = React.useState<any>([]);
    const [showQR, setShowQR] = React.useState(false);
    const [toClear, setToClear] = React.useState(false);
    const [validationMessage, setValidationMessage] = React.useState('');

    const formatLookupError = React.useCallback(() => {
        return [
            'We could not retrieve patient data for this Neotree ID because the lookup service is temporarily unavailable.',
            'No patient data was found.',
            'Re-scan or continue with the current Neotree ID (no auto-population).',
        ].join(' ');
    }, []);

    const openQRscanner = () => {
        setShowQR(true);
    };

    const onQrRead = (qrtext: any) => {
        if (qrtext) {
            const session = qrtext
            const sessions = []
            if (session['uid']) {
                setUID(session['uid'])
                if (Object.keys(session).length > 1) {
                    sessions.push(session)
                    setQRSession(sessions)
                }

                if (script_type == 'discharge') {
                    if (sessions?.filter(s => s?.data?.script?.type === 'drecord').length > 0
                        && sessions?.filter(s => s?.data?.script?.type === 'admission').length > 0) {
                            {
                                const mergedSessions = [mergeSessions(sessions?.filter((s: any) => s?.data?.script?.type === 'drecord')[0],
                                    sessions?.filter((s: any) => s?.data?.script?.type === 'admission')[0])]
                                      
                                setMerged(mergedSessions)
                                setSessionType('merged')
                            }
                    }
                } else {

                    if (script_type == 'drecord' && sessions?.filter(s => s?.data?.script?.type === 'drecord').length > 0) {
                        setSessionType('drecord')
                    }
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

    const isNeolabSession = React.useCallback((session: any) => {
        if (!session) return false;
        const title = session?.data?.script?.title || '';
        const type = session?.data?.type || session?.data?.script?.type || '';
        return /neolab/i.test(title) || /neolab/i.test(type);
    }, []);

    const getNeolabKey = React.useCallback((session: any) => {
        return session?.data?.unique_key || session?.data?.uid || session?.uid || '';
    }, []);

    const formatNeolabValue = React.useCallback((value: any) => {
        const normalize = (input: any): string => {
            if (typeof input === 'string' && moment(input, moment.ISO_8601, true).isValid()) {
                return moment(input).format('lll');
            }
            if (Array.isArray(input)) {
                return input.map((item) => normalize(item)).join(', ');
            }
            if (input && typeof input === 'object') {
                try {
                    return JSON.stringify(input);
                } catch (error) {
                    return String(input);
                }
            }
            return String(input);
        };
        const hasValue = value !== undefined && value !== null && value !== '';
        if (!hasValue) return null;
        return normalize(value);
    }, []);

    const getNeolabSummaryItems = React.useCallback((session: any) => {
        const entries = session?.data?.entries || {};
        const entriesList = Object.entries(entries) as [string, any][];
        const hasAnyIps = entriesList.some(([, entry]: [string, any]) => entry?.ips === true);
        return entriesList.reduce((acc: any[], [key, entry]: [string, any]) => {
            const safeKey = typeof key === 'string' ? key.trim() : '';
            if (!safeKey) return acc;
            if (hasAnyIps && entry?.ips !== true) return acc;
            const pickFirst = (input: any) => {
                if (Array.isArray(input)) {
                    const found = input.find((item) => item !== undefined && item !== null && item !== '');
                    return found !== undefined ? found : input[0];
                }
                return input;
            };
            const rawValue = pickFirst(entry?.values?.value ?? entry?.value);
            const rawLabel = pickFirst(entry?.values?.label ?? entry?.label ?? null);
            const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== '';
            const hasLabel = rawLabel !== undefined && rawLabel !== null && rawLabel !== '';
            const type = entry?.type;
            const preferLabelTypes = ['id', 'set<id>', 'dropdown', 'yesno'];
            const shouldPreferLabel = typeof type === 'string' && preferLabelTypes.includes(type.toLowerCase());
            const effectiveValue = shouldPreferLabel
                ? (hasLabel ? rawLabel : (hasValue ? rawValue : null))
                : (hasValue ? rawValue : (hasLabel ? rawLabel : null));
            if (effectiveValue === null || effectiveValue === '') return acc;
            const labelText = typeof rawLabel === 'string' ? rawLabel.trim() : '';
            const displayLabel = labelText.length > 0 ? labelText : safeKey;
            const keyLower = safeKey.toLowerCase();
            const labelLower = displayLabel.toLowerCase();
            const isUidKey = keyLower === 'uid';
            const hasUid = keyLower.includes('uid') || labelLower.includes('uid');
            const hasHospitalId = keyLower.includes('hospnu') || keyLower.includes('hospitalid') || keyLower.includes('labid')
                || labelLower.includes('hospnu') || labelLower.includes('hospid');
            const hasOrgNo = keyLower.includes('orgno') || labelLower.includes('orgno');
            const hasName = keyLower.includes('firstname') || keyLower.includes('surname')
                || labelLower.includes('firstname') || labelLower.includes('surname');
            if (hasHospitalId || hasOrgNo || hasName) return acc;
            if (hasUid && !isUidKey) return acc;
            const displayValue = formatNeolabValue(effectiveValue);
            if (displayValue === null) return acc;
            acc.push({
                key: safeKey,
                label: rawLabel,
                displayLabel,
                value: displayValue,
                type,
            });
            return acc;
        }, []);
    }, [formatNeolabValue]);

    const resetNeolabGate = React.useCallback(() => {
        setNeolabGateOpen(false);
        setNeolabResultsOpen(false);
        setPendingNeolab(null);
        setSelectedSession(null);
    }, []);

    const getPatientSummaryItems = React.useCallback((session: any) => {
        const entries = session?.data?.entries || {};
        const keyMatch = /(baby|mother|uid|datebct|datebcr|datetime|dobtob|gestation|weight)/i;
        const entriesList = Object.entries(entries);
        const buildItems = (filterFn: (key: string, entry: any) => boolean) =>
            entriesList.reduce((acc: any[], [key, entry]: [string, any]) => {
                const safeKey = typeof key === 'string' ? key.trim() : '';
                if (!safeKey) return acc;
                if (!filterFn(safeKey, entry)) return acc;
                const rawValue = Array.isArray(entry?.values?.value)
                    ? entry.values.value[0]
                    : entry?.values?.value ?? entry?.value;
                const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== '';
                if (!hasValue) return acc;
                const label = entry?.values?.label?.[0] || safeKey;
                acc.push({ key: safeKey, label, value: rawValue });
                return acc;
            }, []);

        const uidItems = buildItems((key) => /^uid$/i.test(key));
        const uidItem = uidItems[0];
        const ipsItems = buildItems((_, entry) => entry?.ips === true).filter(i => !uidItem || i.key !== uidItem.key);
        const keyMatchItems = buildItems((key) => keyMatch.test(key)).filter(i => !uidItem || i.key !== uidItem.key);

        const result: any[] = [];
        if (uidItem) result.push(uidItem);
        result.push(...ipsItems);

        if (ipsItems.length < 4) {
            const seen = new Set(result.map(i => i.key));
            let added = 0;
            for (const item of keyMatchItems) {
                if (seen.has(item.key)) continue;
                result.push(item);
                seen.add(item.key);
                added += 1;
                if (ipsItems.length + added >= 4) break;
            }
        }

        return result.map(({ key, label, value }) => ({ key, label, value }));
    }, []);

    const formatPatientValue = React.useCallback((value: any, label?: string, key?: string) => {
        const labelKey = `${label || ''} ${key || ''}`.toLowerCase();
        const isWeightField = /weight/.test(labelKey);
        if (!isWeightField && typeof value === 'string' && moment(value, moment.ISO_8601, true).isValid()) {
            return moment(value).format('lll');
        }
        return String(value);
    }, []);

    const resetPatientSummary = React.useCallback(() => {
        setPatientSummaryOpen(false);
        setPendingPatientSelection(null);
    }, []);

    const enforceNeolabView = React.useCallback((items: any[]) => {
        if (script_type === 'admission') return false;
        const pending = items?.find((session: any) => {
            if (!isNeolabSession(session)) return false;
            const key = getNeolabKey(session);
            return key ? !viewedNeolabKeys.includes(key) : true;
        });
        if (pending) {
            setPendingNeolab({ session: pending, key: getNeolabKey(pending) });
            setNeolabGateOpen(true);
            return true;
        }
        return false;
    }, [getNeolabKey, isNeolabSession, script_type, viewedNeolabKeys]);


    const search = React.useCallback(() => {
    
        (async () => {
            setSearching(true);
            let searched = qrSession;

            if (!searched || searched.length <= 0) {
                const location = await api.getLocation();
                //Prioritise Local Search
                if (location && location.hospital) {
                
                    searched = await api.getLocalSessionsByUID(uid, location.hospital)

                }
                const localError = searched?.[0]?.['error']
                if(localError|| !searched || searched.length<=0){
                 searched = await api.getExportedSessionsByUID(uid);
                }
            }
         
            const error = searched?.[0]

            if (error && error.error) {
                setToClear(true)
                setValidationMessage(formatLookupError())
                setSearching(false);
            }
            else if (searched) {
                const rawSessions = searched;
                searched = filterDataWithPrePopulatedEntries(searched)
                setSessions(searched);
                setSearching(false);
                setSearched(uid);
                enforceNeolabView(rawSessions);
            } else {
                setToClear(true)
                setSearching(false);
                setValidationMessage(
                    "We could not retrieve patient data for this Neotree ID because the lookup service is temporarily unavailable. No patient data was found. Re-scan or continue with the current Neotree ID (no auto-population)."
                );
            }
            if (script_type == 'discharge') {
                if (searched?.filter((s: any) => s?.data?.script?.type === 'drecord').length > 0
                    && searched?.filter((s: any) => s?.data?.script?.type === 'admission').length > 0) {
                    const mergedSessions = [mergeSessions(searched?.filter((s: any) => s?.data?.script?.type === 'drecord')[0],
                        searched?.filter((s: any) => s?.data?.script?.type === 'admission')[0])]

                    setMerged(mergedSessions)
              
                    setSessionType('merged')
                }
            } else {
                if (script_type == 'drecord' && searched?.filter((s: any) => s?.data?.script?.type === 'drecord').length > 0) {
                    setSessionType('drecord')
                }
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

    const admissionSessions = merged.length>0?[]:sessions?.filter(s => s?.data?.type === 'admission' || s?.data?.script?.title.match(/admission/gi) || (s.data?.script?.type === 'admission'));
    const neolabSessions =merged.length>0?[]: sessions?.filter(s => s?.data?.type === 'neolab' || s?.data?.script?.title.match(/neolab/gi) || (s.data?.script?.type === 'neolab'));
    const dischargeSessions =merged.length>0?[]:sessions?.filter(s => s?.data?.type === 'discharge' || s?.data?.script?.title.match(/discharge/gi) || (s?.data?.script?.type === 'discharge'));
    const dailyRecordsSessions = merged.length>0?[]:sessions?.filter(s => s?.data?.type === 'drecord' || s?.data?.script?.title.match(/daily record/gi) || (s?.data?.script?.type === 'drecord'));
   
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
                                            setSelectedSession(null)
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
                                            setSelectedSession(null)
                                        }
                                        const matched = session ? {
                                            session,
                                            uid,
                                            autoFill,
                                            prePopulateWithUID: prePopulateWithUID !== false,
                                        } : null
                                        if (selected) {
                                            setPendingPatientSelection(matched);
                                            setPatientSummaryOpen(true);
                                            return;
                                        }

                                        validateSearchResultDates(matched);
                                    }}
                                    label={(
                                        <>
                                            <Text variant="title3">{(merged.length>0)?'Merged Records':s?.data?.title || s?.data?.script?.title}</Text>
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

    function filterDataWithPrePopulatedEntries(items: any[]): any[] {
    return items.map(item => ({
        data: {
            ...item.data,
            entries: Object.fromEntries(
                Object.entries(item.data.entries).filter(([key, entry]) =>
                    key === 'repeatables' ||
                    hasPrePopulate(entry)
                )
            )
        }
    }));
}

function hasPrePopulate(entry: any): boolean {
    // Check for top-level prePopulate
    const topLevel = Array.isArray(entry?.prePopulate) && entry.prePopulate.length > 0;

    // Check for nested in values.prePopulate
    const nested = Array.isArray(entry?.values?.prePopulate) && entry.values.prePopulate.length > 0;

    return topLevel || nested;
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
                                <Text color="textDisabled" variant="caption">{merged?.length} Merged sessions found</Text>
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
                                                value: 'merged',
                                                label: 'Merged Records',
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
                                    if (sessionType === 'merged') return merged;
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
                                            onPress: () => handleNoPress(true),
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
            <Modal
                open={neolabGateOpen}
                onClose={() => {}}
                title={<Text variant="title2" color="primary">NeoLab Results Found</Text>}
            >
                <Text variant="body" color="info" style={{ fontFamily: 'Georgia' }}>
                    A NeoLab result was received for this Neotree ID. Please review the details before continuing.
                </Text>
                <Br spacing="l" />
                <Button
                    color="primary"
                    size="m"
                    onPress={() => {
                        setNeolabGateOpen(false);
                        setNeolabResultsOpen(true);
                    }}
                >
                    View Results
                </Button>
            </Modal>
            <Modal
                open={neolabResultsOpen}
                onClose={resetNeolabGate}
                title="Results Summary"
            >
                <Text color="info" style={{ fontStyle: 'italic' }}>Scroll Down To Continue</Text>
                <Br spacing="m" />

                <Text variant="title3">{`UID: ${pendingNeolab?.session?.data?.uid || pendingNeolab?.session?.uid || uid || 'Unknown'}`}</Text>
                <Br spacing="m" />
                {pendingNeolab?.session ? (
                    getNeolabSummaryItems(pendingNeolab.session).length ? (
                        getNeolabSummaryItems(pendingNeolab.session).map((item: any, index: number) => (
                            <Box
                                key={`${item.key || item.label}-${index}`}
                                backgroundColor={index % 2 === 0 ? 'grey-50' : 'primary-200'}
                                borderRadius="s"
                                borderLeftWidth={3}
                                borderLeftColor="primary"
                                padding="m"
                                marginBottom="s"
                            >
                                {item.key ? (
                                    <Text variant="caption" color="textSecondary" style={{ fontFamily: 'Georgia' }}>{item.key}</Text>
                                ) : null}
                                <Text variant="body" style={{ fontFamily: 'Georgia' }}>{item.value}</Text>
                            </Box>
                        ))
                    ) : (
                        <Text color="textSecondary" style={{ fontFamily: 'Georgia' }}>No result details available.</Text>
                    )
                ) : (
                    <Text color="textSecondary" style={{ fontFamily: 'Georgia' }}>No result details available.</Text>
                )}
                <Br spacing="l" />
                <Button
                    color="primary"
                    size="m"
                    onPress={() => {
                        const key = pendingNeolab?.key;
                        if (key && !viewedNeolabKeys.includes(key)) {
                            setViewedNeolabKeys(prev => [...prev, key]);
                        }
                        setNeolabResultsOpen(false);
                        setPendingNeolab(null);
                    }}
                >
                    Continue
                </Button>
            </Modal>
            <Modal
                open={patientSummaryOpen}
                onClose={() => {}}
                title={<Text variant="title2" color="primary">Patient Summary</Text>}
            >
                <Box backgroundColor="primary-200" borderRadius="s" padding="m" marginBottom="m">
                    <Text variant="title3" color="info" style={{ fontFamily: 'Georgia' }}>Please verify the patient details.</Text>
                </Box>
                {pendingPatientSelection?.session ? (
                    getPatientSummaryItems(pendingPatientSelection.session).length ? (
                        getPatientSummaryItems(pendingPatientSelection.session).map((item: any, index: number) => (
                            <Box
                                key={`${item.label}-${index}`}
                                backgroundColor={index % 2 === 0 ? 'grey-50' : 'primary-200'}
                                borderRadius="s"
                                borderLeftWidth={3}
                                borderLeftColor="primary"
                                padding="m"
                                marginBottom="s"
                            >
                                <Text variant="caption" color="textSecondary" style={{ fontFamily: 'Georgia' }}>{item.label}</Text>
                                <Text variant="body" style={{ fontFamily: 'Georgia' }}>{formatPatientValue(item.value, item.label, item.key)}</Text>
                            </Box>
                        ))
                    ) : (
                        <Text color="textSecondary" style={{ fontFamily: 'Georgia' }}>No patient summary available.</Text>
                    )
                ) : (
                    <Text color="textSecondary" style={{ fontFamily: 'Georgia' }}>No patient summary available.</Text>
                )}
                <Box flexDirection="row" justifyContent="space-between" marginTop="m">
                    <Button
                        color="warning"
                        size="m"
                        onPress={() => {
                            setSelectedSession(null);
                            resetPatientSummary();
                        }}
                        style={{ flex: 1, marginRight: 10 }}
                    >
                        Change Selection
                    </Button>
                    <Button
                        color="success"
                        size="m"
                        onPress={() => {
                            const matched = pendingPatientSelection || null;
                            resetPatientSummary();
                            validateSearchResultDates(matched);
                        }}
                        style={{ flex: 1, marginLeft: 10 }}
                    >
                        Continue
                    </Button>
                </Box>
            </Modal>
        </>

    );
}
