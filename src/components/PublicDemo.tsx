import React, { useEffect, useMemo, useState } from 'react';
import { api, apiUrl, backendUnavailableOnHostedFrontend, FullHandResult } from '../api';
import { Language } from '../types';

interface PublicDemoProps {
  language: Language;
}

export const PublicDemo: React.FC<PublicDemoProps> = ({ language }) => {
  const [image, setImage] = useState<File | null>(null);
  const [sex, setSex] = useState<'female' | 'male'>('female');
  const [years, setYears] = useState('10');
  const [months, setMonths] = useState('0');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<FullHandResult | null>(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : ''), [image]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!image) return;
    setSubmitting(true);
    setError('');
    setResult(null);
    try {
      const ageMonths = Number(years) * 12 + Number(months);
      const response = await api.predictDemo(
        image,
        sex,
        ageMonths,
        height ? Number(height) : undefined,
        weight ? Number(weight) : undefined,
      );
      setResult(response);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to process this image');
    } finally {
      setSubmitting(false);
    }
  };

  const predicted = result?.prediction;
  const chronologicalMonths = Number(years) * 12 + Number(months);
  const ageDifference = predicted ? predicted.predicted_months - chronologicalMonths : null;

  return (
    <section id="public-demo" className="relative overflow-hidden bg-[#f4f7fb] px-6 py-20 md:px-12">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[8%] top-16 h-52 w-52 rounded-full bg-[#9deee5]/30 blur-3xl motion-safe:animate-pulse" />
        <div className="absolute bottom-12 right-[8%] h-64 w-64 rounded-full bg-[#7ea8ff]/20 blur-3xl motion-safe:animate-pulse" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#93cfc8] bg-[#e6faf7] px-4 py-1.5 text-xs font-bold text-[#006a63]">
            <span className="material-symbols-outlined text-base">science</span>
            PUBLIC RESEARCH DEMO
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#002e6f] md:text-4xl">
            {language === 'th' ? 'ทดลองประเมินอายุกระดูกด้วย AI' : 'Try the AI bone-age research demo'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#565b68] md:text-base">
            {language === 'th'
              ? 'อัปโหลดภาพเอกซเรย์มือและข้อมือเพื่อทดลองระบบตรวจ ROI และประมาณอายุกระดูก ภาพจะประมวลผลในหน่วยความจำและไม่บันทึกในฐานข้อมูล'
              : 'Upload a hand-and-wrist radiograph to test ROI detection and bone-age estimation. The image is processed in memory and is not stored.'}
          </p>
          {backendUnavailableOnHostedFrontend && (
            <div className="mx-auto mt-4 max-w-2xl rounded-lg border border-[#e7bd68] bg-[#fff7e6] px-4 py-3 text-xs leading-relaxed text-[#6e4b00]">
              {language === 'th'
                ? 'หน้า Demo พร้อมแล้ว แต่การประมวลผลออนไลน์กำลังรอเชื่อมต่อเซิร์ฟเวอร์ GPU ภาพและข้อมูลจะยังไม่ถูกส่งจนกว่าการเชื่อมต่อจะพร้อม'
                : 'The Demo interface is ready. Online inference is waiting for the GPU backend connection; no image or data will be sent until it is configured.'}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form onSubmit={submit} className="rounded-2xl border border-[#dce2ec] bg-white p-5 shadow-[0_20px_60px_rgba(0,46,111,0.08)] md:p-7">
            <label className="group relative flex min-h-64 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#aebbd0] bg-[#f8faff] transition hover:border-[#006a63] hover:bg-[#f2fbfa]">
              {preview ? (
                <>
                  <img src={preview} alt="Uploaded hand radiograph preview" className="max-h-80 w-full object-contain" />
                  <div className="demo-scan-line" aria-hidden="true" />
                  <div className="absolute left-[35%] top-[30%] h-14 w-12 rounded-md border border-[#9deee5]/70 demo-roi-float" aria-hidden="true" />
                  <div className="absolute bottom-[18%] right-[34%] h-16 w-20 rounded-md border border-[#7ea8ff]/70 demo-roi-float [animation-delay:-1.4s]" aria-hidden="true" />
                </>
              ) : (
                <div className="px-6 text-center">
                  <span className="material-symbols-outlined text-5xl text-[#4774a8]">radiology</span>
                  <p className="mt-3 text-sm font-bold text-[#002e6f]">
                    {language === 'th' ? 'เลือกภาพเอกซเรย์มือและข้อมือ' : 'Select a hand-and-wrist radiograph'}
                  </p>
                  <p className="mt-1 text-xs text-[#737784]">JPG or PNG · maximum 20 MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={(event) => {
                  setImage(event.target.files?.[0] || null);
                  setResult(null);
                  setError('');
                }}
                required
              />
              {preview && <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#002e6f] shadow">{language === 'th' ? 'เปลี่ยนภาพ' : 'Change image'}</span>}
            </label>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <label className="text-xs font-bold text-[#343944]">
                {language === 'th' ? 'เพศ' : 'Sex'}
                <select value={sex} onChange={(event) => setSex(event.target.value as 'female' | 'male')} className="mt-1.5 h-11 w-full rounded-lg border border-[#c3c6d4] bg-white px-3 text-sm">
                  <option value="female">{language === 'th' ? 'หญิง' : 'Female'}</option>
                  <option value="male">{language === 'th' ? 'ชาย' : 'Male'}</option>
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-bold text-[#343944]">
                  {language === 'th' ? 'อายุ (ปี)' : 'Age (years)'}
                  <input value={years} onChange={(event) => setYears(event.target.value)} type="number" min="0" max="18" className="mt-1.5 h-11 w-full rounded-lg border border-[#c3c6d4] px-3 text-sm" required />
                </label>
                <label className="text-xs font-bold text-[#343944]">
                  {language === 'th' ? 'เดือน' : 'Months'}
                  <input value={months} onChange={(event) => setMonths(event.target.value)} type="number" min="0" max="11" className="mt-1.5 h-11 w-full rounded-lg border border-[#c3c6d4] px-3 text-sm" required />
                </label>
              </div>
              <label className="text-xs font-bold text-[#343944]">
                {language === 'th' ? 'ส่วนสูง (ซม.) — ไม่บังคับ' : 'Height (cm) — optional'}
                <input value={height} onChange={(event) => setHeight(event.target.value)} type="number" min="30" max="230" step="0.1" className="mt-1.5 h-11 w-full rounded-lg border border-[#c3c6d4] px-3 text-sm" />
              </label>
              <label className="text-xs font-bold text-[#343944]">
                {language === 'th' ? 'น้ำหนัก (กก.) — ไม่บังคับ' : 'Weight (kg) — optional'}
                <input value={weight} onChange={(event) => setWeight(event.target.value)} type="number" min="1" max="250" step="0.1" className="mt-1.5 h-11 w-full rounded-lg border border-[#c3c6d4] px-3 text-sm" />
              </label>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#737784]">
              {language === 'th' ? 'หมายเหตุ: โมเดลปัจจุบันใช้ภาพและเพศในการคำนวณ ส่วนสูงและน้ำหนักเป็นข้อมูลประกอบเท่านั้น' : 'Note: the current model uses the image and sex. Height and weight are contextual only.'}
            </p>

            {error && <div role="alert" className="mt-4 rounded-lg border border-[#ba1a1a]/30 bg-[#ffdad6] p-3 text-xs text-[#93000a]">{error}</div>}

            <button disabled={!image || submitting || backendUnavailableOnHostedFrontend} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#006a63] font-bold text-white transition hover:bg-[#00534e] disabled:cursor-not-allowed disabled:bg-[#9aa5b8]">
              <span className={`material-symbols-outlined ${submitting ? 'animate-spin' : ''}`}>{submitting ? 'progress_activity' : 'neurology'}</span>
              {submitting ? (language === 'th' ? 'กำลังวิเคราะห์...' : 'Analyzing...') : (language === 'th' ? 'ทดลองประเมินด้วย AI' : 'Run research assessment')}
            </button>
          </form>

          <div className="relative flex min-h-[32rem] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#002e6f] via-[#003f78] to-[#006a63] p-6 text-white shadow-[0_24px_70px_rgba(0,46,111,0.18)] md:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#9deee5]/20 to-transparent motion-safe:animate-pulse" />
            <div className="demo-orb -right-10 top-24 h-36 w-36 bg-[#9deee5]/10" aria-hidden="true" />
            <div className="demo-orb -left-12 bottom-28 h-28 w-28 bg-[#7ea8ff]/10 [animation-delay:-2s]" aria-hidden="true" />
            <div className="relative flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold tracking-widest text-[#9deee5]">AI ANALYSIS</p>
                  <h3 className="mt-1 text-xl font-bold">{language === 'th' ? 'ผลการทดลอง' : 'Demo result'}</h3>
                </div>
                <span className="material-symbols-outlined text-3xl text-[#9deee5]">view_in_ar</span>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2" aria-label={language === 'th' ? 'ขั้นตอนการประมวลผล' : 'Processing stages'}>
                {[
                  ['upload_file', language === 'th' ? 'รับภาพ' : 'Upload'],
                  ['grid_view', '9 ROI'],
                  ['neurology', language === 'th' ? 'วิเคราะห์' : 'Analyze'],
                  ['fact_check', language === 'th' ? 'ผลลัพธ์' : 'Result'],
                ].map(([icon, label], index) => (
                  <div key={label} className={`rounded-lg border px-2 py-2 text-center transition-all ${result || (submitting && index < 3) ? 'border-[#9deee5]/50 bg-[#9deee5]/15' : 'border-white/15 bg-white/5'}`}>
                    <span className={`material-symbols-outlined block text-lg ${submitting && index === 2 ? 'animate-pulse text-[#9deee5]' : 'text-white/75'}`}>{icon}</span>
                    <span className="mt-1 block text-[10px] font-semibold text-white/75">{label}</span>
                  </div>
                ))}
              </div>

              {result ? (
                <div className="demo-result-reveal mt-6 space-y-5">
                  {result.annotated_image && <img src={apiUrl(result.annotated_image)} alt="Detected anatomical ROIs" className="max-h-80 w-full rounded-xl border border-white/10 bg-black/30 object-contain shadow-2xl" />}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#9deee5]/35 bg-white/10 p-4 backdrop-blur">
                      <p className="text-xs text-white/70">{language === 'th' ? 'อายุกระดูกโดยประมาณ' : 'Estimated bone age'}</p>
                      <p className="mt-1 text-2xl font-bold text-[#a0f1e8]">{predicted ? predicted.predicted_age : '—'}</p>
                      {predicted && <p className="mt-1 text-xs text-white/65">{predicted.predicted_months.toFixed(1)} {language === 'th' ? 'เดือน' : 'months'}</p>}
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                      <p className="text-xs text-white/70">{language === 'th' ? 'จุดกายวิภาคที่พบ' : 'Anatomical ROIs'}</p>
                      <p className="mt-1 text-2xl font-bold">{result.detected_count}/9</p>
                      <p className="mt-1 text-xs text-white/65">QC: {result.qc_status}</p>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                      <p className="text-xs text-white/70">{language === 'th' ? 'ผลต่างจากอายุที่กรอก' : 'Difference from entered age'}</p>
                      <p className="mt-1 text-2xl font-bold">{ageDifference === null ? '—' : `${ageDifference >= 0 ? '+' : ''}${ageDifference.toFixed(1)}`}</p>
                      <p className="mt-1 text-xs text-white/65">{language === 'th' ? 'เดือน — ไม่ใช่ค่าความมั่นใจ' : 'months — not confidence'}</p>
                    </div>
                  </div>
                  {predicted?.validation_mae_months !== undefined && (
                    <div className="rounded-xl border border-white/15 bg-[#001f4c]/40 p-4 text-xs leading-relaxed text-white/75">
                      <strong className="text-white">Validation MAE {predicted.validation_mae_months.toFixed(2)} {language === 'th' ? 'เดือน' : 'months'}</strong>
                      {' — '}{language === 'th' ? 'เป็นค่าคลาดเคลื่อนเฉลี่ยของชุดตรวจสอบ ไม่ใช่ช่วงความเชื่อมั่นของผู้ใช้รายนี้' : 'average error on the validation set, not an individual confidence interval.'}
                    </div>
                  )}
                  {!predicted && <p className="rounded-lg bg-[#ffdad6] p-3 text-xs text-[#720007]">{language === 'th' ? 'ยังทำนายไม่ได้ เนื่องจากต้องตรวจสอบตำแหน่ง ROI เพิ่มเติม' : 'Prediction withheld because the detected ROIs require review.'}</p>}
                </div>
              ) : (
                <div className="mt-16 flex flex-col items-center text-center">
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full border border-[#9deee5]/30">
                    <div className="absolute inset-4 rounded-full border border-dashed border-white/30 motion-safe:animate-spin [animation-duration:12s]" />
                    <span className="material-symbols-outlined text-6xl text-[#9deee5]">skeleton</span>
                  </div>
                  <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/75">
                    {language === 'th' ? 'ผลตรวจจับ ROI และค่าประมาณอายุกระดูกจะแสดงที่นี่หลังประมวลผล' : 'ROI detections and the estimated bone age will appear here.'}
                  </p>
                </div>
              )}
            </div>

            <div className="relative mt-6 shrink-0 rounded-xl border border-[#ffd6a0]/30 bg-[#5b3a00]/45 p-4 backdrop-blur-sm">
              <div className="flex gap-2">
                <span className="material-symbols-outlined text-[#ffd6a0]">medical_information</span>
                <p className="text-xs leading-relaxed text-[#fff3df]">
                  {language === 'th' ? 'ผลนี้เป็นต้นแบบงานวิจัย ไม่ใช่การวินิจฉัยหรือคำแนะนำทางการแพทย์ โปรดปรึกษาแพทย์หรือรังสีแพทย์ก่อนตัดสินใจทุกครั้ง' : 'Research prototype only—not a diagnosis or medical advice. Always consult a physician or radiologist.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
