'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, Radio, Mail, Search, Upload, Link2, FileText, Clock, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HistoryEntry {
  id: string;
  type: 'phishing' | 'url' | 'email' | 'breach';
  input: string;
  output: string;
  timestamp: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'phishing' | 'breach' | 'url' | 'email' | 'history'>('phishing');
  const [emailInput, setEmailInput] = useState('');
  const [phishingInput, setPhishingInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [emailHeaderInput, setEmailHeaderInput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<HistoryEntry[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('cyberscout_history');
    if (savedHistory) {
      try {
        setScanHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  const addToHistory = (type: 'phishing' | 'url' | 'email' | 'breach', input: string, output: string) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      type,
      input: input.substring(0, 100),
      output: output.substring(0, 200),
      timestamp: Date.now(),
    };
    const newHistory = [entry, ...scanHistory].slice(0, 50); // Keep last 50 scans
    setScanHistory(newHistory);
    localStorage.setItem('cyberscout_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem('cyberscout_history');
    setTerminalOutput('[SUCCESS] SCAN_HISTORY_CLEARED\n\nAll previous scans have been permanently removed from memory.');
  };

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setTerminalOutput(entry.output);
    setActiveTab(entry.type);
  };

  const extractTextFromImage = async (file: File) => {
    setIsOcrProcessing(true);
    setUploadedFileName(file.name);
    
    try {
      const Tesseract = (await import('tesseract.js')).default;
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        try {
          const result = await Tesseract.recognize(imageData);
          const extractedText = result.data.text.trim();
          
          if (extractedText) {
            setPhishingInput(extractedText);
            setTerminalOutput(`[SUCCESS] OCR COMPLETE: Extracted ${extractedText.split('\n').length} lines from ${file.name}\n\n[TEXT]: ${extractedText.substring(0, 200)}...`);
          } else {
            setTerminalOutput(`[WARN] OCR extraction failed: No readable text detected in image`);
          }
        } catch (error: any) {
          setTerminalOutput(`[ERROR] OCR FAILURE: ${error.message}`);
          console.error(error);
        } finally {
          setIsOcrProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      setTerminalOutput(`[ERROR] OCR FAILURE: ${error.message}`);
      console.error(error);
      setIsOcrProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      extractTextFromImage(file);
    }
  };

  const executeAiScan = async (prompt: string) => {
    setIsLoading(true);
    setTerminalOutput('CONNECTING TO CYBERSCOUT CORAL INTELLIGENCE MATRIX...\n');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        }),
      });

      // If the backend threw an error, extract the text and show it in the terminal!
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'API communication link severed.');
      }

      const rawData = await response.text();
      
      if (!rawData) {
        setTerminalOutput('\n[WARN] SECURE CORE RETURNED AN EMPTY TELEMETRY ARRAY.');
        return;
      }

      setTerminalOutput(rawData);
      // Add to history based on current tab
      if (activeTab === 'phishing') {
        addToHistory('phishing', phishingInput, rawData);
      } else if (activeTab === 'breach') {
        addToHistory('breach', emailInput, rawData);
      }

    } catch (error: any) {
      console.error(error);
      setTerminalOutput(`\n[ERROR] UPLINK FAILURE: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhishingCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phishingInput.trim()) return;
    executeAiScan(
      `Analyze the following suspicious message for phishing/fraud. Assess risk on a scale of 1-10. Provide a brief, cyberpunk/hacker-style executive summary with tactical indicators of why it is or isn't a threat. Content: "${phishingInput}"`
    );
  };

  const handleBreachCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    executeAiScan(
      `Act as an elite cybersecurity response assistant. The user email "${emailInput}" was found in a generic mock data breach. Provide a highly customized, tactical, prioritized 4-step action plan to secure their digital footprint immediately. Keep it punchy and terminal-styled.`
    );
  };

  const handleUrlCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    
    setIsLoading(true);
    setTerminalOutput('CONNECTING TO CYBERSCOUT CORAL INTELLIGENCE MATRIX...\n');

    fetch('/api/analyze-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlInput }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'API communication link severed.');
        }
        return response.text();
      })
      .then((data) => {
        if (!data) {
          setTerminalOutput('\n[WARN] SECURE CORE RETURNED AN EMPTY TELEMETRY ARRAY.');
          return;
        }
        setTerminalOutput(data);
        addToHistory('url', urlInput, data);
      })
      .catch((error: any) => {
        console.error(error);
        setTerminalOutput(`\n[ERROR] UPLINK FAILURE: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleEmailHeaderCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailHeaderInput.trim()) return;
    
    setIsLoading(true);
    setTerminalOutput('CONNECTING TO CYBERSCOUT CORAL INTELLIGENCE MATRIX...\n');

    fetch('/api/analyze-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headers: emailHeaderInput }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'API communication link severed.');
        }
        return response.text();
      })
      .then((data) => {
        if (!data) {
          setTerminalOutput('\n[WARN] SECURE CORE RETURNED AN EMPTY TELEMETRY ARRAY.');
          return;
        }
        setTerminalOutput(data);
        addToHistory('email', emailHeaderInput.substring(0, 100), data);
      })
      .catch((error: any) => {
        console.error(error);
        setTerminalOutput(`\n[ERROR] UPLINK FAILURE: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <main className="min-h-screen p-4 md:p-8 bg-black text-[#00ff66] font-mono selection:bg-[#00ff66] selection:text-black">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8 border-b border-[#00ff66] pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-widest cyber-glow">CYBERSCOUT_AI // v1.0</h1>
        </div>
        <div className="flex items-center gap-2 text-xs bg-[#00ff66]/10 px-2 py-1 border border-[#00ff66]/30">
          <Radio className="w-3 h-3 text-red-500 animate-ping" />
          <span>SYS_STATUS: ONLINE</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Sidebar Navigation */}
        <div className="md:col-span-1 flex flex-col gap-2">
          <button
            onClick={() => { setActiveTab('phishing'); setTerminalOutput(''); }}
            className={`w-full text-left p-3 border transition-all flex items-center gap-2 text-sm ${
              activeTab === 'phishing' 
                ? 'bg-[#00ff66] text-black border-[#00ff66] font-bold' 
                : 'border-[#00ff66]/30 hover:border-[#00ff66] text-[#00ff66]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            PHISH_SCANNER
          </button>
          <button
            onClick={() => { setActiveTab('url'); setTerminalOutput(''); }}
            className={`w-full text-left p-3 border transition-all flex items-center gap-2 text-sm ${
              activeTab === 'url' 
                ? 'bg-[#00ff66] text-black border-[#00ff66] font-bold' 
                : 'border-[#00ff66]/30 hover:border-[#00ff66] text-[#00ff66]'
            }`}
          >
            <Link2 className="w-4 h-4" />
            URL_ANALYZER
          </button>
          <button
            onClick={() => { setActiveTab('email'); setTerminalOutput(''); }}
            className={`w-full text-left p-3 border transition-all flex items-center gap-2 text-sm ${
              activeTab === 'email' 
                ? 'bg-[#00ff66] text-black border-[#00ff66] font-bold' 
                : 'border-[#00ff66]/30 hover:border-[#00ff66] text-[#00ff66]'
            }`}
          >
            <FileText className="w-4 h-4" />
            EMAIL_HEADERS
          </button>
          <button
            onClick={() => { setActiveTab('breach'); setTerminalOutput(''); }}
            className={`w-full text-left p-3 border transition-all flex items-center gap-2 text-sm ${
              activeTab === 'breach' 
                ? 'bg-[#00ff66] text-black border-[#00ff66] font-bold' 
                : 'border-[#00ff66]/30 hover:border-[#00ff66] text-[#00ff66]'
            }`}
          >
            <Mail className="w-4 h-4" />
            BREACH_ASSIST
          </button>
          <button
            onClick={() => { setActiveTab('history'); setTerminalOutput(''); }}
            className={`w-full text-left p-3 border transition-all flex items-center gap-2 text-sm ${
              activeTab === 'history' 
                ? 'bg-[#00ff66] text-black border-[#00ff66] font-bold' 
                : 'border-[#00ff66]/30 hover:border-[#00ff66] text-[#00ff66]'
            }`}
          >
            <Clock className="w-4 h-4" />
            SCAN_HISTORY
          </button>
        </div>

        {/* Content Panel */}
        <div className="md:col-span-3 border border-[#00ff66] p-6 bg-zinc-950/50 backdrop-blur relative">
          
          {activeTab === 'phishing' && (
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                &gt; PHISHING_INTEL_SCAN
              </h2>
              <p className="text-xs text-zinc-400 mb-4">Paste raw text snippets or upload screenshot to analyze malicious telemetry.</p>
              
              <form onSubmit={handlePhishingCheck} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-500 mb-2 block">TEXT INPUT (Manual)</label>
                    <textarea
                      value={phishingInput}
                      onChange={(e) => setPhishingInput(e.target.value)}
                      rows={5}
                      placeholder="Paste suspicious SMS, URL payloads, or Email headers here..."
                      className="w-full bg-black border border-[#00ff66]/50 p-3 text-[#00ff66] focus:outline-none focus:border-[#00ff66] text-sm placeholder:text-zinc-700"
                    />
                  </div>

                  <div className="relative">
                    <label className="text-xs text-zinc-500 mb-2 block">IMAGE UPLOAD (OCR)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isOcrProcessing || isLoading}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className={`flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded cursor-pointer transition-all ${
                        isOcrProcessing || isLoading
                          ? 'border-zinc-600 bg-zinc-900/30 text-zinc-600'
                          : 'border-[#00ff66]/50 hover:border-[#00ff66] hover:bg-[#00ff66]/5 text-[#00ff66]'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">
                        {isOcrProcessing ? 'SCANNING_IMAGE...' : uploadedFileName ? `LOADED: ${uploadedFileName}` : 'UPLOAD_SCREENSHOT'}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isOcrProcessing || !phishingInput.trim()}
                  className="bg-transparent border border-[#00ff66] px-4 py-2 hover:bg-[#00ff66] hover:text-black transition-all text-sm font-bold disabled:opacity-50 w-full"
                >
                  {isLoading ? 'ANALYZING_...' : isOcrProcessing ? 'OCR_PROCESSING...' : 'EXECUTE_SCAN'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'url' && (
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                &gt; URL_THREAT_ANALYZER
              </h2>
              <p className="text-xs text-zinc-400 mb-4">Scan URLs for phishing, malware, and domain reputation threats with SSL/certificate analysis.</p>
              
              <form onSubmit={handleUrlCheck} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">TARGET_URL</label>
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/verify-account"
                    className="w-full bg-black border border-[#00ff66]/50 p-3 text-[#00ff66] focus:outline-none focus:border-[#00ff66] text-sm placeholder:text-zinc-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !urlInput.trim()}
                  className="bg-transparent border border-[#00ff66] px-4 py-2 hover:bg-[#00ff66] hover:text-black transition-all text-sm font-bold disabled:opacity-50 w-full"
                >
                  {isLoading ? 'ANALYZING_...' : 'SCAN_URL'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                &gt; EMAIL_HEADER_FORENSICS
              </h2>
              <p className="text-xs text-zinc-400 mb-4">Analyze raw email headers to detect spoofing, authentication failures (SPF/DKIM/DMARC), and sender forgery.</p>
              
              <form onSubmit={handleEmailHeaderCheck} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-2 block">FULL_EMAIL_HEADERS</label>
                  <textarea
                    value={emailHeaderInput}
                    onChange={(e) => setEmailHeaderInput(e.target.value)}
                    rows={6}
                    placeholder="Paste complete email headers including From:, Return-Path:, Received:, SPF:, DKIM-Signature:, Authentication-Results: etc."
                    className="w-full bg-black border border-[#00ff66]/50 p-3 text-[#00ff66] focus:outline-none focus:border-[#00ff66] text-sm placeholder:text-zinc-700"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !emailHeaderInput.trim()}
                  className="bg-transparent border border-[#00ff66] px-4 py-2 hover:bg-[#00ff66] hover:text-black transition-all text-sm font-bold disabled:opacity-50 w-full"
                >
                  {isLoading ? 'ANALYZING_...' : 'SCAN_HEADERS'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                &gt; SCAN_HISTORY_LOG
              </h2>
              <p className="text-xs text-zinc-400 mb-4">Review previous threat analyses. Click any entry to restore results.</p>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {scanHistory.length === 0 ? (
                  <div className="text-xs text-zinc-600 bg-zinc-900/50 p-3 border border-zinc-800 rounded">
                    [NO_DATA] Scan history is empty. Run analyses to populate log.
                  </div>
                ) : (
                  scanHistory.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => loadHistoryEntry(entry)}
                      className="w-full text-left p-3 border border-zinc-800 hover:border-[#00ff66] hover:bg-[#00ff66]/5 transition-all rounded text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#00ff66] font-bold uppercase">{entry.type}</span>
                        <span className="text-zinc-500">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-zinc-400 truncate">
                        {entry.input.substring(0, 60)}...
                      </div>
                    </button>
                  ))
                )}
              </div>

              {scanHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-red-900/20 border border-red-600/50 hover:border-red-600 px-4 py-2 text-red-400 text-sm font-bold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  CLEAR_HISTORY
                </button>
              )}
            </div>
          )}

          {activeTab === 'breach' && (
            <div>
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-white">
                &gt; BREACH_TARGET_AUDIT
              </h2>
              <p className="text-xs text-zinc-400 mb-4">Input target identity to isolate vulnerabilities and draft recovery protocols.</p>
              
              <form onSubmit={handleBreachCheck} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500 text-sm">@</span>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="operator@domain.com"
                    className="w-full bg-black border border-[#00ff66]/50 pl-8 pr-3 py-2 text-[#00ff66] focus:outline-none focus:border-[#00ff66] text-sm placeholder:text-zinc-700"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-transparent border border-[#00ff66] px-4 py-2 hover:bg-[#00ff66] hover:text-black transition-all text-sm font-bold disabled:opacity-50 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" /> AUDIT
                </button>
              </form>
            </div>
          )}

          {/* Terminal Output Display */}
          {terminalOutput && (
            <div className="mt-6 border-t border-[#00ff66]/30 pt-4">
              <div className="text-xs text-zinc-500 mb-2">// TERMINAL_OUTPUT_STREAM:</div>
              <div className="bg-black/80 p-4 border border-zinc-800 rounded text-sm text-[#00ff66] overflow-y-auto max-h-96 whitespace-pre-wrap leading-relaxed">
                {terminalOutput}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}