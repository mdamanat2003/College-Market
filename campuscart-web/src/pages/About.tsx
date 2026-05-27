import React from 'react';
import { Target, ShieldCheck, Zap } from 'lucide-react';

const team = [
  {
    name: 'MD AMANAT ULLAH',
    role: 'Founder & Lead Developer',
    desc: 'Leading the technical vision and full-stack architecture. Passionate about solving real-world campus problems.',
    initials: 'MA',
    color: 'from-blue-100 to-blue-200 text-blue-700'
  },
  {
    name: 'Md Adnan Karim',
    role: 'Co-Founder & Lead UI/UX Designer',
    desc: 'Crafting the premium, intuitive, and SaaS-like visual experience of CampusCart.',
    initials: 'AK',
    color: 'from-purple-100 to-purple-200 text-purple-700'
  },
  {
    name: 'Aftab Mansoori',
    role: 'Co-Founder & Software Engineer',
    desc: 'Building scalable application features and ensuring a smooth, lightning-fast user experience.',
    initials: 'AM',
    color: 'from-emerald-100 to-emerald-200 text-emerald-700'
  },
  {
    name: 'Masab Mallick',
    role: 'Co-Founder & Software Engineer',
    desc: 'Focusing on robust code structures and integrating complex campus-level functionalities.',
    initials: 'MM',
    color: 'from-amber-100 to-amber-200 text-amber-700'
  },
  {
    name: 'Yasir Jamal Noori',
    role: 'Co-Founder & QA Engineer',
    desc: 'The gatekeeper of quality, rigorously testing to ensure every transaction and chat is 100% bug-free.',
    initials: 'YN',
    color: 'from-rose-100 to-rose-200 text-rose-700'
  }
];

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20 mt-10">
          <p className="text-sm uppercase tracking-[0.4em] text-gray-500 mb-4">Our Story</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Built for Students, <span className="text-blue-600">by Students.</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            CampusCart was born out of a simple frustration. We wanted to redefine how college students safely buy, sell, and connect without the daily chaos of unorganized groups.
          </p>
        </div>

        <div className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-50 rounded-2xl">
                  <Target className="h-6 w-6 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">The Campus Problem</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every semester, students need to buy or sell books, drafters, electronics, or cycles. The traditional way? Spamming endless WhatsApp or Telegram groups.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2"><span className="text-red-400">❌</span> Messages get lost in the chat clutter.</li>
                <li className="flex items-start gap-2"><span className="text-red-400">❌</span> No guarantee of the buyer/seller's authenticity.</li>
                <li className="flex items-start gap-2"><span className="text-red-400">❌</span> High risk of last-minute ghosting or payment scams.</li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-blue-100 hover:shadow-md transition relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-40 h-40" />
              </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">The CampusCart Solution</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4 relative z-10">
                We built a dedicated, premium marketplace exclusively for verified university students.
              </p>
              <ul className="space-y-3 text-gray-600 relative z-10">
                <li className="flex items-start gap-2"><span className="text-blue-500">✅</span> <strong>Escrow Payments:</strong> Money is held safely until item delivery.</li>
                <li className="flex items-start gap-2"><span className="text-blue-500">✅</span> <strong>Smart Search:</strong> Categorized listings (no endless scrolling).</li>
                <li className="flex items-start gap-2"><span className="text-blue-500">✅</span> <strong>Verified Trust:</strong> Only real students with college IDs.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Meet the Minds Behind It</h2>
            <p className="text-gray-500 mt-3">The dedicated team turning this vision into reality.</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 max-w-sm text-center hover:-translate-y-1 transition duration-300">
              <div className={`w-20 h-20 bg-gradient-to-br ${team[0].color} rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold mb-5 shadow-sm`}>
                {team[0].initials}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{team[0].name}</h3>
              <p className="text-blue-600 font-semibold mb-3 text-sm">{team[0].role}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{team[0].desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.slice(1).map((member, index) => (
              <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-200 text-center hover:-translate-y-1 transition duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${member.color} rounded-2xl mx-auto flex items-center justify-center text-xl font-bold mb-4 shadow-sm`}>
                  {member.initials}
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3 text-xs mt-1">{member.role}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
