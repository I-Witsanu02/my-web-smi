# Skeleton Bone Age — Product, Clinical Safety, and Functional Audit

วันที่ตรวจ: 8 กันยายน 2569
ขอบเขต: React/TypeScript frontend, FastAPI backend, public demo, temporary research login, model inference, clinician feedback, responsive and accessibility review

## Executive status

- สถานะปัจจุบัน: **Research MVP ใช้งานสาธิตได้ แต่ยังไม่พร้อมใช้เป็นระบบคลินิกจริง**
- Public demo เชื่อมโมเดลจริง ตรวจ ROI และประมาณอายุกระดูกได้ โดยไม่บันทึกภาพที่อัปโหลด
- Temporary research login ใช้งานได้ และไม่มีรหัสผ่าน production อยู่ใน source code
- UP Account เป็นเพียงสถานะเตรียมเชื่อมต่อ ยังไม่อ้างว่า SSO ใช้งานได้
- Release blocker สำคัญที่สุดคือ backend production ยังอาศัยเครื่องภายในและ temporary tunnel

## Real-image verification

ใช้ภาพเต็มมือจริงที่จัดไว้สำหรับ verification เท่านั้น ไม่ใช้ Locked Test และไม่บันทึกภาพจาก public demo

| ภาพ | อายุอ้างอิง | เพศ | ROI | ผลทำนาย | ผลต่าง | QC | เก็บภาพ |
|---|---:|---|---:|---:|---:|---|---|
| F_13y10m | 166 เดือน | หญิง | 9/9 | 177.213 เดือน | +11.213 เดือน | PASS | ไม่เก็บ |
| 10901 | 156 เดือน | หญิง | 9/9 | 157.927 เดือน | +1.927 เดือน | PASS | ไม่เก็บ |
| 1377 | 180 เดือน | หญิง | 9/9 | 183.825 เดือน | +3.825 เดือน | PASS | ไม่เก็บ |
| 1435 | 180 เดือน | ชาย | 9/9 | 178.643 เดือน | −1.357 เดือน | PASS | ไม่เก็บ |

หมายเหตุ: ผลต่างข้างต้นเป็นความคลาดเคลื่อนรายภาพ ไม่ใช่ Validation MAE และไม่ใช่ช่วงความเชื่อมั่นรายบุคคล

## Findings and fixes

| Severity | Finding | Resolution |
|---|---|---|
| P0 | Backend ที่ Vercel เรียกใช้ยังอยู่บนเครื่องภายในผ่าน temporary tunnel | ยังเป็น release blocker; ต้องย้ายไป backend HTTPS ที่มี uptime, access control และ monitoring ก่อนใช้จริง |
| P1 | Public API ส่งชื่อโมเดล ตัวตรวจจับ อุปกรณ์ และ protocol ภายในเกินความจำเป็น | แก้แล้ว: ตัดข้อมูลภายในออกจาก `/api/demo/predict` และใช้ชื่อระบบทั่วไปใน health response |
| P1 | ยังไม่มี UP Account SSO/RBAC จริง | แสดงปุ่ม disabled และข้อความรอ University IT; ไม่จำลองระบบมหาวิทยาลัย |
| P1 | ระบบเก็บเคสและ feedback ยังเป็น file-based persistence | เหมาะกับ MVP เท่านั้น; ต้องใช้ฐานข้อมูลเข้ารหัส, backup, RBAC และ retention policy ก่อนข้อมูลผู้ป่วยจริง |
| P2 | หน้า settings route แสดงปุ่มอังกฤษเดี่ยวแทน dialog | แก้แล้ว: เมนู settings เปิด dialog โดยตรงและกลับสู่ overview |
| P2 | UI และ notification แสดงชื่อ FocalNet/YOLO/LR ต่อผู้ใช้ทั่วไป | แก้แล้ว: ใช้ “ระบบวิเคราะห์อายุกระดูก”, “ตัวตรวจตำแหน่งกายวิภาค” และ “เวอร์ชันระบบวิเคราะห์” |
| P2 | Overview เรียก accepted ROI rate ว่า “ความแม่นยำ ROI” | แก้แล้ว: เปลี่ยนเป็น “สัดส่วน ROI ที่ผ่านการตรวจ” |
| P3 | Login ระบุ “No Real Patient Data” ซึ่งไม่ชัดเจนเมื่อระบบรับภาพจริง | แก้แล้ว: เตือนห้ามอัปโหลดข้อมูลระบุตัวตนและระบุ research use only |

## Button and route test matrix

| Page | Action | Expected | Actual | Status | Severity | Fix/Note |
|---|---|---|---|---|---|---|
| Login | temporary research login | เข้าสู่ระบบและเปิด overview | สำเร็จ | PASS | — | token มีอายุ 12 ชั่วโมง |
| Login | UP Account | ไม่ส่งผู้ใช้ไป SSO ที่ยังไม่ตั้งค่า | ปุ่ม disabled พร้อมคำอธิบาย | PASS | — | รอ OIDC/SAML/Entra configuration |
| Login | public-demo anchor | เลื่อนไปส่วนทดลอง | link และ target มีอยู่ | PASS | — | — |
| Public demo | JPG/PNG upload | แสดง preview และเปิดปุ่มประมวลผล | สำเร็จ | PASS | — | จำกัด 20 MB และอย่างน้อย 256×256 |
| Public demo | real prediction | ROI, estimated age, difference, MAE explanation | สำเร็จ 4 ภาพจริง | PASS | — | ไม่เก็บภาพ |
| Public demo | non-image upload | ปฏิเสธอย่างชัดเจน | HTTP 415 | PASS | — | unit test ครอบคลุม |
| Overview | quick actions | เปิด create modal, cases, review queue | สำเร็จ | PASS | — | browser verified |
| Cases | search/filter/empty state | ใช้งานได้แม้ยังไม่มีเคส | แสดง empty state | PASS | — | browser verified |
| Screening/Intake/Imaging/ROI/Prediction/XAI/Report/Checklist | เปิดโดยไม่มีเคส | redirect ไป Cases อย่างปลอดภัย | สำเร็จ | PASS | — | route guard verified |
| Review queue | empty state and feedback export | แสดงสถานะไม่มีข้อมูลและปุ่ม export | สำเร็จ | PASS | — | การอนุมัติมี revision และ locked-test guard |
| References | navigation | แสดงเอกสารอ้างอิง | สำเร็จ | PASS | — | browser verified |
| Logs | navigation | แสดง audit empty state/records | สำเร็จ | PASS | — | browser verified |
| Help/Support | navigation | แสดงคำแนะนำตามประเภท | handlers เชื่อมครบ | PASS | — | code verified |
| Notifications | open/acknowledge/close | dialog เปิดและปิดได้ | สำเร็จ | PASS | — | browser verified |
| Settings | sidebar/top-bar open | เปิด settings dialog | แก้และทดสอบ build แล้ว | PASS | P2 fixed | route no longer leaves blank page |
| Settings | sign out | ล้าง session token และกลับ login | handler เชื่อมครบ | PASS | — | code verified |
| Clinician correction | save reviewed months | เก็บค่าดิบแยกจากค่าที่แพทย์แก้ | revisioned feedback implemented | PASS | — | ต้องอนุมัติก่อนใช้ฝึก |
| Report | print/finalize | เรียก print และเปลี่ยนสถานะ | handlers เชื่อมครบ | PASS | — | ห้ามตีความเป็นรายงานวินิจฉัย |

## Accessibility and responsive findings

- มี semantic labels สำหรับ login, public-demo form, processing stages และ UP Account status
- error ใช้ `role="alert"`; ปุ่ม disabled มีสถานะที่อ่านได้
- รองรับ `prefers-reduced-motion`; animation ไม่บัง interaction
- layout หลักใช้ responsive breakpoints และ mobile navigation drawer
- ต้องเพิ่ม automated accessibility regression (เช่น axe) และทดสอบ screen reader จริงก่อน clinical pilot
- ควรเพิ่ม focus trap และ Escape handling ให้ทุก modal ในรอบ hardening ถัดไป

## Performance

- Production build: JavaScript 401.91 kB (106.45 kB gzip), CSS 56.35 kB (10.31 kB gzip)
- การทดสอบ 3 ภาพจริงบน CPU ใช้เวลารวมประมาณ 12.8 วินาที รวม model warm-up และ request overhead
- Frontend ไม่รวม checkpoint ขนาดใหญ่; โมเดลทำงานที่ backend
- ควรเพิ่ม warm worker, request queue, timeout metrics และ model-health monitoring ก่อนเปิดผู้ใช้หลายคน

## Authentication status

- Temporary research login: ใช้งานได้สำหรับการสาธิต
- Credentials: อ่านจาก environment เท่านั้น ไม่ hard-code ใน repository
- UP Account: ยังไม่เปิดใช้งาน ต้องได้รับ Tenant/Client ID, redirect URI, secret/certificate, claims/groups และ protocol ที่ University IT อนุมัติ
- ระบบปัจจุบันยังไม่มี per-user RBAC, account lifecycle, MFA, lockout และ institutional audit integration

## Remaining clinical and security risks

1. ห้ามใช้ผลเป็นการวินิจฉัยหรือการตัดสินใจรักษาโดยลำพัง
2. Validation MAE เป็นค่าเฉลี่ยระดับชุดข้อมูล ไม่ใช่ค่าความมั่นใจของผู้ป่วยรายนั้น
3. ต้องทำ external validation, subgroup analysis, calibration และ locked-test evaluation ก่อนกล่าวอ้างประสิทธิภาพทางคลินิก
4. ต้องจัดการ consent, de-identification, retention, deletion, encryption และ incident response ก่อนใช้ข้อมูลผู้ป่วยจริง
5. ต้องเปลี่ยน temporary tunnel เป็น backend deployment ที่ควบคุมได้และหมุนรหัสผ่านต้นแบบ

## Exact verification performed

- `npm run lint`
- `npm run build`
- `python -m unittest discover -s tests -v` — 4 tests passed
- `git diff --check`
- HTTP inference กับภาพจริง 4 ภาพ; ROI 9/9 และ `image_retained=false` ทุกภาพ
- Browser accessibility-tree verification: login, overview, create-case modal, cases, case route guard, review queue, references, logs, notifications และ settings dialog
- Static route/handler inspection สำหรับ workflow pages, clinician correction, feedback export, report finalize และ logout
