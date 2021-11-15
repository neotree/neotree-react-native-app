import React from 'react';
import { TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from '@/components/Image';
import { Fab } from '../../Fab';
import { useTheme, Text, View, Content, } from '@/components/ui';
import { EntryValueDiagnosis } from '@/screens/Script/types';

type Props = {
    children?: React.ReactNode,
    diagnosis: EntryValueDiagnosis,
}

export function Diagnosis({
  children,
  diagnosis,
}: Props) {
    const theme = useTheme();
    const [openModal, setOpenModal] = React.useState(false);
    const [form, _setForm] = React.useState(diagnosis);
    const setForm = s => _setForm(prev => ({ ...prev, ...(typeof s === 'function' ? s(prev) : s) }));

    const instrunctions = [
        { text: diagnosis.text1, image: diagnosis.image1 },
        { text: diagnosis.text2, image: diagnosis.image2 },
        { text: diagnosis.text3, image: diagnosis.image3 }
    ].filter(item => item.text || item.image);

    const onClose = () => {
        // setDiagnosis({ ...diagnosis, ...form });
        setOpenModal(false);
    };

    const symptoms = diagnosis.symptoms || [];

    return openModal ? (
        <>
            <Fab onPress={() => onClose()} />
        </>
    ) : (
        <>
            <TouchableOpacity
                onPress={() => {
                    // setForm(diagnosis);
                    // setOpenModal(true);
                }}
            >
                <MaterialIcons
                    size={24}
                    name="thumb-up"
                    color={diagnosis.how_agree !== 'Yes' ? theme.palette.action.disabled : theme.palette.primary.main}
                />
            </TouchableOpacity>
        </>
    );
}
