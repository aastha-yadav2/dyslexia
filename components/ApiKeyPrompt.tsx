
import React from 'react';

export const ApiKeyPrompt: React.FC<{ onSelectKey: () => void; message: string }> = ({ onSelectKey, message }) => (
    <div className="absolute inset-0 bg-slate-900/95 z-10 flex flex-col items-center justify-center text-center p-8 rounded-xl">
        <h3 className="text-xl font-bold text-white mb-2">API Key Required</h3>
        <p className="text-gray-300 mb-6 max-w-sm">{message}</p>
        <button
            onClick={onSelectKey}
            className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
            Select API Key
        </button>
        <p className="text-xs text-gray-400 mt-4">
            AI features require a Google AI Studio API key. For more information on billing, visit{' '}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-500">
                ai.google.dev
            </a>.
        </p>
    </div>
);