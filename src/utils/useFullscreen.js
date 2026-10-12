import { useCallback, useEffect, useState } from 'react';
import { playClickSound } from './audio.js';

/**
 * Universal Fullscreen hook supporting PC desktop browsers (Chrome, Edge, Firefox, Safari)
 * and Mobile devices (Android Chrome/Firefox, iPadOS, iOS Safari fallback).
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof document === 'undefined') return false;
    return Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      document.body.classList.contains('is-pseudo-fullscreen')
    );
  });

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        document.body.classList.contains('is-pseudo-fullscreen')
      );
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    playClickSound(950);
    try {
      const doc = document;
      const docEl = doc.documentElement;
      const isFS = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement ||
        doc.body.classList.contains('is-pseudo-fullscreen')
      );

      if (!isFS) {
        // Attempt Native Fullscreen API
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen({ navigationUI: 'hide' });
          showToast('FULLSCREEN ENABLED // IMMERSIVE MODE');
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
          showToast('FULLSCREEN ENABLED // IMMERSIVE MODE');
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
          showToast('FULLSCREEN ENABLED // IMMERSIVE MODE');
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
          showToast('FULLSCREEN ENABLED // IMMERSIVE MODE');
        } else {
          // iOS Safari fallback
          doc.body.classList.add('is-pseudo-fullscreen');
          window.scrollTo(0, 1);
          setIsFullscreen(true);
          showToast('FULLSCREEN VIEW ENGAGED');
        }
      } else {
        // Exit Fullscreen
        if (doc.body.classList.contains('is-pseudo-fullscreen')) {
          doc.body.classList.remove('is-pseudo-fullscreen');
          setIsFullscreen(false);
          showToast('FULLSCREEN EXITED');
        } else if (doc.exitFullscreen) {
          await doc.exitFullscreen();
          showToast('FULLSCREEN EXITED');
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
          showToast('FULLSCREEN EXITED');
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
          showToast('FULLSCREEN EXITED');
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
          showToast('FULLSCREEN EXITED');
        } else {
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle request handled:', err);
      // If native request rejected (e.g. permission or platform constraint), fall back to pseudo-fullscreen
      if (!isFullscreen) {
        document.body.classList.add('is-pseudo-fullscreen');
        setIsFullscreen(true);
        showToast('FULLSCREEN VIEW ENGAGED');
      } else {
        document.body.classList.remove('is-pseudo-fullscreen');
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen, showToast]);

  return {
    isFullscreen,
    toggleFullscreen,
    toastMessage,
  };
}
