
import React, { useState, useEffect } from 'react';
import { DailyLog, ChatMessage, HealthState, AppRoute, User } from './types';
import { loadState, saveState, clearAllData } from './services/storage';
import { UI_TRANSLATIONS } from './constants';
import DailyLogForm from './components/DailyLogForm';
import ChatInterface from './components/ChatInterface';
import HealthDashboard from './components/HealthDashboard';

const App: React.FC = () => {
  const [state, setState] = useState<HealthState>(loadState());
  const [route, setRoute] = useState<AppRoute>(state.user ? 'app' : 'landing');
  const [appView, setAppView] = useState<'record' | 'dashboard' | 'chat'>('record');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const lang = state.language || 'zh';
  const t = UI_TRANSLATIONS[lang];

  const handleLogin = () => {
    if (otp === '123456') {
      const user: User = { email, token: 'fake-jwt-token' };
      setState(prev => ({ ...prev, user }));
      setRoute('app');
    } else {
      alert(lang === 'zh' ? "验证码错误 (123456)" : "Incorrect code (123456)");
    }
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null }));
    setRoute('landing');
  };

  const handleDeleteData = () => {
    if (confirm(lang === 'zh' ? "确定要删除所有本地记录吗？此操作不可逆。" : "Are you sure you want to delete all local records? This cannot be undone.")) {
      clearAllData();
      window.location.reload();
    }
  };

  const toggleLang = () => {
    setState(prev => ({ ...prev, language: prev.language === 'zh' ? 'en' : 'zh' }));
  };

  const handleSaveLog = (logData: Omit<DailyLog, 'id' | 'date'>) => {
    const newLog: DailyLog = {
      ...logData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, newLog]
    }));
    setAppView('dashboard');
  };

  const handleNewMessage = (msg: ChatMessage) => {
    setState(prev => ({
      ...prev,
      chatHistory: [...prev.chatHistory, msg]
    }));
  };

  // --- RENDERING LOGIC ---

  if (route === 'landing') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <button onClick={toggleLang} className="absolute top-6 right-6 text-xs font-bold text-slate-400 border border-slate-100 px-3 py-1 rounded-full">{t.lang}</button>
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-indigo-200 mb-8 animate-bounce">🩺</div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">{t.tagline}</h1>
        <p className="text-slate-500 max-w-sm leading-relaxed mb-10">{t.desc}</p>
        <div className="space-y-4 w-full max-w-xs">
          <button onClick={() => setRoute('auth')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">{t.start}</button>
          <p className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">{t.privacy}</p>
        </div>
      </div>
    );
  }

  if (route === 'auth') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50">
          <h2 className="text-2xl font-black text-slate-800 mb-6">{t.login}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{t.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="name@example.com" />
            </div>
            {otpSent && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">{t.otp}</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="123456" />
                <p className="text-[10px] text-indigo-500 mt-2 font-bold">{t.otpMsg}</p>
              </div>
            )}
            {!otpSent ? (
              <button onClick={() => setOtpSent(true)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">{t.sendOtp}</button>
            ) : (
              <button onClick={handleLogin} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">{t.confirm}</button>
            )}
            <button onClick={() => setRoute('landing')} className="w-full text-slate-400 text-xs font-bold py-2 mt-2">{t.back}</button>
          </div>
        </div>
      </div>
    );
  }

  if (route === 'settings') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <header className="bg-white px-6 py-4 border-b border-slate-100 flex items-center">
          <button onClick={() => setRoute('app')} className="text-xl mr-4">←</button>
          <h1 className="text-lg font-black text-slate-800">{t.settings}</h1>
        </header>
        <main className="p-6 space-y-4">
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
            <button onClick={toggleLang} className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-50 border-b border-slate-50">
              <span className="text-sm font-bold text-slate-700">切换语言 / Language</span>
              <span className="text-indigo-600 font-black">{lang === 'zh' ? '中文' : 'EN'}</span>
            </button>
            <button onClick={handleLogout} className="w-full px-6 py-4 flex justify-between items-center hover:bg-slate-50 border-b border-slate-50">
              <span className="text-sm font-bold text-slate-700">{t.logout}</span>
              <span className="text-slate-400">→</span>
            </button>
            <button onClick={handleDeleteData} className="w-full px-6 py-4 flex justify-between items-center hover:bg-red-50 text-red-600">
              <span className="text-sm font-bold">{t.deleteData}</span>
              <span className="text-red-400">🗑️</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- MAIN APP VIEW ---
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-black text-indigo-950 tracking-tight">PHC <span className="text-indigo-600">V1</span></h1>
          <button onClick={() => setRoute('settings')} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-lg shadow-sm border border-slate-100">⚙️</button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 mb-20">
        {appView === 'record' && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-2">
              <p className="text-xs text-indigo-700 leading-relaxed font-medium">{t.welcome}</p>
            </div>
            <DailyLogForm onSave={handleSaveLog} lang={lang} t={t} />
          </div>
        )}
        {appView === 'dashboard' && <HealthDashboard logs={state.logs} lang={lang} t={t} />}
        {appView === 'chat' && (
          <ChatInterface logs={state.logs} chatHistory={state.chatHistory} onNewMessage={handleNewMessage} lang={lang} t={t} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 pb-6 pt-2 z-40">
        <div className="max-w-2xl mx-auto flex justify-around items-center">
          <button onClick={() => setAppView('record')} className={`flex flex-col items-center flex-1 py-2 ${appView === 'record' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="text-xl mb-1">📝</span>
            <span className="text-[10px] font-bold uppercase">{t.navRecord}</span>
          </button>
          <button onClick={() => setAppView('dashboard')} className={`flex flex-col items-center flex-1 py-2 ${appView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="text-xl mb-1">📊</span>
            <span className="text-[10px] font-bold uppercase">{t.navChart}</span>
          </button>
          <button onClick={() => setAppView('chat')} className={`flex flex-col items-center flex-1 py-2 ${appView === 'chat' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="text-xl mb-1">💬</span>
            <span className="text-[10px] font-bold uppercase">{t.navAI}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
