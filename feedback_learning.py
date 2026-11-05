"""Offline candidate safety gates. Never trains or deploys from a web review."""
import numpy as np

def approved_training_feedback(items,protected_ids):
    accepted=[];excluded=[]
    for item in items:
        p=item.get('payload',{});pid=str(p.get('source_patient_id') or p.get('patient_id',''))
        from review_protocol import eligibility_reasons
        reasons=eligibility_reasons(p)
        if item.get('status')!='approved':reasons.append('not adjudicated and approved')
        if not pid:reasons.append('missing source patient identity')
        if pid in protected_ids:reasons.append('protected evaluation patient')
        if p.get('simulation') or p.get('reviewer_role')=='simulation':reasons.append('simulated feedback is not clinical evidence')
        label=p.get('expert_bone_age_months')
        if not isinstance(label,(float,int)) or not np.isfinite(label) or not 0<=label<=240:reasons.append('invalid reference bone age')
        (excluded if reasons else accepted).append({'feedback_id':item.get('id'),'patient_id':pid,'reasons':reasons,'payload':p})
    return {'accepted':accepted,'excluded':excluded,'next_stage':'versioned training dataset + replay, offline candidate training','automatic_training':False,'automatic_release':False}

def paired_comparison(baseline,candidate,seed=42,repeats=2000):
    def index(rows):
        ids=[str(r['patient_id']) for r in rows]
        if len(set(ids))!=len(ids):raise ValueError('Aggregate repeated images per patient before bootstrap')
        return dict(zip(ids,rows))
    b=index(baseline);c=index(candidate)
    if set(b)!=set(c) or len(b)<2:raise ValueError('Require the same patients and at least two pairs')
    errors=[]
    for pid in sorted(b):
        if b[pid]['reference_months']!=c[pid]['reference_months']:raise ValueError('Reference labels differ')
        errors.append([abs(b[pid]['predicted_months']-b[pid]['reference_months']),abs(c[pid]['predicted_months']-c[pid]['reference_months'])])
    a=np.asarray(errors,dtype=float)
    if not np.isfinite(a).all():raise ValueError('Non-finite prediction')
    delta=a[:,1]-a[:,0];rng=np.random.default_rng(seed)
    samples=np.array([delta[rng.integers(0,len(a),len(a))].mean() for _ in range(repeats)])
    ci=np.quantile(samples,[.025,.975])
    return {'n':len(a),'baseline_mae':float(a[:,0].mean()),'candidate_mae':float(a[:,1].mean()),'delta_mae':float(delta.mean()),'paired_ci95':ci.tolist(),'candidate_improves_with_ci':bool(ci[1]<0),'human_approval_required':True,'automatic_release':False}
