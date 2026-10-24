import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSpeechRecognition } from "@/lib/voice";

class Recognition {
  static instances: Recognition[] = [];
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn(() => this.onend?.());
  abort = vi.fn();
  constructor() { Recognition.instances.push(this); }
  result(text: string, final = true) {
    this.onresult?.({ results: [Object.assign([{ transcript: text }], { isFinal: final })] });
  }
}

function latest() {
  const rec = Recognition.instances.at(-1);
  if (!rec) throw new Error("Recognition not started");
  return rec;
}

describe("continuous voice answers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Recognition.instances = [];
    vi.stubGlobal("SpeechRecognition", Recognition);
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("listens continuously and preserves the answer across browser restarts", () => {
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.start());
    expect(latest().continuous).toBe(true);
    act(() => { latest().result("First point"); latest().onend?.(); });
    expect(result.current.listening).toBe(true);
    act(() => vi.advanceTimersByTime(250));
    act(() => latest().result("Second point", false));
    expect(result.current.transcript).toBe("First point Second point");
    act(() => latest().result("Second point completed"));
    expect(result.current.transcript).toBe("First point Second point completed");
  });

  it("retries silence without reporting failure", () => {
    const fail = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(fail));
    act(() => result.current.start());
    act(() => { latest().onerror?.({ error: "no-speech" }); latest().onend?.(); vi.advanceTimersByTime(250); });
    expect(Recognition.instances).toHaveLength(2);
    expect(result.current.listening).toBe(true);
    expect(fail).not.toHaveBeenCalled();
  });

  it("does not restart after the user stops during a pause", () => {
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.start());
    act(() => { latest().result("My answer"); latest().onend?.(); });
    act(() => result.current.stop());
    act(() => vi.advanceTimersByTime(1000));
    expect(Recognition.instances).toHaveLength(1);
    expect(result.current.listening).toBe(false);
    expect(result.current.transcript).toBe("My answer");
  });

  it("stops the active microphone and accepts its final transcript", () => {
    const { result } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.start());
    const rec = latest();
    rec.stop.mockImplementation(() => { rec.result("Final answer"); rec.onend?.(); });
    act(() => result.current.stop());
    act(() => vi.advanceTimersByTime(1000));
    expect(rec.stop).toHaveBeenCalledOnce();
    expect(result.current.transcript).toBe("Final answer");
    expect(result.current.listening).toBe(false);
    expect(Recognition.instances).toHaveLength(1);
  });

  it("does not loop on blocked permissions or network errors", () => {
    const fail = vi.fn();
    const { result } = renderHook(() => useSpeechRecognition(fail));
    act(() => result.current.start());
    act(() => { latest().result("Saved answer"); latest().onerror?.({ error: "network" }); latest().onend?.(); vi.advanceTimersByTime(1000); });
    expect(Recognition.instances).toHaveLength(1);
    expect(result.current.listening).toBe(false);
    expect(result.current.transcript).toBe("Saved answer");
    expect(result.current.micError).toContain("internet connection");
    expect(fail).toHaveBeenCalledOnce();
  });

  it("releases the microphone and prevents pending restarts on unmount", () => {
    const { result, unmount } = renderHook(() => useSpeechRecognition(vi.fn()));
    act(() => result.current.start());
    const rec = latest();
    unmount();
    expect(rec.abort).toHaveBeenCalledOnce();
    expect(rec.onend).toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(Recognition.instances).toHaveLength(1);
  });
});