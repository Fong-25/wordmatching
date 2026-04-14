import { useState } from 'react'
import SetupScreen from './pages/Setup.jsx'
import GameScreen from './pages/Game.jsx'
import ResultScreen from './pages/Result.jsx'

function App() {
  const [screen, setScreen] = useState('setup')
  const [gameConfig, setGameConfig] = useState(null)
  const [gameResult, setGameResult] = useState(null)

  const handleStart = (config) => {
    setGameConfig(config)
    setGameResult(null)
    setScreen('game')
  }

  const handleFinish = (result) => {
    setGameResult(result)
    setScreen('result')
  }

  const handleRetry = () => {
    // Replay same config
    setGameResult(null)
    setScreen('game')
  }

  const handleNewGame = () => {
    setGameConfig(null)
    setGameResult(null)
    setScreen('setup')
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4]">
      {screen === 'setup' && (
        <SetupScreen onStart={handleStart} />
      )}
      {screen === 'game' && (
        <GameScreen config={gameConfig} onFinish={handleFinish} />
      )}
      {screen === 'result' && (
        <ResultScreen
          result={gameResult}
          onRetry={handleRetry}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  )
}

export default App