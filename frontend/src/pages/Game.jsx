import { useState, useEffect, useRef, useCallback } from 'react'

function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function GameScreen({ config, onFinish }) {
    const [words, setWords] = useState([])
    const [shuffledWords, setShuffledWords] = useState([])
    const [shuffledDefs, setShuffledDefs] = useState([])
    const [selectedWordId, setSelectedWordId] = useState(null)
    const [matched, setMatched] = useState(new Set())
    const [wrongIds, setWrongIds] = useState({ wordId: null, defId: null })
    const [elapsed, setElapsed] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Use refs for values needed in callbacks at game-end to avoid stale closures
    const wrongAttemptsRef = useRef(0)
    const elapsedRef = useRef(0)
    const isBlockingRef = useRef(false) // blocks taps during wrong-animation
    const timerRef = useRef(null)

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            elapsedRef.current += 1
            setElapsed((p) => p + 1)
        }, 1000)
    }

    // Fetch words on mount
    useEffect(() => {
        if (config.type === 'replay' && config.words?.length) {
            const data = config.words
            setWords(data)
            setShuffledWords(shuffle(data))
            setShuffledDefs(shuffle(data))
            setLoading(false)
            startTimer()
            return () => clearInterval(timerRef.current)
        }

        let url = 'api/words'
        if (config.type === 'specific') url += `?level=${config.level}`
        if (config.type === 'range') url += `?fromLevel=${config.fromLevel}&toLevel=${config.toLevel}`

        const fetchWords = async () => {
            try {
                const r = await fetch(`${import.meta.env.VITE_API_URL}/${url}`)
                if (!r.ok) throw new Error('Server error')

                const data = await r.json()
                if (!data.length) throw new Error('No words found for this level.')

                setWords(data)
                setShuffledWords(shuffle(data))
                setShuffledDefs(shuffle(data))
                setLoading(false)
                // Start timer
                // timerRef.current = setInterval(() => {
                //     elapsedRef.current += 1
                //     setElapsed((p) => p + 1)
                // }, 1000)
                startTimer()
            } catch (e) {
                setError(e.message || 'Failed to load words.')
            }
        }

        fetchWords()

        return () => clearInterval(timerRef.current)
    }, [config])

    const liveScore = Math.max(0, matched.size * 10 - wrongAttemptsRef.current * 2)

    const handleWordTap = useCallback(
        (wordId) => {
            if (matched.has(wordId) || isBlockingRef.current) return
            setSelectedWordId((prev) => (prev === wordId ? null : wordId))
        },
        [matched],
    )

    const handleDefTap = useCallback(
        (defWordId) => {
            if (matched.has(defWordId) || isBlockingRef.current || !selectedWordId) return

            if (selectedWordId === defWordId) {
                // ✅ Correct match
                const newMatched = new Set([...matched, defWordId])
                setMatched(newMatched)
                setSelectedWordId(null)

                if (newMatched.size === words.length) {
                    clearInterval(timerRef.current)
                    const finalScore = Math.max(0, newMatched.size * 10 - wrongAttemptsRef.current * 2)
                    setTimeout(() => {
                        onFinish({
                            words,
                            score: finalScore,
                            wrongAttempts: wrongAttemptsRef.current,
                            timeElapsed: elapsedRef.current,
                        })
                    }, 400)
                }
            } else {
                // ❌ Wrong match
                isBlockingRef.current = true
                wrongAttemptsRef.current += 1
                setWrongIds({ wordId: selectedWordId, defId: defWordId })

                setTimeout(() => {
                    setWrongIds({ wordId: null, defId: null })
                    setSelectedWordId(null)
                    isBlockingRef.current = false
                }, 700)
            }
        },
        [matched, selectedWordId, words, onFinish],
    )

    // ─── Card style helpers ───────────────────────────────────────────────────

    const wordCardStyle = (wordId) => {
        if (matched.has(wordId))
            return 'bg-green-100 border-green-400 text-green-800 opacity-60'
        if (wrongIds.wordId === wordId)
            return 'bg-red-100 border-red-400 text-red-700 animate-shake'
        if (selectedWordId === wordId)
            return 'bg-green-50 border-green-500 shadow-md shadow-green-100 scale-[1.03]'
        return 'bg-white border-gray-200 text-gray-800 hover:border-green-300 active:border-green-500'
    }

    const defCardStyle = (defId) => {
        if (matched.has(defId))
            return 'bg-green-100 border-green-400 text-green-700 opacity-60'
        if (wrongIds.defId === defId)
            return 'bg-red-100 border-red-400 text-red-700 animate-shake'
        if (selectedWordId && !matched.has(defId))
            return 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50 cursor-pointer'
        return 'bg-white border-gray-200 text-gray-500'
    }

    // ─── Loading / Error ──────────────────────────────────────────────────────

    if (loading && !error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
                <p className="text-gray-400 font-semibold text-sm">Loading words…</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
                <div className="text-5xl">😕</div>
                <p className="text-gray-700 font-bold text-center">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-extrabold shadow-md"
                >
                    Try Again
                </button>
            </div>
        )
    }

    // ─── Game UI ──────────────────────────────────────────────────────────────

    return (
        <div className="max-w-md md:max-w-4xl mx-auto min-h-screen flex flex-col">

            {/* ── Sticky Header ── */}
            <header className="sticky top-0 z-20 bg-green-600 text-white px-4 md:px-6 pt-3 md:pt-4 pb-2 md:pb-3 shadow-lg shadow-green-200">
                <div className="flex items-center justify-between mb-2">

                    {/* Score */}
                    <div className="flex items-center gap-1.5 bg-green-700 rounded-xl px-3 md:px-4 py-1.5 md:py-2">
                        <span className="text-base md:text-xl">🪙</span>
                        <span className="font-black text-lg md:text-2xl leading-none tabular-nums">{liveScore}</span>
                    </div>

                    {/* Pairs */}
                    <div className="text-center">
                        <span className="font-extrabold text-sm md:text-lg">
                            {matched.size}
                            <span className="text-green-300 font-semibold">/{words.length}</span>
                        </span>
                        <div className="text-green-300 text-[10px] md:text-xs font-semibold uppercase tracking-wider">pairs</div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-1.5 bg-green-700 rounded-xl px-3 md:px-4 py-1.5 md:py-2">
                        <span className="text-base md:text-xl">⏱</span>
                        <span className="font-mono font-bold text-sm md:text-lg tabular-nums">{formatTime(elapsed)}</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="bg-green-700 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-white rounded-full h-full transition-all duration-500 ease-out"
                        style={{ width: `${(matched.size / words.length) * 100}%` }}
                    />
                </div>
            </header>

            {/* ── Hint banner ── */}
            <div
                className={`sticky top-[72px] md:top-[88px] z-10 text-center py-1.5 md:py-2 text-xs md:text-sm font-bold transition-all duration-300
          ${selectedWordId
                        ? 'bg-green-50 text-green-700 border-b border-green-200 opacity-100'
                        : 'opacity-0 pointer-events-none h-0 py-0'
                    }`}
            >
                ✨ Now tap the matching definition
            </div>

            {/* ── Two-column matching area ── */}
            <main className="flex-1 p-3 md:p-6 pb-8">
                <div className="flex gap-2 md:gap-4">

                    {/* Words column */}
                    <div className="flex-1 flex flex-col gap-2">
                        <p className="text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-widest text-center mb-0.5 md:mb-1">
                            Words
                        </p>
                        {shuffledWords.map((word) => (
                            <button
                                key={word.id}
                                onClick={() => handleWordTap(word.id)}
                                className={`no-press w-full h-[84px] md:h-[112px] p-3 md:p-4 rounded-xl border-2 text-left 
                  transition-all duration-150 flex flex-col justify-center ${wordCardStyle(word.id)}`}
                            >
                                {matched.has(word.id) && (
                                    <span className="text-green-600 text-xs md:text-sm font-black mr-1">✓</span>
                                )}
                                <span className="font-extrabold text-sm md:text-lg leading-tight">{word.word}</span>
                                <span className="text-[10px] md:text-xs font-semibold text-gray-400 mt-0.5 md:mt-1 italic">{word.pos}</span>
                            </button>
                        ))}
                    </div>

                    {/* Definitions column */}
                    <div className="flex-1 flex flex-col gap-2">
                        <p className="text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-widest text-center mb-0.5 md:mb-1">
                            Definitions
                        </p>
                        {shuffledDefs.map((word) => (
                            <button
                                key={word.id}
                                onClick={() => handleDefTap(word.id)}
                                className={`no-press w-full h-[84px] md:h-[112px] p-3 md:p-4 rounded-xl border-2 text-left
                  transition-all duration-150 flex items-start ${defCardStyle(word.id)}`}
                            >
                                {matched.has(word.id) && (
                                    <span className="text-green-600 text-xs md:text-sm font-black mr-1 mt-0.5">✓</span>
                                )}
                                <span className="text-[11px] md:text-[15px] font-semibold leading-snug md:leading-relaxed overflow-y-auto max-h-full pr-1">{word.Definition}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}