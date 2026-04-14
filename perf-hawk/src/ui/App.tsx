
import './App.css'
import {useEffect, useMemo, useState} from "react";
import {Chart} from "./components/Chart";
import {useStatistics} from "./hooks/useStatistics";

function App() {

    useEffect((): UnsubscribeFunction => {
        return window.electron.subscribeChangeView((view) => {
            console.log(view)
            setActiveView(view);
        })
    }, []);

    const [activeView, setActiveView] = useState<View>("CPU")


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
    <div>
        <header>
            <button id="close" onClick={() => window.electron.sendFrameAction("CLOSE")}/>
            <button id="minimize" onClick={() => window.electron.sendFrameAction("MINIMIZE")}/>
            <button id="maximize" onClick={() => window.electron.sendFrameAction("MAXIMIZE")}/>
        </header>
         <h1>Perf Hawk</h1>
        <div style={{height: 120}}>
            <Chart data={activeUsages} maxDataPoints={10} selectedView={'CPU'} />
        </div>

    </div>
  )
}

export default App
