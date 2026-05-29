import { RecordingRepository, type NewSample } from './repositories/recordingRepository.js';

export type RecorderOptions = {
    checkpointIntervalMs?: number;
    onStatus?: (status: { isRecording: boolean; sessionId?: number }) => void;
};

export class Recorder {
    private buffer: NewSample[] = [];
    private currentSessionId: number | null = null;
    private timer: NodeJS.Timeout | null = null;
    private isRecording = false;

    constructor(private readonly repo: RecordingRepository, private readonly opts: RecorderOptions = {}) {}

    start(mode: 'manual' | 'background' = 'manual', snapshot: { cpuModel?: string; totalMemGB?: number; totalStorageGB?: number } = {}): { sessionId: number } {
        if (this.isRecording) {
            return { sessionId: this.currentSessionId! };
        }

        const sessionId = this.repo.createSession(mode, snapshot);
        this.currentSessionId = sessionId;
        this.isRecording = true;
        this.buffer = [];

        const interval = this.opts.checkpointIntervalMs ?? 60_000;
        this.timer = setInterval(() => this.checkpoint(), interval);

        this.emitStatus();

        return { sessionId };
    }

    captureSample(sample: { cpuUsage: number; ramUsage: number; storageUsage: number }) {
        if (!this.isRecording || !this.currentSessionId) return;

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
        if (!this.isRecording || !this.currentSessionId) return 0;
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
        if (!this.isRecording || !this.currentSessionId) {
            return { sessionId: -1, sampleCount: 0 };
        }

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // flush remaining
        this.checkpoint();

        // close session
        const sid = this.currentSessionId;
        this.repo.closeSession(sid!);
        const count = this.repo.getSampleCount(sid!);

        this.currentSessionId = null;
        this.isRecording = false;
        this.emitStatus();

        return { sessionId: sid!, sampleCount: count };
    }

    getStatus() {
        return { isRecording: this.isRecording, sessionId: this.currentSessionId ?? undefined };
    }

    private emitStatus() {
        try {
            this.opts.onStatus?.(this.getStatus());
        } catch (err) {
            console.error('Error emitting recorder status', err);
        }
    }
}

