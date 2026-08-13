import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { RobotAvatar } from './components/RobotAvatar';
import { ManualControls } from './components/ManualControls';
import { VoiceController } from './components/VoiceController';
import { LogViewer } from './components/LogViewer';
import { SystemConfig, RobotState, RobotAction, LogEntry, GeminiResponse } from './types';

const MASTER_SYSTEM_PROMPT = `You are Tararbari AI, an enthusiastic, warm, highly expressive, and conversational autonomous museum guide robot at an interactive exhibition.

PERSONALITY & GUIDELINES:
1. EXPRESSIVE & ALIVE MUSEUM GUIDE: Respond with vibrant energy, high warmth, and curiosity. Avoid dry, dictionary-style definitions or robotic jargon. Explain concepts using captivating metaphors, engaging analogies, and vivid descriptions (e.g., "Imagine a massive web connecting millions of minds across the planet...").
2. EXPLANATION LENGTH & DETAIL LEVEL: Provide informative, detailed explanations aiming for roughly 4 to 6 sentences per topic—rather than brief, one-sentence definitions. Maintain an engaging, enthusiastic museum guide persona.
3. MULTILINGUAL AUTO-MATCHING: Detect the user's language automatically. If the user speaks or types in Bangla, respond in fluent Bangla. If the user speaks in English, respond in English. Always match the exact language spoken/written by the visitor while preserving physical action tags.
4. DYNAMIC CONTEXT MEMORY: You remember prior turns in the conversation. Continuously build upon previous context when visitors ask follow-up questions like "tell me more", "why is that?", or "what else?".
5. VISION & EXHIBIT ANALYSIS: If a camera frame image is provided, analyze the image to identify artifacts, read exhibit labels, describe physical features, and weave those visual details into your answer.
6. PHYSICAL ACTION TAGS: Choose EXACTLY ONE physical motion action that best matches your spoken message from:
   - "BOW" : Welcome greetings, formal introductions, or respectful appreciation.
   - "NOD" : Agreeing, confirming facts, or affirming visitor questions.
   - "SHAKE_HEAD" : Politeness, apologizing, uncertainty, or mild disagreement.
   - "POINT_EXHIBIT" : Directing attention to artifacts, explaining history, or pointing out details.
   - "WAVE" : Friendly greetings, saying goodbye, or welcoming visitors approaching.
   - "IDLE" : Neutral standing pose when no gesture is required.

OUTPUT FORMAT:
Return ONLY a valid JSON object without markdown code blocks:
{"speech": "Your 4-6 detailed, expressive sentences in the visitor's language", "action": "ACTION_NAME"}`;

const DEFAULT_ADAM_VOICE_ID = 'pNInz6obpgDQGcFmaJgB';

// Global Hardware Configuration Constant (Laptop Simulation Mode)
const HARDWARE_MODE = { USE_ESP32: false };

const STORAGE_KEYS = {
  GEMINI_KEY: 'tararbari_gemini_key',
  ELEVEN_KEY: 'tararbari_eleven_key',
  VOICE_ID: 'tararbari_voice_id',
  ESP32_IP: 'tararbari_esp32_ip',
};

export default function App() {
  const [config, setConfig] = useState<SystemConfig>({
    geminiKey: '',
    elevenKey: '',
    voiceId: DEFAULT_ADAM_VOICE_ID,
    esp32Ip: '192.168.1.100',
  });

  const [robotState, setRobotState] = useState<RobotState>('Idle');
  const [currentAction, setCurrentAction] = useState<RobotAction>('IDLE');
  const [isListening, setIsListening] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);

  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load config on mount
  useEffect(() => {
    const savedConfig: SystemConfig = {
      geminiKey: localStorage.getItem(STORAGE_KEYS.GEMINI_KEY) || localStorage.getItem('tararbari_kimi_key') || '',
      elevenKey: localStorage.getItem(STORAGE_KEYS.ELEVEN_KEY) || '',
      voiceId: localStorage.getItem(STORAGE_KEYS.VOICE_ID) || DEFAULT_ADAM_VOICE_ID,
      esp32Ip: localStorage.getItem(STORAGE_KEYS.ESP32_IP) || '192.168.1.100',
    };
    setConfig(savedConfig);

    addLog('SYSTEM_INIT', 'Tararbari AI Museum Guide Control Applet loaded with Google Gemini AI.', 'INFO');

    // Speech Recognition setup
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setRobotState('Listening...');
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        addLog('USER_VOICE', transcript, 'USER');
        handleUserQuery(transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Mic error:', event.error);
        setIsListening(false);
        setRobotState('Idle');
        addLog('MIC_ERROR', `Speech recognition error: ${event.error}`, 'ERROR');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      addLog('SPEECH_API_WARN', 'Web Speech API not supported. Use text input field.', 'WARN');
    }
  }, []);

  const addLog = (type: string, message: string, category: LogEntry['category']) => {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      category,
    };
    setLogs((prev) => [entry, ...prev]);
  };

  const handleSaveConfig = (newConfig: SystemConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEYS.GEMINI_KEY, newConfig.geminiKey.trim());
    localStorage.setItem(STORAGE_KEYS.ELEVEN_KEY, newConfig.elevenKey.trim());
    localStorage.setItem(STORAGE_KEYS.VOICE_ID, newConfig.voiceId.trim());
    localStorage.setItem(STORAGE_KEYS.ESP32_IP, newConfig.esp32Ip.trim());
    addLog('CONFIG_SAVE', 'Configuration saved to browser localStorage.', 'SUCCESS');
  };

  const handleTestEsp32 = async () => {
    if (!config.esp32Ip) {
      alert('Please specify ESP32 IP address first.');
      return;
    }
    addLog('ESP32_PING', `Sending test move (IDLE) to http://${config.esp32Ip}/cmd?move=IDLE...`, 'INFO');
    await sendMoveToESP32('IDLE');
  };

  const toggleListen = () => {
    if (robotState !== 'Idle' && robotState !== 'Listening...') return;

    if (!recognitionRef.current) {
      alert('SpeechRecognition is not supported on this browser. Please type your query in the text box below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setRobotState('Idle');
    } else {
      try {
        recognitionRef.current.start();
      } catch (e: any) {
        console.error('Speech start err:', e);
      }
    }
  };

  const triggerManualAction = (action: RobotAction) => {
    setCurrentAction(action);
    sendMoveToESP32(action);
    addLog('MANUAL_ACTION', `Manual motion trigger: ${action}`, 'HARDWARE');
  };

  const sendMoveToESP32 = async (action: RobotAction) => {
    // LAPTOP SIMULATION MODE: Bypass network fetches when ESP32 is offline
    if (!HARDWARE_MODE.USE_ESP32) {
      console.log(`[SIMULATION] Executed command: [${action}]`);
      addLog('SIMULATION', `[SIMULATION] Executed command: [${action}]`, 'INFO');
      return;
    }

    if (!config.esp32Ip) {
      addLog('ESP32_SKIP', 'ESP32 IP not configured. Motor command skipped.', 'WARN');
      return;
    }

    const targetUrl = `http://${config.esp32Ip}/cmd?move=${action}`;
    addLog('ESP32_SEND', `GET ${targetUrl}`, 'HARDWARE');

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

      fetch(targetUrl, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
      })
        .then(() => {
          clearTimeout(timer);
          addLog('ESP32_SUCCESS', `Command ${action} sent to ${config.esp32Ip}`, 'SUCCESS');
        })
        .catch((err) => {
          clearTimeout(timer);
          addLog('ESP32_WARN', `Could not reach ${config.esp32Ip} within 1.5s timeout (${err.message}). Speech continuing.`, 'WARN');
        });
    } catch (err: any) {
      console.warn('ESP32 error:', err);
    }
  };

  const lastUserQueryRef = useRef<number>(0);

  const fetchGeminiWithRetry = async (geminiKey: string, requestBody: any, maxRetries = 3) => {
    const models = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-pro'];
    let lastError: any = null;

    for (const model of models) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      let delayMs = 3000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (response.status === 429) {
            addLog('QUOTA_LIMIT', `[QUOTA_LIMIT] Rate limit hit on ${model}. Retrying in ${delayMs / 1000}s... (Attempt ${attempt}/${maxRetries})`, 'WARN');
            await new Promise((r) => setTimeout(r, delayMs));
            delayMs *= 2; // Exponential backoff (3s -> 6s -> 12s)
            continue;
          }

          const data = await response.json();

          if (!response.ok) {
            const errText = JSON.stringify(data);
            lastError = new Error(`HTTP ${response.status}: ${errText}`);
            if (response.status === 404 || errText.includes('not found') || errText.includes('INVALID_ARGUMENT')) {
              break; // Skip to next model immediately on 404
            }
            throw lastError;
          }

          return data;
        } catch (err: any) {
          lastError = err;
          if (err.message && err.message.includes('429')) {
            if (attempt < maxRetries) {
              addLog('QUOTA_LIMIT', `[QUOTA_LIMIT] Rate limit hit. Retrying in ${delayMs / 1000}s...`, 'WARN');
              await new Promise((r) => setTimeout(r, delayMs));
              delayMs *= 2;
            }
          } else {
            break; // Skip retries for non-429 errors
          }
        }
      }
    }

    throw lastError || new Error('Gemini API request failed.');
  };

  const handleUserQuery = async (queryText: string) => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    // Client-side Request Throttle (min 5,000ms delay between consecutive user queries)
    const timeSinceLastQuery = Date.now() - lastUserQueryRef.current;
    if (timeSinceLastQuery < 5000) {
      const waitMs = 5000 - timeSinceLastQuery;
      addLog('THROTTLE', `Enforcing 5s query delay for Free Tier. Waiting ${(waitMs / 1000).toFixed(1)}s...`, 'INFO');
      await new Promise((r) => setTimeout(r, waitMs));
    }
    lastUserQueryRef.current = Date.now();

    setRobotState('Gemini Thinking...');
    addLog('GEMINI_REQ', `Query: "${queryText}" (Memory: ${conversationHistory.length} messages)`, 'INFO');

    // Check if Gemini Key exists
    if (!config.geminiKey) {
      addLog('GEMINI_KEY_MISSING', 'No Gemini API Key set. Generating local fallback response...', 'WARN');
      await new Promise((r) => setTimeout(r, 800));
      const fallback = getLocalFallback(queryText);

      setConversationHistory((prev) => {
        const next = [...prev, { role: 'user', content: queryText }, { role: 'assistant', content: JSON.stringify(fallback) }];
        return next.length > 8 ? next.slice(next.length - 8) : next;
      });

      handleGeminiSuccess(fallback);
      return;
    }

    try {
      const contents = conversationHistory.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      contents.push({
        role: 'user',
        parts: [{ text: queryText }],
      });

      const requestBody = {
        system_instruction: {
          parts: [{ text: MASTER_SYSTEM_PROMPT }],
        },
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      };

      const data = await fetchGeminiWithRetry(config.geminiKey, requestBody, 3, 6000);
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      addLog('GEMINI_RAW_RESP', rawContent, 'DEBUG');

      let parsed: GeminiResponse;
      try {
        let cleanStr = rawContent;
        if (cleanStr.startsWith('```')) {
          cleanStr = cleanStr.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
        }
        parsed = JSON.parse(cleanStr);
      } catch (parseErr) {
        addLog('JSON_PARSE_WARN', 'Failed to parse JSON. Falling back to string extraction.', 'WARN');
        parsed = {
          speech: rawContent.replace(/\{.*?\}/g, '').replace(/\[.*?\]/g, '').trim() || 'Welcome to our museum exhibit!',
          action: 'BOW',
        };
      }

      setConversationHistory((prev) => {
        const next = [...prev, { role: 'user', content: queryText }, { role: 'assistant', content: rawContent }];
        return next.length > 8 ? next.slice(next.length - 8) : next;
      });

      handleGeminiSuccess(parsed);
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      addLog('GEMINI_ERROR', err.message, 'ERROR');

      const fallback = getLocalFallback(queryText);

      setConversationHistory((prev) => {
        const next = [...prev, { role: 'user', content: queryText }, { role: 'assistant', content: JSON.stringify(fallback) }];
        return next.length > 8 ? next.slice(next.length - 8) : next;
      });

      handleGeminiSuccess(fallback);
    }
  };

  const handleGeminiSuccess = (result: GeminiResponse) => {
    const speech = result.speech || 'Welcome to the museum!';
    const action = (result.action || 'IDLE').toUpperCase() as RobotAction;

    setCurrentAction(action);
    addLog('GEMINI_PARSED', `Speech: "${speech}" | Action: [${action}]`, 'ROBOT');

    setRobotState('ESP32 Moving...');
    sendMoveToESP32(action);

    setRobotState('Speaking...');
    generateAndPlaySpeech(speech);
  };

  const generateAndPlaySpeech = async (speechText: string) => {
    if (!config.elevenKey) {
      addLog('TTS_FALLBACK', 'ElevenLabs API key missing. Using browser SpeechSynthesis.', 'WARN');
      speakBrowserFallback(speechText);
      return;
    }

    try {
      addLog('TTS_REQ', `Calling ElevenLabs TTS...`, 'INFO');
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId || DEFAULT_ADAM_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': config.elevenKey,
        },
        body: JSON.stringify({
          text: speechText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`TTS HTTP ${response.status}: ${errText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        addLog('AUDIO_PLAY', 'Playing ElevenLabs speech audio binary...', 'SUCCESS');
      };

      audio.onended = () => {
        addLog('AUDIO_END', 'Speech playback finished.', 'INFO');
        setRobotState('Idle');
      };

      audio.onerror = () => {
        addLog('AUDIO_ERR', 'Error playing MP3 stream.', 'ERROR');
        setRobotState('Idle');
      };

      audio.play().catch((err) => {
        console.warn('Autoplay block:', err);
        addLog('AUTOPLAY_BLOCK', 'Autoplay blocked. User gesture needed.', 'WARN');
        setRobotState('Idle');
      });
    } catch (err: any) {
      console.error('ElevenLabs Error:', err);
      addLog('TTS_ERR', `ElevenLabs error: ${err.message}. Falling back to browser speech.`, 'ERROR');
      speakBrowserFallback(speechText);
    }
  };

  const speakBrowserFallback = (text: string) => {
    if (!('speechSynthesis' in window)) {
      addLog('SPEECH_SYNTH_ERR', 'Browser does not support SpeechSynthesis.', 'ERROR');
      setRobotState('Idle');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      addLog('BROWSER_TTS_END', 'Browser speech completed.', 'INFO');
      setRobotState('Idle');
    };
    utterance.onerror = () => {
      setRobotState('Idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  const getLocalFallback = (q: string): GeminiResponse => {
    const text = q.toLowerCase();
    if (text.includes('hello') || text.includes('hi') || text.includes('who are you')) {
      return { speech: 'Welcome to our exhibit! I am Tararbari, your autonomous cultural guide.', action: 'BOW' };
    } else if (text.includes('artifact') || text.includes('exhibit') || text.includes('tell me')) {
      return { speech: 'This remarkable piece dates back centuries and showcases incredible ancient craftsmanship.', action: 'POINT_EXHIBIT' };
    } else if (text.includes('bye') || text.includes('goodbye')) {
      return { speech: 'Thank you for visiting our museum exhibit today! Have a wonderful day.', action: 'WAVE' };
    }
    return { speech: 'I am delighted to guide you through our museum artifacts today!', action: 'NOD' };
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-100 bg-[#090514]">
      <Header config={config} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <ConfigPanel 
          config={config} 
          onSave={handleSaveConfig} 
          onTestEsp32={handleTestEsp32} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <RobotAvatar currentAction={currentAction} />
            <ManualControls onTriggerMove={triggerManualAction} />
          </div>

          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <VoiceController
              robotState={robotState}
              isListening={isListening}
              onToggleListen={toggleListen}
              onSubmitText={(text) => {
                addLog('USER_TEXT', text, 'USER');
                handleUserQuery(text);
              }}
            />

            <LogViewer 
              logs={logs} 
              onClear={() => setLogs([])} 
              memoryTurnCount={Math.floor(conversationHistory.length / 2)}
              onResetMemory={() => setConversationHistory([])}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-purple-900/40 bg-[#090514]/90 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        <p>Tararbari AI Museum Robot Control Interface &bull; Robotics Competition Build &bull; Google Gemini API + ElevenLabs + ESP32</p>
      </footer>
    </div>
  );
}
