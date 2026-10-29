import { useCallback, useEffect, useRef, useState } from "react";

let muted = false;
export function isMuted() {
  return muted;
}
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
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function useSpeechRecognition(onFail: () => void) {
  // Lazy init: resolving this in an effect paints the typing UI first, then
  // swaps to the mic on every quiz load (AUD-2 flash).
  const [supported] = useState(() =>
    typeof window !== "undefined" && !!(window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition),
  );
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const recRef = useRef<Rec | null>(null);
  const keepListening = useRef(false);
  const restartTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failRef = useRef(onFail);
  failRef.current = onFail;

  useEffect(() => {
    return () => {
      keepListening.current = false;
      if (restartTimer.current !== null) clearTimeout(restartTimer.current);
      const r = recRef.current;
      recRef.current = null;
      if (r) {
        r.onresult = null;
        r.onerror = null;
        r.onend = null;
        r.abort();
      }
    };
  }, []);

  const start = useCallback(() => {
    if (keepListening.current) return;
    const w = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const C = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!C) return failRef.current();
    window.speechSynthesis?.cancel();
    keepListening.current = true;
    setTranscript("");
    setMicError(null);
    let previous = "";
    const begin = () => {
      restartTimer.current = null;
      if (!keepListening.current) return;
      const r = new C();
      let current = "";
      r.lang = "en-US";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        if (recRef.current !== r) return;
        current = Array.from(e.results, (result) => result[0]?.transcript ?? "").join(" ").trim();
        setTranscript([previous, current].filter(Boolean).join(" "));
      };
      r.onerror = (e) => {
        if (recRef.current !== r || !keepListening.current) return;
        if (e.error === "no-speech") return;
        keepListening.current = false;
        setListening(false);
        console.warn("Speech recognition error:", e.error);
        setMicError(MIC_ERRORS[e.error] ?? `Mic error: ${e.error}`);
        failRef.current();
      };
      r.onend = () => {
        if (recRef.current !== r) return;
        previous = [previous, current].filter(Boolean).join(" ");
        recRef.current = null;
        if (keepListening.current) {
          restartTimer.current = setTimeout(begin, 250);
        } else {
          setListening(false);
        }
      };
      recRef.current = r;
      try {
        r.start();
        setListening(true);
      } catch {
        keepListening.current = false;
        recRef.current = null;
        setListening(false);
        setMicError("Voice recognition couldn't start. Tap the mic to try again, or type your answer.");
        failRef.current();
      }
    };
    begin();
  }, []);

  const stop = useCallback(() => {
    keepListening.current = false;
    if (restartTimer.current !== null) {
      clearTimeout(restartTimer.current);
      restartTimer.current = null;
    }
    if (recRef.current) recRef.current.stop();
    else setListening(false);
  }, []);
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
