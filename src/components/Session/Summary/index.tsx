import React from "react";
import { Box } from "../../Theme";
import { Confidentials } from "./Confidentials";
import { Entry } from "./Entry";

type SummaryProps = {
    Wrapper?: React.ComponentType<React.PropsWithChildren<{}>>;
    showConfidential?: boolean; 
    onShowConfidential?: (show: boolean) => void;
    session: any;
};

export function Summary({ 
    Wrapper, 
    showConfidential, 
    onShowConfidential, 
    session: { data: { form, matched } },  
}: SummaryProps) {
    Wrapper = Wrapper || React.Fragment;
    const excludeScreenTypes = ['edliz_summary_table'];

    return (
        <Box>
            {!showConfidential && <Confidentials onShowConfidential={onShowConfidential} />}

            <Wrapper>
                {form.filter(({ values, screen }: any) => values.length && !excludeScreenTypes.includes(screen.type))
                    .map(({ screen, values, management }: any) => {
                        management = management || [];

                        values = values.reduce((acc: any, e: any) => [
                            ...acc,
                            ...(e.value && e.value.map ? e.value : [e]),
                        ], []);
                        
                        const metadata = screen.metadata;

                        let entries = null;

                        switch (screen.type) {
                            case 'diagnosis':
                                const accepted = values.filter((v: any) => v.diagnosis.how_agree !== 'No');
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
                    })}
            </Wrapper>
        </Box>
    )
}
