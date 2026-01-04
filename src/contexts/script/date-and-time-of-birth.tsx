import { create } from 'zustand';

import { Box, Modal, Radio, DatePicker } from '@/src/components';

const defaultState: {
    value: Date | null;
    open: boolean;
    maxDate: Date;
} = {
    value: null,
    open: false,
    maxDate: new Date(),
};

export const useDateAndTimeOfDeathState = create<typeof defaultState & {
    setValue: (value: Date | null) => void;
    setOpen: (open: boolean) => void;
    reset: () => void;
}>(set => {
    return {
        ...defaultState,
        setValue: (value) => set({ value, }),
        setOpen: (open) => set({ open, maxDate: new Date(), }),
        reset: () => set(defaultState),
    };
});

export function DateAndTimeOfDeathRadio({ onClick, }: {
    onClick?: () => void;
}) {
    const { setOpen, } = useDateAndTimeOfDeathState();
    return (
        <Radio
            label="Baby died?"
            onChange={() => {
                setOpen(true);
                onClick?.();
            }}
        />
    );
}

export function DateAndTimeOfDeathModal({ done, }: {
    done?: () => void;
}) {
    const { open, value, maxDate, setOpen, setValue, } = useDateAndTimeOfDeathState();

    return (
        <Modal
            open={open}
            onClose={() => setOpen(false)}
            onRequestClose={() => setOpen(false)}
            title="Date & Time of Death"
            actions={[
                {
                    label: 'Cancel',
                    color: 'grey-500',
                    onPress: () => {
                        setOpen(false);
                        setValue(null);
                    },
                },
                {
                    label: 'Done',
                    onPress: () => {
                        setOpen(false);
                        done?.();
                    },
                }
            ]}
        >
            <Box>
                <DatePicker
                    mode={'datetime'}
                    value={value}
                    valueText={undefined}
                    label="Date and time of death"
                    onChange={date => setValue(date)}
                    maxDate={maxDate}
                />
            </Box>
        </Modal>
    );
}