import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system';

const getAvailableDiskSpace = async () => {
    const total = await FileSystem.getTotalDiskCapacityAsync();
    const free = await FileSystem.getFreeDiskStorageAsync();
      return {
        totalSpace: Math.ceil(total / (1024 * 1024 * 1024)), // Convert to GB
        freeSpace: Math.ceil(free / (1024 * 1024 * 1024)), // Convert to GB
      };
};

export { getAvailableDiskSpace };