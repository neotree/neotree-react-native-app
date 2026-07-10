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
    useSearchedUidForSession?: boolean;
    noRecordTitle?: string;
    noRecordMessage?: (uid: string) => string;
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

const getSessionScriptId = (session: any) => {
    return session?.data?.script?.id
        || session?.data?.script_id
        || session?.data?.scriptTitle
        || session?.script_id
        || session?.scriptId
        || session?.data?.id;
};

const getSessionKey = (session: any, index?: number) => {
    const uniqueKey = session?.data?.unique_key;
    if (uniqueKey) return `${uniqueKey}`;
    const composite = [
        session?.data?.uid || session?.uid,
        getSessionScriptId(session) || getSessionType(session),
        getSessionDate(session),
    ].filter(Boolean).join('|');
    return composite || `${session?.data?.id || (index ?? '')}`;
};

const SESSION_TYPE_TABS = ['admission', 'neolab', 'discharge', 'drecord'];

const getSessionTab = (session: any) => {
    const type = getSessionType(session);
    if (SESSION_TYPE_TABS.includes(type)) return type;
    const title = getSessionTitle(session);
    if (/admission/i.test(title)) return 'admission';
    if (/neolab/i.test(title)) return 'neolab';
    if (/discharge/i.test(title)) return 'discharge';
    if (/daily record/i.test(title)) return 'drecord';
    return 'admission';
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

const MIN_PATIENT_SUMMARY_DETAIL_ITEMS = 5;

const PATIENT_SUMMARY_FALLBACK_LABELS: Record<string, string> = {
    DateBCT: 'Date of birth',
    DateBCR: 'Date of birth recorded',
    DOBTOB: 'Date and time of birth',
    DateTimeOfBirth: 'Date and time of birth',
    GestAge: 'Gestational age',
    Gestation: 'Gestational age',
    BirthWeight: 'Birth weight',
    AdmissionWeight: 'Admission weight',
    BabyWeight: 'Baby weight',
    BirthFacility: 'Birth facility',
    Sex: 'Sex',
    BabySex: 'Sex',
};

const firstValue = (input: any) => {
    if (Array.isArray(input)) {
        return input.find(item => item !== undefined && item !== null && item !== '') ?? input[0];
    }
    return input;
};

const humanizePatientSummaryKey = (key: string) => {
    return key
        .replace(/_/g, ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\bNUID\b/gi, 'NEOTREE ID')
        .replace(/\bUID\b/gi, 'NEOTREE ID')
        .replace(/\bGA\b/g, 'gestational age')
        .replace(/\s+/g, ' ')
        .trim();
};

const buildPatientSummaryLabelMap = (screens: any[]) => {
    return (screens || []).reduce((acc: Record<string, string>, screen: any) => {
        const metadata = screen?.data?.metadata || {};
        const fields = metadata.fields || [];
        const items = metadata.items || [];

        [...fields, ...items].forEach((field: any) => {
            const key = field?.key || field?.inputKey || field?.value;
            const label = field?.label || field?.text || field?.title;
            if (!key || !label) return;
            acc[`${key}`.toLowerCase()] = `${label}`.trim();
        });

        return acc;
    }, {});
};

const getFallbackPatientSummaryLabel = (key: string) => {
    return Object.entries(PATIENT_SUMMARY_FALLBACK_LABELS).find(([candidate]) =>
        candidate.toLowerCase() === key.toLowerCase()
    )?.[1];
};

const isNeotreeIdSummaryKey = (key: string) => {
    return /^uid$/i.test(key)
        || /^nuid$/i.test(key)
        || /neotree.*id/i.test(key)
        || /nuid/i.test(key);
};

const getPatientSummaryLabel = (
    key: string,
    entry: any,
    labelMap: Record<string, string>,
    fallbackLabel?: string,
) => {
    const fieldLabel = firstValue(
        entry?.fieldLabel
        ?? entry?.label
        ?? entry?.metadata?.label
        ?? entry?.field?.label
        ?? entry?.values?.fieldLabel
    );

    if (fieldLabel !== undefined && fieldLabel !== null && `${fieldLabel}`.trim() !== '') {
        return `${fieldLabel}`.trim();
    }

    const metadataLabel = labelMap[key.toLowerCase()];
    if (metadataLabel) return metadataLabel;

    if (fallbackLabel) return fallbackLabel;

    return humanizePatientSummaryKey(key);
};

export function Search({
    label,
    autofillKeys,
    prePopulateWithUID,
    onSession,
    filterEntries,
    script_type,
    useSearchedUidForSession = prePopulateWithUID !== false,
    noRecordTitle,
    noRecordMessage,
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
    const [noRecordOpen, setNoRecordOpen] = React.useState(false);
    const [noRecordText, setNoRecordText] = React.useState('');
    const [lookupFailed, setLookupFailed] = React.useState(false);
    const [dateConfirmOpen, setDateConfirmOpen] = React.useState(false);
    const [dateConfirmMessage, setDateConfirmMessage] = React.useState('');
    const [inputResetKey, setInputResetKey] = React.useState(0);
    const [recommendedSessionKey, setRecommendedSessionKey] = React.useState('');
    const [recommendedSession, setRecommendedSession] = React.useState<any>(null);
    const [searchedFromQR, setSearchedFromQR] = React.useState(false);
    const [patientSummaryLabels, setPatientSummaryLabels] = React.useState<Record<string, string>>({});
    const qrSessionRef = React.useRef<any[]>([]);
    const qrUidRef = React.useRef('');

    const openQRscanner = () => {
        setShowQR(true);
    };

    const clearResolvedSearch = React.useCallback(() => {
        setSelectedSession(null);
        setPendingNeolab(null);
        setNeolabGateOpen(false);
        setNeolabResultsOpen(false);
        setPendingPatientSelection(null);
        setPatientSummaryOpen(false);
        setNoRecordOpen(false);
        setNoRecordText('');
        setLookupFailed(false);
        setDateConfirmOpen(false);
        setDateConfirmMessage('');
        onSession(null);
    }, [onSession]);

    const resetSearchState = React.useCallback(() => {
        clearResolvedSearch();
        setSessions([]);
        setMerged([]);
        setSessionType('admission');
        setSearched('');
        setQRSession([]);
        qrSessionRef.current = [];
        qrUidRef.current = '';
        setViewedNeolabKeys([]);
        setRecommendedSessionKey('');
        setRecommendedSession(null);
        setSearchedFromQR(false);
    }, [clearResolvedSearch]);

    const handleUIDChange = React.useCallback((nextUID: string, isManual?: boolean) => {
        // Non-manual changes are the input echoing values we set programmatically
        // (e.g. from a QR scan) — they must not wipe the search state.
        if (!isManual) return;
        setUID(nextUID);
        resetSearchState();
    }, [resetSearchState]);

    const clearUID = React.useCallback(() => {
        setUID('');
        // NeotreeIDInput keeps its text when the value prop goes empty, so force a remount.
        setInputResetKey(k => k + 1);
    }, []);

    const resolveUIDWithoutMatch = React.useCallback((nextUID: string) => {
        onSession({
            session: null,
            uid: useSearchedUidForSession ? nextUID : '',
            searchedUid: nextUID,
            autoFill: null,
            prePopulateWithUID: prePopulateWithUID !== false,
            continueWithoutPrePopulation: true,
            useSearchedUidForSession,
        });
    }, [onSession, prePopulateWithUID, useSearchedUidForSession]);

    const filterSessionAutoFillEntries = React.useCallback((session: any) => {
        if (!session) return null;

        const autoFill = JSON.parse(JSON.stringify(session));
        const entries = autoFill?.data?.entries || {};

        if (filterEntries) {
            autoFill.data.entries = Object.keys(entries).reduce((acc: any, key) => {
                if (filterEntries(entries[key])) acc[key] = entries[key];
                return acc;
            }, {});
        }

        if (autofillKeys) {
            autoFill.data.entries = autofillKeys.reduce((acc: any, key) => {
                if (entries[key]) acc[key] = entries[key];
                return acc;
            }, {});
        }

        if (!filterEntries && !autofillKeys) {
            autoFill.data.entries = Object.fromEntries(
                Object.entries(entries).filter(([key, entry]) =>
                    key === 'repeatables' ||
                    hasPrePopulate(entry)
                )
            );
        }

        return autoFill;
    }, [autofillKeys, filterEntries]);

    const buildMatchedSession = React.useCallback((session: any) => {
        if (!session) return null;

        return {
            session,
            uid,
            autoFill: filterSessionAutoFillEntries(session),
            prePopulateWithUID: prePopulateWithUID !== false,
            useSearchedUidForSession,
        };
    }, [filterSessionAutoFillEntries, prePopulateWithUID, uid, useSearchedUidForSession]);

    const getRecommendedSession = React.useCallback((items: any[]) => {
        if (!items?.length) return null;

        const withDates = [...items].sort((a, b) => {
            const aDate = getSessionDate(a);
            const bDate = getSessionDate(b);
            return moment(bDate || 0).valueOf() - moment(aDate || 0).valueOf();
        });

        if (script_type === 'discharge') {
            return withDates.find((s: any) => getSessionType(s) === 'merged')
                || withDates.find((s: any) => getSessionType(s) === 'drecord')
                || withDates.find((s: any) => getSessionType(s) === 'admission')
                || withDates[0];
        }

        if (script_type === 'drecord') {
            return withDates.find((s: any) => getSessionType(s) === 'drecord')
                || withDates.find((s: any) => getSessionType(s) === 'admission')
                || withDates[0];
        }

        return withDates.find((s: any) => getSessionType(s) === script_type)
            || withDates.find((s: any) => getSessionType(s) === 'admission')
            || withDates[0];
    }, [script_type]);

    const onQrRead = (qrtext: any) => {
        if (qrtext) {
            resetSearchState();
            setSearchedFromQR(true);
            const session = normalizeQrSession(qrtext);
            if (session && typeof session === 'object' && session['uid']) {
                qrUidRef.current = session['uid'];
                setUID(session['uid']);
                if (hasFullQrSession(session)) {
                    const sessions = [session];
                    qrSessionRef.current = sessions;
                    setQRSession(sessions);
                    setRecommendedSessionKey(getSessionKey(session, 0));
                    setRecommendedSession(session);
                    setSessionType('qr');
                }
            } else if (typeof session === 'string') {
                setUID(session);
            }
        }
        setShowQR(false);
    };

    const deselectSession = React.useCallback(() => {
        setSelectedSession(null);
        onSession(null);
    }, [onSession]);

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
                } catch {
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

    React.useEffect(() => {
        let cancelled = false;

        (async () => {
            const session = pendingPatientSelection?.session;
            const scriptId = getSessionScriptId(session);
            if (!scriptId) {
                setPatientSummaryLabels({});
                return;
            }

            try {
                const script = await api.getScript({ script_id: scriptId });
                if (!cancelled) {
                    setPatientSummaryLabels(buildPatientSummaryLabelMap(script?.screens || []));
                }
            } catch {
                if (!cancelled) setPatientSummaryLabels({});
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [pendingPatientSelection?.session]);

    const getPatientSummaryItems = React.useCallback((session: any) => {
        const entries = session?.data?.entries || {};
        const entriesList = Object.entries(entries);
        const hasBirthWeight = entriesList.some(([key, entry]: [string, any]) => {
            if (!/^BirthWeight$/i.test(`${key || ''}`.trim())) return false;
            const rawValue = Array.isArray(entry?.values?.value)
                ? entry.values.value[0]
                : entry?.values?.value ?? entry?.value;
            return rawValue !== undefined && rawValue !== null && rawValue !== '';
        });
        const buildItems = (
            filterFn: (key: string, entry: any) => boolean,
            getFallbackLabel?: (key: string) => string | undefined,
        ) =>
            entriesList.reduce((acc: any[], [key, entry]: [string, any]) => {
                const safeKey = typeof key === 'string' ? key.trim() : '';
                if (!safeKey) return acc;
                if (!filterFn(safeKey, entry)) return acc;
                const rawValue = Array.isArray(entry?.values?.value)
                    ? entry.values.value[0]
                    : entry?.values?.value ?? entry?.value;
                const hasValue = rawValue !== undefined && rawValue !== null && rawValue !== '';
                if (!hasValue) return acc;
                const label = getPatientSummaryLabel(safeKey, entry, patientSummaryLabels, getFallbackLabel?.(safeKey));
                acc.push({ key: safeKey, label, value: rawValue });
                return acc;
            }, []);

        const uidItems = buildItems(isNeotreeIdSummaryKey);
        const uidItem = uidItems[0];
        const ipsItems = buildItems((_, entry) => entry?.ips === true).filter(i => !uidItem || i.key !== uidItem.key);
        const fallbackItems = buildItems(
            (key) => {
                if (/^AdmissionWeight$/i.test(key) && hasBirthWeight) return false;
                return Boolean(getFallbackPatientSummaryLabel(key));
            },
            getFallbackPatientSummaryLabel,
        ).filter(i => !uidItem || i.key !== uidItem.key);

        const result: any[] = [];
        if (uidItem) result.push(uidItem);
        result.push(...ipsItems);

        if (ipsItems.length < MIN_PATIENT_SUMMARY_DETAIL_ITEMS) {
            const seen = new Set(result.map(i => i.key.toLowerCase()));
            for (const item of fallbackItems) {
                if (seen.has(item.key.toLowerCase())) continue;
                result.push(item);
                seen.add(item.key.toLowerCase());
                if (result.filter(i => !uidItem || i.key !== uidItem.key).length >= MIN_PATIENT_SUMMARY_DETAIL_ITEMS) break;
            }
        }

        return result.map(({ key, label, value }) => ({ key, label, value }));
    }, [patientSummaryLabels]);

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

    // Called when the user confirms the patient summary. The selection is already
    // resolved (onSession fired on radio tap); this only adds a staleness warning
    // for daily-record sessions that were not completed yesterday.
    const confirmPatientSelection = React.useCallback(() => {
        const matched = pendingPatientSelection || null;
        resetPatientSummary();
        if (!matched) return;

        const session = matched.session;
        const completedAt = session?.data?.completed_at || session?.completed_at;
        const type = getSessionType(session) || session?.type;
        if (type !== 'drecord' || !completedAt) return;

        const completedDate = new Date(completedAt);
        if (isNaN(completedDate.getTime())) return;

        const dateDiff = getDaysDifference(new Date(), completedDate);
        if (dateDiff === 1) return;

        setDateConfirmMessage(dateDiff === 0
            ? 'The selected record was created today. Do you want to proceed with auto-population?'
            : `The selected record was created ${dateDiff} days ago. Do you want to proceed with auto-population?`);
        setDateConfirmOpen(true);
    }, [pendingPatientSelection, resetPatientSummary]);

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
            clearResolvedSearch();
            setSessions([]);
            setMerged([]);
            setSearched('');
            setSearching(true);
            const qrResults = qrSessionRef.current?.length
                ? qrSessionRef.current
                : (qrUidRef.current === uid && qrSession?.length ? qrSession : []);
            let lookupResults: any[] = [];
            let lookupError: any = null;

            try {
                const location = await api.getLocation();
                //Prioritise Local Search
                if (location && location.hospital) {
                
                    lookupResults = await api.getLocalSessionsByUID(uid, location.hospital)

                }
                const localError = lookupResults?.[0]?.['error']
                if(localError|| !lookupResults || lookupResults.length<=0){
                    if (localError) lookupError = lookupResults?.[0];
                    lookupResults = await api.getExportedSessionsByUID(uid);
                }
            } catch (error) {
                lookupError = error;
            }

            const exportedError = lookupResults?.[0]?.['error'];
            if (exportedError) lookupError = lookupResults?.[0];

            const rawSessions = mergeSearchResults(qrResults, lookupResults || []);

            if (lookupError && !rawSessions.length) {
                setSearching(false);
                setLookupFailed(true);
                setNoRecordText('We could not check patient records right now. You can retry, re-scan the QR code, or continue without pre-population.');
                setNoRecordOpen(true);
                return;
            }

            setSessions(rawSessions);
            setSearching(false);
            setSearched(uid);

            if (!rawSessions.length) {
                setLookupFailed(false);
                setNoRecordText(
                    noRecordMessage
                        ? noRecordMessage(uid)
                        : `No patient record was found for ${uid}. Re-scan or continue without pre-population. ${useSearchedUidForSession ? 'The script NUID will use the current Neotree ID.' : 'A new Neotree ID will be generated for this baby.'}`
                );
                setNoRecordOpen(true);
                return;
            }

            const neolabGated = enforceNeolabView(rawSessions);

            let recommended: any = null;
            const canMergeForDischarge = script_type === 'discharge'
                && rawSessions.filter((s: any) => getSessionType(s) === 'drecord').length > 0
                && rawSessions.filter((s: any) => getSessionType(s) === 'admission').length > 0;

            if (canMergeForDischarge) {
                const mergedSessions = [mergeSessions(
                    rawSessions.filter((s: any) => getSessionType(s) === 'drecord')[0],
                    rawSessions.filter((s: any) => getSessionType(s) === 'admission')[0]
                )];
                setMerged(mergedSessions);
                setSessionType('merged');
                recommended = mergedSessions[0];
            } else if (searchedFromQR && qrResults.length) {
                // The QR code carries a full record: it stays the default selection.
                const qrKey = getSessionKey(qrResults[0], 0);
                recommended = rawSessions.find((s: any) => getSessionKey(s) === qrKey) || qrResults[0];
                setSessionType('qr');
            } else {
                recommended = getRecommendedSession(rawSessions);
                if (recommended) setSessionType(getSessionTab(recommended));
            }

            setRecommendedSessionKey(recommended ? getSessionKey(recommended, 0) : '');
            setRecommendedSession(recommended);

            if (!neolabGated && searchedFromQR && recommended) {
                const matched = buildMatchedSession(recommended);
                setSelectedSession(matched);
                onSession(matched);
                setPendingPatientSelection(matched);
                setPatientSummaryOpen(true);
            }
        })();
    }, [buildMatchedSession, clearResolvedSearch, enforceNeolabView, getRecommendedSession, noRecordMessage, onSession, qrSession, script_type, searchedFromQR, uid, useSearchedUidForSession]);

    const admissionSessions = merged.length>0?[]:sessions?.filter(s => s?.data?.type === 'admission' || getSessionTitle(s).match(/admission/gi) || (s.data?.script?.type === 'admission'));
    const neolabSessions =merged.length>0?[]: sessions?.filter(s => s?.data?.type === 'neolab' || getSessionTitle(s).match(/neolab/gi) || (s.data?.script?.type === 'neolab'));
    const dischargeSessions =merged.length>0?[]:sessions?.filter(s => s?.data?.type === 'discharge' || getSessionTitle(s).match(/discharge/gi) || (s?.data?.script?.type === 'discharge'));
    const dailyRecordsSessions = merged.length>0?[]:sessions?.filter(s => s?.data?.type === 'drecord' || getSessionTitle(s).match(/daily record/gi) || (s?.data?.script?.type === 'drecord'));
    const qrSessions = searchedFromQR ? (qrSessionRef.current?.length ? qrSessionRef.current : (qrSession?.length ? qrSession : [])) : [];
   
    function renderList(sessions: any[]) {
        return (
            <>
                {sessions.map((s: any, index: number) => {
                    const sessionKey = getSessionKey(s, index);
                    const selectedSource = selectedSession?.session || selectedSession;
                    const selected = !!selectedSession && (selectedSource === s || sessionKey === getSessionKey(selectedSource));
                    const recommended = recommendedSession === s || sessionKey === recommendedSessionKey;
                    return (
                        <React.Fragment key={sessionKey || index}>
                            <Box
                                borderBottomColor="divider"
                                borderBottomWidth={1}
                                paddingVertical="m"
                            >
                                <Radio
                                    value={getSessionKey(s, index)}
                                    checked={selected}
                                    onChange={() => {
                                        if (selected) {
                                            deselectSession();
                                            return;
                                        }
                                        // Resolve immediately so the Start button state always
                                        // mirrors the visible radio selection; the patient summary
                                        // is a verification step that can undo it.
                                        const matched = buildMatchedSession(s);
                                        setSelectedSession(matched);
                                        onSession(matched);
                                        setPendingPatientSelection(matched);
                                        setPatientSummaryOpen(true);
                                    }}
                                    label={(
                                        <>
                                            <Box flexDirection="row" alignItems="center">
                                                <Text variant="title3">{sessionType === 'merged' ? 'Merged Records' : getSessionTitle(s)}</Text>
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
                        key={`uid-input-${inputResetKey}`}
                        label={label}
                        onChange={handleUIDChange}
                        value={uid}
                    />
                    <Br spacing='l' />
                    <>
                        <Br />
                        <Button disabled={searching}
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
                                <Text color="textDisabled" variant="caption">{qrSessions?.length} QR-code sessions found</Text>
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
                                    if (sessionType === 'merged') return merged;
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
                </Box>}
            <Modal
                open={noRecordOpen && !searching}
                onClose={() => setNoRecordOpen(false)}
                title={lookupFailed ? 'Unable to check records' : (noRecordTitle || 'No matching record found')}
                actions={[
                    {
                        color: 'error',
                        label: 'RE-SCAN',
                        onPress: () => {
                            setNoRecordOpen(false);
                            resetSearchState();
                            clearUID();
                        },
                    },
                    ...(lookupFailed ? [{
                        color: 'primary',
                        label: 'Retry',
                        onPress: () => {
                            setNoRecordOpen(false);
                            search();
                        },
                    }] : []),
                    {
                        color: 'primary',
                        label: lookupFailed ? 'Continue anyway' : 'Continue',
                        onPress: () => {
                            setNoRecordOpen(false);
                            resolveUIDWithoutMatch(uid);
                        },
                    },
                ]}
            >
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'maroon' }}>
                    {noRecordText || ''}
                </Text>
            </Modal>
            <Modal
                open={dateConfirmOpen && !searching}
                onClose={() => {
                    setDateConfirmOpen(false);
                    deselectSession();
                }}
                title="Confirm selected record"
                actions={[
                    {
                        color: 'error',
                        label: 'Change selection',
                        onPress: () => {
                            setDateConfirmOpen(false);
                            deselectSession();
                        },
                    },
                    {
                        color: 'primary',
                        label: 'Continue',
                        onPress: () => setDateConfirmOpen(false),
                    },
                ]}
            >
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'maroon' }}>
                    {dateConfirmMessage || ''}
                </Text>
            </Modal>
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
                            deselectSession();
                            resetPatientSummary();
                        }}
                        style={{ flex: 1, marginRight: 10 }}
                    >
                        Change Selection
                    </Button>
                    <Button
                        color="success"
                        size="m"
                        onPress={confirmPatientSelection}
                        style={{ flex: 1, marginLeft: 10 }}
                    >
                        Continue
                    </Button>
                </Box>
            </Modal>
        </>

    );
}
