
import React, { useState } from 'react';
import { X, Briefcase, CheckSquare, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { CaseFile } from '../../types';
import { DEFAULT_CASE_FILE } from '../../constants';

export const CaseManagementModal: React.FC<{ 
    currentFile?: CaseFile; 
    onClose: () => void; 
    onSave: (file: CaseFile) => void; 
}> = ({ currentFile, onClose, onSave }) => {
  const [file, setFile] = useState<CaseFile>(currentFile || DEFAULT_CASE_FILE);
  const [activeSection, setActiveSection] = useState<string>('dignity');

  const updateSection = (section: keyof CaseFile, field: string, value: any) => {
    setFile(prev => ({
        ...prev,
        [section]: {
            ...prev[section as any],
            [field]: value
        }
    }));
  };

  const SectionHeader: React.FC<{ id: string; title: string; subtitle: string }> = ({ id, title, subtitle }) => (
      <button 
        onClick={() => setActiveSection(activeSection === id ? '' : id)}
        className={`w-full flex justify-between items-center p-4 rounded-xl border-2 transition-all mb-2 ${activeSection === id ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300'}`}
      >
          <div className="text-left">
              <h4 className="font-extrabold text-sm uppercase tracking-wide">{title}</h4>
              <p className={`text-xs ${activeSection === id ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p>
          </div>
          {activeSection === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
  );

  const CheckboxRow: React.FC<{ label: string; checked: boolean; onChange: (val: boolean) => void }> = ({ label, checked, onChange }) => (
      <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-100 transition-colors">
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
              {checked && <CheckSquare size={14} className="text-white" />}
          </div>
          <input type="checkbox" className="hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          <span className={`text-sm font-bold ${checked ? 'text-slate-800' : 'text-slate-500'}`}>{label}</span>
      </label>
  );

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/95 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
        
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Briefcase size={24} />
                </div>
                <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Case File (RORS)</h3>
                    <p className="text-xs text-slate-500 font-bold">From Stabilization to Self-Actualization</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            
            {/* 1. Dignity & Identity */}
            <SectionHeader id="dignity" title="I. Dignity, Identity & Essentials" subtitle="Artifacts of adulthood and basic needs." />
            {activeSection === 'dignity' && (
                <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4 animate-slide-in-bottom">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-3">Critical Personal Effects</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        <CheckboxRow label="Wallet / Purse" checked={file.dignity.wallet} onChange={(v) => updateSection('dignity', 'wallet', v)} />
                        <CheckboxRow label="State ID / Driver's License" checked={file.dignity.stateId} onChange={(v) => updateSection('dignity', 'stateId', v)} />
                        <CheckboxRow label="Social Security Card" checked={file.dignity.socialSecurityCard} onChange={(v) => updateSection('dignity', 'socialSecurityCard', v)} />
                        <CheckboxRow label="Birth Certificate" checked={file.dignity.birthCertificate} onChange={(v) => updateSection('dignity', 'birthCertificate', v)} />
                        <CheckboxRow label="Cell Phone" checked={file.dignity.cellPhone} onChange={(v) => updateSection('dignity', 'cellPhone', v)} />
                        <CheckboxRow label="Seasonal Clothing" checked={file.dignity.seasonalClothing} onChange={(v) => updateSection('dignity', 'seasonalClothing', v)} />
                        <CheckboxRow label="Hygiene Kit" checked={file.dignity.hygieneKit} onChange={(v) => updateSection('dignity', 'hygieneKit', v)} />
                    </div>
                    <div className="border-t border-slate-100 pt-3">
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Food Source</label>
                        <select 
                            value={file.dignity.foodSource} 
                            onChange={(e) => updateSection('dignity', 'foodSource', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                        >
                            <option value="None">None / Scavenging</option>
                            <option value="SNAP">SNAP (Food Stamps)</option>
                            <option value="Pantry">Food Pantry</option>
                            <option value="Family">Family Support</option>
                        </select>
                    </div>
                </div>
            )}

            {/* 2. Health */}
            <SectionHeader id="health" title="II. Health & Wellness" subtitle="Addressing the physical vessel." />
            {activeSection === 'health' && (
                <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4 animate-slide-in-bottom">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        <CheckboxRow label="Has Primary Care (PCP)" checked={file.health.hasPCP} onChange={(v) => updateSection('health', 'hasPCP', v)} />
                        <CheckboxRow label="Has Dentist" checked={file.health.hasDentist} onChange={(v) => updateSection('health', 'hasDentist', v)} />
                        <CheckboxRow label="Needs Glasses/Vision Care" checked={file.health.needsGlasses} onChange={(v) => updateSection('health', 'needsGlasses', v)} />
                        <CheckboxRow label="Medication Adherence" checked={file.health.medicationAdherence} onChange={(v) => updateSection('health', 'medicationAdherence', v)} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Insurance Provider</label>
                        <input 
                            type="text" 
                            value={file.health.insuranceProvider}
                            onChange={(e) => updateSection('health', 'insuranceProvider', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700 placeholder:text-slate-300"
                            placeholder="e.g. Medicaid, Blue Cross..."
                        />
                    </div>
                </div>
            )}

            {/* 3. Recovery Capital */}
            <SectionHeader id="recovery" title="III. Recovery Capital" subtitle="Moving from isolation to connection." />
            {activeSection === 'recovery' && (
                <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4 animate-slide-in-bottom">
                    <div className="mb-4">
                        <CheckboxRow label="Has Sponsor" checked={file.recovery.hasSponsor} onChange={(v) => updateSection('recovery', 'hasSponsor', v)} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Housing Status</label>
                            <select 
                                value={file.recovery.housingStatus} 
                                onChange={(e) => updateSection('recovery', 'housingStatus', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                            >
                                <option value="Homeless">Homeless</option>
                                <option value="Shelter">Shelter</option>
                                <option value="Sober Living">Sober Living</option>
                                <option value="Family">Family</option>
                                <option value="Independent">Independent</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Is Environment Safe?</label>
                            <select 
                                value={file.recovery.isEnvironmentSafe ? 'Yes' : 'No'} 
                                onChange={(e) => updateSection('recovery', 'isEnvironmentSafe', e.target.value === 'Yes')}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No (Active Users/Danger)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Home Group</label>
                        <input 
                            type="text" 
                            value={file.recovery.homeGroup}
                            onChange={(e) => updateSection('recovery', 'homeGroup', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                            placeholder="Name of home group..."
                        />
                    </div>
                </div>
            )}

            {/* 4. Legal */}
            <SectionHeader id="legal" title="IV. Legal & Financial" subtitle="Clearing wreckage of the past." />
            {activeSection === 'legal' && (
                <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4 animate-slide-in-bottom">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <CheckboxRow label="Has Active Warrants" checked={file.legal.hasWarrants} onChange={(v) => updateSection('legal', 'hasWarrants', v)} />
                         <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Driver's License</label>
                            <select 
                                value={file.legal.licenseStatus} 
                                onChange={(e) => updateSection('legal', 'licenseStatus', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                            >
                                <option value="None">None</option>
                                <option value="Valid">Valid</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Revoked">Revoked</option>
                            </select>
                        </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Probation Officer Name</label>
                        <input 
                            type="text" 
                            value={file.legal.probationOfficer}
                            onChange={(e) => updateSection('legal', 'probationOfficer', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                            placeholder="Optional..."
                        />
                    </div>
                </div>
            )}

             {/* 5. Purpose */}
            <SectionHeader id="purpose" title="V. Purpose & Self-Actualization" subtitle="Love and Work." />
            {activeSection === 'purpose' && (
                <div className="bg-white p-4 rounded-xl border-2 border-slate-100 mb-4 animate-slide-in-bottom">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                         <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Employment</label>
                            <select 
                                value={file.purpose.employmentStatus} 
                                onChange={(e) => updateSection('purpose', 'employmentStatus', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                            >
                                <option value="Unemployed">Unemployed</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Full-time">Full-time</option>
                                <option value="Disabled">Disabled</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Education</label>
                            <input 
                                type="text" 
                                value={file.purpose.educationLevel}
                                onChange={(e) => updateSection('purpose', 'educationLevel', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                                placeholder="e.g. GED, Degree..."
                            />
                        </div>
                     </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Primary Strength / Skill</label>
                        <input 
                            type="text" 
                            value={file.purpose.primaryStrength}
                            onChange={(e) => updateSection('purpose', 'primaryStrength', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-700"
                            placeholder="What are you good at?"
                        />
                    </div>
                </div>
            )}

        </div>

        <div className="p-5 border-t border-slate-100 bg-white">
            <button 
                onClick={() => onSave(file)}
                className="w-full bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            >
                <Save size={20} />
                <span>Update Case File</span>
            </button>
        </div>
      </div>
    </div>
  );
};
