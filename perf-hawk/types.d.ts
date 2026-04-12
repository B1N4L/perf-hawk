type Statistics = {
    cpuUsage: number; //set to 'never' from 'number' for type testing at resourceManager.ts
    ramUsage: number;
    storageUsage: number;
};

type StaticData = {
    totalStorage: number;
    cpuModel: string;
    totalMemGB: number;
};

type EventPayloadMapping = {
    statistics: Statistics; //key: event name
    getStaticData: StaticData; //type: that being sent as the payload
};




interface Window {
    electron: {
        subscribeStatistics: (callback: (statistics: Statistics) => void) => void;
        getStaticData: () => Promise<StaticData>;
    }
}