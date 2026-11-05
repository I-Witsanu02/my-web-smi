"""Recompute the single FocalNet analysis from archived case-level predictions; no training."""
from pathlib import Path
import argparse,hashlib,json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

MODEL='full18_focalnet_feedback_candidate_20261007'
CHECKPOINT='ed681f0355b5d1a3660cfa0a7e7d472884ef869d8b48c94348eff1257bd049e8'
DEFAULT=Path(r'D:\workspace\ประเมิน_LockedTest_ทุกโมเดล_20261012\results\20261012T073939Z')/(MODEL+'_predictions.csv')
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--predictions',type=Path,default=DEFAULT);parser.add_argument('--out',type=Path,default=Path(__file__).resolve().parents[1]);args=parser.parse_args()
 root=args.out;figdir=root/'figures';figdir.mkdir(parents=True,exist_ok=True)
 df=pd.read_csv(args.predictions);all_rows=len(df)
 df=df[(df.model_id==MODEL)&(df.scenario=='original_roi_protocol')&(df.status=='ok')].dropna(subset=['reference_months','predicted_months']).copy()
 if df.patient_id.duplicated().any():raise ValueError('Patient-level analysis requires one prediction per patient')
 if set(df.checkpoint_sha256.dropna())!={CHECKPOINT}:raise ValueError('Unexpected checkpoint; verify provenance before reporting')
 y=df.reference_months.to_numpy(float);p=df.predicted_months.to_numpy(float);e=p-y;ae=abs(e);n=len(df)
 rng=np.random.default_rng(20261105);boot=np.array([abs(e[rng.integers(0,n,n)]).mean() for _ in range(20000)])
 m={'display_name':'FocalNet','n':n,'MAE_months':ae.mean(),'RMSE_months':np.sqrt(np.mean(e**2)),'bias_months':e.mean(),'error_SD_months':e.std(ddof=1),'MAE_CI95_low':np.quantile(boot,.025),'MAE_CI95_high':np.quantile(boot,.975),'LoA95_low':e.mean()-1.96*e.std(ddof=1),'LoA95_high':e.mean()+1.96*e.std(ddof=1),'median_absolute_error_months':np.median(ae)}
 for t in [3,6,9,12]:m[f'within_{t}_months_percent']=100*np.mean(ae<=t)
 pd.DataFrame([m]).to_csv(root/'FocalNet_metrics.csv',index=False)
 rows=[]
 for label,mask in [('All cases',np.ones(n,dtype=bool)),('Female',df.male.eq(0).to_numpy()),('Male',df.male.eq(1).to_numpy())]+[(f'{a} to <{b} years',(y>=a*12)&(y<b*12)) for a,b in [(0,6),(6,12),(12,19)]]:
  z=e[mask];rows.append({'group':label,'n':len(z),'MAE_months':abs(z).mean() if len(z) else None,'RMSE_months':np.sqrt(np.mean(z*z)) if len(z) else None,'bias_months':z.mean() if len(z) else None})
 strata=pd.DataFrame(rows);strata.to_csv(root/'FocalNet_subgroups.csv',index=False)
 plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.spines.top':False,'axes.spines.right':False})
 fig,ax=plt.subplots(1,2,figsize=(10,4.3))
 ax[0].scatter(y,p,s=17,alpha=.65,color='#175b8e');ax[0].plot([0,240],[0,240],color='#777',linestyle='--');ax[0].set(xlabel='Reference bone age (months)',ylabel='Predicted bone age (months)',title=f'FocalNet | n = {n}',xlim=(0,240),ylim=(0,240));ax[0].set_aspect('equal')
 ax[1].scatter((y+p)/2,e,s=17,alpha=.65,color='#175b8e')
 for v,label in [(m['bias_months'],'Bias'),(m['LoA95_low'],'Lower limit'),(m['LoA95_high'],'Upper limit')]:ax[1].axhline(v,color='#777',linestyle='--');ax[1].text(4,v+1,f'{label}: {v:.2f}',fontsize=8)
 ax[1].set(xlabel='Mean reference and predicted bone age (months)',ylabel='Prediction minus reference (months)',title='Descriptive agreement')
 fig.tight_layout();fig.savefig(figdir/'FocalNet_agreement.png',dpi=300);fig.savefig(figdir/'FocalNet_agreement.pdf');plt.close(fig)
 fig,ax=plt.subplots(1,2,figsize=(10,4))
 ax[0].step(np.sort(ae),np.arange(1,n+1)/n*100,where='post',color='#175b8e');ax[0].set(xlabel='Absolute error (months)',ylabel='Cases at or below error (%)',title='Cumulative absolute error',ylim=(0,100));ax[0].grid(alpha=.15)
 ss=strata.iloc[3:];ax[1].bar(ss.group,ss.MAE_months,color='#175b8e');ax[1].set(xlabel='Reference bone-age strata',ylabel='MAE (months)',title='Descriptive age-stratum errors')
 for i,r in enumerate(ss.itertuples()):ax[1].text(i,r.MAE_months+.15,f'n = {r.n}',ha='center')
 fig.tight_layout();fig.savefig(figdir/'FocalNet_error_distribution.png',dpi=300);plt.close(fig)
 manifest={'source_filename':args.predictions.name,'source_sha256':hashlib.sha256(args.predictions.read_bytes()).hexdigest(),'model_id':MODEL,'checkpoint_sha256':CHECKPOINT,'scenario':'original_roi_protocol','source_rows':all_rows,'included_rows':n,'bootstrap_unit':'patient','bootstrap_repetitions':20000,'seed':20261105,'confidence_level':.95,'CI_method':'percentile bootstrap','target':'reference bone age; not chronological age','limitations':['Archived evaluation previously inspected','Run metadata flags 15 patients overlapping PRE2 initialization data; membership not independently reconciled','Historical XAI examples not proven to come from the evaluated checkpoint','No clinical effectiveness or usability outcomes measured']}
 (root/'FocalNet_provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
 print(json.dumps(m,indent=2))
if __name__=='__main__':main()
