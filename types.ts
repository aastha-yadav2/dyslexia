
export interface AccessibilitySettings {
  isHighContrast: boolean;
  isFocusMode: boolean;
  isDyslexiaFont: boolean;
  ttsLanguage: string;
  ttsVoiceURI: string | null;
  ttsRate: number;
  ttsVolume: number;
  lineSpacing: 'normal' | 'relaxed' | 'loose';
}
