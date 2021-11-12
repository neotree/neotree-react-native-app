import React from 'react';
import { Color } from "../types";

export type RadioProps = {
    color?: Color;
    size?: 'small' | 'default' | 'large';
    children?: React.ReactNode;
    checked?: boolean;
    disabled?: boolean;
    onChange?: ({ checked: boolean }) => void;
    variant?: 'outlined';
};

export interface IRadioContext {
    props: RadioProps;
}
