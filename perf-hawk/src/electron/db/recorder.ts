import {
    RecordingRepository,
    type NewSample,
    type RecordingSessionMode,
} from './repositories/recordingRepository.js';

export type RecorderOptions = {
    checkpointIntervalMs?: number;
    onStatus?: (status: {
        state: RecorderLifecycleState;
        isRecording: boolean;
        isPaused: boolean;
        sessionId?: number;
    }) => void;
};

type RecorderLifecycleState = 'idle' | 'recording' | 'paused';

export class Recorder {
    private buffer: NewSample[] = [];
    private currentSessionId: number | null = null;
    private timer: NodeJS.Timeout | null = null;
    private state: RecorderLifecycleState = 'idle';

    constructor(private readonly repo: RecordingRepository, private readonly opts: RecorderOptions = {}) {}

    start(mode: RecordingSessionMode = 'manual', snapshot: { cpuModel?: string; totalMemGB?: number; totalStorageGB?: number } = {}): { sessionId: number } {
        if (this.state !== 'idle') {
            return { sessionId: this.currentSessionId! };
        }

        const sessionId = this.repo.createSession(mode, snapshot);
        this.currentSessionId = sessionId;
        this.state = 'recording';
        this.buffer = [];

        this.repo.createSessionEvent(sessionId, 'start');

        const interval = this.opts.checkpointIntervalMs ?? 60_000;
        this.timer = setInterval(() => this.checkpoint(), interval);

        this.emitStatus();

        return { sessionId };
    }

    pause(): { sessionId: number } {
        if (this.state !== 'recording' || !this.currentSessionId) {
            return { sessionId: this.currentSessionId ?? -1 };
        }

        this.flushTimer();
        this.checkpoint();
        this.state = 'paused';
        this.repo.createSessionEvent(this.currentSessionId, 'pause');
        this.emitStatus();

        return { sessionId: this.currentSessionId };
    }

    resume(): { sessionId: number } {
        if (this.state !== 'paused' || !this.currentSessionId) {
            return { sessionId: this.currentSessionId ?? -1 };
        }

        this.state = 'recording';
        this.repo.createSessionEvent(this.currentSessionId, 'resume');

        const interval = this.opts.checkpointIntervalMs ?? 60_000;
        this.timer = setInterval(() => this.checkpoint(), interval);

        this.emitStatus();

        return { sessionId: this.currentSessionId };
    }

    captureSample(sample: { cpuUsage: number; ramUsage: number; storageUsage: number }) {
        if (this.state !== 'recording' || !this.currentSessionId) return;

        const s: NewSample = {
            sampledAt: new Date().toISOString(),
            cpuUsage: sample.cpuUsage,
            ramUsage: sample.ramUsage,
            storageUsage: sample.storageUsage,
        };

        this.buffer.push(s);
        // simple safeguard: if buffer grows too large, flush immediately
        if (this.buffer.length >= 10_000) {
            this.checkpoint();
        }
    }

    checkpoint() {
        if (this.state !== 'recording' || !this.currentSessionId) return 0;
        if (this.buffer.length === 0) return 0;

        try {
            const count = this.repo.insertSamples(this.currentSessionId, this.buffer);
            this.buffer = [];
            return count;
        } catch (err) {
            console.error('Failed to checkpoint samples', err);
            return 0;
        }
    }

    stop(): { sessionId: number; sampleCount: number } {
        if (this.state === 'idle' || !this.currentSessionId) {
            return { sessionId: -1, sampleCount: 0 };
        }

        this.flushTimer();
        this.checkpoint();

        // close session
        const sid = this.currentSessionId;
        this.repo.createSessionEvent(sid!, 'stop');
        this.repo.closeSession(sid!);
        const count = this.repo.getSampleCount(sid!);

        this.currentSessionId = null;
        this.state = 'idle';
        this.emitStatus();

        return { sessionId: sid!, sampleCount: count };
    }

    getStatus() {
        return {
            state: this.state,
            isRecording: this.state === 'recording',
            isPaused: this.state === 'paused',
            sessionId: this.currentSessionId ?? undefined,
        };
    }

    private emitStatus() {
        try {
            this.opts.onStatus?.(this.getStatus());
        } catch (err) {
            console.error('Error emitting recorder status', err);
        }
    }

    private flushTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

