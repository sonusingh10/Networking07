import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  Radio, 
  Eye, 
  EyeOff, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { OSI_LAYERS } from '../data/networkData';
import editorialPlateImage from '../assets/images/seven_layer_editorial_plates_1791796451441.jpg';

interface EditorialLayerVisualizerProps {
  onSelectLayer?: (layerNum: number) => void;
  activeScenarioName?: string;
}

export const EditorialLayerVisualizer: React.FC<EditorialLayerVisualizerProps> = ({
  onSelectLayer,
  activeScenarioName = 'Firewall Policy Block'
}) => {
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(6); // Default Layer 7 (index 6, or number 7)
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'schematic' | 'artwork'>('schematic');
  const [activeSignalPath, setActiveSignalPath] = useState<'ping' | 'application' | 'both'>('both');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Auto-trace signal through layers slowly if not in reduced motion
  const [signalPosition, setSignalPosition] = useState<number>(2); // 0 to 6 (L1 to L7)

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setSignalPosition((prev) => (prev >= 6 ? 0 : prev + 1));
    }, 2800); // Slow, dignified 2.8s layer step
    return () => clearInterval(interval);
  }, [reducedMotion]);

  const activeLayer = OSI_LAYERS.find(l => l.number === (selectedLayerIndex + 1)) || OSI_LAYERS[0];

  return (
    <div className={`relative bg-[#101516] border border-[#283231] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
      isExpanded ? 'fixed inset-4 z-50 overflow-y-auto' : ''
    }`}>
      {/* Top Technical Header */}
      <div className="bg-[#080B0C] border-b border-[#283231] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-medium tracking-widest text-[#D2F27C] uppercase">
              7LayerX · Architecture
            </span>
            <span className="text-[#283231]">/</span>
            <span className="text-[11px] font-mono text-[#98A5A2]">
              L1–L7 Stack Visualizer
            </span>
            <span className="text-[#283231]">/</span>
            <span className="text-[11px] font-mono text-[#98A5A2] hidden sm:inline">
              ISO/IEC 7498-1
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EEF2EF] mt-1 flex items-center gap-2">
            <span>Trace the Signal.</span>
            <span className="text-[#98A5A2]">Understand the System.</span>
          </h2>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#151C1D] border border-[#283231] rounded-lg text-xs font-mono">
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'schematic' 
                  ? 'bg-[#101516] text-[#D2F27C] border border-[#283231]' 
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              Layer Plates
            </button>
            <button
              onClick={() => setViewMode('artwork')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewMode === 'artwork' 
                  ? 'bg-[#101516] text-[#D2F27C] border border-[#283231]' 
                  : 'text-[#98A5A2] hover:text-[#EEF2EF]'
              }`}
            >
              Editorial Render
            </button>
          </div>

          {/* Reduced Motion Toggle Button */}
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              reducedMotion
                ? 'bg-[#151C1D] border-[#D2F27C]/40 text-[#D2F27C]'
                : 'bg-[#151C1D] border-[#283231] text-[#98A5A2] hover:text-[#EEF2EF]'
            }`}
            title="Toggle between subtle animation and static still image"
          >
            {reducedMotion ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Motion:</span>
            <span>{reducedMotion ? 'Static Still' : 'Subtle Pulse'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-[#98A5A2] hover:text-[#EEF2EF] bg-[#151C1D] border border-[#283231] rounded-lg transition-colors"
            title={isExpanded ? 'Minimize' : 'Expand full view'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Editorial Content Stage */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-b from-[#101516] via-[#0d1213] to-[#080B0C]">
        
        {/* Left: The Visual Plates Canvas (7 Columns on large screens) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {viewMode === 'schematic' ? (
            /* Schematic Layer Stack with Subtle Lime Light Sweep & Signals */
            <div className="relative p-6 bg-[#080B0C] border border-[#283231] rounded-xl overflow-hidden select-none">
              
              {/* Subtle ambient teal/green lighting */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: 'radial-gradient(ellipse at 50% 30%, rgba(210, 242, 124, 0.12) 0%, rgba(8, 11, 12, 0) 70%)'
                }}
              />

              {/* Slow, restrained lime light sweep bar across plates */}
              {!reducedMotion && (
                <div 
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                >
                  <div 
                    className="w-[200%] h-32 bg-gradient-to-b from-transparent via-[#D2F27C]/6 to-transparent animate-lime-sweep"
                  />
                </div>
              )}

              {/* Subtle technical isometric grid lines */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(#283231 1px, transparent 1px), linear-gradient(90deg, #283231 1px, transparent 1px)`,
                  backgroundSize: '36px 36px'
                }}
              />

              {/* Header Label inside plate canvas */}
              <div className="relative flex items-center justify-between text-[11px] font-mono text-[#98A5A2] pb-4 mb-2 border-b border-[#283231]/60">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D2F27C]" />
                  <span>THE CONNECTED SYSTEM · 7 LAYERS</span>
                </span>
                <span>PHYSICAL TO APPLICATION</span>
              </div>

              {/* 7 Stacked Architectural Plates */}
              <div className="relative space-y-2.5">
                {[...OSI_LAYERS].reverse().map((layer, index) => {
                  const layerNum = layer.number;
                  const isSelected = selectedLayerIndex === (layerNum - 1);
                  const isPingBoundary = layerNum === 3;
                  const isAppRequired = layerNum >= 4;
                  const hasSignalHere = !reducedMotion && signalPosition === (layerNum - 1);

                  return (
                    <div
                      key={layerNum}
                      onClick={() => {
                        setSelectedLayerIndex(layerNum - 1);
                        if (onSelectLayer) onSelectLayer(layerNum);
                      }}
                      className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#151C1D] border-[#D2F27C] shadow-[0_0_15px_rgba(210,242,124,0.12)]'
                          : 'bg-[#101516]/90 border-[#283231] hover:border-[#98A5A2]/40 hover:bg-[#151C1D]/60'
                      }`}
                    >
                      {/* Left vertical fine marker */}
                      <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r transition-colors ${
                        isSelected 
                          ? 'bg-[#D2F27C]' 
                          : isPingBoundary 
                          ? 'bg-[#A6C955]/70' 
                          : 'bg-transparent group-hover:bg-[#283231]'
                      }`} />

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Layer Pill/Monospace Tag */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#D2F27C] text-[#080B0C]'
                              : isPingBoundary
                              ? 'bg-[#151C1D] text-[#D2F27C] border border-[#D2F27C]/30'
                              : 'bg-[#080B0C] text-[#98A5A2] border border-[#283231]'
                          }`}>
                            L{layerNum}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs sm:text-sm font-semibold truncate ${
                                isSelected ? 'text-[#EEF2EF]' : 'text-[#EEF2EF]/90 group-hover:text-white'
                              }`}>
                                {layer.name}
                              </span>

                              {isPingBoundary && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#D2F27C] bg-[#D2F27C]/10 border border-[#D2F27C]/30">
                                  Ping Reaches Here
                                </span>
                              )}

                              {layerNum === 4 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-[#EF8A78] bg-[#EF8A78]/10 border border-[#EF8A78]/30">
                                  Ports Blocked Here
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] font-mono text-[#98A5A2] truncate mt-0.5">
                              {layer.protocols}
                            </div>
                          </div>
                        </div>

                        {/* Status badges on right */}
                        <div className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                          {layerNum <= 3 ? (
                            <span className="flex items-center gap-1 text-[#D2F27C]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D2F27C]" />
                              <span className="hidden sm:inline">ICMP Pass</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[#98A5A2]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#283231]" />
                              <span className="hidden sm:inline">ICMP Blind</span>
                            </span>
                          )}

                          {/* Signal dot simulation */}
                          {hasSignalHere && (
                            <span className="w-2 h-2 rounded-full bg-[#D2F27C] shadow-[0_0_8px_#D2F27C] animate-ping" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Path Explainer Bar */}
              <div className="mt-4 pt-3 border-t border-[#283231]/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-[#98A5A2] gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D2F27C]" />
                  <span>Ping only reaches Layer 3 (Network).</span>
                </div>
                <div className="flex items-center gap-2 text-[#EF8A78]">
                  <span className="w-2 h-2 rounded-full bg-[#EF8A78]" />
                  <span>Web App requires Layers 4, 6 & 7.</span>
                </div>
              </div>
            </div>
          ) : (
            /* High-Fidelity Editorial Graphic Render Mode */
            <div className="relative rounded-xl overflow-hidden border border-[#283231] bg-[#080B0C] group">
              <img
                src={editorialPlateImage}
                alt="7LayerX Editorial Layer Architecture"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />

              {/* Ambient overlay wash */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080B0C] via-transparent to-transparent opacity-60" />

              {/* Subtle animated lime trace overlay */}
              {!reducedMotion && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-[#D2F27C]/10 blur-2xl animate-gentle-breathe" />
                </div>
              )}

              {/* Metadata tag overlay */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-[#EEF2EF]">
                <div className="flex items-center gap-2 bg-[#080B0C]/80 px-2.5 py-1 rounded border border-[#283231] backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D2F27C]" />
                  <span>7LayerX Physical Schematic Plate</span>
                </div>
                <span className="text-[#98A5A2] bg-[#080B0C]/80 px-2 py-1 rounded border border-[#283231]">
                  Stack Resolution: 4K
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Technical Editorial Prose & The Layer Deep-Dive (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Editorial Philosophy Statement */}
          <div className="p-5 rounded-xl bg-[#151C1D] border border-[#283231]">
            <div className="text-[11px] font-mono text-[#D2F27C] uppercase tracking-wider mb-1 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Diagnostic Principle</span>
            </div>
            <h3 className="text-base font-bold text-[#EEF2EF]">
              “Ping is working, but the application is not.”
            </h3>
            <p className="text-xs text-[#98A5A2] mt-2 leading-relaxed">
              Because ping primarily tests IP reachability using ICMP, while applications depend on DNS, routing, port filtering, MTU limits, TLS negotiation, and daemon execution.
            </p>
          </div>

          {/* Active Layer Technical Inspector */}
          <div className="p-5 rounded-xl bg-[#080B0C] border border-[#283231] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#151C1D] text-[#D2F27C] border border-[#283231]">
                Layer {activeLayer.number} · {activeLayer.name}
              </span>
              <span className="text-[11px] font-mono text-[#98A5A2]">
                PDU: {activeLayer.unit}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#98A5A2] block mb-1">
                Typical Protocols:
              </span>
              <code className="text-xs font-mono text-[#EEF2EF] bg-[#151C1D] px-2.5 py-1.5 rounded-lg border border-[#283231] block">
                {activeLayer.protocols}
              </code>
            </div>

            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#98A5A2] block mb-1">
                Role in Troubleshooting:
              </span>
              <p className="text-xs text-[#98A5A2] leading-relaxed">
                {activeLayer.roleInIssue}
              </p>
            </div>

            {/* Ping vs App capability for this layer */}
            <div className="pt-3 border-t border-[#283231] grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#151C1D] border border-[#283231]">
                <span className="text-[10px] text-[#98A5A2] block">Ping Reachability:</span>
                <span className={`font-bold mt-0.5 block ${activeLayer.pingInvolved ? 'text-[#D2F27C]' : 'text-[#EF8A78]'}`}>
                  {activeLayer.pingInvolved ? '● L3 Reachable' : '○ Blind to Ping'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#151C1D] border border-[#283231]">
                <span className="text-[10px] text-[#98A5A2] block">App Dependency:</span>
                <span className="font-bold text-[#D2F27C] mt-0.5 block">
                  ● Critical Path
                </span>
              </div>
            </div>
          </div>

          {/* Slogan Footer Callout */}
          <div className="text-center sm:text-left py-2">
            <p className="text-xs font-mono text-[#98A5A2]">
              <strong className="text-[#EEF2EF]">Trace the signal.</strong> Understand the system. <span className="text-[#D2F27C]">Share the knowledge.</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
