import { useState } from 'react'
import SetupScreen from './pages/Setup.jsx'
import GameScreen from './pages/Game.jsx'
import ResultScreen from './pages/Result.jsx'

const HISTORY_KEY = 'vocabmatch_history'
const MAX_HISTORY = 10

function saveRoundToHistory(gameConfig, result) {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    const entry = {
      id: Date.now(),
      playedAt: new Date().toISOString(),
      config: gameConfig,
      words: result.words,
      score: result.score,
      wrongAttempts: result.wrongAttempts,
      timeElapsed: result.timeElapsed
    }
    const update = [entry, ...existing].slice(0, MAX_HISTORY)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(update))
  } catch (error) {
    console.warn("Failed to save round to history:  ", error)
  }
}

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
    saveRoundToHistory(gameConfig, result)
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