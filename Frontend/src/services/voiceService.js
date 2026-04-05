// ── Speech to Text ────────────────────────────────────────────────────
export class SpeechToText {
    constructor(onResult, onError) {
        if (!("webkitSpeechRecognition" in window) &&
            !("SpeechRecognition" in window)) {
            onError("Speech recognition not supported in this browser.");
            return;
        }

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        this.recognition = new SpeechRecognition();
        this.recognition.lang = "en-US";
        this.recognition.continuous = false;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            onResult(transcript, event.results[event.results.length - 1].isFinal);
        };

        this.recognition.onerror = (event) => {
            onError(event.error);
        };
    }

    start() {
        this.recognition?.start();
    }

    stop() {
        this.recognition?.stop();
    }
}



// ── Text to Speech (emotion-aware) ───────────────────────────────────
export class TextToSpeech {
    constructor() {
        this.synth = window.speechSynthesis;
    }

    // emotion changes voice tone and speed
    speak(text, emotion = "neutral") {
        if (!this.synth) return;

        // cancel anything currently speaking
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const settings = this._getVoiceSettings(emotion);

        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;

        // prefer a natural voice if available
        const voices = this.synth.getVoices();
        const preferred = voices.find(v =>
            v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.lang === "en-US"
        );
        if (preferred) utterance.voice = preferred;

        this.synth.speak(utterance);
        return utterance;
    }

    stop() {
        this.synth?.cancel();
    }

    // voice tone adapts to detected emotion
    _getVoiceSettings(emotion) {
        const settings = {
            joy: { rate: 1.1, pitch: 1.1, volume: 1.0 },
            happy: { rate: 1.1, pitch: 1.1, volume: 1.0 },
            neutral: { rate: 1.0, pitch: 1.0, volume: 1.0 },
            sadness: { rate: 0.85, pitch: 0.9, volume: 0.9 },
            fear: { rate: 0.9, pitch: 0.95, volume: 0.95 },
            anger: { rate: 0.85, pitch: 0.85, volume: 0.95 },
            disgust: { rate: 0.9, pitch: 0.9, volume: 0.95 },
            surprise: { rate: 1.05, pitch: 1.05, volume: 1.0 },
        };
        return settings[emotion] || settings.neutral;
    }
}