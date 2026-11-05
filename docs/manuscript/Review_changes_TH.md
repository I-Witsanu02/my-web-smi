# บันทึกตรวจ Manuscript ภาษาอังกฤษและ README

ฉบับนี้ใช้ผล checkpoint ที่ผู้เขียนระบุเพียงตัวเดียว และเรียก FocalNet ในเนื้อหา รหัสและ SHA-256 อยู่ใน FocalNet_provenance.json เพื่อให้ระบุตัวไฟล์ได้โดยไม่ทำให้บทความอ่านยาก

## ก่อนแก้ หลังแก้ และเหตุผล

| ส่วน | ก่อนแก้ | หลังแก้ | เหตุผล |
| --- | --- | --- | --- |
| ชื่อเรื่อง | Web-Based Explainable Multi-ROI Bone Age Assessment with Structured Expert Review | Web Based Explainable Artificial Intelligence for Multi Region Bone Age Assessment and Structured Expert Review | ใช้ชื่อที่เน้นเว็บ XAI และการตรวจโดยผู้เชี่ยวชาญ ไม่เพิ่มคำกล่าวอ้างทางคลินิก |
| Abstract | MAE 6.619 months (95% bootstrap confidence interval, 5.893–7.331; RMSE 8.795) on 260 cases. | FocalNet MAE 6.619 months; recomputed 95% CI 5.937–7.351; RMSE 8.795; n=260. | ผู้ใช้เลือก checkpoint เดียว; CI คำนวณใหม่ด้วย patient bootstrap 20,000 รอบ seed 20261105 มีโค้ดและ hash อ้างอิง |
| Introduction | The central contribution is the inspectable relationship between image evidence, model output and human review. | The study describes implementation and retrospective numerical performance; clinical benefit and autonomous online learning were not tested. | ระบุประโยชน์เชิงการออกแบบและขอบเขตหลักฐาน ไม่ยกระดับเป็นผลคลินิก |
| Methods | The primary numerical analysis concerns 260 archived test cases. | Archived evaluation of a fixed FocalNet checkpoint; prior inspection and possible PRE2 initialization overlap are reported. | ชื่อโฟลเดอร์ไม่พิสูจน์ว่า independent test; ไม่ลบข้อจำกัด data lineage |
| Methods และ XAI | Project XAI examples came from an earlier FocalNet configuration. | Historical XAI images are not checkpoint matched; EigenCAM summarizes features, not age-targeted attribution; shared-scale and per-ROI normalization differ. | แยกประสิทธิภาพ regression ออกจากความถูกต้องของคำอธิบาย |
| Results | The selected configuration achieved MAE 6.619 and RMSE 8.795. | Single-model performance table plus scatter, Bland–Altman, cumulative absolute error and subgroup counts. | แสดง distribution และ bias จากข้อมูลจริง; ไม่ใช้ precision recall F1 กับ regression โดยไม่มี class definition |
| Discussion | The main role of the web application is to make model evidence inspectable in context. | The workflow supports inspection and preserves disagreement, but efficiency and clinical benefit require a controlled user study. | คงคุณค่าของงานโดยระบุสิ่งที่ทดสอบจริง |
| Conclusion | The main contribution is an explicit, auditable framework for separating prediction from model evidence. | An inspectable regional prediction and review workflow; independent generalization, explanation faithfulness and feedback-driven improvement remain unmeasured. | ไม่สรุปเกินการประเมินที่มี |
| References | 24 references in the source PDF. | 25 references ordered by first citation, including a verified primary FocalNet architecture reference. | ตรวจ DOI metadata และแหล่งหลัก; เลขในเนื้อหากับท้ายเรื่องเปลี่ยนพร้อมกันตาม Vancouver ไม่เรียง A–Z |

## สิ่งที่แก้
- สร้างบทความฉบับใหม่โดยรักษาลำดับ Introduction Methods Results Discussion Limitations Conclusion และ References จากต้นฉบับ
- ใช้ชื่อ FocalNet ไม่มีรหัสย่อโมเดลในเนื้อหาหรือหัวกราฟ
- เก็บ MAE 6.619, RMSE 8.795 และ n=260 โดยวิเคราะห์ CSV ที่ตรง checkpoint ที่ผู้เขียนเลือก
- ปรับ CI จากเดิมเป็นค่าที่รันซ้ำได้จากโค้ดใหม่ ไม่ใช่การคงตัวเลขเดิมโดยไม่มีหลักฐาน
- เพิ่ม Bias, tolerance agreement และ subgroup n; ระบุว่า tolerance agreement ไม่ใช่ classification accuracy
- ย้ายรุ่นและรหัสไปในไฟล์ provenance; ไม่ลบประวัติ offline refinement หรือคำเตือน data overlap
- ใช้รูปแว่นขยายที่ผู้เขียนส่ง เห็นวงเต็มเหนือจุดกระดูก โดยคงพิกเซลต้นฉบับ
- แก้หมายเลขอ้างอิงพร้อมรายการท้ายเรื่องตามลำดับที่อ้างครั้งแรก เพิ่มบทความ FocalNet จาก proceedings ฉบับตีพิมพ์ ซึ่งมีรายชื่อผู้เขียนต่างจาก arXiv บางรุ่น

## สิ่งที่ไม่เปลี่ยนหรือไม่กล่าวอ้าง
- ไม่ฝึกใหม่ ไม่ปรับผลทำนาย และไม่เลือกเฉพาะภาพที่ error ต่ำมาคิด metrics
- ไม่ใช้ตัวเลขจาก baseline หรือโมเดลอื่นประกอบผลหลัก
- ไม่เปลี่ยน reference bone age เป็น chronological age และไม่อ้างว่าค่าแสดงในเคส demo เป็นอายุแพทย์ประเมิน
- ไม่อ้างว่า EigenCAM เป็น causal explanation, confidence หรือ attribution ต่ออายุโดยตรง
- ไม่อ้าง clinical benefit, usability improvement หรือ feedback-learning improvement ที่ยังไม่มีการทดลองรองรับ

## ต้องยืนยันก่อนส่งวารสาร
- สถานะจริยธรรมยัง pending ไม่มีการแต่งเลขอนุมัติ
- แก้ปัญหา data lineage: run metadata ระบุผู้ป่วย15รายเกี่ยวข้องกับ PRE2 initialization แต่ยังไม่มี membership ที่ตรวจทวนอิสระ จึงยังห้ามเรียกผลนี้ว่า untouched independent test
- training inventory 3,600 image rows กับ 4,821 patient IDs เป็นคนละหน่วย/record และยังไม่ reconciled
- ภาพ XAI เดิมยังไม่ผูกครบกับ checkpoint ที่ประเมิน จึงเป็นหลักฐานภาพประกอบเท่านั้น
- ตรวจพบเอกสารร่วม FDA/Health Canada/MHRA ฉบับเดือนตุลาคม2021บนเว็บไซต์ทางการ Health Canada แล้ว จึงแก้ URL ไปยังฉบับที่ตรงปีแทน URL FDA ที่เปลี่ยนเส้นทาง
- Greulich–Pyle ตรวจ bibliographic details จาก catalogue/contemporary review ไม่ได้ตรวจอ่านเล่มเต็ม; DOI metadata ไม่เท่ากับการตรวจเนื้อหาฉบับเต็มทุกหน้า
- ตรวจรูปแบบตามวารสารเป้าหมายและให้ผู้เขียนทั้งสองอนุมัติฉบับสุดท้าย ยังไม่รับรองว่า Q1 จะรับตีพิมพ์
