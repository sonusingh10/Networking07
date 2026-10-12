import React, { useState } from 'react';
import { TopNav } from './components/TopNav';
import { EditorialLayerVisualizer } from './components/EditorialLayerVisualizer';
import { NetworkDiagram } from './components/NetworkDiagram';
import { TracerouteAndIcmpLab } from './components/TracerouteAndIcmpLab';
import { TroubleshootingSteps } from './components/TroubleshootingSteps';
import { TerminalSimulator } from './components/TerminalSimulator';
import { ReasonsAndTakeaways } from './components/ReasonsAndTakeaways';
import { ExportModal } from './components/ExportModal';
import { 
  DEFAULT_CLIENT_IP, 
  DEFAULT_SERVER_IP, 
  getScenarios, 
  getTroubleshootingSteps 
} from './data/networkData';
import { SimulationScenario, TroubleshootingStep } from './types/network';
import { ExternalLink, Terminal } from 'lucide-react';

export default function App() {
  const [clientIp, setClientIp] = useState<string>(DEFAULT_CLIENT_IP);
  const [serverIp, setServerIp] = useState<string>(DEFAULT_SERVER_IP);
  
  const scenarios = getScenarios(serverIp);
  const [currentScenario, setCurrentScenario] = useState<SimulationScenario>(scenarios[0]);
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeNavView, setActiveNavView] = useState<string>('layers');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const troubleshootingSteps = getTroubleshootingSteps(serverIp);
  const activeStep = troubleshootingSteps.find(s => s.id === activeStepId) || troubleshootingSteps[0];

  const handleSelectScenario = (scenario: SimulationScenario) => {
    setCurrentScenario(scenario);
    setActiveStepId(scenario.recommendedStep);
  };

  const handleSelectStep = (stepId: number) => {
    setActiveStepId(stepId);
  };

  const handleRunInTerminal = (step: TroubleshootingStep) => {
    setActiveStepId(step.id);
    const termEl = document.getElementById('terminal-section');
    if (termEl) {
      termEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChangeIps = (newClient: string, newServer: string) => {
    setClientIp(newClient);
    setServerIp(newServer);
    const updatedScenarios = getScenarios(newServer);
    const matchedScenario = updatedScenarios.find(s => s.id === currentScenario.id) || updatedScenarios[0];
    setCurrentScenario(matchedScenario);
  };

  const scrollToSection = (view: string) => {
    setActiveNavView(view);
    const el = document.getElementById(`${view}-section`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#080B0C] text-[#EEF2EF] flex flex-col selection:bg-[#D2F27C] selection:text-[#080B0C]">
      {/* Top Bar adhering to Top Bar Contract */}
      <TopNav 
        activeView={activeNavView}
        onSelectView={scrollToSection}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Section 1: Editorial 7-Layer Visualizer & Architectural Plates */}
        <section id="layers-section" className="scroll-mt-24">
          <EditorialLayerVisualizer 
            onSelectLayer={(num) => {
              if (num === 7) setActiveStepId(1);
              else if (num === 4) setActiveStepId(2);
              else if (num === 3) setActiveStepId(4);
              else if (num === 6) setActiveStepId(6);
            }}
            activeScenarioName={currentScenario.shortLabel}
          />
        </section>

        {/* Section 2: Interactive Network Topology (Dynamic Client & Server IPs) */}
        <section id="topology-section" className="scroll-mt-24">
          <NetworkDiagram
            currentScenario={currentScenario}
            onSelectScenario={handleSelectScenario}
            onSelectStep={handleSelectStep}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            clientIp={clientIp}
            serverIp={serverIp}
            onChangeIps={handleChangeIps}
          />
        </section>

        {/* Section 3: Interactive Traceroute & Ping Protocol Lab */}
        <section id="tracelab-section" className="scroll-mt-24">
          <TracerouteAndIcmpLab
            clientIp={clientIp}
            serverIp={serverIp}
          />
        </section>

        {/* Section 4: Systematic Troubleshooting Protocol (8 Steps) */}
        <section id="diagnostics-section" className="scroll-mt-24">
          <TroubleshootingSteps
            activeStepId={activeStepId}
            onSelectStep={handleSelectStep}
            onRunInTerminal={handleRunInTerminal}
          />
        </section>

        {/* Section 5: Interactive Diagnostics Terminal */}
        <section id="terminal-section" className="scroll-mt-24">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#EEF2EF] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D2F27C]" />
                <span>Interactive Diagnostics Shell</span>
              </h2>
              <p className="text-xs text-[#98A5A2] font-mono">
                Execute live troubleshooting probes to simulate layer-by-layer responses.
              </p>
            </div>
            <span className="text-xs font-mono text-[#98A5A2] hidden sm:inline">
              Host: <span className="text-[#D2F27C]">{clientIp}</span> → Target: <span className="text-[#D2F27C]">{serverIp}</span>
            </span>
          </div>
          <TerminalSimulator
            currentStep={activeStep}
            onSelectStepById={handleSelectStep}
            clientIp={clientIp}
            serverIp={serverIp}
          />
        </section>

        {/* Section 6: Root Causes & Takeaways */}
        <section id="reasons-section" className="scroll-mt-24">
          <ReasonsAndTakeaways />
        </section>

      </main>

      {/* Editorial Footer */}
      <footer className="mt-16 border-t border-[#283231] bg-[#080B0C] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#98A5A2]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#EEF2EF]">7LayerX</span>
            <span>·</span>
            <span>Trace the signal. Understand the system. Share the knowledge.</span>
          </div>

          <div className="flex items-center gap-6">
            <a 
              href="https://www.7layerx.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#D2F27C] hover:underline transition-colors flex items-center gap-1 font-medium"
            >
              <span>7layerx.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-[#98A5A2] hover:text-[#EEF2EF] transition-colors"
            >
              Export Embed
            </button>
          </div>
        </div>
      </footer>

      {/* Export & Embed Modal */}
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
    </div>
  );
}
