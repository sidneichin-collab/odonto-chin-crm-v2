import { useState, useEffect } from 'react';

/**
 * Hook para controlar a exibição do banner motivacional diário
 * Garante que o banner apareça apenas 1x por dia
 */
export function useDailyBanner() {
  const [shouldShowBanner, setShouldShowBanner] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem('lastBannerShown');

    // Se não foi mostrado hoje, mostrar
    if (lastShown !== today) {
      setShouldShowBanner(true);
    }
  }, []);

  const markBannerAsShown = () => {
    const today = new Date().toDateString();
    localStorage.setItem('lastBannerShown', today);
    setShouldShowBanner(false);
  };

  return {
    shouldShowBanner,
    markBannerAsShown
  };
}
