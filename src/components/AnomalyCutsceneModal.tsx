import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FastForward } from 'lucide-react';

interface AnomalyCutsceneModalProps {
  isMuted: boolean;
  onComplete: () => void;
}

const ANOMALY_CUTSCENE_SRC = '/assets/aistudio/PixVerse_V6_Image_Text_540P_Create_a_20second__91ee764c.mp4';

export const AnomalyCutsceneModal: React.FC<AnomalyCutsceneModalProps> = ({
  isMuted,
  onComplete
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completedRef = useRef<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const finishCutscene = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback if browser blocks unmuted autoplay
        if (!videoRef.current) return;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {
          finishCutscene();
        });
      });
    }
  }, [isMuted, finishCutscene]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        finishCutscene();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [finishCutscene]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden"
      role="dialog"
      aria-label="Cutscene Anomaly Fusion Portal"
    >
      <video
        ref={videoRef}
        src={ANOMALY_CUTSCENE_SRC}
        autoPlay
        playsInline
        muted={isMuted}
        onTimeUpdate={() => {
          const v = videoRef.current;
          if (v && v.duration > 0) {
            setProgress(Math.min(100, (v.currentTime / v.duration) * 100));
          }
        }}
        onEnded={finishCutscene}
        onError={finishCutscene}
        className="w-full h-full object-contain"
      />

      {/* Top cinematic vignette & title */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-5 sm:p-8 bg-gradient-to-b from-black/80 via-black/35 to-transparent flex items-start justify-between">
        <div>
          <p className="text-[11px] font-game tracking-[0.22em] uppercase text-fuchsia-300/90">
            Rift Walker · Fusion Awakening
          </p>
          <h2 className="font-title text-xl sm:text-3xl font-black tracking-wider text-white drop-shadow">
            ANOMALY FUSION PORTAL
          </h2>
        </div>
      </div>

      {/* Bottom bar with skip button & progress */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-end">
        <button
          onClick={finishCutscene}
          className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-fuchsia-400/50 hover:border-fuchsia-300 text-slate-100 font-game font-semibold text-sm tracking-wide transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>Lewati Cutscene</span>
          <FastForward className="w-4 h-4 text-fuchsia-300" />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-slate-900">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
