
import './App.css'
import {useMemo} from "react";
import {Chart} from "./components/Chart";
import {useStatistics} from "./hooks/useStatistics";

function App() {

    const statistics = useStatistics(10);
    console.log(statistics);

    const cpuUsages : number[] = useMemo(() => {
        return statistics.map(stat => stat.ramUsage);
    }, [statistics]);

  return (
    <div>
         <h1>Perf Hawk</h1>
        <div style={{height: 120}}>
            <Chart data={cpuUsages} maxDataPoints={10} selectedView={'CPU'} />
        </div>

    </div>
  )
}

export default App
