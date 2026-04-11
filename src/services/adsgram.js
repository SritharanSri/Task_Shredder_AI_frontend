// Adsgram SDK integration for rewarded ads
// Docs: https://github.com/adsgram/sdk

/**
 * Initialize Adsgram and show a rewarded ad.
 * @param {string} blockId - Your Adsgram block ID (from Adsgram dashboard)
 * @param {Function} onReward - Called when user finishes watching
 * @param {Function} onError - Called on failure or skip
 */
export function showAdsgramAd({ blockId = 'YOUR_BLOCK_ID', onReward, onError }) {
  // Check if Adsgram SDK is loaded
  if (typeof window.Adsgram === 'undefined') {
    console.warn('Adsgram SDK not loaded. Loading dynamically...');
    loadAdsgramScript(() => showAdsgramAd({ blockId, onReward, onError }));
    return;
  }

  const AdController = window.Adsgram.init({ blockId });

  AdController.show()
    .then((result) => {
      // SDK may resolve with {done:true}, true (boolean), or undefined — treat all truthy / done===true as reward
      if (result === true || result?.done === true || result?.done == null) {
        onReward?.();
      } else {
        onError?.('Ad not completed');
      }
    })
    .catch((err) => {
      // SDK rejects on user skip OR on error; {done:false} means skip, otherwise real error
      if (err?.done === false) {
        onError?.('Ad skipped');
      } else {
        onError?.(err?.description || err?.message || 'Ad failed to load');
      }
    });
}

function loadAdsgramScript(callback) {
  const existing = document.getElementById('adsgram-sdk');
  if (existing) { callback(); return; }

  const script = document.createElement('script');
  script.id = 'adsgram-sdk';
  script.src = 'https://sad.adsgram.ai/js/sad.min.js';
  script.async = true;
  script.onload = callback;
  script.onerror = () => console.error('Failed to load Adsgram SDK');
  document.head.appendChild(script);
}
