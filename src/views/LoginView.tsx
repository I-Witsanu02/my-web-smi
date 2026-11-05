import React, { useState } from 'react';
import { Language } from '../types';
import { PublicDemo } from '../components/PublicDemo';
import { BrandMark } from '../components/BrandMark';
import boneHandHero from '../assets/bone-hand-hero-v1.png';

type LoginIconName = 'eye' | 'shield' | 'workflow' | 'person' | 'lock' | 'login' | 'flask' | 'arrow' | 'medical';

function LoginIcon({ name, className = '' }: { name: LoginIconName; className?: string }) {
  const common = { className: `sb-icon ${className}`, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'eye') return <svg {...common}><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 2.8 20 6v5.7c0 4.8-3.3 8.3-8 9.6-4.7-1.3-8-4.8-8-9.6V6l8-3.2Z"/><path d="m8.6 12 2.1 2.1 4.8-4.7"/></svg>;
  if (name === 'workflow') return <svg {...common}><circle cx="5" cy="6" r="2"/><circle cx="18.5" cy="7" r="2"/><circle cx="12" cy="18" r="2"/><path d="m6.8 7.1 3.5 8.1M16.7 8.2l-3.4 7"/></svg>;
  if (name === 'person') return <svg {...common}><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.6-3.7 3.1-5.6 6.5-5.6s5.9 1.9 6.5 5.6"/></svg>;
  if (name === 'lock') return <svg {...common}><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/></svg>;
  if (name === 'login') return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3"/><path d="M13 4h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5"/></svg>;
  if (name === 'flask') return <svg {...common}><path d="M9 3h6M10 3v6l-5.4 8.1A2.6 2.6 0 0 0 6.8 21h10.4a2.6 2.6 0 0 0 2.2-3.9L14 9V3"/><path d="M7.2 16h9.6"/></svg>;
  if (name === 'medical') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>;
  return <svg {...common}><path d="M4 12h15M14 6l6 6-6 6"/></svg>;
}

interface LoginViewProps {
  onLogin: (username: string, password: string, remember: boolean) => Promise<void>;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isSubmitting: boolean;
  error: string;
}

const benefitCopy = [
  ['eye', 'Explainable AI', 'แสดงบริเวณที่โมเดลใช้ประกอบการประเมิน เพื่อให้ผู้เชี่ยวชาญตรวจสอบต่อได้'],
  ['shield', 'Safe research workflow', 'แยกผลโมเดล ความเห็นผู้เชี่ยวชาญ และประวัติการทบทวนอย่างตรวจสอบย้อนกลับได้'],
  ['workflow', 'Human-in-the-loop', 'ผลลัพธ์ทุกครั้งต้องมีผู้เชี่ยวชาญทบทวนก่อนใช้เป็นข้อมูลวิจัย'],
] as const satisfies readonly (readonly [LoginIconName, string, string])[];

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, language, onLanguageChange, isSubmitting, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const th = language === 'th';
  const publicDemoEnabled = import.meta.env.VITE_PUBLIC_DEMO_ENABLED === '1';
  const submit = async (event: React.FormEvent) => { event.preventDefault(); await onLogin(username, password, remember); };

  return <main className="sb-login min-h-screen overflow-x-hidden bg-[#f8fbfd] text-[#0a315f]">
    <section className="grid min-h-[720px] lg:min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <aside className="sb-hero relative hidden overflow-hidden bg-[#002e6f] px-10 py-10 text-white lg:flex lg:flex-col xl:px-14 xl:py-12">
        <div className="sb-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="absolute -left-24 -top-28 h-96 w-96 rounded-full border-[70px] border-[#65e4dc]/10" aria-hidden="true" />
        <div className="absolute -bottom-44 -right-40 h-[36rem] w-[36rem] rounded-full border-[90px] border-white/5" aria-hidden="true" />
        <img src={boneHandHero} alt="" aria-hidden="true" className="pointer-events-none absolute right-[2%] top-[9%] h-[78%] max-w-[64%] object-contain mix-blend-screen opacity-75 sb-hand-float" />
        <header className="relative z-10 flex items-center gap-3"><BrandMark inverse className="h-12 w-12" /><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9deee5]">Pediatric AI research</p><h1 className="text-2xl font-bold tracking-tight">Skeleton Bone Age</h1></div></header>
        <div className="relative z-10 mt-16 max-w-[29rem] xl:mt-20"><p className="text-sm font-medium tracking-wide text-[#9deee5]">{th ? 'แพลตฟอร์มวิจัยเพื่อการประเมินอายุกระดูก' : 'A research platform for pediatric bone age assessment'}</p><h2 className="mt-4 text-5xl font-bold leading-[0.98] tracking-[-0.05em] xl:text-6xl">Skeleton<br /><span className="text-[#7ceae2]">Bone Age</span></h2><p className="mt-5 max-w-xs text-sm leading-6 text-white/75">{th ? 'ออกแบบให้ AI ช่วยประเมินภาพ และให้ผู้เชี่ยวชาญเป็นผู้ตัดสินใจทางคลินิก' : 'AI-assisted image assessment with specialist review at the center of every decision.'}</p></div>
        <div className="relative z-10 mt-auto max-w-md space-y-5 pt-10">{benefitCopy.map(([icon, title, body], index) => <div key={title} className="sb-benefit flex gap-4" style={{ animationDelay: `${index * 90}ms` }}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.07] text-xl text-[#9deee5]"><LoginIcon name={icon} /></span><div><h3 className="font-semibold text-[#b7f5ef]">{title}</h3><p className="mt-1 text-xs leading-5 text-white/75">{body}</p></div></div>)}<div className="border-t border-white/15 pt-5 text-xs leading-5 text-white/65"><strong className="block text-sm text-white">Clinical workspace</strong>{th ? 'สำหรับบุคลากรที่ได้รับอนุญาตให้ทบทวนเคสวิจัยและจัดการผล AI' : 'For authorized reviewers managing research cases and AI outputs.'}</div></div>
      </aside>
      <section className="relative flex min-w-0 flex-col px-6 py-6 sm:px-10 lg:px-16 xl:px-24">
        <nav className="flex items-center justify-between gap-4"><div className="flex items-center gap-2 lg:hidden"><BrandMark className="h-10 w-10" /><strong>Skeleton Bone Age</strong></div><div className="ml-auto flex items-center rounded-xl border border-[#cbd7e5] bg-[#f3f7fc] p-1 text-xs font-bold"><button onClick={() => onLanguageChange('th')} className={`rounded-lg px-3 py-1.5 ${th ? 'bg-white text-[#003b82] shadow-sm' : 'text-[#52657e]'}`}>ไทย</button><button onClick={() => onLanguageChange('en')} className={`rounded-lg px-3 py-1.5 ${!th ? 'bg-white text-[#003b82] shadow-sm' : 'text-[#52657e]'}`}>EN</button></div></nav>
        <div className="mx-auto flex w-full max-w-[490px] flex-1 flex-col justify-center py-12"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#007a75]">Authorized clinical review</p><h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#082e5c]">{th ? 'เข้าสู่พื้นที่ทบทวนเคส' : 'Access the clinical workspace'}</h2><p className="mt-3 text-sm leading-6 text-[#5b6d82]">{th ? 'สำหรับแพทย์ นักรังสีแพทย์ และทีมวิจัยที่ได้รับอนุญาตเท่านั้น' : 'For authorized clinicians, radiologists, and research staff.'}</p>
          <form onSubmit={submit} className="sb-login-card mt-8 rounded-2xl border border-[#d7e1ed] bg-white p-6 shadow-[0_24px_80px_rgba(11,47,95,0.10)] sm:p-7"><label className="block text-xs font-bold text-[#203a58]">{th ? 'ชื่อผู้ใช้' : 'Username'}<span className="relative mt-2 block"><LoginIcon name="person" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7690aa]"/><input value={username} onChange={e => setUsername(e.target.value)} className="h-12 w-full rounded-lg border border-[#bdcddd] bg-[#fbfdff] pl-10 pr-3 text-sm outline-none transition focus:border-[#007a75] focus:ring-4 focus:ring-[#7ceae2]/25" placeholder="Enter username" autoComplete="username" required /></span></label><label className="mt-5 block text-xs font-bold text-[#203a58]">{th ? 'รหัสผ่าน' : 'Password'}<span className="relative mt-2 block"><LoginIcon name="lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7690aa]"/><input value={password} onChange={e => setPassword(e.target.value)} className="h-12 w-full rounded-lg border border-[#bdcddd] bg-[#fbfdff] pl-10 pr-3 text-sm outline-none transition focus:border-[#007a75] focus:ring-4 focus:ring-[#7ceae2]/25" placeholder="••••••••" type="password" autoComplete="current-password" required /></span></label>{error && <div role="alert" className="mt-4 rounded-lg border border-[#dc7171]/35 bg-[#fff2f1] px-3 py-2 text-xs text-[#9e2929]">{error}</div>}<label className="mt-4 flex cursor-pointer items-center gap-2 text-xs text-[#5b6d82]"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-[#007a75]" />{th ? 'จดจำการเข้าสู่ระบบบนอุปกรณ์นี้' : 'Remember this session on this device'}</label><button type="submit" disabled={isSubmitting} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#003b82] text-sm font-bold text-white shadow-[0_10px_25px_rgba(0,59,130,0.20)] transition hover:-translate-y-0.5 hover:bg-[#004a9e] disabled:cursor-not-allowed disabled:opacity-60"><LoginIcon name="login" className={isSubmitting ? 'animate-spin' : ''}/>{isSubmitting ? (th ? 'กำลังเข้าสู่ระบบ...' : 'Signing in...') : (th ? 'เข้าสู่ระบบห้องตรวจ' : 'Sign in to workspace')}</button></form>
          {publicDemoEnabled && <><div className="my-6 flex items-center gap-3 text-[11px] font-semibold text-[#91a0b0]"><span className="h-px flex-1 bg-[#dbe4ee]" />{th ? 'หรือ' : 'OR'}<span className="h-px flex-1 bg-[#dbe4ee]" /></div><a href="#public-demo" className="sb-demo-cta flex min-h-16 items-center gap-4 rounded-xl bg-[#007a75] px-5 text-white shadow-[0_16px_38px_rgba(0,122,117,0.20)] transition hover:-translate-y-1 hover:bg-[#006b67]"><span className="flex rounded-lg bg-white/10 p-2"><LoginIcon name="flask" className="h-6 w-6"/></span><span className="flex-1"><strong className="block text-sm">{th ? 'ทดลอง Public Research Demo' : 'Try public research demo'}</strong><small className="mt-0.5 block text-xs text-white/75">{th ? 'ไม่ต้องเข้าสู่ระบบ · ไม่บันทึกภาพ' : 'No sign-in · image is not retained'}</small></span><LoginIcon name="arrow" /></a></>}
          <div className="mt-6 flex gap-3 rounded-xl border border-[#b9e2dd] bg-[#edfafa] px-4 py-3 text-xs leading-5 text-[#315f61]"><LoginIcon name="medical" className="mt-0.5 shrink-0 text-[#007a75]"/><p><strong className="text-[#075d5a]">{th ? 'งานวิจัย ไม่ใช่การวินิจฉัย' : 'Research prototype — not a diagnosis'}</strong><br />{th ? 'ผลการประเมินต้องได้รับการพิจารณาโดยแพทย์หรือผู้เชี่ยวชาญเสมอ' : 'Always consult a physician or qualified specialist.'}</p></div></div>
      </section>
    </section>
    <section className="border-t border-[#dbe4ee] bg-white px-6 py-10 sm:px-10 lg:px-16"><div className="mx-auto flex max-w-6xl items-start gap-5"><span className="flex rounded-xl bg-[#e7f8f6] p-3 text-[#007a75]"><LoginIcon name="workflow" className="h-6 w-6"/></span><div><h2 className="text-xl font-bold tracking-tight text-[#082e5c]">{th ? 'การทดลองที่มีผู้เชี่ยวชาญอยู่ในวงจร' : 'A specialist-in-the-loop research flow'}</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-[#63758a]">{th ? 'อัปโหลดภาพที่ผ่านการลบข้อมูลระบุตัวบุคคล → ตรวจคุณภาพ/ROI → ประมาณค่าโดย AI → ปรึกษาผู้เชี่ยวชาญก่อนใช้ตัดสินใจ' : 'De-identified upload → quality and ROI check → AI estimate → specialist consultation before use.'}</p></div></div></section>
    {publicDemoEnabled && <PublicDemo language={language} />}
  </main>;
};
