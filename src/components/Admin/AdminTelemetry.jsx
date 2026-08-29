import React from 'react';
import { Radio, Wifi, Phone, ShieldCheck, Activity, Globe } from 'lucide-react';

export default function AdminTelemetry() {
  const stunServers = [
    { url: 'stun:stun.l.google.com:19302', latency: '24ms', status: 'Healthy' },
    { url: 'stun:stun1.l.google.com:19302', latency: '26ms', status: 'Healthy' },
    { url: 'stun:stun2.l.google.com:19302', latency: '28ms', status: 'Healthy' },
    { url: 'stun:stun3.l.google.com:19302', latency: '31ms', status: 'Healthy' }
  ];

  const recentCalls = [
    { id: 'call_901', caller: 'Arif Mahmud', callee: 'Sadia Rahman', type: 'Video HD', duration: '14m 20s', bitrate: '1.8 Mbps', quality: 'Excellent' },
    { id: 'call_902', caller: 'Tanvir Ahmed', callee: 'Nusrat Jahan', type: 'Audio E2EE', duration: '08m 10s', bitrate: '64 kbps', quality: 'Good' },
    { id: 'call_903', caller: 'Arif Mahmud', callee: 'Rakib Hasan', type: 'Screen Share', duration: '32m 45s', bitrate: '2.4 Mbps', quality: 'Excellent' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">WebRTC সিগনালিং ও নেটওয়ার্ক টেলিমেট্রি</h2>
        <p className="text-xs text-slate-400">Google STUN NAT ট্রাভার্সাল এবং ড্যুরেবল অবজেক্ট রিয়েল-টাইম স্টেট</p>
      </div>

      {/* STUN Cluster Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stunServers.map((s, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 truncate">{s.url}</span>
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {s.status}
              </span>
              <span className="text-xs font-mono text-slate-300">{s.latency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Call History Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 font-bold text-xs text-slate-200 flex items-center space-x-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>সাম্প্রতিক WebRTC P2P কল লগ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-3 px-4">কলার & প্রাপক</th>
                <th className="py-3 px-4">কল টাইপ</th>
                <th className="py-3 px-4">স্থিতিকাল (Duration)</th>
                <th className="py-3 px-4">বিটরেট</th>
                <th className="py-3 px-4">কোয়ালিটি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentCalls.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-semibold text-white">
                    {c.caller} <span className="text-slate-500 font-normal">➔</span> {c.callee}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px]">
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{c.duration}</td>
                  <td className="py-3 px-4 text-cyan-400 font-mono">{c.bitrate}</td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">{c.quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
