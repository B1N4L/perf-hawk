
import './App.css'
import {useEffect, useMemo, useState} from "react";
import {Chart} from "./components/Chart";
import {useStatistics} from "./hooks/useStatistics";
import SelectOption from "./components/SelectOption";
import Header from "./components/Header";
import useStaticData from "./hooks/useStaticData";

function App() {

    useEffect((): UnsubscribeFunction => {
        return window.electron.subscribeChangeView((view) => {
            console.log(view)
            setActiveView(view);
        })
    }, []);

    const [activeView, setActiveView] = useState<View>("CPU")

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
      </div>
  )
}

export default App
