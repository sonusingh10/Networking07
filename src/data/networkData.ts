import { 
  NetworkNode, 
  SimulationScenario, 
  TroubleshootingStep, 
  CommonReason, 
  AppPort,
  OsiLayerInfo 
} from '../types/network';

export const DEFAULT_CLIENT_IP = '10.20.4.15';
export const DEFAULT_SERVER_IP = '198.51.100.25';

export const IP_PRESETS = [
  {
    name: 'Public Cloud / Web Service',
    clientIp: '10.20.4.15',
    serverIp: '198.51.100.25',
    description: 'Corporate LAN client to external cloud application'
  },
  {
    name: 'Enterprise Data Center',
    clientIp: '10.24.100.45',
    serverIp: '10.100.4.80',
    description: 'Internal workstation to private datacenter server'
  },
  {
    name: 'AWS / Multi-VPC Transit',
    clientIp: '172.16.5.20',
    serverIp: '34.120.55.90',
    description: 'Branch office to cloud hosted web cluster'
  },
  {
    name: 'Branch to HQ DMZ',
    clientIp: '192.168.100.42',
    serverIp: '172.28.16.80',
    description: 'Remote branch to DMZ application perimeter'
  }
];

export const getNetworkNodes = (clientIp: string = DEFAULT_CLIENT_IP, serverIp: string = DEFAULT_SERVER_IP): NetworkNode[] => [
  {
    id: 'client',
    name: 'Client Workstation',
    role: 'Originating Host',
    ip: clientIp,
    x: 75,
    y: 110,
    icon: 'client',
    layer: 7,
    details: `Initiates ICMP Echo Requests and HTTPS TCP Handshake towards ${serverIp}.`
  },
  {
    id: 'switch',
    name: 'Access Switch',
    role: 'Layer 2 Switching',
    ip: 'VLAN 100',
    x: 235,
    y: 110,
    icon: 'switch',
    layer: 2,
    details: 'Switches Ethernet frames based on destination MAC addresses without inspecting L3/L4 headers.'
  },
  {
    id: 'router',
    name: 'Edge Router',
    role: 'Layer 3 Gateway',
    ip: '10.20.4.1',
    x: 395,
    y: 110,
    icon: 'router',
    layer: 3,
    details: 'Default gateway. Inspects IP packet headers (Layer 3) and performs route lookup towards destination subnet.'
  },
  {
    id: 'firewall',
    name: 'Perimeter Firewall',
    role: 'Stateful Inspection',
    ip: 'Policy Engine',
    x: 555,
    y: 110,
    icon: 'firewall',
    layer: 4,
    details: `Enforces security ACLs. Configured to permit ICMP Echo (ping) but restricting application TCP ports towards ${serverIp}.`
  },
  {
    id: 'internet',
    name: 'WAN / Transit',
    role: 'Backbone Fabric',
    ip: 'Public AS Path',
    x: 715,
    y: 110,
    icon: 'internet',
    layer: 3,
    details: 'Backbone routing path across transit providers. Carries IP packets across autonomous systems.'
  },
  {
    id: 'server',
    name: 'Application Server',
    role: 'Target Web Host',
    ip: serverIp,
    x: 875,
    y: 110,
    icon: 'server',
    layer: 7,
    details: `Target host hosting HTTPS daemon on port 443 and responding to OS kernel ICMP echo requests on ${serverIp}.`
  }
];

export const NETWORK_NODES: NetworkNode[] = getNetworkNodes();

export const getScenarios = (serverIp: string = DEFAULT_SERVER_IP): SimulationScenario[] => [
  {
    id: 'firewall_blocked',
    title: 'Firewall Blocking TCP Port 443 (The Classic)',
    shortLabel: 'Firewall Policy Block',
    description: `ICMP Echo is permitted by perimeter firewall policy, but TCP port 443 (HTTPS) towards ${serverIp} is dropped.`,
    failingComponent: 'Perimeter Firewall',
    osiLayer: 4,
    pingResult: 'success',
    appResult: 'blocked',
    dropAtNodeId: 'firewall',
    dropMessage: `DROPPED: ACL deny tcp any host ${serverIp} eq 443`,
    recommendedStep: 3
  },
  {
    id: 'dns_failure',
    title: 'DNS Resolution Failure / Stale Record',
    shortLabel: 'DNS Misresolution',
    description: `Ping to direct IP (${serverIp}) works, but application hostname points to a wrong or nonexistent record.`,
    failingComponent: 'Client DNS Resolver',
    osiLayer: 7,
    pingResult: 'success',
    appResult: 'dns_err',
    dropAtNodeId: 'client',
    dropMessage: 'NXDOMAIN / Hostname unreachable before transmission',
    recommendedStep: 1
  },
  {
    id: 'mtu_drop',
    title: 'MTU Black Hole / Fragmentation Dropped',
    shortLabel: 'MTU / Jumbo Packet Drop',
    description: `Small 64-byte ICMP ping packets pass to ${serverIp}, but 1500-byte TLS packets get dropped by a router with DF bit set.`,
    failingComponent: 'Edge Router (MTU 1492 / Tunnel)',
    osiLayer: 3,
    pingResult: 'success',
    appResult: 'timeout',
    dropAtNodeId: 'router',
    dropMessage: 'ICMP Type 3 Code 4: Fragmentation Needed and DF set',
    recommendedStep: 5
  },
  {
    id: 'tls_failure',
    title: 'TLS/SSL Certificate Expired or Cipher Mismatch',
    shortLabel: 'TLS Handshake Error',
    description: `TCP 3-way handshake to ${serverIp}:443 succeeds, but the TLS negotiation aborts due to an expired certificate.`,
    failingComponent: 'Application Server (Crypto / TLS Engine)',
    osiLayer: 6,
    pingResult: 'success',
    appResult: 'ssl_err',
    dropAtNodeId: 'server',
    dropMessage: 'TLS Alert: Handshake Failure (certificate_expired)',
    recommendedStep: 6
  },
  {
    id: 'app_down',
    title: 'Application Service Down / Port Closed',
    shortLabel: 'Service Inactive / 502',
    description: `The host ${serverIp} responds to ICMP ping, but the web service (Nginx/Node) is crashed and not listening on port 443.`,
    failingComponent: 'Application Daemon (Port 443)',
    osiLayer: 7,
    pingResult: 'success',
    appResult: 'reset',
    dropAtNodeId: 'server',
    dropMessage: 'TCP RST-ACK received: Connection Refused',
    recommendedStep: 8
  },
  {
    id: 'asymmetric_routing',
    title: 'Asymmetric Routing Return Path Blocked',
    shortLabel: 'Asymmetric Return Drop',
    description: `Outbound TCP SYN reaches ${serverIp}, but the return SYN-ACK takes an alternate router where the stateful firewall drops it.`,
    failingComponent: 'Return Routing / Firewall State Table',
    osiLayer: 3,
    pingResult: 'success',
    appResult: 'timeout',
    dropAtNodeId: 'firewall',
    dropMessage: 'TCP State Violation: Out-of-state packet dropped',
    recommendedStep: 4
  },
  {
    id: 'all_healthy',
    title: 'End-to-End Healthy (Ping & Application OK)',
    shortLabel: 'All Systems Operational',
    description: `Both ICMP ping echo and application TCP/TLS streams complete round-trips to ${serverIp} successfully.`,
    failingComponent: 'None',
    osiLayer: 7,
    pingResult: 'success',
    appResult: 'success',
    dropMessage: 'HTTP/2 200 OK received with valid payload',
    recommendedStep: 1
  }
];

export const SCENARIOS: SimulationScenario[] = getScenarios();

export const getTroubleshootingSteps = (serverIp: string = DEFAULT_SERVER_IP): TroubleshootingStep[] => [
  {
    id: 1,
    title: 'Check DNS Resolution',
    description: 'Verify the domain name resolves to the correct IP address.',
    layer: 'Layer 7 (Application)',
    layerNumber: 7,
    commands: [
      { os: 'Cross-platform', command: 'nslookup example.com' },
      { os: 'Linux / macOS', command: 'dig +short example.com' },
      { os: 'PowerShell', command: 'Resolve-DnsName example.com' }
    ],
    explanation: `If users access the application using a hostname, verify that it resolves to ${serverIp}. If accessing directly by IP works but the hostname fails, DNS is the root cause.`,
    whatToLookFor: `Check if the returned IP matches ${serverIp}. Look out for NXDOMAIN, DNS timeouts, or stale CDN anycast IPs.`,
    simulatedOutput: `$ nslookup example.com
Server:         1.1.1.1
Address:        1.1.1.1#53

Non-authoritative answer:
Name:   example.com
Address: ${serverIp}
`
  },
  {
    id: 2,
    title: 'Check Port Connectivity',
    description: 'Ping only checks ICMP. Applications require specific TCP or UDP ports.',
    layer: 'Layer 4 (Transport)',
    layerNumber: 4,
    commands: [
      { os: 'Linux / macOS', command: `nc -zv ${serverIp} 443` },
      { os: 'Windows PowerShell', command: `Test-NetConnection ${serverIp} -Port 443` },
      { os: 'Legacy / Telnet', command: `telnet ${serverIp} 443` }
    ],
    explanation: 'Ping uses ICMP (protocol 1), which has no port numbers. Web servers listen on TCP 80/443, SSH on 22, RDP on 3389. Test whether the socket can actually establish a TCP 3-way handshake.',
    whatToLookFor: 'Look for "Connection refused" (port closed on host) vs "Connection timed out" (firewall dropping packets silently).',
    simulatedOutput: `$ nc -zv -w 3 ${serverIp} 443
nc: connect to ${serverIp} port 443 (tcp) timed out: Operation now in progress
[!] Port 443 unreachable despite 0% ICMP packet loss!`
  },
  {
    id: 3,
    title: 'Verify Firewall Rules',
    description: 'Ensure firewalls allow the required application ports.',
    layer: 'Layer 4 / Layer 7 (Firewall Policy)',
    layerNumber: 4,
    commands: [
      { os: 'Cisco IOS / ASA', command: `show access-lists | include ${serverIp}` },
      { os: 'Palo Alto Networks', command: `test security-policy-match from Trust to DMZ destination ${serverIp} port 443` },
      { os: 'Linux iptables/nft', command: 'sudo iptables -L -v -n | grep 443' }
    ],
    explanation: `Firewalls frequently permit ICMP for diagnostics while denying unauthorized ports. Check policies along the path: Client → Switch → Router → Firewall → ${serverIp}.`,
    whatToLookFor: 'Check hit counters on deny rules or implicit deny rules at the bottom of the ACL table.',
    simulatedOutput: `# show access-lists OUTSIDE_IN
Extended IP access list OUTSIDE_IN
 10 permit icmp any host ${serverIp} echo (142 matches) [PERMITTED]
 20 deny tcp any host ${serverIp} eq 443 (589 matches)  [BLOCKED BY RULE 20]`
  },
  {
    id: 4,
    title: 'Check Routing (Both Directions)',
    description: 'Ensure the return path is valid and there is no asymmetric routing.',
    layer: 'Layer 3 (Network)',
    layerNumber: 3,
    commands: [
      { os: 'Linux / macOS', command: `traceroute -T -p 443 ${serverIp}` },
      { os: 'Interactive MTR', command: `mtr --tcp --port 443 ${serverIp}` },
      { os: 'Windows', command: `tracert -d ${serverIp}` }
    ],
    explanation: 'Traffic reaching the server is only half the journey. The server must have a valid return route back to the client. Asymmetric routing drops packets on stateful firewalls that only see one direction.',
    whatToLookFor: 'Discrepancies between ICMP traceroute and TCP traceroute, and packet loss specifically on return hops.',
    simulatedOutput: `$ traceroute -T -p 443 ${serverIp}
traceroute to ${serverIp} (${serverIp}), 30 hops max, 60 byte packets
 1  gw-local (10.20.4.1)     0.842 ms  0.710 ms
 2  edge-rtr (172.16.0.1)    1.215 ms  1.102 ms
 3  fw-perimeter (10.0.0.1)  * * * (Dropped by state table)`
  },
  {
    id: 5,
    title: 'Check MTU / Fragmentation',
    description: 'Large packets may be dropped, affecting application traffic.',
    layer: 'Layer 3 / Layer 2 (MTU / MSS)',
    layerNumber: 3,
    commands: [
      { os: 'Linux', command: `ping -M do -s 1472 ${serverIp}` },
      { os: 'Windows', command: `ping ${serverIp} -f -l 1472` },
      { os: 'macOS', command: `ping -D -s 1472 ${serverIp}` }
    ],
    explanation: 'Standard ping sends small 32–64 byte ICMP packets. Application packets (like TLS certificates or HTTP headers) often fill the full 1500-byte MTU. If a VPN/tunnel reduces MTU and drops ICMP Type 3 Code 4 (PMTUD), application traffic hangs.',
    whatToLookFor: '"Packet needs to be fragmented but DF set". If ping works at 1400 bytes but fails at 1472, MTU clamping is required.',
    simulatedOutput: `$ ping -M do -s 1472 ${serverIp}
PING ${serverIp} (${serverIp}) 1472(1500) bytes of data.
From 172.16.0.1 icmp_seq=1 Frag needed and DF set (mtu = 1460)
--- ${serverIp} ping statistics ---
1 packets transmitted, 0 received, +1 errors, 100% packet loss`
  },
  {
    id: 6,
    title: 'Verify TLS/SSL (for HTTPS)',
    description: 'Check certificate issues, TLS handshake failures, or unsupported versions.',
    layer: 'Layer 6 (Presentation)',
    layerNumber: 6,
    commands: [
      { os: 'OpenSSL Client', command: `openssl s_client -connect ${serverIp}:443 -servername example.com` },
      { os: 'cURL Verbose', command: `curl -Iv https://${serverIp} --resolve example.com:443:${serverIp}` },
      { os: 'Cert Inspection', command: 'openssl x509 -noout -dates -issuer -subject' }
    ],
    explanation: 'For HTTPS applications, TCP 443 being reachable does not guarantee that the TLS handshake will succeed. Certificate expiration, SNI mismatch, or cipher-suite incompatibilities kill the session.',
    whatToLookFor: 'Verify "Verify return code: 0 (ok)". Watch for "certificate has expired" or "handshake failure".',
    simulatedOutput: `$ openssl s_client -connect ${serverIp}:443 -servername example.com
CONNECTED(00000003)
depth=0 CN = example.com
verify error:num=10:certificate has expired
notAfter=Oct 10 00:00:00 2026 GMT
verify return:1
---
Certificate expired 2 days ago. Client browser refuses connection.`
  },
  {
    id: 7,
    title: 'Check Proxy or Application Settings',
    description: 'Ensure correct proxy configuration and security filtering policies.',
    layer: 'Layer 7 (Application / Gateway)',
    layerNumber: 7,
    commands: [
      { os: 'cURL with Proxy', command: 'curl -x http://proxy.corp:8080 -I https://example.com' },
      { os: 'Inspect Env Vars', command: 'echo $http_proxy $https_proxy $no_proxy' },
      { os: 'Windows Netsh', command: 'netsh winhttp show proxy' }
    ],
    explanation: 'Corporate proxies, URL filtering, WAF (Web Application Firewall), or client browser PAC scripts can intercept or drop application traffic while raw ICMP bypasses proxies entirely.',
    whatToLookFor: '407 Proxy Authentication Required, 403 Forbidden by Corporate Policy, or misconfigured localhost proxies.',
    simulatedOutput: `$ curl -I https://example.com
HTTP/1.1 403 Forbidden
X-Squid-Error: ERR_ACCESS_DENIED 0
Server: Corporate-Secure-Web-Gateway
Description: Category 'Uncategorized' blocked by corporate firewall profile.`
  },
  {
    id: 8,
    title: 'Verify The Application Service',
    description: 'Ensure the service is running and listening on the server IP & port.',
    layer: 'Layer 7 (Application Host)',
    layerNumber: 7,
    commands: [
      { os: 'Linux Systemd', command: 'sudo systemctl status nginx' },
      { os: 'Listening Ports', command: 'sudo ss -tulpn | grep -E "80|443"' },
      { os: 'App Logs', command: 'sudo journalctl -u nginx -n 50 --no-pager' }
    ],
    explanation: 'The server host might be powered on and its kernel responding to ICMP, but the web daemon (Nginx, Apache, Node, IIS) crashed, stopped, or is only bound to 127.0.0.1 instead of 0.0.0.0.',
    whatToLookFor: 'Look for "Active: failed", syntax errors in configuration files, or socket binding on localhost only.',
    simulatedOutput: `$ sudo systemctl status nginx
● nginx.service - A high performance web server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
   Active: failed (Result: exit-code) since Mon 2026-10-12 01:14:02 UTC
  Process: 14892 ExecStartPre=/usr/sbin/nginx -t (code=exited, status=1/FAILURE)
   Status: "nginx: [emerg] bind() to 0.0.0.0:443 failed (Address already in use)"`
  }
];

export const TROUBLESHOOTING_STEPS: TroubleshootingStep[] = getTroubleshootingSteps();

export const COMMON_REASONS: CommonReason[] = [
  {
    id: 'protocols',
    reason: 'Different Protocols',
    protocolLayer: 'Layer 3 vs Layer 4',
    details: 'Ping uses ICMP (Protocol 1), whereas applications use TCP (6) or UDP (17).',
    actionItem: 'Test port 443 with netcat or telnet rather than relying on ping.'
  },
  {
    id: 'firewall',
    reason: 'Firewall Blocking Ports',
    protocolLayer: 'Layer 4 Security',
    details: 'Firewalls permit ICMP echo for basic network diagnostics while blocking application ports.',
    actionItem: 'Verify security policy ACLs on routers and firewalls.'
  },
  {
    id: 'dns',
    reason: 'DNS Issues',
    protocolLayer: 'Layer 7 Resolution',
    details: 'Domain resolves to wrong IP, has expired TTL, or fails internal resolution.',
    actionItem: 'Run nslookup or dig to confirm hostname-to-IP accuracy.'
  },
  {
    id: 'service_down',
    reason: 'Application Service Down',
    protocolLayer: 'Layer 7 Host Service',
    details: 'Server OS responds to kernel ICMP, but web server/daemon is stopped or crashed.',
    actionItem: 'Check systemctl status and listening sockets (ss -tulpn).'
  },
  {
    id: 'tls',
    reason: 'TLS/SSL Problems',
    protocolLayer: 'Layer 6 Presentation',
    details: 'Certificate errors, expired cert, handshake cipher mismatch, or SNI misconfiguration.',
    actionItem: 'Test with openssl s_client -connect host:443.'
  },
  {
    id: 'routing',
    reason: 'Routing Asymmetry',
    protocolLayer: 'Layer 3 Routing',
    details: 'Outbound path works, but return path takes an alternate route blocked by stateful firewall.',
    actionItem: 'Run bidirectional traceroute and examine firewall state tables.'
  },
  {
    id: 'mtu',
    reason: 'MTU / Fragmentation',
    protocolLayer: 'Layer 2/3 MTU',
    details: 'Small ICMP packets pass, but large application packets exceed MTU and are dropped.',
    actionItem: 'Test with ping -M do -s 1472 (DF bit set).'
  },
  {
    id: 'proxy',
    reason: 'Proxy or Security Policies',
    protocolLayer: 'Layer 7 Proxy/WAF',
    details: 'Proxy settings, URL filtering, or security policies blocking application payloads.',
    actionItem: 'Check browser proxy config and proxy server logs.'
  },
  {
    id: 'app_config',
    reason: 'Application Misconfiguration',
    protocolLayer: 'Layer 7 App Config',
    details: 'Incorrect virtual host binding, listening on 127.0.0.1 instead of 0.0.0.0, or 500 error.',
    actionItem: 'Inspect web server virtual host configs and application logs.'
  }
];

export const COMMON_PORTS: AppPort[] = [
  { protocol: 'HTTP', port: 'TCP 80', layer: 'L7', purpose: 'Unencrypted Web Traffic' },
  { protocol: 'HTTPS', port: 'TCP 443', layer: 'L7/L6', purpose: 'Encrypted Web Traffic (TLS)' },
  { protocol: 'DNS', port: 'UDP/TCP 53', layer: 'L7', purpose: 'Domain Name Resolution' },
  { protocol: 'SMTP', port: 'TCP 25', layer: 'L7', purpose: 'Simple Mail Transfer Protocol' },
  { protocol: 'POP3', port: 'TCP 110', layer: 'L7', purpose: 'Post Office Protocol (Email)' },
  { protocol: 'IMAP', port: 'TCP 143', layer: 'L7', purpose: 'Internet Message Access Protocol' },
  { protocol: 'RDP', port: 'TCP 3389', layer: 'L7', purpose: 'Remote Desktop Protocol' },
  { protocol: 'SSH', port: 'TCP 22', layer: 'L7', purpose: 'Secure Shell Remote Login' }
];

export const OSI_LAYERS: OsiLayerInfo[] = [
  {
    number: 7,
    name: 'Application',
    unit: 'Data / Messages',
    protocols: 'HTTP, HTTPS, DNS, SSH, SMTP',
    pingInvolved: false,
    appInvolved: true,
    roleInIssue: 'Where the web service and business logic run. Ping never reaches this layer.'
  },
  {
    number: 6,
    name: 'Presentation',
    unit: 'Formatted Data',
    protocols: 'TLS, SSL, JSON, Compression',
    pingInvolved: false,
    appInvolved: true,
    roleInIssue: 'TLS handshake, certificates, and encryption. Expired certs fail here.'
  },
  {
    number: 5,
    name: 'Session',
    unit: 'Dialogues / Sockets',
    protocols: 'NetBIOS, RPC, Sockets',
    pingInvolved: false,
    appInvolved: true,
    roleInIssue: 'Maintains connections and sessions between communicating endpoints.'
  },
  {
    number: 4,
    name: 'Transport',
    unit: 'Segments / Datagrams',
    protocols: 'TCP, UDP, Ports (80, 443)',
    pingInvolved: false,
    appInvolved: true,
    roleInIssue: 'Port-based addressing. Firewalls block ports (TCP 443) right here.'
  },
  {
    number: 3,
    name: 'Network',
    unit: 'Packets',
    protocols: 'IPv4, IPv6, ICMP, Routing',
    pingInvolved: true,
    appInvolved: true,
    roleInIssue: 'IP reachability & routing. THIS IS WHERE PING OPERATES! Proves L3 only.'
  },
  {
    number: 2,
    name: 'Data Link',
    unit: 'Frames',
    protocols: 'Ethernet, VLANs, MAC, ARP',
    pingInvolved: true,
    appInvolved: true,
    roleInIssue: 'Local frame switching between hardware devices on the LAN segment.'
  },
  {
    number: 1,
    name: 'Physical',
    unit: 'Bits / Signals',
    protocols: 'Fiber, Cat6, Radio / RF, SFP+',
    pingInvolved: true,
    appInvolved: true,
    roleInIssue: 'Physical cables and electrical/optical signaling. Required for both.'
  }
];
