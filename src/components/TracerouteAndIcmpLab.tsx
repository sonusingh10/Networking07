import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  Activity, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Route, 
  Terminal, 
  Radio, 
  ShieldCheck, 
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';

interface TracerouteAndIcmpLabProps {
  clientIp: string;
  serverIp: string;
}

type ProtocolMode = 'icmp_ping' | 'tracert_icmp' | 'tracert_tcp' | 'tracert_udp';

interface HopResult {
  hopNumber: number;
  nodeName: string;
  ip: string;
  rttMs: number | string;
  status: 'responded' | 'timeout' | 'reached';
  responseType: string;
}

export const TracerouteAndIcmpLab: React.FC<TracerouteAndIcmpLabProps> = ({
  clientIp,
  serverIp
}) => {
  const [mode, setMode] = useState<ProtocolMode>('tracert_tcp');
  const [currentTtl, setCurrentTtl] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [packetProgress, setPacketProgress] = useState<number>(0); // 0 to 100%
  const [packetPhase, setPacketPhase] = useState<'forward' | 'return' | 'dropped'>('forward');
  const [activeHopLogs, setActiveHopLogs] = useState<HopResult[]>([]);

  const animationRef = useRef<number | null>(null);

  // Nodes for the trace lab
  const traceNodes = [
    { id: 'client', name: 'Client Host', ip: clientIp, type: 'host', x: 60 },
    { id: 'hop1', name: 'Gateway Router', ip: '10.20.4.1', type: 'router', x: 260 },
    { id: 'hop2', name: 'Edge Router', ip: '172.16.0.1', type: 'router', x: 460 },
    { id: 'hop3', name: 'Perimeter Firewall', ip: '198.51.100.1', type: 'firewall', x: 660 },
    { id: 'dest', name: 'Target Server', ip: serverIp, type: 'server', x: 860 }
  ];

  // Total hops = 4
  const maxHops = 4;

  // Reset state when switching modes
  useEffect(() => {
    setCurrentTtl(1);
    setPacketProgress(0);
    setPacketPhase('forward');
    setIsPlaying(false);
    setActiveHopLogs([]);
  }, [mode, clientIp, serverIp]);

  // Determine current hop target node index based on TTL
  const targetNodeIndex = Math.min(currentTtl, maxHops);

  // Simulation step
  const executeStep = (ttl: number) => {
    let status: 'responded' | 'timeout' | 'reached' = 'responded';
    let rtt: number | string = (0.7 + ttl * 0.85).toFixed(2);
    let resp = '';

    const targetNode = traceNodes[ttl];

    if (mode === 'icmp_ping') {
      // Ping traverses all the way to destination
      status = 'reached';
      resp = 'ICMP Type 0 (Echo Reply)';
      rtt = (2.1 + Math.random() * 0.3).toFixed(2);
      setActiveHopLogs([
        {
          hopNumber: 1,
          nodeName: 'Target Server',
          ip: serverIp,
          rttMs: rtt,
          status: 'reached',
          responseType: 'ICMP Type 0 (Echo Reply)'
        }
      ]);
      return;
    }

    if (ttl === 1) {
      resp = 'ICMP Type 11 Code 0 (TTL Exceeded in Transit)';
    } else if (ttl === 2) {
      resp = 'ICMP Type 11 Code 0 (TTL Exceeded in Transit)';
    } else if (ttl === 3) {
      // Perimeter firewall behavior varies by protocol:
      if (mode === 'tracert_icmp') {
        // Firewall drops ICMP echo!
        status = 'timeout';
        rtt = '*';
        resp = 'Silent Drop / Filtered by ACL (Request Timed Out)';
      } else if (mode === 'tracert_udp') {
        status = 'timeout';
        rtt = '*';
        resp = 'UDP High Port Blocked by Firewall (Request Timed Out)';
      } else {
        // TCP port 443 passes through firewall!
        resp = 'ICMP Type 11 Code 0 (TTL Exceeded in Transit)';
      }
    } else if (ttl === 4) {
      // Reached destination!
      if (mode === 'tracert_tcp') {
        status = 'reached';
        resp = 'TCP [SYN-ACK] on Port 443 (Connection Established)';
      } else if (mode === 'tracert_icmp') {
        // Server drops ICMP ping or firewall blocked it
        status = 'timeout';
        rtt = '*';
        resp = 'ICMP Echo Filtered by Host Policy (* * *)';
      } else {
        status = 'reached';
        resp = 'ICMP Type 3 Code 3 (Destination Port Unreachable)';
      }
    }

    const newLog: HopResult = {
      hopNumber: ttl,
      nodeName: targetNode ? targetNode.name : 'Unknown',
      ip: targetNode ? targetNode.ip : '*',
      rttMs: rtt,
      status,
      responseType: resp
    };

    setActiveHopLogs(prev => {
      const filtered = prev.filter(l => l.hopNumber !== ttl);
      return [...filtered, newLog].sort((a, b) => a.hopNumber - b.hopNumber);
    });
  };

  // Animation Loop
  useEffect(() => {
    if (!isPlaying) return;

    let progress = 0;
    let phase: 'forward' | 'return' = 'forward';

    const interval = setInterval(() => {
      progress += 4;
      if (phase === 'forward') {
        if (progress >= 100) {
          phase = 'return';
          progress = 0;
          setPacketPhase('return');
        } else {
          setPacketProgress(progress);
        }
      } else {
        if (progress >= 100) {
          executeStep(currentTtl);
          if (currentTtl < maxHops && mode !== 'icmp_ping') {
            setCurrentTtl(prev => prev + 1);
            phase = 'forward';
            progress = 0;
            setPacketPhase('forward');
          } else {
            setIsPlaying(false);
          }
        } else {
          setPacketProgress(progress);
        }
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, currentTtl, mode]);

  const handleManualNextHop = () => {
    executeStep(currentTtl);
    if (currentTtl < maxHops) {
      setCurrentTtl(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTtl(1);
    setPacketProgress(0);
    setPacketPhase('forward');
    setActiveHopLogs([]);
  };

  // Calculate packet X position in SVG (0 to 100% between client and target hop)
  const clientX = traceNodes[0].x;
  const targetX = mode === 'icmp_ping' ? traceNodes[4].x : traceNodes[targetNodeIndex].x;
  const currentPacketX = packetPhase === 'forward' 
    ? clientX + (targetX - clientX) * (packetProgress / 100)
    : targetX - (targetX - clientX) * (packetProgress / 100);

  return (
    <div className="bg-[#101516] border border-[#283231] rounded-2xl overflow-hidden shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="bg-[#080B0C] border-b border-[#283231] px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-medium tracking-widest text-[#D2F27C] uppercase">
              Interactive Protocol Lab
            </span>
            <span className="text-[#283231]">/</span>
            <span className="text-xs font-mono text-[#98A5A2]">Ping vs Traceroute (ICMP vs TCP)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#EEF2EF] mt-1">
            How Ping & Traceroute Actually Work
          </h2>
          <p className="text-xs sm:text-sm text-[#98A5A2] mt-1 max-w-3xl leading-relaxed">
            Discover why traditional <strong className="text-[#EEF2EF]">ICMP traceroute fails</strong> behind enterprise firewalls, while <strong className="text-[#D2F27C]">TCP traceroute (-T -p 443)</strong> illuminates the true application path.
          </p>
        </div>

        {/* Protocol Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#151C1D] border border-[#283231] rounded-xl text-xs font-mono">
          <button
            onClick={() => setMode('tracert_tcp')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'tracert_tcp'
                ? 'bg-[#101516] text-[#D2F27C] border border-[#283231] font-semibold'
                : 'text-[#98A5A2] hover:text-[#EEF2EF]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Traceroute TCP (-T :443)</span>
          </button>

          <button
            onClick={() => setMode('tracert_icmp')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'tracert_icmp'
                ? 'bg-[#101516] text-[#D2F27C] border border-[#283231] font-semibold'
                : 'text-[#98A5A2] hover:text-[#EEF2EF]'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Traceroute ICMP (tracert)</span>
          </button>

          <button
            onClick={() => setMode('icmp_ping')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'icmp_ping'
                ? 'bg-[#101516] text-[#D2F27C] border border-[#283231] font-semibold'
                : 'text-[#98A5A2] hover:text-[#EEF2EF]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Ping (ICMP Echo)</span>
          </button>

          <button
            onClick={() => setMode('tracert_udp')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'tracert_udp'
                ? 'bg-[#101516] text-[#D2F27C] border border-[#283231] font-semibold'
                : 'text-[#98A5A2] hover:text-[#EEF2EF]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>UDP Trace (Classic)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage: Packet & TTL Hop Visualizer */}
      <div className="px-6 space-y-4">
        {/* Playback & Step Controls */}
        <div className="p-3 bg-[#151C1D] border border-[#283231] rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeHopLogs.length === 0) executeStep(currentTtl);
                setIsPlaying(!isPlaying);
              }}
              className="px-3 py-1.5 rounded-lg bg-[#D2F27C] hover:bg-[#A6C955] text-[#080B0C] font-bold flex items-center gap-1.5 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Trace' : 'Auto Run Trace'}</span>
            </button>

            {mode !== 'icmp_ping' && (
              <button
                onClick={handleManualNextHop}
                disabled={isPlaying || currentTtl > maxHops}
                className="px-3 py-1.5 rounded-lg bg-[#101516] border border-[#283231] hover:border-[#D2F27C] text-[#EEF2EF] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <StepForward className="w-3.5 h-3.5" />
                <span>Next Hop (TTL={currentTtl})</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-[#98A5A2] hover:text-[#EEF2EF] bg-[#101516] border border-[#283231] transition-colors"
              title="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-[#98A5A2]">
            {mode !== 'icmp_ping' && (
              <div className="flex items-center gap-2">
                <span>Active Probe TTL:</span>
                <span className="px-2 py-0.5 rounded bg-[#101516] border border-[#283231] text-[#D2F27C] font-bold">
                  TTL = {currentTtl}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span>Protocol:</span>
              <span className="text-[#EEF2EF]">
                {mode === 'tracert_tcp' ? 'TCP SYN (Port 443)' : mode === 'tracert_icmp' ? 'ICMP Echo (Type 8)' : mode === 'icmp_ping' ? 'ICMP Echo (Type 8/0)' : 'UDP Port 33434'}
              </span>
            </div>
          </div>
        </div>

        {/* SVG Node & Packet Transit Diagram */}
        <div className="relative p-6 bg-[#080B0C] border border-[#283231] rounded-xl overflow-x-auto select-none">
          <div className="min-w-[920px]">
            <svg viewBox="0 0 920 220" className="w-full h-auto">
              {/* Conduit Line */}
              <line x1="60" y1="100" x2="860" y2="100" stroke="#151C1D" strokeWidth="8" strokeLinecap="round" />
              <line x1="60" y1="100" x2="860" y2="100" stroke="#283231" strokeWidth="1.5" strokeLinecap="round" />

              {/* Hop Marker Range Highlights */}
              {traceNodes.slice(1, targetNodeIndex + 1).map((node, i) => (
                <line
                  key={node.id}
                  x1={traceNodes[i].x}
                  y1="100"
                  x2={node.x}
                  y2="100"
                  stroke="#D2F27C"
                  strokeWidth="2"
                  opacity="0.4"
                />
              ))}

              {/* Moving Probe Packet */}
              {(isPlaying || packetProgress > 0) && (
                <g transform={`translate(${currentPacketX}, 100)`}>
                  <circle r="14" fill="#D2F27C" opacity="0.15" />
                  <rect 
                    x="-44" 
                    y="-12" 
                    width="88" 
                    height="24" 
                    rx="4" 
                    fill="#151C1D" 
                    stroke={packetPhase === 'forward' ? '#D2F27C' : '#98A5A2'} 
                    strokeWidth="1.5" 
                  />
                  <text 
                    x="0" 
                    y="4" 
                    fill={packetPhase === 'forward' ? '#D2F27C' : '#EEF2EF'} 
                    fontSize="9.5" 
                    fontWeight="bold" 
                    fontFamily="IBM Plex Mono, monospace" 
                    textAnchor="middle"
                  >
                    {packetPhase === 'forward' 
                      ? `${mode === 'tracert_tcp' ? 'TCP:443' : 'ICMP'} TTL=${currentTtl}` 
                      : 'ICMP TTL-EX'}
                  </text>
                </g>
              )}

              {/* Network Hops (Nodes) */}
              {traceNodes.map((node, idx) => {
                const isTargetOfCurrentHop = idx === targetNodeIndex;
                const isClient = idx === 0;
                const isFirewall = node.id === 'hop3';
                const isDest = idx === 4;

                return (
                  <g key={node.id} transform={`translate(${node.x}, 100)`}>
                    {/* Active Hop Ring */}
                    {isTargetOfCurrentHop && (
                      <circle r="32" fill="none" stroke="#D2F27C" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
                    )}

                    {/* Node Base */}
                    <circle
                      r="24"
                      fill="#101516"
                      stroke={
                        isFirewall && (mode === 'tracert_icmp' || mode === 'tracert_udp')
                          ? '#EF8A78'
                          : isTargetOfCurrentHop
                          ? '#D2F27C'
                          : '#283231'
                      }
                      strokeWidth={isTargetOfCurrentHop ? '2' : '1'}
                    />
                    <circle r="18" fill="#151C1D" />

                    {/* Hop Index Marker */}
                    <text x="0" y="4" fill="#EEF2EF" fontSize="10" fontWeight="bold" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">
                      {isClient ? 'SRC' : isDest ? 'DST' : `H${idx}`}
                    </text>

                    {/* Labels */}
                    <text x="0" y="40" fill="#EEF2EF" fontSize="11" fontWeight="600" textAnchor="middle">
                      {node.name}
                    </text>
                    <text x="0" y="54" fill="#98A5A2" fontSize="9.5" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">
                      {node.ip}
                    </text>

                    {/* Firewall policy indicator badge */}
                    {isFirewall && (
                      <g transform="translate(0, -32)">
                        <rect x="-42" y="-10" width="84" height="20" rx="3" fill="#080B0C" stroke={mode === 'tracert_tcp' ? '#D2F27C' : '#EF8A78'} strokeWidth="1" />
                        <text x="0" y="4" fill={mode === 'tracert_tcp' ? '#D2F27C' : '#EF8A78'} fontSize="9" fontFamily="IBM Plex Mono, monospace" textAnchor="middle">
                          {mode === 'tracert_tcp' ? 'PERMIT 443' : 'DROP ICMP'}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Live Hop Telemetry & Packet Dissection Deck */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Hop Output Log Table (7 Cols) */}
          <div className="lg:col-span-7 bg-[#080B0C] border border-[#283231] rounded-xl overflow-hidden p-4 space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#283231]">
              <span className="text-[#D2F27C] font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>Traceroute Execution Output</span>
              </span>
              <span className="text-[#98A5A2] text-[10px]">
                Target: {serverIp}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#98A5A2] text-[10px] uppercase border-b border-[#283231]/60">
                    <th className="py-2 px-2">Hop</th>
                    <th className="py-2 px-3">IP Address</th>
                    <th className="py-2 px-3">RTT</th>
                    <th className="py-2 px-3">Response Mechanism</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283231]/40 text-xs">
                  {activeHopLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[#98A5A2] text-xs">
                        Press <strong className="text-[#D2F27C]">"Auto Run Trace"</strong> or <strong className="text-[#EEF2EF]">"Next Hop"</strong> to trace packets.
                      </td>
                    </tr>
                  ) : (
                    activeHopLogs.map((log) => (
                      <tr key={log.hopNumber} className="hover:bg-[#151C1D]/50 transition-colors">
                        <td className="py-2.5 px-2 text-[#D2F27C] font-bold">
                          {log.hopNumber}
                        </td>
                        <td className="py-2.5 px-3 text-[#EEF2EF]">
                          {log.ip}
                        </td>
                        <td className="py-2.5 px-3">
                          {log.status === 'timeout' ? (
                            <span className="text-[#EF8A78] font-bold">* * *</span>
                          ) : (
                            <span className="text-[#D2F27C]">{log.rttMs} ms</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {log.status === 'timeout' ? (
                            <span className="text-[#EF8A78] text-[11px]">{log.responseType}</span>
                          ) : log.status === 'reached' ? (
                            <span className="text-[#D2F27C] text-[11px] font-semibold">{log.responseType}</span>
                          ) : (
                            <span className="text-[#98A5A2] text-[11px]">{log.responseType}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Terminal Command Syntax Snippet */}
            <div className="pt-2 border-t border-[#283231]/60 text-[11px] flex items-center justify-between text-[#98A5A2]">
              <span>Command run:</span>
              <code className="text-[#D2F27C] bg-[#151C1D] px-2 py-0.5 rounded border border-[#283231]">
                {mode === 'tracert_tcp'
                  ? `traceroute -T -p 443 ${serverIp}`
                  : mode === 'tracert_icmp'
                  ? `tracert ${serverIp} (or traceroute -I)`
                  : mode === 'icmp_ping'
                  ? `ping ${serverIp}`
                  : `traceroute ${serverIp}`}
              </code>
            </div>
          </div>

          {/* Right: Real-time Packet Dissection Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#080B0C] border border-[#283231] rounded-xl p-4 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#283231]">
              <span className="text-[#D2F27C] font-bold uppercase tracking-wider text-[11px]">
                Wire Packet Dissection
              </span>
              <span className="text-[10px] text-[#98A5A2]">
                Layer 3 / 4 PDU
              </span>
            </div>

            {/* Layer 3 IP Header */}
            <div className="p-3 rounded-lg bg-[#151C1D] border border-[#283231] space-y-2">
              <span className="text-[10px] text-[#98A5A2] uppercase block">
                IPv4 Header (Layer 3)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#98A5A2] block">TTL (Time to Live):</span>
                  <span className="text-[#D2F27C] font-bold">{currentTtl}</span>
                </div>
                <div>
                  <span className="text-[#98A5A2] block">Protocol Field:</span>
                  <span className="text-[#EEF2EF]">
                    {mode === 'tracert_tcp' ? '0x06 (TCP)' : '0x01 (ICMP)'}
                  </span>
                </div>
                <div>
                  <span className="text-[#98A5A2] block">Source IP:</span>
                  <span className="text-[#EEF2EF] truncate block">{clientIp}</span>
                </div>
                <div>
                  <span className="text-[#98A5A2] block">Destination IP:</span>
                  <span className="text-[#EEF2EF] truncate block">{serverIp}</span>
                </div>
              </div>
            </div>

            {/* Layer 4 / ICMP Protocol Header */}
            <div className="p-3 rounded-lg bg-[#151C1D] border border-[#283231] space-y-2">
              <span className="text-[10px] text-[#98A5A2] uppercase block">
                {mode === 'tracert_tcp' ? 'TCP Segment (Layer 4)' : 'ICMP Message (Layer 3.5)'}
              </span>
              {mode === 'tracert_tcp' ? (
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#98A5A2] block">Dest Port:</span>
                    <span className="text-[#D2F27C] font-bold">443 (HTTPS)</span>
                  </div>
                  <div>
                    <span className="text-[#98A5A2] block">Control Flags:</span>
                    <span className="text-[#EEF2EF] font-bold">[SYN]</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#98A5A2] block">Firewall Behavior:</span>
                    <span className="text-[#D2F27C]">Permitted by Web Policy ACL</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#98A5A2] block">Outbound Message:</span>
                    <span className="text-[#EEF2EF]">Type 8 (Echo Request)</span>
                  </div>
                  <div>
                    <span className="text-[#98A5A2] block">Expected Expiry:</span>
                    <span className="text-[#D2F27C]">Type 11 Code 0 (TTL-Exceeded)</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#98A5A2] block">Firewall Behavior:</span>
                    <span className="text-[#EF8A78]">Often blocked or dropped silently</span>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#98A5A2] leading-relaxed">
              When a router receives an IP packet, it decrements the TTL by 1. When TTL becomes 0, the router discards the packet and returns an ICMP Time Exceeded message to the sender.
            </p>
          </div>
        </div>
      </div>

      {/* Explainer: The Engineering Mechanics of Ping & Traceroute */}
      <div className="px-6 pb-6">
        <div className="p-5 bg-[#080B0C] border border-[#283231] rounded-xl space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D2F27C]" />
            <h3 className="text-sm font-bold text-[#EEF2EF] uppercase font-mono tracking-wider">
              Deep Dive: How ICMP Ping and Traceroute Function Under the Hood
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-[#98A5A2] leading-relaxed">
            {/* 1. How Ping Works */}
            <div className="p-4 rounded-lg bg-[#151C1D] border border-[#283231] space-y-2">
              <h4 className="font-bold text-[#EEF2EF] font-mono flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#D2F27C]" />
                <span>1. How Ping Works</span>
              </h4>
              <p>
                Ping operates purely on <strong>ICMP (Protocol 1)</strong> encapsulated in raw IP packets. It transmits an <strong>ICMP Echo Request (Type 8)</strong> with a timestamp and sequence number.
              </p>
              <p>
                When the target host's kernel receives it, it replies with an <strong>ICMP Echo Reply (Type 0)</strong>. Because ping contains no TCP or UDP port headers, it cannot verify whether port 443 is open or if Nginx is running!
              </p>
            </div>

            {/* 2. How Traceroute Works */}
            <div className="p-4 rounded-lg bg-[#151C1D] border border-[#283231] space-y-2">
              <h4 className="font-bold text-[#EEF2EF] font-mono flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-[#D2F27C]" />
                <span>2. The TTL Exploitation Trick</span>
              </h4>
              <p>
                Traceroute works by intentionally crafting IP packets that expire. It sends probe 1 with <strong>TTL=1</strong>. The first router decrements TTL to 0, drops the packet, and responds with <strong>ICMP Type 11 Code 0 (Time to Live Exceeded)</strong>.
              </p>
              <p>
                Next, it sends probe 2 with <strong>TTL=2</strong>, reaching the second router before expiring. By incrementing TTL one by one, traceroute maps every router hop along the path.
              </p>
            </div>

            {/* 3. Why TCP Traceroute is King */}
            <div className="p-4 rounded-lg bg-[#151C1D] border border-[#283231] space-y-2">
              <h4 className="font-bold text-[#EEF2EF] font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D2F27C]" />
                <span>3. Why TCP Traceroute is Critical</span>
              </h4>
              <p>
                Standard Windows <code className="text-[#EEF2EF] font-mono">tracert</code> uses ICMP, and Linux uses UDP. Both frequently hit firewalls that silently drop the probes, resulting in endless <code className="text-[#EF8A78] font-mono">* * *</code> lines.
              </p>
              <p>
                <strong className="text-[#D2F27C]">TCP Traceroute (-T -p 443)</strong> sends real TCP SYN packets targeting HTTPS port 443. Firewalls permit it through because web traffic is authorized, revealing the true path right to the application daemon!
              </p>
            </div>
          </div>

          {/* Side-by-Side Comparison Matrix */}
          <div className="overflow-x-auto rounded-lg border border-[#283231]">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#151C1D] text-[#98A5A2] text-[10px] uppercase border-b border-[#283231]">
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Transport Protocol</th>
                  <th className="py-2.5 px-3">Probe Header</th>
                  <th className="py-2.5 px-3">Firewall Traversal</th>
                  <th className="py-2.5 px-3">Best Used For</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#283231] text-[#98A5A2]">
                <tr className="hover:bg-[#151C1D]/50">
                  <td className="py-2.5 px-3 font-bold text-[#EEF2EF]">Ping</td>
                  <td className="py-2.5 px-3 text-[#D2F27C]">ICMP (Proto 1)</td>
                  <td className="py-2.5 px-3">Type 8 (Echo)</td>
                  <td className="py-2.5 px-3">Permitted on basic networks; blocked on hardened DMZ</td>
                  <td className="py-2.5 px-3">Basic Layer 3 reachability & packet loss check</td>
                </tr>
                <tr className="hover:bg-[#151C1D]/50">
                  <td className="py-2.5 px-3 font-bold text-[#EEF2EF]">ICMP Traceroute</td>
                  <td className="py-2.5 px-3 text-[#D2F27C]">ICMP (Proto 1)</td>
                  <td className="py-2.5 px-3">Type 8 (TTL 1..N)</td>
                  <td className="py-2.5 px-3 text-[#EF8A78]">Frequently blocked by stateful firewalls (* * *)</td>
                  <td className="py-2.5 px-3">Quick internal LAN routing discovery (Windows default)</td>
                </tr>
                <tr className="hover:bg-[#151C1D]/50">
                  <td className="py-2.5 px-3 font-bold text-[#EEF2EF]">TCP Traceroute</td>
                  <td className="py-2.5 px-3 text-[#D2F27C]">TCP (Proto 6)</td>
                  <td className="py-2.5 px-3">TCP SYN :443 / :80</td>
                  <td className="py-2.5 px-3 text-[#D2F27C]">Bypasses firewall filtering that permits web traffic</td>
                  <td className="py-2.5 px-3 font-bold text-[#EEF2EF]">Diagnosing web application connectivity failures</td>
                </tr>
                <tr className="hover:bg-[#151C1D]/50">
                  <td className="py-2.5 px-3 font-bold text-[#EEF2EF]">UDP Traceroute</td>
                  <td className="py-2.5 px-3 text-[#D2F27C]">UDP (Proto 17)</td>
                  <td className="py-2.5 px-3">High Port 33434+</td>
                  <td className="py-2.5 px-3 text-[#EF8A78]">Almost always blocked by modern perimeter firewalls</td>
                  <td className="py-2.5 px-3">Classic Unix / Cisco core router path discovery</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
