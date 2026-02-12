
import React, { useState } from 'react';
import { DailyLog, GastroStatus } from '../types';
import { GASTRO_OPTIONS } from '../constants';

interface Props {
  onSave: (log: Omit<DailyLog, 'id' | 'date'>) => void;
  lang: 'zh' | 'en';
  t: any;
}

const DailyLogForm: React.FC<Props> = ({ onSave, lang, t }) => {
  const [sleep, setSleep] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [mood, setMood] = useState(5);
  const [gastro, setGastro] = useState<GastroStatus>('comfortable');
  const [symptoms, setSymptoms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ sleepQuality: sleep, energyLevel: energy, moodStatus: mood, gastroStatus: gastro, symptoms });
    setSymptoms('');
  };

  const RatingRow = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="flex flex-col mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm text-indigo-600 font-bold">{value} / 10 {t.ratingScore}</span>
      </div>
      <input 
        type="range" min="1" max="10" value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>{t.ratingBad}</span>
        <span>{t.ratingAvg}</span>
        <span>{t.ratingGood}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="mr-2">🕒</span> {t.formTitle}
      </h3>
      <p className="text-[11px] text-slate-400 mb-5 leading-relaxed italic">
        {t.formDesc}
      </p>
      <form onSubmit={handleSubmit}>
        <RatingRow label={t.sleepLabel} value={sleep} onChange={setSleep} />
        <RatingRow label={t.energyLabel} value={energy} onChange={setEnergy} />
        <RatingRow label={t.moodLabel} value={mood} onChange={setMood} />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.gastroLabel}</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(GASTRO_OPTIONS[lang]) as GastroStatus[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setGastro(key)}
                className={`py-2 px-3 rounded-xl text-sm transition-all border ${
                  gastro === key 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-medium' 
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {GASTRO_OPTIONS[lang][key]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">{t.symptomsLabel}</label>
          <input 
            type="text"
            placeholder={t.symptomsPlaceholder}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          {t.submitBtn}
        </button>
      </form>
    </div>
  );
};

export default DailyLogForm;
