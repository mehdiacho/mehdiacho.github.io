import React, { useState, useEffect } from 'react';
import { Wifi, Activity, MapPin } from 'lucide-react';
import { PROFILE } from '../constants';

const SystemStatus: React.FC = () => {
  const [uptime, setUptime] = useState<string>("CALCULATING...");

  useEffect(() => {
    const calculateUptime = () => {
      const now = new Date();
      const birth = PROFILE.birthDate;
      const diff = now.getTime() - birth.getTime();

      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return `${years}Y ${days}D ${hours}H ${minutes}M ${seconds}S`;
    };

    setUptime(calculateUptime());
    const interval = setInterval(() => {
      setUptime(calculateUptime());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800 p-2 font-mono text-xs flex flex-col md:flex-row justify-between items-start md:items-center text-zinc-500 z-50 sticky top-0 backdrop-blur-sm bg-opacity-90">
      <div className="flex items-center gap-4 mb-2 md:mb-0">
        <span className="flex items-center text-cyan-500 font-bold">
          <Wifi size={14} className="mr-2" />
          SYSTEM_ONLINE
        </span>
        <span className="hidden md:inline text-zinc-700">|</span>
        <span className="flex items-center">
          <MapPin size={14} className="mr-2" />
          {PROFILE.coordinates}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="uppercase text-zinc-400">
          UPTIME: <span className="text-zinc-200">{uptime}</span>
        </span>
        <span className="hidden md:inline text-zinc-700">|</span>
        <span className="flex items-center text-emerald-500">
          <Activity size={14} className="mr-2" />
          STABLE
        </span>
      </div>
    </div>
  );
};

export default SystemStatus;