import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Maximize2,
  Minimize2,
  Globe2,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Check,
  Edit3
} from 'lucide-react';
import { NetworkNode, SimulationScenario } from '../types/network';
import { SCENARIOS, IP_PRESETS, getNetworkNodes } from '../data/networkData';

interface NetworkDiagramProps {
  currentScenario: SimulationScenario;
  onSelectScenario: (scenario: SimulationScenario) => void;
  onSelectStep?: (stepId: number) => void;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  clientIp: string;
  serverIp: string;
  onChangeIps: (client: string, server: string) => void;
}

export const NetworkDiagram: React.FC<NetworkDiagramProps> = ({
  currentScenario,
  onSelectScenario,
  onSelectStep,
  selectedNodeId,
  onSelectNode,
  isFullscreen,
  onToggleFullscreen,
  clientIp,
  serverIp,
  onChangeIps
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(0.75);
  const [pingProgress, setPingProgress] = useState<number>(0);
  const [appProgress, setAppProgress] = useState<number>(0);
  const [pingDirection, setPingDirection] = useState<'forward' | 'return'>('forward');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isIpModalOpen, setIsIpModalOpen] = useState<boolean>(false);
  const [customClientInput, setCustomClientInput] = useState<string>(clientIp);
  const [customServerInput, setCustomServerInput] = useState<string>(serverIp);

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const nodes = getNetworkNodes(clientIp, serverIp);

  const nodeXCoords: Record<string, number> = {
    client: 80,
    switch: 240,
    router: 400,
    firewall: 560,
    internet: 720,
    server: 880
  };

  const getDropXLimit = () => {
    const targetNode = currentScenario.dropAtNodeId || 'firewall';
    return nodeXCoords[targetNode] ?? 560;
  };

  const dropLimitX = getDropXLimit();

  useEffect(() => {
    if (reducedMotion) return;

    const animate = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setPingProgress((prev) => {
          const step = (110 * speed * dt);
          if (pingDirection === 'forward') {
            const nextVal = prev + step;
            if (nextVal >= 800) {
              setPingDirection('return');
              return 800;
            }
            return nextVal;
          } else {
            const nextVal = prev - step;
            if (nextVal <= 0) {
              setPingDirection('forward');
              return 0;
            }
            return nextVal;
          }
        });

        setAppProgress((prev) => {
          const step = (90 * speed * dt);
          const maxReach = currentScenario.appResult === 'success' ? 800 : (dropLimitX - 80);
          
          if (prev >= maxReach) {
            if (prev > maxReach + 40) {
              return 0;
            }
            return prev + step * 0.2;
          } else {
            return prev + step;
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed, pingDirection, currentScenario, dropLimitX, reducedMotion]);

  const handleReset = () => {
    setPingProgress(0);
    setAppProgress(0);
    setPingDirection('forward');
  };

  const handleApplyCustomIps = (e: React.FormEvent) => {
    e.preventDefault();
    if (customClientInput.trim() && customServerInput.trim()) {
      onChangeIps(customClientInput.trim(), customServerInput.trim());
      setIsIpModalOpen(false);
    }
  };

  const pingCurrentX = reducedMotion ? 400 : (80 + pingProgress);
  const appCurrentX = reducedMotion ? Math.min(dropLimitX, 560) : Math.min(80 + appProgress, dropLimitX);

  return (
    <div className={`relative bg-[#101516] border border-[#283231] rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl ${
      isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto' : ''
    }`}>
      {/* Top Header / Infographic Banner */}
      <div className="bg-[#080B0C] border-b border-[#283231] px-6 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium tracking-widest text-[#D2F27C] uppercase">
                7LayerX · Topology Simulation
              </span>
              <span className="text-[#283231]">·</span>
              <span className="text-xs font-mono text-[#98A5A2]">www.7layerx.com</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#EEF2EF] mt-1">
              Ping <span className="text-[#D2F27C]">Works</span>, but the Application <span className="text-[#EF8A78]">Doesn't</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#98A5A2] mt-1 max-w-3xl leading-relaxed">
              Client <code className="text-[#D2F27C] font-mono px-1 py-0.2 bg-[#151C1D] rounded border border-[#283231]">{clientIp}</code> can reach <code className="text-[#D2F27C] font-mono px-1 py-0.2 bg-[#151C1D] rounded border border-[#283231]">{serverIp}</code> via ICMP (Layer 3), but application sockets on port 443 are denied.
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* IP Address Editor Button */}
            <button
              onClick={() => setIsIpModalOpen(!isIpModalOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#151C1D] border border-[#283231] hover:border-[#D2F27C] text-xs font-mono text-[#EEF2EF] rounded-lg transition-colors"
              title="Change client & application IP addresses"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#D2F27C]" />
              <span>Configure IPs</span>
            </button>

            {/* Scenario Picker */}
            <select
              value={currentScenario.id}
              onChange={(e) => {
                const found = SCENARIOS.find(s => s.id === e.target.value);
                if (found) {
                  onSelectScenario(found);
                  handleReset();
                }
              }}
              className="bg-[#151C1D] border border-[#283231] text-[#EEF2EF] text-xs font-mono rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#D2F27C] focus:outline-none"
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shortLabel} ({s.id === 'all_healthy' ? 'Healthy' : 'Fails'})
                </option>
              ))}
            </select>

            {/* Reduced motion toggle */}
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className="p-2 text-[#98A5A2] hover:text-[#EEF2EF] bg-[#151C1D] border border-[#283231] rounded-lg transition-colors"
              title={reducedMotion ? 'Enable subtle motion' : 'Freeze as still graphic'}
            >
              {reducedMotion ? <EyeOff className="w-4 h-4 text-[#D2F27C]" /> : <Eye className="w-4 h-4" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={onToggleFullscreen}
              className="p-2 text-[#98A5A2] hover:text-[#EEF2EF] bg-[#151C1D] border border-[#283231] rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* IP Address Editor Drawer / Popover */}
        {isIpModalOpen && (
          <div className="mt-4 p-4 rounded-xl bg-[#151C1D] border border-[#283231] animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#D2F27C] uppercase tracking-wider">
                  Host IP Address Configuration
                </span>
                <p className="text-xs text-[#98A5A2] mt-0.5">
                  Type any custom IP address or choose an infrastructure preset:
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                {IP_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setCustomClientInput(p.clientIp);
                      setCustomServerInput(p.serverIp);
                      onChangeIps(p.clientIp, p.serverIp);
                    }}
                    className={`px-2.5 py-1 rounded-md border transition-colors ${
                      clientIp === p.clientIp && serverIp === p.serverIp
                        ? 'bg-[#101516] border-[#D2F27C] text-[#D2F27C]'
                        : 'bg-[#101516] border-[#283231] text-[#98A5A2] hover:text-[#EEF2EF]'
                    }`}
                  >
                    {p.name.split('/')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleApplyCustomIps} className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#98A5A2] block mb-1">
                  Client Host IP:
                </label>
                <input
                  type="text"
                  value={customClientInput}
                  onChange={(e) => setCustomClientInput(e.target.value)}
                  placeholder="e.g. 10.20.4.15"
                  className="w-full bg-[#101516] border border-[#283231] rounded-lg px-3 py-1.5 text-xs font-mono text-[#EEF2EF] focus:outline-none focus:border-[#D2F27C]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#98A5A2] block mb-1">
                  Application Server IP:
                </label>
                <input
                  type="text"
                  value={customServerInput}
                  onChange={(e) => setCustomServerInput(e.target.value)}
                  placeholder="e.g. 198.51.100.25"
                  className="w-full bg-[#101516] border border-[#283231] rounded-lg px-3 py-1.5 text-xs font-mono text-[#EEF2EF] focus:outline-none focus:border-[#D2F27C]"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#D2F27C] hover:bg-[#A6C955] text-[#080B0C] font-mono font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update IPs</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsIpModalOpen(false)}
                  className="px-3 py-1.5 bg-[#101516] border border-[#283231] text-[#98A5A2] hover:text-[#EEF2EF] font-mono text-xs rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Legend / Status Strip */}
        <div className="mt-4 pt-4 border-t border-[#283231]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#151C1D] border border-[#283231] text-[#D2F27C] font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#D2F27C]" />
              <span>Ping (ICMP Protocol 1) · Always Responding</span>
            </div>

            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[11px] border ${
              currentScenario.appResult === 'success'
                ? 'bg-[#151C1D] border-[#283231] text-[#D2F27C]'
                : 'bg-[#151C1D] border-[#EF8A78]/30 text-[#EF8A78]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                currentScenario.appResult === 'success' ? 'bg-[#D2F27C]' : 'bg-[#EF8A78]'
              }`} />
              <span>
                Application (TCP 443 / HTTPS) · {currentScenario.appResult === 'success' ? 'Working' : 'Not Working'}
              </span>
            </div>
          </div>

          {/* Interactive controls */}
          <div className="flex items-center gap-2 bg-[#151C1D] px-3 py-1 rounded-lg border border-[#283231] text-xs font-mono">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1 text-[#98A5A2] hover:text-[#EEF2EF] transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#D2F27C]" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <span className="text-[#283231]">|</span>
            <button
              onClick={handleReset}
              className="text-[#98A5A2] hover:text-[#EEF2EF] transition-colors p-1"
              title="Reset Packet Position"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Topology Area */}
      <div className="relative p-6 bg-[#080B0C] min-h-[360px] select-none">
        
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(210, 242, 124, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* SVG Topology & Signal Paths */}
        <div className="relative w-full overflow-x-auto pb-4">
          <div className="min-w-[960px] max-w-[1100px] mx-auto">
            <svg 
              viewBox="0 0 960 270" 
              className="w-full h-auto drop-shadow-md"
            >
              <defs>
                <filter id="softLimeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Physical Connection Base Conduit Cable (Underneath) */}
              <line 
                x1="80" 
                y1="115" 
                x2="880" 
                y2="115" 
                stroke="#151C1D" 
                strokeWidth="6" 
                strokeLinecap="round"
              />
              <line 
                x1="80" 
                y1="115" 
                x2="880" 
                y2="115" 
                stroke="#283231" 
                strokeWidth="1.5" 
                strokeLinecap="round"
              />

              {/* PATH 1: Signature Lime PING Conduit Line (Upper Path, y=65) */}
              <path
                d="M 80 115 C 100 65, 140 65, 180 65 L 780 65 C 820 65, 860 65, 880 115"
                fill="none"
                stroke="#283231"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 80 115 C 100 65, 140 65, 180 65 L 780 65 C 820 65, 860 65, 880 115"
                fill="none"
                stroke="#A6C955"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className={reducedMotion ? '' : 'animate-signal-dash'}
                opacity="0.6"
              />

              {/* PATH 2: APPLICATION Conduit Line (Lower Path, y=165) */}
              <path
                d={currentScenario.appResult === 'success' 
                  ? "M 80 115 C 100 165, 140 165, 180 165 L 780 165 C 820 165, 860 165, 880 115"
                  : `M 80 115 C 100 165, 140 165, 180 165 L ${Math.min(dropLimitX, 780)} 165`
                }
                fill="none"
                stroke="#283231"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d={currentScenario.appResult === 'success' 
                  ? "M 80 115 C 100 165, 140 165, 180 165 L 780 165 C 820 165, 860 165, 880 115"
                  : `M 80 115 C 100 165, 140 165, 180 165 L ${Math.min(dropLimitX, 780)} 165`
                }
                fill="none"
                stroke={currentScenario.appResult === 'success' ? '#D2F27C' : '#EF8A78'}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                className={reducedMotion ? '' : 'animate-signal-dash'}
                opacity={currentScenario.appResult === 'success' ? '0.7' : '0.8'}
              />

              {/* Ping Packet Trail & Traveling Badge */}
              <g transform={`translate(${pingCurrentX}, 65)`}>
                <circle r="12" fill="#D2F27C" opacity="0.15" filter="url(#softLimeGlow)" />
                <rect x="-38" y="-11" width="76" height="22" rx="4" fill="#151C1D" stroke="#D2F27C" strokeWidth="1" />
                <text x="0" y="3.5" fill="#D2F27C" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">
                  ICMP {pingDirection === 'forward' ? 'ECHO ▶' : '◀ REPLY'}
                </text>
              </g>

              {/* App Packet Trail & Traveling Badge */}
              <g transform={`translate(${appCurrentX}, 165)`}>
                {appCurrentX >= dropLimitX && currentScenario.appResult !== 'success' ? (
                  // Blocked Icon & Drop Marker in Coral #EF8A78
                  <g>
                    <circle r="16" fill="#EF8A78" opacity="0.15" />
                    <circle r="12" fill="#151C1D" stroke="#EF8A78" strokeWidth="1.5" />
                    <line x1="-5" y1="-5" x2="5" y2="5" stroke="#EF8A78" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="5" y1="-5" x2="-5" y2="5" stroke="#EF8A78" strokeWidth="1.5" strokeLinecap="round" />
                    
                    {/* Floating Drop Reason Tooltip */}
                    <g transform="translate(0, 28)">
                      <rect x="-85" y="0" width="170" height="24" rx="4" fill="#151C1D" stroke="#EF8A78" strokeWidth="1" />
                      <text x="0" y="15" fill="#EF8A78" fontSize="9.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">
                        BLOCKED · {currentScenario.failingComponent}
                      </text>
                    </g>
                  </g>
                ) : (
                  // Moving Application Packet
                  <g>
                    <circle r="12" fill="#D2F27C" opacity="0.1" />
                    <rect x="-42" y="-11" width="84" height="22" rx="4" fill="#151C1D" stroke="#98A5A2" strokeWidth="1" />
                    <text x="0" y="3.5" fill="#EEF2EF" fontSize="9" fontWeight="bold" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">
                      TCP 443 [SYN] ▶
                    </text>
                  </g>
                )}
              </g>

              {/* NETWORK HARDWARE NODES */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isFailingNode = currentScenario.dropAtNodeId === node.id && currentScenario.appResult !== 'success';

                return (
                  <g 
                    key={node.id} 
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform duration-200 hover:scale-105"
                    onClick={() => onSelectNode(isSelected ? null : node.id)}
                  >
                    {/* Outer plate ring */}
                    <circle
                      r="26"
                      fill="#101516"
                      stroke={
                        isSelected 
                          ? '#D2F27C' 
                          : isFailingNode
                          ? '#EF8A78'
                          : '#283231'
                      }
                      strokeWidth={isSelected || isFailingNode ? '1.5' : '1'}
                    />

                    {/* Inner raised circle */}
                    <circle
                      r="20"
                      fill="#151C1D"
                    />

                    {/* Node Icons */}
                    {node.icon === 'client' && (
                      <g transform="translate(-10, -9)">
                        <rect x="1" y="2" width="18" height="11" rx="1" fill="none" stroke="#D2F27C" strokeWidth="1.2" />
                        <line x1="0" y1="15" x2="20" y2="15" stroke="#98A5A2" strokeWidth="1.5" />
                      </g>
                    )}

                    {node.icon === 'switch' && (
                      <g transform="translate(-11, -8)">
                        <rect x="0" y="2" width="22" height="12" rx="1" fill="none" stroke="#98A5A2" strokeWidth="1.2" />
                        <circle cx="5" cy="8" r="1" fill="#D2F27C" />
                        <circle cx="9" cy="8" r="1" fill="#D2F27C" />
                        <circle cx="13" cy="8" r="1" fill="#98A5A2" />
                        <circle cx="17" cy="8" r="1" fill="#98A5A2" />
                      </g>
                    )}

                    {node.icon === 'router' && (
                      <g transform="translate(-10, -10)">
                        <circle cx="10" cy="10" r="9" fill="none" stroke="#98A5A2" strokeWidth="1.2" />
                        <line x1="4" y1="10" x2="16" y2="10" stroke="#D2F27C" strokeWidth="1.2" />
                        <line x1="10" y1="4" x2="10" y2="16" stroke="#D2F27C" strokeWidth="1.2" />
                      </g>
                    )}

                    {node.icon === 'firewall' && (
                      <g transform="translate(-10, -10)">
                        <rect x="1" y="1" width="18" height="18" rx="2" fill="none" stroke={isFailingNode ? '#EF8A78' : '#98A5A2'} strokeWidth="1.2" />
                        <line x1="1" y1="7" x2="19" y2="7" stroke="#283231" strokeWidth="1" />
                        <line x1="1" y1="13" x2="19" y2="13" stroke="#283231" strokeWidth="1" />
                        <line x1="10" y1="1" x2="10" y2="7" stroke="#283231" strokeWidth="1" />
                        <line x1="6" y1="7" x2="6" y2="13" stroke="#283231" strokeWidth="1" />
                        <line x1="14" y1="7" x2="14" y2="13" stroke="#283231" strokeWidth="1" />
                      </g>
                    )}

                    {node.icon === 'internet' && (
                      <g transform="translate(-11, -9)">
                        <path 
                          d="M5 14 A4 4 0 0 1 3 9 A5 5 0 0 1 12 5 A6 6 0 0 1 19 8 A4 4 0 0 1 18 14 Z" 
                          fill="none" 
                          stroke="#98A5A2" 
                          strokeWidth="1.2" 
                        />
                      </g>
                    )}

                    {node.icon === 'server' && (
                      <g transform="translate(-9, -11)">
                        <rect x="1" y="0" width="16" height="6" rx="1" fill="none" stroke="#98A5A2" strokeWidth="1" />
                        <rect x="1" y="8" width="16" height="6" rx="1" fill="none" stroke="#98A5A2" strokeWidth="1" />
                        <rect x="1" y="16" width="16" height="6" rx="1" fill="none" stroke="#98A5A2" strokeWidth="1" />
                        <circle cx="4" cy="3" r="0.8" fill="#D2F27C" />
                        <circle cx="4" cy="11" r="0.8" fill="#D2F27C" />
                        <circle cx="4" cy="19" r="0.8" fill={currentScenario.appResult === 'reset' ? '#EF8A78' : '#D2F27C'} />
                      </g>
                    )}

                    {/* Node Labels */}
                    <text 
                      x="0" 
                      y="42" 
                      fill="#EEF2EF" 
                      fontSize="11" 
                      fontWeight="600" 
                      textAnchor="middle"
                    >
                      {node.name.split(' ')[0]}
                    </text>
                    <text 
                      x="0" 
                      y="54" 
                      fill="#98A5A2" 
                      fontSize="9.5" 
                      fontFamily="IBM Plex Mono, monospace" 
                      textAnchor="middle"
                    >
                      {node.ip}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Node Details Bar */}
        {selectedNodeId && (
          <div className="mt-2 p-3 bg-[#151C1D] border border-[#283231] rounded-lg text-xs font-mono flex items-center justify-between gap-4">
            {(() => {
              const node = nodes.find(n => n.id === selectedNodeId);
              if (!node) return null;
              return (
                <>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-[#D2F27C]">{node.name}</span>
                    <span className="text-[#283231]">·</span>
                    <span className="text-[#EEF2EF]">{node.ip}</span>
                    <span className="text-[#283231]">·</span>
                    <span className="text-[#98A5A2]">{node.details}</span>
                  </div>
                  <button 
                    onClick={() => onSelectNode(null)}
                    className="text-[#98A5A2] hover:text-white px-2 py-0.5 rounded bg-[#101516] border border-[#283231]"
                  >
                    Close
                  </button>
                </>
              );
            })()}
          </div>
        )}

        {/* Example Scenario Banner */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          <div className="md:col-span-2 p-4 bg-[#151C1D] border border-[#283231] rounded-xl flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-[#101516] border border-[#283231] text-[#D2F27C] shrink-0">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#D2F27C] uppercase tracking-wider">
                  Scenario Focus
                </span>
                <span className="text-[#283231]">/</span>
                <span className="text-[11px] text-[#98A5A2]">{currentScenario.shortLabel}</span>
              </div>
              <p className="text-xs text-[#EEF2EF] mt-1 font-sans">
                You can ping <code className="text-[#D2F27C] font-mono">{serverIp}</code> and get a reply, but the website or application doesn't open.
              </p>
              <p className="text-[11px] text-[#98A5A2] mt-1 font-sans">
                Network reaches server at Layer 3 (IP), but the application is blocked at a higher layer.
              </p>
            </div>
          </div>

          {/* Quick Action Suggestion */}
          <div className="p-4 bg-[#151C1D] border border-[#283231] rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#EF8A78] uppercase tracking-wider">
                Root Barrier
              </span>
              <p className="text-xs text-[#EEF2EF] mt-1 line-clamp-2 font-sans">
                {currentScenario.dropMessage}
              </p>
            </div>
            {onSelectStep && (
              <button
                onClick={() => onSelectStep(currentScenario.recommendedStep)}
                className="mt-2 text-xs font-semibold text-[#D2F27C] hover:text-white flex items-center gap-1 transition-colors self-start"
              >
                <span>Jump to Step {currentScenario.recommendedStep} Fix →</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
