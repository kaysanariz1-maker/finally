export type RobotAction = 'BOW' | 'NOD' | 'SHAKE_HEAD' | 'POINT_EXHIBIT' | 'WAVE' | 'IDLE';

export type RobotState = 'Idle' | 'Listening...' | 'Gemini Thinking...' | 'ESP32 Moving...' | 'Speaking...';

export interface SystemConfig {
  geminiKey: string;
  elevenKey: string;
  voiceId: string;
  esp32Ip: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  category: 'USER' | 'ROBOT' | 'HARDWARE' | 'SUCCESS' | 'WARN' | 'ERROR' | 'INFO' | 'DEBUG';
}

export interface GeminiResponse {
  speech: string;
  action: RobotAction;
}
