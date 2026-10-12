export type ProtocolType = 'ICMP' | 'TCP' | 'UDP' | 'TLS';

export type SimulationScenarioId = 
  | 'firewall_blocked'
  | 'dns_failure'
  | 'mtu_drop'
  | 'tls_failure'
  | 'app_down'
  | 'asymmetric_routing'
  | 'all_healthy';

export interface NetworkNode {
  id: string;
  name: string;
  role: string;
  ip: string;
  x: number;
  y: number;
  icon: 'client' | 'switch' | 'router' | 'firewall' | 'internet' | 'server';
  layer: number;
  details: string;
}

export interface SimulationScenario {
  id: SimulationScenarioId;
  title: string;
  shortLabel: string;
  description: string;
  failingComponent: string;
  osiLayer: number;
  pingResult: 'success' | 'failure';
  appResult: 'blocked' | 'timeout' | 'reset' | 'dns_err' | 'ssl_err' | 'success';
  dropAtNodeId?: string;
  dropMessage: string;
  recommendedStep: number;
}

export interface TroubleshootingStep {
  id: number;
  title: string;
  description: string;
  layer: string;
  layerNumber: number;
  commands: {
    os: string;
    command: string;
  }[];
  explanation: string;
  whatToLookFor: string;
  simulatedOutput: string;
}

export interface CommonReason {
  id: string;
  reason: string;
  protocolLayer: string;
  details: string;
  actionItem: string;
}

export interface AppPort {
  protocol: string;
  port: string;
  layer: string;
  purpose: string;
}

export interface OsiLayerInfo {
  number: number;
  name: string;
  unit: string;
  protocols: string;
  pingInvolved: boolean;
  appInvolved: boolean;
  roleInIssue: string;
}
