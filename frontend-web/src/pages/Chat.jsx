import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Sparkles, Mic, MicOff, Copy, 
  Share2, RotateCcw, AlertCircle, ShieldCheck, Check, Volume2 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import CitationCard from '../components/chat/CitationCard';

export default function Chat() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! I am BIS Sahayak, an official Indian Standards AI compliance officer. How can I guide you with technical requirements, ISI marks, or testing protocols today?',
      citations: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    'What is the permissible TDS limit under IS 10500?',
    'What are the mandatory thickness requirements in IS 15652 for Class A mats?',
    'What is the head height tolerance for M12 bolts under IS 1363?',
    'How do I obtain a BIS ISI certification mark for packaged water?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText = null) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.askBIS(textToSend, lang);
      const assistantMsg = {
        role: 'assistant',
        content: data.response_localized || data.response_english,
        citations: data.citations || [],
        sources: data.retrieved_sources || [],
        guardrail_passed: data.guardrail_passed,
        guardrail_notes: data.guardrail_notes || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to the BIS Sahayak compliance engine. Please ensure the backend server is running at http://localhost:8000.',
          isError: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeechInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (listening) {
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto overflow-hidden animate-fadeIn">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
              <span>AI Sahayak Compliance Officer</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Strict Guardrail Active
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Grounded in official Bureau of Indian Standards clauses</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg text-xs flex items-center space-x-1"
          title="Clear Conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm shadow-2xs space-y-3 ${
              m.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : m.isError
                  ? 'bg-red-50 text-red-900 border border-red-200 rounded-bl-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-none'
            }`}>
              <div className="leading-relaxed whitespace-pre-wrap">{m.content}</div>

              {/* Verified Citations Shelf */}
              {m.citations && m.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Verified Citations
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {m.citations.map((c, i) => (
                      <CitationCard key={i} citation={c.citation} standardId={c.citation} verified={true} />
                    ))}
                  </div>
                </div>
              )}

              {/* Message Footer Controls */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>{m.timestamp}</span>
                {m.role === 'assistant' && !m.isError && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => speakText(m.content)}
                      className="hover:text-blue-600 p-1"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(m.content, idx)}
                      className="hover:text-blue-600 p-1"
                      title="Copy Answer"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-bl-none p-4 text-xs text-slate-500 flex items-center space-x-2 shadow-2xs">
              <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Querying FAISS database & validating regulatory citations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Compliance Questions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-xs bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 px-3 py-1.5 rounded-full transition-colors text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center space-x-2">
        <button
          type="button"
          onClick={handleSpeechInput}
          className={`p-2.5 rounded-xl border transition-colors ${
            listening 
              ? 'bg-red-500 text-white border-red-600 animate-pulse' 
              : 'border-slate-300 text-slate-500 hover:bg-slate-100'
          }`}
          title={listening ? 'Listening...' : 'Voice Input (Bhashini)'}
        >
          {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask any Indian Standards question in English, Hindi, Tamil, Telugu, etc..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
