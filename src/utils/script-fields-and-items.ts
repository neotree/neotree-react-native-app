type Option = { 
    itemId: string;
    value: string; 
    label: string; 
    enterValueManually?: boolean;
    exclusive?: boolean;
    option?: { 
        label: string; 
        key: string;
    },
};

export function parseFieldValues({
    values,
    options = [],
}: {
    values: string;
    options?: {
        optionKey: string;
        optionLabel: string;
    }[];
}) {
    let opts: Option[] = (values || '').split('\n')
        .map((v = '') => v.trim())
        .filter((v: any) => v)
        .map((v: any, i) => {
            v = v.split(',');
            const option = options.find((o: any) => `${o.key}` === `${v[0]}`);
            return { 
                itemId: `${i}`,
                value: v[0], 
                label: v[1], 
                option: !option ? undefined : {
                    key: option.optionKey,
                    label: option.optionLabel,
                },
            };
        });

    opts = opts.filter((o, i) => i === opts.map(o => o.value).indexOf(o.value));

    return opts;
}

export function parseFieldItems({ items = [], }: {
    items: {
        itemId: string;
        label: string;
        value: string;
        enterValueManually?: boolean;
        exclusive?: boolean;
        label2?: string;
    }[];
}): Option[] {
    return items.map(({ label2, ...item }) => {
        return {
            ...item,
            option: !label2 ? undefined : {
                key: '',
                label: label2,
            },
        };
    });
}
