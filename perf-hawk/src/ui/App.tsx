
import './App.css'
import {useEffect} from "react";

function App() {

    useEffect(() => {
        // @ts-ignore
        window.electron.subscribeStatistics(stats => console.log(stats));
    }, [])

  return (
    <div>
         <h1>Perf Hawk</h1>
    </div>
  )
}

export default App
