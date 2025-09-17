import React from "react";
import { ScreenEntryValue } from '@/src/types';
import { Box, Text } from "../../Theme";
import { Confidentials } from "./Confidentials";
import { ManagementScreen } from '../../ManagementScreen';
import groupEntries from '../formToHTML/groupEntries';
import { Content, } from "../../Content";

type SummaryProps = {
    Wrapper?: React.ComponentType<React.PropsWithChildren<{}>>;
    showConfidential?: boolean;
    onShowConfidential?: (show: boolean) => void;
    session: any;
    qrCode?: any;
};

export function Summary({
    Wrapper,
    showConfidential,
    onShowConfidential,
    session: { data: { form: sessionForm, } },
}: SummaryProps) {
    Wrapper = Wrapper || React.Fragment;
    // const excludeScreenTypes = ['zw_edliz_summary_table', 'mwi_edliz_summary_table'];
    const excludeScreenTypes: string[] = [];

    const form = sessionForm?.filter((e: any) => !excludeScreenTypes.includes(e.screen?.type));

    const sections: any[] = groupEntries(form);

    return (
        <Box>
             <Content/>
            {!showConfidential && <Confidentials onShowConfidential={onShowConfidential} />}

            <Wrapper>
            <Content/>
                <Content>
                    {sections
                        ?.filter(([, entries]) => entries.length)
                        .map(([sectionTitle, entries], sectionIndex) => {
                            const key = [sectionTitle, sectionIndex].join('');

                            const displayItems = entries
                                ?.filter((e: any) => e.values.length)
                                .map(({
                                    values,
                                    management = [],
                                    screen: { metadata: { label }, type }
                                }: any, entryIndex: number) => {
                                    management = management?.filter((s: any) => form.map((e: any) => e.screen.screen_id).includes(s.screen_id));

                                    const nodes = values
                                        ?.filter((e: any) => e.confidential ? showConfidential : true)
                                        .filter((v: any) => v.valueText || v.value)
                                        .filter((v: any) => v.printable !== false)
                                        .map((v: any, i: number) => {
                                            let isFlexRow = true;
                                            let hideLabel = false;

                                            const extraLabels = (v.extraLabels as ScreenEntryValue['extraLabels']) || [];
                                            let listStyle = v.listStyle || 'none';
                                            if (v.type !== 'multi_select') listStyle = 'none';

                                            if (['fluids', 'drugs'].includes(type)) {
                                                isFlexRow = false;
                                                hideLabel = true;
                                            }

                                            return (
                                                <Box key={`${entryIndex}${i}`}>
                                                    <Box
                                                        columnGap="l"
                                                        mb="m"
                                                        style={{
                                                            flexDirection: isFlexRow ? 'row' : undefined,
                                                        }}
                                                    >
                                                        <Box 
                                                            style={{
                                                                flex: isFlexRow ? 1 : undefined,
                                                                display: hideLabel ? 'none' : undefined,
                                                            }}
                                                        >
                                                            <Text color="textSecondary">{label || v.label || ''}</Text>
                                                        </Box>

                                                        <Box
                                                            {...(isFlexRow ? {
                                                                flex: 1,
                                                            } : {})}
                                                        >
                                                            {
                                                                v.value && v.value.map ?
                                                                    v.value.map((v: any, j: number) => {
                                                                        let bullet = listStyle === 'bullet' ? '• ' : `${i + 1}. `;
                                                                        if (listStyle === 'none') bullet = '';

                                                                        return (
                                                                            <Box key={`${entryIndex}${i}${j}`} mb="s">
                                                                                <Text
                                                                                    style={[
                                                                                        !extraLabels.length ? undefined : {
                                                                                            fontWeight: 'bold',
                                                                                        },
                                                                                    ]}
                                                                                >
                                                                                    {`${bullet}${v.valueText || v.value || 'N/A'} ${!v.value2 ? '' : `(${v.value2})`}`}
                                                                                </Text>
                                                                            </Box>
                                                                        );
                                                                    })
                                                                    :
                                                                    (
                                                                        <Text
                                                                            style={[
                                                                                !extraLabels.length ? undefined : {
                                                                                    fontWeight: 'bold',
                                                                                },
                                                                            ]}
                                                                        >
                                                                            {`${v.valueText || v.value || 'N/A'} ${!v.value2 ? '' : `(${v.value2})`}`}
                                                                        </Text>
                                                                    )
                                                            }

                                                            <Box>
                                                                {extraLabels && extraLabels.map((item, i: number) => {
                                                                    let title: null | React.ReactNode = null;

                                                                    if ((typeof item !== 'string') && item?.title) {
                                                                        title = (
                                                                            <>
                                                                                <Text
                                                                                    color="textSecondary"
                                                                                    mt="s"
                                                                                    fontWeight="bold"
                                                                                >{item.title}:</Text>
                                                                            </>
                                                                        );
                                                                    }

                                                                    const label = typeof item === 'string' ? item : item.label;

                                                                    return (
                                                                        <Box 
                                                                            key={label + i}
                                                                            flexDirection="row"
                                                                        >
                                                                            {title}
                                                                            <Text
                                                                                color="textSecondary"
                                                                                mt="s"
                                                                            >{label || ''}</Text>
                                                                        </Box>
                                                                    )
                                                                })}
                                                            </Box>
                                                        </Box>
                                                    </Box>

                                                    {!!management.length && (
                                                        <Box mt="l">
                                                            {management.map((s: any) => {
                                                                return (
                                                                    <Box key={s.screen_id}>
                                                                        <ManagementScreen
                                                                            data={s.metadata}
                                                                        />
                                                                    </Box>
                                                                )
                                                            })}
                                                        </Box>
                                                    )}
                                                </Box>
                                            );
                                        });

                                    if (!nodes.length) return null;

                                    return (
                                        <Box key={entryIndex}>
                                            {nodes}
                                        </Box>
                                    );
                                })
                                ?.filter((item: any) => item);

                            if (!displayItems.length) return null;

                            return (
                                <Box key={key} mb="l">
                                    {!!sectionTitle && (
                                        <Box mb="s">
                                            <Text variant="title3">{sectionTitle || ''}</Text>
                                        </Box>
                                    )}

                                    {displayItems}
                                </Box>
                            );
                        })}
                </Content>

                {/* {form
                    .filter(({ values, screen }: any) => values.length)
                    .map(({ screen, values, management }: any) => {
                        management = management || [];

                        values = values
                            // .filter((e: any) => e.printable)
                            .reduce((acc: any, e: any) => [
                                ...acc,
                                ...(e.value && e.value.map ? e.value : [e]),
                            ], []);
                        
                        const metadata = screen.metadata;

                        let entries = null;

                        switch (screen.type) {
                            case 'diagnosis':
                                const accepted = values
                                    .filter((v: any) => v.diagnosis.how_agree !== 'No');
                                entries = [
                                    {
                                        label: screen.sectionTitle || 'Ranked diagnoses', // `${screen.sectionTitle} - Primary Problems`,
                                        values: accepted,
                                        management: management,
                                    },
                                ]; // .filter(v => v.values.length);
                                break;
                            case 'form':
                                entries = values
                                    // .filter((e: any) => e.printable)
                                    .filter((e: any) => e.confidential ? showConfidential : true)
                                    .map((entry: any, i: number, arr: any[]) => ({
                                        label: entry.label,
                                        values: [entry],
                                        management: i === (arr.length - 1) ? management : [],
                                    }));
                                break;
                            default:
                                entries = [{
                                    label: screen.sectionTitle || metadata.label,
                                    values,
                                    management,
                                }];
                        }

                        return !entries ? null : entries.map((e: any, i: any) => {
                            const key = `${screen.id}${i}`;
                            return (
								<Entry 
									key={key} entry={e} 
									matched={matched || []} 
								/>
							);
                        });
                    })} */}
            </Wrapper>
        </Box>
    )
}
