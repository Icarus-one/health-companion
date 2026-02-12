
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DailyLog } from '../types';
import { getAIResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  logs: DailyLog[];
  chatHistory: ChatMessage[];
  onNewMessage: (msg: ChatMessage) => void;
  lang: 'zh' | 'en';
  t: any;
}

const ChatInterface: React.FC<Props> = ({ logs, chatHistory, onNewMessage, lang, t }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    onNewMessage(userMsg);
    setInput('');
    setIsLoading(true);

    const result = await getAIResponse(input, logs, chatHistory);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: result.text,
      isRedFlag: result.text.includes('🚨'),
    };
    onNewMessage(aiMsg);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center mr-3 text-white shadow-lg shadow-indigo-100">
            <span className="text-xl">🩺</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">{t.chatTitle}</h3>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">{t.chatSubtitle}</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#fdfdfd]">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-6">
            <div className="p-5 bg-white rounded-3xl shadow-sm border border-slate-100 text-2xl">🌱</div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-1">{t.chatEmptyTitle}</p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto">
                {t.chatEmptyDesc}
              </p>
            </div>
          </div>
        )}
        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[95%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100 font-medium' 
                : msg.isRedFlag 
                  ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none font-bold'
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
            }`}>
              <div className={msg.role === 'assistant' ? 'prose-chat max-w-none' : ''}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
              {msg.role === 'assistant' && !msg.isRedFlag && (
                <div className="mt-3 pt-2 border-t border-slate-50 flex flex-wrap gap-2">
                   <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter bg-indigo-50 px-1.5 py-0.5 rounded">Evidence-based</span>
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter bg-emerald-50 px-1.5 py-0.5 rounded">TCM Integrated</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none border border-slate-50 flex space-x-1.5 items-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <span className="text-[10px] text-slate-300 font-bold ml-2">{t.chatThinking}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-50">
        <div className="flex space-x-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.chatPlaceholder}
            className="flex-1 px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-indigo-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
          >
            <span className="text-xl">🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
