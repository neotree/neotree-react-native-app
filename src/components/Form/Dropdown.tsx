import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/MaterialIcons';
import { Modal } from '../Modal';
import { Text, Box, useTheme, Theme } from '../Theme';
import { Br } from '../Br';
import { TextInput } from './TextInput';

export type DropdownOption = {
    label: string | number;
    value: string | number;
    itemId?: string | number;
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

    const selectedOption = React.useMemo(
        () => options.find(o => `${o.value}` === `${value}`),
        [options, value]
    );
    const normalizedSearch = searchVal.trim().toLowerCase();
    const filteredOptions = React.useMemo(() => {
        if (!normalizedSearch) return options;
        return options.filter(option => `${option.label}`.toLowerCase().includes(normalizedSearch));
    }, [normalizedSearch, options]);
    const handleOpen = React.useCallback(() => {
        setOpenModal(true);
    }, []);
    const handleClose = React.useCallback(() => {
        setOpenModal(false);
        if (searchVal) setSearchVal('');
    }, [searchVal]);
    const handleSearchChange = React.useCallback((nextValue: string) => {
        setSearchVal(nextValue);
    }, []);
    const handleSelect = React.useCallback((option: DropdownOption) => {
        if (onChange) onChange(option.value, option);
        setOpenModal(false);
        if (searchVal) setSearchVal('');
    }, [onChange, searchVal]);
    const renderOption = React.useCallback(({ item }: { item: DropdownOption }) => (
        <TouchableOpacity
            onPress={() => {
                handleSelect(item);
            }}
        >
            <Box padding="m">
                <Text color={selectedOption?.value === item.value ? 'primary' : undefined}>
                    {item.label}
                </Text>
            </Box>
        </TouchableOpacity>
    ), [handleSelect, selectedOption?.value]);

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
                onPress={handleOpen}
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

            {!openModal ? null : (
                <Modal
                    open={openModal}
                    onRequestClose={handleClose}
                    onClose={handleClose}
                    scrollable={false}
                    title={(title || searchable) ? (
                        <>
                            {renderReactNode(title, { textVariant: 'title3', })}
                            {searchable && (
                                <>
                                    {!!title && <Br spacing='s'/>}
                                    
                                    <TextInput
                                        placeholder="Search"
                                        onChangeText={handleSearchChange}
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
                            onPress: handleClose,
                        },
                    ]}
                >
                    <FlatList
                        data={filteredOptions}
                        keyExtractor={(item, index) => `${item.itemId || item.value || index}`}
                        keyboardShouldPersistTaps="handled"
                        initialNumToRender={15}
                        maxToRenderPerBatch={20}
                        windowSize={5}
                        renderItem={renderOption}
                    />
                </Modal>
            )}
        </>
    );
}
