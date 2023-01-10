import React from "react";
import { Box, Text } from "../../Theme";
import { Br } from "../../Br";
import { Content } from "../../Content";

type EntriesProps = {
    entry: any;
    matched: any[];
};

export function Entry({ entry, matched }: EntriesProps) {
    const { label, values } = entry;

    return (
        <Content>
            <Text>{label}</Text>

            {!values.length ? <Text color="textDisabled">N/A</Text> : values.map((v: any, i: any) => {
                const matches = matched.filter(e => e.key === v.key);

                return (
                    <Box key={i}>
                        <Text color="textDisabled">{v.valueText || v.value || 'N/A'}</Text>

                        {!!matches.length && (
                            <Box>
                                <Br />

                                <Text fontWeight="bold">Matched Neolabs</Text>

                                {matches.map((e, i) => {
                                    return (
                                        <Box key={`${e.key}${i}`}>
                                            {e.values.value.map((text: any, j: any) => (
                                                <Text key={`${e.key}${i}${j}`} style={{ color: '#999' }}>{`${text}`}</Text>
                                            ))}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Content>
    )
}
