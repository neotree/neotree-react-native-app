import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getAppDetails() {
    const neotreeAppDetails = await AsyncStorage.getItem('neotree.appDetails');
    return JSON.parse(neotreeAppDetails || '{}');
}  

export async function initialiseData() {
    const config = Constants.manifest?.extra;
    const appDetails = await getAppDetails();
    console.log(appDetails);
}  
