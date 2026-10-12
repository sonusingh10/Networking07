import React, { useState } from 'react';
import { 
  Globe, 
  Terminal, 
  ShieldAlert, 
  Route, 
  Minimize, 
  Lock, 
  SlidersHorizontal, 
  Server, 
  Copy, 
  Check, 
  PlayCircle,
  ChevronRight
} from 'lucide-react';
import { TroubleshootingStep } from '../types/network';
import { TROUBLESHOOTING_STEPS } from '../data/networkData';

interface TroubleshootingStepsProps {
  activeStepId: number;
  onSelectStep: (stepId: number) => void;
  onRunInTerminal: (step: TroubleshootingStep) => void;
}

const STEP_ICONS: Record<number, React.ReactNode> = {
  1: <Globe className="w-4 h-4 text-[#D2F27C]" />,
  2: <Terminal className="w-4 h-4 text-[#D2F27C]" />,
  3: <ShieldAlert className="w-4 h-4 text-[#EF8A78]" />,
  4: <Route className="w-4 h-4 text-[#D2F27C]" />,
  5: <Minimize className="w-4 h-4 text-[#EF8A78]" />,
  6: <Lock className="w-4 h-4 text-[#D2F27C]" />,
  7: <SlidersHorizontal className="w-4 h-4 text-[#98A5A2]" />,
  8: <Server className="w-4 h-4 text-[#D2F27C]" />
};

export const TroubleshootingSteps: React.FC<TroubleshootingStepsProps> = ({
  activeStepId,
  onSelectStep,
  onRunInTerminal
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const activeStep = TROUBLESHOOTING_STEPS.find(s => s.id === activeStepId) || TROUBLESHOOTING_STEPS[0];

  return (
    <div className="bg-[#101516] border border-[#283231] rounded-2xl overflow-hidden shadow-2xl">
      {/* Section Header */}
      <div className="bg-[#080B0C] px-6 py-4 border-b border-[#283231] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#151C1D] border border-[#283231] text-[#D2F27C]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#EEF2EF] tracking-tight">
              Systematic Troubleshooting Protocol
            </h2>
            <p className="text-xs text-[#98A5A2] font-mono">
              Diagnostic verification across layers 1 through 7
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-[#98A5A2] hidden sm:block">
          Select step to inspect diagnostic command
        </div>
      </div>

      {/* Grid of 8 Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-y-reverse divide-[#283231]">
        {/* Left Column: Interactive Step List */}
        <div className="p-4 space-y-2 max-h-[580px] overflow-y-auto">
          {TROUBLESHOOTING_STEPS.map((step) => {
            const isSelected = step.id === activeStepId;
            return (
              <div
                key={step.id}
                onClick={() => onSelectStep(step.id)}
                className={`group p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#151C1D] border-[#D2F27C] shadow-sm'
                    : 'bg-[#101516] border-[#283231] hover:bg-[#151C1D]/60 hover:border-[#98A5A2]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Step Number */}
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#D2F27C] text-[#080B0C]'
                      : 'bg-[#151C1D] text-[#98A5A2] border border-[#283231]'
                  }`}>
                    {step.id}
                  </div>

                  {/* Icon */}
                  <div className="p-1 rounded bg-[#080B0C] border border-[#283231] shrink-0">
                    {STEP_ICONS[step.id]}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-[#EEF2EF]' : 'text-[#EEF2EF]/90'}`}>
                        {step.title}
                      </h3>
                      <span className="text-[10px] font-mono text-[#98A5A2] shrink-0">
                        {step.layer.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#98A5A2] line-clamp-1 mt-0.5">
                      {step.description}
                    </p>

                    {/* Quick Command Snippet */}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <code className="text-[10px] font-mono text-[#D2F27C] bg-[#080B0C] px-2 py-0.5 rounded border border-[#283231] truncate">
                        {step.commands[0]?.command}
                      </code>
                      <ChevronRight className={`w-3.5 h-3.5 text-[#98A5A2] transition-transform ${isSelected ? 'rotate-90 text-[#D2F27C]' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Step Deep Dive */}
        <div className="p-6 bg-[#080B0C] flex flex-col justify-between">
          <div>
            {/* Step Badge & Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#151C1D] text-[#D2F27C] flex items-center justify-center text-xs font-mono font-bold border border-[#283231]">
                  {activeStep.id}
                </span>
                <span className="text-xs font-mono text-[#D2F27C] uppercase font-semibold">
                  {activeStep.layer}
                </span>
              </div>
              <button
                onClick={() => onRunInTerminal(activeStep)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#151C1D] border border-[#283231] hover:border-[#D2F27C] text-[#EEF2EF] hover:text-[#D2F27C] font-mono text-xs transition-colors"
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Simulate Command</span>
              </button>
            </div>

            <h3 className="text-base font-bold text-[#EEF2EF] mt-3">
              {activeStep.title}
            </h3>
            <p className="text-xs text-[#98A5A2] mt-1.5 leading-relaxed">
              {activeStep.explanation}
            </p>

            {/* What to look for */}
            <div className="mt-4 p-3 rounded-lg bg-[#151C1D] border border-[#283231] text-xs">
              <strong className="text-[#EEF2EF] font-semibold block mb-0.5 font-mono text-[11px]">
                Diagnostic Signature:
              </strong>
              <p className="text-[#98A5A2]">
                {activeStep.whatToLookFor}
              </p>
            </div>

            {/* Command Examples by OS */}
            <div className="mt-4">
              <div className="text-xs font-mono text-[#98A5A2] mb-2 flex items-center justify-between">
                <span>Verified Commands:</span>
                <span className="text-[10px]">Click to copy</span>
              </div>
              <div className="space-y-2">
                {activeStep.commands.map((cmd, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#101516] border border-[#283231] flex items-center justify-between gap-2 group hover:border-[#98A5A2]/30"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-mono text-[#98A5A2] block">
                        {cmd.os}
                      </span>
                      <code className="text-xs font-mono text-[#EEF2EF] truncate block mt-0.5">
                        {cmd.command}
                      </code>
                    </div>
                    <button
                      onClick={() => handleCopy(cmd.command, `${activeStep.id}-${idx}`)}
                      className="p-1.5 rounded text-[#98A5A2] hover:text-[#EEF2EF] bg-[#151C1D] hover:bg-[#283231] transition-colors shrink-0"
                      title="Copy command"
                    >
                      {copiedIndex === `${activeStep.id}-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-[#D2F27C]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Terminal Output Preview */}
          <div className="mt-5 pt-4 border-t border-[#283231]">
            <div className="flex items-center justify-between text-xs text-[#98A5A2] mb-1.5 font-mono">
              <span className="text-[10px]">Execution Sample:</span>
              <button
                onClick={() => onRunInTerminal(activeStep)}
                className="text-[#D2F27C] hover:text-white text-[11px] transition-colors"
              >
                Send to Terminal →
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#101516] border border-[#283231] font-mono text-[11px] text-[#98A5A2] overflow-x-auto max-h-32">
              {activeStep.simulatedOutput}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
