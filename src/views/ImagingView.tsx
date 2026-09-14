import React, { useEffect, useState } from 'react';
import { PatientCase, DetectedROI, Language } from '../types';
import { AuthenticatedImage } from '../components/AuthenticatedImage';

interface ImagingViewProps {
  currentCase: PatientCase;
  onUpdateCase: (updated: Partial<PatientCase>) => void;
  onContinue: (image?: File, stayOnImaging?: boolean) => void;
  onBack: () => void;
  isProcessing?: boolean;
  processingError?: string;
  language: Language;
}

export const ImagingView: React.FC<ImagingViewProps> = ({
  currentCase,
  onUpdateCase,
  onContinue,
  onBack,
  isProcessing = false,
  processingError = '',
  language,
}) => {
  const [rois, setRois] = useState<DetectedROI[]>(currentCase.rois);
  const [selectedRoiId, setSelectedRoiId] = useState<string>('roi-1');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [noiseReduction, setNoiseReduction] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setRois(currentCase.rois);
    setUploadedImage(null);
    setPreviewUrl('');
    setUploadError('');
  }, [currentCase.id]);

  useEffect(() => {
    setRois(currentCase.rois);
  }, [currentCase.rois]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const detectedRois = rois.filter((roi) => roi.status !== 'pending' && parseFloat(roi.bbox.width) > 0 && parseFloat(roi.bbox.height) > 0);
  const selectedRoi = detectedRois.find((r) => r.id === selectedRoiId) || detectedRois[0];

  const handleToggleRoiStatus = (roiId: string) => {
    const updated = rois.map((r) => {
      if (r.id === roiId) {
        const nextStatus: DetectedROI['status'] =
          r.status === 'accepted' ? 'flagged' : r.status === 'flagged' ? 'pending' : 'accepted';
        return { ...r, status: nextStatus };
      }
      return r;
    });
    setRois(updated);
    onUpdateCase({ rois: updated });
  };

  const handleAcceptAll = () => {
    const updated = rois.map((r) => r.status === 'pending' ? r : ({ ...r, status: 'accepted' as const }));
    setRois(updated);
    onUpdateCase({ rois: updated, roisAccepted: detectedRois.length });
  };

  const handleFlagCurrent = () => {
    if (selectedRoiId) {
      handleToggleRoiStatus(selectedRoiId);
    }
  };

  const handleRemoveCurrent = () => {
    if (!selectedRoi) return;
    const updated = rois.map((roi) => roi.id === selectedRoi.id ? {
      ...roi,
      confidence: 0,
      importance: 0,
      xaiImportance: undefined,
      thumbnailUrl: '',
      bbox: { top: '0%', left: '0%', width: '0%', height: '0%' },
      status: 'pending' as const,
    } : roi);
    setRois(updated);
    onUpdateCase({
      rois: updated,
      roisAccepted: updated.filter((roi) => roi.status === 'accepted').length,
      imageQualityCheck: 'Flagged',
      xaiHeatmapUrl: '',
      xaiEvidenceStatus: 'unavailable',
    });
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.2, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.2, 0.8));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
    setRotation(0);
    setNoiseReduction(0);
  };

  const updateSelectedBox = (field: 'left' | 'top' | 'width' | 'height', delta: number) => {
    if (!selectedRoi) return;
    const updated = rois.map((roi) => {
      if (roi.id !== selectedRoiId) return roi;
      const current = parseFloat(roi.bbox[field]) || 0;
      const max = field === 'width' || field === 'height' ? 100 : 99;
      const min = field === 'width' || field === 'height' ? 1 : 0;
      return {
        ...roi,
        bbox: { ...roi.bbox, [field]: `${Math.max(min, Math.min(max, current + delta)).toFixed(2)}%` },
        status: 'flagged' as const,
        source: 'expert_review' as const,
      };
    });
    setRois(updated);
    onUpdateCase({ rois: updated });
  };

  const handleImageUpload = (file?: File) => {
    setUploadError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError(language === 'th' ? 'รองรับไฟล์ภาพ PNG/JPG เท่านั้น' : 'Please select a PNG/JPG image.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError(language === 'th' ? 'ไฟล์ต้องมีขนาดไม่เกิน 25 MB' : 'Image must be 25 MB or smaller.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    const clearedRois = currentCase.rois.map((roi) => ({
      ...roi,
      confidence: 0,
      source: undefined,
      thumbnailUrl: '',
      bbox: { top: '0%', left: '0%', width: '0%', height: '0%' },
      status: 'pending' as const,
    }));
    setRois(clearedRois);
    onUpdateCase({ rois: clearedRois, xaiHeatmapUrl: '', xaiEvidenceStatus: 'unavailable' });
    onContinue(file, true);
  };

  const canRun = Boolean(uploadedImage || currentCase.xrayImageUrl.startsWith('/runtime-assets/'));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 pb-28">
      {/* Title */}
      <div>
        <h2 className="font-headline-md text-2xl md:text-3xl text-[#1a1b21] font-bold">
          {language === 'th'
            ? 'การประมวลผลภาพถ่ายและ ROI (Imaging & ROI Evidence)'
            : 'Imaging & ROI Evidence'}
        </h2>
        <p className="font-body-md text-sm text-[#434752] mt-0.5">
          {language === 'th'
            ? 'วิเคราะห์ภาพรังสีมือซ้ายและระบุตำแหน่งศูนย์การสร้างกระดูก (Ossification Centers)'
            : 'Hand Radiograph Analysis & Region of Interest Extraction'}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-[#c3c6d4]/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#002e6f]/10 text-[#002e6f] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined">upload_file</span>
          </div>
          <div>
            <div className="font-headline-sm text-sm font-bold text-[#1a1b21]">
              {language === 'th' ? 'อัปโหลดภาพ X-ray มือซ้าย' : 'Upload left-hand radiograph'}
            </div>
            <div className="font-caption text-xs text-[#61718a] mt-0.5">
              {uploadedImage
                ? `${uploadedImage.name} • ${(uploadedImage.size / 1024 / 1024).toFixed(2)} MB`
                : language === 'th'
                ? 'PNG/JPG สูงสุด 25 MB • ระบบจะตรวจ ROI 9 จุดก่อนทำนาย'
                : 'PNG/JPG up to 25 MB • nine-ROI quality gate runs before prediction'}
            </div>
            {(uploadError || processingError) && (
              <div className="mt-1 text-xs text-[#93000a]">{uploadError || processingError}</div>
            )}
          </div>
        </div>
        <label className="cursor-pointer self-start md:self-auto inline-flex items-center justify-center gap-2 bg-white text-[#002e6f] border border-[#c3c6d4] hover:bg-[#ededf5] rounded-lg px-4 py-2 text-xs font-bold transition-colors">
          <span className="material-symbols-outlined text-base">folder_open</span>
          <span>{language === 'th' ? 'เลือกภาพ' : 'Choose image'}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleImageUpload(event.target.files?.[0])}
          />
        </label>
      </div>

      {/* Main Split: Left Dark Medical Viewer / Right ROI Panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Medical Radiograph Viewer */}
        <div className="flex-1 bg-[#05070a] rounded-xl overflow-hidden shadow-md flex flex-col border border-[#c3c6d4]/40 min-h-[560px] relative select-none">
          {/* Top Viewer Controls Toolbar */}
          <div className="p-3 bg-[#0d131f]/90 border-b border-white/10 flex flex-wrap justify-between items-center z-10 gap-2">
            <div className="flex items-center gap-2 text-white">
              <span className="font-data-mono text-xs text-[#9deee5] font-bold">
                {uploadedImage?.name || (currentCase.xrayImageUrl ? 'stored_full_hand.png' : language === 'th' ? 'ยังไม่ได้เลือกภาพ' : 'No image selected')}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/70">{currentCase.xrayImageUrl || uploadedImage ? 'source preserved' : '—'}</span>
            </div>

            {/* Viewer action buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`px-2.5 py-1 rounded text-xs font-label-caps flex items-center gap-1 transition-colors ${
                  showBoundingBoxes
                    ? 'bg-[#006a63] text-white font-bold'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                title="Toggle ROI Bounding Boxes"
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
                <span>ROI Boxes</span>
              </button>

              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`px-2.5 py-1 rounded text-xs font-label-caps flex items-center gap-1 transition-colors ${
                  showHeatmap
                    ? 'bg-[#2b5bb3] text-white font-bold'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
                title="Toggle patient-specific XAI heatmap"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Heatmap</span>
              </button>

              <div className="h-4 w-px bg-white/20 mx-1"></div>

              <button
                onClick={handleZoomIn}
                className="p-1 rounded bg-white/10 text-white hover:bg-white/20"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-base">zoom_in</span>
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1 rounded bg-white/10 text-white hover:bg-white/20"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-base">zoom_out</span>
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded bg-white/10 text-white hover:bg-white/20"
                title="Reset View"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
              </button>
            </div>
          </div>

          {/* Radiograph Image Stage */}
          <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden bg-black">
            {/* Watermark */}
            <div className="absolute top-4 left-4 z-20 pointer-events-none text-white/30 font-data-mono text-[10px] uppercase tracking-widest">
              BONEAGE XAI PROTOTYPE • RESEARCH ONLY
            </div>

            <div
              className="relative transition-transform duration-200 ease-out max-h-[580px]"
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%) blur(${noiseReduction * 0.12}px)`,
              }}
            >
              {/* Main Hand Radiograph */}
              <AuthenticatedImage
                src={showHeatmap && !previewUrl ? currentCase.xaiHeatmapUrl : previewUrl || currentCase.xrayImageUrl}
                alt="Pediatric Hand Radiograph"
                className="max-h-[520px] w-auto object-contain rounded-md shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {/* Dynamic SVG ROI Bounding Box Overlays */}
              {showBoundingBoxes && (
                <div className="absolute inset-0 pointer-events-none">
                  {detectedRois.map((roi) => {
                    const isSelected = roi.id === selectedRoiId;
                    return (
                      <div
                        key={roi.id}
                        onClick={() => setSelectedRoiId(roi.id)}
                        className={`absolute border-2 transition-all cursor-pointer pointer-events-auto rounded-xs ${
                          isSelected
                            ? 'border-[#9deee5] bg-[#006a63]/25 ring-2 ring-[#006a63]/60'
                            : roi.status === 'flagged'
                            ? 'border-[#ba1a1a] bg-[#ba1a1a]/15'
                            : 'border-[#96b5ff]/70 hover:border-white'
                        }`}
                        style={{
                          left: roi.bbox.left,
                          top: roi.bbox.top,
                          width: roi.bbox.width,
                          height: roi.bbox.height,
                        }}
                      >
                        <div
                          className={`absolute -top-5 left-0 px-1 py-0.5 rounded text-[9px] font-data-mono font-bold whitespace-nowrap shadow-xs ${
                            isSelected
                              ? 'bg-[#002e6f] text-[#9deee5]'
                              : 'bg-black/70 text-white'
                          }`}
                        >
                          {roi.name} ({roi.source === 'expert_review'
                            ? (language === 'th' ? 'แพทย์แก้ไข' : 'Expert reviewed')
                            : `${(roi.confidence * 100).toFixed(0)}%`})
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Viewer Indicator */}
          <div className="p-2.5 bg-[#0d131f]/90 border-t border-white/10 flex justify-between items-center text-white/70 text-xs font-data-mono z-10">
            <span>{language === 'th' ? 'ระบบตรวจตำแหน่งกายวิภาค 9 จุด' : 'Nine-region anatomy detector'}</span>
            <span>Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
            <span className="text-[#9deee5]">
              {selectedRoi ? `Active: ${selectedRoi.name} (${selectedRoi.code})` : 'Select ROI'}
            </span>
          </div>
        </div>

        {/* Right Column: Detected ROIs List & Control */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-4">
          <div className="bg-white rounded-xl shadow-xs border border-[#c3c6d4]/40 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-[#c3c6d4]/30 pb-3">
              <div>
                <h3 className="font-headline-sm text-base font-bold text-[#1a1b21]">
                  {language === 'th' ? 'ตำแหน่ง ROI ที่ตรวจพบ' : 'Detected ROIs'} ({detectedRois.length})
                </h3>
                <p className="font-caption text-xs text-[#737784]">
                  {detectedRois.filter((r) => r.status === 'accepted').length} of {detectedRois.length} Accepted
                </p>
              </div>

              <button
                onClick={handleAcceptAll}
                disabled={detectedRois.length === 0}
                className="bg-[#9deee5] disabled:bg-[#e2e2ea] disabled:text-[#737784] text-[#0c6f67] font-bold px-3 py-1.5 rounded-lg text-xs font-label-caps hover:brightness-95 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {language === 'th' ? 'ยอมรับทั้งหมด' : 'Accept All'}
              </button>
            </div>

            {/* Scrollable ROI Cards List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {detectedRois.length === 0 && (
                <div className="rounded-lg border border-dashed border-[#c3c6d4] p-5 text-center text-xs text-[#737784]">
                  {isProcessing
                    ? (language === 'th' ? 'กำลังตรวจจับ ROI ทั้ง 9 จุด สร้างภาพครอป และคำนวณ XAI...' : 'Detecting nine ROIs, creating crops, and calculating XAI...')
                    : (language === 'th' ? 'ยังไม่มีผลตรวจจับ กรุณาเลือกภาพ X-ray' : 'No detections yet. Select an X-ray image.')}
                </div>
              )}
              {detectedRois.map((roi) => {
                const isSelected = roi.id === selectedRoiId;
                return (
                  <div
                    key={roi.id}
                    onClick={() => setSelectedRoiId(roi.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#002e6f] bg-[#002e6f]/5 ring-1 ring-[#002e6f]'
                        : 'border-[#c3c6d4]/40 hover:border-[#002e6f]/50 hover:bg-[#f4f7fb]'
                    }`}
                  >
                    <div className="flex gap-3 justify-between items-start">
                      {roi.thumbnailUrl && (
                        <AuthenticatedImage src={roi.thumbnailUrl} alt={`${roi.code} crop`} className="w-14 h-14 rounded object-cover bg-black shrink-0" />
                      )}
                      <div>
                        <div className="font-headline-sm text-xs font-bold text-[#1a1b21] flex items-center gap-1.5">
                          <span>{roi.name}</span>
                          <span className="text-[10px] text-[#737784]">({roi.code})</span>
                        </div>
                        <div className="text-[11px] text-[#434752] mt-0.5">
                          {language === 'th' ? roi.nameTh : roi.anatomicalNote}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleRoiStatus(roi.id);
                        }}
                        className={`text-[10px] font-label-caps font-bold px-2 py-0.5 rounded-full transition-colors ${
                          roi.status === 'accepted'
                            ? 'bg-[#9deee5] text-[#0c6f67]'
                            : roi.status === 'flagged'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-[#ffebc4] text-[#784d00]'
                        }`}
                      >
                        {roi.status || 'pending'}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-data-mono text-[#737784]">
                      <span>
                        {roi.source === 'expert_review'
                          ? (language === 'th' ? 'ตำแหน่งที่แพทย์แก้ไข' : 'Expert-reviewed position')
                          : `${language === 'th' ? 'ความเชื่อมั่นการตรวจตำแหน่ง' : 'Detection confidence'}: ${(roi.confidence * 100).toFixed(1)}%`}
                      </span>
                      <span>Importance: {roi.importance}%</span>
                    </div>

                    {/* Progress bar for importance */}
                    <div className="mt-1.5 w-full bg-[#ededf5] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#002e6f] h-full rounded-full"
                        style={{ width: `${roi.importance}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions on active selected ROI */}
            <div className="pt-3 border-t border-[#c3c6d4]/30 flex gap-2">
              <button
                onClick={handleRemoveCurrent}
                disabled={!selectedRoi}
                className="py-2 px-3 bg-white border border-[#ba1a1a] text-[#93000a] rounded-lg font-label-caps text-xs disabled:opacity-40"
                title={language === 'th' ? 'ลบผลตรวจจับตำแหน่งนี้' : 'Remove this detection'}
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
              <button
                onClick={handleFlagCurrent}
                disabled={!selectedRoi}
                className="flex-1 py-2 bg-[#ededf5] hover:bg-[#ffdad6] hover:text-[#93000a] text-[#434752] rounded-lg font-label-caps text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">flag</span>
                <span>{language === 'th' ? 'ทำเครื่องหมายตรวจสอบ' : 'Flag ROI'}</span>
              </button>

              <button
                onClick={() => {
                  if (selectedRoiId) {
                    const updated = rois.map((r) =>
                      r.id === selectedRoiId ? { ...r, status: 'accepted' as const } : r
                    );
                    setRois(updated);
                    onUpdateCase({ rois: updated });
                  }
                }}
                disabled={!selectedRoi}
                className="flex-1 py-2 bg-[#006a63] hover:bg-[#0c6f67] text-white rounded-lg font-label-caps text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                <span>{language === 'th' ? 'ยอมรับ ROI นี้' : 'Accept ROI'}</span>
              </button>
            </div>
            <div className="pt-3 border-t border-[#c3c6d4]/30 space-y-2 text-xs">
              <div className="font-bold text-[#1a1b21]">{language === 'th' ? 'แก้กรอบที่เลือก (บันทึกประวัติอัตโนมัติ)' : 'Edit selected box (audited)'}</div>
              <div className="grid grid-cols-4 gap-1">
                {(['left:-1:←', 'top:-1:↑', 'top:1:↓', 'left:1:→', 'width:-1:W−', 'width:1:W+', 'height:-1:H−', 'height:1:H+'] as const).map((control) => {
                  const [field, delta, label] = control.split(':') as ['left' | 'top' | 'width' | 'height', string, string];
                  return <button key={control} disabled={!selectedRoi} onClick={() => updateSelectedBox(field, Number(delta))} className="rounded bg-[#ededf5] disabled:text-[#a5a5ad] disabled:cursor-not-allowed p-2">{label}</button>;
                })}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label>Brightness {brightness}%<input className="w-full" type="range" min="50" max="180" value={brightness} onChange={e => setBrightness(Number(e.target.value))}/></label>
                <label>Contrast {contrast}%<input className="w-full" type="range" min="50" max="180" value={contrast} onChange={e => setContrast(Number(e.target.value))}/></label>
                <label>Rotate {rotation}°<input className="w-full" type="range" min="-15" max="15" value={rotation} onChange={e => setRotation(Number(e.target.value))}/></label>
                <label>Denoise {noiseReduction}<input className="w-full" type="range" min="0" max="5" value={noiseReduction} onChange={e => setNoiseReduction(Number(e.target.value))}/></label>
              </div>
              <div className="text-[10px] text-[#737784]">Viewer adjustments do not alter the source image used for inference.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Footer Bar */}
      <footer className="fixed bottom-0 left-0 md:left-[264px] right-0 h-16 z-30 flex items-center justify-between px-4 md:px-8 bg-white border-t border-[#c3c6d4]/50 shadow-xs">
        <div className="font-caption text-xs text-[#737784] hidden sm:block">
          Skeleton Bone Age Research MVP | Human Review Required
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            onClick={() => onUpdateCase({ rois })}
            className="font-label-caps text-xs bg-[#9deee5] text-[#0c6f67] font-bold rounded-lg px-5 py-2 hover:brightness-95 transition-all cursor-pointer"
          >
            {language === 'th' ? 'บันทึกแบบร่าง' : 'Save Draft'}
          </button>
          <button
            onClick={onBack}
            className="font-label-caps text-xs bg-[#e2e2ea] text-[#1a1b21] font-bold rounded-lg px-5 py-2 hover:bg-[#c3c6d4] transition-all cursor-pointer"
          >
            {language === 'th' ? 'ย้อนกลับ' : 'Back'}
          </button>
          <button
            onClick={() => onContinue(currentCase.xrayImageUrl.startsWith('/runtime-assets/') ? undefined : uploadedImage ?? undefined)}
            disabled={!canRun || isProcessing}
            className="font-label-caps text-xs bg-[#002e6f] disabled:bg-[#9aa5b8] text-white font-bold rounded-lg px-6 py-2 hover:bg-[#00439b] transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs active:scale-98"
          >
            <span className={`material-symbols-outlined text-sm ${isProcessing ? 'animate-spin' : ''}`}>
              {isProcessing ? 'progress_activity' : 'psychology'}
            </span>
            <span>
              {isProcessing
                ? language === 'th' ? 'กำลังประมวลผล...' : 'Processing...'
                : currentCase.rawPredictedAgeMonths != null
                  ? (language === 'th' ? 'ดูผลการทำนาย' : 'View prediction')
                  : (language === 'th' ? 'ประมวลผลการทำนาย' : 'Run prediction')}
            </span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
