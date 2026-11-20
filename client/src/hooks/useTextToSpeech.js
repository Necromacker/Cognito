import { useEffect, useState, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

/* Preferred natural, human, warm voices (avoiding robotic/metallic defaults) */
const PREFERRED_VOICES = {
  en: [
    // Top-tier natural voices across Chrome/Edge/Safari/macOS
    'Natural',
    'Online (Natural)',
    'Samantha',
    'Karen',
    'Serena',
    'Daniel',
    'Moira',
    'Google US English',
    'Google UK English Female',
    'Tessa',
    'Aman',
    'Rishi',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Aria Online (Natural)',
    'Microsoft Zira',
  ],
  hi: [
    'Google हिन्दी',
    'Lekha',
    'Swara',
    'Madhur',
    'Rishi',
    'Aman',
  ],
  mr: [
    'Google मराठी',
    'Aarohi',
    'Lekha',
  ],
};

function pickBestVoice(voices, langCode) {
  if (!voices || voices.length === 0) return null;

  const preferred = PREFERRED_VOICES[langCode] || PREFERRED_VOICES.en;
  const langPrefix = langCode === 'hi' ? 'hi' : langCode === 'mr' ? 'mr' : 'en';

  // 1. First prioritize any voice explicitly tagged as "Natural" or "Neural"
  const neuralMatch = voices.find(v => 
    v.lang.startsWith(langPrefix) && 
    (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('online'))
  );
  if (neuralMatch) return neuralMatch;

  // 2. Try preferred friendly list in order
  for (const name of preferred) {
    const v = voices.find(v => 
      v.name.toLowerCase().includes(name.toLowerCase()) && 
      (v.lang.startsWith(langPrefix) || langPrefix === 'en')
    );
    if (v) return v;
  }

  // 3. Fallback: non-compact, remote voice with correct language
  const nonCompact = voices.find(v => 
    v.lang.startsWith(langPrefix) && 
    !v.name.toLowerCase().includes('compact') && 
    !v.name.toLowerCase().includes('bad news') && 
    !v.name.toLowerCase().includes('jester') && 
    !v.name.toLowerCase().includes('organ') && 
    !v.name.toLowerCase().includes('zarvox')
  );
  if (nonCompact) return nonCompact;

  // 4. Any voice matching language
  return voices.find(v => v.lang.startsWith(langPrefix)) || voices[0] || null;
}

export function useTextToSpeech() {
  const { language } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesRef = useRef([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          voicesRef.current = list;
        }
      };

      loadVoices();

      // Some browsers (Chrome) populate voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, []);

  const speak = useCallback((text) => {
    if (!isSupported || !text) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      
      // More human pacing: 0.90x speed, gentle pitch for warm conversational tone
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const langCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
      utterance.lang = langCode;

      // Re-fetch if ref is empty
      if (!voicesRef.current || voicesRef.current.length === 0) {
        voicesRef.current = window.speechSynthesis.getVoices();
      }

      const bestVoice = pickBestVoice(voicesRef.current, language || 'en');
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  }, [isSupported, language]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}
