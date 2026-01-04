// Function to acquire the wake lock
async function acquireLock() {
    if (!isSupported) return;

    try {
        // The request() method is Promise-based and needs to be awaited
        wakeLock = await navigator.wakeLock.request('screen');
        isWakeLocked = true;
        statusMessage = 'Wake Lock is active!';

        // Listen for the 'release' event, which can happen automatically (e.g., browser minimized)
        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released');
            isWakeLocked = false;
            statusMessage = 'Wake Lock was released by the system.';
        });

    } catch (err) {
        // The request failed (e.g., due to low battery, or user denied)
        statusMessage = `${err.name}: ${err.message}`;
    }
}

// Function to release the wake lock manually
async function releaseLock() {
    if (wakeLock) {
        await wakeLock.release(); // This is a Promise
        wakeLock = null;
        isWakeLocked = false;
        statusMessage = 'Wake Lock manually released.';
    }
}