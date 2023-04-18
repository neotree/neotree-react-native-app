import { Audio } from 'expo-av';

export default async function playSound(src: number) {
    const soundObject = new Audio.Sound();
    try {
        await soundObject.loadAsync(src);
        await soundObject.playAsync();
        // Your sound is playing!

        // Don't forget to unload the sound from memory
        // when you are done using the Sound object
        await soundObject.unloadAsync();
    } catch (error) {
        // An error occurred!
    }
    return soundObject;
}
