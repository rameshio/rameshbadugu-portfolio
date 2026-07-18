import { useEffect, useState } from 'react';

export default function BackendStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/health', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Backend unavailable');
        return response.json();
      })
      .then((data) => setStatus(data.contactDelivery ? 'ready' : 'online'))
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('offline');
      });

    return () => controller.abort();
  }, []);

  const labels = {
    checking: 'Checking API',
    ready: 'Contact API ready',
    online: 'API online',
    offline: 'Email contact available',
  };

  return (
    <span className="inline-flex items-center gap-2" aria-live="polite">
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === 'ready' ? 'bg-emerald-500' : status === 'offline' ? 'bg-amber-500' : 'bg-blue-500'}`}
        aria-hidden="true"
      />
      {labels[status]}
    </span>
  );
}
