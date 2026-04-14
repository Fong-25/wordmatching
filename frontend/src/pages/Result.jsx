const LEVEL_META = {
    A1: { bg: '#dcfce7', text: '#15803d' },
    A2: { bg: '#ccfbf1', text: '#0f766e' },
    B1: { bg: '#fef9c3', text: '#92400e' },
    B2: { bg: '#ffedd5', text: '#9a3412' },
    C1: { bg: '#fee2e2', text: '#991b1b' },
    C2: { bg: '#ede9fe', text: '#5b21b6' },
}

function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
}

function ScoreBadge({ score, max }) {
    const pct = (score / max) * 100
    const grade =
        pct === 100 ? { label: 'Perfect!', emoji: '🏆' }
            : pct >= 80 ? { label: 'Great job!', emoji: '🎉' }
                : pct >= 60 ? { label: 'Good try!', emoji: '👍' }
                    : { label: 'Keep going!', emoji: '💪' }
    return (
        <div className="text-center">
            {/* <div className="text-5xl mb-1">{grade.emoji}</div> */}
            <div className="text-xl font-black text-white">{grade.label}</div>
        </div>
    )
}

function Stars({ wrongAttempts }) {
    const count = wrongAttempts === 0 ? 3 : wrongAttempts <= 3 ? 2 : 1
    return (
        <div className="flex justify-center gap-2 my-2">
            {[1, 2, 3].map((i) => (
                <span
                    key={i}
                    className={`text-4xl ${i <= count ? `star-${i}` : 'opacity-25'}`}
                >
                    ⭐
                </span>
            ))}
        </div>
    )
}

export default function ResultScreen({ result, onRetry, onNewGame }) {
    const { words, score, wrongAttempts, timeElapsed } = result
    const maxScore = words.length * 10

    return (
        <div className="max-w-md mx-auto min-h-screen flex flex-col">

            {/* ── Hero score card ── */}
            <div className="bg-linear-to-b from-green-600 to-green-700 px-5 pt-8 pb-6 animate-bounce-in">
                <ScoreBadge score={score} max={maxScore} />
                <Stars wrongAttempts={wrongAttempts} />

                {/* Score number */}
                <div className="text-center mt-1 mb-5">
                    <span className="text-6xl font-black text-white tabular-nums">{score}</span>
                    <span className="text-green-300 font-bold text-lg"> / {maxScore}</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Words', value: words.length, emoji: '📝' },
                        { label: 'Misses', value: wrongAttempts, emoji: '❌' },
                        { label: 'Time', value: formatTime(timeElapsed), emoji: '⏱' },
                    ].map((s) => (
                        <div key={s.label} className="bg-green-500/40 rounded-2xl py-3 text-center">
                            <div className="text-xl mb-0.5">{s.emoji}</div>
                            <div className="text-white font-black text-lg leading-none tabular-nums">{s.value}</div>
                            <div className="text-green-200 text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Word review ── */}
            <div className="flex-1 px-4 pt-5 pb-4">
                <h2 className="font-black text-gray-700 text-base mb-3 flex items-center gap-2">
                    <span>📖</span> Review All Words
                </h2>

                <div className="space-y-3">
                    {words.map((word, i) => {
                        const meta = LEVEL_META[word.CEFR] || { bg: '#f3f4f6', text: '#374151' }
                        return (
                            <div
                                key={word.id}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-fade-up"
                                style={{ animationDelay: `${i * 0.04}s` }}
                            >
                                {/* Word + meta */}
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span className="font-black text-gray-900 text-base">{word.word}</span>
                                    <span className="text-xs text-gray-400 italic">{word.pos}</span>
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-auto"
                                        style={{ backgroundColor: meta.bg, color: meta.text }}
                                    >
                                        {word.CEFR}
                                    </span>
                                </div>

                                {/* Definition */}
                                <p className="text-sm text-gray-600 leading-snug">{word.Definition}</p>

                                {/* Example */}
                                {word.Example && (
                                    <p className="text-xs text-gray-400 italic mt-2 pl-3 border-l-2 border-green-300 leading-snug">
                                        {word.Example}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Action buttons ── */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-100 px-4 py-3 flex gap-3">
                <button
                    onClick={onRetry}
                    className="flex-1 py-3.5 rounded-2xl border-2 border-green-600 text-green-700 font-black text-sm transition-all active:scale-95"
                >
                    Retry
                </button>
                <button
                    onClick={onNewGame}
                    className="flex-1 py-3.5 rounded-2xl bg-green-600 text-white font-black text-sm shadow-lg shadow-green-200 transition-all active:scale-95"
                >
                    New Game
                </button>
            </div>
        </div>
    )
}