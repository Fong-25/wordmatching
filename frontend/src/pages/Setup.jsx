import { useState, useEffect } from 'react';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const HISTORY_KEY = 'vocabmatch_history'

const LEVEL_META = {
    A1: { label: 'Beginner', color: '#16a34a', bg: '#dcfce7', text: '#15803d' },
    A2: { label: 'Elementary', color: '#0d9488', bg: '#ccfbf1', text: '#0f766e' },
    B1: { label: 'Intermediate', color: '#ca8a04', bg: '#fef9c3', text: '#92400e' },
    B2: { label: 'Upper-Int', color: '#ea580c', bg: '#ffedd5', text: '#9a3412' },
    C1: { label: 'Advanced', color: '#dc2626', bg: '#fee2e2', text: '#991b1b' },
    C2: { label: 'Mastery', color: '#7c3aed', bg: '#ede9fe', text: '#5b21b6' },
}

const MODES = [
    {
        id: 'random',
        icon: '🎲',
        title: 'Random Mix',
        desc: '10 words from all CEFR levels',
    },
    {
        id: 'specific',
        icon: '🎯',
        title: 'Specific Level',
        desc: '10 words from one CEFR level',
    },
    {
        id: 'range',
        icon: '📊',
        title: 'Level Range',
        desc: '10 words spanning a level range',
    },
]

function configLabel(config) {
    if (!config) return 'Unknown'
    if (config.type === 'random') return 'Random Mix'
    if (config.type === 'specific') return `Level ${config.level}`
    if (config.type === 'range') return `${config.fromLevel} → ${config.toLevel}`
    if (config.type === 'replay') return configLabel(config.originalConfig)
    return 'Replay'
}

function formatRelativeTime(isoString) {
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
    } catch (error) {
        return []
    }
}
function clearHistory() {
    localStorage.removeItem(HISTORY_KEY)
}

function ReplayPreviewModal({ entry, onClose, onPlay }) {
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    })

    if (!entry) return null
    const { words, score, wrongAttempts, timeElapsed, config } = entry
    const maxScore = words.length * 10
    const pct = Math.round((score / maxScore) * 100)
    const stars = wrongAttempts === 0 ? 3 : wrongAttempts <= 2 ? 2 : 1
    const formatTime = (s) => {
        const m = Math.floor(s / 60)
        const sec = s % 60
        return `${m}:${sec.toString().padStart(2, '0')}`
    }

    return (
        <div
            className='fixed inset-0 z-50 flex flex-col justify-end'
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            {/* Sheet */}
            <div
                className="bg-white rounded-t-3xl w-full max-w-md mx-auto flex flex-col"
                style={{
                    maxHeight: '88vh',
                    animation: 'sheet-up 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                }}
            >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                {/* Header */}
                <div className="px-5 pt-2 pb-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="font-black text-gray-900 text-lg leading-tight">
                                {configLabel(config)}
                            </h2>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-yellow-400 text-sm tracking-tight">
                                    {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                                </span>
                                <span className="text-xs text-gray-400 font-semibold">
                                    {pct}% · {wrongAttempts} miss{wrongAttempts !== 1 ? 'es' : ''} · {formatTime(timeElapsed)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors mt-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 font-semibold mt-2">
                        {words.length} words · Tap "Play" to replay this exact set.
                    </p>
                </div>

                {/* Word list — scrollable */}
                <div className="overflow-y-auto flex-1 px-5 py-3 space-y-2">
                    {words.map((word, i) => {
                        const meta = LEVEL_META[word.CEFR] || { bg: '#f3f4f6', text: '#374151' }
                        return (
                            <div
                                key={word.id}
                                className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100"
                                style={{ animation: `fade-up 0.3s ${i * 0.03}s both` }}
                            >
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="font-black text-gray-900 text-sm">{word.word}</span>
                                    <span className="text-xs text-gray-400 italic">{word.pos}</span>
                                    <span
                                        className="text-[10px] px-2 py-0.5 rounded-full font-extrabold ml-auto"
                                        style={{ backgroundColor: meta.bg, color: meta.text }}
                                    >
                                        {word.CEFR}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 leading-snug">{word.Definition}</p>
                                {word.Example && (
                                    <p className="text-[11px] text-gray-400 italic mt-1.5 pl-2.5 border-l-2 border-green-200 leading-snug">
                                        {word.Example}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                    <div className="h-2" />
                </div>

                {/* CTA */}
                <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-500 font-black text-sm transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onPlay}
                        className="flex-2 py-3.5 rounded-2xl bg-green-600 text-white font-black text-sm shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Play Again
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes sheet-up {
                    from { transform: translateY(100%); opacity: 0.6; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `}</style>
        </div>
    )
}

export default function SetupScreen({ onStart }) {
    const [mode, setMode] = useState('random');
    const [level, setLevel] = useState('B1');
    const [fromLevel, setFromLevel] = useState('A1');
    const [toLevel, setToLevel] = useState('B2');
    const [history, setHistory] = useState(() => loadHistory())
    const [previewEntry, setPreviewEntry] = useState(null)

    const handleStart = () => {
        if (mode === 'random') onStart({ type: 'random' })
        else if (mode === 'specific') onStart({ type: 'specific', level })
        else if (mode === 'range') onStart({ type: 'range', fromLevel, toLevel })
    }
    const handleReplay = (entry) => {
        onStart({
            type: 'replay',
            words: entry.words,
            originalConfig: entry.config,
        })
    }
    const handleClearHistory = () => {
        clearHistory()
        setHistory([])
    }
    return (
        <div className='min-h-screen max-w-md mx-auto flex flex-col px-5 py-8'>
            {/* Hero */}
            <div className="text-center mb-8 animate-fade-up">
                <div className="text-6xl mb-3">📚</div>
                <h1 className="text-4xl font-black text-green-700 tracking-tight">VocabMatch</h1>
                <p className="text-gray-400 mt-1.5 font-semibold text-sm">Match words to their definitions</p>
            </div>

            {/* Mode cards */}
            <div className="space-y-2.5 mb-5">
                <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Choose Mode</p>
                {MODES.map((m, i) => (
                    <button
                        key={m.id}
                        onClick={() => setMode(m.id)}
                        style={{ animationDelay: `${i * 0.07}s` }}
                        className={`no-press w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 animate-fade-up
              ${mode === m.id
                                ? 'border-green-500 bg-white shadow-lg shadow-green-100'
                                : 'border-transparent bg-white/60 hover:bg-white hover:border-green-200'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="font-extrabold text-gray-800 text-sm">{m.title}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{m.desc}</div>
                            </div>
                            {mode === m.id && (
                                <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Level picker for "specific" */}
            {mode === 'specific' && (
                <div className="mb-5 animate-fade-up">
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Select Level</p>
                    <div className="grid grid-cols-3 gap-2">
                        {CEFR_LEVELS.map((l) => {
                            const meta = LEVEL_META[l]
                            const active = level === l
                            return (
                                <button
                                    key={l}
                                    onClick={() => setLevel(l)}
                                    style={active ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                                    className={`py-3 px-2 rounded-xl border-2 font-extrabold text-sm transition-all
                    ${active ? 'text-white shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}
                                >
                                    {l}
                                    <div className={`text-xs font-medium mt-0.5 ${active ? 'text-white/80' : 'text-gray-400'}`}>
                                        {meta.label.split('-')[0]}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Range picker */}
            {mode === 'range' && (
                <div className="mb-5 animate-fade-up">
                    <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Select Range</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[['From', fromLevel, setFromLevel], ['To', toLevel, setToLevel]].map(([label, selected, setter]) => (
                            <div key={label}>
                                <p className="text-xs font-bold text-gray-500 mb-2">{label}</p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {CEFR_LEVELS.map((l) => {
                                        const meta = LEVEL_META[l]
                                        const active = selected === l
                                        return (
                                            <button
                                                key={l}
                                                onClick={() => setter(l)}
                                                style={active ? { backgroundColor: meta.color, borderColor: meta.color } : {}}
                                                className={`py-2 rounded-lg border-2 font-extrabold text-xs transition-all
                          ${active ? 'text-white shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}
                                            >
                                                {l}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Start */}
            <div className="pt-4">
                <button
                    onClick={handleStart}
                    className="no-press w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-200 transition-all active:scale-[0.98]"
                >
                    Start Game
                </button>
            </div>

            {/* ── Round History ── */}
            {history.length > 0 && (
                <div className="mt-8 animate-fade-up">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                            🕐 Recent Rounds
                        </p>
                        <button
                            onClick={handleClearHistory}
                            className="text-xs text-gray-400 hover:text-red-400 font-semibold transition-colors"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="space-y-2">
                        {history.map((entry, i) => {
                            const maxScore = entry.words.length * 10
                            const pct = Math.round((entry.score / maxScore) * 100)
                            const stars = entry.wrongAttempts === 0 ? 3 : entry.wrongAttempts <= 3 ? 2 : 1

                            return (
                                <button
                                    key={entry.id}
                                    onClick={() => setPreviewEntry(entry)}
                                    style={{ animationDelay: `${i * 0.04}s` }}
                                    className="no-press w-full bg-white rounded-2xl px-4 py-3 border-2 border-transparent
                                               hover:border-green-200 shadow-sm text-left transition-all duration-150
                                               flex items-center gap-3 animate-fade-up"
                                >
                                    {/* Score ring */}
                                    <div className="shrink-0 w-11 h-11 rounded-full bg-green-50 border-2 border-green-200
                                                    flex flex-col items-center justify-center">
                                        <span className="font-black text-green-700 text-xs leading-none">{pct}%</span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-extrabold text-gray-800 text-sm">
                                                {configLabel(entry.config)}
                                            </span>
                                            <span className="text-yellow-400 text-xs tracking-tighter">
                                                {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs text-gray-400">
                                                {entry.words.length} words · {entry.wrongAttempts} miss{entry.wrongAttempts !== 1 ? 'es' : ''}
                                            </span>
                                            <span className="text-gray-300">·</span>
                                            <span className="text-xs text-gray-400">{formatRelativeTime(entry.playedAt)}</span>
                                        </div>
                                    </div>

                                    {/* Preview eye icon */}
                                    <div className="shrink-0 text-green-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                                        </svg>
                                    </div>

                                    {/* Replay arrow */}
                                    {/* <div className="shrink-0 text-green-400">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    </div> */}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="pb-8" />

            {/* Preview modal*/}
            {previewEntry && (
                <ReplayPreviewModal
                    entry={previewEntry}
                    onClose={() => setPreviewEntry(null)}
                    onPlay={() => {
                        setPreviewEntry(null)
                        handleReplay(previewEntry)
                    }}
                />
            )}
        </div>
    )
}