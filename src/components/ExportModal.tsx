import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import editorialPlateImage from '../assets/images/seven_layer_editorial_plates_1791796451441.jpg';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  const embedCode = `<iframe 
  src="${currentUrl}" 
  width="100%" 
  height="780" 
  style="border: 1px solid #283231; border-radius: 16px; background-color: #080B0C; max-width: 1200px; margin: 0 auto; display: block;" 
  title="7LayerX - Why Ping Works But Application Does Not"
  allow="clipboard-write"
  loading="lazy">
</iframe>`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadSvg = () => {
    const svgEl = document.querySelector('svg');
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgEl);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '7layerx-network-troubleshooting-schematic.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadEditorialImage = () => {
    const a = document.createElement('a');
    a.href = editorialPlateImage;
    a.download = '7layerx-editorial-plates-highres.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B0C]/85 backdrop-blur-md animate-in fade-in duration-200 font-sans">
      <div className="bg-[#101516] border border-[#283231] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#080B0C] px-6 py-4 border-b border-[#283231] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#151C1D] border border-[#283231] text-[#D2F27C]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#EEF2EF]">
                Export Native Asset for 7layerx.com
              </h3>
              <p className="text-xs font-mono text-[#98A5A2]">
                Editorial graphics, vector SVG, and live iframe embed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#98A5A2] hover:text-[#EEF2EF] bg-[#151C1D] border border-[#283231] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Graphic Downloads */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#D2F27C] uppercase tracking-wider mb-3">
              1. Download Still & Vector Assets
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadEditorialImage}
                className="p-3.5 rounded-xl bg-[#080B0C] border border-[#283231] hover:border-[#D2F27C] text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-[#151C1D] text-[#D2F27C] shrink-0 border border-[#283231]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#EEF2EF] group-hover:text-[#D2F27C]">
                    Editorial 7-Layer Artwork
                  </div>
                  <div className="text-[11px] text-[#98A5A2] mt-0.5">
                    High-res dark editorial plate render with subtle lime traces.
                  </div>
                </div>
              </button>

              <button
                onClick={handleDownloadSvg}
                className="p-3.5 rounded-xl bg-[#080B0C] border border-[#283231] hover:border-[#D2F27C] text-left transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-[#151C1D] text-[#D2F27C] shrink-0 border border-[#283231]">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#EEF2EF] group-hover:text-[#D2F27C]">
                    Scalable Vector SVG
                  </div>
                  <div className="text-[11px] text-[#98A5A2] mt-0.5">
                    Crisp technical schematic for clean integration.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Embed iframe snippet */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono font-bold text-[#D2F27C] uppercase tracking-wider">
                2. Live Interactive Embed Snippet
              </h4>
              <button
                onClick={() => handleCopy(embedCode, 'iframe')}
                className="text-xs text-[#D2F27C] hover:underline flex items-center gap-1 font-mono"
              >
                {copiedType === 'iframe' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#D2F27C]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#080B0C] border border-[#283231] font-mono text-[11px] text-[#98A5A2] overflow-x-auto leading-relaxed">
              {embedCode}
            </pre>
          </div>

          {/* Direct Link */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#D2F27C] uppercase tracking-wider mb-2">
              3. Shareable URL
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 bg-[#080B0C] border border-[#283231] rounded-lg px-3 py-2 text-xs font-mono text-[#EEF2EF] focus:outline-none"
              />
              <button
                onClick={() => handleCopy(currentUrl, 'url')}
                className="px-3 py-2 rounded-lg bg-[#151C1D] border border-[#283231] hover:border-[#D2F27C] text-[#EEF2EF] text-xs font-mono font-medium transition-colors shrink-0 flex items-center gap-1.5"
              >
                {copiedType === 'url' ? <Check className="w-3.5 h-3.5 text-[#D2F27C]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'url' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#080B0C] px-6 py-3 border-t border-[#283231] flex items-center justify-between text-xs font-mono text-[#98A5A2]">
          <span>7layerx.com · Trace the signal</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#151C1D] hover:bg-[#283231] text-[#EEF2EF] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
