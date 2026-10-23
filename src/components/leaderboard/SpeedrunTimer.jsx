import React, { useEffect, useRef, useState } from 'react';
import { Timer, Trophy, Zap } from 'lucide-react';

export default function SpeedrunTimer({
  isRunning = true,
  isSolved = false,
  puzzleId = 'projects',
  onFinish = null,
  personalBest = null,
}) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(null);
  const timerFrameRef = useRef(null);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    startTimeRef.current = performance.now();
    hasFinishedRef.current = false;
    setElapsed(0);

    const tick = () => {
      if (!startTimeRef.current || hasFinishedRef.current) return;
      const now = performance.now();
      setElapsed((now - startTimeRef.current) / 1000);
      timerFrameRef.current = requestAnimationFrame(tick);
    };

    if (isRunning && !isSolved) {
      timerFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current);
    };
  }, [isRunning, puzzleId]);

  useEffect(() => {
    if (isSolved && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current);
      const finalSec = parseFloat(elapsed.toFixed(2));
      onFinish?.(finalSec);
    }
  }, [isSolved, elapsed, onFinish]);

  const formattedTime = elapsed.toFixed(2);
  const isPb = personalBest && elapsed < personalBest;

  return (
    <div className={`speedrun-timer-badge ${isSolved ? 'solved' : ''}`}>
      <Timer size={13} className="timer-icon" />
      <span className="timer-label">SPEEDRUN:</span>
      <span className="timer-digits">{formattedTime}s</span>
      {personalBest && (
        <span className="timer-pb" title="Personal Best">
          PB: {personalBest.toFixed(2)}s
        </span>
      )}
      {isSolved && isPb && (
        <span className="timer-new-pb">
          <Trophy size={11} /> NEW PB!
        </span>
      )}
    </div>
  );
}
