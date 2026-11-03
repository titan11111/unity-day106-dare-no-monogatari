#!/bin/bash
# builds a fast test copy of index.html (draw off switchable, faster timers, keys released after a step starts)
cd /home/claude/dq && node build.js >/dev/null
python3 - <<'PY'
s=open('/home/claude/dq/index.html').read()
def rep(a,b):
    global s
    assert a in s,a
    s=s.replace(a,b,1)
rep("  draw();\n  requestAnimationFrame(frame);","  if(!window.NODRAW)draw();\n  setTimeout(frame,0);")
rep("const sleep=ms=>new Promise(r=>setTimeout(r,ms));","const sleep=ms=>new Promise(r=>setTimeout(r,ms/10));")
rep("G.mv={dx:d[0],dy:d[1],t:0,d:(RUN.t||RUN.h||RUN.p)?5:8};}","G.mv={dx:d[0],dy:d[1],t:0,d:(RUN.t||RUN.h||RUN.p)?5:8};keys.u=keys.d=keys.l=keys.r=false;pressed.u=pressed.d=pressed.l=pressed.r=false;}")
rep("{G.busy=true;openDoor(tx,ty).finally","{keys.u=keys.d=keys.l=keys.r=false;G.busy=true;openDoor(tx,ty).finally")
open('/home/claude/dq/test/fast.html','w').write(s)
PY
