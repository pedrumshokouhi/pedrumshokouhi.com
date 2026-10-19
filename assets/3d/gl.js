/* P.S. 3D gl.js v2: the WebGL renderer. WebGL2 first, WebGL1 + ANGLE_instanced_arrays second, never software GL.
   Passes, at most seven draw calls a view (eight with the Window's reflection):
     1 shadow mask   the opaque solids flattened onto the floor along the key light, four jittered copies, one per channel,
                     blended with MAX into a half-size target (WebGL2 MAX or EXT_blend_minmax; skipped where neither exists)
     2 reflection    (reflect only) the opaque solids flipped about the floor at 16%, fading over .35 of the height, half size
     3 opaque faces  hemisphere + key + fill light, materials by kind, textures, ground AO
     4 floor         one instanced draw: a rounded-rect contact shadow under every solid, the cast mask and the reflection,
                     depth-tested on the floor or the part each one stands on
     5 translucent faces, 6 lines (silhouettes, creases, details), 7 hidden lines (explode only), 8 points and lit spheres.
   Geometry is baked to world space on the CPU per node and re-uploaded only for nodes whose pose or state changed. */
(function () {
  'use strict';
  var P = window.PS3D;
  if (!P || P._R.gl) return;
  var M = Math, KIND = P.KIND;
  var HDR = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
  var CULL = 'gl_Position=vec4(2.,2.,2.,1.);';
  var LIT = 'uniform vec3 uL;uniform vec3 uF;uniform vec3 uSky;uniform vec3 uGnd;uniform vec3 uKeyC;uniform vec3 uFillC;uniform vec4 uK;' +
    'vec3 light(vec3 n){float ndl=max(dot(n,uL),0.);float hemi=.5+.5*n.y;vec3 amb=mix(uGnd,uSky,hemi);float fl=max(dot(n,uF),0.);' +
    'return amb*uK.x+uKeyC*ndl*uK.y+uFillC*fl*uK.z;}';
  /* faces: aF (palette slot, alpha, highlight, tint), aX (kind, part floor y, ao height, ground), aU (atlas u, v, tex mode, develop) */
  var VS_F = 'precision highp float;attribute vec3 aP;attribute vec3 aN;attribute vec4 aF;attribute vec4 aX;attribute vec4 aU;' +
    'uniform mat4 uVP;uniform vec3 uPal[8];uniform vec3 uEye;uniform vec3 uDir;uniform float uOrtho;uniform float uPass;' +
    'uniform vec4 uMat[8];uniform vec4 uMatC[8];uniform vec3 uSpecC;uniform vec3 uRimC;uniform vec3 uMetLo;uniform vec4 uGP;' + LIT +
    'varying vec4 vB;varying vec4 vL;varying vec4 vS;varying vec4 vA;varying vec4 vT;' +
    'void main(){vB=vec4(0.);vL=vec4(0.);vS=vec4(0.);vA=vec4(0.);vT=vec4(0.);' +
    'int mi=int(aX.x+.5);vec4 mt=uMat[mi];vec4 mc=uMatC[mi];float a=aF.y;float md=mt.w;' +
    'bool tr=a<.99||(md>1.5&&md<3.5);' +
    'if(a<.004){' + CULL + 'return;}' +
    'if(uPass<.5){if(tr){' + CULL + 'return;}}else if(uPass<1.5){if(!tr){' + CULL + 'return;}}else if(tr){' + CULL + 'return;}' +
    'vec3 V=uOrtho>.5?uDir:normalize(uEye-aP);vec3 n=normalize(aN+1e-9);if(dot(n,V)<0.){if(md>2.5&&md<3.5){' + CULL + 'return;}n=-n;}float nv=abs(dot(n,V));' +
    'int ci=int(aF.x+.5);vec3 base=mc.a>.5?mc.rgb:uPal[ci];vec3 lt=light(n);vec3 ad=vec3(0.);' +
    'if((md>.5&&md<1.5)||md>3.5){vec3 R=reflect(-V,n);float e=smoothstep(-.45,.65,R.y);' +
    'if(md<1.5){base=mix(uMetLo,base,.5+.5*e)*mix(.85,1.08,pow(1.-nv,1.5));lt=mix(vec3(1.),lt,.45);}else base*=mix(.86,1.1,e);}' +
    'if(md>2.5&&md<3.5&&n.y>.9)base=mix(base,vec3(1.),.15);' +
    'if(mt.x>0.){vec3 H=normalize(uL+V);ad+=uSpecC*mt.x*pow(max(dot(n,H),0.),mt.y);}' +
    'if(mt.z>0.)ad+=uRimC*mt.z*pow(1.-nv,2.5);' +
    'if(md>1.5&&md<2.5)a*=mix(.05,.32,pow(1.-nv,2.));else if(md>2.5&&md<3.5)a*=.55;' +
    'vec3 Q=aP;if(uPass>2.5){a*=.16*(1.-clamp((aP.y-uGP.x)/max(uGP.y,1e-4),0.,1.));Q.y=2.*uGP.x-aP.y;}' +
    'vB=vec4(base,aP.y);vL=vec4(lt,a);vS=vec4(ad,aF.w);vA=vec4(aX.y,aX.z,aU.z,aU.w);vT=vec4(aU.x,aU.y,min(aF.z,1.),0.);' +
    'gl_Position=uVP*vec4(Q,1.);}';
  var FS_F = HDR + 'uniform sampler2D uTex;uniform vec3 uInk;uniform vec3 uAcc;uniform vec4 uKA;' +
    'varying vec4 vB;varying vec4 vL;varying vec4 vS;varying vec4 vA;varying vec4 vT;' +
    'void main(){vec3 base=vB.rgb;' +
    'if(vA.z>.5){vec3 t=texture2D(uTex,vT.xy,-.4).rgb;if(vA.z>1.5){float l=dot(t,vec3(.2126,.7152,.0722));' +
    'vec3 m=clamp(((l*vec3(1.077,1.045,.986))-.5)*1.08+.5,0.,1.)*1.02;t=mix(m,t,vA.w);}base=t;}' +
    'vec3 c=base*vL.rgb+vS.rgb;' +
    'if(vA.y>0.)c*=mix(uKA.w,1.,smoothstep(vA.x,vA.x+vA.y,vB.w));' +
    'c=mix(c,uInk,vS.w);c=mix(c,uAcc,.3*vT.z);' +
    'float a=vL.a;if(a<.002)discard;gl_FragColor=vec4(c*a,a);}';
  /* the shadow mask: one instance per jittered copy, each copy writes 1 into its own channel */
  var VS_M = 'precision highp float;attribute vec3 aP;attribute vec4 aF;attribute vec4 aX;attribute vec4 aJ;attribute vec4 aC;' +
    'uniform mat4 uVP;uniform vec3 uL;uniform float uG;uniform vec4 uMat[8];varying vec4 vC;' +
    'void main(){vC=vec4(0.);int mi=int(aX.x+.5);float md=uMat[mi].w;' +
    'if(aF.y<.99||aX.w>.5||(md>1.5&&md<3.5)){' + CULL + 'return;}' +
    'vec3 L=normalize(uL+vec3(aJ.x,0.,aJ.y));L.y=max(L.y,.12);float h=max(aP.y-uG,0.);' +
    'vec3 Q=vec3(aP.x-L.x*h/L.y,uG,aP.z-L.z*h/L.y);vC=aC;gl_Position=uVP*vec4(Q,1.);}';
  var FS_M = HDR + 'varying vec4 vC;void main(){gl_FragColor=vC;}';
  /* the floor: contact shadows (type 0), the cast mask (1) and the reflection (2), one quad each */
  var VS_G = 'precision highp float;attribute vec2 aK;attribute vec4 aI0;attribute vec4 aI1;attribute vec4 aI2;attribute vec4 aI3;' +
    'uniform mat4 uVP;uniform vec3 uL;varying vec4 vG;varying vec4 vW;varying vec4 vI;varying vec4 vQ;' +
    'void main(){float e=aI2.x;vec2 hs=aI0.zw+vec2(e);vec2 lc=aK*hs;float c=aI1.x;float s=aI1.y;vec2 ctr=aI0.xy;' +
    'if(aI2.y<.5){vec2 ld=uL.xz;float ll=length(ld);if(ll>1e-4)ctr-=ld/ll*aI2.z;}' +
    'vec2 w=ctr+vec2(lc.x*c+lc.y*s,-lc.x*s+lc.y*c);' +
    'vG=vec4(lc,aI0.zw);vW=vec4(w,e,aI2.y);vI=vec4(aI1.w,cos(aI2.w),sin(aI2.w),0.);vQ=aI3;' +
    'gl_Position=uVP*vec4(w.x,aI1.z,w.y,1.);}';
  var FS_G = HDR + 'uniform sampler2D uMask;uniform sampler2D uRefl;uniform vec2 uRes;uniform vec3 uShC;' +
    'varying vec4 vG;varying vec4 vW;varying vec4 vI;varying vec4 vQ;' +
    'void main(){if(vQ.z>0.){vec2 d=vW.xy-vQ.xy;vec2 l=vec2(d.x*vI.y-d.y*vI.z,d.x*vI.z+d.y*vI.y);if(abs(l.x)>vQ.z||abs(l.y)>vQ.w)discard;}' +
    'float t=vW.w;float a;' +
    'if(t<.5){vec2 q=abs(vG.xy)-vG.zw;float d=length(max(q,0.))+min(max(q.x,q.y),0.);float k=1.-smoothstep(-.3*vW.z,vW.z,d);a=vI.x*k*k;}' +
    'else{vec2 uv=gl_FragCoord.xy/uRes;if(t<1.5){vec2 o=3./uRes;vec4 q4=vec4(.25);' +
    'float s=dot(texture2D(uMask,uv),q4)*.2+(dot(texture2D(uMask,uv+vec2(o.x,0.)),q4)+dot(texture2D(uMask,uv-vec2(o.x,0.)),q4)+dot(texture2D(uMask,uv+vec2(0.,o.y)),q4)+dot(texture2D(uMask,uv-vec2(0.,o.y)),q4))*.125' +
    '+(dot(texture2D(uMask,uv+o),q4)+dot(texture2D(uMask,uv-o),q4)+dot(texture2D(uMask,uv+vec2(o.x,-o.y)),q4)+dot(texture2D(uMask,uv+vec2(-o.x,o.y)),q4))*.075;' +
    'a=s*vI.x;}else{vec2 o=1.5/uRes;gl_FragColor=(texture2D(uRefl,uv)*.4+(texture2D(uRefl,uv+vec2(o.x,0.))+texture2D(uRefl,uv-vec2(o.x,0.))+texture2D(uRefl,uv+vec2(0.,o.y))+texture2D(uRefl,uv-vec2(0.,o.y)))*.15)*vI.x;return;}}' +
    'if(a<.002)discard;gl_FragColor=vec4(uShC*a,a);}';
  /* lines: aS (width, palette slot, dash, edge class), aT (alpha, highlight) */
  var VS_L = 'precision highp float;attribute vec2 aK;attribute vec3 aA;attribute vec3 aB;attribute vec3 aN1;attribute vec3 aN2;attribute vec4 aS;attribute vec2 aT;' +
    'uniform mat4 uVP;uniform mat4 uV;uniform vec3 uPal[8];uniform vec3 uEye;uniform vec3 uDir;uniform float uOrtho;uniform vec2 uRes;uniform float uDpr;uniform vec4 uMode;uniform float uLA;' +
    'uniform vec4 uLW;uniform vec3 uSil;uniform vec2 uDet;' +
    'varying vec4 vC;varying vec4 vL;' +
    'void main(){vC=vec4(0.);vL=vec4(0.);if(aT.x<.004){' + CULL + 'return;}' +
    'vec3 V=uOrtho>.5?uDir:normalize(uEye-.5*(aA+aB));float fl=aS.w;float s1=dot(aN1,V);float s2=dot(aN2,V);' +
    'float w=aS.x;float al=aT.x;int ci=int(aS.y+.5);vec3 col=uPal[ci];bool hid=uMode.x>.5;' +
    'if(fl<.5){float c12=dot(aN1,aN2);bool sil=abs(c12)>.999||s1*s2<=0.;' +
    'if(hid){}else if(sil){w=uLW.x*(w>1.2?1.15:1.);al*=uLW.z;if(ci==0)col=uSil;}' +
    'else{if(s1<0.&&s2<0.){' + CULL + 'return;}if(c12>.866){' + CULL + 'return;}w=uLW.y;al*=uLW.w;}}' +
    'else if(fl<1.5){if(s1*s2>0.){' + CULL + 'return;}if(!hid){w=uLW.x;al*=uLW.z;if(ci==0)col=uSil;}}' +
    'else if(fl<2.5){}' +
    'else if(fl<3.5){if(hid){' + CULL + 'return;}al*=uDet.x;}' +
    'else{if(hid||uDet.y>.5){' + CULL + 'return;}}' +
    'vec4 ca=uVP*vec4(aA,1.);vec4 cb=uVP*vec4(aB,1.);ca.w=max(ca.w,1e-5);cb.w=max(cb.w,1e-5);' +
    'vec2 sa=ca.xy/ca.w*.5*uRes;vec2 sb=cb.xy/cb.w*.5*uRes;vec2 d=sb-sa;float len=length(d);' +
    'vec2 dr=len>1e-4?d/len:vec2(1.,0.);vec2 nr=vec2(-dr.y,dr.x);float hl=aT.y;' +
    'w=hid?.75:max(w*uMode.y,1.5*hl*uMode.y);float hw=.5*w*uDpr;float h=hw+1.;' +
    'vec2 p=mix(sa,sb,aK.x)+nr*aK.y*h+dr*(2.*aK.x-1.)*h;float z=mix(ca.z/ca.w,cb.z/cb.w,aK.x);' +
    'gl_Position=vec4(p/(.5*uRes),z,1.);' +
    'float vz=-(uV*vec4(mix(aA,aB,aK.x),1.)).z;float f=mix(1.,.55,smoothstep(uMode.z,uMode.w,vz));' +
    'col=mix(col,uPal[3],min(hl,1.));' +
    'float a=hid?.16*aT.x:al*f*uLA;vC=vec4(col,a);' +
    'vL=vec4(aK.y*h,hw,aK.x*len+(2.*aK.x-1.)*h,(hid?4.:aS.z)*uDpr);}';
  var FS_L = HDR + 'varying vec4 vC;varying vec4 vL;void main(){if(vL.w>0.&&mod(vL.z,2.*vL.w)>vL.w)discard;' +
    'float cov=clamp(vL.y+.5-abs(vL.x),0.,1.)*min(1.,vL.y*2.+.25);float a=vC.a*cov;if(a<.003)discard;gl_FragColor=vec4(vC.rgb*a,a);}';
  /* points: flows and pins are flat discs; a sphere with a world radius is lit like a ball */
  var VS_P = 'precision highp float;attribute vec2 aK;attribute vec3 aC;attribute vec4 aS;attribute vec2 aT;' +
    'uniform mat4 uVP;uniform vec3 uPal[8];uniform vec2 uRes;uniform float uDpr;uniform float uPy;' +
    'varying vec4 vF;varying vec4 vR;varying vec4 vD;' +
    'void main(){vF=vec4(0.);vR=vec4(0.);vD=vec4(0.);if(aT.x<.004){' + CULL + 'return;}' +
    'vec4 c=uVP*vec4(aC,1.);c.w=max(c.w,1e-5);float r=aS.x>0.?aS.x*uPy*.5*uRes.y/c.w:-aS.x*.5*uDpr;float h=r+1.;' +
    'gl_Position=vec4(c.xy/c.w+aK*h/(.5*uRes),c.z/c.w,1.);' +
    'int fi=int(aS.y+.5);int li=int(aS.z+.5);float hl=min(aT.y,1.);' +
    'vF=vec4(uPal[fi],aS.y<-.5?0.:aT.x);vR=vec4(mix(uPal[li],uPal[3],hl),aS.z<-.5?0.:aT.x);vD=vec4(aK*h,r,aS.x>0.?uDpr:-uDpr);}';
  var FS_P = HDR + 'uniform vec3 uBR;uniform vec3 uBU;uniform vec3 uBD;uniform vec3 uPL;uniform vec3 uPF;uniform vec3 uPSky;uniform vec3 uPGnd;uniform vec3 uPKey;uniform vec3 uPFill;uniform vec4 uPK;' +
    'varying vec4 vF;varying vec4 vR;varying vec4 vD;void main(){float d=length(vD.xy);float r=vD.z;float dp=abs(vD.w);' +
    'vec3 fc=vF.rgb;if(vD.w>0.&&r>2.){vec2 p=vD.xy/r;float z=sqrt(max(0.,1.-dot(p,p)));vec3 n=normalize(uBR*p.x+uBU*p.y+uBD*z);' +
    'float ndl=max(dot(n,uPL),0.);vec3 amb=mix(uPGnd,uPSky,.5+.5*n.y);fc*=amb*uPK.x+uPKey*ndl*uPK.y+uPFill*max(dot(n,uPF),0.)*uPK.z;}' +
    'float fill=clamp(r+.5-d,0.,1.)*vF.a;float ring=clamp(.5*dp+.5-abs(d-(r-.5*dp)),0.,1.)*vR.a;' +
    'float a=fill*(1.-ring)+ring;if(a<.003)discard;gl_FragColor=vec4(fc*fill*(1.-ring)+vR.rgb*ring,a);}';

  var PROGS = {
    f: [VS_F, FS_F, ['aP', 'aN', 'aF', 'aX', 'aU']],
    m: [VS_M, FS_M, ['aP', 'aF', 'aX', 'aJ', 'aC']],
    g: [VS_G, FS_G, ['aK', 'aI0', 'aI1', 'aI2', 'aI3']],
    l: [VS_L, FS_L, ['aK', 'aA', 'aB', 'aN1', 'aN2', 'aS', 'aT']],
    p: [VS_P, FS_P, ['aK', 'aC', 'aS', 'aT']]
  };
  var UNI = ['uVP', 'uV', 'uPal', 'uEye', 'uDir', 'uOrtho', 'uL', 'uF', 'uSky', 'uGnd', 'uKeyC', 'uFillC', 'uK', 'uPass', 'uMat', 'uMatC', 'uSpecC', 'uRimC',
    'uMetLo', 'uGP', 'uTex', 'uInk', 'uAcc', 'uKA', 'uG', 'uMask', 'uRefl', 'uRes', 'uShC', 'uDpr', 'uMode', 'uLA', 'uLW', 'uSil', 'uDet', 'uPy',
    'uBR', 'uBU', 'uBD', 'uPL', 'uPF', 'uPSky', 'uPGnd', 'uPKey', 'uPFill', 'uPK'];
  var FS = 18, LS = 18, PS = 9, GS = 16; /* floats per face vertex, line instance, point instance, floor instance */
  var JIT = new Float32Array([.05, .02, 0, 0, 1, 0, 0, 0, -.02, .05, 0, 0, 0, 1, 0, 0, .02, -.05, 0, 0, 0, 0, 1, 0, -.05, -.02, 0, 0, 0, 0, 0, 1]);
  var JIT1 = new Float32Array([0, 0, 0, 0, 1, 1, 1, 1]);

  function GLR(v) {
    var c = v.canvas, gl = null, two = false, at = P._ext({}, P.GLATTR);
    if (P.support() === 'webgl2') { at.antialias = P._msaa(); gl = c.getContext('webgl2', at); two = !!gl; }
    if (!gl) { at.antialias = false; gl = c.getContext('webgl', at) || null; }
    if (!gl) return null;
    v._hadGL = true;
    this.v = v; this.gl = gl; this.two = two; this.kind = 'gl'; this.lost = false;
    try { this.aa = !!(gl.getContextAttributes() || {}).antialias; } catch (e) { this.aa = false; }
    this.lx = gl.getExtension('WEBGL_lose_context');
    var self = this;
    this._onLost = function (e) { e.preventDefault(); self.lost = true; self.list = null; v._lost(); };
    this._onRest = function () { self.lost = false; if (self.init()) { self.list = null; v._restored(); } else v._fallback(); };
    c.addEventListener('webglcontextlost', this._onLost, false);
    c.addEventListener('webglcontextrestored', this._onRest, false);
    if (!this.init()) { this.destroy(true); return null; }
  }
  GLR.prototype = {
    init: function () {
      var gl = this.gl;
      this.ia = this.two ? null : gl.getExtension('ANGLE_instanced_arrays');
      if (!this.two && !this.ia) return false;
      var mm = this.two ? null : gl.getExtension('EXT_blend_minmax');
      this.MAX = this.two ? gl.MAX : (mm ? mm.MAX_EXT : 0);
      this.pr = {};
      for (var k in PROGS) {
        var p = this.prog(PROGS[k][0], PROGS[k][1], PROGS[k][2]);
        if (!p) { P._warn('shader', 'WebGL shaders failed to compile; drawing with Canvas2D'); return false; }
        var u = {};
        for (var i = 0; i < UNI.length; i++) u[UNI[i]] = gl.getUniformLocation(p, UNI[i]);
        this.pr[k] = { p: p, u: u, n: PROGS[k][2].length };
      }
      this.bQuadL = this.buf(new Float32Array([0, -1, 0, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      this.bQuadP = this.buf(new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      this.bJ = this.buf(JIT, gl.STATIC_DRAW); this.bJ1 = this.buf(JIT1, gl.STATIC_DRAW);
      this.bF = gl.createBuffer(); this.bL = gl.createBuffer(); this.bP = gl.createBuffer(); this.bG = gl.createBuffer();
      this.list = null; this.en = 0; this.fbo = {}; this.atlas = null; this.ng = 0; this.Gcap = 0;
      /* a 1x1 paper texel for views without textures, so the sampler is always complete */
      this.t0 = this.tex1(); this.tm0 = this.tex1(); this.tr0 = this.tex1();
      gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      return !gl.isContextLost();
    },
    tex1: function () {
      var gl = this.gl, t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      return t;
    },
    prog: function (vs, fs, attrs) {
      var gl = this.gl;
      function sh(t, src) { var s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) { P._warn('glsl', gl.getShaderInfoLog(s)); return null; } return s; }
      var a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs);
      if (!a || !b) return null;
      var p = gl.createProgram();
      gl.attachShader(p, a); gl.attachShader(p, b);
      for (var i = 0; i < attrs.length; i++) gl.bindAttribLocation(p, i, attrs[i]);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) { P._warn('link', gl.getProgramInfoLog(p)); return null; }
      return p;
    },
    buf: function (data, usage) { var gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage); return b; },
    div: function (loc, d) { if (this.two) this.gl.vertexAttribDivisor(loc, d); else this.ia.vertexAttribDivisorANGLE(loc, d); },
    drawI: function (mode, n, inst) { if (this.two) this.gl.drawArraysInstanced(mode, 0, n, inst); else this.ia.drawArraysInstancedANGLE(mode, 0, n, inst); },
    /* attrs: [[buf, size, stride, offset, divisor], ...] in location order */
    bind: function (attrs) {
      var gl = this.gl;
      for (var i = 0; i < attrs.length; i++) {
        var a = attrs[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, a[0]); gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i, a[1], gl.FLOAT, false, a[2] * 4, a[3] * 4); this.div(i, a[4]);
      }
      for (var j = attrs.length; j < this.en; j++) { gl.disableVertexAttribArray(j); this.div(j, 0); }
      this.en = attrs.length;
    },
    unbindDiv: function () { for (var i = 0; i < this.en; i++) this.div(i, 0); },
    layout: function (v) {
      var list = [], nf = 0, nl = 0, np = 0, gl = this.gl;
      v.scene.walk(function (n) {
        if (!n.geom) return;
        var g = n.geom;
        list.push({ n: n, f: nf, l: nl, p: np, g: g, wv: -1, sv: -1, gv: -1, bb: new Float32Array(6), fp: new Float32Array(6), solid: false, ground: false, ea: 0 });
        nf += g.T.length / 3; nl += g.L.length / 17; np += g.S.length / 7;
      });
      this.list = list; this.nf = nf; this.nl = nl; this.np = np; this.str = v.scene._str;
      this.F = new Float32Array(M.max(1, nf * FS)); this.L = new Float32Array(M.max(1, nl * LS)); this.Pt = new Float32Array(M.max(1, np * PS));
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bF); gl.bufferData(gl.ARRAY_BUFFER, this.F.byteLength, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bL); gl.bufferData(gl.ARRAY_BUFFER, this.L.byteLength, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bP); gl.bufferData(gl.ARRAY_BUFFER, this.Pt.byteLength, gl.DYNAMIC_DRAW);
      var cap = (list.length + 3) * GS;
      if (!this.G || this.G.length < cap) this.G = new Float32Array(cap);
      this.full = true; this.shDirty = true;
    },
    /* ---- textures: one atlas of 4 x 4 tiles ---- */
    tile: function (T) {
      var A = this.atlas, gl = this.gl;
      if (!A) {
        /* 512px a tile everywhere: a sheet's 62-in-1000 title has to survive a sheet about 200 CSS px wide at any density */
        var px = 512, sz = px * 4, t = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sz, sz, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        /* a printed face is seen at a slant (a sheet at 30 degrees is half as tall as it is wide): anisotropic filtering keeps
           its type sharp along the slant instead of dropping to a blurred mip level */
        var an = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, M.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT) || 1));
        A = this.atlas = { t: t, px: px, sz: sz, map: {}, keys: [], dirty: false };
      }
      var k = T.key || T.src || (T._k || (T._k = 'tex' + (++P._tk || (P._tk = 1)))), e = A.map[k];
      if (!e) {
        if (A.keys.length >= 16) return A.map[A.keys[15]];
        e = A.map[k] = { i: A.keys.length, v: -1, T: T }; A.keys.push(k);
      }
      e.T = T;
      if (e.v !== (T.v || 0) || e.v === -1) this.upTile(e);
      return e;
    },
    upTile: function (e) {
      var A = this.atlas, gl = this.gl, cv = P._tile(e.T, A.px), x = (e.i % 4) * A.px, y = ((e.i / 4) | 0) * A.px;
      gl.bindTexture(gl.TEXTURE_2D, A.t);
      try { gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, gl.RGBA, gl.UNSIGNED_BYTE, cv); }
      catch (er) { P._warn('texture', er); e.T.fail = true; e.T.v = (e.T.v || 0) + 1; }
      e.v = e.T.v || 0; A.dirty = true;
    },
    bake: function (v) {
      var r = { f: [1e9, -1], l: [1e9, -1], p: [1e9, -1] }, F = this.F, L = this.L, Pt = this.Pt, nm = this.nm || (this.nm = new Float32Array(9)), lit = P._lit(v);
      var posed = false;
      for (var e = 0; e < this.list.length; e++) {
        var it = this.list[e], n = it.n, g = it.g;
        if (g !== n.geom) { this.str = -1; continue; }
        /* a textured face whose image has landed uploads again; its coordinates stay */
        if (g.texd) for (var ti = 0; ti < g.F.length; ti++) { var tf = g.F[ti]; if (tf.tex) this.tile(tf.tex); }
        if (it.wv === n._wv && it.sv === n._sv && it.gv === n._gv) continue;
        posed = true;
        it.wv = n._wv; it.sv = n._sv; it.gv = n._gv;
        var m = n.wm, vis = n._ev ? 1 : 0, ea = n._ea * vis, eh = n._eh, et = n._et, i, k, o, x, y, z, bb = it.bb;
        P.m4.nrm(m, nm);
        bb[0] = bb[1] = bb[2] = 1e30; bb[3] = bb[4] = bb[5] = -1e30;
        /* faces */
        var T = g.T, TF = g.TF, TI = g.TI, gy = 0, aoh = 0, ground = (n._lay || n.layer || 0) < 0 ? 1 : 0, fi = -1, fc = null, te = null;
        o = it.f * FS;
        for (i = 0; i < T.length; i += 3) {
          x = T[i]; y = T[i + 1]; z = T[i + 2];
          var X = m[0] * x + m[4] * y + m[8] * z + m[12], Y = m[1] * x + m[5] * y + m[9] * z + m[13], Z = m[2] * x + m[6] * y + m[10] * z + m[14];
          if (X < bb[0]) bb[0] = X; if (Y < bb[1]) bb[1] = Y; if (Z < bb[2]) bb[2] = Z; if (X > bb[3]) bb[3] = X; if (Y > bb[4]) bb[4] = Y; if (Z > bb[5]) bb[5] = Z;
        }
        if (T.length) { gy = bb[1]; aoh = (bb[4] - bb[1]) * .18; }
        it.tr = false;
        it.ground = !!ground; it.ea = ea; it.solid = !!g.solid && T.length > 0 && vis > 0 && ea > .3;
        if (it.solid) P._footprint(n, it.fp);
        for (i = 0; i < T.length; i += 3, o += FS) {
          x = T[i]; y = T[i + 1]; z = T[i + 2];
          var tfi = TF[(i / 9) | 0];
          if (tfi !== fi) { fi = tfi; fc = g.F[fi]; te = fc.tex ? this.tile(fc.tex) : null; if (fc.tex) g.texd = true; }
          var nn = fc.n;
          F[o] = m[0] * x + m[4] * y + m[8] * z + m[12]; F[o + 1] = m[1] * x + m[5] * y + m[9] * z + m[13]; F[o + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
          F[o + 3] = nm[0] * nn[0] + nm[3] * nn[1] + nm[6] * nn[2]; F[o + 4] = nm[1] * nn[0] + nm[4] * nn[1] + nm[7] * nn[2]; F[o + 5] = nm[2] * nn[0] + nm[5] * nn[1] + nm[8] * nn[2];
          var gk = fc.k === KIND.glass || fc.k === KIND.liquid, fa = gk ? 1 : fc.a;
          if (gk || fa * ea < .99) it.tr = true;
          F[o + 6] = fc.c; F[o + 7] = fa * ea; F[o + 8] = eh; F[o + 9] = et;
          F[o + 10] = fc.k || 0; F[o + 11] = gy; F[o + 12] = aoh; F[o + 13] = ground;
          if (te && fc.uv) {
            var A = this.atlas, vi = TI[i / 3], pad = 2 / A.px, cu = fc.uv[vi * 2], cv = fc.uv[vi * 2 + 1];
            F[o + 14] = ((te.i % 4) + pad + cu * (1 - 2 * pad)) / 4; F[o + 15] = (((te.i / 4) | 0) + pad + cv * (1 - 2 * pad)) / 4;
            F[o + 16] = fc.tex.mono ? 2 : 1; F[o + 17] = n.dev || 0;
          } else { F[o + 14] = F[o + 15] = F[o + 16] = F[o + 17] = 0; }
        }
        if (T.length) { r.f[0] = M.min(r.f[0], it.f * FS); r.f[1] = M.max(r.f[1], o); }
        /* lines */
        var Ls = g.L;
        o = it.l * LS;
        for (i = 0; i < Ls.length; i += 17, o += LS) {
          for (k = 0; k < 6; k += 3) {
            x = Ls[i + k]; y = Ls[i + k + 1]; z = Ls[i + k + 2];
            L[o + k] = m[0] * x + m[4] * y + m[8] * z + m[12]; L[o + k + 1] = m[1] * x + m[5] * y + m[9] * z + m[13]; L[o + k + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
          }
          for (k = 6; k < 12; k += 3) {
            x = Ls[i + k]; y = Ls[i + k + 1]; z = Ls[i + k + 2];
            var nx = nm[0] * x + nm[3] * y + nm[6] * z, ny = nm[1] * x + nm[4] * y + nm[7] * z, nz = nm[2] * x + nm[5] * y + nm[8] * z, nl = M.sqrt(nx * nx + ny * ny + nz * nz);
            if (nl > 1e-9) { nx /= nl; ny /= nl; nz /= nl; }
            L[o + k] = nx; L[o + k + 1] = ny; L[o + k + 2] = nz;
          }
          L[o + 12] = Ls[i + 12]; L[o + 13] = Ls[i + 13]; L[o + 14] = Ls[i + 14]; L[o + 15] = Ls[i + 15];
          L[o + 16] = Ls[i + 16] * ea; L[o + 17] = eh;
        }
        if (Ls.length) { r.l[0] = M.min(r.l[0], it.l * LS); r.l[1] = M.max(r.l[1], o); }
        /* points and spheres */
        var S = g.S, sc = M.max(M.sqrt(m[0] * m[0] + m[1] * m[1] + m[2] * m[2]), M.sqrt(m[4] * m[4] + m[5] * m[5] + m[6] * m[6]));
        o = it.p * PS;
        for (i = 0; i < S.length; i += 7, o += PS) {
          x = S[i]; y = S[i + 1]; z = S[i + 2];
          Pt[o] = m[0] * x + m[4] * y + m[8] * z + m[12]; Pt[o + 1] = m[1] * x + m[5] * y + m[9] * z + m[13]; Pt[o + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
          Pt[o + 3] = S[i + 3] > 0 ? S[i + 3] * sc : S[i + 3]; Pt[o + 4] = S[i + 4]; Pt[o + 5] = S[i + 5]; Pt[o + 6] = 0;
          Pt[o + 7] = S[i + 6] * ea; Pt[o + 8] = eh;
        }
        if (S.length) { r.p[0] = M.min(r.p[0], it.p * PS); r.p[1] = M.max(r.p[1], o); }
      }
      var full = this.full;
      this.full = false;
      this.up(this.bF, F, full ? [0, F.length] : r.f);
      this.up(this.bL, L, full ? [0, L.length] : r.l);
      this.up(this.bP, Pt, full ? [0, Pt.length] : r.p);
      if (posed || full) {
        this.shDirty = true; this.hasTr = false;
        for (var q2 = 0; q2 < this.list.length; q2++) if (this.list[q2].tr) { this.hasTr = true; break; }
      }
      if (this.atlas && this.atlas.dirty) {
        var gl = this.gl; gl.bindTexture(gl.TEXTURE_2D, this.atlas.t); gl.generateMipmap(gl.TEXTURE_2D); this.atlas.dirty = false;
      }
      return lit;
    },
    shadows: function (v, lit) {
      var q = v.q, sh = v.shadow, cast = !!sh && q < 2 && !!this.MAX, refl = !!v.reflect && q < 1;
      var key = (sh ? 1 : 0) + (cast ? 2 : 0) + (refl ? 4 : 0) + (lit.dark ? 8 : 0) + '|' + (sh && sh.a != null ? sh.a : '');
      if (!this.shDirty && key === this.shKey) return this.sh;
      this.shDirty = false; this.shKey = key;
      var scale = sh && sh.a != null ? M.max(0, M.min(2, sh.a / .14)) : 1;
      this.sh = sh || refl ? P._shadowList(this.list, { contactA: sh ? lit.contactA : 0, castA: lit.castA, scale: scale, cast: cast, reflect: refl, soft: true }, this.G) : { n: 0 };
      this.sh.cast = cast && this.sh.n > 0; this.sh.refl = refl && this.sh.n > 0;
      var gl = this.gl, n = this.sh.n || 0;
      if (n) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.bG);
        if (this.Gcap < this.G.length) { gl.bufferData(gl.ARRAY_BUFFER, this.G, gl.DYNAMIC_DRAW); this.Gcap = this.G.length; }
        else gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.G.subarray(0, n * GS));
      }
      return this.sh;
    },
    up: function (b, arr, rg) {
      if (rg[1] <= rg[0]) return;
      var gl = this.gl;
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferSubData(gl.ARRAY_BUFFER, rg[0] * 4, arr.subarray(rg[0], rg[1]));
    },
    /* a half-size target for the mask and the reflection; the reflection keeps a depth buffer */
    target: function (name, w, h, depth) {
      var gl = this.gl, f = this.fbo[name];
      if (f && f.w === w && f.h === h) return f;
      if (f) { gl.deleteFramebuffer(f.fb); gl.deleteTexture(f.t); if (f.rb) gl.deleteRenderbuffer(f.rb); }
      f = { w: w, h: h, t: gl.createTexture(), fb: gl.createFramebuffer(), rb: null };
      gl.bindTexture(gl.TEXTURE_2D, f.t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.bindFramebuffer(gl.FRAMEBUFFER, f.fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, f.t, 0);
      if (depth) {
        f.rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, f.rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, f.rb);
      }
      f.ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.fbo[name] = f;
      return f;
    },
    resize: function () {},
    use: function (k, v, pal) {
      var gl = this.gl, pr = this.pr[k], u = pr.u, c = v.camera, lit = this.lit;
      gl.useProgram(pr.p);
      if (u.uVP) gl.uniformMatrix4fv(u.uVP, false, c.VP);
      if (u.uV) gl.uniformMatrix4fv(u.uV, false, c.V);
      if (u.uPal) gl.uniform3fv(u.uPal, pal);
      if (u.uEye) gl.uniform3fv(u.uEye, c.eye);
      if (u.uDir) gl.uniform3fv(u.uDir, c.dir);
      if (u.uOrtho) gl.uniform1f(u.uOrtho, c.kind === 'ortho' ? 1 : 0);
      if (u.uL) gl.uniform3fv(u.uL, c.light);
      if (u.uF) gl.uniform3fv(u.uF, c.fill);
      if (u.uSky) { gl.uniform3fv(u.uSky, lit.sky); gl.uniform3fv(u.uGnd, lit.gnd); gl.uniform3fv(u.uKeyC, lit.key); gl.uniform3fv(u.uFillC, lit.fill); }
      if (u.uK) gl.uniform4fv(u.uK, P.LIGHT.K);
      if (u.uMat) gl.uniform4fv(u.uMat, this.mat);
      if (u.uMatC) gl.uniform4fv(u.uMatC, this.matc);
      if (u.uSpecC) gl.uniform3fv(u.uSpecC, lit.spec);
      if (u.uRimC) gl.uniform3fv(u.uRimC, lit.rim);
      if (u.uMetLo) gl.uniform3fv(u.uMetLo, lit.metalLo);
      if (u.uInk) gl.uniform3fv(u.uInk, lit.pal[0]);
      if (u.uAcc) gl.uniform3fv(u.uAcc, lit.foil);
      if (u.uKA) gl.uniform4fv(u.uKA, P.LIGHT.K);
      if (u.uRes) gl.uniform2f(u.uRes, v.canvas.width, v.canvas.height);
      if (u.uDpr) gl.uniform1f(u.uDpr, v.dpr);
      if (u.uPy) gl.uniform1f(u.uPy, c.py);
      if (u.uLA) gl.uniform1f(u.uLA, v.lineA == null ? 1 : v.lineA);
      if (u.uShC) gl.uniform3fv(u.uShC, lit.shadow);
      if (u.uTex) gl.uniform1i(u.uTex, 0);
      if (u.uMask) gl.uniform1i(u.uMask, 1);
      if (u.uRefl) gl.uniform1i(u.uRefl, 2);
      return u;
    },
    render: function (v) {
      var gl = this.gl;
      if (this.lost || gl.isContextLost()) return;
      if (!this.list || this.str !== v.scene._str) this.layout(v);
      var lit = this.lit = this.bake(v);
      if (this.str !== v.scene._str) { this.layout(v); lit = this.lit = this.bake(v); }
      if (!v._pal) { var p8 = lit.pal, a = new Float32Array(24); for (var i = 0; i < 8; i++) a.set(p8[i], i * 3); v._pal = a; }
      if (this._litFor !== lit) {
        this._litFor = lit;
        var mat = this.mat || (this.mat = new Float32Array(32)), matc = this.matc || (this.matc = new Float32Array(32)), KM = P._kmat;
        for (var j = 0; j < 8; j++) {
          mat.set(KM[j], j * 4);
          var kc = lit.kc[j];
          if (kc) { matc[j * 4] = kc[0]; matc[j * 4 + 1] = kc[1]; matc[j * 4 + 2] = kc[2]; matc[j * 4 + 3] = 1; } else matc[j * 4 + 3] = 0;
        }
        this.shDirty = true;
      }
      var pal = v._pal, c = v.camera, calls = 0, u, W = v.canvas.width, H = v.canvas.height, sh = this.shadows(v, lit);
      var hw = M.max(1, W >> 1), hh = M.max(1, H >> 1), R = c.fr || c.radius || 1;
      var atlasT = this.atlas ? this.atlas.t : this.t0;
      /* 1 the shadow mask */
      var mask = null;
      if (sh.cast && this.nf) {
        mask = this.target('mask', hw, hh, false);
        if (mask.ok) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, mask.fb); gl.viewport(0, 0, hw, hh);
          gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
          gl.disable(gl.DEPTH_TEST); gl.blendEquation(this.MAX);
          u = this.use('m', v, pal);
          gl.uniform1f(u.uG, sh.cy);
          var jit = v.q >= 1 ? this.bJ1 : this.bJ;
          this.bind([[this.bF, 3, FS, 0, 0], [this.bF, 4, FS, 6, 0], [this.bF, 4, FS, 10, 0], [jit, 4, 8, 0, 1], [jit, 4, 8, 4, 1]]);
          this.drawI(gl.TRIANGLES, this.nf, v.q >= 1 ? 1 : 4); calls++;
          this.unbindDiv();
          gl.blendEquation(gl.FUNC_ADD);
        } else mask = null;
      }
      /* 2 the reflection */
      var refl = null;
      if (sh.refl && this.nf) {
        refl = this.target('refl', hw, hh, true);
        if (refl.ok) {
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, atlasT);
          gl.bindFramebuffer(gl.FRAMEBUFFER, refl.fb); gl.viewport(0, 0, hw, hh);
          gl.clearColor(0, 0, 0, 0); gl.depthMask(true); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
          u = this.use('f', v, pal);
          gl.uniform1f(u.uPass, 3); gl.uniform4f(u.uGP, sh.gy, M.max(1e-3, sh.sh * .35), 0, 0);
          this.bind([[this.bF, 3, FS, 0, 0], [this.bF, 3, FS, 3, 0], [this.bF, 4, FS, 6, 0], [this.bF, 4, FS, 10, 0], [this.bF, 4, FS, 14, 0]]);
          gl.drawArrays(gl.TRIANGLES, 0, this.nf); calls++;
        } else refl = null;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      /* the atlas goes on unit 0 only now: making a target binds its texture to the active unit */
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, atlasT);
      gl.clearColor(0, 0, 0, 0); gl.depthMask(true);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
      /* 3 opaque faces */
      if (this.nf) {
        u = this.use('f', v, pal);
        this.bind([[this.bF, 3, FS, 0, 0], [this.bF, 3, FS, 3, 0], [this.bF, 4, FS, 6, 0], [this.bF, 4, FS, 10, 0], [this.bF, 4, FS, 14, 0]]);
        gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 2);
        gl.depthMask(true); gl.uniform1f(u.uPass, 0); gl.drawArrays(gl.TRIANGLES, 0, this.nf); calls++;
        gl.disable(gl.POLYGON_OFFSET_FILL);
      }
      /* 4 the floor: contact shadows, the cast mask, the reflection */
      if (sh.n) {
        gl.depthMask(false);
        gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1, -4);
        u = this.use('g', v, pal);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, mask ? mask.t : this.tm0);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, refl ? refl.t : this.tr0);
        gl.activeTexture(gl.TEXTURE0);
        this.bind([[this.bQuadP, 2, 2, 0, 0], [this.bG, 4, GS, 0, 1], [this.bG, 4, GS, 4, 1], [this.bG, 4, GS, 8, 1], [this.bG, 4, GS, 12, 1]]);
        this.drawI(gl.TRIANGLE_STRIP, 4, sh.n); calls++;
        this.unbindDiv();
        gl.disable(gl.POLYGON_OFFSET_FILL);
      }
      /* 5 translucent faces */
      if (this.nf && this.hasTr) {
        u = this.use('f', v, pal);
        this.bind([[this.bF, 3, FS, 0, 0], [this.bF, 3, FS, 3, 0], [this.bF, 4, FS, 6, 0], [this.bF, 4, FS, 10, 0], [this.bF, 4, FS, 14, 0]]);
        gl.depthMask(false); gl.uniform1f(u.uPass, 1); gl.drawArrays(gl.TRIANGLES, 0, this.nf); calls++;
      }
      gl.depthMask(false);
      /* 6-7 lines: visible, then hidden (behind faces, dashed, faint; only while the drawing is taken apart) */
      if (this.nl) {
        var ls = v.lineScale || 1, sz = M.max(.8, M.min(1.3, M.min(v.w, v.h) / 560));
        u = this.use('l', v, pal);
        gl.uniform4f(u.uLW, lit.silW, .9, lit.silA, .38); gl.uniform3fv(u.uSil, lit.sil); gl.uniform2f(u.uDet, .55, this.aa ? 1 : 0);
        this.bind([[this.bQuadL, 2, 2, 0, 0], [this.bL, 3, LS, 0, 1], [this.bL, 3, LS, 3, 1], [this.bL, 3, LS, 6, 1], [this.bL, 3, LS, 9, 1], [this.bL, 4, LS, 12, 1], [this.bL, 2, LS, 16, 1]]);
        gl.uniform4f(u.uMode, 0, ls * sz, c.dc - R, c.dc + R);
        this.drawI(gl.TRIANGLE_STRIP, 4, this.nl); calls++;
        if (v.hidden && v.xray && v.q < 3) {
          gl.depthFunc(gl.GREATER);
          gl.uniform4f(u.uMode, 1, 1, c.dc - R, c.dc + R);
          this.drawI(gl.TRIANGLE_STRIP, 4, this.nl); calls++;
          gl.depthFunc(gl.LEQUAL);
        }
        this.unbindDiv();
      }
      /* 8 points: flows, pins, spheres */
      if (this.np) {
        u = this.use('p', v, pal);
        gl.uniform3fv(u.uBR, c.right); gl.uniform3fv(u.uBU, c.up); gl.uniform3fv(u.uBD, c.dir);
        gl.uniform3fv(u.uPL, c.light); gl.uniform3fv(u.uPF, c.fill); gl.uniform3fv(u.uPSky, lit.sky); gl.uniform3fv(u.uPGnd, lit.gnd);
        gl.uniform3fv(u.uPKey, lit.key); gl.uniform3fv(u.uPFill, lit.fill); gl.uniform4fv(u.uPK, P.LIGHT.K);
        this.bind([[this.bQuadP, 2, 2, 0, 0], [this.bP, 3, PS, 0, 1], [this.bP, 4, PS, 3, 1], [this.bP, 2, PS, 7, 1]]);
        this.drawI(gl.TRIANGLE_STRIP, 4, this.np); calls++;
        this.unbindDiv();
      }
      gl.depthMask(true);
      v.calls = calls;
    },
    lose: function () { if (this.lx && !this.lost) this.lx.loseContext(); },
    restore: function () { if (this.lx && this.lost) this.lx.restoreContext(); },
    destroy: function (quiet) {
      var c = this.v.canvas;
      c.removeEventListener('webglcontextlost', this._onLost, false);
      c.removeEventListener('webglcontextrestored', this._onRest, false);
      try { if (this.lx && !this.lost) this.lx.loseContext(); } catch (e) {}
      this.lost = true; this.list = null;
    }
  };
  P._R.gl = function (v) { var r = new GLR(v); return r.gl && !r.lost ? r : null; };
})();
