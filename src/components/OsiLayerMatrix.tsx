import React, { useState } from 'react';
import { Layers, CheckCircle2, XCircle, Info, ChevronRight } from 'lucide-react';
import { OSI_LAYERS } from '../data/networkData';
import { OsiLayerInfo } from '../types/network';

export const OsiLayerMatrix: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<OsiLayerInfo>(OSI_LAYERS[0]); // Layer 7 default

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-cyan-400">
              7LayerX Deep Dive
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">The 7-Layer OSI Model Breakdown</span>
          </div>
          <h2 className="text-lg font-extrabold text-white mt-1">
            Why Ping Stops at Layer 3
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Understanding the architectural disconnect between Network reachability and Application health.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Ping Operates Here (L1-L3)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>App Operates Here (L4-L7)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: The 7 Stacked Layers */}
        <div className="lg:col-span-7 space-y-2">
          {OSI_LAYERS.map((layer) => {
            const isSelected = selectedLayer.number === layer.number;
            const isPingLayer = layer.pingInvolved;
            const isAppOnlyLayer = layer.appInvolved && !layer.pingInvolved;

            return (
              <div
                key={layer.number}
                onClick={() => setSelectedLayer(layer)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Layer Number badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                    layer.number === 3
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400/50'
                      : layer.number >= 4
                      ? 'bg-slate-800 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    L{layer.number}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {layer.name} Layer
                      </span>
                      {layer.number === 3 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Ping Endpoint
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 truncate block">
                      Protocols: {layer.protocols}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Indicators */}
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className={`px-2 py-0.5 rounded ${isPingLayer ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-600'}`}>
                      ICMP: {isPingLayer ? 'YES' : 'NO'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${isAppOnlyLayer || layer.appInvolved ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-600'}`}>
                      APP: {layer.appInvolved ? 'YES' : 'NO'}
                    </span>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Layer Deep Dive Card */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                Layer {selectedLayer.number} · {selectedLayer.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                PDU: {selectedLayer.unit}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-2">
              Protocols & Standards
            </h3>
            <p className="text-xs font-mono text-emerald-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 mt-1">
              {selectedLayer.protocols}
            </p>

            <h4 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider mt-4">
              Diagnostic Reality
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
              {selectedLayer.roleInIssue}
            </p>

            <div className="mt-4 p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Tested by standard Ping?</span>
                <span className={`font-mono font-bold ${selectedLayer.pingInvolved ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedLayer.pingInvolved ? '✓ Yes (Layer 1-3)' : '✗ No (Blind to Ping)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Required by Application?</span>
                <span className="font-mono font-bold text-cyan-400">
                  ✓ Required
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 italic">
            "7LayerX Principle: When Layer 3 is green, focus your probers exclusively on Layers 4 through 7."
          </div>
        </div>
      </div>
    </div>
  );
};
