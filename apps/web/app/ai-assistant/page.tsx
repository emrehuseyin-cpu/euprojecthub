"use client";

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { trackEvent, trackError } from '../lib/analytics';
import {
    Bot,
    Send,
    Trash2,
    MessageSquare,
    PenTool,
    AlertCircle,
    Loader2,
    Sparkles
} from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'project' | 'support'>('project');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load history on mount
    useEffect(() => {
        const saved = localStorage.getItem('euph_ai_chat_history');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse chat history");
            }
        } else {
            // Add welcome message
            setMessages([
                {
                    role: 'assistant',
                    content: 'Merhaba! Ben EUProjectHub AI Asistanınızım. AB proje yürütme, takip süreçlerinizde veya platform kullanımı konusunda yardımcı olabilirim. Nasıl destek olabilirim?'
                }
            ]);
        }
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Save history on change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('euph_ai_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    const clearHistory = () => {
        setMessages([
            {
                role: 'assistant',
                content: mode === 'project'
                    ? 'Proje yönetim ve takip sürecinize hoş geldiniz! Faaliyet raporları, bütçe yönetimi, ortaklıklar ve Webgate girişleri hakkında sorularınızı yanıtlayabilirim.'
                    : 'Platform destek modundasınız. EUProjectHub kullanımı ile ilgili sorularınızı sorabilirsiniz.'
            }
        ]);
        localStorage.removeItem('euph_ai_chat_history');
        setError(null);
        trackEvent('ai_chat_cleared', { mode });
    };

    const handleModeChange = (newMode: 'project' | 'support') => {
        setMode(newMode);
        trackEvent('ai_mode_changed', { new_mode: newMode, previous_mode: mode });
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: input.trim() };
        const newContext = [...messages, userMsg];

        setMessages(newContext);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newContext.filter(m => m.content), // Ensure valid items
                    mode: mode
                })
            });

            trackEvent('ai_message_sent', { mode });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API isteği başarısız oldu');
            }

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch (err: any) {
            trackError(err, { context: 'ai_chat' });
            console.error(err);
            setError('AI şu an yanıt veremiyor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            <Sidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />

                <main className="flex-1 overflow-hidden p-0 sm:p-6 lg:p-8 shrink-0 flex flex-col">
                    <div className="flex flex-col h-full w-full max-w-7xl mx-auto bg-white border border-gray-200 shadow-sm rounded-none sm:rounded-2xl overflow-hidden shrink-0">

                        {/* AI Assistant Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                                    <Bot className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                                        EUProjectHub AI <Sparkles className="w-4 h-4 text-indigo-500" />
                                    </h2>
                                    <p className="text-sm text-gray-500 hidden sm:block flex items-center gap-1">
                                        Akıllı proje yönetimi <span>•</span> <span className="text-indigo-600 font-medium">🌍 Responds in your language / Dilinizde yanıt verir</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex bg-gray-200/80 p-1 rounded-lg">
                                    <button
                                        onClick={() => handleModeChange('project')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'project'
                                            ? 'bg-white text-indigo-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <PenTool className="w-4 h-4" />
                                        <span className="hidden md:inline">Proje Takip Asistanı</span>
                                        <span className="md:hidden">Takip</span>
                                    </button>
                                    <button
                                        onClick={() => handleModeChange('support')}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'support'
                                            ? 'bg-white text-emerald-700 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="hidden md:inline">Platform Destek</span>
                                        <span className="md:hidden">Destek</span>
                                    </button>
                                </div>
                                <button
                                    onClick={clearHistory}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                    title="Geçmişi Temizle"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 sm:pb-6 space-y-6 scroll-smooth bg-white">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                                        }`}>
                                        {msg.role === 'user' ? <span className="text-xs font-bold">SN</span> : <Bot className="w-5 h-5" />}
                                    </div>

                                    <div className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-sm border border-gray-200'
                                        }`}>
                                        <div
                                            className="whitespace-pre-wrap text-[15px] leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }}
                                        />
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-end gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                                        <Bot className="w-5 h-5" />
                                    </div>
                                    <div className="px-5 py-3.5 bg-gray-100 rounded-2xl rounded-bl-sm border border-gray-200 flex items-center">
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                        <span className="ml-2 text-sm text-gray-500 font-medium tracking-widest animate-pulse">Yazıyor...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200 shrink-0">

                            {error && (
                                <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    <span className="line-clamp-1">{error}</span>
                                </div>
                            )}

                            <div className="flex items-end gap-3 max-w-5xl mx-auto">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type in any language... / Herhangi bir dilde yazın..."
                                        className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-[15px]"
                                        disabled={isLoading}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 hidden sm:block">
                                        Enter ↵
                                    </div>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="p-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm shrink-0"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-3 hidden sm:block">
                                AI modelleri hatalı bilgiler üretebilir. Önemli bilgileri her zaman bağımsız kaynaklardan teyit edin.
                            </p>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
