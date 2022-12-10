import { homeAssets } from './Home';
import { scriptAssets } from './Script';
import { configurationAssets } from './Configuration';
import { locationAssets } from './Location';
import { sessionsAssets } from './Sessions';

export const screensAssets = [
    ...homeAssets,
    scriptAssets,
    configurationAssets,
    locationAssets,
    sessionsAssets,
];

export * from './Home';
export * from './Script';
export * from './Configuration';
export * from './Location';
export * from './Sessions';
