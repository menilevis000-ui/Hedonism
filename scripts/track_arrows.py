"""Tracks the three arrows in the footage and extracts their artwork.

Run after making public/arrows/footage.mp4 (see README):
    pip install opencv-python-headless
    python3 scripts/track_arrows.py

Writes:
- src/arrows/tracking.json: one homography per frame per arrow (first frame -> frame t),
  from Lucas-Kanade feature tracking inside each arrow's outline plus RANSAC.
- src/arrows/art.json: arrow outlines, star positions and line-mask boxes (first-frame coords).
- public/arrows/lines{0,1,2}.png: the constellation lines of each arrow as an alpha mask.
"""
import cv2, numpy as np, json, sys

# Outline of each arrow's front face in the first frame (1080x1920): top, middle, bottom.
A1=[(185,462),(375,262),(378,318),(765,288),(765,500),(410,600),(345,600),(340,655)]
A2=[(405,593),(835,483),(835,378),(1110,520),(855,860),(850,795),(400,782)]
A3=[(125,790),(400,688),(402,790),(805,795),(725,1068),(300,1052),(272,975),(240,1055)]
POLYS=[A1,A2,A3]

cap=cv2.VideoCapture('public/arrows/footage.mp4')
frames=[]
while True:
    ok,f=cap.read()
    if not ok: break
    frames.append(f)
grays=[cv2.cvtColor(f,cv2.COLOR_BGR2GRAY) for f in frames]
H,W=grays[0].shape
lk=dict(winSize=(31,31),maxLevel=4,criteria=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,40,0.01))
def mask_for(poly,Hm=None,erode=12):
    m=np.zeros((H,W),np.uint8)
    p=np.array(poly,np.float32).reshape(-1,1,2)
    if Hm is not None: p=cv2.perspectiveTransform(p,Hm)
    cv2.fillPoly(m,[p.astype(np.int32)],255)
    return cv2.erode(m,np.ones((erode,erode),np.uint8))
result=[]
for ai,poly in enumerate(POLYS):
    m0=mask_for(poly)
    p0=cv2.goodFeaturesToTrack(grays[0],600,0.005,8,mask=m0,blockSize=7)
    ref=p0.reshape(-1,2).copy(); cur=ref.copy()
    Hs=[np.eye(3)]
    for t in range(1,len(grays)):
        a,b=grays[t-1],grays[t]
        nxt,st,_=cv2.calcOpticalFlowPyrLK(a,b,cur.reshape(-1,1,2).astype(np.float32),None,**lk)
        back,st2,_=cv2.calcOpticalFlowPyrLK(b,a,nxt,None,**lk)
        fb=np.linalg.norm(back.reshape(-1,2)-cur,axis=1)
        good=(st.ravel()==1)&(st2.ravel()==1)&(fb<0.8)
        ref,cur=ref[good],nxt.reshape(-1,2)[good]
        Hm,inl=cv2.findHomography(ref,cur,cv2.RANSAC,2.0)
        inl=inl.ravel().astype(bool)
        ref,cur=ref[inl],cur[inl]
        Hm,_=cv2.findHomography(ref,cur,0)
        # replenish
        if len(cur)<350:
            mt=mask_for(poly,Hm)
            for q in cur: cv2.circle(mt,tuple(int(v) for v in q),8,0,-1)
            newp=cv2.goodFeaturesToTrack(b,600-len(cur),0.005,8,mask=mt,blockSize=7)
            if newp is not None:
                newp=newp.reshape(-1,2)
                newref=cv2.perspectiveTransform(newp.reshape(-1,1,2),np.linalg.inv(Hm)).reshape(-1,2)
                ref=np.vstack([ref,newref]); cur=np.vstack([cur,newp])
        Hs.append(Hm/Hm[2,2])
        if t%50==0: print(ai,t,len(cur),file=sys.stderr)
    result.append([h.ravel().tolist() for h in Hs])
json.dump({'w':W,'h':H,'n':len(grays),'H':result},open('src/arrows/tracking.json','w'))

# --- artwork
im=frames[0]; g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(np.float32)
H,W=g.shape
out={'stars':[], 'polys':POLYS}
th_line=g-cv2.morphologyEx(g,cv2.MORPH_OPEN,np.ones((9,9),np.uint8))
th_star=g-cv2.morphologyEx(g,cv2.MORPH_OPEN,np.ones((25,25),np.uint8))
for ai,poly in enumerate(POLYS):
    m=np.zeros((H,W),np.uint8); cv2.fillPoly(m,[np.array(poly,np.int32)],255)
    m=cv2.erode(m,np.ones((11,11),np.uint8))
    # lines
    l=np.clip((th_line-6)/22,0,1)*(m>0)
    l=cv2.GaussianBlur(l,(3,3),0)
    rgba=np.zeros((H,W,4),np.uint8); rgba[...,:3]=255; rgba[...,3]=(l*255).astype(np.uint8)
    x0,y0,x1,y1=[int(v) for v in (min(p[0] for p in poly)-4,min(p[1] for p in poly)-4,max(p[0] for p in poly)+4,max(p[1] for p in poly)+4)]
    x0,y0=max(x0,0),max(y0,0); x1,y1=min(x1,W),min(y1,H)
    cv2.imwrite(f'public/arrows/lines{ai}.png',rgba[y0:y1,x0:x1])
    # stars
    s=((th_star>45)&(m>0)).astype(np.uint8)
    n,lab,stats,cent=cv2.connectedComponentsWithStats(s)
    stars=[]
    for i in range(1,n):
        a=stats[i,cv2.CC_STAT_AREA]
        if a<14: continue
        stars.append([round(float(cent[i,0]),1),round(float(cent[i,1]),1),round(float(np.sqrt(a)),1)])
    out['stars'].append(stars)
    out.setdefault('lineBox',[]).append([x0,y0,x1-x0,y1-y0])
    print(ai,len(stars),file=sys.stderr)
json.dump(out,open('src/arrows/art.json','w'))
