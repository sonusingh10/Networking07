import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Trash2, HelpCircle, CornerDownLeft } from 'lucide-react';
import { TroubleshootingStep } from '../types/network';

interface TerminalSimulatorProps {
  currentStep: TroubleshootingStep;
  onSelectStepById: (id: number) => void;
  clientIp: string;
  serverIp: string;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  currentStep,
  onSelectStepById,
  clientIp,
  serverIp
}) => {
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: `ping ${serverIp} -c 4`,
      output: `PING ${serverIp} (${serverIp}) 56(84) bytes of data from ${clientIp}.
64 bytes from ${serverIp}: icmp_seq=1 ttl=58 time=2.14 ms
64 bytes from ${serverIp}: icmp_seq=2 ttl=58 time=2.08 ms
64 bytes from ${serverIp}: icmp_seq=3 ttl=58 time=2.11 ms
64 bytes from ${serverIp}: icmp_seq=4 ttl=58 time=2.05 ms

--- ${serverIp} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 2.050/2.095/2.140/0.034 ms

[OK] ICMP Layer 3 IP Reachability to ${serverIp} Confirmed.`,
      timestamp: '02:20:01',
      status: 'success'
    },
    {
      id: 'init-2',
      command: `nc -zv -w 3 ${serverIp} 443`,
      output: `nc: connect to ${serverIp} port 443 (tcp) timed out: Operation in progress
[ERR] Port 443 TCP unreachable! Ping works (L3), but higher-layer application (L4) fails.`,
      timestamp: '02:20:06',
      status: 'error'
    }
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmdText: string) => {
    const clean = cmdText.trim();
    if (!clean) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    let output = '';
    let status: 'success' | 'warning' | 'error' = 'warning';

    const lower = clean.toLowerCase();

    if (lower.includes('help')) {
      output = `7LayerX Diagnostic Commands:
  • ping ${serverIp}                 (Layer 3 ICMP reachability)
  • nc -zv ${serverIp} 443           (Layer 4 TCP port probe)
  • nslookup example.com             (Layer 7 DNS resolution)
  • show access-lists                (Layer 4 firewall policy lookup)
  • traceroute -T ${serverIp}        (Bidirectional routing path)
  • ping -M do -s 1472 ${serverIp}   (MTU & packet fragmentation)
  • openssl s_client -connect ...    (Layer 6 TLS handshake inspection)
  • systemctl status nginx           (Application daemon state)
  • clear                            (Clear buffer)`;
      status = 'success';
    } else if (lower === 'clear' || lower === 'cls') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower.includes('nslookup') || lower.includes('dig')) {
      output = `Server:         1.1.1.1
Address:        1.1.1.1#53

Non-authoritative answer:
Name:   example.com
Address: ${serverIp}

DNS resolved successfully to ${serverIp}.`;
      status = 'success';
      onSelectStepById(1);
    } else if (lower.includes('nc') || lower.includes('telnet') || lower.includes('test-netconnection')) {
      output = `nc: connect to ${serverIp} port 443 (tcp) failed: Connection timed out
[!] Firewall policy silently dropping TCP SYN packets towards ${serverIp}.`;
      status = 'error';
      onSelectStepById(2);
    } else if (lower.includes('access-list') || lower.includes('firewall') || lower.includes('iptables')) {
      output = `access-list OUTSIDE_IN hits:
  10 permit icmp any host ${serverIp} (hitcnt=248) -> [PERMITTED]
  20 deny tcp any host ${serverIp} eq 443 (hitcnt=104) -> [DENIED BY ACL RULE 20]`;
      status = 'error';
      onSelectStepById(3);
    } else if (lower.includes('traceroute') || lower.includes('tracert') || lower.includes('mtr')) {
      output = `traceroute to ${serverIp} (${serverIp}), 30 hops max:
 1  gw-local (10.20.4.1)     0.64 ms
 2  edge-rtr (172.16.0.1)    1.12 ms
 3  fw-perimeter (10.0.0.1)  * * * (Stateful drop on return path)`;
      status = 'warning';
      onSelectStepById(4);
    } else if (lower.includes('1472') || lower.includes('mtu') || lower.includes('frag')) {
      output = `PING ${serverIp} (${serverIp}) 1472(1500) bytes of data.
From 172.16.0.1 icmp_seq=1 Frag needed and DF set (mtu = 1460)
[!] Packet dropped: Payload exceeds Path MTU threshold.`;
      status = 'error';
      onSelectStepById(5);
    } else if (lower.includes('openssl') || lower.includes('cert') || lower.includes('tls')) {
      output = `CONNECTED(00000003)
depth=0 CN = example.com
verify error:num=10:certificate has expired
notAfter=Oct 10 00:00:00 2026 GMT
[!] TLS Handshake Aborted: Certificate Expired on ${serverIp}.`;
      status = 'error';
      onSelectStepById(6);
    } else if (lower.includes('systemctl') || lower.includes('nginx') || lower.includes('apache')) {
      output = `● nginx.service - Web Server Daemon on ${serverIp}
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
   Active: failed (Result: exit-code)
   Error: bind() to 0.0.0.0:443 failed (Address already in use)`;
      status = 'error';
      onSelectStepById(8);
    } else if (lower.includes('ping')) {
      output = `PING ${serverIp} (${serverIp}) 56(84) bytes of data.
64 bytes from ${serverIp}: icmp_seq=1 ttl=58 time=2.12 ms
64 bytes from ${serverIp}: icmp_seq=2 ttl=58 time=2.09 ms
[✓] ICMP ping passes, but TCP/UDP higher-layer ports may still be blocked!`;
      status = 'success';
    } else {
      output = `Executed: ${clean}\nDiagnostic code: Exit 0 (Type 'help' for command list)`;
      status = 'warning';
    }

    setHistory(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        command: clean,
        output,
        timestamp: timeStr,
        status
      }
    ]);

    setInputVal('');
  };

  const handleRunPreset = (cmd: string) => {
    executeCommand(cmd);
  };

  return (
    <div className="bg-[#080B0C] border border-[#283231] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
      {/* Title Bar */}
      <div className="bg-[#101516] px-4 py-3 border-b border-[#283231] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#283231] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#283231] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#D2F27C] inline-block" />
          </div>
          <span className="text-[#283231]">|</span>
          <div className="flex items-center gap-2 text-xs font-mono text-[#98A5A2]">
            <TerminalIcon className="w-3.5 h-3.5 text-[#D2F27C]" />
            <span>noc@7layerx:~$ ({clientIp} → {serverIp})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunPreset('help')}
            className="text-[11px] font-mono text-[#98A5A2] hover:text-[#EEF2EF] px-2 py-0.5 rounded bg-[#151C1D] border border-[#283231] flex items-center gap-1 transition-colors"
          >
            <HelpCircle className="w-3 h-3 text-[#D2F27C]" />
            <span>help</span>
          </button>
          <button
            onClick={() => setHistory([])}
            className="text-[11px] font-mono text-[#98A5A2] hover:text-[#EF8A78] px-2 py-0.5 rounded bg-[#151C1D] border border-[#283231] flex items-center gap-1 transition-colors"
            title="Clear buffer"
          >
            <Trash2 className="w-3 h-3" />
            <span>clear</span>
          </button>
        </div>
      </div>

      {/* Quick Diagnostic Presets Bar */}
      <div className="px-4 py-2 bg-[#101516]/60 border-b border-[#283231] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
        <span className="text-[#98A5A2] shrink-0">Probes:</span>
        <button
          onClick={() => handleRunPreset(`ping ${serverIp} -c 4`)}
          className="px-2 py-0.5 rounded bg-[#151C1D] hover:bg-[#283231] text-[#D2F27C] border border-[#283231] shrink-0"
        >
          ping
        </button>
        <button
          onClick={() => handleRunPreset(`nc -zv ${serverIp} 443`)}
          className="px-2 py-0.5 rounded bg-[#151C1D] hover:bg-[#283231] text-[#EEF2EF] border border-[#283231] shrink-0"
        >
          nc :443
        </button>
        <button
          onClick={() => handleRunPreset('show access-lists')}
          className="px-2 py-0.5 rounded bg-[#151C1D] hover:bg-[#283231] text-[#EEF2EF] border border-[#283231] shrink-0"
        >
          show access-lists
        </button>
        <button
          onClick={() => handleRunPreset(`ping -M do -s 1472 ${serverIp}`)}
          className="px-2 py-0.5 rounded bg-[#151C1D] hover:bg-[#283231] text-[#EEF2EF] border border-[#283231] shrink-0"
        >
          mtu 1472
        </button>
        <button
          onClick={() => handleRunPreset(`openssl s_client -connect ${serverIp}:443`)}
          className="px-2 py-0.5 rounded bg-[#151C1D] hover:bg-[#283231] text-[#EEF2EF] border border-[#283231] shrink-0"
        >
          openssl
        </button>
        <button
          onClick={() => handleRunPreset('systemctl status nginx')}
          className="px-2 py-0.5 rounded bg-[#151C1D] hover:bg-[#283231] text-[#EEF2EF] border border-[#283231] shrink-0"
        >
          daemon (L7)
        </button>
      </div>

      {/* Terminal Screen Body */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-4 text-[#EEF2EF]">
        <div className="text-[#98A5A2] text-[11px] leading-relaxed">
          7LayerX Shell · Target: {serverIp} · Source: {clientIp}
          <br />Verify reachability layer-by-layer. Type 'help' or run preset probes.
        </div>

        {history.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#98A5A2] text-[10px]">[{item.timestamp}]</span>
              <span className="text-[#D2F27C]">$</span>
              <span className="font-bold text-[#EEF2EF]">{item.command}</span>
            </div>
            <pre className={`p-3 rounded-lg border text-[11px] leading-relaxed whitespace-pre-wrap ${
              item.status === 'success'
                ? 'bg-[#101516] border-[#D2F27C]/30 text-[#D2F27C]'
                : item.status === 'error'
                ? 'bg-[#101516] border-[#EF8A78]/30 text-[#EF8A78]'
                : 'bg-[#101516] border-[#283231] text-[#98A5A2]'
            }`}>
              {item.output}
            </pre>
          </div>
        ))}
        <div ref={terminalBottomRef} />
      </div>

      {/* Terminal Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          executeCommand(inputVal);
        }}
        className="p-3 bg-[#101516] border-t border-[#283231] flex items-center gap-2"
      >
        <span className="text-[#D2F27C] font-mono font-bold">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Enter diagnostic command (e.g. nc -zv ${serverIp} 443)...`}
          className="flex-1 bg-transparent text-[#EEF2EF] font-mono text-xs focus:outline-none placeholder:text-[#98A5A2]/40"
        />
        <button
          type="submit"
          className="px-3 py-1 rounded-md bg-[#151C1D] border border-[#283231] hover:border-[#D2F27C] text-[#EEF2EF] font-mono text-xs flex items-center gap-1 transition-colors"
        >
          <span>Run</span>
          <CornerDownLeft className="w-3 h-3 text-[#D2F27C]" />
        </button>
      </form>
    </div>
  );
};
