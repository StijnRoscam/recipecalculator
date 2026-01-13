import { useState } from 'react'

function App(): JSX.Element {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Recipe Calculator</h1>
        <p>Electron + React + TypeScript</p>
      </header>
      <main className="app-main">
        <div className="counter">
          <p>Count: {count}</p>
          <button onClick={() => setCount((c) => c + 1)}>Increment</button>
        </div>
      </main>
    </div>
  )
}

export default App
