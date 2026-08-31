/**
 * Copyright (c) IT Support BD (https://itsupport.com.bd)
 * All rights reserved. Shunnyo (https://shunnyo.itsupport.com.bd)
 */

class NotificationService {
  constructor() {
    this.permission = typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  }

  async requestPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        this.permission = perm;
        return perm === 'granted';
      } catch (err) {
        console.warn('[Notifications] Permission request error:', err);
        return false;
      }
    }
    return false;
  }

  /**
   * 1. Show notification for incoming E2EE messages
   */
  showMessageNotification(senderName, messageText) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (document.visibilityState === 'visible') return; // Don't notify if tab is active

    if (this.permission === 'granted') {
      try {
        const notif = new Notification(senderName || 'Shunnyo', {
          body: messageText || '🔐 নতুন এন্ড-টু-এন্ড এনক্রিপ্টেড বার্তা এসেছে',
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'shunnyo-msg',
          vibrate: [200, 100, 200]
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {
        console.warn('[Notifications] Failed to display:', e);
      }
    }

    // Trigger hardware vibration if supported
    if ('vibrate' in navigator) {
      try { navigator.vibrate([200, 100, 200]); } catch {}
    }
  }

  /**
   * 2. Show notification for incoming Audio/Video Calls
   */
  showCallNotification(callerName, callType = 'video') {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (this.permission === 'granted') {
      try {
        const notif = new Notification(`📞 ইনকামিং ${callType === 'video' ? 'ভিডিও' : 'অডিও'} কল`, {
          body: `${callerName || 'অনলাইন ইউজার'} আপনাকে কল করছেন...`,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: 'shunnyo-call',
          requireInteraction: true,
          vibrate: [500, 250, 500, 250, 500]
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      } catch (e) {}
    }

    if ('vibrate' in navigator) {
      try { navigator.vibrate([500, 250, 500, 250, 500]); } catch {}
    }
  }
}

export const notificationService = new NotificationService();
