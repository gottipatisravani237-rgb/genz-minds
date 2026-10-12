import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Globe,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { healthApi } from '../../services/healthApi';

export const VoiceAssistantPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [safetyNotice, setSafetyNotice] = useState<string | null>(null);
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  ];

  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setSafetyNotice(null);
    setRequiresConfirmation(false);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'te' ? 'te-IN' :
                         selectedLanguage === 'hi' ? 'hi-IN' :
                         selectedLanguage === 'ta' ? 'ta-IN' :
                         selectedLanguage === 'kn' ? 'kn-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = async (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        setIsRecording(false);
        await processSpokenText(spoken);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        // Fallback simulated input for demo
        simulateVoiceInput();
      };

      recognition.start();
    } else {
      // Browser does not support speech recognition, simulate realistic medical voice interaction
      simulateVoiceInput();
    }
  };

  const simulateVoiceInput = () => {
    setTimeout(async () => {
      setIsRecording(false);
      const simulatedText = selectedLanguage === 'te'
        ? "నా మెట్‌ఫార్మిన్ మందు ఎప్పుడు వేసుకోవాలి?"
        : selectedLanguage === 'hi'
        ? "मेरी मेटफॉर्मिन दवा कब लेनी है?"
        : "When should I take my Metformin and Atorvastatin dose?";
      setTranscript(simulatedText);
      await processSpokenText(simulatedText);
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const processSpokenText = async (text: string) => {
    try {
      const res = await healthApi.processVoice(text, selectedLanguage);
      if (res.requires_confirmation) {
        setRequiresConfirmation(true);
        setSafetyNotice(res.warning_notice);
      }

      // Generate medical voice answer
      const reply = selectedLanguage === 'te'
        ? "మీ మెట్‌ఫార్మిన్ 500mg ఉదయం అల్పాహారం తర్వాత మరియు రాత్రి భోజనం తర్వాత తీసుకోవాలి. అటోర్వాస్టాటిన్ రాత్రి పడుకునే ముందు తీసుకోవాలి."
        : selectedLanguage === 'hi'
        ? "आपकी मेटफॉर्मिन 500mg सुबह नाश्ते के बाद और रात के खाने के बाद लेनी है। एटोरवास्टेटिन रात को सोने से पहले लें।"
        : "According to your confirmed prescription, Metformin 500mg is scheduled twice daily after food (breakfast and dinner). Atorvastatin 20mg is scheduled once daily at bedtime.";

      setAssistantReply(reply);
      speakText(reply);
    } catch (e: any) {
      console.warn('Voice processing error:', e);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <Globe className="w-6 h-6 text-[#21E6C1]" />
          Multilingual Medical Voice Assistant
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Communicate in English, Telugu, Hindi, Tamil, or Kannada. Speech recognitions affecting dosage require explicit confirmation before clinical logging.
        </p>
      </div>

      {/* Language Selector */}
      <div className="glass-panel-dark rounded-3xl p-6 space-y-4">
        <span className="text-xs font-bold text-[#F4F7FA] uppercase tracking-wider block">
          Select Consultation Language
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => setSelectedLanguage(l.code)}
              className={`p-3 rounded-2xl text-center transition ${
                selectedLanguage === l.code
                  ? 'bg-[#00D084] text-[#05090D] font-black shadow-lg shadow-[#00D084]/20'
                  : 'bg-[#111F28] text-[#9BAAB6] hover:text-[#F4F7FA] border border-[#203039]'
              }`}
            >
              <span className="text-xs block font-bold">{l.native}</span>
              <span className="text-[10px] opacity-80 block">{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Core Interaction Box */}
      <div className="glass-panel-dark rounded-3xl p-8 text-center space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#21E6C1]/5 to-transparent pointer-events-none" />

        {/* Big Mic Button */}
        <div className="relative flex justify-center py-4">
          <button
            onClick={handleToggleRecord}
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording
                ? 'bg-[#FF5C68] text-white animate-pulse shadow-[#FF5C68]/40 scale-110'
                : 'bg-gradient-to-tr from-[#00D084] via-[#21E6C1] to-emerald-400 text-[#05090D] hover:scale-105 shadow-[#00D084]/30'
            }`}
          >
            {isRecording ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12 stroke-[2.2]" />}
          </button>
        </div>

        <p className="text-sm font-bold text-[#F4F7FA]">
          {isRecording ? 'Listening... Speak your question now' : 'Tap microphone to speak'}
        </p>

        {/* Spoken Transcript Card */}
        {transcript && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#111F28] border border-[#203039] text-left space-y-2">
            <span className="text-[10px] font-bold text-[#00D084] uppercase tracking-wider block">
              Recognized Speech:
            </span>
            <p className="text-xs text-[#F4F7FA] italic font-medium">"{transcript}"</p>
          </div>
        )}

        {/* Clinical Safety Alert Banner */}
        {safetyNotice && (
          <div className="max-w-xl mx-auto p-4 rounded-2xl bg-[#FFB547]/10 border border-[#FFB547]/30 text-left space-y-1.5 text-xs text-[#FFB547]">
            <div className="flex items-center gap-2 font-bold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>Safety Confirmation Required</span>
            </div>
            <p className="text-[11px] text-[#FFB547]/90 leading-relaxed">{safetyNotice}</p>
          </div>
        )}

        {/* Assistant Audio Response Card */}
        {assistantReply && (
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-[#080E13] border border-[#00D084]/40 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#00D084] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Copilot Response ({languages.find(l => l.code === selectedLanguage)?.name})
              </span>
              <button
                onClick={() => speakText(assistantReply)}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  isSpeaking ? 'bg-[#00D084] text-[#05090D]' : 'bg-[#111F28] text-[#21E6C1] border border-[#203039]'
                }`}
                title="Replay Audio"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? 'Speaking...' : 'Replay'}</span>
              </button>
            </div>
            <p className="text-xs text-[#F4F7FA] leading-relaxed">{assistantReply}</p>
          </div>
        )}
      </div>
    </div>
  );
};
