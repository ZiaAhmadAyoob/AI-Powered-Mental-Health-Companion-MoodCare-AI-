import { useState, useRef, useCallback } from "react";
import { SpeechToText, TextToSpeech } from "../services/voiceService";

export function useVoice({ onTranscript, onFinalTranscript }) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState(null);

    const sttRef = useRef(null);
    const ttsRef = useRef(new TextToSpeech());

    // ── Start listening ─────────────────────────────────────────────
    const startListening = useCallback(() => {
        setError(null);
        setTranscript("");

        sttRef.current = new SpeechToText(
            (text, isFinal) => {
                setTranscript(text);
                onTranscript?.(text);

                if (isFinal) {
                    setIsListening(false);
                    onFinalTranscript?.(text);
                }
            },
            (err) => {
                setError(err);
                setIsListening(false);
            }
        );

        sttRef.current.start();
        setIsListening(true);
    }, [onTranscript, onFinalTranscript]);

    // ── Stop listening ──────────────────────────────────────────────
    const stopListening = useCallback(() => {
        sttRef.current?.stop();
        setIsListening(false);
    }, []);

    // ── Speak AI response ───────────────────────────────────────────
    const speak = useCallback((text, emotion = "neutral") => {
        setIsSpeaking(true);
        const utterance = ttsRef.current.speak(text, emotion);

        if (utterance) {
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);
        } else {
            setIsSpeaking(false);
        }
    }, []);

    // ── Stop speaking ───────────────────────────────────────────────
    const stopSpeaking = useCallback(() => {
        ttsRef.current.stop();
        setIsSpeaking(false);
    }, []);

    return {
        isListening,
        isSpeaking,
        transcript,
        error,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
    };
}