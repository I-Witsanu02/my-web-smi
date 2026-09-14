import React, { useState } from 'react';
import { Language } from '../types';
import { PublicDemo } from '../components/PublicDemo';
import { BrandMark } from '../components/BrandMark';

interface LoginViewProps {
  onLogin: (username: string, password: string, remember: boolean) => Promise<void>;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isSubmitting: boolean;
  error: string;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  language,
  onLanguageChange,
  isSubmitting,
  error,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const publicDemoEnabled = import.meta.env.VITE_PUBLIC_DEMO_ENABLED === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(username, password, remember);
  };

  return (
    <div className="bg-[#f4f7fb] text-[#1a1b21] font-body-md antialiased">
    <section className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col md:flex-row">
      {/* Left Side: Branding & AI Highlights */}
      <div className="relative flex-1 bg-[#002e6f] text-white flex flex-col justify-between p-8 md:p-12 overflow-hidden hidden md:flex">
        {/* Abstract background; no patient radiograph is bundled in the public frontend. */}
        <div className="absolute inset-0 z-0 opacity-50 overflow-hidden">
          <div className="absolute -top-28 -left-28 w-96 h-96 rounded-full border-[70px] border-[#9deee5]/15" />
          <div className="absolute -bottom-36 -right-24 w-[34rem] h-[34rem] rounded-full border-[90px] border-white/10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#002e6f]/90 via-[#003b82]/80 to-[#006a63]/50" />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col h-full justify-between max-w-lg">
          <header>
            <div className="flex items-center gap-3 mb-8">
              <BrandMark inverse className="h-12 w-12" />
              <div>
                <h1 className="font-display-lg text-3xl font-bold tracking-tight">Skeleton Bone Age</h1>
                <p className="font-body-md text-sm opacity-80 mt-0.5">
                  {language === 'th'
                    ? 'ระบบประเมินอายุกระดูกด้วย AI ที่อธิบายได้'
                    : 'Explainable AI Pediatric Bone Age Assessment System'}
                </p>
              </div>
            </div>
          </header>

          <main className="space-y-6 my-auto">
            <div className="space-y-5">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                  <span className="material-symbols-outlined text-[#9deee5] text-2xl">visibility</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-[#a0f1e8]">Explainable AI</h3>
                  <p className="font-body-md text-xs text-white/85 mt-1 leading-relaxed">
                    {language === 'th'
                      ? 'แสดงจุดสำคัญที่มีอิทธิพลต่อผลทำนายและค่าน้ำหนักของแต่ละ ROI เพื่อให้ผู้เชี่ยวชาญตรวจสอบ'
                      : 'Visualizes patient-specific attribution maps and regional ROI-gate weights for reviewer inspection.'}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                  <span className="material-symbols-outlined text-[#9deee5] text-2xl">grid_view</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-[#a0f1e8]">Automated ROI</h3>
                  <p className="font-body-md text-xs text-white/85 mt-1 leading-relaxed">
                    {language === 'th'
                      ? 'ตรวจจับและแยกส่วน Region of Interest (ROI) อัตโนมัติ เพื่อการวิเคราะห์ที่แม่นยำยิ่งขึ้น'
                      : 'Automated extraction & bounding of anatomically relevant ossification centers.'}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
                  <span className="material-symbols-outlined text-[#9deee5] text-2xl">clinical_notes</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-[#a0f1e8]">Clinical Support</h3>
                  <p className="font-body-md text-xs text-white/85 mt-1 leading-relaxed">
                    {language === 'th'
                      ? 'ออกแบบมาเพื่อกระบวนการทำงานของรังสีแพทย์ ช่วยลดเวลาในการประเมินและทำรายงาน'
                      : 'Optimized clinical workflow with bilingual reports, verification checklists, and audit provenance.'}
                  </p>
                </div>
              </div>
            </div>
          </main>

          <footer>
            <div className="bg-[#ba1a1a]/20 border border-[#ba1a1a]/40 rounded-lg p-4 inline-block backdrop-blur-xs">
              <div className="flex items-center gap-2 text-[#ffdad6]">
                <span className="material-symbols-outlined text-base">warning</span>
                <span className="font-label-caps text-xs tracking-wider uppercase font-bold">
                  Research Prototype
                </span>
              </div>
              <p className="font-caption text-xs text-white/75 mt-1">
                Do not upload identifiable patient information. Research use only.
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="box-border flex-none md:flex-1 min-w-0 w-full max-w-full flex flex-col justify-center items-center p-6 md:p-12 bg-white relative overflow-x-hidden">
        {/* Top Right Language Switch */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <div className="inline-flex rounded-lg border border-[#c3c6d4] p-1 bg-[#f3f3fb]">
            <button
              onClick={() => onLanguageChange('th')}
              className={`px-3 py-1 rounded font-label-caps text-xs transition-all ${
                language === 'th'
                  ? 'bg-white shadow-xs text-[#002e6f] font-bold'
                  : 'text-[#434752] hover:text-[#002e6f]'
              }`}
            >
              ไทย
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 rounded font-label-caps text-xs transition-all ${
                language === 'en'
                  ? 'bg-white shadow-xs text-[#002e6f] font-bold'
                  : 'text-[#434752] hover:text-[#002e6f]'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="min-w-0 w-[calc(100vw-3rem)] max-w-[420px] md:w-full">
          <div className="mb-8 text-center md:text-left">
            {/* Mobile Header */}
            <div className="md:hidden flex flex-col items-center mb-6">
              <BrandMark className="mb-2 h-12 w-12" />
              <h1 className="font-headline-md text-2xl font-bold text-[#002e6f]">Skeleton Bone Age</h1>
            </div>

            <span className="inline-block bg-[#004e62] text-[#84bed5] font-data-mono text-xs px-3 py-1 rounded-full mb-4 font-semibold">
              Local Research MVP
            </span>

            <h2 className="font-display-lg text-3xl font-bold text-[#1a1b21] mb-1">
              {language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
            </h2>
            <p className="font-body-md text-sm text-[#434752]">
              {language === 'th'
                ? 'ลงชื่อเข้าใช้เพื่อเข้าถึงโปรแกรมต้นแบบ'
                : 'Access the pediatric bone age research prototype'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-label-caps text-xs text-[#1a1b21] mb-1.5 font-bold">
                Username / ชื่อผู้ใช้
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-[#c3c6d4] bg-white text-[#1a1b21] focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none transition-all text-sm font-body-md"
                placeholder="Enter username"
                type="text"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-label-caps text-xs text-[#1a1b21] font-bold">
                  Password / รหัสผ่าน
                </label>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-lg border border-[#c3c6d4] bg-white text-[#1a1b21] focus:border-[#002e6f] focus:ring-1 focus:ring-[#002e6f] outline-none transition-all text-sm font-body-md"
                placeholder="••••••••"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] px-3 py-2 text-xs text-[#93000a]">
                {error}
              </div>
            )}

            <div className="flex items-center pt-1">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-[#c3c6d4] text-[#002e6f] focus:ring-[#002e6f] w-4 h-4"
              />
              <label htmlFor="remember" className="ml-2 text-xs text-[#434752] cursor-pointer">
                {language === 'th' ? 'จดจำการเข้าสู่ระบบ' : 'Remember my session'}
              </label>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-lg bg-[#002e6f] disabled:bg-[#9aa5b8] text-white font-headline-sm text-base font-semibold hover:bg-[#00439b] transition-all flex justify-center items-center gap-2 shadow-sm cursor-pointer disabled:cursor-not-allowed active:scale-98"
              >
                {isSubmitting && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                {isSubmitting
                  ? language === 'th' ? 'กำลังเข้าสู่ระบบ...' : 'Signing in...'
                  : language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-[#dfe2eb]" />
            <span className="text-xs font-semibold text-[#737784]">
              {language === 'th' ? 'หรือ' : 'OR'}
            </span>
            <div className="h-px flex-1 bg-[#dfe2eb]" />
          </div>

          <section className="rounded-xl border border-[#c7d5ea] bg-[#f7faff] p-4" aria-labelledby="up-account-title">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8efff] text-[#003fa5]">
                <span className="material-symbols-outlined">account_balance</span>
              </div>
              <div>
                <h3 id="up-account-title" className="text-sm font-bold text-[#002e6f]">
                  {language === 'th' ? 'เข้าสู่ระบบด้วย UP Account' : 'Sign in with UP Account'}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#565b68]">
                  {language === 'th'
                    ? 'สำหรับบุคลากรมหาวิทยาลัยพะเยาและโรงพยาบาลมหาวิทยาลัยพะเยา'
                    : 'For University of Phayao and University Hospital personnel'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled
              aria-describedby="up-account-status"
              className="mt-4 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[#d9e2f3] px-4 text-sm font-bold text-[#52627a]"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              {language === 'th' ? 'เชื่อมต่อ UP Account (เร็ว ๆ นี้)' : 'UP Account integration coming soon'}
            </button>

            <div id="up-account-status" className="mt-3 flex items-start gap-2 rounded-lg bg-[#fff7e6] px-3 py-2 text-xs text-[#6e4b00]">
              <span className="material-symbols-outlined mt-px text-base">info</span>
              <span>
                {language === 'th'
                  ? 'กำลังรอการลงทะเบียนระบบและข้อมูลเชื่อมต่อจากฝ่ายเทคโนโลยีสารสนเทศ มหาวิทยาลัยพะเยา'
                  : 'Pending application registration and connection details from University IT.'}
              </span>
            </div>

            <a
              href="https://reg.up.ac.th/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#00439b] underline-offset-2 hover:underline"
            >
              {language === 'th' ? 'ดูระบบบริการการศึกษา มหาวิทยาลัยพะเยา' : 'View the University of Phayao registration system'}
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </section>

          <p className="font-caption text-xs text-center text-[#737784] mt-8 max-w-xs mx-auto leading-relaxed">
            {language === 'th'
              ? 'การเข้าใช้งานหมายถึงท่านยอมรับข้อตกลงการใช้งานโปรแกรมต้นแบบและนโยบายความเป็นส่วนตัว'
              : 'By logging in, you agree to the Research Prototype Terms of Use and Privacy Policy.'}
          </p>

          {publicDemoEnabled ? (
            <a href="#public-demo" className="mx-auto mt-5 flex w-fit items-center gap-1 text-xs font-bold text-[#006a63] hover:text-[#004e49]">
              {language === 'th' ? 'เลื่อนลงเพื่อทดลองโดยไม่ต้องเข้าสู่ระบบ' : 'Scroll down to try without signing in'}
              <span className="material-symbols-outlined motion-safe:animate-bounce">keyboard_arrow_down</span>
            </a>
          ) : (
            <p className="mx-auto mt-5 max-w-xs text-center text-xs font-semibold leading-relaxed text-[#52627a]">
              {language === 'th'
                ? 'การประเมินภาพใช้งานผ่านบัญชีวิจัยที่ได้รับอนุญาตเท่านั้น'
                : 'Image assessment is available through an authorized research account only.'}
            </p>
          )}
        </div>
      </div>
    </section>
      {publicDemoEnabled && <PublicDemo language={language} />}
    </div>
  );
};
