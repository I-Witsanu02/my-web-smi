from pathlib import Path
import matplotlib;matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
f,a=plt.subplots(figsize=(10,3));a.set(xlim=(0,10),ylim=(0,3));a.axis('off')
for i,t in enumerate(['Hand and wrist\nradiograph','YOLO proposals\nand ROI review','Nine regional crops\nand sex input','FocalNet\nage estimate','Regional XAI\nand expert review']):
 x=.08+i*2;a.add_patch(FancyBboxPatch((x,1.5),1.8,.8,boxstyle='round,pad=.04',fc='#e8f3f6',ec='#137e87'));a.text(x+.9,1.9,t,ha='center',va='center',fontsize=10,color='#12314c')
 if i<4:a.annotate('',xy=(x+1.99,1.9),xytext=(x+1.83,1.9),arrowprops={'arrowstyle':'->'})
a.text(5,2.65,'Implemented inference and review workflow',ha='center',fontsize=12,color='#12314c')
a.text(5,1.05,'Feedback is stored separately from the original prediction',ha='center',fontsize=10)
a.text(5,.4,'Proposed update process\nCurate feedback → Train offline → Evaluate independently → Approve release',ha='center',va='center',fontsize=10,bbox={'boxstyle':'round,pad=.5','fc':'#f6f6f6','ec':'#888888','linestyle':'--'})
for ext in ['png','pdf']:f.savefig(Path('docs/manuscript/figures_xai')/('Workflow_FocalNet.'+ext),dpi=300,bbox_inches='tight')
