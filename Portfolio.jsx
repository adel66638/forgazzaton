import React from 'react';
import { Github, ExternalLink, Mail, Code, Cpu, Globe } from 'lucide-react';

const Portfolio = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1b] text-slate-300 font-sans selection:bg-blue-500/30">
      
      {/* خلفية بتأثير ضوئي خفيف */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1b]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            FORGAZZATON
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <a href="#about" className="hover:text-blue-400 transition-colors">عني</a>
            <a href="#projects" className="hover:text-blue-400 transition-colors">أعمالي</a>
            <button className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all">
              تواصل معي
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            متاح للمشاريع الجديدة
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter">
            أبني مستقبل <span className="text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-700">الويب.</span>
          </h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            أنا مطور برمجيات شغوف ببناء واجهات مستخدم تفاعلية وتطبيقات ويب سريعة باستخدام أحدث التقنيات.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#projects" className="px-10 py-4 bg-white text-black rounded-full font-bold hover:bg-blue-400 hover:text-white transition-all shadow-2xl shadow-white/5">
              مشاهدة المشاريع
            </a>
            <a href="https://github.com" className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold border border-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2">
              <Github size={20} /> ملف GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {icon: <Code />, name: 'Frontend', desc: 'React, Next.js, Tailwind'},
            {icon: <Cpu />, name: 'Backend', desc: 'Node.js, Express, SQL'},
            {icon: <Globe />, name: 'Deployment', desc: 'Vercel, AWS, Docker'},
            {icon: <Mail />, name: 'UI/UX', desc: 'Figma, Adobe XD'}
          ].map((skill, i) => (
            <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
              <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">{skill.icon}</div>
              <h3 className="text-white font-bold mb-1">{skill.name}</h3>
              <p className="text-xs text-slate-500">{skill.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section id="projects" className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5">
        <h2 className="text-4xl font-bold text-white mb-12">أعمالي المختارة</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[1, 2].map((p) => (
            <div key={p} className="group relative bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/30 transition-all">
              <div className="aspect-video bg-blue-900/20 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a0f1b]/60 backdrop-blur-sm">
                   <button className="p-4 bg-white rounded-full text-black transform translate-y-4 group-hover:translate-y-0 transition-all">
                     <ExternalLink />
                   </button>
                </div>
              </div>
              <div className="p-8">
                <div className="flex gap-2 mb-4">
                  <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">REACT</span>
                  <span className="text-[10px] px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">TAILWIND</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">اسم المشروع الذكي {p}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">تطبيق ويب متكامل يحل مشاكل المستخدمين بطريقة عصرية وجذابة.</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Portfolio;
