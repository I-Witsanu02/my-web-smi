import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppView, AuditEvent, Language, PatientCase, UserProfile } from './types';
import { api, clearAuthToken, FeedbackItem, getAuthToken, ModelInfo, storeAuthToken } from './api';
import { initialCases, currentUser } from './data/mockData';
import {
  loadAuditEvents,
  loadStoredCases,
  loadUiState,
  storeAuditEvents,
  storeCases,
  storeUiState,
} from './storage';
import { TopAppBar } from './components/TopAppBar';
import { SideNavBar } from './components/SideNavBar';
import { CaseContextBar } from './components/CaseContextBar';
import { SwitchCaseModal } from './components/SwitchCaseModal';
import { NewAssessmentModal } from './components/NewAssessmentModal';
import { NotificationModal } from './components/NotificationModal';
import { SettingsModal } from './components/SettingsModal';

import { LoginView } from './views/LoginView';
import { OverviewView } from './views/OverviewView';
import { CasesView } from './views/CasesView';
import { ScreeningView } from './views/ScreeningView';
import { IntakeView } from './views/IntakeView';
import { ImagingView } from './views/ImagingView';
import { WorkstationView } from './views/WorkstationView';
import './workstation.css';
import { PredictionView } from './views/PredictionView';
import { XAIView } from './views/XAIView';
import { ReportView } from './views/ReportView';
import { ChecklistView } from './views/ChecklistView';
import { ReviewQueueView } from './views/ReviewQueueView';
import { ReferencesView } from './views/ReferencesView';
import { LogsView } from './views/LogsView';
import { HelpSupportView } from './views/HelpSupportView';
import { calculateAgeMonths, formatAge } from './utils/age';
import { inferenceImage, inputKey, intensitySettings } from './utils/inferenceImage';

const APP_VIEWS: AppView[] = [
  'workstation',
  'overview', 'cases', 'screening', 'intake', 'imaging', 'roi', 'prediction', 'xai',
  'report', 'checklist', 'review-queue', 'references', 'logs', 'help', 'support', 'settings',
];
const CASE_CENTRIC_VIEWS: AppView[] = ['workstation', 'screening', 'intake', 'imaging', 'roi', 'prediction', 'xai', 'report', 'checklist'];
const INITIAL_UI = loadUiState({ language: 'en', selectedCaseId: '', currentView: 'overview' });

function viewFromHash(fallback: AppView): AppView {
  const candidate = window.location.hash.replace(/^#\/?/, '') as AppView;
  if(candidate==='workstation'||candidate==='roi')return 'imaging';
  return APP_VIEWS.includes(candidate) ? candidate : fallback;
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [language, setLanguage] = useState<Language>(INITIAL_UI.language);
  const [currentView, setCurrentView] = useState<AppView>(() => viewFromHash(INITIAL_UI.currentView));
  const [cases, setCases] = useState<PatientCase[]>(() => loadStoredCases(initialCases));
  const [selectedCaseId, setSelectedCaseId] = useState<string>(INITIAL_UI.selectedCaseId);
  const [user, setUser] = useState<UserProfile>(currentUser);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(loadAuditEvents);
  const [storageStatus, setStorageStatus] = useState<'saved' | 'saving' | 'local'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<string>('');
  const [casesHydrated, setCasesHydrated] = useState(false);

  // Modals state
  const [isSwitchCaseOpen, setIsSwitchCaseOpen] = useState(false);
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('full18_focalnet_b8');
  const [selectedXaiMethod, setSelectedXaiMethod] = useState('GradCAM');
  const liveXai=useRef(selectedXaiMethod);liveXai.current=selectedXaiMethod;
  const [isPredicting, setIsPredicting] = useState(false);
  const [activeRequestId,setActiveRequestId]=useState('');
  const [predictionError, setPredictionError] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const [reviewedMonths, setReviewedMonths] = useState<number | ''>('');
  const [reviewSaved, setReviewSaved] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);

  // Active current case
  useEffect(() => {
    const refresh = () => { void api.listFeedback().then(r => setFeedbackItems(r.feedback)).catch(() => undefined); };
    window.addEventListener('boneage-feedback-updated', refresh);
    return () => window.removeEventListener('boneage-feedback-updated', refresh);
  }, []);
  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const liveCase=useRef(currentCase); liveCase.current=currentCase;
  const liveModel=useRef(selectedModelId);liveModel.current=selectedModelId;
  const requestLock=useRef(false);
  useEffect(()=>{
    if(!currentCase)return;
    setSelectedModelId(currentCase.modelId||'full18_focalnet_b8');
    setSelectedXaiMethod(currentCase.xaiMethod||'GradCAM');
  },[currentCase?.id,casesHydrated]);
  const pendingReviewCount = useMemo(
    () => cases.filter((item) => item.status === 'Review Required' || item.status === 'Review Req').length,
    [cases]
  );

  const navigateTo = useCallback((view: AppView, replace = false) => {
    if(view==='workstation'||view==='roi')view='imaging';
    if (CASE_CENTRIC_VIEWS.includes(view) && cases.length === 0) view = 'cases';
    const nextHash = `#/${view}`;
    if (window.location.hash !== nextHash) {
      window.history[replace ? 'replaceState' : 'pushState']({ view }, '', nextHash);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [cases.length]);

  const recordAudit = useCallback((module: string, message: string, level: AuditEvent['level'] = 'INFO', caseId?: string) => {
    const event: AuditEvent = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      caseId,
    };
    setAuditEvents((previous) => [event, ...previous].slice(0, 250));
    void api.appendAudit({ ...event, case_id: caseId }).catch(() => undefined);
  }, []);

  const handleLogin = useCallback(async (username: string, password: string, remember: boolean) => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const result = await api.login(username.trim(), password);
      storeAuthToken(result.token, remember);
      setUser((previous) => ({ ...previous, name: result.user.name, role: result.user.role }));
      setIsAuthenticated(true);
      setAuthReady(true);
    } catch (error) {
      clearAuthToken();
      setIsAuthenticated(false);
      setLoginError(error instanceof Error ? error.message : 'ไม่สามารถเข้าสู่ระบบได้');
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const displayAge = (months: number) => {
    const rounded = Math.max(0, Math.round(months));
    return `${Math.floor(rounded / 12)}y ${rounded % 12}m`;
  };

  useEffect(() => {
    api.session()
      .then((result) => {
        setUser((previous) => ({ ...previous, name: result.user.name, role: result.user.role }));
        setIsAuthenticated(true);
      })
      .catch(() => {
        clearAuthToken();
        setIsAuthenticated(false);
      })
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    const onHistoryChange = () => setCurrentView(viewFromHash('overview'));
    window.addEventListener('popstate', onHistoryChange);
    window.addEventListener('hashchange', onHistoryChange);
    if (!window.location.hash) navigateTo(currentView, true);
    return () => {
      window.removeEventListener('popstate', onHistoryChange);
      window.removeEventListener('hashchange', onHistoryChange);
    };
  }, [navigateTo]);

  useEffect(() => {
    if (cases.length > 0 && !cases.some((item) => item.id === selectedCaseId)) {
      setSelectedCaseId(cases[0].id);
    }
    if (cases.length === 0 && CASE_CENTRIC_VIEWS.includes(currentView)) {
      navigateTo('cases', true);
    }
  }, [cases, selectedCaseId, currentView, navigateTo]);

  useEffect(() => {
    storeUiState({ language, selectedCaseId, currentView });
  }, [language, selectedCaseId, currentView]);

  useEffect(() => {
    if (currentView !== 'settings') return;
    setIsSettingsOpen(true);
    navigateTo('overview', true);
  }, [currentView, navigateTo]);

  useEffect(() => {
    storeAuditEvents(auditEvents);
  }, [auditEvents]);

  useEffect(() => {
    if (!isAuthenticated || !casesHydrated) return;
    storeCases(cases);
    setStorageStatus('saving');
    const timer = window.setTimeout(() => {
      api.saveCases(cases)
        .then(({ saved_at }) => {
          setStorageStatus('saved');
          setLastSavedAt(saved_at);
        })
        .catch(() => setStorageStatus('local'));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [cases, isAuthenticated, casesHydrated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      api.health(),
      api.models(),
      api.listCases<PatientCase>().catch(() => ({ cases: [] as PatientCase[] })),
      api.listFeedback().catch(() => ({ feedback: [] as FeedbackItem[], count: 0, updated_at: '' })),
    ])
      .then(([, catalog, persisted, feedback]) => {
        setBackendConnected(true);
        setModels(catalog.models);
        setSelectedModelId(liveCase.current?.modelId||catalog.default_model);
        const normalizedCases = persisted.cases.map((item) => {
          if (!item.dob || !item.measurementDate) return item;
          const months = calculateAgeMonths(item.dob, item.measurementDate);
          return { ...item, chronologicalAgeMonths: months, chronologicalAgeDisplay: formatAge(months, 'en') };
        });
        setCases(normalizedCases);
        setSelectedCaseId(normalizedCases[0]?.id || '');
        setCasesHydrated(true);
        setFeedbackItems(feedback.feedback);
      })
      .catch((error) => {
        setBackendConnected(false);
        setPredictionError(error instanceof Error ? error.message : 'Backend connection failed');
        setCasesHydrated(true);
      });
  }, [isAuthenticated]);

  const runRealPrediction = async (uploadedImage?: File, stayOnImaging = false, detectOnly = false, detectorRetry?:{source:string;settings:unknown}) => {
    if(requestLock.current||!currentCase)return;
    if(!detectOnly&&currentCase.rois.some(r=>r.reviewState!=='VERIFIED'||parseFloat(r.bbox.width)<=0||parseFloat(r.bbox.height)<=0)){setPredictionError('ตรวจและยืนยันกรอบครบ 9 จุดก่อนทำนาย');return;}
    requestLock.current=true;
    const startedAt = performance.now();
    setActiveRequestId(crypto.randomUUID());
    const requestCase=currentCase;
    const revision=requestCase.roiRevision||0;
    const pixelKey=inputKey(requestCase.inferenceImageMode,requestCase.inferenceViewSettings);
    const isCurrent=()=>liveCase.current?.id===requestCase.id&&(liveCase.current?.roiRevision||0)===revision&&liveCase.current?.xrayImageUrl===requestCase.xrayImageUrl&&liveCase.current?.sex===requestCase.sex&&liveCase.current?.chronologicalAgeMonths===requestCase.chronologicalAgeMonths&&liveModel.current===selectedModelId&&liveXai.current===selectedXaiMethod;
    setIsPredicting(true);
    setPredictionError('');
    setReviewSaved(false);
    setFeedbackStatus('');
    try {
      let sourceImage = uploadedImage;
      const adjustedInput=!detectOnly&&!uploadedImage&&pixelKey!==inputKey('original');
      if(adjustedInput)sourceImage=await inferenceImage(requestCase.xrayImageUrl,requestCase.inferenceViewSettings);
      if (!sourceImage && currentCase.xrayImageUrl.startsWith('/runtime-assets/')) {
        const blob = await api.fetchAsset(currentCase.xrayImageUrl);
        sourceImage = new File([blob], 'full_hand.png', { type: blob.type || 'image/png' });
      }

      let result;
      let imagingUpdate: Partial<PatientCase> = {};
      if (sourceImage) {
        const isStoredImageRerun = !uploadedImage && currentCase.xrayImageUrl.startsWith('/runtime-assets/');
        const reviewedBoxes = isStoredImageRerun
          ? Object.fromEntries(currentCase.rois.filter((roi) => roi.source === 'expert_review' && roi.status !== 'pending').map((roi) => {
              const left = parseFloat(roi.bbox.left) / 100;
              const top = parseFloat(roi.bbox.top) / 100;
              const width = parseFloat(roi.bbox.width) / 100;
              const height = parseFloat(roi.bbox.height) / 100;
              return [roi.code==='PP3MC'?'PP3':roi.code, [left, top, left + width, top + height]];
            })) as Record<string, [number, number, number, number]>
          : undefined;
        const fullHand = await api.predictFullHand(
          sourceImage,
          currentCase.sex === 'Male' ? 1 : 0,
          selectedModelId,
          currentCase.chronologicalAgeMonths,
          currentCase.id,
          detectOnly?undefined:reviewedBoxes, selectedXaiMethod, detectOnly
        );
        if(!isCurrent()||inputKey(liveCase.current?.inferenceImageMode,liveCase.current?.inferenceViewSettings)!==pixelKey)return;
        const [imageWidth, imageHeight] = fullHand.image_size;
        const detections = new Map(fullHand.detections.map((item) => [item.roi, item]));
        const updatedRois = currentCase.rois.map((roi) => {
          const detection = detections.get(roi.code)||detections.get(roi.code==='PP3'?'PP3MC':roi.code==='PP3MC'?'PP3':roi.code);
          if(detectorRetry&&roi.source==='expert_review')return roi;
          if(!uploadedImage&&roi.source==='expert_review'&&roi.reviewState==='VERIFIED')return {...roi,thumbnailUrl:detection?.crop_data_url||roi.thumbnailUrl};
          if (!detection) return { ...roi, status: 'pending' as const, reviewState:'DETECTED' as const, confidence:0, thumbnailUrl:'', bbox:{left:'0%',top:'0%',width:'0%',height:'0%'} };
          const [x1, y1, x2, y2] = detection.box;
          return {
            ...roi,
            confidence: detection.confidence,
            source: detection.source,
            thumbnailUrl: detection.crop_data_url,
            status: 'flagged' as const,
            reviewState: 'DETECTED' as const,
            bbox: {
              left: `${(x1 / imageWidth) * 100}%`,
              top: `${(y1 / imageHeight) * 100}%`,
              width: `${((x2 - x1) / imageWidth) * 100}%`,
              height: `${((y2 - y1) / imageHeight) * 100}%`,
            },
          };
        });
        imagingUpdate = {
          ...(!detectOnly?{predictionInput:{mode:requestCase.inferenceImageMode||'latest',settings:intensitySettings(adjustedInput?requestCase.inferenceViewSettings:{}),sourceUrl:requestCase.xrayImageUrl,inputUrl:fullHand.full_hand_url,key:pixelKey}}:{}),
          ...(uploadedImage&&!detectorRetry ? {uploadedAt:new Date().toISOString(),completedAt:undefined} : {}),
          inferenceId: fullHand.inference_id,
          xaiLayerUrl: fullHand.xai_layer || '',
          xrayImageUrl: detectorRetry?.source || (uploadedImage?fullHand.full_hand_url:requestCase.xrayImageUrl),
          ...(detectorRetry?{detectorRetryHistory:[...(requestCase.detectorRetryHistory||[]),{at:new Date().toISOString(),settings:detectorRetry.settings,detected:fullHand.detected_count,inputUrl:fullHand.full_hand_url,sourceUrl:detectorRetry.source,detector:fullHand.detector,rois:updatedRois}]}:{}),
          xaiHeatmapUrl: fullHand.xai_image || '',
          xaiMetadata: fullHand.xai_metadata,
          xaiEvidenceStatus: fullHand.xai_image ? 'generated' : 'unavailable',
          rois: updatedRois,
          detectorRois:uploadedImage||!currentCase.detectorRois?updatedRois:currentCase.detectorRois,
          roisAccepted: updatedRois.filter((roi) => roi.status === 'accepted').length,
          roisTotal: updatedRois.length,
          imageQualityCheck: fullHand.qc_status === 'PASS' ? 'Passed' : 'Flagged',
          detectorName: fullHand.detector,
        };
        if (!fullHand.prediction) {
          handleUpdateCurrentCase({...imagingUpdate,predictionStale:true,roiRevision:revision+1,currentStep:'Imaging'});
          if(detectOnly){setPredictionError('');navigateTo('imaging');return;}
          const detail = fullHand.message || `ROI gate did not pass (${fullHand.detected_count}/9 detected)`;
          setPredictionError(detail);
          recordAudit('ROI_GATE', detail, 'WARN', currentCase.id);
          if (currentView !== 'workstation') navigateTo('imaging');
          return;
        }
        result = fullHand.prediction;
      } else {
        throw new Error('กรุณาอัปโหลดภาพ X-ray มือก่อนประมวลผล');
      }

      setReviewedMonths('');
      setCases((previous) =>
        previous.map((item) => {
          if (item.id !== requestCase.id||(item.roiRevision||0)!==revision) return item;
          const signed = result.predicted_months - item.chronologicalAgeMonths;
          const offsetType = Math.abs(signed) < 3 ? 'Normal' : signed > 0 ? 'Advanced' : 'Delayed';
          const sourceRois = imagingUpdate.rois ?? item.rois;
          return {
            ...item,
            ...imagingUpdate,
            predictionStale:false,
            predictionDurationSeconds: Number(((performance.now() - startedAt) / 1000).toFixed(2)),
            predictionCompletedAt: new Date().toISOString(),
            predictionRoiRevision:uploadedImage?revision+1:revision,
            roiRevision:uploadedImage?revision+1:revision,
            predictionHistory:uploadedImage&&item.inferenceId&&!item.predictionHistory?.some(h=>h.inferenceId===item.inferenceId)?[...(item.predictionHistory||[]),{inferenceId:item.inferenceId,months:item.rawPredictedAgeMonths,xaiUrl:item.xaiLayerUrl||item.xaiHeatmapUrl,modelId:item.modelId,roiRevision:item.predictionRoiRevision??revision,savedAt:new Date().toISOString()}]:item.predictionHistory,
            predictedAgeMonths: result.predicted_months,
            rawPredictedAgeMonths: result.predicted_months,
            predictedAgeDisplay: displayAge(result.predicted_months),
            offsetMonths: Math.round(signed * 10) / 10,
            offsetType,
            modelId: result.model_id,
            modelDisplayName: result.model_name,
            modelArchitecture: 'ระบบวิเคราะห์ภาพ 9 ตำแหน่งร่วมกับข้อมูลเพศ',
            preprocessingVersion: result.preprocess,
            experimentId: 'FULL18_TRANSFER_REAL_AUG',
            validationMaeMonths: result.validation_mae_months,
            xaiMethod: result.xai_method || 'ROI-gate-weighted SmoothGrad Input × Gradient',
            rois: sourceRois.map((roi) => ({
              ...roi,
              xaiImportance: result.roi_gate[roi.code] ?? result.roi_gate[roi.code==='PP3MC'?'PP3':roi.code] ?? 0,
              importance: Math.round((result.roi_gate[roi.code] ?? result.roi_gate[roi.code==='PP3MC'?'PP3':roi.code] ?? 0) * 100),
            })),
            currentStep: 'Prediction',
            lastStep: 'Prediction',
            status: 'Review Required',
          };
        })
      );
      recordAudit(
        'INFERENCE',
        `${result.model_name} predicted ${result.predicted_months.toFixed(2)} months`,
        'INFO',
        selectedCaseId
      );
      navigateTo('prediction');
    } catch (error) {
      if(isCurrent())setPredictionError(error instanceof Error ? error.message : 'Prediction failed');
    } finally {
      requestLock.current=false;
      setIsPredicting(false);
    }
  };

  const saveExpertReview = async () => {
    if (reviewedMonths === '' || currentCase.rawPredictedAgeMonths == null) return;
    try {
      const saved = await api.saveReview({
        case_id: currentCase.id,
        patient_id: currentCase.patientId,
        model_id: currentCase.modelId,
        raw_prediction_months: currentCase.rawPredictedAgeMonths,
        reviewed_prediction_months: reviewedMonths,
        chronological_age_months: currentCase.chronologicalAgeMonths,
        sex: currentCase.sex,
        reviewer_note: 'Expert-reviewed value saved separately from the raw model output.',
        status: 'reviewed',
      });
      handleUpdateCurrentCase({ reviewedPredictedAgeMonths: Number(reviewedMonths) });
      setReviewSaved(true);
      setFeedbackStatus(saved.feedback_status);
      const refreshed = await api.listFeedback();
      setFeedbackItems(refreshed.feedback);
      recordAudit('CLINICAL_REVIEW', `Expert review saved at ${Number(reviewedMonths).toFixed(1)} months`, 'AUDIT', currentCase.id);
      navigateTo('xai');
    } catch (error) {
      setPredictionError(error instanceof Error ? error.message : 'Could not save review');
    }
  };

  const handleUpdateCurrentCase = (updated: Partial<PatientCase>) => {
    setCases((prev) =>
      prev.map((c) => (c.id === selectedCaseId ? { ...c, ...updated, updatedAt: new Date().toISOString(), ...(updated.status==='Finalized'||updated.status==='Complete'?{completedAt:new Date().toISOString()}:{} ) } : c))
    );
  };

  const invalidateSelectedResult = () => {
    handleUpdateCurrentCase({predictionStale:true,predictionHistory:!currentCase.predictionStale&&currentCase.inferenceId?[...(currentCase.predictionHistory||[]),{inferenceId:currentCase.inferenceId,months:currentCase.rawPredictedAgeMonths,xaiUrl:currentCase.xaiLayerUrl||currentCase.xaiHeatmapUrl,modelId:currentCase.modelId,roiRevision:currentCase.predictionRoiRevision??0,savedAt:new Date().toISOString(),xaiMethod:currentCase.xaiMethod,preprocessingVersion:currentCase.preprocessingVersion,rois:currentCase.rois}]:currentCase.predictionHistory});
  };
  const selectModel = (id:string) => {
    if(requestLock.current)return;
    setSelectedModelId(id);
    if(id!==currentCase.modelId)invalidateSelectedResult();
  };
  const selectXai = (method:string) => {
    if(requestLock.current)return;
    setSelectedXaiMethod(method);
    if(method!==currentCase.xaiMethod)invalidateSelectedResult();
  };

  const updateFeedback = async (feedbackId: string, status: FeedbackItem['status']) => {
    try {
      await api.updateFeedbackStatus(feedbackId, status);
      const refreshed = await api.listFeedback();
      setFeedbackItems(refreshed.feedback);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'บันทึกสถานะไม่สำเร็จ');
    }
    recordAudit('FEEDBACK', `Feedback ${feedbackId} changed to ${status}`, 'AUDIT');
  };

  const exportApprovedFeedback = async () => {
    const blob = await api.fetchAsset('/api/feedback/export.csv?status=approved');
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'boneage_feedback_approved.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectCase = (caseItem: PatientCase) => {
    setSelectedCaseId(caseItem.id);
    // Route to appropriate view based on the case's step or default to imaging/prediction
    if (caseItem.currentStep === 'Screening') {
      navigateTo('screening');
    } else if (caseItem.currentStep === 'Intake') {
      navigateTo('intake');
    } else if (caseItem.currentStep === 'Imaging' || caseItem.currentStep === 'ROI' || caseItem.currentStep === 'ROI Selection') {
      navigateTo('imaging');
    } else if (caseItem.currentStep === 'Prediction') {
      navigateTo('prediction');
    } else if (caseItem.currentStep === 'Report' || caseItem.currentStep === 'Report Generation' || caseItem.currentStep === 'Completed') {
      navigateTo('report');
    } else {
      navigateTo('prediction');
    }
  };

  const handleCreateCase = (newCase: PatientCase) => {
    setCases((previous) => [newCase, ...previous]);
    setSelectedCaseId(newCase.id);
    recordAudit('CASE_CREATE', `Created assessment ${newCase.id}`, 'AUDIT', newCase.id);
    window.history.pushState({ view: 'screening' }, '', '#/screening');
    setCurrentView('screening');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCase = async (caseItem: PatientCase) => {
    await api.deleteCase(caseItem.id);
    setCases((previous) => previous.filter((item) => item.id !== caseItem.id));
    recordAudit('CASE_DELETE', `Deleted assessment ${caseItem.id}`, 'AUDIT', caseItem.id);
  };

  const caseCentricViews: AppView[] = [
    'screening',
    'intake',
    'imaging',
    'roi',
    'prediction',
    'xai',
    'report',
    'checklist',
  ];

  const isCaseCentric = caseCentricViews.includes(currentView);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center text-[#002e6f]">
        <div className="flex items-center gap-2 font-body-md text-sm">
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
          <span>{language === 'th' ? 'กำลังตรวจสอบการเข้าสู่ระบบ...' : 'Checking session...'}</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        language={language}
        onLanguageChange={setLanguage}
        isSubmitting={isLoggingIn}
        error={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#1a1b21] font-body-md antialiased flex flex-col">
      {/* Fixed Top Bar */}
      <TopAppBar
        language={language}
        onLanguageChange={setLanguage}
        user={user}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        onNavigateHome={() => navigateTo('overview')}
        onSearchSubmit={() => navigateTo('cases')}
        storageStatus={storageStatus}
        lastSavedAt={lastSavedAt}
      />

      {/* Fixed Left Navigation Drawer */}
      <SideNavBar
        currentView={currentView}
        onNavigate={navigateTo}
        language={language}
        pendingReviewCount={pendingReviewCount}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Sticky Case Context Bar for assessment views */}
      {isCaseCentric && (
        <CaseContextBar
          currentCase={currentCase}
          language={language}
          onSwitchCase={() => setIsSwitchCaseOpen(true)}
          onOpenRoiReview={() => navigateTo('imaging')}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-200 pl-0 md:pl-[264px] ${
          isCaseCentric ? 'pt-28' : 'pt-16'
        }`}
      >
        {currentView === 'overview' && (
          <OverviewView
            cases={cases}
            onSelectCase={handleSelectCase}
            onNewAssessment={() => setIsNewAssessmentOpen(true)}
            onNavigateCases={() => navigateTo('cases')}
            onNavigateReviewQueue={() => navigateTo('review-queue')}
            language={language}
          />
        )}

        {currentView === 'cases' && (
          <CasesView
            cases={cases}
            onSelectCase={handleSelectCase}
            onCreateNewCase={() => setIsNewAssessmentOpen(true)}
            onDeleteCase={handleDeleteCase}
            initialSearchTerm={searchQuery}
            language={language}
          />
        )}

        {currentView === 'screening' && (
          <ScreeningView
            currentCase={currentCase}
            onUpdateCase={handleUpdateCurrentCase}
            onContinue={() => navigateTo('intake')}
            onBack={() => navigateTo('cases')}
            language={language}
          />
        )}

        {currentView === 'intake' && (
          <IntakeView
            currentCase={currentCase}
            onUpdateCase={handleUpdateCurrentCase}
            onContinue={() => navigateTo('imaging')}
            onBack={() => navigateTo('screening')}
            language={language}
          />
        )}

        {['workstation','imaging','roi'].includes(currentView) && currentCase && <WorkstationView onComplete={() => navigateTo('report')} currentCase={currentCase} onRun={runRealPrediction} processing={isPredicting} error={predictionError} onUpdate={handleUpdateCurrentCase} models={models} selectedModelId={selectedModelId} onModelChange={selectModel} selectedXaiMethod={selectedXaiMethod} onXaiChange={selectXai} user={user} storageStatus={storageStatus} requestId={activeRequestId} />}

        {currentCase?.predictionStale&&['prediction','xai','report'].includes(currentView)&&<div className="p-8"><p role="alert">กรอบถูกแก้ไขแล้ว ผลนี้เป็นผลก่อนแก้ กรุณาคำนวณใหม่ · ผลเดิมดูได้ใน History</p><button className="ws-button" onClick={()=>navigateTo('workstation')}>กลับห้องตรวจเพื่อยืนยันกรอบและคำนวณใหม่</button></div>}
        {currentView === 'prediction' && !currentCase?.predictionStale && (
          <PredictionView
            currentCase={currentCase}
            models={models}
            selectedModelId={selectedModelId}
            onModelChange={selectModel}
            onReviewRois={() => navigateTo('imaging')}
            isPredicting={isPredicting}
            predictionError={predictionError}
            backendConnected={backendConnected}
            reviewedMonths={reviewedMonths}
            onReviewedMonthsChange={setReviewedMonths}
            onSaveReview={saveExpertReview}
            reviewSaved={reviewSaved}
            feedbackStatus={feedbackStatus}
            onNavigateXAI={() => navigateTo('xai')}
            onNavigateReport={() => navigateTo('report')}
            onNavigateChecklist={() => navigateTo('checklist')}
            onBack={() => navigateTo('imaging')}
            language={language}
          />
        )}

        {currentView === 'xai' && !currentCase?.predictionStale && (
          <XAIView
            currentCase={currentCase}
            onUpdateCase={handleUpdateCurrentCase}
            onNavigateReport={() => navigateTo('report')}
            onNavigateChecklist={() => navigateTo('checklist')}
            onBack={() => navigateTo('prediction')}
            language={language}
          />
        )}

        {currentView === 'checklist' && (
          <ChecklistView
            currentCase={currentCase}
            onUpdateCase={handleUpdateCurrentCase}
            onNavigateReport={() => navigateTo('report')}
            onBack={() => navigateTo('prediction')}
            language={language}
          />
        )}

        {currentView === 'report' && !currentCase?.predictionStale && (
          <ReportView
            currentCase={currentCase}
            language={language}
            onBack={() => navigateTo('prediction')}
            onFinalizeReport={() => {
              handleUpdateCurrentCase({ status: 'Finalized', currentStep: 'Completed' });
              recordAudit('REPORT_FINALIZE', 'Clinical research report finalized', 'AUDIT', currentCase.id);
            }}
          />
        )}

        {currentView === 'review-queue' && (
          <ReviewQueueView
            cases={cases}
            onSelectCase={handleSelectCase}
            feedbackItems={feedbackItems}
            onFeedbackStatus={updateFeedback}
            onExportApproved={exportApprovedFeedback}
            language={language}
          />
        )}

        {currentView === 'references' && <ReferencesView language={language} />}
        {currentView === 'logs' && <LogsView language={language} logs={auditEvents} />}
        {currentView === 'help' && <HelpSupportView type="help" language={language} />}
        {currentView === 'support' && <HelpSupportView type="support" language={language} />}
      </main>

      {/* Global Dialog Modals */}
      <SwitchCaseModal
        isOpen={isSwitchCaseOpen}
        onClose={() => setIsSwitchCaseOpen(false)}
        cases={cases}
        selectedCaseId={selectedCaseId}
        onSelectCase={handleSelectCase}
        language={language}
      />

      <NewAssessmentModal
        isOpen={isNewAssessmentOpen}
        onClose={() => setIsNewAssessmentOpen(false)}
        onCreateCase={handleCreateCase}
        language={language}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        language={language}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onLanguageChange={setLanguage}
        user={user}
        onSignOut={() => {
          setIsSettingsOpen(false);
          clearAuthToken();
          setIsAuthenticated(false);
          setLoginError('');
        }}
      />
    </div>
  );
}

export default App;
