import React from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Modal } from '../Modal';
import { Text, Box, useTheme, Theme } from '../Theme';
import { Br } from '../Br';
import { TextInput } from './TextInput';

export type DropdownOption = {
    label: string | number;
    value: string | number;
};

export type DropdownProps = {
    placeholder?: React.ReactNode;
    label?: React.ReactNode;
    options: DropdownOption[];
    value?: DropdownOption['value'];
    searchable?: boolean;
    title?: React.ReactNode;
    onChange?: (value: DropdownOption['value'], option: DropdownOption) => void;
    disabled?: boolean;
};

type RenderReactNodeOptions = { 
    textVariant?: keyof Theme['textVariants']; 
    fontWeight?: any;
    textColor?: any;
};

const renderReactNode = (node: React.ReactNode, opts?: RenderReactNodeOptions) => (
    (typeof node === 'string') || (typeof node === 'number') ? (
        <Text 
            variant={opts?.textVariant} 
            fontWeight={opts?.fontWeight}
            color={opts?.textColor}
        >{node}</Text>
      )  :
        node
);

export function Dropdown({
    placeholder,
    label,
    value,
    options,
    title,
    onChange,
    searchable,
    disabled,
}: DropdownProps) {
    const theme = useTheme();
    const [openModal, setOpenModal] = React.useState(false);
    const [searchVal, setSearchVal] = React.useState('');

    const selectedOption = options.filter(o => `${o.value}` === `${value}`)[0];

    return (
        <>
            {!!label && (
                <>
                    {renderReactNode(label)}
                    <Br spacing="s" />
                </>
            )}

            <TouchableOpacity
                disabled={disabled}
                onPress={() => {
                    setOpenModal(true);
                }}
            >
                <Box
                    borderColor="divider"
                    borderWidth={1}
                    borderRadius="m"
                    padding="m"
                    flexDirection="row"
                    alignItems="center"
                    backgroundColor={disabled ? 'disabledBackground' : undefined}
                >
                    <Box flex={1}>
                        {selectedOption ? (
                            <Text numberOfLines={1} color={disabled ? 'textDisabled' : undefined}>
                                {selectedOption ? selectedOption.label : null}
                            </Text>
                        ) : renderReactNode(placeholder, { textColor: 'textDisabled', })}
                    </Box>

                    <Box paddingLeft="m">
                        <Icon 
                            size={24}
                            color={theme.colors.textDisabled}
                            name="keyboard-arrow-down"
                        />
                    </Box>
                </Box>
            </TouchableOpacity>

            <Modal
                open={openModal}
                onClose={() => setOpenModal(true)}
                title={(title || searchable) ? (
                    <>
                        {renderReactNode(title, { textVariant: 'title3', })}
                        {searchable && (
                            <>
                                {!!title && <Br />}
                                
                                <TextInput
                                    placeholder="Search"
                                    onChangeText={val => setSearchVal(val)}
                                    returnKeyType="search"
                                    size="s"
                                />
                            </>
                        )}
                    </>
                ) : undefined}
                actions={[
                    {
                        label: 'Cancel',
                        onPress: () => setOpenModal(false),
                    },
                ]}
            >
                {options.map((o, i) => {
                    if (searchVal && !`${o.label}`.match(new RegExp(searchVal, 'gi'))) return null;
                    return (
                        <React.Fragment key={i}>
                            <TouchableOpacity                            
                                onPress={() => {
                                    if (onChange) onChange(o.value, o);
                                    setOpenModal(false);
                                }}
                            >
                                <Box
                                    padding="m"
                                >
                                    <Text
                                        color={selectedOption?.value === o.value ? 'primary' : undefined}
                                    >{o.label}</Text>
                                </Box>
                            </TouchableOpacity>
                        </React.Fragment>
                    );
                })}
            </Modal>
        </>
    );
}
