
import './App.css'
import {useEffect} from "react";

function App() {

    // when this component re-renders or unmounts unsubscribe from the statistics event to prevent memory leaks and unnecessary event handling.
    // (eg: otherwise you may keep calling a listener after the component is unmounted, which will cause stale updates, cause errors in the console and potentially crash the app if not handled properly.)
    useEffect(() => {
        // @ts-ignore
        const unSub = window.electron.subscribeStatistics(stats => console.log(stats));
        // return () => {
        //     unSub();
        // };
        return unSub;
    }, [])

  return (
    <div>
         <h1>Perf Hawk</h1>

    </div>
  )
}

export default App
