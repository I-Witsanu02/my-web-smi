# คู่มือติดตั้ง Skeleton Bone Age XAI บน Windows

## ขอบเขต

คู่มือนี้อธิบายการติดตั้งเว็บวิจัยบน Windows ให้หน้าเว็บและ API ประมวลผลในเครื่องด้วย NVIDIA GPU ภาพที่อัปโหลดควรลบข้อมูลระบุตัวบุคคลแล้ว ระบบนี้เป็นต้นแบบวิจัย ต้องให้ผู้เชี่ยวชาญตรวจผล และไม่ใช่อุปกรณ์วินิจฉัย

ชุด Source Code ไม่รวม checkpoint น้ำหนักโมเดล ภาพผู้ป่วย ฐานข้อมูล หรือข้อมูลลับ ต้องเตรียม FocalNet FULL18 และ YOLO 9 ROI ที่ได้รับอนุญาตให้ใช้ก่อนเริ่ม checkpoint สำหรับโมเดลอ้างอิง/ทดลองอื่นก็ไม่รวม และไม่ควรเลือกใช้จนกว่าจะติดตั้ง checkpoint ที่ตรงรุ่น

ไฟล์ YOLO V2 B8 E53 640 ที่ตรวจพบในคลังโครงการมี SHA-256 `81410A091A7F6CCF08C70A87F0842A4EDD48F018882BC76CE9708A70849EE058` ใช้ค่านี้ตรวจได้เมื่อคุณตั้งใจใช้ไฟล์รุ่นดังกล่าวเท่านั้น การ hash ตรงกันยืนยันตัวไฟล์ แต่ไม่ใช่หลักฐานว่าไฟล์นั้นเป็นตัวที่สร้าง ROI ในภาพผลลัพธ์เก่าหรือภาพใน Manuscript

## สิ่งที่ต้องมี

- Windows 10/11 แบบ 64 บิต
- Python 3.11 แบบ 64 บิต และ pip
- Node.js รุ่น LTS พร้อม npm
- NVIDIA GPU และไดรเวอร์ที่รองรับ CUDA หากต้องการประมวลผลด้วย GPU
- checkpoint ที่ตรงกับ architecture และ preprocessing ที่บันทึกใน `model_registry.json`

ก่อนเริ่ม ให้เปิด PowerShell แล้วตรวจว่า Python, Node.js และ npm ใช้งานได้:

```powershell
py -3.11 --version
node --version
npm --version
```

ต้องได้ Python 3.11.x และ Node.js รุ่น LTS; หากคำสั่งใดไม่พบ ให้ติดตั้งโปรแกรมนั้นและเปิด PowerShell ใหม่ก่อนทำขั้นตอนต่อไป

## ติดตั้งโปรแกรม

1. แตกโฟลเดอร์ `my-web-smi` ไปยังตำแหน่งที่ต้องการ เช่น `D:\BoneAge\my-web-smi` แล้วเปิด PowerShell ที่โฟลเดอร์นั้น
2. สร้างและเปิด virtual environment:

   ```powershell
   py -3.11 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   ```

   หาก PowerShell แจ้งว่าบล็อกสคริปต์ ให้เปิดสิทธิ์เฉพาะหน้าต่างปัจจุบันก่อน แล้วลองเปิด virtual environment อีกครั้ง:

   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\.venv\Scripts\Activate.ps1
   ```

3. ติดตั้ง PyTorch สำหรับ Windows โดยเลือก CUDA ตามเครื่องจาก [PyTorch Get Started Locally](https://pytorch.org/get-started/locally/) แล้วตรวจ GPU:

   ```powershell
   python -c "import torch; print(torch.__version__); print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CUDA unavailable')"
   ```

   ใช้ขั้นต่อไปเมื่อ `torch.cuda.is_available()` แสดง `True` หากไม่ใช้ GPU ให้ติดตั้ง PyTorch แบบ CPU และใช้ `start_cpu.cmd` แทน

4. ติดตั้งแพ็กเกจ API และหน้าเว็บ:

   ```powershell
   python -m pip install -r requirements.deploy.txt
   npm ci
   npm run build
   ```

   ใช้ `requirements.deploy.txt` เพื่อไม่ให้ pip เปลี่ยน PyTorch/CUDA build ที่ติดตั้งไว้ก่อนหน้า; `requirements.txt` เป็นชุดพัฒนาที่ระบุ torch/torchvision เพิ่มเติม

5. สร้างไฟล์ตั้งค่าเฉพาะเครื่องจากตัวอย่าง:

   ```powershell
   Copy-Item .env.example .env
   ```

   เปิด `.env` แล้วตั้ง `BONEAGE_USERNAME`, `BONEAGE_PASSWORD` และ `BONEAGE_SESSION_SECRET` ด้วยค่าที่คาดเดายาก (secret ควรมีอย่างน้อย 32 ตัวอักษร) จากนั้นแก้ `BONEAGE_FULL18_CHECKPOINT` และ `BONEAGE_YOLO_CHECKPOINT` ให้ชี้ไปยังไฟล์จริง ตัวอย่างตำแหน่งเริ่มต้นคือ `models/focalnet_full18.pt` และ `models/yolo_roi9.pt` ห้ามใช้ค่า placeholder เมื่อเปิดระบบ หากมี SHA-256 ที่ผู้ดูแลโมเดลรับรอง ให้กำหนด `BONEAGE_FULL18_SHA256` และ `BONEAGE_YOLO_SHA256` เพิ่ม

   สร้างรหัสสุ่มได้ด้วย Python แล้วนำไปใส่ใน `.env` ด้วยตนเอง:

   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

   ค่าเริ่มต้น `BONEAGE_DEMO_ENABLED=0` ปิด endpoint สาธิตแบบไม่ต้องเข้าสู่ระบบ; ไม่มีบัญชี `admin1/admin1` สำรอง หากใช้ `start_gpu.cmd` โปรแกรมจะสร้างบัญชีสุ่มเฉพาะเครื่องไว้ใน `runtime/gpu_login.json` และเปิดเฉพาะ `127.0.0.1` อย่าเผยแพร่ไฟล์นี้หรือเปิดพอร์ต/tunnel โดยไม่ได้ตั้งค่าความปลอดภัย

6. สร้างโฟลเดอร์และวาง checkpoint ที่ได้รับอนุญาต:

   ```powershell
   New-Item -ItemType Directory -Force models
   ```

   วาง FocalNet และ YOLO ไว้ที่ `models/focalnet_full18.pt` และ `models/yolo_roi9.pt` (หรือระบุพาธจริงใน `.env`) ตรวจว่าไฟล์อ่านได้และเป็นรุ่นที่ใช้กับโค้ดนี้ ห้ามใช้ checkpoint คนละรุ่นหรือ preprocessing คนละแบบโดยไม่ได้ตรวจสอบ

   ตรวจ hash ของ YOLO ที่พาธเริ่มต้นได้ด้วย:

   ```powershell
   Get-FileHash .\models\yolo_roi9.pt -Algorithm SHA256
   ```

   ถ้าต้องการใช้ checkpoint YOLO ที่ตรงกับไฟล์ในคลังซึ่งระบุไว้ข้างต้น ค่า `Hash` ต้องตรงกันทุกตัวอักษร หากไม่ตรง ให้หยุดและตรวจแหล่งที่มา/รุ่นกับผู้ดูแลโมเดลก่อนใช้งาน; อย่าเปลี่ยนชื่อไฟล์เพื่อให้ดูเหมือนเป็นรุ่นเดียวกัน

7. ตรวจสภาพแวดล้อมก่อนเริ่มบริการ:

   ```powershell
   python scripts/check_local_install.py
   ```

   หากต้องการบังคับให้โมเดลหลักและ detector มี checksum ที่ตั้งไว้ ให้เพิ่ม `BONEAGE_REQUIRE_CHECKPOINT_SHA256=1` ใน `.env`. สำหรับโมเดลที่ไม่มีตัวแปร checkpoint เฉพาะ ให้ตั้ง hash ด้วยรูปแบบ `BONEAGE_CHECKPOINT_SHA256_<MODEL_ID ตัวพิมพ์ใหญ่>` เช่น `BONEAGE_CHECKPOINT_SHA256_FULL18_CONVNEXTV2_A2V2`. เมื่อ hash ไม่ตรง ระบบจะปฏิเสธ checkpoint นั้น ค่า hash เป็นการตรวจความตรงกันของไฟล์ ไม่ได้พิสูจน์คุณภาพหรือแหล่งที่มา

## เปิดและเข้าสู่ระบบ

รัน `start_gpu.cmd` จากโฟลเดอร์โครงการ ระบบจะใช้ Python จาก `.venv` ก่อน แล้วเปิด `http://127.0.0.1:8770/#/imaging`

การเปิดครั้งแรกสร้างบัญชีสุ่ม `local-research` พร้อม session secret ใน `runtime/gpu_login.json` สำหรับ GPU launcher. นี่เป็นบัญชีเฉพาะเครื่องสำหรับทดลองที่เปิดบน `127.0.0.1` เท่านั้น ไม่รองรับการแบ่งผู้ใช้/สิทธิ์ reviewer และไม่ควรเปิดพอร์ตให้ผู้อื่นหรือใช้แทนระบบบัญชีของมหาวิทยาลัย หากใช้บัญชีนี้ เปิดไฟล์ด้วย `Get-Content .\runtime\gpu_login.json` บนเครื่องเดียวกันแล้วกรอกในหน้าเข้าสู่ระบบ; ห้ามส่งไฟล์นี้หรือ `.env` ต่อผู้อื่น. `start_cpu.cmd` และ `start_web.cmd` ต้องกำหนด credential ใน `.env` ก่อน

ตรวจ `http://127.0.0.1:8770/api/health` ว่าอุปกรณ์เป็น `cuda` และมีโมเดลพร้อมใช้ก่อนทดสอบภาพหนึ่งภาพ ตรวจว่าได้ ROI ครบ 9 จุดและมีผล XAI ก่อนใช้งานกับชุดข้อมูลจริง

## ปิดระบบและแก้ปัญหา

- `restart_gpu.cmd` ใช้เริ่มเซิร์ฟเวอร์ใหม่เท่านั้น โดยจะถามยืนยันก่อนหยุด process เดิม; ให้ตอบ `Y` เฉพาะเมื่อไม่มี inference กำลังทำงาน หากต้องการปิดเซิร์ฟเวอร์ ให้เปิด Task Manager แล้วหยุด Python process ที่รัน `scripts\launch_gpu.py` (ตรวจ command line ให้ตรงก่อนหยุด)
- ตรวจ `runtime/gpu_stderr.log` และ `runtime/gpu_stdout.log` เมื่อเปิดไม่สำเร็จ
- ถ้า CUDA เป็น `False` ให้ตรวจไดรเวอร์ NVIDIA และติดตั้ง PyTorch build ที่ตรงกับเครื่องจากหน้าอย่างเป็นทางการ
- ถ้า `model_available` เป็น `false` ให้ตรวจตำแหน่งไฟล์ checkpoint และค่าใน `.env`
- ถ้าเปิดหน้าเว็บไม่ได้ ให้ตรวจว่า `npm run build` จบแล้วและไม่มี process อื่นใช้พอร์ต 8770
- ถ้า ROI ไม่ครบ 9 จุด ให้ตรวจภาพและแก้กรอบก่อนทำนาย

## การคุ้มครองข้อมูลและข้อจำกัด

- เก็บ `.env`, `runtime/`, ฐานข้อมูล และภาพจริงไว้นอกชุด Source Code ที่เผยแพร่
- endpoint `/api/demo/predict` ปิดเป็นค่าเริ่มต้น (`BONEAGE_DEMO_ENABLED=0`); หากเปิด ต้องมีการทบทวนความเสี่ยงและจำกัดการเข้าถึง/อัตราเรียกผ่าน reverse proxy ก่อน ห้ามใช้ anonymous upload กับภาพผู้ป่วยจริง
- ค่า session secret ต้องสุ่มและยาวอย่างน้อย 32 ตัวอักษร; ห้ามใช้บัญชีเริ่มต้นที่คาดเดาได้, เก็บ `.env` นอก Git และหมุน credential หากสงสัยว่าเคยรั่วไหล
- ก่อนเปิดระบบภายนอก ให้ใช้ HTTPS, จำกัด CORS เป็น origin ที่ระบุแน่นอน, ตั้ง firewall/role access และทดสอบสิทธิ์ผู้ใช้; CORS ไม่ใช่ระบบ authentication
- การแสดงภาพที่ปรับความสว่างหรือความคมชัดอาจไม่ตรงกับภาพที่ส่งเข้าโมเดล ให้ยืนยันจาก metadata ของผล inference
- แผนที่ XAI เป็นการแสดงการตอบสนองตามวิธีที่เลือก ไม่ใช่ความน่าจะเป็น ความมั่นใจ หรือหลักฐานเชิงสาเหตุ
- ค่า validation ใน manuscript เป็นผลระดับชุดข้อมูล ไม่ใช่ค่าความแม่นยำที่รับประกันสำหรับผู้ป่วยรายบุคคล

## สถานะ Supabase

ใน Supabase project ของงานมี schema สำหรับบัญชี metadata ผลทำนาย feedback และ private storage สำหรับ RSNA แล้ว แต่หน้าเว็บและ API รุ่นนี้ยังใช้ local authentication และ SQLite เดิม จึงยังไม่มีการส่งข้อมูลหรือภาพขึ้น Supabase. อย่าใส่ publishable key จนกว่า frontend จะเรียก Supabase SDK หรือ service จริง และห้ามใส่ service-role/secret key ในหน้าเว็บหรือ GitHub. อ่าน [คู่มือตั้งค่า Supabase](SUPABASE_SETUP_TH.md) และ [แนวทางติดตั้งและดูแลข้อมูลอย่างปลอดภัย](SECURE_OPERATIONS_TH.md) เพื่อดูขอบเขตที่เตรียมไว้และสิ่งที่ยังขาด.

สำหรับวิธีดูขั้นตอนใช้งานหน้าเว็บและตรวจอาการผิดปกติ อ่าน [คู่มือทดลองเว็บ](DEMO_GUIDE_TH.md). ถ้ารายการ Deploy ใน GitHub/Vercel เป็นสีแดง ให้เปิด Build Logs ของ deployment ที่ล้มเหลวโดยตรง; การทดสอบ source ในเครื่องไม่สามารถระบุ error log ของ Vercel แทนได้.
