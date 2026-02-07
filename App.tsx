
import React, { useState, useEffect } from 'react';
import { Feather, Sparkles, Loader2, Key, AlertCircle, History, Trash2, ExternalLink } from 'lucide-react';
import { GenerationStatus, HaikuResult } from './types';
import { generateHaikuPoem, generateHaikuImage } from './services/geminiService';
import HaikuCard from './components/HaikuCard';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [keywords, setKeywords] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [history, setHistory] = useState<HaikuResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        setHasKey(await window.aistudio.hasSelectedApiKey());
      } else {
        setHasKey(true);
      }
      const saved = localStorage.getItem('haiku_history_simple');
      if (saved) setHistory(JSON.parse(saved));
    };
    init();
  }, []);

  const handleConnect = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim() || status !== GenerationStatus.IDLE) return;

    setError(null);
    try {
      setStatus(GenerationStatus.GENERATING_POEM);
      const { text, japaneseText } = await generateHaikuPoem(keywords);
      
      setStatus(GenerationStatus.GENERATING_IMAGE);
      const imageUrl = await generateHaikuImage(text);
      
      const newResult: HaikuResult = {
        id: crypto.randomUUID(),
        poem: text,
        japanesePoem: japaneseText,
        imageUrl,
        keywords: keywords.trim(),
        timestamp: Date.now(),
      };
      
      const newHistory = [newResult, ...history].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem('haiku_history_simple', JSON.stringify(newHistory));
      setKeywords('');
      setStatus(GenerationStatus.IDLE);
    } catch (err: any) {
      setError(err.message || "Παρουσιάστηκε σφάλμα.");
      setStatus(GenerationStatus.IDLE);
    }
  };

  if (hasKey === null) return null;

  if (hasKey === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key size={30} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Σύνδεση API Key</h1>
          <p className="text-gray-500 mb-8">Συνδέστε το Gemini API Key σας για να ξεκινήσετε.</p>
          <button onClick={handleConnect} className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <Sparkles size={20} /> Επιλογή Κλειδιού
          </button>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="inline-flex items-center gap-1 mt-6 text-xs text-gray-400 hover:text-black">
            Πληροφορίες Τιμολόγησης <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <header className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-lg"><Feather size={24} /></div>
          <h1 className="text-xl font-black tracking-tighter">ZEN AI HAIKU</h1>
        </div>
        <div className="text-[10px] font-bold text-red-600 tracking-widest uppercase bg-red-50 px-3 py-1 rounded-full">Alpha v1.0</div>
      </header>

      <section className="mb-20">
        <form onSubmit={handleGenerate} className="relative group">
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Πληκτρολογήστε λέξεις (π.χ. νύχτα, βροχή, ηρεμία)..."
            className="w-full p-6 pr-20 bg-white border-2 border-gray-100 rounded-2xl text-xl font-semibold outline-none focus:border-black transition-all shadow-sm focus:shadow-md text-black"
          />
          <button 
            type="submit"
            disabled={!keywords.trim() || status !== GenerationStatus.IDLE}
            className="absolute right-3 top-3 bottom-3 px-6 bg-black text-white rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
          >
            {status === GenerationStatus.IDLE ? <Sparkles size={24} /> : <Loader2 size={24} className="animate-spin" />}
          </button>
        </form>

        {status !== GenerationStatus.IDLE && (
          <div className="mt-6 flex items-center justify-center gap-3 text-gray-400 animate-pulse font-medium text-sm">
            <Loader2 size={16} className="animate-spin" />
            {status === GenerationStatus.GENERATING_POEM ? 'Σύνθεση ποίησης...' : 'Δημιουργία εικόνας...'}
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-100 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}
      </section>

      <section className="space-y-16">
        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {history.map(item => (
              <HaikuCard key={item.id} result={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
            <History size={40} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-medium italic">Δεν υπάρχουν ακόμη δημιουργίες...</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="flex justify-center pt-8">
            <button 
              onClick={() => { if(confirm('Σίγουρα;')) { setHistory([]); localStorage.removeItem('haiku_history_simple'); }}}
              className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-red-500 uppercase tracking-widest transition-colors"
            >
              <Trash2 size={14} /> Καθαρισμός Ιστορικού
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
