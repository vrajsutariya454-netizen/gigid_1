export type VoiceCommand =
  | "GO_HOME"
  | "GO_DASHBOARD"
  | "GO_PLATFORMS"
  | "GO_DATA_HUB"
  | "GO_BANK"
  | "GO_KYC"
  | "SHOW_CREDENTIALS"
  | "SHARE_PROOF"
  | "SHOW_SETTINGS"
  | "CONNECT_PLATFORM"
  | "SHOW_PROFILE"
  | "SHOW_HELP"
  | "UNKNOWN";

interface CommandMapping {
  command: VoiceCommand;
  patterns: Record<string, string[]>;
}

const COMMAND_MAPPINGS: CommandMapping[] = [
  {
    command: "SHOW_HELP",
    patterns: {
      en: ["help", "show help", "what can i say", "commands"],
      hi: ["मदद", "सहायता"],
      ta: ["உதவி", "உதவி காட்டு"],
      bn: ["সাহায্য", "সাহায্য দেখাও"],
    },
  },
  {
    command: "GO_HOME",
    patterns: {
      en: ["go home", "home", "main page", "go back", "home page", "take me home"],
      hi: ["घर जाओ", "होम", "मुख्य पृष्ठ", "वापस जाओ", "घर"],
      ta: ["முகப்பு", "வீடு", "முகப்பு பக்கம்"],
      bn: ["হোম", "বাড়ি", "মূল পাতা"],
    },
  },
  {
    command: "GO_DASHBOARD",
    patterns: {
      en: ["dashboard", "go to dashboard", "show dashboard", "open dashboard"],
      hi: ["डैशबोर्ड", "डैशबोर्ड दिखाओ"],
      ta: ["டாஷ்போர்டு", "டாஷ்போர்டு காட்டு"],
      bn: ["ড্যাশবোর্ড", "ড্যাশবোর্ড দেখাও"],
    },
  },
  {
    command: "GO_PLATFORMS",
    patterns: {
      en: ["platforms", "go to platforms", "show platforms", "my platforms", "nodes"],
      hi: ["प्लेटफॉर्म", "प्लेटफॉर्म दिखाओ", "नोड्स"],
      ta: ["தளங்கள்", "தளங்கள் காட்டு"],
      bn: ["প্ল্যাটফর্ম", "প্ল্যাটফর্ম দেখাও"],
    },
  },
  {
    command: "GO_DATA_HUB",
    patterns: {
      en: ["data hub", "go to data hub", "data", "show data", "vault", "records"],
      hi: ["डेटा हब", "डेटा दिखाओ", "रिकॉर्ड"],
      ta: ["தரவு மையம்", "தரவு காட்டு"],
      bn: ["ডেটা হাব", "ডেটা দেখাও"],
    },
  },
  {
    command: "GO_BANK",
    patterns: {
      en: ["bank", "go to bank", "wallet", "gig wallet", "banking", "show bank", "open bank"],
      hi: ["बैंक", "वॉलेट", "गिग वॉलेट", "बैंक दिखाओ"],
      ta: ["வங்கி", "கிக் வாலட்", "வங்கி காட்டு"],
      bn: ["ব্যাংক", "গিগ ওয়ালেট", "ব্যাংক দেখাও"],
    },
  },
  {
    command: "GO_KYC",
    patterns: {
      en: ["kyc", "go to kyc", "verification", "verify identity", "kyc center"],
      hi: ["केवाईसी", "सत्यापन", "पहचान सत्यापित करो"],
      ta: ["KYC", "KYC மையம்", "சரிபார்ப்பு"],
      bn: ["KYC", "KYC সেন্টার", "যাচাইকরণ"],
    },
  },
  {
    command: "SHOW_CREDENTIALS",
    patterns: {
      en: [
        "show credentials",
        "my credentials",
        "credentials",
        "documents",
        "show documents",
        "certificates",
      ],
      hi: [
        "दस्तावेज़ दिखाओ",
        "मेरे दस्तावेज़",
        "प्रमाणपत्र",
        "कागजात",
      ],
      ta: ["சான்றிதழ்கள்", "ஆவணங்கள்"],
      bn: ["শংসাপত্র", "নথিপত্র"],
    },
  },
  {
    command: "SHARE_PROOF",
    patterns: {
      en: [
        "share proof",
        "share",
        "generate proof",
        "create proof",
        "share credentials",
        "send proof",
      ],
      hi: [
        "साझा करो",
        "प्रमाण भेजो",
        "प्रूफ बनाओ",
        "शेयर करो",
      ],
      ta: ["பகிர்", "சான்று உருவாக்கு"],
      bn: ["শেয়ার করো", "প্রমাণ পাঠাও"],
    },
  },
  {
    command: "SHOW_SETTINGS",
    patterns: {
      en: [
        "settings",
        "show settings",
        "preferences",
        "change language",
        "change theme",
      ],
      hi: ["सेटिंग्स", "सेटिंग दिखाओ", "भाषा बदलो", "थीम बदलो"],
      ta: ["அமைப்புகள்", "மொழி மாற்று"],
      bn: ["সেটিংস", "ভাষা পরিবর্তন করো"],
    },
  },
  {
    command: "CONNECT_PLATFORM",
    patterns: {
      en: [
        "connect platform",
        "add platform",
        "connect app",
        "add app",
        "connect zomato",
        "connect uber",
        "connect swiggy",
        "new platform",
      ],
      hi: [
        "प्लेटफॉर्म जोड़ो",
        "ऐप जोड़ो",
        "नया प्लेटफॉर्म",
        "ज़ोमैटो जोड़ो",
        "उबर जोड़ो",
      ],
      ta: ["தளம் இணை", "புதிய தளம்"],
      bn: ["প্ল্যাটফর্ম যোগ করো", "নতুন প্ল্যাটফর্ম"],
    },
  },
  {
    command: "SHOW_PROFILE",
    patterns: {
      en: ["profile", "my profile", "show profile", "account"],
      hi: ["प्रोफाइल", "मेरी प्रोफाइल", "खाता"],
      ta: ["சுயவிவரம்", "என் சுயவிவரம்"],
      bn: ["প্রোফাইল", "আমার প্রোফাইল"],
    },
  },
];

export function parseVoiceCommand(
  transcript: string,
  locale: string = "en"
): { command: VoiceCommand; confidence: number } {
  const normalizedTranscript = transcript.toLowerCase().trim();
  const lang = locale.split("-")[0];

  let bestMatch: { command: VoiceCommand; confidence: number } = {
    command: "UNKNOWN",
    confidence: 0,
  };

  for (const mapping of COMMAND_MAPPINGS) {
    const patterns = mapping.patterns[lang] || mapping.patterns["en"];

    for (const pattern of patterns) {
      const normalizedPattern = pattern.toLowerCase();

      // Exact match
      if (normalizedTranscript === normalizedPattern) {
        return { command: mapping.command, confidence: 1.0 };
      }

      // Contains match
      if (normalizedTranscript.includes(normalizedPattern)) {
        const confidence = normalizedPattern.length / normalizedTranscript.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = { command: mapping.command, confidence: Math.min(confidence + 0.3, 0.95) };
        }
      }

      // Fuzzy match - Levenshtein-like
      const similarity = calculateSimilarity(normalizedTranscript, normalizedPattern);
      if (similarity > 0.6 && similarity > bestMatch.confidence) {
        bestMatch = { command: mapping.command, confidence: similarity };
      }
    }
  }

  return bestMatch;
}

function calculateSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshtein(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export class SpeechEngine {
  private recognition: any | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private onResult: ((transcript: string, command: VoiceCommand) => void) | null = null;
  private onStateChange: ((listening: boolean) => void) | null = null;
  private onError: (() => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        this.recognition = new SpeechRecognitionAPI();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
      }
      this.synthesis = window.speechSynthesis;
    }
  }

  get isSupported(): boolean {
    return this.recognition !== null;
  }

  get isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }

  setOnResult(callback: (transcript: string, command: VoiceCommand) => void) {
    this.onResult = callback;
  }

  setOnStateChange(callback: (listening: boolean) => void) {
    this.onStateChange = callback;
  }

  setOnError(callback: () => void) {
    this.onError = callback;
  }

  startListening(locale: string = "en-IN"): void {
    if (!this.recognition || this.isListening) return;

    this.recognition.lang = locale;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const { command } = parseVoiceCommand(transcript, locale);
      this.onResult?.(transcript, command);
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStateChange?.(true);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStateChange?.(false);
    };

    this.recognition.onerror = () => {
      this.isListening = false;
      this.onStateChange?.(false);
      this.onError?.();
    };

    try {
      this.recognition.start();
    } catch {
      // Already started
    }
  }

  stopListening(): void {
    if (!this.recognition || !this.isListening) return;
    this.recognition.stop();
    this.isListening = false;
    this.onStateChange?.(false);
  }

  speak(text: string, locale: string = "en-IN"): Promise<void> {
    return new Promise((resolve) => {
      if (!this.synthesis) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synthesis.speak(utterance);
    });
  }

  destroy(): void {
    this.stopListening();
    this.synthesis?.cancel();
  }
}

// Extend Window interface for webkit prefix
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}
