import React, { useCallback, useEffect, useState } from 'react';
import { api, FeedbackItem, ModelInfo } from '../api';
import { DetectedROI, PatientCase, UserProfile } from '../types';
import { AuthenticatedImage } from '../components/AuthenticatedImage';
import { DEFAULT_VIEW, ResearchViewer, ViewSettings } from '../components/ResearchViewer';
import { modelLabel } from '../utils/modelLabel';
import { caseTime } from '../utils/caseTime';
import { formatAgeDetailed } from '../utils/age';
import { inputKey } from '../utils/inferenceImage';

interface Props { onComplete: () => void; currentCase: PatientCase; onRun: (image?: File, stay?: boolean, detectOnly?:boolean,detectorRetry?:{source:string;settings:unknown}) => Promise<void>; processing: boolean; error: string; onUpdate: (update: Partial<PatientCase>) => void; models: ModelInfo[]; selectedModelId: string; onModelChange: (id:string)=>void; selectedXaiMethod?:string; onXaiChange?:(method:string)=>void; user: UserProfile; storageStatus: string; requestId?:string }
export function WorkstationView({ onComplete, currentCase: c, onRun, processing, error, onUpdate, models, selectedModelId, onModelChange, selectedXaiMethod='GradCAM', onXaiChange, user, storageStatus, requestId }: Props) {
  const [tab,setTab]=useState('ROI');
  const [elapsedSeconds,setElapsedSeconds]=useState(0);
  useEffect(()=>{
    if(!processing){setElapsedSeconds(0);return;}
    const start=performance.now();
    const timer=window.setInterval(()=>setElapsedSeconds((performance.now()-start)/1000),100);
    return()=>window.clearInterval(timer);
  },[processing]);
  const [undo,setUndo]=useState<DetectedROI[][]>([]);
  const [redo,setRedo]=useState<DetectedROI[][]>([]);
  const [selectedRoi,setSelectedRoi]=useState('');
  const [pendingImage,setPendingImage]=useState<File>();
  const [preview,setPreview]=useState('');
  const [feedbackCategory,setFeedbackCategory]=useState<'AGE'|'ROI'|'XAI'>('AGE');
  const [decision,setDecision]=useState('uncertain');
  const [cropDimensions,setCropDimensions]=useState({w:1,h:1});
  const [expanded,setExpanded]=useState<DetectedROI|null>(null);
  const cropAspect=(r:DetectedROI)=>cropDimensions.w*parseFloat(r.bbox.width)/(cropDimensions.h*parseFloat(r.bbox.height));
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setExpanded(null);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);
  useEffect(()=>{if(!pendingImage){setPreview('');return;}const url=URL.createObjectURL(pendingImage);setPreview(url);return()=>URL.revokeObjectURL(url);},[pendingImage]);
  useEffect(()=>{setUndo([]);setRedo([]);setPendingImage(undefined);setSelectedRoi('');},[c.id]);
  useEffect(()=>setName(user.name),[user.name]);
  const present=(r:DetectedROI)=>parseFloat(r.bbox.width)>0&&parseFloat(r.bbox.height)>0&&r.reviewState!=='OUT_OF_FIELD'&&r.reviewState!=='NOT_VISIBLE';
  const revise=(rois:DetectedROI[],record=true)=>{
    if(processing||pendingImage)return;
    if(record){setUndo(v=>[...v.slice(-49),c.rois]);setRedo([]);}
    const prior=!c.predictionStale&&c.inferenceId?[...(c.predictionHistory||[]),{inferenceId:c.inferenceId,months:c.rawPredictedAgeMonths,xaiUrl:c.xaiLayerUrl||c.xaiHeatmapUrl,modelId:c.modelId,roiRevision:c.predictionRoiRevision??0,savedAt:new Date().toISOString(),xaiMethod:c.xaiMethod,preprocessingVersion:c.preprocessingVersion,rois:c.rois}]:c.predictionHistory;
    onUpdate({rois,detectorRois:c.detectorRois||c.rois,roiRevision:(c.roiRevision||0)+1,predictionStale:true,predictionHistory:prior,roisAccepted:rois.filter(r=>r.reviewState==='VERIFIED').length});
  };
  const stale=Boolean(c.predictionStale||pendingImage||selectedModelId!==c.modelId||selectedXaiMethod!==c.xaiMethod);
  const crop=c.rois.find(r=>r.id===selectedRoi&&present(r));
  const chosenModel=models.find(m=>m.id===selectedModelId);
  const eligible=Boolean(chosenModel?.eligible_age_years&&c.chronologicalAgeMonths>=chosenModel.eligible_age_years[0]*12&&c.chronologicalAgeMonths<(chosenModel.eligible_age_years[1]+1)*12);
  const modelReady=Boolean(chosenModel?.checkpoint_available&&['active','reference'].includes(chosenModel.status)&&eligible);
  const [age, setAge] = useState('');
  const [name, setName] = useState('');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ViewSettings>(DEFAULT_VIEW);
  const receiveSettings=useCallback((view:ViewSettings)=>{
    setSettings(view);
    if(processing)return;
    const changed=inputKey(c.inferenceImageMode,view)!==inputKey(c.inferenceImageMode,c.inferenceViewSettings);
    if(JSON.stringify(view)!==JSON.stringify(c.inferenceViewSettings))onUpdate({inferenceViewSettings:view,...(changed?{predictionStale:true,predictionHistory:c.inferenceId&&!c.predictionHistory?.some(h=>h.inferenceId===c.inferenceId)?[...(c.predictionHistory||[]),{inferenceId:c.inferenceId,months:c.rawPredictedAgeMonths,modelId:c.modelId,roiRevision:c.predictionRoiRevision||0,savedAt:new Date().toISOString(),xaiUrl:c.xaiLayerUrl,preprocessingVersion:c.preprocessingVersion,xaiMethod:c.xaiMethod,input:c.predictionInput}]:c.predictionHistory}: {})});
  },[c,processing,onUpdate]);
  const [cropRender,setCropRender]=useState({source:'',url:''});
  const receiveAdjustedImage=useCallback((source:string,url:string)=>setCropRender({source,url}),[]);
  const cropDisplayUrl=cropRender.source===c.xrayImageUrl?cropRender.url:'';
  useEffect(()=>{setExpanded(null);},[c.id,c.xrayImageUrl]);
  const [history, setHistory] = useState<FeedbackItem[]>([]);
  const [device, setDevice] = useState('Connecting');
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [evidence, setEvidence] = useState('');
  useEffect(() => { api.health().then(h => setDevice(String(h.device || 'Unknown'))).catch(() => setDevice('Not connected')); }, []);
  const reload = () => api.listFeedback().then(r => setHistory(r.feedback.filter(item => item.case_id === c.id)));
  useEffect(() => { setAge(''); setNotes(''); setMessage(''); setChecks({}); setEvidence(''); void reload().catch(() => undefined); }, [c.id]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage('');
    if(feedbackCategory!=='AGE'){
      try{const result=await api.saveAnnotationFeedback({case_id:c.id,category:feedbackCategory,inference_id:c.inferenceId,roi_revision:c.roiRevision||0,decision,note:notes,rois:c.rois,xai_method:c.xaiMethod||''});setMessage(`ส่งความเห็น ${feedbackCategory} Revision ${result.revision} แล้ว · รอทบทวน`);await reload();}catch(e){setMessage(e instanceof Error?e.message:'Could not submit feedback');}finally{setSaving(false);}return;
    }
    try {
      await api.saveCases([c]);
      const r = await api.saveReview({ case_id: c.id, patient_id: c.patientId, model_id: c.modelId, inference_id: c.inferenceId,
        raw_prediction_months: c.rawPredictedAgeMonths, reviewed_prediction_months: Number(age),
        chronological_age_months: c.chronologicalAgeMonths, sex: c.sex, reviewer_note: notes, reviewer_name: name, roi_revision:c.roiRevision||0, roi_feedback:c.rois, reviewer_role:user.role,
        assessment_method: method, status: 'reviewed', view_settings: {...settings,roi_revision:c.roiRevision||0,feedback_category:'AGE'}, curation_checks: checks, curation_evidence: evidence });
      onUpdate({ reviewedPredictedAgeMonths: Number(age), reviewedBy: name, reviewDate: r.saved_at });
      setMessage(`บันทึกความเห็นRevisionที่ ${r.feedback_revision} แล้ว · ${r.feedback_status === 'blocked_locked_test' ? 'เคสชุดประเมิน ห้ามเข้าชุดฝึก' : 'รอตรวจสอบก่อนใช้ฝึก'}`);
      await reload();
      window.dispatchEvent(new Event('boneage-feedback-updated'));
    } catch(e) { setMessage(e instanceof Error ? e.message : 'Could not save'); }
    finally { setSaving(false); }
  };
  return <div className="workstation">
    {expanded&&<div className="roi-fullscreen" role="dialog" aria-modal="true" aria-label={`Expanded image: ${expanded.code}`}><button className="ws-button" onClick={()=>setExpanded(null)}>Close enlarged image</button><h2>{expanded.code==='PP3'?'PP3MC':expanded.code}</h2><div className="native-crop" style={{width:`min(85vw,${75*cropAspect(expanded!)}vh)`,aspectRatio:String(cropAspect(expanded!)),position:'relative',overflow:'hidden'}}><AuthenticatedImage src={cropDisplayUrl||c.xrayImageUrl} onLoad={e=>setCropDimensions({w:e.currentTarget.naturalWidth,h:e.currentTarget.naturalHeight})} alt={`Expanded image: ${expanded.code}`} style={{position:'absolute',maxWidth:'none',width:`${10000/parseFloat(expanded.bbox.width)}%`,height:`${10000/parseFloat(expanded.bbox.height)}%`,left:`${-parseFloat(expanded.bbox.left)*100/parseFloat(expanded.bbox.width)}%`,top:`${-parseFloat(expanded.bbox.top)*100/parseFloat(expanded.bbox.height)}%`}}/></div></div>}
    <header className="workstation-title"><div><h1>Process image <span>ROI / Prediction / XAI</span></h1><p>Case {c.patientId} · {c.sex} · Chronological age {c.chronologicalAgeMonths} months</p></div>
      <label className="ws-button primary">Choose a new image<input aria-label="Choose a new image" type="file" accept="image/png,image/jpeg" disabled={processing} hidden onChange={async e => { const f=e.target.files?.[0]; if(f){ if(f.size > 25*1024*1024){setMessage('File must be 25 MB or smaller');return;} setPendingImage(f);setMessage('Detecting ROIs from the updated image');setTab('ROI');await onRun(f,true,true);setPendingImage(undefined);setMessage('');e.target.value=''; } }} /></label>
      <button className="ws-button" disabled={processing||Boolean(pendingImage)||!c.xrayImageUrl} onClick={async()=>{if(c.rois.some(r=>r.source==='expert_review')&&!window.confirm('Redetection will preserve user-verified boxes. Continue?'))return;setTab('ROI');await onRun(undefined,true,true);}}>Detect ROIs with YOLO</button>
    </header>
    <div className="prototype-banner">Research prototype · Human review required · Not an automated diagnostic system</div>
    <div className="workstation-notice">อัปโหลด {caseTime(c.uploadedAt)} · อัปเดต {caseTime(c.updatedAt)} · เสร็จสิ้น {caseTime(c.completedAt)}{c.simulationMetadata&&<><br/>Test case · Simulated chronological age/height/weight · Manifest reference age, not an expert assessment <button disabled={processing} onClick={()=>{setTab('Feedback');setFeedbackCategory('AGE');setAge(String(c.groundTruthBoneAgeMonths??''));setMethod('SIMULATION_RSNA_REFERENCE');setNotes('Demo reference age from manifest; not a real clinician assessment');}}>Enter a simulated reference bone age</button></>}</div>
    {(error || message) && <div className="workstation-notice" role="status">{error || message}</div>}
    <div className="workstation-layout">
      <ResearchViewer onAdjustedImage={receiveAdjustedImage} processing={processing} onDetectorRetry={pendingImage?undefined:async(file,view)=>{setTab('ROI');await onRun(file,true,true,{source:c.xrayImageUrl,settings:view});}} source={preview||c.xrayImageUrl} overlay={pendingImage||tab==='ROI'||stale?undefined:c.xaiLayerUrl} rois={pendingImage?[]:c.rois} caseKey={c.id} selectedRoi={selectedRoi} onSelectRoi={setSelectedRoi} stale={stale} onSettings={receiveSettings} onRoisChange={processing||pendingImage?undefined:revise} />
      <aside className="review-inspector">
        <nav className="inspector-tabs" aria-label="Review workstation">{['ROI','Prediction & XAI','Feedback','History'].map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t}</button>)}</nav>
        <div className="inspector-body">
        {tab==='ROI'&&c.detectorName&&<p role="status">YOLO detected {c.rois.filter(present).length}/9 ROIs · {c.rois.filter(present).length===9?'Review and confirm boxes before prediction':'Some ROIs are missing. Select an ROI and draw its box, or choose a new image.'}</p>}
        {tab==='ROI'&&<div className="roi-crop-grid">{c.rois.map(r=><button key={r.id} disabled={!present(r)||Boolean(pendingImage)} onClick={()=>{setSelectedRoi(r.id);setExpanded(r);}}><div className="roi-crop-image" style={{aspectRatio:String(cropAspect(r))}}>{present(r)&&<AuthenticatedImage src={cropDisplayUrl||c.xrayImageUrl} onLoad={e=>setCropDimensions({w:e.currentTarget.naturalWidth,h:e.currentTarget.naturalHeight})} alt={`Expand ${r.code}`} style={{position:'absolute',maxWidth:'none',width:`${10000/parseFloat(r.bbox.width)}%`,height:`${10000/parseFloat(r.bbox.height)}%`,left:`${-parseFloat(r.bbox.left)*100/parseFloat(r.bbox.width)}%`,top:`${-parseFloat(r.bbox.top)*100/parseFloat(r.bbox.height)}%`}}/>}</div><strong>{r.code==='PP3'?'PP3MC':r.code}</strong><small>{present(r)?'Click to view full size':'No box yet'}</small></button>)}</div>}
        {stale&&<div className="stale-warning" role="status">The image, ROI boxes, or model changed. This result is outdated; run inference again.</div>}
        {tab==='Prediction & XAI'&&<><div className="model-line"><span className="material-symbols-outlined">memory</span><strong>{modelLabel(c.modelId)}</strong><span>{device === 'cuda' ? 'Local GPU' : device}</span></div>
        <label>Image used for prediction<select disabled={processing} value={c.inferenceImageMode||'latest'} onChange={e=>{const mode=e.target.value as 'latest'|'original';onUpdate({inferenceImageMode:mode,...(inputKey(mode,settings)!==inputKey(c.inferenceImageMode,settings)?{predictionStale:true}:{})});}}><option value="latest">Latest adjusted image (default)</option><option value="original">Original image</option></select></label><small>No adjustment = use the original. Zoom, rotation, boxes, and XAI tint are display-only; image adjustments may change predictions.</small>
        <label>โมเดล<select disabled={processing} value={selectedModelId} onChange={e=>{onModelChange(e.target.value);}}>{models.map(m=><option key={m.id} value={m.id} disabled={!m.checkpoint_available||!['active','reference'].includes(m.status)}>{modelLabel(m.id,m.display_name)}</option>)}</select></label>
        {!modelReady&&<p role="status">Unavailable: check checkpoint setup and the model age range.</p>}<small>ช่วงอายุ/ข้อจำกัด: {models.find(m=>m.id===selectedModelId)?.eligible_age_years?.join('–')||'From model registry'} years</small></>}
        {tab==='ROI'&&<section className="roi-editor-list"><h2>กรอบที่มี {c.rois.filter(present).length}/9 · ยืนยัน {c.rois.filter(r=>r.reviewState==='VERIFIED').length}</h2><p>Choose an ROI in the toolbar and drag to draw. Arrow keys move 1 px; Shift moves 5 px; use the lower corner to resize.</p>{c.rois.map(r=><div className="roi-editor-row" key={r.id}><button onClick={()=>setSelectedRoi(r.id)}>{r.code==='PP3'?'PP3MC':r.code}</button><span>{r.reviewState|| (present(r)?'DETECTED':'MISSING_DETECTION')}</span><small>{r.source==='expert_review'?'Manually edited':`Detector ${Math.round(r.confidence*100)}%`}</small><select aria-label={`${r.code} status`} disabled={processing||Boolean(pendingImage)} value={r.reviewState||'DETECTED'} onChange={e=>revise(c.rois.map(item=>item.id===r.id?{...item,reviewState:e.target.value as DetectedROI['reviewState'],status:e.target.value==='VERIFIED'?'accepted':'flagged',source:'expert_review'}:item))}><option value="DETECTED">Unverified</option><option value="EDITED">Edited</option><option value="VERIFIED" disabled={!present(r)}>Verified</option><option value="OUT_OF_FIELD">Out of field</option><option value="NOT_VISIBLE">Not visible</option></select></div>)}
        {crop&&<div><h3>Crop from current box · {crop.code}</h3><div className="native-crop" style={{aspectRatio:`${cropDimensions.w*parseFloat(crop.bbox.width)}/${cropDimensions.h*parseFloat(crop.bbox.height)}`}}><AuthenticatedImage src={cropDisplayUrl||c.xrayImageUrl} alt={`${crop.code} crop after editing`} onLoad={e=>setCropDimensions({w:e.currentTarget.naturalWidth,h:e.currentTarget.naturalHeight})} style={{position:'absolute',maxWidth:'none',width:`${10000/parseFloat(crop.bbox.width)}%`,height:`${10000/parseFloat(crop.bbox.height)}%`,left:`${-parseFloat(crop.bbox.left)*100/parseFloat(crop.bbox.width)}%`,top:`${-parseFloat(crop.bbox.top)*100/parseFloat(crop.bbox.height)}%`}} /></div><small>Preview shows the original-image box, not the 224×224 preprocessed input.</small></div>}
        <button className="ws-button" disabled={processing||!c.detectorRois||Boolean(pendingImage)} onClick={()=>{if(window.confirm('Restore detector-proposed boxes? The current result will need to be recalculated.'))revise(c.detectorRois!.map(r=>({...r,reviewState:'DETECTED',status:'flagged'})));}}>Restore detector boxes</button><p>Detector confidence does not mean expert verification · PP3 is an alias for PP3MC.</p></section>}
        <div hidden={tab!=='Prediction & XAI'}>
        <p>Select a model and XAI method, then use “Predict from confirmed ROIs” below.</p>
        <label>XAI method<select disabled={processing} value={selectedXaiMethod} onChange={e=>{onXaiChange?.(e.target.value);}}>{['GradCAM','GradCAM++','ScoreCAM','EigenCAM','LayerCAM-HR'].map(m=><option key={m} value={m}>{m}</option>)}</select></label><small>After changing the method, run inference again. ScoreCAM uses the top 16 channels; EigenCAM shows feature structure, not age attribution; GradCAM++ is a regression approximation. Faithfulness has not been established.</small>
        </div>
        <div hidden={tab!=='Feedback'}>
        <form onSubmit={save} className="expert-form"><h2>Expert feedback</h2><label>Feedback type<select value={feedbackCategory} onChange={e=>setFeedbackCategory(e.target.value as typeof feedbackCategory)}><option value="AGE">Bone-age assessment</option><option value="ROI">ROI feedback</option><option value="XAI">XAI feedback</option></select></label>{feedbackCategory!=='AGE'&&<label>Assessment<select value={decision} onChange={e=>setDecision(e.target.value)}><option value="uncertain">Uncertain / review needed</option><option value="plausible">Plausible</option><option value="implausible">ไม่Plausible</option></select></label>}
          <div className="form-pair" hidden={feedbackCategory!=='AGE'}><label>Bone age (months)<input aria-label="Expert-assessed bone age" type="number" min="0" max="240" step="0.1" required={feedbackCategory==='AGE'} value={age} onChange={e=>setAge(e.target.value)} /></label><label>Assessment method<select required={feedbackCategory==='AGE'} value={method} onChange={e=>setMethod(e.target.value)}><option value="">Select a method</option><option>Greulich–Pyle</option><option>Tanner–Whitehouse</option><option>Clinical assessment</option><option>Consensus</option><option value="SIMULATION_RSNA_REFERENCE">RSNA reference · Simulated test case</option></select></label></div>
          <label>Reviewer name<input required readOnly value={name} maxLength={120} /></label>
          <div className="reason-buttons">{['ROI box misplaced','Missing ROI','XAI highlights outside bone','Age assessment differs','Image quality'].map(reason=><button type="button" key={reason} onClick={()=>setNotes(v=>v.includes(reason)?v:`${v}${v?' · ':''}${reason}`)}>{reason}</button>)}</div><label>Notes / reason for disagreement<textarea value={notes} onChange={e=>setNotes(e.target.value)} maxLength={2000} rows={3} placeholder="Describe the ROI to review or explain the assessment." /></label>
          <details className="curation"><summary>Evidence for training-data review</summary><p>Confirm only when supported by evidence.</p>{Object.entries({ provenance_approved:'Image provenance verified', anatomy_qc_approved:'Image and all ROIs reviewed', consent_approved:'Rights for research/model training confirmed', split_clearance_approved:'Patient IDs and duplicate images checked against evaluation sets' }).map(([key,label])=><label className="check-line" key={key}><input type="checkbox" checked={checks[key]||false} onChange={e=>setChecks(v=>({...v,[key]:e.target.checked}))} />{label}</label>)}<label>Evidence reference / verification method<textarea value={evidence} onChange={e=>setEvidence(e.target.value)} maxLength={2000} /></label></details>
          <button className="ws-button primary" type="submit" disabled={saving || processing || (feedbackCategory==='AGE'&&(stale || !c.inferenceId || c.rawPredictedAgeMonths == null))}>{saving ? 'Saving…' : feedbackCategory==='AGE'?'Submit feedback · pending approval':'Submit feedback · pending review'}</button>
          {!c.inferenceId && <small>Run inference again to create prediction evidence before saving.</small>}
        </form>
        <p>Submitted → Under review → Approved / Rejected → Dataset version → Offline training → Validation → Human approval → Release / Retain baseline</p><small>No online retraining. Protected evaluation cases must not enter training, and feedback does not automatically become ground truth.</small></div>
        {tab==='History'&&<section><h2>Redetection history</h2>{(c.detectorRetryHistory||[]).map((r,i)=><details key={i}><summary>{caseTime(r.at)} · Detected {r.detected}/9</summary><pre>{JSON.stringify(r.settings,null,2)}</pre></details>)}<h2>Previous prediction history</h2>{(c.predictionHistory||[]).map((r,i)=><p key={i}>{r.savedAt} · ROI r{r.roiRevision} · {r.modelId} · {r.months?.toFixed(1)} months · previous result</p>)}<h3>Feedback revisions: {history.length}</h3>{history.map(r=><p key={r.id}>Revision {r.revision} · {r.created} · {r.status}</p>)}{(c.feedbackDrafts||[]).map(r=><p key={`draft-${r.revision}`}>Draft {r.category}, revision {r.revision} · {r.createdAt} · Not submitted for approval</p>)}</section>}
        </div>
      </aside>
    </div>
    <footer className="workstation-actions"><span role="status">{processing?`Processing ${elapsedSeconds.toFixed(1)} s · Request ${requestId?.slice(0,8)} · box editing locked`:`Saved: ${storageStatus}`} · ROI r{c.roiRevision||0}</span><button disabled={processing||!undo.length} onClick={()=>{setRedo(v=>[...v,c.rois]);revise(undo[undo.length-1],false);setUndo(v=>v.slice(0,-1));}}>Undo</button><button disabled={processing||!redo.length} onClick={()=>{setUndo(v=>[...v,c.rois]);revise(redo[redo.length-1],false);setRedo(v=>v.slice(0,-1));}}>Redo</button><button disabled={processing||Boolean(pendingImage)} onClick={()=>{if(window.confirm('Confirm only boxes that are present and have been reviewed?'))revise(c.rois.map(r=>present(r)?{...r,reviewState:'VERIFIED',status:'accepted',source:'expert_review'}:r));}}>Verifiedทั้งหมดที่มี</button><button className="ws-button primary" disabled={processing||(!pendingImage&&!stale)||(!pendingImage&&!modelReady)||(!pendingImage&&c.rois.some(r=>!present(r)||r.reviewState!=='VERIFIED'))} onClick={async()=>{await onRun(pendingImage,Boolean(pendingImage),Boolean(pendingImage));setPendingImage(undefined);setTab(pendingImage?'ROI':'Prediction & XAI');}}>{pendingImage?'Detect ROIs':'Predict from confirmed ROIs'}</button><button disabled={processing||stale||c.rois.some(r=>r.reviewState!=='VERIFIED')||!c.inferenceId} onClick={()=>{onUpdate({status:'Finalized'});setMessage('Case closed · feedback was not approved for training');onComplete();}}>Close case</button></footer>
    <div className="research-flow">{['Upload image','Review ROIs','Predict age','Review XAI','Expert review','Training data curation'].map((label,i)=><div key={label}><span>{i+1}</span><strong>{label}</strong></div>)}</div>
    <section className="review-history"><h2>Feedback history for this case <span>{history.length} revisions</span></h2>{history.length===0 ? <p>No feedback recorded. Model output is stored separately from expert assessment.</p> : <div className="table-scroll"><table><thead><tr><th>Revision</th><th>Time</th><th>Model (months)</th><th>Expert (months)</th><th>Absolute difference</th><th>Status</th></tr></thead><tbody>{history.map(r=><tr key={r.id}><td>{r.revision}</td><td>{new Date(r.created).toLocaleString('th-TH')}</td><td>{r.payload.raw_prediction_months}</td><td>{r.payload.expert_bone_age_months}</td><td>{r.payload.absolute_error_vs_expert_months}</td><td>{r.status}</td></tr>)}</tbody></table></div>}</section>
  </div>;
}
