# บันทึกการตรวจแก้จาก PDF ต้นฉบับ

ฉบับนี้เป็นร่างตรวจทานภาษา อิง Manuscript.pdf โดยตรง เก็บผล 6.619 เดือน, CI 5.893–7.331 และ RMSE 8.795 ตาม PDF ไม่แทนด้วยตัวเลขจาก Word รุ่นก่อนหน้า

## สิ่งที่แก้
- ชื่อเรื่อง: เน้น Explainable Artificial Intelligence, multi-region และ structured expert review
- Abstract: ปรับประโยคให้ความสัมพันธ์ระหว่าง prediction accuracy กับ explanation evidence ชัดขึ้น คงตัวเลขและข้อจำกัดเดิม
- เนื้อหาหลัก: สร้างข้อความแก้ไขได้จาก PDF คงลำดับหัวข้อและรูปฝังจากต้นฉบับ ปรับช่องว่างจากการสกัด PDF
- Declarations: เพิ่มข้อมูลผู้เขียน ทุน และผลประโยชน์ทับซ้อนที่ผู้เขียนยืนยันแล้ว ระบุ ethics pending ตามข้อเท็จจริง

## ประเด็นที่ยังต้องยืนยัน
- PDF รายงาน MAE 6.619 แต่ Word รุ่นก่อนรายงาน 6.581 ต้องเทียบกับ run/checkpoint และรายการเคสก่อนเลือกค่าตีพิมพ์
- ยังไม่ตรวจความครบของ numerical provenance และบรรณานุกรมทุกแหล่ง จึงเป็น review draft ไม่ใช่ฉบับรับรองพร้อมส่งวารสาร
- ข้อความและตารางที่สกัดจาก PDF ต้องเทียบต้นฉบับก่อนส่งจริง โดยเฉพาะตำแหน่งรูปและตาราง
- ผล XAI จากไฟล์เก่ากับผลจาก API รุ่นปัจจุบันต้องระบุ method/checkpoint/normalization แยกกัน
- Ethics และรายละเอียด CRediT ยังรอยืนยัน

## ตัวอย่างก่อนและหลังแก้จากเนื้อหา

| ก่อนแก้ | หลังแก้ | เหตุผล |
| --- | --- | --- |
| Deep-learning approaches automate bone-age regression from hand radiographs. | Deep learning enables automated bone-age regression from hand radiographs. | ลดคำเกริ่นและระบุการกระทำ/ข้อค้นพบตรงประเด็น โดยคงความหมายเดิม |
| This study therefore investigates a web-based, anatomically structured bone-age assessment workflow in which regional prediction and post-hoc visualization are explicitly separated from expert evaluation. | We investigated a web-based bone-age assessment workflow that organizes evidence by anatomy and distinguishes regional prediction and post-hoc visualization from expert evaluation. | ลดคำเกริ่นและระบุการกระทำ/ข้อค้นพบตรงประเด็น โดยคงความหมายเดิม |
| The central methodological message is that numeric prediction, spatial attribution and user interpretation must be evaluated independently. | Numerical prediction, spatial attribution, and user interpretation require separate evaluation. | ลดคำเกริ่นและระบุการกระทำ/ข้อค้นพบตรงประเด็น โดยคงความหมายเดิม |
| The main role of the web application is to make model evidence inspectable in context. | The web application places model evidence in the context of case review. | ลดคำเกริ่นและระบุการกระทำ/ข้อค้นพบตรงประเด็น โดยคงความหมายเดิม |
| This study documents a web-based, nine-region approach to bone-age assessment that combines regression output with multiple inspectable attribution views and structured review controls. | We developed a web-based, nine-region bone-age assessment workflow that combines regression output, inspectable attribution views, and structured review controls. | ลดคำเกริ่นและระบุการกระทำ/ข้อค้นพบตรงประเด็น โดยคงความหมายเดิม |
