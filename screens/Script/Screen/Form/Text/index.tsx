import React from 'react';
import { ScreenFormFieldComponentProps } from '../../../types';
import { UID } from './UID';
import { PlainText } from './PlainText';

export function FieldText(props: ScreenFormFieldComponentProps) {
    const { field } = props;

    const isNeotreeID = field.key.match('UID') || field.key.match('NUID_') ||
        field.key.match(new RegExp('neotree', 'gi'));

    return (
        <>
            {isNeotreeID ? <UID {...props} /> : <PlainText {...props} />}
        </>
    );
}
