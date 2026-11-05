# แนวทางติดตั้งและดูแลข้อมูลอย่างปลอดภัย

เอกสารนี้แยกสิ่งที่มีอยู่จริงใน source ปัจจุบัน ออกจากแนวทางที่เตรียมไว้สำหรับระบบใช้งานหลายบัญชี ห้ามใช้เว็บรุ่นนี้กับข้อมูลผู้ป่วยจริงจนกว่าจะเชื่อม Supabase Auth/Database/Storage เข้ากับเว็บและ API พร้อมทดสอบสิทธิ์ครบถ้วน

## รูปแบบการติดตั้ง

### เครื่องส่วนตัวหรือเครื่องวิจัยของมหาวิทยาลัย

- Source code ติดตั้งได้จาก repository; checkpoint เป็นไฟล์น้ำหนักแยกต่างหาก ต้องได้จากแหล่งที่มีสิทธิ์และตรงกับ architecture, preprocessing และรุ่นที่ระบุใน `model_registry.json`.
- วางน้ำหนักในโฟลเดอร์ `models/` ที่ไม่ถูกส่งขึ้น Git หรือกำหนด path ด้วย `BONEAGE_FULL18_CHECKPOINT` และ `BONEAGE_YOLO_CHECKPOINT`. ภาพ ชุดข้อมูล `.env`, ฐานข้อมูลและ log ให้อยู่ในพื้นที่จำกัดสิทธิ์ของเครื่อง.
- `start_gpu.cmd` เปิด API ที่ `127.0.0.1` และสร้างบัญชีเฉพาะเครื่องใน `runtime/gpu_login.json`. อย่าใช้วิธีนี้เป็นระบบหลายผู้ใช้หรือเปิดพอร์ตสู่เครือข่ายมหาวิทยาลัย; สำหรับเครื่องส่วนกลางต้องติดตั้ง reverse proxy HTTPS, บัญชีรายบุคคล, firewall, backup/restore และผู้ดูแลระบบก่อน.
- รัน `python scripts/check_local_install.py` ก่อนเปิดงาน เพื่อตรวจ path ของ checkpoint, ค่า hash (ถ้ากำหนด) และ CUDA เบื้องต้น การตรวจนี้ไม่โหลดภาพ ไม่ทำนาย และไม่รับรองว่าโมเดลทำงานถูกต้อง.

### เว็บส่วนกลางที่มีหลายผู้ใช้

สถาปัตยกรรมเป้าหมายคือ browser ใช้ Supabase Auth เพื่อยืนยันตัวตน, ส่ง metadata และผลไป Postgres ภายใต้ RLS, เก็บภาพใน private Storage และเรียก inference API ที่จำกัดเครือข่าย/ผู้ใช้ ปัจจุบัน Supabase project มีตารางพร้อม RLS และ bucket private แต่เว็บ/API ยังใช้ local authentication กับ SQLite และยังไม่มีข้อมูลถูกซิงก์ขึ้น Supabase การมี schema อย่างเดียวจึงยังไม่ถือว่าเชื่อมต่อหรือพร้อมใช้งานหลายบัญชี

## ข้อมูลที่เก็บได้และข้อมูลที่ไม่ควรเก็บ

| ข้อมูล | ตำแหน่งที่เหมาะสมเมื่อเชื่อมระบบครบ | ข้อกำหนด |
| --- | --- | --- |
| บัญชี | Supabase Auth; ใน `profiles` เก็บชื่อแสดงผลและ role | ห้ามเก็บรหัสผ่านในตาราง/ไฟล์แอป; สร้างบัญชีโดยผู้ดูแลและให้สิทธิ์เท่าที่จำเป็น |
| Metadata งานวิจัย | `cases` ใน Postgres | ใช้รหัสสุ่ม/รหัสชุดข้อมูล ไม่เก็บชื่อ HN, วันเกิด, เลขเวชระเบียน, วันตรวจที่ระบุตัวได้ หรือข้อมูลติดต่อ |
| ภาพวิจัยที่ได้รับอนุญาต | bucket `rsna-private` | private เท่านั้น; ใช้ path สุ่มภายใต้ UUID เจ้าของ; สร้างลิงก์ชั่วคราวเมื่อจำเป็น; ลบ metadata ระบุตัวบุคคลจากไฟล์ก่อนส่ง |
| ผลทำนาย | `predictions` | อายุที่ทำนาย, model ID/version, hash checkpoint, preprocessing, เวลา inference และ XAI method; ไม่บันทึก bearer token หรือข้อมูลลับ |
| ความเห็นผู้เชี่ยวชาญ | `feedback` แบบบันทึกเพิ่มรายการ | เก็บค่าที่ผู้เชี่ยวชาญประเมิน, ประเภทการแก้, ผู้บันทึก, เวลา, รุ่นโมเดล/ผลต้นทางและเหตุผลที่จำเป็น; จำกัดข้อความอิสระและไม่ใส่ข้อมูลระบุตัวบุคคล |
| Audit trail | ตาราง audit แยกที่ต้องออกแบบก่อนเปิดใช้จริง | บันทึก actor ID, action, resource ID, เวลาจาก server, model/version และผลสำเร็จ/ล้มเหลว; ห้ามใส่ภาพ, token, password หรือข้อความผู้ป่วยเต็ม ๆ |
| Checkpoint/optimizer/training data | ที่เก็บ artifact ส่วนตัวของสถาบันหรือ storage ที่มี access control | ไม่ใส่ใน GitHub, browser bundle, Supabase ตาราง metadata หรือ public bucket; บันทึก version, checksum, license/source, training protocol และผู้อนุมัติ |

โปรเจกต์ Supabase ที่ตรวจพบมี 0 แถวในตารางงานวิจัย และ bucket ตั้งเป็น private ขนาดสูงสุด 50 MiB ชนิด JPEG/PNG/WebP/DICOM; policy จำกัดข้อมูลและวัตถุตามเจ้าของบัญชี RLS ไม่ได้แทนการสำรองข้อมูลหรือการอนุมัติจริยธรรม/นโยบายมหาวิทยาลัย

## Feedback และวงจรปรับรุ่นโมเดล

Feedback ของแพทย์ควรสร้างหลักฐานสำหรับทีมวิจัย ไม่ควรทำให้โมเดลที่กำลังให้บริการเปลี่ยนพฤติกรรมทันที ขั้นตอนที่แนะนำ:

1. บันทึกผลเดิมแบบแก้ย้อนหลังไม่ได้: inference ID, case pseudonym, model/checkpoint hash, ROI revision, ผลทำนาย, เวลา, XAI method และค่าที่ผู้เชี่ยวชาญแก้ พร้อมเหตุผลสั้น ๆ.
2. ผู้ดูแลข้อมูลตรวจแหล่งที่มา สิทธิ์ใช้ภาพ คุณภาพ ROI และความถูกต้องของ label; ข้อมูลจำลอง/ไม่ทราบแหล่งที่มา/ใช้ในชุดประเมินที่สงวนไว้ต้องถูกคัดออก.
3. ส่ง feedback ที่อนุมัติแล้วไปยังชุดฝึกเวอร์ชันใหม่แบบ offline พร้อม manifest และ checksum; แบ่งข้อมูลตามผู้ป่วย ไม่ใช่ตามภาพ เพื่อป้องกันภาพซ้ำของคนเดียวกันข้ามชุด.
4. ฝึก candidate แยกจาก production checkpoint และประเมินด้วย protocol ที่กำหนดล่วงหน้า รวมการตรวจกลุ่มอายุ/เพศ, missing ROI, calibration/ความคลาดเคลื่อนและการถดถอยเทียบ baseline.
5. ผู้รับผิดชอบอนุมัติรุ่น, บันทึกหลักฐานและ hash; จึงค่อย promote ผ่าน release ที่ย้อนกลับรุ่นเดิมได้. เก็บ baseline/checkpoint เดิมไว้จนผ่านระยะ rollback.

ระบบใน repository มีตัวกรอง feedback สำหรับการจัดชุดฝึกแบบ offline และตั้ง `automatic_training=false`, `automatic_release=false`; นี่เป็นเพียง safety gate ไม่ใช่ระบบฝึกครบวงจรหรือการอนุมัติทางคลินิก. schema Supabase กำหนด `training_eligible=false` และ feedback เป็น append-only ด้วย ดังนั้นต้องมี workflow adjudication/admin และการออก migration ที่ผ่าน review ก่อนเปิด feedback training จริง. ห้ามใช้ feedback จากชุดประเมินที่สงวนไว้ฝึกหรือจูนโมเดล.

อ่านแนวทางปัจจุบันเรื่อง [Supabase Auth users](https://supabase.com/docs/guides/auth/users), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) และ [Storage access control](https://supabase.com/docs/guides/storage/security/access-control) ก่อนเพิ่ม integration. ระบบนี้ใช้ RLS แยกแถวและ private bucket; อย่าใส่ service key ใน browser.

## การควบคุมความปลอดภัยก่อนใช้ร่วมกัน

- ใช้บัญชีรายบุคคล, MFA หากนโยบายหน่วยงานรองรับ, ปิดการสมัครสาธารณะ และกำหนด reviewer/admin ฝั่ง server; ห้ามใช้บัญชีร่วมที่สร้างจาก environment เป็นระบบองค์กร.
- เก็บ `service_role`/secret key เฉพาะ secret manager ฝั่ง server เท่านั้น; publishable key เปิดเผยได้แต่ต้องมี RLS ที่ตรวจแล้ว. ห้ามใส่ key ลับใน `VITE_*`.
- จำกัด CORS ตาม origin ที่แน่นอน, เปิด HTTPS, จำกัดขนาด/ชนิดภาพทั้งจาก header และเนื้อหาไฟล์, rate limit login/upload/inference, บันทึกเหตุการณ์โดยไม่บันทึกข้อมูลลับ และเฝ้าระวังการเข้าถึงผิดปกติ.
- จัดทำระยะเก็บ/ลบ, เข้ารหัส backup, ทดสอบกู้คืน และกำหนดเจ้าของข้อมูล/ผู้รับผิดชอบเหตุข้อมูลรั่วก่อนรับข้อมูลใด ๆ.
- ก่อนใช้ข้อมูลนอก RSNA ต้องได้รับอนุมัติจากเจ้าของข้อมูล/คณะจริยธรรม/มหาวิทยาลัยและทำ privacy/security review แยกต่างหาก.

## รายการที่ยังไม่พร้อมใน source ปัจจุบัน

1. หน้าเว็บเก็บ session token ใน `sessionStorage` (อ่านได้จาก JavaScript) และใช้บัญชี environment/local; ยังไม่มี Supabase Auth SDK เชื่อมกับหน้า login.
2. API ยังบันทึกเคสและ feedback ลง SQLite/ไฟล์ local; ไม่มี adapter สำหรับ Postgres/Storage และไม่มีตาราง audit บน Supabase.
3. schema ปัจจุบันจำกัดเจ้าของเคสเป็นคนสร้าง จึงไม่รองรับ reviewer หลายบัญชีเข้าถึงเคสร่วมกัน; ต้องเพิ่ม case membership/role policies ก่อนทำงานทีม.
4. ไม่มีระบบจัดการ checkpoint download/license/signature; ผู้ดูแลต้องจัดหาไฟล์และตรวจ checksum จากช่องทางที่เชื่อถือได้.
5. ไม่มีระบบสร้าง candidate checkpoint และ release/rollback อัตโนมัติ; ต้องทำ offline และมีผู้อนุมัติ.

รายการเหล่านี้เป็นเงื่อนไขก่อนเรียกระบบว่าใช้งานหลายบัญชีหรือรับข้อมูลจริงได้ แม้ endpoint health จะตอบปกติก็ตาม.
