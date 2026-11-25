(() => {
    if (!('serviceWorker' in navigator)) return;

    let reloading = false;
    let registration;

    const checkForUpdates = () => {
        if (registration) {
            registration.update().catch(error => {
                console.error('Unable to check for app updates:', error);
            });
        }
    };

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        const canReload = window.dispatchEvent(new Event('app:before-update', { cancelable: true }));
        if (!canReload) return;
        reloading = true;
        window.location.reload();
    });

    window.addEventListener('load', async () => {
        try {
            registration = await navigator.serviceWorker.register('./sw.js');
            checkForUpdates();
            window.addEventListener('focus', checkForUpdates);
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) checkForUpdates();
            });
            window.setInterval(checkForUpdates, 60 * 60 * 1000);
        } catch (error) {
            console.error('Unable to register automatic app updates:', error);
        }
    }, { once: true });
})();
