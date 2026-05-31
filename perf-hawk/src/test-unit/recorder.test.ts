import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Recorder } from '../electron/db/recorder.js';
import type { NewSample, RecordingSessionEventType } from '../electron/db/repositories/recordingRepository.js';

class MockRecordingRepository {
    createSession = vi.fn((mode: 'manual' | 'background', snapshot: { cpuModel?: string; totalMemGB?: number; totalStorageGB?: number }) => 101);
    createSessionEvent = vi.fn((sessionId: number, eventType: RecordingSessionEventType) => 1);
    insertSamples = vi.fn((sessionId: number, samples: NewSample[]) => samples.length);
    closeSession = vi.fn((sessionId: number) => undefined);
    getSampleCount = vi.fn((sessionId: number) => 0);
}

describe('Recorder', () => {
    let repo: MockRecordingRepository;

    beforeEach(() => {
        repo = new MockRecordingRepository();
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    test('start creates a session and emits recording status', () => {
        const onStatus = vi.fn();
        const recorder = new Recorder(repo as any, { checkpointIntervalMs: 10_000, onStatus });

        const result = recorder.start('manual', { cpuModel: 'X', totalMemGB: 16, totalStorageGB: 512 });

        expect(result).toEqual({ sessionId: 101 });
        expect(repo.createSession).toHaveBeenCalledWith('manual', { cpuModel: 'X', totalMemGB: 16, totalStorageGB: 512 });
        expect(repo.createSessionEvent).toHaveBeenCalledWith(101, 'start');
        expect(onStatus).toHaveBeenCalledWith({ state: 'recording', isRecording: true, isPaused: false, sessionId: 101 });
    });

    test('captureSample buffers only while recording and checkpoint flushes samples', () => {
        const recorder = new Recorder(repo as any, { checkpointIntervalMs: 10_000 });
        recorder.captureSample({ cpuUsage: 0.1, ramUsage: 0.2, storageUsage: 0.3 });
        expect(repo.insertSamples).not.toHaveBeenCalled();

        recorder.start();
        recorder.captureSample({ cpuUsage: 0.1, ramUsage: 0.2, storageUsage: 0.3 });
        recorder.captureSample({ cpuUsage: 0.4, ramUsage: 0.5, storageUsage: 0.6 });

        const flushed = recorder.checkpoint();

        expect(flushed).toBe(2);
        expect(repo.insertSamples).toHaveBeenCalledWith(
            101,
            expect.arrayContaining([
                expect.objectContaining({ cpuUsage: 0.1, ramUsage: 0.2, storageUsage: 0.3 }),
                expect.objectContaining({ cpuUsage: 0.4, ramUsage: 0.5, storageUsage: 0.6 }),
            ])
        );
    });

    test('pause stops capturing samples and resume continues same session', () => {
        const onStatus = vi.fn();
        const recorder = new Recorder(repo as any, { checkpointIntervalMs: 10_000, onStatus });

        recorder.start();
        recorder.captureSample({ cpuUsage: 0.1, ramUsage: 0.2, storageUsage: 0.3 });
        recorder.pause();
        recorder.captureSample({ cpuUsage: 0.9, ramUsage: 0.9, storageUsage: 0.9 });

        expect(repo.createSessionEvent).toHaveBeenCalledWith(101, 'pause');
        expect(repo.insertSamples).toHaveBeenCalledTimes(1);
        expect(repo.insertSamples).toHaveBeenCalledWith(
            101,
            expect.arrayContaining([expect.objectContaining({ cpuUsage: 0.1, ramUsage: 0.2, storageUsage: 0.3 })])
        );

        recorder.resume();
        recorder.captureSample({ cpuUsage: 0.7, ramUsage: 0.8, storageUsage: 0.9 });
        recorder.stop();

        expect(repo.createSessionEvent).toHaveBeenCalledWith(101, 'resume');
        expect(repo.createSessionEvent).toHaveBeenCalledWith(101, 'stop');
        expect(onStatus).toHaveBeenCalledWith({ state: 'paused', isRecording: false, isPaused: true, sessionId: 101 });
        expect(onStatus).toHaveBeenCalledWith({ state: 'recording', isRecording: true, isPaused: false, sessionId: 101 });
    });

    test('double start returns the active session id', () => {
        const recorder = new Recorder(repo as any);

        const first = recorder.start();
        const second = recorder.start();

        expect(first).toEqual({ sessionId: 101 });
        expect(second).toEqual({ sessionId: 101 });
        expect(repo.createSession).toHaveBeenCalledTimes(1);
    });

    test('pause and resume are ignored when recorder is not in the matching state', () => {
        const recorder = new Recorder(repo as any);

        expect(recorder.pause()).toEqual({ sessionId: -1 });
        expect(recorder.resume()).toEqual({ sessionId: -1 });
        expect(repo.createSessionEvent).not.toHaveBeenCalled();
    });

    test('stop without recording is a no-op', () => {
        const recorder = new Recorder(repo as any);

        expect(recorder.stop()).toEqual({ sessionId: -1, sampleCount: 0 });
        expect(repo.closeSession).not.toHaveBeenCalled();
    });

    test('checkpoint failure does not crash and preserves recording state', () => {
        repo.insertSamples.mockImplementationOnce(() => {
            throw new Error('db failed');
        });

        const recorder = new Recorder(repo as any, { checkpointIntervalMs: 10_000 });
        recorder.start();
        recorder.captureSample({ cpuUsage: 0.1, ramUsage: 0.2, storageUsage: 0.3 });

        expect(() => recorder.checkpoint()).not.toThrow();
        expect(recorder.getStatus()).toMatchObject({ state: 'recording', isRecording: true, isPaused: false, sessionId: 101 });
    });
});

