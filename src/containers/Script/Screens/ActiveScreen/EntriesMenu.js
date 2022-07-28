import React from 'react';
import { ScrollView, View, TouchableOpacity, Modal, } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Content from '@/components/Content';
import Text from '@/components/Text';
import { useContext } from '../../Context';

export default function EntriesMenu() {
    const { state: { entries }, setState } = useContext();
    const [open, setOpen] = React.useState(false);

    const disabled = false;

    return (
        <>
            <TouchableOpacity
                style={{ paddingHorizontal: 5 }}
                onPress={() => setOpen(true)}
                disabled={disabled}
            >
                <MaterialIcons size={24} color={disabled ? '#ccc' : '#999'} name="list" />
            </TouchableOpacity>
            <Modal
                visible={open}
                transparent
                overFullScreen
                onRequestClose={() => setOpen(false)}
                statusBarTranslucent
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,.6)',
                    }}
                >
                    <TouchableOpacity
                        onPress={() => setOpen(false)}
                        disabled={disabled}
                        style={{ position: 'absolute', top: 25, right: 25 }}
                    >
                        <MaterialIcons size={30} color="#fff" name="close" />
                    </TouchableOpacity>
                    <View style={{ marginVertical: 60 }}>
                        <ScrollView>
                            <>
                                {/* <Content style={{ paddingVertical: 0 }}>
                                    <View style={{ backgroundColor: '#fff', }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, }}>
                                            <Text style={{ fontSize: 20 }}>Go to screen</Text>
                                            <View style={{ marginLeft: 'auto', }} />
                                            <TouchableOpacity
                                                style={{ paddingHorizontal: 5 }}
                                                onPress={() => setOpen(false)}
                                                disabled={disabled}
                                            >
                                                <MaterialIcons size={24} color="#000" name="close" />
                                            </TouchableOpacity>
                                        </View>
                                        <Divider />
                                    </View>
                                </Content> */}
                                <Content style={{ paddingVertical: 0 }}>
                                    <View style={{ backgroundColor: '#fff', padding: 10, }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ flex: 1 }}>
                                                {!entries.length ? (
                                                    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 50, }}>
                                                        <Text style={{ color: '#999' }}>Your enties will appear here</Text>
                                                    </View>
                                                ) : (
                                                    <>
                                                        <Text style={{ fontSize: 20, marginBottom: 25 }}>Go to screen</Text>
                                                        {entries.map((e, i) => {
                                                            const key = i;
                                                            return (
                                                                <TouchableOpacity
                                                                    key={key}
                                                                    onPress={() => {
                                                                        setState({ goToEntryWithIndex: i })
                                                                        setOpen(false);
                                                                    }}
                                                                    style={{ marginBottom: 10 }}
                                                                >
                                                                    <View key={key} style={{ padding: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, }}>
                                                                        <Text>{e.screen.title}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                </Content>
                            </>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
}
