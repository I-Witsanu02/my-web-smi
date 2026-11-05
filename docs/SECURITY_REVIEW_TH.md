# สรุปตรวจความปลอดภัยและสิ่งที่ต้องทำก่อนใช้งานหลายบัญชี

## สรุป

มีการปรับบางส่วนที่ทำได้ทันที: session ของหน้าเว็บเก็บใน `sessionStorage` เท่านั้นและหมดไปเมื่อปิด browser, เพิ่มตัวตรวจ checkpoint/CUDA ก่อนเปิดใช้งาน และให้ API ปฏิเสธ checkpoint ที่ checksum ไม่ตรงเมื่อกำหนด hash ที่เชื่อถือได้

ระบบยังไม่พร้อมรับข้อมูลผู้ป่วยจริงหรือเปิดให้ทีมใช้งานหลายบัญชี เพราะหน้าเว็บ/API ยังใช้บัญชีแบบ environment กับ SQLite/ไฟล์ local และยังไม่ใช้ Supabase schema ที่เตรียมไว้ การตรวจ security advisor ของ Supabase ไม่พบรายการเตือน ณ เวลาตรวจ แต่ผลนั้นครอบคลุมเฉพาะฐานข้อมูล ไม่ได้ตรวจเว็บ, GPU API, เครื่องมหาวิทยาลัย, network หรือการติดตั้ง checkpoint

## ประเด็นที่พบ

| ระดับ | ประเด็น | หลักฐาน/ผลกระทบ | แนวทาง |
| --- | --- | --- | --- |
| สูง | Supabase ยังไม่เชื่อมกับ flow ของเว็บ | `src/api.ts:142-214` เรียก login/API ในแอปเดิม; `persistence.py:9-34` ใช้ SQLite; ดังนั้น RLS และ private bucket ไม่ได้คุ้มครอง record ที่เว็บยังไม่ได้ส่งไป | ทำ Supabase Auth + Postgres + Storage adapter, role/case membership, และทดสอบผู้ใช้สองบัญชีก่อนเปิดให้ทีม |
| สูง | local account ไม่ใช่ระบบบัญชีหลายคน | GPU launcher สร้างบัญชีเฉพาะเครื่องที่ `scripts/launch_gpu.py:11-20` และ API ใช้ credential แบบ environment ที่ `app.py:74-92`; ยังไม่มี MFA, account lifecycle หรือ role separation | ใช้ได้เฉพาะเครื่องส่วนตัวที่ bind loopback; สำหรับมหาวิทยาลัยใช้บัญชีรายบุคคล, MFA/SSO และผู้ดูแลระบบ |
| สูง | SQLite/ไฟล์ local ไม่มี encryption/retention policy ในระดับแอป | เคส, feedback และ audit ถูกบันทึกใน `runtime/` (`persistence.py:9-34`); ผู้ที่มีสิทธิ์อ่านไฟล์เครื่องอาจอ่านข้อมูลได้ | จำกัดสิทธิ์ OS, เข้ารหัสดิสก์/backup, ตั้ง retention, และยังไม่เก็บข้อมูลจริงในโหมดนี้ |
| กลาง | session token อ่านได้จาก JavaScript | ปรับ `src/api.ts:102-113` ให้ใช้ sessionStorage และไม่มีตัวเลือกจำ session แล้ว แต่ XSS/extension ยังอาจอ่าน session ได้ | เป้าหมายระบบหลายผู้ใช้ควรใช้ Supabase Auth session ที่จัดการอย่างปลอดภัยและลดอายุ token; เพิ่ม CSP/ทบทวน XSS |
| กลาง | model registry มี path/checkpoint แต่ไม่มี trusted checksum บังคับโดยค่าเริ่มต้น | การเปลี่ยนไฟล์ checkpoint โดยไม่ตั้ง expected hash ตรวจไม่พบ; เพิ่มการตรวจใน `app.py:49-69` และ `scripts/check_local_install.py` แล้ว | ใช้ hash จาก release manifest ที่ผู้ดูแลรับรอง; เปิด `BONEAGE_REQUIRE_CHECKPOINT_SHA256=1` เพื่อ fail closed |
| กลาง | feedback ยังไม่ใช่วงจรฝึกที่พร้อมปล่อยรุ่น | มี safety filter offline ที่ `feedback_learning.py:4-17`; auto-training/auto-release ปิดไว้ และ Supabase บังคับ `training_eligible=false` | ตรวจ label/provenance, ตัด evaluation cases ออก, แบ่งตามผู้ป่วย, ฝึก candidate offline, compare, ขออนุมัติ และ rollback ได้ |

## ขอบเขตการตรวจ Supabase

- โปรเจกต์เป้าหมายอยู่สถานะ `ACTIVE_HEALTHY`; มี Postgres 17.
- ตารางวิจัย 5 ตารางเปิด RLS และยังไม่มี record; bucket `rsna-private` เป็น private จำกัด 50 MiB.
- policies ปัจจุบันแยกข้อมูลตามเจ้าของบัญชี ไม่มีสิทธิ์แชร์เคสให้ reviewer คนอื่น.
- security advisor ไม่คืนรายการเตือน; performance advisor แจ้งดัชนี 9 รายการยังไม่ถูกใช้ ซึ่งไม่ใช่ช่องโหว่และยังไม่ควรลบก่อนมีข้อมูล/โหลดจริง.

## ความหมายของ feedback loop

สิ่งที่ปลอดภัยคือใช้ feedback เป็นข้อมูลให้ทีมทบทวนและสร้างชุดฝึก candidate แบบ offline ไม่ใช่ให้โมเดลปรับน้ำหนักเองหลังแพทย์กรอกข้อมูลหนึ่งครั้ง การส่ง candidate ขึ้นใช้ต้องมีผู้รับผิดชอบ, protocol ที่ล็อกไว้, ผลเปรียบเทียบ, checksum/version, การอนุมัติ และแผนย้อนกลับทุกครั้ง

## สถานะส่งมอบ

ตรวจ source และแก้ไขบางส่วนแล้ว แต่การเชื่อม Supabase Auth/Database/Storage, การทดสอบ access isolation แบบบัญชี A/B, การทดสอบ inference บนเครื่องที่มี checkpoint/GPU, และการทดสอบกู้คืน backup ยังไม่เสร็จ จึงยังไม่ควรเปิดรับข้อมูลผู้ป่วยจริงหรือประกาศว่า production-ready
