import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, Loader } from 'lucide-react';
import { analyzeFace } from '../services/api';
import { useApp } from '../context/AppContext';

const EMOTION_EMOJI = {
    joy: '😄',
    sadness: '😢',
    anger: '😠',
    fear: '😨',
    surprise: '😲',
    disgust: '🤢',
    neutral: '😐',
};

const EMOTION_COLOR = {
    joy: 'text-yellow-500 bg-yellow-50 border-yellow-200',
    sadness: 'text-blue-500 bg-blue-50 border-blue-200',
    anger: 'text-red-500 bg-red-50 border-red-200',
    fear: 'text-purple-500 bg-purple-50 border-purple-200',
    surprise: 'text-pink-500 bg-pink-50 border-pink-200',
    disgust: 'text-green-600 bg-green-50 border-green-200',
    neutral: 'text-slate-500 bg-slate-50 border-slate-200',
};

export default function WebcamEmotion({ onEmotionDetected }) {
    const { darkMode } = useApp();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    const [isOn, setIsOn] = useState(false);
    const [emotion, setEmotion] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState('');

    // ── Start webcam ─────────────────────────────────────────────────
    const startCamera = async () => {
        setError('');
        setLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 320, height: 240, facingMode: 'user' },
                audio: false,
            });
            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setIsOn(true);

            // analyze face every 3 seconds
            intervalRef.current = setInterval(() => {
                captureAndAnalyze();
            }, 3000);

        } catch (err) {
            setError('Camera access denied. Please allow camera in browser settings.');
        } finally {
            setLoading(false);
        }
    };

    // ── Stop webcam ───────────────────────────────────────────────────
    const stopCamera = useCallback(() => {
        clearInterval(intervalRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsOn(false);
        setEmotion(null);
    }, []);

    // ── Capture frame and send to backend ────────────────────────────
    const captureAndAnalyze = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;
        if (analyzing) return;

        setAnalyzing(true);
        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 240;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const base64 = canvas.toDataURL('image/jpeg', 0.8);

            const res = await analyzeFace(base64);
            const data = res.data;

            if (data.success && data.face_detected) {
                setEmotion(data.emotion);
                setConfidence(data.confidence);
                onEmotionDetected?.(data.emotion, data.confidence);
            } else {
                setEmotion('neutral');
            }
        } catch {
            // silent fail — don't interrupt user
        } finally {
            setAnalyzing(false);
        }
    }, [analyzing, onEmotionDetected]);

    // cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, [stopCamera]);

    const em = emotion || 'neutral';
    const emoji = EMOTION_EMOJI[em];
    const color = EMOTION_COLOR[em];

    return (
        <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white border-slate-200'
            }`}>

            {/* Video preview */}
            <div className="relative bg-slate-900 aspect-video max-h-48 overflow-hidden">
                <video
                    ref={videoRef}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isOn ? 'opacity-100' : 'opacity-0'}`}
                    muted
                    playsInline
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlay when camera off */}
                {!isOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <CameraOff size={32} className="text-slate-500" />
                        <p className="text-slate-400 text-sm font-medium">Camera off</p>
                    </div>
                )}

                {/* Analyzing indicator */}
                {analyzing && (
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1 flex items-center gap-1">
                        <Loader size={12} className="text-white animate-spin" />
                        <span className="text-white text-xs">Analyzing</span>
                    </div>
                )}

                {/* Live emotion badge overlay */}
                {isOn && emotion && (
                    <div className={`absolute bottom-2 left-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${color}`}>
                        <span className="text-base">{emoji}</span>
                        <span className="capitalize">{em}</span>
                        <span className="opacity-60">{confidence.toFixed(0)}%</span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="p-3 flex items-center justify-between">
                <div>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Face emotion detection
                    </p>
                    {error && (
                        <p className="text-xs text-red-500 mt-0.5">{error}</p>
                    )}
                </div>

                <button
                    onClick={isOn ? stopCamera : startCamera}
                    disabled={loading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isOn
                            ? darkMode
                                ? 'bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/50'
                                : 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                            : 'bg-primary-600 text-white hover:bg-primary-700'
                        }`}
                >
                    {loading ? (
                        <Loader size={16} className="animate-spin" />
                    ) : isOn ? (
                        <><CameraOff size={16} /> Stop</>
                    ) : (
                        <><Camera size={16} /> Start Camera</>
                    )}
                </button>
            </div>
        </div>
    );
}