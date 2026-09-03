const SPLASHES_URL = 'https://raw.githubusercontent.com/BarricadeCantExpl0it/Chiller-Website-Games/main/assets/text/splashes.json';

function getSplashPool(payload) {
  if (Array.isArray(payload)) return payload.filter(item => typeof item === 'string');
  if (payload && Array.isArray(payload.splashes)) {
    return payload.splashes.filter(item => typeof item === 'string');
  }
  return [];
}

async function loadSplash() {
  const splashElement = document.getElementById('splash');
  if (!splashElement) return;

  try {
    const response = await fetch(SPLASHES_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Splash request failed (${response.status})`);
    }

    const payload = await response.json();
    const splashes = getSplashPool(payload);

    if (splashes.length === 0) {
      throw new Error('No splash entries were returned');
    }

    const randomSplash = splashes[Math.floor(Math.random() * splashes.length)];
    splashElement.textContent = randomSplash;
  } catch (error) {
    console.error('Failed to load splash:', error);
    splashElement.textContent = 'Loading...';
  }
}

document.addEventListener('DOMContentLoaded', loadSplash);
