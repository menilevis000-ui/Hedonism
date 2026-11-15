"""Tracks the head panel in the kiss footage and builds a clean plate.

Run after making public/kiss/footage50.mp4 (see README):
    python3 scripts/track_kiss.py

Writes:
- src/kiss/tracking.json: per frame, a homography from the reference frame
  (the last one, where the whole face is visible) to that frame.
- public/kiss/clean.mp4: the footage with the eye and the inner lip lines painted out
  (only those areas are used, behind the animated eye and lips).
"""
import cv2, numpy as np, json, subprocess

SRC = 'public/kiss/footage50.mp4'
cap = cv2.VideoCapture(SRC)
frames = []
while True:
    ok, f = cap.read()
    if not ok:
        break
    frames.append(f)
N = len(frames)
REF = N - 1
grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in frames]
H, W = grays[0].shape

# Inside of the head panel in the reference frame
HEAD = [(80, 800), (450, 720), (780, 820), (800, 1100), (835, 1250), (800, 1380), (600, 1450), (450, 1550), (250, 1450), (80, 1300)]
# Areas painted out in the clean plate (reference-frame coords)
EYE = [(708, 1046), (792, 1046), (796, 1100), (708, 1100)]
LIPS_IN = [(792, 1228), (858, 1228), (862, 1322), (792, 1322)]

lk = dict(winSize=(31, 31), maxLevel=4, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 40, 0.01))


def mask_for(poly, Hm=None, erode=10):
    m = np.zeros((H, W), np.uint8)
    p = np.array(poly, np.float32).reshape(-1, 1, 2)
    if Hm is not None:
        p = cv2.perspectiveTransform(p, Hm)
    cv2.fillPoly(m, [p.astype(np.int32)], 255)
    return cv2.erode(m, np.ones((erode, erode), np.uint8)) if erode else m


Hs = [None] * N
Hs[REF] = np.eye(3)
p0 = cv2.goodFeaturesToTrack(grays[REF], 800, 0.005, 8, mask=mask_for(HEAD), blockSize=7)
ref = p0.reshape(-1, 2).copy()
cur = ref.copy()
for t in range(REF - 1, -1, -1):
    a, b = grays[t + 1], grays[t]
    nxt, st, _ = cv2.calcOpticalFlowPyrLK(a, b, cur.reshape(-1, 1, 2).astype(np.float32), None, **lk)
    back, st2, _ = cv2.calcOpticalFlowPyrLK(b, a, nxt, None, **lk)
    fb = np.linalg.norm(back.reshape(-1, 2) - cur, axis=1)
    good = (st.ravel() == 1) & (st2.ravel() == 1) & (fb < 0.8)
    ref, cur = ref[good], nxt.reshape(-1, 2)[good]
    Hm, inl = cv2.findHomography(ref, cur, cv2.RANSAC, 2.0)
    inl = inl.ravel().astype(bool)
    ref, cur = ref[inl], cur[inl]
    Hm, _ = cv2.findHomography(ref, cur, 0)
    if len(cur) < 450:
        mt = mask_for(HEAD, Hm)
        for q in cur:
            cv2.circle(mt, tuple(int(v) for v in q), 8, 0, -1)
        newp = cv2.goodFeaturesToTrack(b, 800 - len(cur), 0.005, 8, mask=mt, blockSize=7)
        if newp is not None:
            newp = newp.reshape(-1, 2)
            newref = cv2.perspectiveTransform(newp.reshape(-1, 1, 2), np.linalg.inv(Hm)).reshape(-1, 2)
            ref = np.vstack([ref, newref])
            cur = np.vstack([cur, newp])
    Hs[t] = Hm / Hm[2, 2]
json.dump({'w': W, 'h': H, 'n': N, 'fps': 50, 'H': [h.ravel().tolist() for h in Hs]}, open('src/kiss/tracking.json', 'w'))
print('tracked', N, 'frames')

# Clean plate: paint out the dark line art inside the eye and inner-lip boxes.
ff = subprocess.Popen(
    ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', '50', '-i', '-',
     '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', 'public/kiss/clean.mp4'],
    stdin=subprocess.PIPE)
for t in range(N):
    im = frames[t]
    g = grays[t].astype(np.float32)
    area = cv2.bitwise_or(mask_for(EYE, Hs[t], 0), mask_for(LIPS_IN, Hs[t], 0))
    local = cv2.medianBlur(grays[t], 21).astype(np.float32)
    lines = (np.abs(local - g) > 11).astype(np.uint8) * 255
    lines = cv2.dilate(lines, np.ones((7, 7), np.uint8)) & area
    ff.stdin.write(cv2.inpaint(im, lines, 9, cv2.INPAINT_TELEA).tobytes())
ff.stdin.close()
ff.wait()
print('wrote public/kiss/clean.mp4')
