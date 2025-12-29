import React, { useState } from 'react';
import { 
  Activity, Scale, Heart, Droplet, PlusCircle, History, 
  TrendingUp, TrendingDown, Minus, Save, X 
} from 'lucide-react';
import { BiometricRecord } from '../../../types';
import { MOCK_BIOMETRICS_HISTORY } from '../../../constants';

// Helper for BMI Calc
const calculateBMI = (weightLbs: number, heightFt: number, heightIn: number) => {
  const totalInches = (heightFt * 12) + heightIn;
  if (totalInches === 0) return 0;
  return ((weightLbs / (totalInches * totalInches)) * 703).toFixed(1);
};

const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500 bg-blue-50' };
  if (bmi < 25) return { label: 'Healthy Weight', color: 'text-emerald-500 bg-emerald-50' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500 bg-amber-50' };
  return { label: 'Obese', color: 'text-rose-500 bg-rose-50' };
};

const getA1CStatus = (a1c: number) => {
  if (a1c < 5.7) return { label: 'Normal', color: 'text-emerald-500' };
  if (a1c < 6.5) return { label: 'Prediabetes', color: 'text-amber-500' };
  return { label: 'Diabetes', color: 'text-rose-500' };
};

export const HealthMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<BiometricRecord[]>(MOCK_BIOMETRICS_HISTORY);
  const [showLogModal, setShowLogModal] = useState(false);
  
  // Latest Data
  const latest: BiometricRecord = metrics[0] || {
      id: 'default',
      date: new Date().toISOString(),
      heightFt: 5,
      heightIn: 9,
      weightLbs: 0
  };

  // Form State
  const [form, setForm] = useState<Partial<BiometricRecord>>({
    heightFt: latest.heightFt,
    heightIn: latest.heightIn,
    weightLbs: latest.weightLbs,
  });

  const bmi = Number(calculateBMI(latest.weightLbs, latest.heightFt, latest.heightIn));
  const bmiCat = getBMICategory(bmi);

  const handleSave = () => {
    const newRecord: BiometricRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      heightFt: form.heightFt || latest.heightFt,
      heightIn: form.heightIn || latest.heightIn,
      weightLbs: form.weightLbs || latest.weightLbs,
      systolicBP: form.systolicBP,
      diastolicBP: form.diastolicBP,
      a1c: form.a1c,
      cholesterol: form.cholesterol,
      restingHeartRate: form.restingHeartRate
    };

    setMetrics(prev => [newRecord, ...prev]);
    setShowLogModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Health Passport</h2>
          <p className="text-slate-500 text-sm font-bold">Track your biometrics & physical recovery.</p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md active:scale-95 transition-all"
        >
          <PlusCircle size={16} className="mr-2" />
          Log Vitals
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* BMI Card */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center space-x-2 text-indigo-500">
               <Scale size={20} />
               <span className="font-extrabold text-sm uppercase tracking-wide">Body Mass Index</span>
             </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold text-slate-800">{bmi}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase ${bmiCat.color}`}>{bmiCat.label}</span>
          </div>
          <div className="mt-4 text-xs text-slate-400 font-medium">
             Weight: <span className="text-slate-600 font-bold">{latest.weightLbs} lbs</span>
             <span className="mx-2">•</span>
             Height: <span className="text-slate-600 font-bold">{latest.heightFt}'{latest.heightIn}"</span>
          </div>
        </div>

        {/* Heart Health */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center space-x-2 text-rose-500">
               <Heart size={20} />
               <span className="font-extrabold text-sm uppercase tracking-wide">Cardio</span>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Blood Pressure</p>
              <p className="text-xl font-extrabold text-slate-800">
                {latest.systolicBP || '--'}/{latest.diastolicBP || '--'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Resting HR</p>
              <p className="text-xl font-extrabold text-slate-800">
                {latest.restingHeartRate || '--'} <span className="text-xs text-slate-400">bpm</span>
              </p>
            </div>
          </div>
        </div>

        {/* Blood Work */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <div className="flex items-center space-x-2 text-emerald-500">
               <Droplet size={20} />
               <span className="font-extrabold text-sm uppercase tracking-wide">Metabolic</span>
             </div>
          </div>
          <div className="space-y-3">
             <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-slate-500">A1C Level</span>
               <div className="text-right">
                 <span className="block font-extrabold text-slate-800">{latest.a1c || '--'}%</span>
                 {latest.a1c && <span className={`text-[9px] font-bold uppercase ${getA1CStatus(latest.a1c).color}`}>{getA1CStatus(latest.a1c).label}</span>}
               </div>
             </div>
             <div className="w-full h-px bg-slate-100"></div>
             <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-slate-500">Cholesterol</span>
               <span className="font-extrabold text-slate-800">{latest.cholesterol || '--'} <span className="text-[10px] text-slate-400 font-normal">mg/dL</span></span>
             </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center space-x-2">
            <History size={16} className="text-slate-400" />
            <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wide">Measurement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Weight</th>
                <th className="px-6 py-3">BMI</th>
                <th className="px-6 py-3">BP</th>
                <th className="px-6 py-3">A1C</th>
                <th className="px-6 py-3">Cholesterol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-600">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-800">{m.date}</td>
                  <td className="px-6 py-4">{m.weightLbs} lbs</td>
                  <td className="px-6 py-4">{calculateBMI(m.weightLbs, m.heightFt, m.heightIn)}</td>
                  <td className="px-6 py-4">{m.systolicBP ? `${m.systolicBP}/${m.diastolicBP}` : '--'}</td>
                  <td className="px-6 py-4">{m.a1c ? `${m.a1c}%` : '--'}</td>
                  <td className="px-6 py-4">{m.cholesterol || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-[80] bg-slate-900/90 flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
              <button onClick={() => setShowLogModal(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-400 hover:bg-slate-200"><X size={20} /></button>
              <h3 className="text-xl font-extrabold text-slate-800 mb-6">Log New Vitals</h3>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Weight (lbs)</label>
                        <input type="number" value={form.weightLbs} onChange={e => setForm({...form, weightLbs: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800" />
                    </div>
                    <div>
                         <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Height</label>
                         <div className="flex space-x-2">
                            <input type="number" placeholder="Ft" value={form.heightFt} onChange={e => setForm({...form, heightFt: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800" />
                            <input type="number" placeholder="In" value={form.heightIn} onChange={e => setForm({...form, heightIn: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800" />
                         </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">BP (Systolic)</label>
                        <input type="number" placeholder="120" value={form.systolicBP || ''} onChange={e => setForm({...form, systolicBP: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">BP (Diastolic)</label>
                        <input type="number" placeholder="80" value={form.diastolicBP || ''} onChange={e => setForm({...form, diastolicBP: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">A1C (%)</label>
                        <input type="number" step="0.1" placeholder="5.7" value={form.a1c || ''} onChange={e => setForm({...form, a1c: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Cholesterol</label>
                        <input type="number" placeholder="mg/dL" value={form.cholesterol || ''} onChange={e => setForm({...form, cholesterol: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800" />
                    </div>
                 </div>
              </div>

              <button onClick={handleSave} className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center">
                  <Save size={20} className="mr-2" />
                  Save Record
              </button>
           </div>
        </div>
      )}
    </div>
  );
};