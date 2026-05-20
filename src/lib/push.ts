export async function subscribeToPushNotifications() {
    // 1. Check if the browser supports notifications
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn("Push notifications are not supported in this browser.");
        return false;
    }

    try {
        // 2. Register the Service Worker
        await navigator.serviceWorker.register('/sw.js');

        // 3. WAIT for the Service Worker to be fully active and ready
        const registration = await navigator.serviceWorker.ready;

        // 4. Ask the user for permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log("User denied permission.");
            return false;
        }

        // 5. Create the subscription object
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        });

        // 6. Send the subscription to your Supabase backend
        const response = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(subscription)
        });

        return response.ok;
    } catch (error) {
        console.error("Failed to subscribe:", error);
        return false;
    }
}