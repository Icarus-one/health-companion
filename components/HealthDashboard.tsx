
import React, { useState } from 'react';
import { DailyLog } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { generateWeeklyReport } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  logs: DailyLog[];
  lang: 'zh' | 'en';
  t: any;
}

const HealthDashboard: React.FC<Props> = ({ logs, lang, t }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const OFFSETS = { mood: 24, energy: 12, sleep: 0 };
  const LABELS = {
    sleep: lang === 'zh' ? '睡眠' : 'Sleep',
    energy: lang === 'zh' ? '精力' : 'Energy',
    mood: lang === 'zh' ? '情绪' : 'Mood'
  };

  // 按时间排序，确保连线逻辑正确
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartData = sortedLogs.slice(-15).map(log => {
    const d = new Date(log.date);
    const dateLabel = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:00`;
    return {
      date: dateLabel,
      fullTime: log.date,
      rawSleep: log.sleepQuality,
      rawEnergy: log.energyLevel,
      rawMood: log.moodStatus,
      [LABELS.sleep]: log.sleepQuality + OFFSETS.sleep,
      [LABELS.energy]: log.energyLevel + OFFSETS.energy,
      [LABELS.mood]: log.moodStatus + OFFSETS.mood,
    };
  });

  const handleGenerateReport = async () => {
    setLoading(true);
    const res = await generateWeeklyReport(logs);
    setReport(res);
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const d = new Date(data.fullTime);
      return (
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[160px]">
          <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest border-b border-slate-50 pb-1">
            {d.getMonth()+1}{lang === 'zh' ? '月' : '/'}{d.getDate()}{lang === 'zh' ? '日' : ''} {d.getHours()}:{String(d.getMinutes()).padStart(2, '0')}
          </p>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-indigo-500">🌙 {LABELS.sleep}</span>
              <span className="text-sm font-black text-slate-700">{data.rawSleep}/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-500">⚡ {LABELS.energy}</span>
              <span className="text-sm font-black text-slate-700">{data.rawEnergy}/10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-amber-500">😊 {LABELS.mood}</span>
              <span className="text-sm font-black text-slate-700">{data.rawMood}/10</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="text-6xl mb-6 grayscale opacity-50">📊</div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{t.noDataTitle}</h3>
        <p className="text-sm text-slate-400">{t.noDataDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="mr-2 text-indigo-500">📈</span> {t.chartTitle}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{t.chartSubtitle}</p>
          </div>
          <div className="flex space-x-3">
             <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-amber-400/60"></div>
                <span className="text-[9px] font-bold text-slate-400">{LABELS.mood}</span>
             </div>
             <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400/60"></div>
                <span className="text-[9px] font-bold text-slate-400">{LABELS.energy}</span>
             </div>
             <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400/60"></div>
                <span className="text-[9px] font-bold text-slate-400">{LABELS.sleep}</span>
             </div>
          </div>
        </div>
        
        <div className="h-80 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 600 }} 
                dy={15} 
                interval="preserveStartEnd"
              />
              <YAxis domain={[0, 36]} hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
              <ReferenceLine y={11.5} stroke="#f8fafc" strokeWidth={2} />
              <ReferenceLine y={23.5} stroke="#f8fafc" strokeWidth={2} />
              <Area type="monotone" dataKey={LABELS.mood} stroke="#f59e0b" strokeWidth={2} strokeOpacity={0.4} fillOpacity={1} fill="url(#colorMood)" dot={{ r: 2, fill: '#f59e0b' }} />
              <Area type="monotone" dataKey={LABELS.energy} stroke="#10b981" strokeWidth={2} strokeOpacity={0.4} fillOpacity={1} fill="url(#colorEnergy)" dot={{ r: 2, fill: '#10b981' }} />
              <Area type="monotone" dataKey={LABELS.sleep} stroke="#6366f1" strokeWidth={2} strokeOpacity={0.4} fillOpacity={1} fill="url(#colorSleep)" dot={{ r: 2, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-1 shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white rounded-[22px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black flex items-center mb-1">
                <span className="mr-2">💡</span> {t.insightTitle}
              </h3>
              <p className="text-[10px] text-indigo-100 font-medium uppercase tracking-widest">{t.insightSubtitle}</p>
            </div>
            {logs.length >= 3 && (
              <button 
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-white text-indigo-600 px-4 py-2 rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loading ? t.analyzing : t.genReportBtn}
              </button>
            )}
          </div>
          
          <div className="min-h-[100px] flex items-center">
            {report ? (
              <div className="prose-custom w-full">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {report}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm opacity-90 leading-relaxed italic">
                {logs.length < 3 ? t.lowDataDesc : t.readyDataDesc}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
