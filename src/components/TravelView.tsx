import React from 'react';
import { 
  Plane, 
  Hotel, 
  CloudSun, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  Clock,
  Compass
} from 'lucide-react';
import { TravelBooking } from '../types';

interface TravelViewProps {
  bookings: TravelBooking[];
}

export const TravelView: React.FC<TravelViewProps> = ({ bookings }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#121418] border border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-400">
            <Plane className="w-4 h-4" />
            <span>AI Executive Travel Operations</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Flights, Hotels, Weather, Lounges & Visa Reminders</h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>TSA PreCheck & Global Entry Verified</span>
        </div>
      </div>

      {/* Bookings List */}
      {!bookings || bookings.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121418] border border-white/10 text-center space-y-3 font-sans">
          <Plane className="w-10 h-10 text-neutral-500 mx-auto stroke-1" />
          <h3 className="text-lg font-medium text-white">No Active Travel Reservations</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Connect your email account in Settings to automatically extract flight confirmations, hotel bookings, and weather advisories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bookings.map((b) => (
            <div 
              key={b.id}
              className="p-6 rounded-2xl bg-[#121418] border border-white/10 hover:border-white/20 transition-all space-y-4 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-emerald-400">
                    {b.type === 'flight' ? <Plane className="w-5 h-5" /> : <Hotel className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{b.title}</h3>
                    <span className="text-xs text-neutral-400 font-medium">{b.provider}</span>
                  </div>
                </div>

                <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  Code: {b.confirmationCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-3.5 rounded-xl border border-white/5 font-mono">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Schedule / Time</span>
                  <span className="text-white">{b.dateTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Location / Terminal</span>
                  <span className="text-neutral-200">{b.location}</span>
                </div>
              </div>

              {b.weatherForecast && (
                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CloudSun className="w-4 h-4 text-amber-400" />
                    <span>Weather Forecast:</span>
                    <span className="text-white font-medium">
                      {typeof b.weatherForecast === 'string' 
                        ? b.weatherForecast 
                        : `${b.weatherForecast?.temp || ''} ${b.weatherForecast?.condition || ''}`}
                    </span>
                  </div>
                  {b.cost && <span className="font-mono text-emerald-400 font-bold">{b.cost}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
