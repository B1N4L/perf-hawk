
import './App.css'
import {useEffect, useMemo, useState} from "react";
import {Chart} from "./components/Chart";
import {useStatistics} from "./hooks/useStatistics";
import SelectOption from "./components/SelectOption";
import Header from "./components/Header";
import useStaticData from "./hooks/useStaticData";

function App() {

    const [activeView, setActiveView] = useState<View>("CPU")

    useEffect((): UnsubscribeFunction => {
        return window.electron.subscribeChangeView((view) => {
            console.log(view)
            setActiveView(view);
        })
    }, []);

    const staticData = useStaticData();
    const statistics = useStatistics(10);
    // console.log(statistics);

    const cpuUsages : number[] = useMemo(() => {
        return statistics.map(stat => stat.cpuUsage);
    }, [statistics]);

    const ramUsages : number[] = useMemo(() => {
        return statistics.map(stat => stat.ramUsage);
    }, [statistics]);

    const storageUsages : number[] = useMemo(() => {
        return statistics.map(stat => stat.storageUsage);
    }, [statistics]);

    const activeUsages = useMemo(() => {
        switch (activeView) {
            case 'CPU':
                return cpuUsages;
            case 'RAM':
                return ramUsages;
            case 'STORAGE':
                return storageUsages;
        }
    }, [activeView, cpuUsages, ramUsages, storageUsages]);

    //record feature
    const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({
        state: 'idle',
        isRecording: false,
        isPaused: false,
    });
    useEffect((): UnsubscribeFunction => {
        return window.electron.subscribeRecordingStatus((status) => {
            setRecordingStatus(status);
        });
    }, []);

    const handleRecord = (): void => {
        if (recordingStatus.state === 'idle') {
            // request start; recorder will emit status event
            window.electron.startRecording().catch((err) => console.error('startRecording failed', err));
        } else {
            // request stop; recorder will emit status event
            window.electron.stopRecording().catch((err) => console.error('stopRecording failed', err));
        }
    }

    const handlePause = (): void => {
        if (recordingStatus.state === 'recording') {
            window.electron.pauseRecording().catch((err) => console.error('pauseRecording failed', err));
        } else if (recordingStatus.state === 'paused') {
            window.electron.resumeRecording().catch((err) => console.error('resumeRecording failed', err));
        } else {
            console.log('pause/resume ignored because recorder is idle');
        }
    }

  return (
      <div className="App">
          <Header />
          <div className="main">
              <div>
                  <SelectOption
                      onClick={() => setActiveView('CPU')}
                      title="CPU"
                      view="CPU"
                      subTitle={staticData?.cpuModel ?? ''}
                      data={cpuUsages}
                  />
                  <SelectOption
                      onClick={() => setActiveView('RAM')}
                      title="RAM"
                      view="RAM"
                      subTitle={(staticData?.totalMemGB.toString() ?? '') + ' GB'}
                      data={ramUsages}
                  />
                  <SelectOption
                      onClick={() => setActiveView('STORAGE')}
                      title="STORAGE"
                      view="STORAGE"
                      subTitle={(staticData?.totalStorage.toString() ?? '') + ' GB'}
                      data={storageUsages}
                  />
              </div>
              <div className="mainGrid">
                  <Chart
                      selectedView={activeView}
                      data={activeUsages}
                      maxDataPoints={10}
                  />
              </div>
          </div>
          {/* Record/Stop Button */}
          <button
              className="mt-12 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={handleRecord}
          >
              {recordingStatus.state === 'idle' ? '⏺ Start Recording' : '⏹ Stop Recording'}
          </button>
          
          {/* Resume/Pause Button */}
          <button
              className="mt-12 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={handlePause}
          >
              {recordingStatus.state === 'paused' ? 'Resume' : 'Pause'}
          </button>
      </div>
  )
}

export default App
