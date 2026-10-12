import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  ShieldCheck, 
  Radio, 
  Lock, 
  Split, 
  Maximize, 
  Sliders, 
  Settings2,
  BookmarkCheck
} from 'lucide-react';
import { COMMON_REASONS, COMMON_PORTS } from '../data/networkData';

const REASON_ICONS: Record<string, React.ReactNode> = {
  protocols: <Layers className="w-3.5 h-3.5 text-[#D2F27C]" />,
  firewall: <ShieldCheck className="w-3.5 h-3.5 text-[#EF8A78]" />,
  dns: <Radio className="w-3.5 h-3.5 text-[#D2F27C]" />,
  service_down: <Settings2 className="w-3.5 h-3.5 text-[#EF8A78]" />,
  tls: <Lock className="w-3.5 h-3.5 text-[#D2F27C]" />,
  routing: <Split className="w-3.5 h-3.5 text-[#98A5A2]" />,
  mtu: <Maximize className="w-3.5 h-3.5 text-[#EF8A78]" />,
  proxy: <Sliders className="w-3.5 h-3.5 text-[#98A5A2]" />,
  app_config: <AlertTriangle className="w-3.5 h-3.5 text-[#EF8A78]" />
};

export const ReasonsAndTakeaways: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* 1. Common Reasons Table */}
      <div className="bg-[#101516] border border-[#283231] rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-[#080B0C] px-6 py-4 border-b border-[#283231] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#151C1D] border border-[#283231] text-[#D2F27C]">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#EEF2EF] tracking-tight">
                Why Ping Works but the Application Fails
              </h2>
              <p className="text-xs text-[#98A5A2] font-mono">
                Comparative failure vectors across the OSI stack
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#283231] bg-[#080B0C]/60 text-[#98A5A2] uppercase tracking-wider font-mono text-[10px]">
                <th className="py-3 px-4 w-1/4">Reason</th>
                <th className="py-3 px-4 w-1/6">Layer</th>
                <th className="py-3 px-4 w-7/12">Technical Root Cause & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#283231] text-[#98A5A2]">
              {COMMON_REASONS.map((item) => (
                <tr key={item.id} className="hover:bg-[#151C1D]/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#EEF2EF] flex items-center gap-2.5">
                    <span className="p-1 rounded bg-[#080B0C] border border-[#283231] shrink-0">
                      {REASON_ICONS[item.id]}
                    </span>
                    <span>{item.reason}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#D2F27C]">
                    {item.protocolLayer}
                  </td>
                  <td className="py-3 px-4 leading-relaxed font-sans">
                    <p className="text-[#EEF2EF]/90">{item.details}</p>
                    <p className="text-[11px] font-mono text-[#98A5A2] mt-0.5">
                      <span className="text-[#D2F27C]">Action:</span> {item.actionItem}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Key Takeaways & Common Ports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Takeaways */}
        <div className="lg:col-span-2 bg-[#101516] border border-[#283231] rounded-2xl overflow-hidden shadow-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 text-[#D2F27C] font-bold mb-4">
              <div className="p-2 rounded-lg bg-[#151C1D] border border-[#283231]">
                <BookmarkCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#EEF2EF]">
                Core Engineering Takeaways
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080B0C] border border-[#283231]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D2F27C] shrink-0 mt-1.5" />
                <p className="text-[#98A5A2]">
                  <strong className="text-[#EEF2EF]">Ping only proves Layer 3 connectivity:</strong> Basic IP packet routing and ICMP reachability are intact.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080B0C] border border-[#283231]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D2F27C] shrink-0 mt-1.5" />
                <p className="text-[#98A5A2]">
                  <strong className="text-[#EEF2EF]">Application connectivity depends on:</strong> DNS + Bidirectional Routing + TCP/UDP Ports + Firewall ACLs + Path MTU + TLS/SSL + Application Daemons.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#080B0C] border border-[#283231]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D2F27C] shrink-0 mt-1.5" />
                <p className="text-[#98A5A2]">
                  <strong className="text-[#EEF2EF]">Troubleshoot layer-by-layer:</strong> Ascend methodically from Physical/Link to Network, Transport, and Application layers.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#151C1D] border border-[#EF8A78]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF8A78] shrink-0 mt-1.5" />
                <p className="text-[#EF8A78] font-mono text-[11px]">
                  <strong>Key Takeaway:</strong> A successful ping does NOT mean the application will work.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Application Ports Cheat Sheet */}
        <div className="bg-[#101516] border border-[#283231] rounded-2xl overflow-hidden shadow-xl p-6">
          <div className="flex items-center gap-2.5 text-[#D2F27C] font-bold mb-4">
            <div className="p-2 rounded-lg bg-[#151C1D] border border-[#283231]">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-[#EEF2EF]">
              Common Application Ports
            </h3>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#283231]">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-[#080B0C] text-[#98A5A2] text-[10px] uppercase border-b border-[#283231]">
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Protocol / Port</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#283231] text-[#98A5A2]">
                {COMMON_PORTS.map((p) => (
                  <tr key={p.protocol} className="hover:bg-[#151C1D]/60">
                    <td className="py-2 px-3 font-semibold text-[#EEF2EF]">
                      {p.protocol}
                    </td>
                    <td className="py-2 px-3 text-[#D2F27C]">
                      {p.port}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] font-mono text-[#98A5A2] mt-3 leading-relaxed">
            Unlike ICMP, firewall state engines inspect and enforce access control on these exact Layer 4 port tuples.
          </p>
        </div>
      </div>
    </div>
  );
};
