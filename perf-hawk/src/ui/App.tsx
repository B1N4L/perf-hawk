
import './App.css'

function App() {

    // @ts-ignore
    window.electron.getStaticData();

  return (
    <div>
         <h1>Perf Hawk</h1>
    </div>
  )
}

export default App
