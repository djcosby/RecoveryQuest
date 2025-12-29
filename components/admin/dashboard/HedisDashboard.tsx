import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Calendar, Filter, 
  AlertCircle, CheckCircle, Clock, Users, DollarSign,
  Activity, ArrowRight, LayoutDashboard, List,
  CalendarDays, Phone, CheckSquare
} from 'lucide-react';
import { MOCK_HEDIS_MEASURES, MOCK_HEDIS_GAPS } from '../../../constants';

export const HedisDashboard: React.FC = () => {
  const [view, setView] = useState<'strategic' | 'operational'>('strategic');
  const [filterPayer, setFilterPayer] = useState('All');
  const [filterFacility, setFilterFacility] = useState('All');
  const [filterRisk, setFilterRisk] = useState<'All' | 'High'>('All');
  const [sortOrder, setSortOrder] = useState<'urgency' | 'name'>('urgency');
  
  // -- Strategic Helpers --
  const overallScore = Math.round(
    MOCK_HEDIS_MEASURES.reduce((acc, m) => acc + m.currentRate, 0) / MOCK_HEDIS_MEASURES.length
  );
  
  const totalRevenueAtRisk = MOCK_HEDIS_MEASURES.reduce((acc, m) => acc + m.financialImpact, 0);
  const totalGaps = MOCK_HEDIS_MEASURES.reduce((acc, m) => acc + m.gapCount, 0);

  // -- Operational Helpers --
  const getDaysRemaining = (isoDate: string) => {
    const diff = new Date(isoDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getUrgencyColor = (days: number) => {
    if (days < 3) return 'bg-rose-500'; // Critical Red
    if (days < 14) return 'bg-yellow-400'; // At Risk Yellow
    return 'bg-emerald-500'; // On Track Green
  };

  const getUrgencyLabel = (days: number) => {
    if (days < 3) return { text: 'CRITICAL', color: 'text-rose-600 bg-rose-50' };
    if (days < 14) return { text: 'AT RISK', color: 'text-amber-600 bg-amber-50' };
    return { text: 'ON TRACK', color: 'text-emerald-600 bg-emerald-50' };
  };

  // Filter Gaps for Operational View
  const filteredGaps = MOCK_HEDIS_GAPS.filter(gap => {
    if (filterRisk === 'High') {
      const days = getDaysRemaining(gap.dueDate);
      return days < 14;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === 'urgency') {
      return getDaysRemaining(a.dueDate) - getDaysRemaining(b.dueDate);
    }
    return a.patientName.localeCompare(b.patientName);
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Quality Dashboard</h2>
          <p className="text-slate-500 text-sm font-bold">HEDIS Compliance & Gaps in Care</p>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-xl">
          <button 
            onClick={() => setView('strategic')}
            className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'strategic' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutDashboard size={14} className="mr-2" />
            Strategic View
          </button>
          <button 
            onClick={() => setView('operational')}
            className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'operational' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List size={14} className="mr-2" />
            Operational View
          </button>
        </div>
      </div>

      {/* Global Filters */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-slate-400 font-bold text-xs uppercase tracking-wide mr-2">
          <Filter size={14} className="mr-1" /> Filters:
        </div>
        
        <select 
          value={filterFacility} 
          onChange={(e) => setFilterFacility(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="All">All Facilities</option>
          <option value="North">North Clinic</option>
          <option value="South">South Center</option>
        </select>

        <select 
          value={filterPayer} 
          onChange={(e) => setFilterPayer(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="All">All Payers</option>
          <option value="Medicaid">Medicaid</option>
          <option value="Commercial">Commercial</option>
          <option value="Medicare">Medicare</option>
        </select>

        {view === 'operational' && (
             <>
                <select 
                    value={filterRisk} 
                    onChange={(e) => setFilterRisk(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="All">All Risks</option>
                    <option value="High">High Risk Only</option>
                </select>
                <select 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                    <option value="urgency">Sort by Urgency</option>
                    <option value="name">Sort by Name</option>
                </select>
             </>
        )}

        <div className="ml-auto flex items-center bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold">
          <Calendar size={14} className="mr-2" />
          Rolling 12 Months
        </div>
      </div>

      {view === 'strategic' ? (
        <div className="space-y-6 animate-slide-in-right">
          {/* Vital Signs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Overall Score</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-slate-800">{overallScore}%</span>
                <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md mb-1">
                  <TrendingUp size={12} className="mr-1" /> +2.4%
                </span>
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Projected Rating</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-indigo-600">4.0 ★</span>
                <span className="text-xs font-bold text-slate-500 mb-1">75th %ile</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Open Gaps</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-slate-800">{totalGaps}</span>
                <span className="flex items-center text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md mb-1">
                  Needs Action
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Revenue at Risk</p>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-extrabold text-slate-800">${(totalRevenueAtRisk / 1000).toFixed(1)}k</span>
                <span className="text-xs font-bold text-slate-400 mb-1">Potential</span>
              </div>
            </div>
          </div>

          {/* Core Grid */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wide">Performance by Measure</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3">Measure Name</th>
                    <th className="px-6 py-3">Domain</th>
                    <th className="px-6 py-3">Current Rate</th>
                    <th className="px-6 py-3">Goal</th>
                    <th className="px-6 py-3">Gap to Goal</th>
                    <th className="px-6 py-3">Trend (3mo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-600">
                  {MOCK_HEDIS_MEASURES.map((m) => {
                    const gap = m.currentRate - m.goalRate;
                    const gapColor = gap >= 0 ? 'text-emerald-500' : gap >= -5 ? 'text-amber-500' : 'text-rose-500';
                    return (
                      <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-extrabold text-slate-800">{m.name}</td>
                        <td className="px-6 py-4 text-slate-500">{m.domain}</td>
                        <td className="px-6 py-4 text-sm">{m.currentRate}%</td>
                        <td className="px-6 py-4 text-slate-400">{m.goalRate}%</td>
                        <td className={`px-6 py-4 ${gapColor}`}>{gap > 0 ? '+' : ''}{gap}%</td>
                        <td className="px-6 py-4">
                          {m.trend === 'up' && <TrendingUp size={16} className="text-emerald-500" />}
                          {m.trend === 'down' && <TrendingDown size={16} className="text-rose-500" />}
                          {m.trend === 'flat' && <Minus size={16} className="text-slate-400" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-in-right">
          
          {/* Action Required Worklist */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
                 <h3 className="font-extrabold text-slate-700 text-sm uppercase tracking-wide">Action Required Worklist</h3>
              </div>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{filteredGaps.length} Items</span>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-3 w-10 text-center">Urgency</th>
                      <th className="px-6 py-3">Patient Name (ID)</th>
                      <th className="px-6 py-3">Measure</th>
                      <th className="px-6 py-3">Trigger Event</th>
                      <th className="px-6 py-3">Deadline (Due)</th>
                      <th className="px-6 py-3">Days Left</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-bold text-slate-600">
                    {filteredGaps.map((gap) => {
                      const daysLeft = getDaysRemaining(gap.dueDate);
                      const urgency = getUrgencyLabel(daysLeft);
                      const isOverdue = daysLeft < 0;
                      
                      return (
                        <tr key={gap.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 text-center">
                              <div className={`w-3 h-3 rounded-full mx-auto ${getUrgencyColor(daysLeft)}`}></div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="font-extrabold text-slate-800">{gap.patientName}</div>
                              <div className="text-[10px] text-slate-400">ID: {gap.patientId}</div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="block text-slate-800">{gap.measureName.split('-')[0]}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{gap.measureName.split('-')[1]}</span>
                           </td>
                           <td className="px-6 py-4 text-slate-500">
                              {gap.triggerEvent}
                           </td>
                           <td className="px-6 py-4">
                              <span className={isOverdue ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
                                {new Date(gap.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                               <span className={`${urgency.color} px-2 py-0.5 rounded text-[10px]`}>
                                 {isOverdue ? `${Math.abs(daysLeft)} Days Overdue` : `${daysLeft} Days`}
                               </span>
                           </td>
                           <td className="px-6 py-4 text-slate-500">
                              {gap.status}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <button 
                                    onClick={() => window.alert(`Calling patient ${gap.patientName}...`)}
                                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                                    title="Call Patient"
                                >
                                    <Phone size={14} />
                                </button>
                                <button 
                                    onClick={() => window.alert(`Booking appointment for ${gap.patientName}`)}
                                    className="flex items-center space-x-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors"
                                >
                                    <CalendarDays size={12} />
                                    <span>Book Appt</span>
                                </button>
                              </div>
                           </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};