import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function Timer({
  endTime,
  onTimeUp,
  showIcon = true,
  className = ''
}) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      return remaining;
    };

    const updateTimer = () => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining === 0 && onTimeUp) {
        onTimeUp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const isWarning = timeRemaining <= 300 && timeRemaining > 60;
  const isCritical = timeRemaining <= 60;

  const colorClass = isCritical
    ? 'text-red-600 bg-red-50'
    : isWarning
    ? 'text-orange-600 bg-orange-50'
    : 'text-gray-700 bg-gray-50';

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${colorClass} ${className}`}>
      {showIcon && <Clock className="w-4 h-4" />}
      <span className="font-mono font-medium text-sm">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
}
