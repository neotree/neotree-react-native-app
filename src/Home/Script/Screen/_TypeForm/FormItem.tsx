import React from 'react';
import * as types from '../../../../types';

type FormItemProps = React.PropsWithChildren<{
    field: types.ScreenFormTypeProps['field'];
    conditionMet: types.ScreenFormTypeProps['conditionMet'];
    onChange: types.ScreenFormTypeProps['onChange'];
}>;

export function FormItem({
    children,
}: FormItemProps) {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => { setMounted(true); }, []);

    return (
        <>
            {!!mounted && children}
        </>
    );
}
