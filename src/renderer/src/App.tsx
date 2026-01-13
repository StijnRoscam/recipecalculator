import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './components/LanguageSwitcher'

function App(): JSX.Element {
  const [count, setCount] = useState(0)
  const { t } = useTranslation()

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-content">
          <div className="app-header-title">
            <h1>{t('app.title')}</h1>
            <p>{t('app.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
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
