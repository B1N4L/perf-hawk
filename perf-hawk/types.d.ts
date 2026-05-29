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

type RecordingStatus = {
    isRecording: boolean;
    sessionId?: number;
};

type RecordingResult = {
    sessionId: number;
    sampleCount: number;
};

type View = 'CPU' | 'RAM' | 'STORAGE';

type FrameWindowAction = 'CLOSE' | 'MAXIMIZE' | 'MINIMIZE';

type EventPayloadMapping = {
    statistics: Statistics; //key: event name //type: that being sent as the payload
    getStaticData: StaticData;
    changeView: View;
    sendFrameAction: FrameWindowAction;
    // recording related
    startRecording: { sessionId: number };
    stopRecording: { sessionId: number | null; sampleCount: number };
    recordingStatus: RecordingStatus;
};

type UnsubscribeFunction = () => void; // a side effect function




interface Window {
    electron: {
        subscribeStatistics: (callback: (statistics: Statistics) => void) => UnsubscribeFunction;
        getStaticData: () => Promise<StaticData>;
        subscribeChangeView: (
            callback: (view: View) => void
        ) => UnsubscribeFunction;
        sendFrameAction: (payload: FrameWindowAction) => void;
        startRecording: () => Promise<{ sessionId: number }>;
        stopRecording: () => Promise<{ sessionId: number | null; sampleCount: number }>;
        subscribeRecordingStatus: (callback: (status: RecordingStatus) => void) => UnsubscribeFunction;
    }
}