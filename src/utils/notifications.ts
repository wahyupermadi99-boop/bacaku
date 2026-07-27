export type ToastNotification = {
  id: string;
  title: string;
  body: string;
  timestamp: number;
};

type ToastListener = (toast: ToastNotification) => void;
const toastListeners: ToastListener[] = [];

export function subscribeToToasts(listener: ToastListener) {
  toastListeners.push(listener);
  return () => {
    const idx = toastListeners.indexOf(listener);
    if (idx >= 0) toastListeners.splice(idx, 1);
  };
}

export function triggerInAppToast(title: string, body: string) {
  const toast: ToastNotification = {
    id: `toast-${Date.now()}`,
    title,
    body,
    timestamp: Date.now(),
  };
  toastListeners.forEach((fn) => fn(toast));
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (!('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (e) {
    console.warn('Notification permission request failed or not allowed:', e);
    return false;
  }
}

export function sendReadingReminderNotification(title: string, body: string) {
  // Always trigger in-app toast as well so it's visible in iframe/mobile
  triggerInAppToast(title, body);

  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icon-reading.png',
        badge: '/icon-reading.png',
        tag: 'bacaku-reminder',
      });
    }
  } catch (e) {
    console.warn('Native notification suppressed by browser/iframe policy:', e);
  }
}

export function playReminderSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.3); // G5

    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start();
    osc.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
}
