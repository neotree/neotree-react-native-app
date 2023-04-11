import Crashes from 'appcenter-crashes';

export function handleAppCrush(error: any) {
    console.log("--I HAVE CRUSHED--",error)
   Crashes.trackError(error);
}