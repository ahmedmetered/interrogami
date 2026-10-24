import { useCallback, useEffect, useRef, useState } from "react";

let muted = false;
export function setMuted(m: boolean) {
  muted = m;
  if (m && typeof window !== "undefined") window.speechSynthesis?.cancel();
}

export function speak(text: string) {
  if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  u.voice = voices.find((v) => v.lang === "en-US") ?? voices.find((v) => v.lang === "en-GB") ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  u.lang = u.voice?.lang ?? "en-US";
  u.rate = 1;
  synth.speak(u);
}

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function useSpeechRecognition(onFail: () => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const recRef = useRef<Rec | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    setSupported(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const start = useCallback(() => {
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const C = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!C) return onFail();
    window.speechSynthesis?.cancel();
    const r = new C();
    r.lang = "en-US";
    r.continuous = false;
    r.interimResults = true;
    setTranscript("");
    setMicError(null);
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i]?.[0]?.transcript ?? "";
      setTranscript(t);
    };
    r.onerror = (e) => {
      setListening(false);
      console.warn("Speech recognition error:", e.error);
      setMicError(MIC_ERRORS[e.error] ?? `Mic error: ${e.error}`);
      if (e.error === "not-allowed" || e.error === "no-speech" || e.error === "service-not-allowed" || e.error === "network" || e.error === "audio-capture") onFail();
    };
    r.onend = () => setListening(false);
    recRef.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      onFail();
    }
  }, [onFail]);

  const stop = useCallback(() => recRef.current?.stop(), []);
  return { micError, supported, listening, transcript, setTranscript, start, stop };
}

const MIC_ERRORS: Record<string, string> = {
  "not-allowed": "Microphone permission was blocked. Allow the mic in your browser, or open the app in its own tab.",
  "service-not-allowed": "This browser doesn't allow voice recognition here. Try Chrome in its own tab.",
  network: "Voice recognition needs an internet connection to Google's speech service, and it couldn't reach it.",
  "audio-capture": "No microphone was found. Check your laptop's mic settings.",
  "no-speech": "I didn't hear anything. Speak a bit louder or closer to the mic.",
  aborted: "Listening was interrupted. Tap the mic to try again.",
};
