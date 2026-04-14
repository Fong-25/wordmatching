import { useState } from 'react';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

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

export default function SetupScreen({ onStart }) {
    const [mode, setMode] = useState('random');
    const [level, setLevel] = useState('B1');
    const [fromLevel, setFromLevel] = useState('A1');
    const [toLevel, setToLevel] = useState('B2');

    const handleStart = () => {
        if (mode === 'random') onStart({ type: 'random' })
        else if (mode === 'specific') onStart({ type: 'specific', level })
        else if (mode === 'range') onStart({ type: 'range', fromLevel, toLevel })
    }
    return (
        <div className='min-h-screen maw-w-md mx-auto flex flex-col px-5 py-8'>
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
            <div className="mt-auto pt-4">
                <button
                    onClick={handleStart}
                    className="no-press w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-200 transition-all active:scale-[0.98]"
                >
                    Start Game
                </button>
            </div>
        </div>
    )
}