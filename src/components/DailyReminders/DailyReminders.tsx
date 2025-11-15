import { motion } from 'framer-motion';
import { X, Bell, Clock, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DailyRemindersProps {
  onClose: () => void;
}

export function DailyReminders({ onClose }: DailyRemindersProps) {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:00');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load saved settings
    const savedEnabled = localStorage.getItem('srf-reminders-enabled') === 'true';
    const savedTime = localStorage.getItem('srf-reminders-time') || '08:00';
    setEnabled(savedEnabled);
    setTime(savedTime);

    // Check current notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setMessage('Notifications are not supported in this browser');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        setMessage('Notification permission granted!');
        setTimeout(() => setMessage(''), 3000);
      } else if (result === 'denied') {
        setMessage('Notification permission denied. Please enable in browser settings.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      setMessage('Error requesting permissions');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const testNotification = () => {
    if (permission !== 'granted') {
      setMessage('Please grant notification permission first');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    new Notification('SRF Spiritual Diary', {
      body: 'Your daily wisdom awaits! 🙏',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'srf-test-notification',
    });

    setMessage('Test notification sent!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleToggle = (checked: boolean) => {
    if (checked && permission !== 'granted') {
      requestPermission();
      return;
    }

    setEnabled(checked);
    localStorage.setItem('srf-reminders-enabled', String(checked));

    if (checked) {
      scheduleReminder();
      setMessage('Daily reminders enabled!');
    } else {
      setMessage('Daily reminders disabled');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    localStorage.setItem('srf-reminders-time', newTime);

    if (enabled) {
      scheduleReminder();
      setMessage('Reminder time updated!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const scheduleReminder = () => {
    // Store the schedule in localStorage for service worker to use
    localStorage.setItem('srf-reminders-schedule', JSON.stringify({
      enabled: true,
      time,
      lastScheduled: new Date().toISOString(),
    }));

    // In a real implementation, this would register with service worker
    // For now, we're just storing the settings
    console.log('Reminder scheduled for', time);
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <Check className="w-3 h-3" />
            Granted
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
            Denied
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
            Not Set
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-srf-white to-srf-lotus/20 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading text-2xl text-srf-blue flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Daily Reminders
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Permission Status */}
        <div className="mb-6 p-4 bg-white rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Notification Permission</span>
            {getPermissionBadge()}
          </div>
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="mt-2 w-full px-4 py-2 bg-srf-blue text-white rounded-lg hover:bg-srf-blue/90 transition-colors text-sm"
            >
              Grant Permission
            </button>
          )}
        </div>

        {/* Enable Toggle */}
        <div className="mb-6">
          <label className="flex items-center justify-between p-4 bg-white rounded-lg cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Bell className={`w-5 h-5 ${enabled ? 'text-srf-blue' : 'text-gray-400'}`} />
              <div>
                <div className="font-medium text-gray-900">Enable Daily Reminders</div>
                <div className="text-xs text-gray-500">Get notified to read your daily wisdom</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleToggle(e.target.checked)}
              className="w-5 h-5 text-srf-blue rounded focus:ring-srf-blue"
            />
          </label>
        </div>

        {/* Time Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Reminder Time
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={!enabled}
            className="w-full px-4 py-3 border-2 border-srf-blue/20 rounded-xl focus:outline-none focus:border-srf-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Test Button */}
        {permission === 'granted' && (
          <button
            onClick={testNotification}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors mb-4"
          >
            Test Notification
          </button>
        )}

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg text-center text-sm ${
              message.includes('Error') || message.includes('denied')
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Daily reminders require notification permissions and work best when this app is installed as a PWA. The notification will remind you to read your daily quote.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
