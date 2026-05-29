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

type RecordingLifecycleState = 'idle' | 'recording' | 'paused';

type RecordingStatus = {
    state: RecordingLifecycleState;
    sessionId?: number;
    isRecording: boolean;
    isPaused: boolean;
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
    pauseRecording: { sessionId: number };
    resumeRecording: { sessionId: number };
    stopRecording: { sessionId: number; sampleCount: number };
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
        pauseRecording: () => Promise<{ sessionId: number }>;
        resumeRecording: () => Promise<{ sessionId: number }>;
        stopRecording: () => Promise<RecordingResult>;
        subscribeRecordingStatus: (callback: (status: RecordingStatus) => void) => UnsubscribeFunction;
    }
}