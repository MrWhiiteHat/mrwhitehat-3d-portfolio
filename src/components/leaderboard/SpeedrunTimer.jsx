import React, { useEffect, useRef, useState } from 'react';
import { Timer, Trophy } from 'lucide-react';

/**
 * 60 FPS Zero-Re-render Speedrun Timer
 * Updates the DOM element directly on requestAnimationFrame, eliminating 60 React
 * reconciliation passes per second during gameplay for buttery smooth 60 FPS on mobile and PC.
 */
export default function SpeedrunTimer({
  isRunning = true,
  isSolved = false,
  puzzleId = 'projects',
  onFinish = null,
  personalBest = null,
}) {
  const digitsRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerFrameRef = useRef(null);
  const hasFinishedRef = useRef(false);
  const currentElapsedRef = useRef(0);
  const [finalTime, setFinalTime] = useState(null);

  useEffect(() => {
    startTimeRef.current = performance.now();
    hasFinishedRef.current = false;
    currentElapsedRef.current = 0;
    setFinalTime(null);

    if (digitsRef.current) {
      digitsRef.current.textContent = '0.00s';
    }

    const tick = () => {
      if (!startTimeRef.current || hasFinishedRef.current) return;
      const now = performance.now();
      const sec = (now - startTimeRef.current) / 1000;
      currentElapsedRef.current = sec;

      if (digitsRef.current) {
        digitsRef.current.textContent = `${sec.toFixed(2)}s`;
      }

      timerFrameRef.current = requestAnimationFrame(tick);
    };

    if (isRunning && !isSolved) {
      timerFrameRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current);
    };
  }, [isRunning, isSolved, puzzleId]);

  useEffect(() => {
    if (isSolved && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current);
      const finalSec = parseFloat(currentElapsedRef.current.toFixed(2));
      setFinalTime(finalSec);
      if (digitsRef.current) {
        digitsRef.current.textContent = `${finalSec.toFixed(2)}s`;
      }
      onFinish?.(finalSec);
    }
  }, [isSolved, onFinish]);

  const displayTime = finalTime !== null ? finalTime.toFixed(2) : '0.00';
  const isPb = personalBest && finalTime !== null && finalTime < personalBest;

  return (
    <div className={`speedrun-timer-badge ${isSolved ? 'solved' : ''}`}>
      <Timer size={13} className="timer-icon" />
      <span className="timer-label">SPEEDRUN:</span>
      <span className="timer-digits" ref={digitsRef}>
        {displayTime}s
      </span>
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
