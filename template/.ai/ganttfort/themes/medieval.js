// Thema „Mittelalter“ für die Projektwelt
// Aktivieren: in world.json → "meta": { "thema": "mittelalter" }   ·   Ausprobieren: world.html?theme=medieval
// Aufbau und alle Möglichkeiten: themes/_template.js
(function(){
"use strict";
const P={ stein:0xbdb3a2, stein2:0x9d9384, stein3:0x7c7468, holz:0x7c5738, holz2:0x5e4029, balken:0x3b281a, putz:0xeadfc6, putz2:0xe2cfa6,
  dach:0xa6452f, dach2:0x7a4a36, reet:0xb39556, schiefer:0x4b505c, gold:0xe3b556, eisen:0x4d4d55, glut:0xff9a3a, fenster:0xffc870,
  tuch:0xa8322a, tuch2:0x2f5a8a, tuch3:0xe8e0cc, feld:0x7a6a3a, feld2:0x8f9a48, wasser:0x2f6f86 };

// ---------- kleine Bauteile ----------
let dachG=null;
function dachGeo(H){ if(dachG) return dachG; const s=new H.THREE.Shape(); s.moveTo(-.5,0); s.lineTo(.5,0); s.lineTo(0,1); s.lineTo(-.5,0);
  dachG=new H.THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false}).translate(0,0,-.5); return dachG; }
function giebel(H,g,x,y,z,w,h,d,farbe,ry=0){ const m=H.mesh(dachGeo(H),farbe,w,h,d,x,y,z,ry); g.add(m); return m; }
// ---------- Hausbau: Farbschema und Bauteile ----------
// Putz in warmen Kalktönen, Fachwerk von Eiche bis Ochsenblut, Dächer aus Ziegel, Schiefer oder Reet, Fensterläden in gedeckten Farben
const PUTZE=[0xeadfc6,0xe7d2a6,0xe6cbbb,0xdedfc8,0xf1ece2,0xd4dcd8,0xe9d9b4];
const BALKEN=[0x3b281a,0x4e3220,0x6a2c22,0x2f2a27,0x5a3e28];
const ZIEGEL=[0xa6452f,0x934030,0xb5583a,0x8a4a36];
const DAECHER=[...ZIEGEL,0x4f5562,0x5c6370,0xb39556];
const LAEDEN=[0x3f6b4a,0x34587a,0x8a3a2a,0x6b5a3a,0x2f4f5a];
const ton=(H,r,c,k=.08)=>H.mix(c,r()<.5?0x000000:0xffffff,r()*k);
function schraeg(H,g,farbe,x1,y1,x2,y2,z,seite){            // schräger Balken zwischen zwei Punkten auf einer Wand (seite: Wand quer zur z- bzw. x-Achse)
  const l=Math.hypot(x2-x1,y2-y1), a=Math.atan2(y2-y1,x2-x1);
  if(seite==="z") g.add(H.mesh(H.GEO.box,farbe,l,.006,.004,(x1+x2)/2,(y1+y2)/2,z,0,0,a));
  else g.add(H.mesh(H.GEO.box,farbe,l,.006,.004,z,(y1+y2)/2,(x1+x2)/2,Math.PI/2,0,a));
}
function fachwerk(H,g,w,d,y0,h,holz,muster,r){              // Ständer, Riegel und Streben auf allen vier Seiten
  const wand=(laenge,flaeche,seite)=>{
    const n=Math.max(2,Math.round(laenge/.075)), pw=laenge/n, yr=y0+h*.45;
    [-1,1].forEach(sd=>{ const z=sd*(flaeche/2+.002);
      for(let i=0;i<=n;i++){ const x=-laenge/2+i*pw; if(seite==="z") H.box(g,holz,.008,h,.004,x,y0,z); else H.box(g,holz,.004,h,.008,z,y0,x); }
      if(seite==="z"){ H.box(g,holz,laenge,.008,.004,0,y0,z); H.box(g,holz,laenge,.008,.004,0,y0+h-.008,z); H.box(g,holz,laenge,.006,.004,0,yr,z); }
      else { H.box(g,holz,.004,.008,laenge,z,y0,0); H.box(g,holz,.004,.008,laenge,z,y0+h-.008,0); H.box(g,holz,.004,.006,laenge,z,yr,0); }
      for(let i=0;i<n;i++){ const xa=-laenge/2+i*pw, xb=xa+pw;
        if(muster===0&&(i===0||i===n-1)){ const a=i===0; schraeg(H,g,holz,a?xa:xb,yr,a?xb:xa,y0+h-.008,z,seite); schraeg(H,g,holz,a?xa:xb,yr,a?xb:xa,y0,z,seite); }   // „Mann“ an den Ecken
        if(muster===1&&i%2===0){ schraeg(H,g,holz,xa,y0,xb,yr,z,seite); schraeg(H,g,holz,xa,yr,xb,y0,z,seite); }                                                // Andreaskreuz unter den Fenstern
        if(muster===2){ i%2?schraeg(H,g,holz,xa,y0,xb,yr,z,seite):schraeg(H,g,holz,xa,yr,xb,y0,z,seite); }                                                       // Streben im Wechsel (Brüstung)
      }
    });
    return {n,pw};
  };
  return {front:wand(w,d,"z"), seite:wand(d,w,"x")};
}
function fenster(H,g,x,y,z,o){                               // Rahmen, Sprossenkreuz, Läden, manchmal Blumenkasten
  const r=o.r, an=o.licht!==false&&r()<.75;
  H.box(g,o.holz,.03,.034,.004,x,y-.017,z);
  (an?H.gbox:H.box)(g,an?P.fenster:0x2b2f38,.022,.026,.003,x,y-.013,z+.0025);
  H.box(g,o.holz,.003,.026,.002,x,y-.013,z+.004); H.box(g,o.holz,.022,.003,.002,x,y-.001,z+.004);
  if(o.laeden){ [-1,1].forEach(sd=>g.add(H.mesh(H.GEO.box,o.laden,.012,.03,.003,x+sd*.024,y,z+.006,sd*.5))); }
  if(o.blumen&&r()<.5){ H.box(g,P.holz2,.032,.008,.01,x,y-.024,z+.006); for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.ico,H.pick(r,[0xc8402f,0xe0a030,0xd06a9a,0xf0e8d8]),.006,.006,.006,x-.01+i*.01,y-.013,z+.008)); }
}
const fensterFeld=(i,n,m)=>n<3?true:m===0?(i>0&&i<n-1):m===1?i%2===1:true;
function haus(H,g,x,z,w,d,h,o={}){
  const r=o.r||H.rng("haus"+x.toFixed(3)+z.toFixed(3)+w.toFixed(3)+h.toFixed(3)+(o.ry||0));
  const grp=new H.THREE.Group(); grp.position.set(x,0,z); grp.rotation.y=o.ry||0; g.add(grp);
  const putz=o.wand==null||o.wand===P.putz||o.putz!=null, fw=o.fachwerk!==false&&putz;
  const wand=o.putz!=null?o.putz:putz?ton(H,r,o.wand==null?H.pick(r,PUTZE):(r()<.5?P.putz:H.pick(r,PUTZE)),.05):o.wand;   // o.putz: feste Putzfarbe (Fachwerk bleibt)
  const dach=ton(H,r,o.dach??H.pick(r,DAECHER),.1), holz=o.balken??H.pick(r,BALKEN), laden=o.laden??H.pick(r,LAEDEN), S=.02;
  const muster=Math.floor(r()*3);
  H.box(grp,o.sockel??ton(H,r,P.stein2,.06),w+.012,S,d+.012,0,0,0);
  let ww=w, dd=d;
  const zwei=fw&&h>=.12&&r()<.7;
  if(zwei){                                                   // Erdgeschoss aus Stein, Obergeschoss als vorkragendes Fachwerk
    const h1=h*.46, h2=h-h1-.01, k=.012;
    H.box(grp,r()<.6?ton(H,r,P.stein,.06):wand,w,h1,d,0,S,0);
    for(let i=0;i<4;i++){ const sx=i%2?1:-1, sz=i<2?1:-1; H.box(grp,P.stein2,.016,h1,.016,sx*(w/2-.006),S,sz*(d/2-.006)); }   // Eckquader
    H.box(grp,holz,w+2*k,.01,d+2*k,0,S+h1,0);                                                   // Stockwerksschwelle
    for(let i=0;i<Math.round(w/.05);i++) H.box(grp,holz,.008,.006,.014,-w/2+(i+.5)*w/Math.round(w/.05),S+h1-.006,d/2+.006);   // Balkenköpfe
    ww=w+2*k; dd=d+2*k;
    H.box(grp,wand,ww,h2,dd,0,S+h1+.01,0);
    const F=fachwerk(H,grp,ww,dd,S+h1+.01,h2,holz,muster,r);
    for(let i=0;i<F.front.n;i++) if(fensterFeld(i,F.front.n,muster)){ const fx=-ww/2+(i+.5)*F.front.pw; fenster(H,grp,fx,S+h1+.01+h2*.82,dd/2+.002,{r,holz,laden,laeden:true,blumen:true}); }
    for(let i=0;i<Math.max(1,Math.round(w/.1));i++){ const fx=-w/2+(i+.5)*w/Math.max(1,Math.round(w/.1)); if(Math.abs(fx-(o.tuerX??0))>.04) fenster(H,grp,fx,S+h1*.8,d/2+.002,{r,holz,laden,laeden:r()<.5}); }
  }else{
    H.box(grp,wand,w,h,d,0,S,0);
    if(fw){ const F=fachwerk(H,grp,w,d,S,h,holz,muster,r);
      for(let i=0;i<F.front.n;i++) if(fensterFeld(i,F.front.n,muster)){ const fx=-w/2+(i+.5)*F.front.pw; if(Math.abs(fx-(o.tuerX??0))>.035) fenster(H,grp,fx,S+h*.85,d/2+.002,{r,holz,laden,laeden:r()<.6,blumen:true}); } }
    else{ const nf=o.fenster??Math.max(1,Math.round(w/.09));
      for(let i=0;i<nf;i++){ const fx=-w/2+(i+.5)*w/nf; if(Math.abs(fx-(o.tuerX??0))<.035) continue; fenster(H,grp,fx,S+h*.75,d/2+.002,{r,holz:P.balken,laden,laeden:false}); } }
  }
  // Tür mit Rahmen und Trittstein
  const tx=o.tuerX??0, th=Math.min(.07,(zwei?h*.46:h)*.6);
  H.box(grp,P.stein2,.044,.006,.02,tx,0,d/2+.01); H.box(grp,holz,.04,th+.008,.004,tx,S,d/2+.002);
  H.box(grp,ton(H,r,P.holz,.15),.03,th,.004,tx,S,d/2+.004); H.gbox(grp,0xffd08a,.004,.004,.002,tx+.01,S+th*.5,d/2+.007);
  // Dach: giebel- oder traufständig, mit Überstand, Ziegelreihen und First
  const traufe=r()<.45, dh=(o.dachH??Math.max(.075,h*.75))*(.9+r()*.3), dw=(traufe?dd:ww)*1.16+.02, dl=(traufe?ww:dd)*1.1+.02, yd=S+h, rot=traufe?Math.PI/2:0;
  giebel(H,grp,0,yd,0,dw,dh,dl,dach,rot);
  const dunkel=H.mix(dach,0x000000,.28), hell=H.mix(dach,0xffffff,.12);
  for(let k=1;k<=3;k++){ const u=k/4, hx=dw/2*(1-u), y=yd+dh*u;
    [-1,1].forEach(sd=>{ const m=H.mesh(H.GEO.box,k%2?dunkel:hell,.005,.004,dl*.99,sd*hx,y,0); if(traufe){ m.position.set(0,y,sd*hx); m.scale.set(dl*.99,.004,.005); } grp.add(m); }); }
  { const f=H.mesh(H.GEO.box,dunkel,traufe?dl:.012,.01,traufe?.012:dl,0,yd+dh,0); grp.add(f); }
  // Giebeldreiecke in Wandfarbe, vorn mit Fachwerk und kleinem Fenster
  if(traufe) [-1,1].forEach(sd=>giebel(H,grp,sd*(dl/2+.001),yd,0,dw*.84,dh*.84,.004,wand,Math.PI/2));
  else{ giebel(H,grp,0,yd,dl/2+.001,dw*.84,dh*.84,.004,wand,0); giebel(H,grp,0,yd,-dl/2-.001,dw*.84,dh*.84,.004,wand,0);
    const gy=yd+.004, gz=dl/2+.004;
    if(fw){ H.box(grp,holz,.006,dh*.7,.004,0,gy,gz); schraeg(H,grp,holz,-dw*.3,gy,0,gy+dh*.62,gz,"z"); schraeg(H,grp,holz,dw*.3,gy,0,gy+dh*.62,gz,"z"); }
    if(dh>.07) fenster(H,grp,-.032,gy+dh*.4,gz,{r,holz,laden,laeden:false,licht:r()<.6});
  }
  if(traufe&&r()<.6&&ww>.18){                                 // Dachgaube auf der Vorderseite
    const gx=(r()-.5)*ww*.4, gz=dd*.3, gy=yd+dh*.3;
    H.box(grp,wand,.045,.04,.04,gx,gy,gz); giebel(H,grp,gx,gy+.04,gz,.06,.035,.05,dach,0); H.gbox(grp,P.fenster,.018,.02,.003,gx,gy+.01,gz+.021);
  }
  if(o.kamin||r()<.45){ const kx=(traufe?ww*.25:dw*.18)*(r()<.5?-1:1), kz=-dl*.15;
    H.box(grp,ton(H,r,P.stein3,.1),.032,dh*.85+.03,.032,kx,yd+dh*.35,kz); H.box(grp,P.stein2,.04,.008,.04,kx,yd+dh*1.2+.02,kz);
    if(o.rauch||r()<.3) H.rauch(grp,kx,kz,.3,.8,0x8a8a8a,yd+dh*1.25+.03); }
  if(!o.schlicht&&r()<.35){                                   // Anbau mit Pultdach
    const sx=(r()<.5?-1:1)*(ww/2+.035), aw=.07, ad=dd*.6, ah=Math.min(.07,h*.5);
    H.box(grp,ton(H,r,P.holz,.12),aw,ah,ad,sx,0,-dd*.1); grp.add(H.mesh(H.GEO.box,dach,aw+.02,.008,ad+.02,sx,ah+.012,-dd*.1,0,0,sx>0?-.35:.35));
    fass(H,grp,sx,-dd*.1+ad/2+.025);
  }
  if(!o.schlicht&&r()<.3){                                    // Zunftschild an einem Ausleger
    const sx=ww/2-.01, sy=S+(zwei?h*.46:h*.6); H.box(grp,P.eisen,.004,.004,.05,sx,sy,dd/2+.025);
    grp.add(H.mesh(H.GEO.box,H.pick(r,[P.gold,P.tuch,P.tuch2]),.004,.03,.034,sx,sy-.02,dd/2+.04)); }
  if(!o.schlicht&&r()<.4) { const bx=-(ww/2)+.03; H.box(grp,P.holz,.05,.006,.014,bx,.016,d/2+.02); [-1,1].forEach(sd=>H.box(grp,P.holz2,.004,.016,.012,bx+sd*.02,0,d/2+.02)); }   // Bank vorm Haus
  return grp;
}
function turm(H,g,x,z,r,h,o={}){
  const farbe=o.farbe??P.stein, grp=new H.THREE.Group(); grp.position.set(x,0,z); g.add(grp);
  grp.add(H.mesh(new H.THREE.CylinderGeometry(r*.95,r*1.05,h,o.seiten??10),farbe,1,1,1,0,h/2,0));
  for(let k=0;k<Math.max(1,Math.floor(h/.14));k++){ const a=k*1.9; H.box(grp,0x2a2420,.012,.03,.004,Math.sin(a)*r*.98,.06+k*.12,Math.cos(a)*r*.98,a); }
  if(o.dach==="zinnen"){
    grp.add(H.mesh(new H.THREE.CylinderGeometry(r*1.12,r*1.02,.035,o.seiten??10),farbe,1,1,1,0,h+.017,0));
    for(let i=0;i<8;i++){ const a=i/8*6.283; H.box(grp,farbe,r*.32,.035,r*.18,Math.sin(a)*r*1.02,h+.035,Math.cos(a)*r*1.02,a); }
  }else{
    grp.add(H.mesh(H.GEO.cone8,o.dachFarbe??P.schiefer,r*1.25,o.dachH??r*2.2,r*1.25,0,h+(o.dachH??r*2.2)/2,0));
  }
  return grp;
}
function fahne(H,g,x,y,z,farbe,groesse=1){
  H.box(g,P.holz2,.006,.2*groesse,.006,x,y,z);
  const f=H.mesh(H.GEO.box,farbe,.09*groesse,.055*groesse,.003,x+.045*groesse,y+.2*groesse-.03*groesse,z); g.add(f);
  H.anim(f,(t)=>{ f.rotation.y=Math.sin(t*2.2+x*9)*.25; });
  return f;
}
function fass(H,g,x,z){ g.add(H.mesh(H.GEO.cyl8,P.holz,.022,.05,.022,x,.025,z)); H.box(g,P.eisen,.046,.004,.046,x,.034,z); }
function kiste(H,g,x,z,ry=0){ H.box(g,P.holz,.045,.035,.045,x,0,z,ry); H.box(g,P.holz2,.047,.006,.047,x,.03,z,ry); }
function heu(H,g,x,z){ g.add(H.mesh(H.GEO.cyl8,0xcaa95a,.035,.04,.035,x,.02,z,0,Math.PI/2)); }
function zaun(H,g,pkte){ for(let i=0;i<pkte.length-1;i++){ const [a,b]=pkte[i], [c,d]=pkte[i+1], l=Math.hypot(c-a,d-b), w=-Math.atan2(d-b,c-a);
  H.box(g,P.holz2,.008,.05,.008,a,0,b); [.02,.04].forEach(y=>g.add(H.mesh(H.GEO.box,P.holz,l,.006,.006,(a+c)/2,y,(b+d)/2,w))); }
  const [e,f]=pkte[pkte.length-1]; H.box(g,P.holz2,.008,.05,.008,e,0,f); }
// Äcker: je Feld eine Kultur mit eigener Farbe, feine Furchen, jede Reihe leicht anders getönt
const KULTUREN=[
  {art:"weizen", boden:0x6a5434, reihe:[0xc9a54a,0xd6b458,0xbf983f], hoch:.022, w:3},
  {art:"gerste", boden:0x6a5836, reihe:[0xb9b25c,0xc8c26c,0xaaa452], hoch:.02,  w:2},
  {art:"jung",   boden:0x5e4a2e, reihe:[0x6f9a4a,0x7fae58,0x62904a], hoch:.012, w:3},
  {art:"raps",   boden:0x5f4c30, reihe:[0xe3c93c,0xefd955,0xd4bb33], hoch:.024, w:1},
  {art:"flachs", boden:0x5f4c30, reihe:[0x7d86c8,0x9097d2,0x6f78b8], hoch:.018, w:1},
  {art:"mohn",   boden:0x5f4c30, reihe:[0x7fa04e,0x86a656],           hoch:.016, w:1, tupfen:0xc8402f},
  {art:"kohl",   boden:0x5a4630, tupfen:0x4f7a4a,                       hoch:.004, w:2},
  {art:"stoppel",boden:0x7a6440, reihe:[0xb59a5a,0xa98e50],           hoch:.006, w:2, garben:true},
  {art:"brache", boden:0x5d4830, reihe:[0x6b5334,0x735a38,0x644d31], hoch:.005, w:2}
];
function kulturWahl(r){ const s=KULTUREN.reduce((a,k)=>a+k.w,0); let x=r()*s; for(const k of KULTUREN){ if((x-=k.w)<0) return k; } return KULTUREN[0]; }
function acker(H,g,x,z,w,d,ry=0,r){
  r=r||H.rng("acker"+x.toFixed(3)+z.toFixed(3)+w.toFixed(3));
  const K=kulturWahl(r), ton=(c,s=.1)=>H.mix(c,r()<.5?0x000000:0xffffff,r()*s);
  const grp=new H.THREE.Group(); grp.position.set(x,0,z); grp.rotation.y=ry; g.add(grp);
  H.box(grp,ton(K.boden,.08),w+.02,.006,d+.02,0,0,0);                                         // Ackerboden mit Rand
  const n=Math.max(7,Math.min(16,Math.round(d/.024))), s=d/n;
  if(K.reihe) for(let i=0;i<n;i++){                                                            // Furchen: Höhe und Ton wechseln leicht
    const h=K.hoch*(.8+r()*.4), c=ton(H.pick(r,K.reihe),.12), zz=-d/2+(i+.5)*s;
    H.box(grp,c,w*(.96+r()*.04),h,s*.62,(r()-.5)*.006,.006,zz);
  }
  if(K.tupfen){ const nx=Math.max(4,Math.round(w/.04));                                         // Kohlköpfe bzw. Mohnblüten
    for(let i=0;i<n;i+=K.art==="kohl"?1:2) for(let j=0;j<nx;j++){ if(K.art==="mohn"&&r()<.55) continue;
      const px=-w/2+(j+.5)*w/nx+(r()-.5)*.008, pz=-d/2+(i+.5)*s, gr=K.art==="kohl"?.016+r()*.006:.007;
      grp.add(H.mesh(H.GEO.ico,ton(K.tupfen,.15),gr,gr*.8,gr,px,.006+(K.art==="kohl"?gr*.5:K.hoch+.004),pz,r()*3)); } }
  if(K.garben) for(let i=0;i<3+Math.floor(r()*3);i++){                                          // Garben auf dem Stoppelfeld
    grp.add(H.mesh(H.GEO.cone6,ton(0xd2b060,.1),.022,.05,.022,(r()-.5)*w*.8,.03,(r()-.5)*d*.8,r()*3)); }
}
function mauer(H,g,x1,z1,x2,z2,h,farbe=P.stein){ const l=Math.hypot(x2-x1,z2-z1), w=-Math.atan2(z2-z1,x2-x1), mx=(x1+x2)/2, mz=(z1+z2)/2;
  g.add(H.mesh(H.GEO.box,farbe,l,h,.04,mx,h/2,mz,w));
  const n=Math.max(2,Math.round(l/.05)); for(let k=0;k<n;k+=2){ const u=(k+.5)/n-.5; g.add(H.mesh(H.GEO.box,farbe,l/n,.025,.045,mx+Math.cos(-w)*u*l,h+.012,mz+Math.sin(-w)*u*l,w)); } }
function fackel(H,g,x,y,z){ H.box(g,P.holz2,.006,.05,.006,x,y,z); const h=H.halo(g,x,y+.06,z,.12,0xffa040,.8); H.gbox(g,P.glut,.012,.014,.012,x,y+.05,z);
  H.anim(h,(t)=>{ h.material.opacity=.6+.25*Math.sin(t*13+x*20)*Math.sin(t*7.3); }); }
function luftschiff(H,k=1){                           // Luftschiff mit Stoffhülle, Spanten, Holzgondel und Steuersegeln (Nase nach +z)
  const s=new H.THREE.Group(), g=new H.THREE.Group(); g.scale.setScalar(k); s.add(g);
  g.add(H.mesh(new H.THREE.SphereGeometry(1,18,10),P.tuch3,.07,.07,.2,0,0,0));
  for(let i=-3;i<=3;i++){ const z=i*.05, rr=.07*Math.sqrt(Math.max(0,1-(z/.2)*(z/.2))); const sp=new H.THREE.Mesh(H.GEO.torus,H.M(i%2?P.tuch:P.holz2)); sp.scale.set(rr*1.01,rr*1.01,.06); sp.position.z=z; g.add(sp); }
  for(let i=0;i<4;i++){ const fl=new H.THREE.Group(); fl.rotation.z=i*Math.PI/2; fl.position.z=-.17; g.add(fl); fl.add(H.mesh(H.GEO.box,P.tuch,.004,.06,.07,0,.06,0)); }
  [-1,1].forEach(sd=>g.add(H.mesh(H.GEO.box,P.balken,.003,.05,.003,sd*.02,-.07,.01)));
  H.box(g,P.holz2,.045,.025,.1,0,-.105,.01); H.box(g,P.holz,.05,.004,.105,0,-.08,.01);
  H.gbox(g,P.fenster,.046,.006,.02,0,-.095,.05);
  const fl=H.mesh(H.GEO.box,P.tuch,.003,.02,.035,0,.08,-.12); g.add(fl);
  const rad=new H.THREE.Group(); rad.position.set(0,-.09,-.05); g.add(rad);
  for(let i=0;i<4;i++) rad.add(H.mesh(H.GEO.box,P.holz,.004,.04,.006,0,0,0,0,0,i*Math.PI/4));
  H.anim(rad,(t)=>{ rad.rotation.z=t*6; fl.rotation.y=Math.sin(t*2.5+s.id)*.3; });
  return s;
}
function figur(H,g,x,z,farbe,ry=0){ const f=new H.THREE.Group(); f.position.set(x,0,z); f.rotation.y=ry; g.add(f);
  H.box(f,P.balken,.014,.03,.01,0,0,0); H.box(f,farbe,.02,.03,.014,0,.03,0); f.add(H.mesh(H.GEO.ico,0xe0b89a,.009,.009,.009,0,.07,0)); return f; }

// Satteldach aus zwei Flächen (First entlang x): offen unter dem Überstand, Windbretter an den Giebeln, Streifen, First
function satteldach(H,k,y,dw,dh,dl,dach,holz,streifen=true){
  const hl=Math.hypot(dw/2,dh), neig=Math.atan2(dh,dw/2), dunkel=H.mix(dach,0x000000,.28), hell=H.mix(dach,0xffffff,.1);
  [-1,1].forEach(sd=>{ k.add(H.mesh(H.GEO.box,dach,dl,.01,hl,0,y+dh/2,sd*dw/4,0,sd*neig,0));
    if(streifen) for(let q=1;q<=3;q++){ const u=q/4; k.add(H.mesh(H.GEO.box,q%2?dunkel:hell,dl*.995,.004,.006,0,y+dh*u+.0065,sd*dw/2*(1-u),0,sd*neig,0)); }
    [-1,1].forEach(e=>k.add(H.mesh(H.GEO.box,holz,.006,.016,hl+.004,e*(dl/2+.003),y+dh/2-.002,sd*dw/4,0,sd*neig,0))); });
  H.box(k,dunkel,dl+.008,.012,.02,0,y+dh-.006,0);
}
// Sauberes Fachwerkhaus (traufständig, eingeschossig mit hohem Dach): Felder klar geordnet, Streben nur in den Eckfeldern, Fenster nur in freien Feldern
function fachwerkhaus(H,g,x,z,ry,o){
  const k=new H.THREE.Group(); k.position.set(x,0,z); k.rotation.y=ry; g.add(k);
  const W=o.w||.3, D=o.d||.18, HW=o.h||.12, S=.016, DH=o.dachH||.13, T=.007, holz=o.balken, putz=o.putz;
  H.box(k,ton(H,o.r,P.stein2,.05),W+.012,S,D+.012,0,0,0);                                          // Steinsockel
  H.box(k,putz,W,HW,D,0,S,0);
  const y0=S, yR=S+HW*.42, yT=S+HW, nF=5, pw=W/nF, nS=3, ps=D/nS;
  const balk=(x1,y1,x2,y2,z,quer)=>{ const l=Math.hypot(x2-x1,y2-y1)-T*.6, a=Math.atan2(y2-y1,x2-x1);   // Strebe exakt zwischen zwei Punkten, ohne Überstand
    if(!quer) k.add(H.mesh(H.GEO.box,holz,l,T*.8,.004,(x1+x2)/2,(y1+y2)/2,z,0,0,a)); else k.add(H.mesh(H.GEO.box,holz,l,T*.8,.004,z,(y1+y2)/2,(x1+x2)/2,Math.PI/2,0,a)); };
  // Längsseiten: Schwelle, Brüstungsriegel, Rähm, Ständer; Eckfelder mit Strebe, Mitte Tür (nur vorn), sonst Fenster
  [-1,1].forEach(sd=>{ const zf=sd*(D/2+.002);
    [y0,yR-T/2,yT-T].forEach(y=>H.box(k,holz,W+.004,T,.004,0,y,zf));
    for(let i=0;i<=nF;i++) H.box(k,holz,T,HW,.004,-W/2+i*pw,y0,zf);
    for(let i=0;i<nF;i++){ const xa=-W/2+i*pw, xb=xa+pw, xm=(xa+xb)/2;
      if(i===0) balk(xa+T/2,y0+T,xb-T/2,yT-T,zf); else if(i===nF-1) balk(xb-T/2,y0+T,xa+T/2,yT-T,zf);
      else if(sd>0&&i===2){ H.box(k,ton(H,o.r,P.holz,.12),pw-T*2,HW*.62,.004,xm,y0+T,zf+sd*.001); H.box(k,P.eisen,.004,.004,.002,xm+pw*.25,y0+HW*.3,zf+sd*.003); }
      else { const wy=yR+(yT-yR)*.5, fw=pw*.5, fh=(yT-yR)*.62;                                       // Fenster mit Kreuz und Läden
        (sd>0?H.gbox:H.box)(k,sd>0?P.fenster:0x2b2f38,fw,fh,.003,xm,wy-fh/2,zf+sd*.001);
        H.box(k,holz,fw,.003,.004,xm,wy-.0015,zf+sd*.002); H.box(k,holz,.003,fh,.004,xm,wy-fh/2,zf+sd*.002);
        [-1,1].forEach(s=>H.box(k,o.laden,fw*.55,fh,.003,xm+s*(fw*.5+fw*.28),wy-fh/2,zf+sd*.002));
        if(sd>0){ H.box(k,P.holz2,fw*1.2,.006,.012,xm,yR+.002,zf+.006); for(let b=0;b<3;b++) k.add(H.mesh(H.GEO.ico,H.pick(o.r,[0xc8402f,0xe0a030,0xd06a9a]),.005,.005,.005,xm-fw*.4+b*fw*.4,yR+.01,zf+.006)); } } } });
  // Giebelseiten: Rähm, Ständer, Riegel, Eckstreben
  [-1,1].forEach(sd=>{ const xf=sd*(W/2+.002);
    [y0,yR-T/2,yT-T].forEach(y=>H.box(k,holz,.004,T,D+.004,xf,y,0));
    for(let i=0;i<=nS;i++) H.box(k,holz,.004,HW,T,xf,y0,-D/2+i*ps);
    balk(-D/2+T/2,y0+T,-D/2+ps-T/2,yT-T,xf,true); balk(D/2-T/2,y0+T,D/2-ps+T/2,yT-T,xf,true);
    const wy=yR+(yT-yR)*.5, fw=ps*.45, fh=(yT-yR)*.6; H.gbox(k,P.fenster,.003,fh,fw,xf+sd*.001,wy-fh/2,0); H.box(k,holz,.004,.003,fw,xf+sd*.002,wy,0);
    // Giebeldreieck in Putz mit Stuhlsäule, zwei Streben und Giebelfenster
    giebel(H,k,xf,yT,0,D,DH*.92,.004,putz,Math.PI/2);
    H.box(k,holz,.004,T,D+.004,xf+sd*.001,yT,0);
    H.box(k,holz,.004,DH*.8,T,xf+sd*.002,yT,0);
    balk(-D*.36,yT+T,0,yT+DH*.55,xf+sd*.002,true); balk(D*.36,yT+T,0,yT+DH*.55,xf+sd*.002,true);
    H.gbox(k,P.fenster,.003,.022,.016,xf+sd*.003,yT+DH*.2,0); });
  // Dach mit Überstand, Ziegel-/Reetstreifen, First, Kamin
  const dw=D*1.3+.02, dl=W*1.12+.02;
  satteldach(H,k,yT,dw,DH,dl,o.dach,holz);
  const kx=W*.22; H.box(k,P.stein3,.035,DH+.05,.035,kx,yT+DH*.3,-.02); H.box(k,P.stein2,.042,.01,.042,kx,yT+DH*1.05+.03,-.02);
  H.rauch(k,kx,-.02,.25,.5,0x8a8a8a,yT+DH+.09);
  H.box(k,P.holz,.07,.006,.016,-W*.25,.02,D/2+.022); [-1,1].forEach(s=>H.box(k,P.holz2,.004,.018,.012,-W*.25+s*.028,0,D/2+.022));   // Bank vorm Haus
  return k;
}
// Apfelbaum: Stamm, runde Krone, Äpfel auf der Kronenoberfläche
function apfelbaum(H,g,x,z,s,r){
  g.add(H.mesh(H.GEO.cyl8,0x5a4232,.012*s,.14*s,.012*s,x,.07*s,z));
  [[0,.17,0,.085],[.04,.15,.03,.06],[-.04,.155,-.02,.06]].forEach(([dx,dy,dz,rr])=>g.add(H.mesh(H.GEO.ico,H.mix(0x4a7a48,0x3a6a3a,r()),rr*s,rr*s*.85,rr*s,x+dx*s,dy*s,z+dz*s,r()*3)));
  for(let i=0;i<9;i++){ const a=r()*6.283, b=(r()-.3)*1.2, R=.083*s; g.add(H.mesh(H.GEO.ico,H.pick(r,[0xc8402f,0xb83228,0xd8a030]),.008*s,.008*s,.008*s,x+Math.cos(a)*Math.cos(b)*R,.17*s+Math.sin(b)*R*.85,z+Math.sin(a)*Math.cos(b)*R)); }
  for(let i=0;i<2;i++) g.add(H.mesh(H.GEO.ico,0xc8402f,.008,.008,.008,x+(r()-.5)*.12,.006,z+(r()-.5)*.12));   // Fallobst
}
// ---------- Gebäude je Aufgabentyp ----------
const bau={
  feature(g,r,H){                                     // Gehöft: Fachwerk-Wohnhaus, große Scheune, Hof mit Brunnen, Misthaufen, Hühnern, Schweinekoben, Gemüsegarten mit Flechtzaun.
                                                      // Eine feste Form; je Exemplar andere Farben (Putz, Balken, Dach, Läden, Scheunenholz).
    const putz=H.pick(r,PUTZE), balken=H.pick(r,BALKEN), dach=H.pick(r,[P.reet,P.reet,...ZIEGEL]), laden=H.pick(r,LAEDEN);
    const holz=H.pick(r,[0x7c5738,0x6a4a30,0x8a6a48,0x5e4a3a]), scheunenDach=H.pick(r,[P.reet,0x7a4a36,0x8a4a36]), ERDE=0x7a6a50;
    const fest=H.rng("gehoeft-form");                                                                // Form immer gleich, nur Farben wechseln
    H.box(g,H.mix(ERDE,0x000000,.1),.36,.004,.26,.06,.002,.08,.1);                                  // festgetretener Hof
    // Wohnhaus
    fachwerkhaus(H,g,-.15,-.13,.15,{r,putz,balken,dach,laden});
    for(let i=0;i<5;i++) g.add(H.mesh(H.GEO.cyl8,ton(H,r,P.holz,.1),.012,.12,.012,-.33,.012+(i<3?0:.022),-.05+(i<3?i*.024:(i-3)*.024+.012),0,Math.PI/2,0));   // Holzstapel an der Giebelseite
    H.box(g,P.holz2,.03,.025,.03,-.26,0,.06); g.add(H.mesh(H.GEO.box,P.eisen,.004,.03,.012,-.255,.04,.06,0,0,.5));   // Hackklotz mit Axt
    // Scheune: Bohlenwände, großes Doppeltor mit Andreaskreuz, Heuluke, Pultdach-Anbau
    const sc=new H.THREE.Group(); sc.position.set(.27,0,-.12); sc.rotation.y=-.55; g.add(sc);
    const SW=.26, SD=.18, SH=.12;
    H.box(sc,P.stein3,SW+.01,.012,SD+.01,0,0,0); H.box(sc,holz,SW,SH,SD,0,.012,0);
    for(let i=0;i<9;i++) H.box(sc,H.mix(holz,0x000000,.25),.002,SH,.002,-SW/2+.015+i*.029,.012,SD/2+.001);
    satteldach(H,sc,.012+SH,SD+.05,.12,SW+.04,scheunenDach,H.mix(holz,0x000000,.3),false);
    H.box(sc,H.mix(holz,0x000000,.35),.09,.09,.004,0,.012,SD/2+.003);                                // Tor
    [-1,1].forEach(sd=>{ sc.add(H.mesh(H.GEO.box,H.mix(holz,0x000000,.15),.004,.11,.003,sd*.022,.057,SD/2+.006,0,0,sd*.75)); });
    H.box(sc,P.eisen,.003,.09,.004,0,.012,SD/2+.006);
    [-1,1].forEach(e=>{ giebel(H,sc,e*(SW/2+.001),.012+SH,0,SD,.11,.004,holz,Math.PI/2);            // Giebelwände aus Bohlen
      for(let i=0;i<5;i++){ const zz=-SD/2+.03+i*.03; H.box(sc,H.mix(holz,0x000000,.25),.004,.1*(1-Math.abs(zz)/(SD/2)),.002,e*(SW/2+.003),.012+SH,zz); } });
    H.box(sc,0x2a2018,.004,.035,.04,SW/2+.004,.15,0); H.box(sc,0xcaa95a,.006,.014,.034,SW/2+.005,.15,0);   // Heuluke im Giebel mit Heu
    H.box(sc,P.holz2,.06,.006,.006,SW/2+.03,.2,0); H.box(sc,P.balken,.002,.05,.002,SW/2+.055,.15,0);     // Aufzugsbalken mit Seil
    sc.add(H.mesh(H.GEO.box,scheunenDach,.1,.008,SD+.03,-SW/2-.045,.09,0,0,0,-.35)); [-1,1].forEach(sd=>H.box(sc,P.holz2,.008,.07,.008,-SW/2-.085,.012,sd*(SD/2)));
    for(let i=0;i<3;i++) H.box(sc,0xcaa95a,.06,.03,.05,-SW/2-.05,.012+i*.022,(i-1)*.04);              // Heuballen im Anbau
    // Hof: Ziehbrunnen, Misthaufen mit Gabel, Leiterwagen mit Heu, Fass
    const bx=.02, bz=.06; g.add(H.mesh(H.GEO.cyl12,P.stein2,.035,.035,.035,bx,.0175,bz)); g.add(H.mesh(H.GEO.cyl12,0x1a2a30,.028,.002,.028,bx,.036,bz));
    H.box(g,P.holz2,.006,.12,.006,bx+.05,0,bz); g.add(H.mesh(H.GEO.box,P.holz2,.2,.005,.005,bx+.02,.13,bz,0,0,-.35)); H.box(g,P.holz2,.002,.07,.002,bx-.05,.06,bz); H.box(g,P.holz,.014,.014,.014,bx-.05,.05,bz);
    g.add(H.mesh(H.GEO.dome20,0x4a3a28,.07,.035,.05,.17,0,.14)); g.add(H.mesh(H.GEO.box,P.holz2,.003,.08,.003,.19,.04,.14,0,.3,.3));
    const wg=new H.THREE.Group(); wg.position.set(.04,0,.28); wg.rotation.y=.4; g.add(wg);
    H.box(wg,P.holz,.13,.008,.06,0,.03,0); [-1,1].forEach(s=>{ for(let k=0;k<5;k++) H.box(wg,P.holz2,.003,.03,.003,-.06+k*.03,.038,s*.03); H.box(wg,P.holz2,.13,.003,.003,0,.066,s*.03); });
    [-1,1].forEach(s=>[-1,1].forEach(e=>{ const rd=new H.THREE.Mesh(H.GEO.torus,H.M(P.balken)); rd.scale.set(.024,.024,.08); rd.position.set(e*.045,.024,s*.036); wg.add(rd); }));
    H.box(wg,0xcaa95a,.12,.035,.055,0,.038,0); H.box(wg,P.holz2,.1,.004,.004,-.11,.03,0); fass(H,g,-.04,.18);
    // Schweinekoben mit Sau, Gemüsegarten mit Flechtzaun
    const px=.33, pz=.26; zaun(H,g,[[px-.08,pz-.06],[px+.08,pz-.06],[px+.08,pz+.07],[px-.08,pz+.07],[px-.08,pz-.06]]);
    g.add(H.mesh(H.GEO.box,0x5a4a34,.15,.003,.12,px,.002,pz)); const sau=new H.THREE.Group(); sau.position.set(px,0,pz); g.add(sau);
    sau.add(H.mesh(H.GEO.ico,0xe0a8a0,.032,.022,.022,0,.024,0)); sau.add(H.mesh(H.GEO.box,0xd89890,.012,.012,.014,.03,.024,0)); [[-.015,-.01],[.015,-.01],[-.015,.01],[.015,.01]].forEach(([a,b])=>H.box(sau,0xd89890,.006,.012,.006,a,0,b));
    relAnim(H,sau,(t,b)=>{ sau.rotation.y=b.ry+Math.sin(t*.3)*.9; sau.position.x=b.x+Math.sin(t*.2)*.02; });
    acker(H,g,-.21,.33,.28,.17,0,r);
    { const x0=-.21-.17, x1=-.21+.17, z0=.33-.115, z1=.33+.115; zaun(H,g,[[x0+.06,z0],[x0,z0],[x0,z1],[x1,z1],[x1,z0],[x1-.06,z0]]); }   // Zaun ums Beet, vorn ein Durchgang
    // Hühner picken im Hof
    for(let i=0;i<4;i++){ const h=new H.THREE.Group(); h.position.set(-.06+i*.05+(fest()-.5)*.03,0,.13+(i%2)*.05); h.rotation.y=fest()*6; g.add(h);
      const c=H.pick(r,[0xf0ece2,0xa86a3a,0x6a4a30]); h.add(H.mesh(H.GEO.ico,c,.012,.01,.009,0,.012,0)); const kopf=H.mesh(H.GEO.ico,c,.006,.006,.006,.01,.02,0); h.add(kopf);
      kopf.add(H.mesh(H.GEO.box,0xc8302a,.6,.5,.3,0,.9,0)); H.box(h,0xd8a040,.002,.006,.002,0,0,0);
      const ph=i*1.7; relAnim(H,h,(t,b)=>{ const pick=Math.max(0,Math.sin(t*2.2+ph)); kopf.position.y=.02-pick*.012; kopf.position.x=.01+pick*.004;
        h.position.x=b.x+Math.sin(t*.4+ph)*.02; h.position.z=b.z+Math.cos(t*.33+ph)*.015; h.rotation.y=b.ry+Math.sin(t*.4+ph)*1.2; }); }
    // Leute: Bauer mit Heugabel am Misthaufen, Bäuerin am Brunnen
    const bauer=figur(H,g,.14,.18,H.pick(r,[0x6a5a3a,0x4a5a6a,0x7a4a3a]),2.4); bauer.add(H.mesh(H.GEO.box,P.holz2,.003,.09,.003,.012,.05,.01,0,0,.2));
    figur(H,g,bx-.05,bz+.05,H.pick(r,[0x8a3a2a,0x3a5a7a,0xa88a5a]),3);
    // Apfelbaum
    apfelbaum(H,g,-.44,-.34,1.1,r);
  },
  bugfix(g,r,H){                                      // Schmiede: Steinhaus des Schmieds, offene Werkstatt mit Esse (Glut, Rauchfang, Kamin), Blasebalg (Lehrling zieht),
                                                      // Amboss mit Schmied (Hammer schlägt, Funken), Löschtrog, Werkzeugwand; draußen ein Pferd am Beschlagstand, Holzkohle, Eisenstangen,
                                                      // ein gebrochenes Rad zum Richten. Bedeutung „Etwas Zerbrochenes wurde neu geschmiedet“. Eine Form, Farbvarianz.
    const stein=ton(H,r,H.pick(r,[P.stein2,0xa8a090,0x9a958c,0xb4ab9a]),.04), stein2=H.mix(stein,0x000000,.15), dach=ton(H,r,H.pick(r,[P.schiefer,0x5c6370,...ZIEGEL]),.05);
    const holz=H.pick(r,[0x6a4a30,0x5e4a3a,0x7c5738]), holz2=H.mix(holz,0x000000,.3), KITTEL=H.pick(r,[0x5a4a3a,0x4a4a52,0x6a5a3a]), SCHURZ=0x6a4a2e;
    const PFERD=H.pick(r,[0x6a4028,0x3a2a22,0x8a6a48,0xb8b0a0]), fest=H.rng("schmiede-form");
    // Wohnhaus des Schmieds (Stein, Satteldach), hinten links
    const hx=-.22, hz=-.2, HW=.24, HD=.16, HH=.12;
    const w=new H.THREE.Group(); w.position.set(hx,0,hz); g.add(w);
    H.box(w,P.stein3,HW+.014,.012,HD+.014,0,0,0); H.box(w,stein,HW,HH,HD,0,.012,0);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ for(let k=0;k<4;k++) H.box(w,stein2,.02,.026,.02,a*(HW/2-.008)+(k%2?a*-.004:0),.014+k*.03,b*(HD/2-.008)); });   // Eckquader
    [-1,1].forEach(e=>giebel(H,w,e*(HW/2+.001),.012+HH,0,HD,.1,.006,stein,Math.PI/2));
    satteldach(H,w,.012+HH,HD+.06,.11,HW+.05,dach,holz2);
    H.box(w,0x3a2a1c,.032,.06,.004,-.04,.012,HD/2+.002); H.box(w,stein2,.044,.008,.008,-.04,.072,HD/2+.004);
    H.gbox(w,P.fenster,.026,.026,.003,.05,.055,HD/2+.002); H.box(w,holz2,.03,.004,.006,.05,.052,HD/2+.004); [-1,1].forEach(s=>H.box(w,H.pick(r,LAEDEN),.014,.03,.003,.05+s*.024,.053,HD/2+.004));
    // offene Werkstatt: Giebel nach vorn offen (man sieht hinein), Rückwand aus Stein mit Esse, First von vorn nach hinten
    const wx=.13, wz=-.05, W=.22, D=.26, WH=.14, yT=.008+WH;
    const k=new H.THREE.Group(); k.position.set(wx,0,wz); g.add(k);
    H.box(k,0x5a4e42,W+.02,.008,D+.02,0,0,0);                                                                      // Boden aus gestampfter Erde
    H.box(k,stein,W,WH,.03,0,.008,-D/2+.015);                                                                       // Rückwand
    giebel(H,k,0,yT,-D/2+.015,W,.1,.03,stein);                                                                      // Rückgiebel aus Stein
    [-1,1].forEach(sd=>{ for(let i=0;i<3;i++){ const z=-D/2+.03+i*(D-.044)/2; H.box(k,holz2,.014,WH,.014,sd*(W/2-.007),.008,z); }
      H.box(k,holz,.016,.014,D,sd*(W/2-.007),yT-.014,0);
      for(let i=0;i<3;i++){ const z=-D/2+.03+i*(D-.044)/2; [-1,1].forEach(s=>{ if((i===0&&s<0)||(i===2&&s>0)) return;
        k.add(H.mesh(H.GEO.box,holz2,.007,.007,.045,sd*(W/2-.007),yT-.03,z+s*.016,0,-s*Math.PI/4,0)); }); } });
    H.box(k,holz,W+.01,.014,.016,0,yT-.014,D/2-.007);                                                               // Bundbalken vorn
    H.box(k,holz2,.012,.08,.012,0,yT,D/2-.007);                                                                     // Firstsäule im offenen Giebel
    [-1,1].forEach(s=>k.add(H.mesh(H.GEO.box,holz2,Math.hypot(W/2,.09),.01,.01,s*W/4,yT+.045,D/2-.007,0,0,-s*Math.atan2(.09,W/2))));   // Sparren vorn
    const rg=new H.THREE.Group(); rg.rotation.y=Math.PI/2; k.add(rg); satteldach(H,rg,yT,W+.07,.1,D+.04,dach,holz2);
    // Esse mit Glut, Rauchfang und Kamin durch den First
    const ex=0, ez=-D/2+.065;
    H.box(k,stein2,.09,.05,.07,ex,.008,ez); H.box(k,0x2a2420,.07,.006,.05,ex,.058,ez);
    H.gbox(k,P.glut,.05,.006,.034,ex,.062,ez);
    H.box(k,stein2,.08,.02,.06,ex,.125,ez-.005); H.box(k,stein2,.05,.03,.045,ex,.145,ez-.01); H.box(k,stein2,.036,.16,.036,ex,.17,ez-.012);
    H.box(k,stein,.046,.01,.046,ex,.33,ez-.012); H.rauch(k,ex,ez-.012,.3,.6,0x7a7a7a,.35);
    const hl=H.halo(k,ex,.09,ez+.03,.32,0xff7a2a,.8); H.anim(hl,(t)=>{ hl.material.opacity=.55+.3*Math.sin(t*5)*Math.sin(t*2.3); });
    // Blasebalg links der Esse, Lehrling zieht am Hebel
    const bx=wx-.072, bz=wz+ez+.01, bb=new H.THREE.Group(); bb.position.set(bx+.03,.055,bz); g.add(bb);
    H.box(g,holz2,.06,.012,.036,bx,.043,bz); H.box(g,0x4a3424,.05,.012,.03,bx,.052,bz);                           // Unterbrett, Leder
    bb.add(H.mesh(H.GEO.box,holz,.062,.006,.038,-.031,.006,0)); bb.add(H.mesh(H.GEO.box,holz2,.004,.03,.004,-.058,.018,0));
    [-1,1].forEach(s=>H.box(g,holz2,.01,.043,.01,bx+s*.018,0,bz-.012));
    H.box(g,P.eisen,.02,.006,.006,bx+.035,.05,bz);
    H.anim(bb,(t)=>{ const f=(Math.sin(t*2.2)+1)/2; bb.rotation.z=-(.04+.18*f); });
    figur(H,g,bx-.005,bz+.05,KITTEL,Math.PI);
    // Amboss auf Holzklotz, Schmied mit Hammer, Funken
    const ax=wx-.005, az=wz+.03;
    g.add(H.mesh(H.GEO.cyl8,holz2,.024,.032,.024,ax,.024,az)); H.box(g,P.eisen,.05,.02,.024,ax,.04,az); H.box(g,P.eisen,.03,.008,.016,ax,.032,az);
    g.add(H.mesh(H.GEO.cone8,P.eisen,.012,.03,.012,ax-.036,.05,az,0,0,Math.PI/2));                                     // Horn
    H.gbox(g,0xffa040,.016,.003,.006,ax+.004,.06,az);                                                                // glühendes Werkstück
    const sm=figur(H,g,ax+.055,az,KITTEL,-Math.PI/2); H.box(sm,SCHURZ,.022,.03,.004,0,.02,.009);
    H.box(g,P.eisen,.004,.004,.03,ax+.04,.06,az+.008);                                                               // Zange in der linken Hand
    const ham=new H.THREE.Group(); ham.position.set(ax+.04,.078,az-.008); g.add(ham);
    ham.add(H.mesh(H.GEO.box,holz,.036,.004,.004,-.018,0,0)); ham.add(H.mesh(H.GEO.box,P.eisen,.008,.014,.01,-.036,0,0));
    const zyk=t=>(t*1.3)%1;
    H.anim(ham,(t)=>{ const u=zyk(t), f=u<.65?Math.sin(u/.65*Math.PI/2):1-((u-.65)/.35)**2; ham.rotation.z=.6-1.5*f; });
    for(let i=0;i<6;i++){ const sp=H.mesh(H.GEO.box,0xffc060,.004,.004,.004,ax,.062,az); H.leucht(sp); g.add(sp); const a=i/6*6.283+.3;
      relAnim(H,sp,(t,b)=>{ const u=zyk(t), v=u<.22?u/.22:-1; sp.visible=v>=0; if(v<0) return;
        sp.position.set(b.x+Math.cos(a)*v*.045,b.y+Math.sin(v*Math.PI)*.025,b.z+Math.sin(a)*v*.045); }); }
    // Löschtrog, Werkzeugwand mit Zangen und Hufeisen
    H.box(k,holz2,.03,.03,.06,.07,.008,.0); H.box(k,0x2a4a58,.022,.003,.052,.07,.036,.0);
    H.box(k,holz2,.006,.006,.09,W/2-.02,.1,-.04); for(let i=0;i<4;i++) H.box(k,P.eisen,.003,.04,.003,W/2-.02,.06,-.075+i*.022);
    for(let i=0;i<3;i++){ const hu=H.mesh(H.GEO.torus,P.eisen,.008,.008,.08,W/2-.018,.115,-.06+i*.02,Math.PI/2); k.add(hu); }
    // Pferd an der Anbindestange, vorn links; der Schmied beschlägt es gleich
    const px=-.2, pz=.19, pf=new H.THREE.Group(); pf.position.set(px,0,pz); pf.rotation.y=-.15; g.add(pf);
    const MAEHNE=H.mix(PFERD,0x000000,.55);
    H.box(pf,PFERD,.1,.042,.036,0,.058,0); pf.add(H.mesh(H.GEO.ico,PFERD,.03,.026,.022,.04,.08,0)); pf.add(H.mesh(H.GEO.ico,PFERD,.03,.026,.022,-.04,.078,0));
    [[-.038,-.012],[.038,-.012],[-.038,.012],[.038,.012]].forEach(([a,b])=>{ H.box(pf,PFERD,.01,.06,.01,a,0,b); H.box(pf,MAEHNE,.011,.008,.011,a,0,b); });
    pf.add(H.mesh(H.GEO.box,PFERD,.024,.06,.022,.062,.105,0,0,0,-.5));                                                 // Hals
    pf.add(H.mesh(H.GEO.box,PFERD,.048,.02,.02,.09,.128,0,0,0,-.55));                                                  // Kopf, Nase nach unten
    [-1,1].forEach(s2=>pf.add(H.mesh(H.GEO.box,PFERD,.006,.012,.005,.078,.146,s2*.006,0,0,-.2)));                     // Ohren
    pf.add(H.mesh(H.GEO.box,MAEHNE,.01,.06,.026,.054,.112,0,0,0,-.5));                                                 // Mähne
    pf.add(H.mesh(H.GEO.box,MAEHNE,.01,.05,.012,-.058,.05,0,0,0,.3));                                                  // Schweif
    H.box(pf,0x6a2a1a,.034,.004,.04,0,.08,0);                                                                       // Decke
    const hx2=-.06; [[hx2,.12],[hx2,.27]].forEach(([x,z])=>H.box(g,holz2,.01,.08,.01,x,0,z)); H.box(g,holz,.008,.008,.16,hx2,.07,.195);   // Anbindestange
    g.add(H.mesh(H.GEO.box,P.balken,.04,.002,.002,-.08,.1,.18,0,0,-.4));                                            // Zügel zur Stange
    // Draußen: Holzkohle, Eisenstangen, gebrochenes Rad, Baum
    { const cx=.33, cz=-.2; [-1,1].forEach(sd=>{ H.box(g,holz2,.07,.035,.006,cx,0,cz+sd*.03); H.box(g,holz2,.006,.035,.06,cx+sd*.035,0,cz); });   // Kohlenkasten
      for(let i=0;i<10;i++) g.add(H.mesh(H.GEO.ico,0x1e1c1a,.012,.01,.012,cx-.025+fest()*.05,.03+fest()*.008,cz-.02+fest()*.04,fest()*3)); }
    H.box(g,holz2,.01,.012,.07,.2,0,.17,.15); H.box(g,holz2,.01,.012,.07,.31,0,.19,.15);
    for(let i=0;i<5;i++) H.box(g,0x6a6a74,.14,.006,.006,.255,.012+(i>2?.006:0),.155+(i%3)*.012+(i>2?.006:0),.15);   // Eisenstangen
    const rd=new H.THREE.Group(); rd.position.set(.3,.04,.02); rd.rotation.y=-.5; g.add(rd);                                  // Wagenrad mit gebrochener Speiche, wartet aufs Richten
    { const rf=new H.THREE.Mesh(H.GEO.torus,H.M(holz)); rf.scale.set(.036,.036,.1); rd.add(rf); rd.add(H.mesh(H.GEO.cyl8,holz2,.008,.012,.008,0,0,0,0,Math.PI/2,0));
      for(let i=0;i<6;i++){ if(i===2) continue; rd.add(H.mesh(H.GEO.box,holz2,.004,.034,.004,Math.sin(i/6*6.283)*.017,Math.cos(i/6*6.283)*.017,0,0,0,-i/6*6.283)); } }
    rd.rotation.x=0; H.box(g,holz2,.012,.012,.01,.3,0,.02);
    H.baum(g,.42,.3,.5,r,"laub");
  },
  refactor(g,r,H){                                    // Windmühle: Bockwindmühle. Hölzerner Mühlenkasten auf dem Bock (Steinpfeiler, Kreuzschwellen, Streben, Hausbaum), vier Flügel mit Gatter
                                                      // und Segeltuch (drehen sich), hinten Treppe und Steert mit Rad zum Drehen in den Wind; Müllerhaus, Eselkarren mit Säcken, Müllerknecht trägt Säcke
                                                      // zur Treppe, Kornfeld. Bedeutung „Neu gemahlen, gleiches Mehl: umgebaut bei gleichem Verhalten“. Eine Form, Farbvarianz.
    const holz=H.pick(r,[0x7c5738,0x6a4a30,0x8a6a48,0x4e3a2a]), holz2=H.mix(holz,0x000000,.3), dach=ton(H,r,H.pick(r,[P.reet,0x6a4a34,0x5c6370]),.05);
    const tuch=H.pick(r,[P.tuch3,0xd8c8a0,0xb06a4a,0xe0d8c0]), stein=ton(H,r,P.stein2,.05), ESEL=H.pick(r,[0x8a8478,0x6a5a4a,0x9a9080]), fest=H.rng("windmuehle-form");
    const up=new H.THREE.Vector3(0,1,0), SACKF=0xd8c8a0;
    const sack=(par,x,y,z,ry=0)=>{ par.add(H.mesh(H.GEO.cyl8,SACKF,.013,.03,.011,x,y+.015,z,ry)); par.add(H.mesh(H.GEO.cyl8,0xb8a880,.006,.008,.005,x,y+.033,z,ry)); };   // stehender Mehlsack mit Zipfel
    const stab=(par,c,a,b,d)=>{ const A=new H.THREE.Vector3(...a), B=new H.THREE.Vector3(...b), v=B.clone().sub(A), L=v.length();
      const m=H.mesh(H.GEO.box,c,d,L,d,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2); m.quaternion.setFromUnitVectors(up,v.normalize()); par.add(m); return m; };
    const mx=-.02, mz=-.04;
    // Bock: vier Steinpfeiler, Kreuzschwellen, Hausbaum, Streben
    const S=.085; [[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b])=>H.box(g,stein,.03,.025,.03,mx+a*S,0,mz+b*S));
    H.box(g,holz2,2*S+.03,.014,.016,mx,.025,mz); H.box(g,holz2,.016,.014,2*S+.03,mx,.039,mz);
    H.box(g,holz2,.024,.115,.024,mx,.04,mz);
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b])=>stab(g,holz2,[mx+a*(S-.005),.045,mz+b*(S-.005)],[mx+a*.012,.12,mz+b*.012],.011));
    // Mühlenkasten
    const K=new H.THREE.Group(); K.position.set(mx,0,mz); g.add(K);
    const KW=.14, KD=.17, KH=.15, y0=.155;
    H.box(K,holz2,KW+.02,.012,KD+.02,0,y0-.012,0);                                                             // Mehlbalken/Boden
    H.box(K,holz,KW,KH,KD,0,y0,0);
    for(let i=1;i<9;i++) [-1,1].forEach(sd=>H.box(K,holz2,.002,KH,.002,sd*(KW/2+.001),y0,-KD/2+i*KD/9));
    for(let i=1;i<7;i++) [-1,1].forEach(sd=>H.box(K,holz2,.002,KH,.002,-KW/2+i*KW/7,y0,sd*(KD/2+.001)));
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>H.box(K,holz2,.01,KH,.01,a*KW/2,y0,b*KD/2));
    H.gbox(K,P.fenster,.02,.022,.003,.03,y0+.07,KD/2+.002); H.gbox(K,P.fenster,.003,.022,.02,KW/2+.002,y0+.09,.02);
    const rg=new H.THREE.Group(); rg.rotation.y=Math.PI/2; K.add(rg); satteldach(H,rg,y0+KH,KW+.035,.075,KD+.03,dach,holz2);
    [-1,1].forEach(e=>giebel(H,K,0,y0+KH,e*(KD/2+.001),KW,.07,.004,holz));
    // hinten: Tür mit Podest, Treppe zum Boden, Steert mit Rad
    const zb=-KD/2; H.box(K,0x2a2018,.03,.055,.004,0,y0+.008,zb-.002); H.box(K,holz2,.05,.006,.03,0,y0-.006,zb-.015);
    const F=[mx,0,mz-.26], T=[mx,y0-.004,mz+zb-.03];
    [-1,1].forEach(s=>stab(g,holz2,[F[0]+s*.018,.0,F[2]],[T[0]+s*.018,T[1],T[2]],.006));
    for(let i=1;i<9;i++){ const u=i/9; H.box(g,holz,.04,.004,.01,mx,u*T[1],F[2]+(T[2]-F[2])*u); }
    stab(g,holz,[mx,y0-.01,mz+zb],[mx,.03,mz-.34],.012);                                                         // Steert
    { const rad=new H.THREE.Mesh(H.GEO.torus,H.M(P.balken)); rad.scale.set(.022,.022,.08); rad.position.set(mx,.022,mz-.34); rad.rotation.y=Math.PI/2; g.add(rad); }
    // Flügel mit Gatter und Segeltuch
    const nabe=new H.THREE.Group(); nabe.position.set(mx,y0+.1,mz+KD/2+.03); g.add(nabe);
    g.add(H.mesh(H.GEO.cyl8,holz2,.014,.05,.014,mx,y0+.1,mz+KD/2+.01,0,Math.PI/2,0));                               // Welle
    nabe.add(H.mesh(H.GEO.box,holz2,.03,.03,.02,0,0,0));
    const RL=.22, GW=.055;
    for(let i=0;i<4;i++){ const f=new H.THREE.Group(); f.rotation.z=i*Math.PI/2+.3; nabe.add(f);
      f.add(H.mesh(H.GEO.box,holz2,.012,RL,.01,0,RL/2,0));                                                       // Rute
      [.0,GW].forEach(x=>f.add(H.mesh(H.GEO.box,holz,.004,RL-.04,.005,x+.006,.04+(RL-.04)/2,.004)));               // Gatterleisten längs
      for(let k=0;k<8;k++) f.add(H.mesh(H.GEO.box,holz,GW+.006,.003,.005,GW/2+.006,.05+k*(RL-.06)/7,.004));         // Sprossen
      f.add(H.mesh(H.GEO.box,tuch,GW-.004,(RL-.06)*.85,.002,GW/2+.006,.05+(RL-.06)*.425+.0,.008)); }
    H.anim(nabe,(t)=>{ nabe.rotation.z=-t*.55; });
    // Müllerhaus hinten rechts
    fachwerkhaus(H,g,.27,-.25,-.5,{r,w:.2,d:.13,h:.09,dachH:.1,putz:H.pick(r,PUTZE),balken:H.pick(r,BALKEN),dach:ton(H,r,H.pick(r,[P.reet,...ZIEGEL]),.05),laden:H.pick(r,LAEDEN)});
    // Eselkarren mit Säcken vorn links, Knecht trägt Säcke zur Treppe
    const ka=new H.THREE.Group(); ka.position.set(-.25,0,.16); ka.rotation.y=.25; g.add(ka);
    H.box(ka,holz,.1,.01,.06,0,.032,0); [-1,1].forEach(sd=>H.box(ka,holz2,.1,.018,.004,0,.042,sd*.03));
    [-1,1].forEach(sd=>{ const rad=new H.THREE.Mesh(H.GEO.torus,H.M(P.balken)); rad.scale.set(.026,.026,.1); rad.position.set(0,.026,sd*.038); ka.add(rad); });
    [-1,1].forEach(sd=>H.box(ka,holz2,.09,.005,.005,.09,.034,sd*.018));
    for(let i=0;i<6;i++) sack(ka,-.032+(i%3)*.032,.037,(i<3?-.012:.012),fest());
    const es=new H.THREE.Group(); es.position.set(.14,0,0); ka.add(es);
    H.box(es,ESEL,.07,.035,.03,0,.03,0); [[-.026,-.01],[.026,-.01],[-.026,.01],[.026,.01]].forEach(([a,b])=>H.box(es,ESEL,.008,.032,.008,a,0,b));
    es.add(H.mesh(H.GEO.box,ESEL,.018,.035,.018,.04,.065,0,0,0,-.5)); es.add(H.mesh(H.GEO.box,ESEL,.032,.016,.016,.058,.08,0,0,0,-.4));
    [-1,1].forEach(s=>es.add(H.mesh(H.GEO.box,ESEL,.005,.022,.005,.046,.098,s*.006,0,0,-.3))); es.add(H.mesh(H.GEO.box,0xe8e0d0,.012,.008,.014,.072,.072,0,0,0,-.4));
    const kn=figur(H,g,-.2,.12,H.pick(r,[0xe0d8c8,0xc8c0b0]),0), ks=H.mesh(H.GEO.cyl8,SACKF,.012,.026,.01,0,.088,-.004,0,0,1.2); kn.add(ks);   // Müllerknecht in Weiß (Mehl)
    const A=[-.2,.12], B=[mx-.08,mz-.24], phk=fest()*6, rich=Math.atan2(B[0]-A[0],B[1]-A[1]);
    relAnim(H,kn,(t,b)=>{ const u=((t*.08+phk)%1), hin=u<.5, q=hin?u*2:2-u*2, s=q*q*(3-2*q);
      kn.position.x=b.x+(B[0]-A[0])*s; kn.position.z=b.z+(B[1]-A[1])*s; kn.position.y=b.y+Math.abs(Math.sin(t*9))*.003; kn.rotation.y=rich+(hin?0:Math.PI); ks.visible=hin; });
    for(let i=0;i<5;i++) sack(g,mx-.11+(i%3)*.026,0,mz-.26+(i>2?.026:0),fest());   // Säcke am Treppenfuß
    // Kornfeld vorn rechts, Baum
    acker(H,g,.27,.22,.2,.14,0,r);
    H.baum(g,-.42,-.18,.5,r,"laub");
  },
  test(g,r,H){                                        // Wachturm: quadratischer Steinturm mit Hocheingang und Holztreppe, hölzerner Wehrgang (Hurde) mit Zeltdach,
                                                      // Palisade mit Tor, Wachstube, Waffenständer, Übungspuppe, Wache auf dem Wehrgang. Eine Form, Farbvarianz.
    const stein=ton(H,r,H.pick(r,[P.stein,0xb4ab9a,0xa8a090,0xc0b49c]),.03), stein2=H.mix(stein,0x000000,.15);
    const holz=H.pick(r,[0x6a4a30,0x7c5738,0x5e4a3a]), dach=H.pick(r,[P.schiefer,0x5c6370,...ZIEGEL]), banner=H.pick(r,[P.tuch,P.tuch2,0x3a6a3a,0xb8902a]);
    const tx=0, tz=-.06, B=.17, TH=.42;
    // Turm: geböschter Sockel, Schießscharten, Eckquader, Gesims
    g.add(H.mesh(new H.THREE.CylinderGeometry(B*.62,B*.8,.06,4),stein2,1,1,1,tx,.03,tz,Math.PI/4));
    H.box(g,stein,B,TH,B,tx,.05,tz);
    for(let k=0;k*.05<TH-.03;k++){ const y=.05+k*.05, lang=k%2; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>H.box(g,stein2,lang?.034:.02,.022,lang?.02:.034,tx+a*(B/2-(lang?.016:.009)+.0015),y,tz+b*(B/2-(lang?.009:.016)+.0015))); }   // Eckquader im Verband, fast bündig
    [[0,B/2+.001,0],[B/2+.001,0,Math.PI/2],[0,-B/2-.001,0],[-B/2-.001,0,Math.PI/2]].forEach(([dx,dz,ry])=>{ for(const y of [.17,.3]) H.box(g,0x14110e,.008,.04,.004,tx+dx,y,tz+dz,ry); });
    H.box(g,stein2,B+.012,.012,B+.012,tx,.05+TH-.012,tz);
    // Hocheingang mit Holztreppe
    H.box(g,0x3a2a1c,.04,.06,.004,tx-.03,.2,tz+B/2+.002); H.box(g,stein2,.05,.008,.006,tx-.03,.262,tz+B/2+.003);
    H.box(g,holz,.06,.008,.05,tx-.03,.192,tz+B/2+.025);                                              // Podest
    const tz0=tz+B/2+.028, x0=tx+.0, x1=tx+.19, y1=.192;                                              // Treppe läuft an der Wand entlang vom Boden zum Podest
    for(let i=0;i<8;i++){ const u=(i+.5)/8; H.box(g,holz,.022,.006,.036,x0+(x1-x0)*u,y1*(1-u)-.003,tz0); }
    const Lh=Math.hypot(x1-x0,y1), wh=-Math.atan2(y1,x1-x0);
    [-1,1].forEach(sd=>g.add(H.mesh(H.GEO.box,holz,Lh,.012,.005,(x0+x1)/2,y1/2,tz0+sd*.019,0,0,wh)));   // Wangen
    [[-.055,.19],[-.005,.19],[.06,.13]].forEach(([dx,h])=>H.box(g,holz,.008,h,.008,tx+dx,0,tz0+.02));   // Stützen unter Podest und Treppe
    fackel(H,g,tx+.02,.21,tz+B/2+.01);
    // Wehrgang (Hurde): auskragender Holzumgang mit Brüstung, Zeltdach, Fahne
    const yH=.05+TH, HB=B+.07;
    H.box(g,holz,HB,.008,HB,tx,yH,tz);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ g.add(H.mesh(H.GEO.box,holz,.006,.06,.006,tx+a*(B/2+.02),yH-.025,tz+b*(B/2+.02),0,b*.5,-a*.5)); });   // Kopfbänder
    [[0,HB/2],[HB/2,0],[0,-HB/2],[-HB/2,0]].forEach(([dx,dz])=>{ const quer=dx!==0, L=HB;
      H.box(g,H.mix(holz,0xffffff,.08),quer?.006:L,.05,quer?L:.006,tx+dx,yH+.008,tz+dz);
      for(let i=0;i<6;i++){ const u=-L/2+(i+.5)*L/6; H.box(g,H.mix(holz,0x000000,.3),quer?.007:.002,.05,quer?.002:.007,tx+dx+(quer?0:u),yH+.008,tz+dz+(quer?u:0)); }
      H.box(g,0x14110e,quer?.007:.012,.016,quer?.012:.007,tx+dx,yH+.03,tz+dz); });
    for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]) H.box(g,holz,.01,.07,.01,tx+a*HB/2,yH+.008,tz+b*HB/2);
    g.add(H.mesh(new H.THREE.ConeGeometry(HB*.78,.16,4),dach,1,1,1,tx,yH+.078+.08,tz,Math.PI/4));
    H.box(g,P.eisen,.004,.06,.004,tx,yH+.24,tz); const fl=H.mesh(H.GEO.box,banner,.07,.04,.003,tx+.036,yH+.28,tz); g.add(fl);
    H.anim(fl,(t)=>{ fl.rotation.y=Math.sin(t*2.2)*.25; });
    const wache=figur(H,g,tx+.03,tz+HB/2-.02,P.tuch2,0); wache.position.y=yH+.008; wache.add(H.mesh(H.GEO.box,P.eisen,.002,.09,.002,.012,.05,0));
    // Palisade mit Tor, Wachstube, Waffenständer, Übungspuppe
    const R=.43, n=80, tor=.5*Math.PI/2, fest=H.rng("wachturm-form");                                 // dichte Palisade: Pfahl an Pfahl, zwei Querriegel innen
    for(let i=0;i<n;i++){ const a=i/n*6.283; if(Math.abs(((a-tor+Math.PI)%(2*Math.PI))-Math.PI)<.2) continue;
      const h=.075+fest()*.02; [H.mesh(H.GEO.cyl8,H.mix(holz,0x000000,fest()*.18),.0175,h,.0175,Math.sin(a)*R,h/2,Math.cos(a)*R,fest()*3),H.mesh(H.GEO.cone8,H.mix(holz,0x000000,.1),.0175,.022,.0175,Math.sin(a)*R,h+.011,Math.cos(a)*R)].forEach(m=>{ m.userData.keinHindernis=true; g.add(m); }); }
    for(let i=0;i<n;i++){ const a=(i+.5)/n*6.283; if(Math.abs(((a-tor+Math.PI)%(2*Math.PI))-Math.PI)<.24) continue;
      for(const y of [.02,.06]){ const m=H.mesh(H.GEO.box,H.mix(holz,0x000000,.3),.035,.008,.006,Math.sin(a)*(R-.019),y,Math.cos(a)*(R-.019),a+Math.PI/2); m.userData.keinHindernis=true; g.add(m); } }
    [-1,1].forEach(s=>{ const a=tor+s*.24; H.box(g,holz,.02,.12,.02,Math.sin(a)*R,0,Math.cos(a)*R); fackel(H,g,Math.sin(a)*(R-.03),.1,Math.cos(a)*(R-.03)); });
    g.add(H.mesh(H.GEO.box,holz,.25,.014,.014,Math.sin(tor)*R,.12,Math.cos(tor)*R,tor));   // Torbalken quer über die Öffnung
    fachwerkhaus(H,g,-.21,.1,Math.PI/2+.1,{r,w:.18,d:.12,h:.09,dachH:.08,putz:H.pick(r,PUTZE),balken:H.pick(r,BALKEN),dach,laden:H.pick(r,LAEDEN)});
    const wx=.27, wz=-.02; H.box(g,holz,.07,.006,.012,wx,.07,wz,-.6); [-1,1].forEach(s=>H.box(g,holz,.006,.08,.006,wx+s*.03*Math.cos(.6),0,wz-s*.03*Math.sin(.6)));
    for(let i=0;i<4;i++){ const u=-.025+i*.017; g.add(H.mesh(H.GEO.box,P.holz2,.003,.13,.003,wx+u*Math.cos(.6),.065,wz-u*Math.sin(.6)+.004)); H.box(g,P.eisen,.006,.014,.003,wx+u*Math.cos(.6),.128,wz-u*Math.sin(.6)+.004); }
    const px=.04, pz=.3; H.box(g,P.holz2,.006,.08,.006,px,0,pz); H.box(g,P.holz2,.05,.006,.006,px,.065,pz); g.add(H.mesh(H.GEO.ico,0xcaa95a,.022,.03,.018,px,.06,pz)); g.add(H.mesh(H.GEO.ico,0xcaa95a,.012,.012,.012,px,.095,pz));
    H.box(g,banner,.02,.02,.003,px,.055,pz+.018);
    // zweite Wache geht innen an der Palisade entlang
    const w2=figur(H,g,.2,-.2,P.tuch2,0); w2.add(H.mesh(H.GEO.box,P.eisen,.002,.09,.002,.012,.05,0));
    relAnim(H,w2,(t,b)=>{ const u=Math.sin(t*.22); w2.position.x=b.x+u*.06; w2.position.z=b.z-u*.06; w2.rotation.y=Math.cos(t*.22)>0?-Math.PI*.75:Math.PI*.25; w2.position.y=b.y+Math.abs(Math.sin(t*6))*.003; });
  },
  infra(g,r,H){                                       // Zeppelinplatz: Ankerturm aus Holz (Andreaskreuze, Zwischenpodest, Ausguck mit Geländer, Ankerring, Haspel),
                                                      // Luftschiffhalle mit Tonnendach und offenem Tor, Ladekran, Frachtplatz, Windsack, Bodenmannschaft. Eine Form, Farbvarianz.
    const Z=H.zeppelin()||{theta:0}, s=new H.THREE.Group(); s.rotation.y=Z.theta||0; g.add(s); g=s;
    const holz=H.pick(r,[0x7c5738,0x6a4a30,0x8a6a48]), holz2=H.mix(holz,0x000000,.3), hallenDach=H.pick(r,[0x5a4a3a,0x7a4a36,P.reet,0x4f5562]), tuch=H.pick(r,[P.tuch,P.tuch2,0xb8902a,0x3a6a3a]);
    const mx=.18, MH=.62, A=.05;                                                                       // Mastposition und -höhe: dort docken die Luftschiffe an
    // Fundament
    H.box(g,P.stein2,.2,.02,.2,mx,0,0); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>H.box(g,P.stein3,.04,.03,.04,mx+a*A,0,b*A));
    // Turm: vier Eckstiele, Riegel, Andreaskreuze auf allen Seiten
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>H.box(g,holz2,.016,MH-.03,.016,mx+a*A,.03,b*A));
    const fel=[.03,.2,.38,MH-.04];
    fel.forEach(y=>{ H.box(g,holz,2*A+.016,.01,.01,mx,y,A); H.box(g,holz,2*A+.016,.01,.01,mx,y,-A); H.box(g,holz,.01,.01,2*A+.016,mx+A,y,0); H.box(g,holz,.01,.01,2*A+.016,mx-A,y,0); });
    for(let k=0;k<fel.length-1;k++){ const y0=fel[k]+.01, y1=fel[k+1], hk=y1-y0, L=Math.hypot(2*A,hk), w=Math.atan2(hk,2*A);
      [-1,1].forEach(sd=>{ [w,-w].forEach(ww=>{ g.add(H.mesh(H.GEO.box,holz2,L,.006,.005,mx,y0+hk/2,sd*(A+.004),0,0,ww)); g.add(H.mesh(H.GEO.box,holz2,.005,.006,L,mx+sd*(A+.004),y0+hk/2,0,0,ww,0)); }); }); }
    // Zwischenpodest und Ausguck mit Geländer
    const podest=(y,b)=>{ H.box(g,holz,b,.008,b,mx,y,0); [[0,b/2],[0,-b/2],[b/2,0],[-b/2,0]].forEach(([dx,dz])=>{ H.box(g,holz,dx?.004:b,.004,dx?b:.004,mx+dx,y+.04,dz); });
      [[-1,-1],[1,-1],[-1,1],[1,1],[0,1],[0,-1],[1,0],[-1,0]].forEach(([a,b2])=>H.box(g,holz2,.005,.04,.005,mx+a*b/2,y+.004,b2*b/2)); };
    podest(.38,.15); podest(MH-.035,.17);
    // Leitern zwischen den Ebenen (an der Außenseite)
    [[.03,.38,1],[.39,MH-.035,-1]].forEach(([y0,y1,sd])=>{ const z=sd*(A+.02); [-1,1].forEach(e=>H.box(g,holz,.005,y1-y0,.005,mx+.04+e*.016,y0,z));
      for(let y=y0+.025;y<y1;y+=.025) H.box(g,holz,.036,.004,.004,mx+.04,y,z); });
    // Ankerring, Haspel mit Seil, Laterne, Wimpel
    const ring=new H.THREE.Mesh(H.GEO.torus,H.M(P.eisen)); ring.scale.set(.035,.035,.5); ring.rotation.x=Math.PI/2; ring.position.set(mx,MH+.02,0); g.add(ring);
    H.box(g,P.eisen,.008,.025,.008,mx,MH-.027,0);
    H.box(g,holz2,.008,.03,.008,mx-.05,MH-.027,-.04); H.box(g,holz2,.008,.03,.008,mx-.05,MH-.027,.04); g.add(H.mesh(H.GEO.cyl8,holz,.014,.07,.014,mx-.05,MH+.0,0,0,Math.PI/2,0));
    g.add(H.mesh(H.GEO.cyl8,0xcaa95a,.017,.04,.017,mx-.05,MH+.0,0,0,Math.PI/2,0));                   // aufgewickeltes Seil
    H.box(g,P.eisen,.012,.004,.012,mx+.07,MH+.03,.07); H.gbox(g,0xffc870,.01,.014,.01,mx+.07,MH+.012,.07); H.halo(g,mx+.07,MH+.02,.07,.1,0xffc870,.45);
    H.box(g,holz2,.004,.05,.004,mx+.07,MH-.035,.07);
    fahne(H,g,mx-.075,MH-.03,-.075,tuch,.9);
    // Luftschiffhalle: Tonnendach, Holzwände, großes offenes Tor mit Gondel im Inneren
    const hx=-.24, hz=-.17, HL=.36, HW=.22, HWA=.07;
    const ha=new H.THREE.Group(); ha.position.set(hx,0,hz); g.add(ha);
    H.box(ha,P.stein3,HL+.02,.012,HW+.02,0,0,0);
    [-1,1].forEach(sd=>{ H.box(ha,holz,HL,HWA,.01,0,.012,sd*HW/2); for(let i=0;i<=6;i++) H.box(ha,holz2,.012,HWA+.004,.014,-HL/2+i*HL/6,.012,sd*HW/2); });
    const tonne=new H.THREE.Mesh(new H.THREE.CylinderGeometry(HW/2+.012,HW/2+.012,HL+.02,14,1,true,0,Math.PI),H.M(hallenDach)); tonne.material.side=H.THREE.DoubleSide;
    tonne.rotation.z=Math.PI/2; tonne.position.set(0,.012+HWA,0); tonne.castShadow=tonne.receiveShadow=true; ha.add(tonne);
    for(let i=0;i<=6;i++){ const rp=new H.THREE.Mesh(H.GEO.torus,H.M(holz2)); rp.scale.set(HW/2+.016,HW/2+.016,.12); rp.rotation.y=Math.PI/2; rp.position.set(-HL/2+i*HL/6,.012+HWA,0); ha.add(rp); }
    const giebelH=(x,offen)=>{ const sch=new H.THREE.Shape(); sch.moveTo(-HW/2,0); sch.lineTo(HW/2,0); sch.lineTo(HW/2,HWA); sch.absarc(0,HWA,HW/2,0,Math.PI,false); sch.lineTo(-HW/2,0);
      if(offen){ const loch=new H.THREE.Path(); loch.moveTo(-HW*.32,0); loch.lineTo(HW*.32,0); loch.lineTo(HW*.32,HWA+.04); loch.absarc(0,HWA+.04,HW*.32,0,Math.PI,false); loch.lineTo(-HW*.32,0); sch.holes.push(loch); }
      const m=new H.THREE.Mesh(new H.THREE.ExtrudeGeometry(sch,{depth:.008,bevelEnabled:false}),H.M(holz)); m.rotation.y=Math.PI/2; m.position.set(x,.012,0); m.castShadow=m.receiveShadow=true; ha.add(m); };
    giebelH(-HL/2-.004,false); giebelH(HL/2-.004,true);
    H.box(ha,0x15120f,.004,HWA+.1,HW*.62,HL/2-.012,.012,0);                                         // dunkles Inneres hinter dem Tor
    const tw=HW*.3, tw2=.9; [-1,1].forEach(sd=>{ const t=H.mesh(H.GEO.box,holz,.006,HWA+.05,tw,HL/2+.004+Math.sin(tw2)*tw/2,.012+(HWA+.05)/2,sd*(HW*.32+Math.cos(tw2)*tw/2),sd*tw2); ha.add(t); });   // an den Torkanten angeschlagen   // aufgeschwenkte Torflügel
    ha.add(H.mesh(H.GEO.ico,H.mix(0xe8dcc0,0xd0c4a8,.5),.12,.05,.05,.02,.1,0)); H.box(ha,holz,.08,.02,.03,.03,.04,0);   // Luftschiff in Wartung: Hülle und Gondel
    // Ladekran mit Last (Last fährt auf und ab), Frachtplatz, Handkarren
    const kx=-.1, kz=.2, TX=kx+.16, TY=.27, jl=Math.hypot(.16,TY-.17), jw=Math.atan2(TY-.17,.16);       // Ladebaum: Mast mit schräg ansteigendem Ausleger (kein Galgen)
    H.box(g,P.stein3,.05,.012,.05,kx,0,kz); H.box(g,holz2,.018,.18,.018,kx,.012,kz);
    g.add(H.mesh(H.GEO.box,holz,jl,.012,.012,kx+.08,(.17+TY)/2+.006,kz,0,0,jw));
    const sl=Math.hypot(.08,.1); g.add(H.mesh(H.GEO.box,holz2,sl,.008,.008,kx+.04,.135,kz,0,0,Math.atan2(.1,.08)));
    g.add(H.mesh(H.GEO.cyl8,P.eisen,.012,.012,.012,TX,TY+.006,kz,0,Math.PI/2,0));                         // Umlenkrolle
    g.add(H.mesh(H.GEO.cyl8,0xcaa95a,.016,.022,.016,kx+.022,.07,kz,0,0,Math.PI/2));                      // Seiltrommel am Mast
    const seil=H.mesh(H.GEO.box,P.balken,.002,1,.002,TX,0,kz); g.add(seil); const last=new H.THREE.Group(); last.position.set(TX,0,kz); g.add(last); kiste(H,last,0,0,.3);
    const phl=r()*6; relAnim(H,last,(t,b)=>{ const u=(Math.sin(t*.35+phl)+1)/2; last.position.y=b.y+.02+u*.12; }); relAnim(H,seil,(t,b)=>{ const u=(Math.sin(t*.35+phl)+1)/2, y=.02+u*.12+.035; seil.scale.y=Math.max(.01,TY-y); seil.position.y=b.y+(TY+y)/2; });
    for(let i=0;i<4;i++) fass(H,g,-.4+i*.05,.24); for(let i=0;i<3;i++) kiste(H,g,-.36+i*.055,.33,i*.4); kiste(H,g,-.335,.33,0); H.box(g,P.holz,.045,.035,.045,-.31,.035,.33,.3);
    for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.ico,0xb8a070,.022,.018,.018,-.16+i*.03,.015,.34,i));         // Säcke
    const hk=new H.THREE.Group(); hk.position.set(.18,0,.32); hk.rotation.y=.6; g.add(hk); H.box(hk,holz,.07,.008,.045,0,.03,0); [-1,1].forEach(sd=>{ const rad=new H.THREE.Mesh(H.GEO.torus,H.M(P.balken)); rad.scale.set(.022,.022,.08); rad.position.set(0,.022,sd*.026); hk.add(rad); }); H.box(hk,holz2,.08,.004,.004,-.07,.035,0); kiste(H,hk,0,0,.2); hk.children[hk.children.length-1].position.y+=.038; hk.children[hk.children.length-2].position.y+=.038;
    // Windsack auf Stange
    const wx=.42, wz=-.22; H.box(g,P.eisen,.006,.24,.006,wx,0,wz); const ws=new H.THREE.Group(); ws.position.set(wx,.23,wz); g.add(ws);
    for(let i=0;i<4;i++){ const k=new H.THREE.Mesh(new H.THREE.CylinderGeometry(.018-i*.0035,.021-i*.0035,.02,10,1,true),H.M(i%2?0xf0ece2:tuch)); k.material.side=H.THREE.DoubleSide; k.rotation.z=Math.PI/2; k.position.x=.012+i*.02; ws.add(k); }
    H.anim(ws,(t)=>{ ws.rotation.y=Math.sin(t*.4)*.6+.4; ws.rotation.z=-.15+Math.sin(t*1.7)*.05; });
    // Bodenmannschaft: zwei am Haltetau, einer am Kran
    const tauX=mx+.05, tauZ=.16; g.add(H.mesh(H.GEO.box,0xcaa95a,.003,.003,.16,tauX+.02,.03,tauZ+.06,0,0,0)); H.box(g,P.holz2,.012,.03,.012,tauX+.02,0,tauZ+.14);
    figur(H,g,tauX+.035,tauZ+.03,P.tuch3,Math.PI); figur(H,g,tauX+.005,tauZ+.09,H.pick(r,[P.tuch2,0x6a5a3a]),Math.PI); figur(H,g,kx-.04,kz+.03,P.tuch3,1.6);
    H.baum(g,-.46,.06,.6,r,"laub");
  },

  doku(g,r,H){                                        // Skriptorium: Schreibsaal eines Klosters mit Kreuzgang, Bibliotheksturm, Pergament-Spannrahmen und Kräutergarten.
                                                      // Eine feste Form; je Exemplar leicht andere Farben (Dach, Stein, Turmhelm).
    const dach=H.pick(r,[P.schiefer,0x5c6370,0x934030,0xa6452f]), turmDach=r()<.5?dach:H.pick(r,[P.schiefer,0x7a4a36]);
    const stein=ton(H,r,H.pick(r,[P.stein,0xc8bca6,0xb4ab9a,0xcfc3ad]),.03), stein2=H.mix(stein,0x000000,.12), MOENCH=H.pick(r,[0x5a4632,0x4a3a2c,0x3a3a3e]);
    const L=.32, W=.15, HH=.13, sx=-.02, sz=-.02;
    // Schreibsaal
    H.box(g,P.stein3,L+.03,.014,W+.03,sx,0,sz); H.box(g,stein,L,HH,W,sx,.014,sz);
    H.box(g,stein2,L+.006,.01,W+.006,sx,.014+HH-.01,sz);                                             // Traufgesims
    giebel(H,g,sx,.014+HH,sz,W+.04,.11,L+.035,dach,Math.PI/2);
    H.box(g,H.mix(dach,0x000000,.3),L+.035,.006,.008,sx,.014+HH+.108,sz);                            // First
    [-1,1].forEach(e=>{ H.box(g,stein2,.012,.012,.012,sx+e*(L/2+.012),.014+HH+.11,sz); });
    H.box(g,P.gold,.004,.035,.004,sx+L/2+.012,.014+HH+.12,sz); H.box(g,P.gold,.018,.004,.004,sx+L/2+.012,.014+HH+.14,sz);   // Giebelkreuz
    const nf=4;
    for(let i=0;i<nf;i++){ const x=sx-L/2+(i+.5)*L/nf;                                               // Rundbogenfenster mit Sohlbank, Wandvorlagen
      H.gbox(g,P.fenster,.022,.056,.003,x,.045,sz+W/2+.002); const bo=H.mesh(H.GEO.cyl8,P.fenster,.011,.003,.011,x,.101,sz+W/2+.002,0,Math.PI/2); H.leucht(bo); g.add(bo);
      H.box(g,stein2,.03,.005,.01,x,.04,sz+W/2+.004); H.box(g,0x2a2420,.003,.056,.004,x,.045,sz+W/2+.004);
      H.box(g,0x2a2420,.022,.056,.003,x,.045,sz-W/2-.002);
      if(i<nf-1){ const bx=sx-L/2+(i+1)*L/nf; [-1,1].forEach(s=>{ H.box(g,stein2,.016,.1,.02,bx,.014,sz+s*(W/2+.009)); H.box(g,stein2,.016,.02,.014,bx,.114,sz+s*(W/2+.006)); }); } }
    const rf=H.mesh(H.GEO.cyl12,P.fenster,.024,.003,.024,sx-L/2-.002,.1,sz,Math.PI/2,0,Math.PI/2); H.leucht(rf); g.add(rf);       // Rundfenster im Westgiebel
    g.add(H.mesh(H.GEO.cyl12,stein2,.03,.002,.03,sx-L/2-.001,.1,sz,Math.PI/2,0,Math.PI/2));
    H.box(g,0x3a2a1c,.034,.055,.004,sx-L/2+.055,.014,sz+W/2+.003); H.box(g,stein2,.044,.008,.006,sx-L/2+.055,.069,sz+W/2+.004);   // Tür mit Sturz
    [.025,.045].forEach(y=>H.box(g,P.eisen,.026,.003,.002,sx-L/2+.055,y,sz+W/2+.006));                                         // Beschläge
    H.box(g,P.stein3,.05,.006,.02,sx-L/2+.055,0,sz+W/2+.012);                                                                  // Stufe
    for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.box,H.mix(0x3e5a3a,0x2e4a2e,r()),.03+r()*.02,.04+r()*.04,.004,sx+L/2-.03-i*.02,.03+r()*.02,sz+W/2+.004));   // Efeu an der Ecke
    // Bibliotheksturm mit Glockenstube und Wetterfahne
    const tx=sx+L/2+.05, tz=sz-.02, th=.32;
    g.add(H.mesh(new H.THREE.CylinderGeometry(.056,.06,th,12),stein,1,1,1,tx,th/2,tz));
    for(const y of [.1,.2]) g.add(H.mesh(new H.THREE.CylinderGeometry(.062,.062,.008,12),stein2,1,1,1,tx,y,tz));
    for(let k=0;k<4;k++){ const a=k*Math.PI/2+.4; H.box(g,0x1e1a18,.018,.035,.004,tx+Math.sin(a)*.058,th-.055,tz+Math.cos(a)*.058,a); }
    H.gbox(g,P.fenster,.012,.03,.003,tx+Math.sin(.4)*.058,.13,tz+Math.cos(.4)*.058,.4);
    g.add(H.mesh(H.GEO.cone8,turmDach,.075,.16,.075,tx,th+.08,tz,Math.PI/8));
    H.box(g,P.eisen,.003,.04,.003,tx,th+.16,tz); const fa=H.mesh(H.GEO.box,P.gold,.02,.01,.002,tx+.01,th+.19,tz); g.add(fa);
    H.anim(fa,(t)=>{ fa.rotation.y=Math.sin(t*.3)*.6; });
    H.halo(g,tx,th-.04,tz,.07,0xffe0a0,.4);
    // Kreuzgang hinter dem Saal: Arkaden um einen grünen Hof mit Brunnen
    const kx=sx-.02, kz=sz-.2, KW=.26, KD=.15;
    H.box(g,0x5f8a4e,KW,.004,KD,kx,.002,kz);
    [[0,-KD/2,KW,0],[-KW/2,0,KD,Math.PI/2]].forEach(([dx,dz,l,ry])=>{ const n2=Math.round(l/.035);
      for(let i=0;i<=n2;i++){ const u=-l/2+i*l/n2; H.box(g,stein2,.008,.04,.008,kx+dx+Math.cos(ry)*u,0,kz+dz-Math.sin(ry)*u); }
      g.add(H.mesh(H.GEO.box,dach,l+.02,.008,.035,kx+dx,.046,kz+dz,ry)); });
    g.add(H.mesh(H.GEO.cyl8,stein2,.02,.02,.02,kx,.01,kz)); g.add(H.mesh(H.GEO.cyl8,0x2a4a5a,.015,.002,.015,kx,.021,kz));
    for(let i=0;i<4;i++) g.add(H.mesh(H.GEO.ico,H.pick(r,[0xc8402f,0xe0a030,0xa894d6]),.006,.006,.006,kx-.08+i*.05,.008,kz+.04));
    // Hof vor dem Saal: Pergament-Spannrahmen, Lesepult, Kräuterbeete, Mönche
    [[sx-.09,sz+.17,-.15],[sx-.02,sz+.2,.1],[sx+.05,sz+.17,.2]].forEach(([x,z,a])=>{ const q=new H.THREE.Group(); q.position.set(x,0,z); q.rotation.y=a; g.add(q);
      [-1,1].forEach(s=>H.box(q,P.holz2,.004,.08,.004,s*.028,0,0)); H.box(q,P.holz2,.06,.004,.004,0,.075,0); H.box(q,P.holz2,.06,.004,.004,0,.02,0);
      H.box(q,H.mix(0xeee2c8,0xd8c8a0,r()),.048,.05,.002,0,.023,.002); for(let k=0;k<4;k++) H.box(q,0x8a7a5a,.001,.001,.004,-.026+k*.017,.074,0); });
    H.box(g,P.holz2,.008,.05,.008,sx+.13,0,sz+.2); H.box(g,P.holz,.04,.004,.03,sx+.13,.05,sz+.2,.3); H.box(g,0xf0e6cc,.032,.003,.022,sx+.13,.054,sz+.2,.3);
    H.box(g,P.holz,.05,.03,.035,sx+.2,0,sz+.17,.2); for(let k=0;k<3;k++) H.box(g,H.pick(r,[P.tuch,P.tuch2,0x6a5a3a]),.01,.03,.025,sx+.185+k*.012,.03,sz+.17,.2);   // Bücherkiste
    for(let i=0;i<2;i++){ const x=sx-.27+i*.08, z=sz+.26; H.box(g,P.holz2,.06,.012,.04,x,0,z); for(let k=0;k<5;k++) g.add(H.mesh(H.GEO.ico,H.pick(r,[0x5f8a4e,0x7a9a5a,0x8a7aa8,0x6a8a4a]),.008,.01,.008,x-.022+k*.011,.016,z+(k%2-.5)*.012)); }
    const m1=figur(H,g,sx-.04,sz+.27,MOENCH,Math.PI/2); H.box(m1,0x7a2a1c,.012,.016,.004,0,.035,.009);
    const ph=r()*6; relAnim(H,m1,(t,b)=>{ const u=Math.sin(t*.25+ph); m1.position.x=b.x+u*.09; m1.rotation.y=Math.cos(t*.25+ph)>0?Math.PI/2:-Math.PI/2; m1.position.y=b.y+Math.abs(Math.sin(t*6))*.003; });
    figur(H,g,sx+.13,sz+.235,MOENCH,Math.PI);
    H.baum(g,sx-.32,sz+.1,.45,r,"laub");
  },
  performance(g,r,H){                                 // Wassermühle
    haus(H,g,-.1,-.08,.28,.2,.14,{dach:P.dach,kamin:true});
    const bach=new H.THREE.Mesh(new H.THREE.BoxGeometry(.14,.01,.9),H.M(P.wasser)); bach.position.set(.14,.005,0); bach.rotation.y=.15; H.leucht(bach); g.add(bach);
    const achse=new H.THREE.Group(); achse.position.set(.1,.11,-.02); achse.rotation.y=Math.PI/2+.15; g.add(achse);
    const rad=new H.THREE.Group(); achse.add(rad);
    const reif=new H.THREE.Mesh(H.GEO.torus,H.M(P.holz2)); reif.scale.set(.11,.11,.5); rad.add(reif);
    for(let i=0;i<10;i++){ const sch=new H.THREE.Group(); sch.rotation.z=i/10*6.283; rad.add(sch); sch.add(H.mesh(H.GEO.box,P.holz,.012,.11,.05,0,.055,0)); }
    H.anim(rad,(t)=>{ rad.rotation.z=-t*.8; });
    for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.ico,0xd9c9a0,.025,.03,.025,-.3+i*.05,.02,.26)); heu(H,g,-.36,.18); H.baum(g,.42,-.38,.5,r,"laub");
  },
  analyse(g,r,H){                                     // Sternwarte: runder Beobachtungsturm mit Zinnenkranz und drehbarer Kuppel samt Fernrohr,
                                                      // Gelehrtenhaus in Fachwerk, Armillarsphäre (dreht sich) und Sonnenuhr im Hof, Sterndeuter. Eine Form, Farbvarianz.
    const stein=ton(H,r,H.pick(r,[P.stein2,0xa8a090,0xb4ab9a,0x9a958c]),.03), stein2=H.mix(stein,0x000000,.15);
    const kuppel=H.pick(r,[0x5a8a7a,0x4f7a6e,P.schiefer,0x6a6e78]), MESS=0xc8a048, ROBE=H.pick(r,[0x2a3a6a,0x3a2a5a,0x2a4a4a]);
    const tx=-.1, tz=-.1, R=.1, TH=.34;
    // Turm: Sockel, Gesimse, Fenster im Wendel, Tür
    g.add(H.mesh(new H.THREE.CylinderGeometry(R+.015,R+.02,.02,16),P.stein3,1,1,1,tx,.01,tz));
    g.add(H.mesh(new H.THREE.CylinderGeometry(R,R*1.04,TH,16),stein,1,1,1,tx,.02+TH/2,tz));
    for(const y of [.12,.24]) g.add(H.mesh(new H.THREE.CylinderGeometry(R+.006,R+.006,.01,16),stein2,1,1,1,tx,y,tz));
    for(let k=0;k<5;k++){ const a=.55+k*1.25, y=.06+k*.055; H.gbox(g,P.fenster,.016,.026,.003,tx+Math.sin(a)*(R+.001),y,tz+Math.cos(a)*(R+.001),a); H.box(g,stein2,.024,.004,.006,tx+Math.sin(a)*(R+.003),y-.002,tz+Math.cos(a)*(R+.003),a); }
    const ta=.55; H.box(g,0x3a2a1c,.034,.06,.004,tx+Math.sin(ta)*(R+.002),.02,tz+Math.cos(ta)*(R+.002),ta); H.box(g,stein2,.046,.008,.008,tx+Math.sin(ta)*(R+.004),.08,tz+Math.cos(ta)*(R+.004),ta);
    // Zinnenkranz und Plattform
    const yP=.02+TH; g.add(H.mesh(new H.THREE.CylinderGeometry(R+.012,R+.006,.016,16),stein2,1,1,1,tx,yP+.008,tz));
    for(let k=0;k<12;k++){ const a=k/12*6.283; H.box(g,stein,.026,.022,.016,tx+Math.sin(a)*(R+.004),yP+.016,tz+Math.cos(a)*(R+.004),a); }
    // Kuppel mit Spalt und Fernrohr: dreht sich langsam
    const kg=new H.THREE.Group(); kg.position.set(tx,yP+.016,tz); g.add(kg);
    kg.add(H.mesh(new H.THREE.CylinderGeometry(R*.82,R*.82,.03,16),stein,1,1,1,0,.015,0));
    kg.add(H.mesh(H.GEO.dome20,kuppel,R*.8,R*.7,R*.8,0,.03,0));
    kg.add(H.mesh(H.GEO.box,0x141418,.032,.004,.07,0,.03+R*.52,R*.42,0,.85,0));   // Spalt in der Kuppel
    const rohr=new H.THREE.Group(); rohr.position.set(0,.05,R*.25); rohr.rotation.x=.95; kg.add(rohr);
    rohr.add(H.mesh(H.GEO.cyl8,MESS,.012,.16,.012,0,.08,0)); rohr.add(H.mesh(H.GEO.cyl8,MESS,.016,.02,.016,0,.16,0)); rohr.add(H.mesh(H.GEO.cyl8,0x3a3020,.008,.03,.008,0,-.005,0));
    kg.add(H.mesh(H.GEO.cyl8,MESS,.006,.03,.006,0,.03+R*.7+.012,0)); kg.add(H.mesh(H.GEO.ico,MESS,.012,.012,.012,0,.03+R*.7+.03,0));
    H.anim(kg,(t)=>{ kg.rotation.y=Math.sin(t*.12)*1.4; });
    // Gelehrtenhaus
    fachwerkhaus(H,g,.2,-.16,-.5,{r,w:.22,d:.14,h:.1,dachH:.1,putz:H.pick(r,PUTZE),balken:H.pick(r,BALKEN),dach:H.pick(r,[P.schiefer,...ZIEGEL]),laden:H.pick(r,LAEDEN)});
    // Hof: Weg, Armillarsphäre, Sonnenuhr, Bank mit Büchern, Laterne
    for(let i=0;i<6;i++) H.box(g,H.mix(P.stein3,0xffffff,r()*.15),.05,.004,.035,tx+.05+i*.035,.002,tz+.14+i*.035,.8+(r()-.5)*.2);
    const ax=.1, az=.2; g.add(H.mesh(H.GEO.cyl8,stein2,.028,.012,.028,ax,.006,az)); g.add(H.mesh(H.GEO.cyl8,stein,.014,.07,.014,ax,.047,az));
    const ar=new H.THREE.Group(); ar.position.set(ax,.118,az); g.add(ar);
    [[0,0,0],[Math.PI/2,0,0],[0,0,Math.PI/2],[.41,0,0]].forEach(([rx,ry,rz],i)=>{ const ring=new H.THREE.Mesh(H.GEO.torus,H.M(i===3?0xe0b860:MESS)); ring.scale.set(.034,.034,i===3?.08:.05); ring.rotation.set(rx,ry,rz); ar.add(ring); });
    ar.add(H.mesh(H.GEO.ico,0x3a6aa8,.009,.009,.009,0,0,0)); ar.add(H.mesh(H.GEO.cyl8,MESS,.002,.085,.002,0,0,0,0,0,.41));
    H.anim(ar,(t)=>{ ar.rotation.y=t*.35; });
    const sx=-.24, sz=.18; g.add(H.mesh(H.GEO.cyl12,stein,.04,.03,.04,sx,.015,sz)); g.add(H.mesh(H.GEO.cyl12,0xe8e0cc,.036,.003,.036,sx,.031,sz));
    for(let k=0;k<12;k++){ const a=k/12*6.283; H.box(g,0x3a3020,.002,.001,.008,sx+Math.sin(a)*.03,.0325,sz+Math.cos(a)*.03,a); }
    g.add(H.mesh(H.GEO.box,0x3a3020,.003,.03,.022,sx,.045,sz,.4,0,0));
    H.box(g,P.holz,.07,.006,.02,.26,.025,.1,-.5); [-1,1].forEach(s=>H.box(g,P.holz2,.004,.025,.016,.26+s*.028*Math.cos(.5),0,.1+s*.028*Math.sin(.5),-.5));
    for(let k=0;k<3;k++) H.box(g,H.pick(r,[P.tuch,P.tuch2,0x6a5a3a]),.012,.008+k*.002,.016,.25+k*.012,.031,.1,-.5);
    H.box(g,P.eisen,.004,.12,.004,-.3,0,.0); H.gbox(g,P.fenster,.014,.018,.014,-.3,.12,.0); H.halo(g,-.3,.13,.0,.1,0xffc870,.45);
    // Sterndeuter an der Sphäre, ein Gehilfe mit Schriftrolle
    const ast=figur(H,g,ax-.05,az+.04,ROBE,2.2); ast.add(H.mesh(H.GEO.cone8,ROBE,.012,.03,.012,0,.09,0)); ast.add(H.mesh(H.GEO.box,0xe0b89a,.003,.025,.003,.008,.065,.01,0,0,-.9));
    const geh=figur(H,g,.2,.05,H.pick(r,[0x5a4632,0x6a5a3a]),-2.4); geh.add(H.mesh(H.GEO.cyl8,0xeee2c8,.005,.02,.005,.012,.05,.008,0,0,Math.PI/2));
    // Stern über dem Turm, Baum
    const stern=H.halo(g,tx+.12,.68,tz+.08,.09,0xfff2c0,.9); H.anim(stern,(t)=>{ stern.material.opacity=.5+.4*Math.abs(Math.sin(t*1.7)); });
    H.baum(g,-.42,.32,.5,r,"laub"); H.baum(g,.44,.34,.45,r,"nadel");
  },
  probe(g,r,H){                                       // Alchemistenturm: runder Turm mit spitzem Helm und Sternfahne, offenes Labor unter einem Pultdach (hohe Seite vorn, man sieht hinein)
                                                      // mit Athanor (Ofen, Glut, farbiger Rauch), Destillierhelm und Vorlage, Kolben auf dem Tisch; draußen Kessel auf dem Dreibein (brodelt),
                                                      // Probenständer mit Röhrchen und Waage, Kräutergarten, Gehilfe holt Kräuter. Bedeutung „Verhalten im Versuch geprüft und belegt“. Eine Form, Farbvarianz.
    const stein=ton(H,r,H.pick(r,[P.stein2,0xa8a090,0xb4ab9a,0x9a958c]),.04), stein2=H.mix(stein,0x000000,.15), helm=H.pick(r,[0x3f3a5a,0x4b505c,0x4a3a5a,0x5a3a3a]);
    const holz=H.pick(r,[0x6a4a30,0x5e4a3a,0x7c5738]), holz2=H.mix(holz,0x000000,.3), ROBE=H.pick(r,[0x3a2a5a,0x2a3a5a,0x4a2a3a,0x2a4a3a]);
    const SAFT=H.pick(r,[[0x7aff9a,0xc07aff,0x7ad8ff],[0xffb04a,0x7aff9a,0xff6ab0],[0x7ad8ff,0xffe07a,0xc07aff]]), fest=H.rng("alchemist-form"), KUPFER=0xb8704a;
    // Turm
    const tx=-.18, tz=-.16, R=.085, TH=.36;
    g.add(H.mesh(new H.THREE.CylinderGeometry(R+.012,R+.018,.024,14),P.stein3,1,1,1,tx,.012,tz));
    g.add(H.mesh(new H.THREE.CylinderGeometry(R,R*1.06,TH,14),stein,1,1,1,tx,.024+TH/2,tz));
    for(const y of [.14,.26]) g.add(H.mesh(new H.THREE.CylinderGeometry(R+.005,R+.005,.01,14),stein2,1,1,1,tx,y,tz));
    // vorkragendes Fachwerk-Obergeschoss mit Knaggen, darüber der Helm
    const y0=.024+TH, OR=R+.016, OH=.085, putz=H.pick(r,PUTZE), balk=H.pick(r,BALKEN);
    g.add(H.mesh(new H.THREE.CylinderGeometry(OR+.004,OR+.004,.01,12),balk,1,1,1,tx,y0+.005,tz));
    g.add(H.mesh(new H.THREE.CylinderGeometry(OR,OR,OH,12),putz,1,1,1,tx,y0+.01+OH/2,tz));
    for(let i=0;i<12;i++){ const a=i/12*6.283+Math.PI/12; H.box(g,balk,.007,OH,.004,tx+Math.sin(a)*(OR+.001),y0+.01,tz+Math.cos(a)*(OR+.001),a);
      g.add(H.mesh(H.GEO.box,balk,.006,.026,.006,tx+Math.sin(a)*(R+.006),y0-.012,tz+Math.cos(a)*(R+.006),a,i%2?0:0,0)); }
    for(const yy of [y0+.01+OH*.45,y0+.01+OH-.006]) g.add(H.mesh(new H.THREE.CylinderGeometry(OR+.002,OR+.002,.006,12),balk,1,1,1,tx,yy,tz));
    [[.3,SAFT[1]],[2.4,P.fenster],[4.3,SAFT[0]]].forEach(([a,c])=>{ H.gbox(g,c,.022,.026,.003,tx+Math.sin(a)*(OR+.002),y0+.04,tz+Math.cos(a)*(OR+.002),a); });
    const hm=new H.THREE.Mesh(new H.THREE.ConeGeometry(OR+.022,.2,12),H.M(helm)); hm.position.set(tx,y0+.01+OH+.1,tz); hm.castShadow=true; g.add(hm);
    H.box(g,P.gold,.004,.06,.004,tx,y0+.01+OH+.19,tz); [0,Math.PI/4,Math.PI/2,Math.PI*.75].forEach(a=>g.add(H.mesh(H.GEO.box,P.gold,.026,.005,.004,tx,y0+.01+OH+.25,tz,0,0,a)));
    { const ga=.3, gx=tx+Math.sin(ga)*(OR+.0), gz=tz+Math.cos(ga)*(OR+.0), gy=y0+.01+OH+.03; H.box(g,putz,.03,.03,.03,gx,gy,gz,ga); giebel(H,g,gx,gy+.03,gz,.04,.03,.036,helm,ga); H.gbox(g,SAFT[2],.014,.016,.003,gx+Math.sin(ga)*.016,gy+.007,gz+Math.cos(ga)*.016,ga); }   // Gaube
    { const rb=new H.THREE.Group(); rb.position.set(tx+.03,y0+.01+OH+.075,tz+.0); g.add(rb); rb.add(H.mesh(H.GEO.ico,0x1a1a20,.012,.01,.008,0,0,0)); rb.add(H.mesh(H.GEO.ico,0x1a1a20,.006,.006,.006,.01,.008,0)); rb.add(H.mesh(H.GEO.box,0xc89a3a,.006,.002,.002,.017,.007,0)); }   // Rabe auf dem Helm   // Sternfahne
    [[.4,.09,SAFT[0]],[1.7,.2,SAFT[1]],[3.1,.31,SAFT[2]],[-1.1,.18,P.fenster]].forEach(([a,y,c])=>{ H.gbox(g,c,.018,.03,.003,tx+Math.sin(a)*(R+.001),y,tz+Math.cos(a)*(R+.001),a);
      H.box(g,stein2,.026,.005,.006,tx+Math.sin(a)*(R+.003),y-.003,tz+Math.cos(a)*(R+.003),a); });
    const ta=.75; H.box(g,0x3a2a1c,.034,.062,.004,tx+Math.sin(ta)*(R+.002),.024,tz+Math.cos(ta)*(R+.002),ta); H.box(g,stein2,.046,.008,.008,tx+Math.sin(ta)*(R+.004),.086,tz+Math.cos(ta)*(R+.004),ta);
    H.box(g,stein2,.05,.012,.03,tx+Math.sin(ta)*(R+.018),0,tz+Math.cos(ta)*(R+.018),ta);
    // Labor unter Pultdach: hinten niedrig, vorn hoch
    const lx=.13, lz=-.12, W=.26, D=.17, HB=.115, HV=.17;
    const k=new H.THREE.Group(); k.position.set(lx,0,lz); g.add(k);
    H.box(k,0x5e5246,W+.02,.008,D+.02,0,0,0);
    H.box(k,stein,W,HB,.024,0,.008,-D/2+.012);                                                                  // Rückwand
    [-1,1].forEach(sd=>{ H.box(k,holz2,.014,HV,.014,sd*(W/2-.007),.008,D/2-.007); H.box(k,holz2,.014,HB,.014,sd*(W/2-.007),.008,-D/2+.02);
      k.add(H.mesh(H.GEO.box,holz,.012,.012,Math.hypot(D,HV-HB)+.01,sd*(W/2-.007),.008+(HB+HV)/2,0,0,-Math.atan2(HV-HB,D),0)); });
    H.box(k,holz,W+.012,.014,.016,0,.008+HV-.014,D/2-.007);
    const dl=Math.hypot(D+.05,HV-HB); k.add(H.mesh(H.GEO.box,H.pick(r,[P.reet,0x7a4a36,0x5c6370]),W+.05,.012,dl,0,.008+(HB+HV)/2+.012,.0,0,-Math.atan2(HV-HB,D),0));
    // Werktisch an der Rückwand mit Kolben, Mörser, Büchern
    const bz=-D/2+.05; H.box(k,holz,.17,.008,.045,.04,.05,bz); [-1,1].forEach(s=>[-1,1].forEach(e=>H.box(k,holz2,.006,.05,.006,.04+s*.08,0,bz+e*.018)));
    for(let i=0;i<4;i++){ const x=.0+i*.03, c=SAFT[i%3]; k.add(H.mesh(H.GEO.ico,0xdfe8e0,.011,.011,.011,x,.069,bz-.004)); H.gbox(k,c,.012,.012,.012,x,.058,bz-.004); H.box(k,0xdfe8e0,.004,.016,.004,x,.076,bz-.004); }
    k.add(H.mesh(H.GEO.cyl8,stein2,.01,.012,.01,.1,.064,bz+.01)); H.box(k,H.pick(r,[P.tuch,P.tuch2,0x6a5a3a]),.025,.006,.018,.115,.058,bz-.01,.3);
    H.box(k,holz2,.15,.006,.012,.04,.1,-D/2+.028); for(let i=0;i<6;i++) H.gbox(k,SAFT[i%3],.008,.016,.008,-.02+i*.024,.106,-D/2+.028);   // Regal mit Phiolen
    // Athanor (Ofen) links unter dem Dach, Destillierhelm, Vorlage, Rauchrohr durchs Dach
    const ox=-.07, oz=-.02;
    k.add(H.mesh(H.GEO.cyl12,stein2,.036,.06,.036,ox,.03,oz)); k.add(H.mesh(H.GEO.dome20,stein2,.036,.028,.036,ox,.06,oz));
    H.gbox(k,P.glut,.022,.016,.004,ox,.012,oz+.036);
    k.add(H.mesh(H.GEO.cyl8,KUPFER,.018,.03,.018,ox,.1,oz)); k.add(H.mesh(H.GEO.ico,KUPFER,.016,.016,.016,ox,.122,oz));
    k.add(H.mesh(H.GEO.box,KUPFER,.06,.004,.004,ox+.03,.11,oz,0,0,-.35));                                       // Schnabel zur Vorlage
    k.add(H.mesh(H.GEO.ico,0xdfe8e0,.014,.014,.014,ox+.064,.08,oz)); H.gbox(k,SAFT[0],.016,.012,.016,ox+.064,.072,oz);
    H.box(k,holz2,.024,.06,.024,ox+.064,0,oz);
    k.add(H.mesh(H.GEO.cyl8,0x3a3632,.008,.13,.008,ox,.195,oz-.01));
    H.rauch(k,ox,oz-.01,.25,.55,SAFT[1],.27);
    const og=H.halo(k,ox,.03,oz+.04,.16,0xff8a3a,.7); H.anim(og,(t)=>{ og.material.opacity=.5+.25*Math.sin(t*4)*Math.sin(t*1.7); });
    const al=figur(H,g,lx+.05,lz-.0,ROBE,Math.PI); g.add(H.mesh(H.GEO.cone8,ROBE,.014,.04,.014,lx+.05,.098,lz)); H.box(al,0xd8d0c0,.012,.016,.004,0,.04,.009);   // Alchemist mit Spitzhut
    // Blasen im Kolben auf dem Tisch
    for(let i=0;i<3;i++){ const b=H.mesh(H.GEO.ico,SAFT[0],.004,.004,.004,lx+.0,.07,lz+bz-.004); H.leucht(b); g.add(b); const ph=i/3;
      relAnim(H,b,(t,bb)=>{ const u=(t*.9+ph)%1; b.position.y=bb.y+u*.03; b.visible=u<.9; }); }
    // Kessel auf dem Dreibein draußen, brodelt
    const kx=.02, kz=.17;
    for(let i=0;i<3;i++){ const a=i/3*6.283; g.add(H.mesh(H.GEO.box,holz2,.006,.075,.006,kx+Math.cos(a)*.025,.035,kz+Math.sin(a)*.025,-a,0,0)); }
    g.add(H.mesh(H.GEO.dome20,0x2a2a2e,.03,.03,.03,kx,.06,kz,0,Math.PI,0)); { const sf=H.mesh(H.GEO.cyl12,SAFT[2],.028,.004,.028,kx,.058,kz); H.leucht(sf); g.add(sf); }
    H.gbox(g,P.glut,.03,.01,.03,kx,.004,kz); const kh=H.halo(g,kx,.07,kz,.16,SAFT[2],.6); H.anim(kh,(t)=>{ kh.material.opacity=.4+.2*Math.sin(t*3.1); });
    for(let i=0;i<4;i++){ const b=H.mesh(H.GEO.ico,SAFT[2],.005,.005,.005,kx+(fest()-.5)*.03,.064,kz+(fest()-.5)*.03); H.leucht(b); g.add(b); const ph=i/4;
      relAnim(H,b,(t,bb)=>{ const u=(t*.7+ph)%1; b.position.y=bb.y+u*.05; b.scale.setScalar(.005*(1+u)); b.visible=u<.85; }); }
    // Probenständer mit Röhrchen und Waage
    const sx=.27, sz=.17; H.box(g,holz,.1,.006,.05,sx,.05,sz); [-1,1].forEach(s=>[-1,1].forEach(e=>H.box(g,holz2,.006,.05,.006,sx+s*.042,0,sz+e*.018)));
    H.box(g,holz2,.07,.006,.016,sx-.01,.056,sz-.008); for(let i=0;i<6;i++){ H.box(g,0xdfe8e0,.006,.03,.006,sx-.04+i*.012,.056,sz-.008); H.gbox(g,SAFT[i%3],.006,.012+(i%3)*.004,.006,sx-.04+i*.012,.058,sz-.008); }
    H.box(g,KUPFER,.003,.03,.003,sx+.03,.056,sz+.01); H.box(g,KUPFER,.036,.003,.003,sx+.03,.086,sz+.01); [-1,1].forEach(s=>g.add(H.mesh(H.GEO.cyl8,KUPFER,.009,.003,.009,sx+.03+s*.016,.075,sz+.01)));
    // Kräutergarten mit Flechtzaun, Gehilfe holt Kräuter zum Kessel
    const gx=-.21, gz=.2;
    for(let i=0;i<3;i++){ const x=gx-.08+i*.08; H.box(g,0x5a4a34,.06,.012,.1,x,0,gz); H.box(g,0x8a6a40,.064,.014,.004,x,0,gz-.052); H.box(g,0x8a6a40,.064,.014,.004,x,0,gz+.052);
      for(let k2=0;k2<6;k2++) g.add(H.mesh(H.GEO.ico,H.pick(r,[0x5f8a4e,0x7a9a5a,0x8a7aa8,0x6a8a4a,0xc8a03a,0xa85a7a]),.009,.012,.009,x+((k2%2)-.5)*.024,.018,gz-.035+Math.floor(k2/2)*.035,fest()*3)); }
    const gh=figur(H,g,gx+.1,gz-.02,H.pick(r,[0x6a5a3a,0x5a6a4a,0x7a4a3a]),0), korb=H.mesh(H.GEO.cyl8,0xb89a60,.014,.012,.014,.012,.045,.006); gh.add(korb);
    const A=[gx+.1,gz-.02], B=[kx-.04,kz+.01], phg=fest()*6, rich=Math.atan2(B[0]-A[0],B[1]-A[1]);
    relAnim(H,gh,(t,b)=>{ const u=((t*.08+phg)%1), hin=u<.5, q=hin?u*2:2-u*2, s=q*q*(3-2*q);
      gh.position.x=b.x+(B[0]-A[0])*s; gh.position.z=b.z+(B[1]-A[1])*s; gh.position.y=b.y+Math.abs(Math.sin(t*9))*.003; gh.rotation.y=rich+(hin?0:Math.PI); });
    H.baum(g,.42,-.3,.5,r,"nadel");
  },
  typing(g,r,H){                                      // Steinmetzhütte (Bauhütte): offene Werkhütte mit Bretterwand, Schablonen und Werkzeugbrett, Steinmetz an der Bank (Klöpfel schlägt),
                                                      // Schleifstein (dreht sich), Rohblöcke hinten, Dreibock mit Steinzange, fertige Werkstücke vorn (Säulentrommeln, Kapitell, Maßwerkrosette, Quader).
                                                      // Bedeutung „Jedes Teil bekommt seine genaue Form“: vom rohen Block über die Schablone zum fertigen Stück. Eine Form, Farbvarianz.
    const stein=ton(H,r,H.pick(r,[0xd8c49a,0xc89878,0xbdb3a2,0xe0d6c0,0xc8b48a]),.03), stein2=H.mix(stein,0x000000,.14), roh=H.mix(stein,0x6a5a48,.3);
    const holz=H.pick(r,[0x7c5738,0x6a4a30,0x8a6a48,0x5e4a3a]), holz2=H.mix(holz,0x000000,.3), dach=ton(H,r,H.pick(r,[P.reet,P.reet,0x4f5562,...ZIEGEL]),.06);
    const KITTEL=H.pick(r,[0x8a7a5a,0x6a6a5a,0x7a5a3a,0x5a6a7a]), fest=H.rng("steinmetz-form"), SCHABLONE=0xd8c08a;
    // Werkhütte: offen nach vorn, Bretterwand hinten und links, Satteldach
    const hx=-.12, hz=-.15, W=.36, D=.2, HH=.15;
    const k=new H.THREE.Group(); k.position.set(hx,0,hz); g.add(k);
    H.box(k,0x6e6252,W+.03,.008,D+.03,0,0,0);
    for(let i=0;i<=3;i++){ const x=-W/2+i*W/3; [-1,1].forEach(sd=>H.box(k,holz2,.014,HH,.014,x,.008,sd*D/2)); }
    [-1,1].forEach(sd=>H.box(k,holz,W+.014,.014,.016,0,.008+HH-.014,sd*D/2));
    for(let i=0;i<=3;i++){ const x=-W/2+i*W/3; [-1,1].forEach(s=>{ if((i===0&&s<0)||(i===3&&s>0)) return; k.add(H.mesh(H.GEO.box,holz2,.05,.008,.008,x+s*.018,.008+HH-.032,D/2,0,0,Math.atan2(.036,s*.036))); }); }   // Kopfbänder vorn
    H.box(k,holz,W,HH-.002,.008,0,.008,-D/2-.004); for(let i=1;i<12;i++) H.box(k,holz2,.002,HH-.002,.002,-W/2+i*W/12,.008,-D/2+.001);          // Bretterwand hinten
    H.box(k,holz,.008,HH-.002,D,-W/2-.004,.008,0); for(let i=1;i<7;i++) H.box(k,holz2,.002,HH-.002,.002,-W/2+.001,.008,-D/2+i*D/7);            // Bretterwand links
    [-1,1].forEach(e=>giebel(H,k,e*(W/2+.002),.008+HH,0,D+.014,.085,.006,holz,Math.PI/2));
    satteldach(H,k,.008+HH,D+.05,.1,W+.07,dach,holz2);
    H.box(k,P.eisen,.012,.004,.012,.09,.008+HH-.03,.02); H.gbox(k,0xffc870,.008,.012,.008,.09,.008+HH-.044,.02); H.halo(k,.09,.008+HH-.04,.02,.22,0xffc870,.5);   // Laterne unterm Dach
    // Schablonen an der Rückwand (Bogen, Giebel, Profil) und Werkzeugbrett mit Meißeln
    const zb=-D/2+.004;
    [[-.14,.075,"bogen"],[-.09,.085,"giebel"],[-.04,.07,"profil"],[.01,.088,"bogen"]].forEach(([x,y,art])=>{ H.box(k,SCHABLONE,.038,.042,.003,x,y,zb);
      if(art==="bogen") k.add(H.mesh(H.GEO.cyl12,holz2,.013,.004,.013,x,y+.012,zb+.001,0,Math.PI/2,0));
      if(art==="giebel") giebel(H,k,x,y+.008,zb+.002,.026,.022,.003,holz2);
      if(art==="profil"){ H.box(k,holz2,.012,.02,.004,x-.008,y+.006,zb+.001); H.box(k,holz2,.024,.008,.004,x,y+.026,zb+.001); }
      H.box(k,P.eisen,.003,.003,.004,x,y+.04,zb+.002); });
    H.box(k,holz2,.09,.008,.012,.1,.105,zb+.006); for(let i=0;i<6;i++) H.box(k,i%3?P.eisen:holz2,.003,.026-(i%2)*.006,.003,.064+i*.014,.078+(i%2)*.006,zb+.008);
    H.box(k,P.eisen,.03,.003,.003,.1,.06,zb+.004); H.box(k,P.eisen,.003,.03,.003,.086,.033,zb+.004);                                                // Winkeleisen
    // Bank: zwei Böcke, Werkstein mit angefangenem Profil; Steinmetz mit Klöpfel und Meißel
    const bx=.0, bz=.0;
    [-1,1].forEach(s=>{ H.box(k,holz2,.012,.045,.05,bx+s*.04,.008,bz); H.box(k,holz,.016,.006,.056,bx+s*.04,.053,bz); });
    H.box(k,stein,.1,.04,.055,bx,.059,bz); H.box(k,stein2,.04,.012,.055,bx+.03,.099,bz); H.box(k,stein,.058,.006,.04,bx-.018,.099,bz);
    const sm=figur(H,k,bx,bz+.065,KITTEL,Math.PI); H.box(sm,0xe8e0cc,.022,.022,.004,0,.032,.009);                                                      // Schurz
    H.box(k,P.eisen,.003,.026,.003,bx-.004,.1,bz+.026);                                                                                                // Meißel
    const kl=new H.THREE.Group(); kl.position.set(hx+bx+.012,.13,hz+bz+.03); g.add(kl);                                                                  // Klöpfel (Holzkeule)
    kl.add(H.mesh(H.GEO.cyl8,holz,.014,.022,.014,0,.012,0)); kl.add(H.mesh(H.GEO.box,holz2,.004,.022,.004,0,-.008,.004,0,.4,0));
    relAnim(H,kl,(t,b)=>{ const u=(t*1.6)%1, hub=u<.75?Math.sin(u/.75*Math.PI/2)*.03:.03*(1-(u-.75)/.25); kl.position.y=b.y+hub; });
    for(let i=0;i<10;i++) g.add(H.mesh(H.GEO.ico,H.mix(stein,0xffffff,.15),.004+fest()*.004,.003,.004+fest()*.004,hx+bx+(fest()-.5)*.14,.01,hz+bz+.02+(fest()-.5)*.08,fest()*3));   // Splitter
    // Schleifstein rechts neben der Hütte (dreht sich), Geselle hält ein Eisen daran
    const sx=.17, sz=-.17;
    H.box(g,holz,.08,.03,.04,sx,0,sz); H.box(g,0x3a5a6a,.07,.004,.032,sx,.03,sz); [-1,1].forEach(s=>H.box(g,holz2,.01,.07,.01,sx+s*.03,0,sz));
    const ss=new H.THREE.Group(); ss.position.set(sx,.072,sz); g.add(ss);
    ss.add(H.mesh(H.GEO.cyl12,H.mix(stein2,0x6a6a6a,.4),.042,.014,.042,0,0,0,0,Math.PI/2,0)); ss.add(H.mesh(H.GEO.box,P.eisen,.006,.006,.03,0,0,0));
    ss.add(H.mesh(H.GEO.box,P.eisen,.004,.03,.004,0,.015,.02)); ss.add(H.mesh(H.GEO.box,holz2,.004,.004,.016,0,.028,.028));                              // Kurbel
    H.anim(ss,(t)=>{ ss.rotation.z=-t*2.2; });
    figur(H,g,sx-.065,sz,KITTEL,Math.PI/2); H.box(g,P.eisen,.03,.003,.003,sx-.04,.075,sz);
    // Rohblöcke aus dem Bruch hinten rechts
    [[.3,-.3,.07,.05,.06,.3],[.37,-.2,.06,.045,.07,-.4],[.29,-.21,.065,.05,.05,.8],[.31,-.27,.055,.04,.05,.1,.05]].forEach(([x,z,a,b,c,ry,y=0])=>{
      g.add(H.mesh(H.GEO.box,ton(H,fest,roh,.06),a,b,c,x,y+b/2,z,ry,(fest()-.5)*.08,(fest()-.5)*.08)); });
    for(let i=0;i<5;i++) g.add(H.mesh(H.GEO.ico,roh,.012+fest()*.01,.01,.012,.24+fest()*.16,.006,-.36+fest()*.08,fest()*3));
    // Dreibock mit Steinzange: hebt einen Quader auf die Schubkarre
    const dx=.28, dz=.04, DH=.25, legs=[[.08,0],[-.05,.07],[-.05,-.07]], up=new H.THREE.Vector3(0,1,0);
    legs.forEach(([lx,lz])=>{ const a=new H.THREE.Vector3(dx+lx,0,dz+lz), c=new H.THREE.Vector3(dx,DH,dz), v=c.clone().sub(a), L=v.length();
      const m=H.mesh(H.GEO.box,holz2,.012,L+.01,.012,(a.x+c.x)/2,DH/2,(a.z+c.z)/2); m.quaternion.setFromUnitVectors(up,v.normalize()); g.add(m); });
    H.box(g,P.eisen,.016,.012,.016,dx,DH-.006,dz); H.box(g,P.balken,.002,DH-.11,.002,dx,.11,dz);
    [-1,1].forEach(s=>g.add(H.mesh(H.GEO.box,P.eisen,.003,.03,.003,dx+s*.012,.1,dz,0,0,s*.35)));
    H.box(g,stein,.06,.042,.045,dx,.045,dz);
    figur(H,g,dx-.06,dz+.07,H.pick(r,[0x6a5a3a,0x4a5a6a,0x7a4a3a]),-2.2);
    const kr=new H.THREE.Group(); kr.position.set(dx-.02,0,dz+.13); kr.rotation.y=.3; g.add(kr);                                                       // Schubkarre
    H.box(kr,holz,.07,.02,.05,0,.02,0); const rad=new H.THREE.Mesh(H.GEO.torus,H.M(P.balken)); rad.scale.set(.018,.018,.08); rad.position.set(.05,.018,0); kr.add(rad);
    [-1,1].forEach(s=>{ H.box(kr,holz2,.1,.006,.006,-.02,.03,s*.022); H.box(kr,holz2,.006,.02,.006,-.025,0,s*.02); });
    // Fertige Werkstücke vorn: Säulentrommeln, Kapitell, Maßwerkrosette auf Kanthölzern, gestapelte Quader
    [[-.3,.14],[-.24,.18]].forEach(([x,z],i)=>{ g.add(H.mesh(H.GEO.cyl12,stein,.032,.05,.032,x,.025,z)); for(let q=0;q<3;q++) H.box(g,stein2,.004,.05,.004,x+Math.sin(q*2.1)*.03,0,z+Math.cos(q*2.1)*.03); });
    g.add(H.mesh(H.GEO.cyl12,stein,.032,.05,.032,-.29,.032,.24,0,0,Math.PI/2));
    const kx=-.18, kz=.26, KY=.06; H.box(g,stein2,.05,.01,.05,kx,0,kz,.2); g.add(H.mesh(H.GEO.cyl12,stein,.022,KY,.022,kx,.01+KY/2,kz)); g.add(H.mesh(H.GEO.cone8,stein,.036,.026,.036,kx,.01+KY+.013,kz,Math.PI/8,Math.PI)); H.box(g,stein2,.06,.012,.06,kx,.01+KY+.026,kz,.2);
    for(let q=0;q<4;q++){ const a=q*Math.PI/2+.2; g.add(H.mesh(H.GEO.ico,stein2,.008,.01,.006,kx+Math.sin(a)*.024,.01+KY+.016,kz+Math.cos(a)*.024,a)); }        // Knospen am Kapitell
    const rx=-.04, rz=.3, RR=.05; [-1,1].forEach(s=>H.box(g,holz2,.012,.012,.05,rx+s*.035,0,rz));
    const ros=new H.THREE.Group(); ros.position.set(rx,.012+RR,rz); ros.rotation.x=-.12; g.add(ros);
    const rg=new H.THREE.Mesh(H.GEO.torus,H.M(stein)); rg.scale.set(RR,RR,.15); ros.add(rg);
    for(let q=0;q<3;q++){ const a=q/3*6.283+Math.PI/2, p=new H.THREE.Mesh(H.GEO.torus,H.M(stein)); p.scale.set(RR*.36,RR*.36,.15); p.position.set(Math.cos(a)*RR*.45,Math.sin(a)*RR*.45,0); ros.add(p); }
    ros.add(H.mesh(H.GEO.cyl8,stein2,.008,.012,.008,0,0,0,0,Math.PI/2,0));
    for(let i=0;i<3;i++) for(let j=0;j<(i===2?1:2);j++) H.box(g,(i+j)%2?stein:H.mix(stein,0xffffff,.06),.05,.03,.04,.1+j*.052+(i===2?.026:0),i*.0305,.27+(i%2)*.004);   // Quader
    // Baum
    H.baum(g,-.42,.04,.5,r,"laub");
  },
  pipeline(g,r,H){                                    // Kornspeicher: der Weg vom Halm zum Vorrat. Erntewagen mit Ochse bringt Garben, auf der Dreschtenne schlagen zwei Drescher
                                                      // im Wechsel mit Flegeln, eine Magd worfelt, ein Knecht trägt Säcke zum Speicher. Speicher auf Stelzensteinen (gegen Mäuse) mit Aufzug im Giebel.
                                                      // Bedeutung „Rohes wird gesammelt, verarbeitet, gelagert“. Eine Form, Farbvarianz.
    const holz=H.pick(r,[0x7c5738,0x6a4a30,0x8a6a48,0x5e4a3a]), holz2=H.mix(holz,0x000000,.3), dach=ton(H,r,H.pick(r,[P.reet,P.reet,0x7a4a36,...ZIEGEL]),.06);
    const stein=ton(H,r,H.pick(r,[P.stein,0xb4ab9a,0xc8bca6]),.04), KITTEL=H.pick(r,[0x8a7a5a,0x6a5a3a,0x7a4a3a,0x5a6a7a]), KORN=0xd2b060, SACK=0xd8c8a0, fest=H.rng("kornspeicher-form");
    // Speicher auf Stelzensteinen
    const sx=.12, sz=-.14, W=.3, D=.2, HU=.065, HW=.12;
    const k=new H.THREE.Group(); k.position.set(sx,0,sz); g.add(k);
    for(let i=0;i<4;i++) [-1,1].forEach(sd=>{ const x=-W/2+.02+i*(W-.04)/3, z=sd*(D/2-.02);
      k.add(H.mesh(H.GEO.cyl8,stein,.014,HU-.012,.014,x,(HU-.012)/2,z)); k.add(H.mesh(H.GEO.cyl8,H.mix(stein,0x000000,.12),.026,.012,.026,x,HU-.006,z)); });
    H.box(k,holz2,W+.012,.01,D+.012,0,HU,0);                                                                       // Schwellenkranz
    H.box(k,holz,W,HW,D,0,HU+.01,0);
    for(let i=1;i<14;i++) [-1,1].forEach(sd=>H.box(k,holz2,.002,HW,.002,-W/2+i*W/14,HU+.01,sd*(D/2+.001)));         // Bohlenfugen
    [-1,1].forEach(sd=>{ for(let i=1;i<9;i++) H.box(k,holz2,.002,HW,.002,sd*(W/2+.001),HU+.01,-D/2+i*D/9); });
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>H.box(k,holz2,.012,HW,.012,a*(W/2),HU+.01,b*(D/2)));             // Eckständer
    const yT=HU+.01+HW; H.box(k,holz2,W+.012,.01,D+.012,0,yT-.01,0);
    [-1,1].forEach(e=>giebel(H,k,e*(W/2+.002),yT,0,D+.012,.13,.006,holz,Math.PI/2));
    satteldach(H,k,yT,D+.07,.15,W+.06,dach,holz2);
    H.box(k,0x2a2018,.034,.06,.004,0,HU+.012,D/2+.002); H.box(k,holz2,.042,.006,.006,0,HU+.072,D/2+.004); H.box(k,P.eisen,.026,.003,.002,0,HU+.04,D/2+.006);   // Tür
    for(let i=0;i<3;i++) H.box(k,holz,.05,.008,.022,0,.012+i*.02,D/2+.012+(2-i)*.02);                                   // Stiege
    [-1,1].forEach(sd=>k.add(H.mesh(H.GEO.box,holz2,.004,.004,.09,sd*.027,.045,D/2+.04,0,-.62,0)));
    H.box(k,0x2a2018,.004,.04,.05,W/2+.003,yT+.02,0);                                                               // Aufzugsluke im Giebel
    H.box(k,holz2,.07,.008,.008,W/2+.03,yT+.085,0); H.box(k,holz2,.008,.03,.008,W/2+.002,yT+.06,0);                 // Kranbalken
    const ak=new H.THREE.Group(); ak.position.set(sx+W/2+.058,0,sz); g.add(ak);
    const aSack=H.mesh(H.GEO.ico,SACK,.016,.022,.016,0,0,0); ak.add(aSack); const aSeil=H.mesh(H.GEO.box,P.balken,.002,1,.002,0,0,0); ak.add(aSeil);
    const TOP=yT+.085, pha=fest()*6; relAnim(H,ak,(t,b)=>{ const u=(Math.sin(t*.4+pha)+1)/2, y=.03+u*(TOP-.08); aSack.position.y=y-b.y*0; aSeil.scale.y=Math.max(.01,TOP-y-.02); aSeil.position.y=(TOP+y+.02)/2; });
    for(let i=0;i<5;i++) g.add(H.mesh(H.GEO.ico,ton(H,fest,SACK,.06),.018,.022,.016,sx-.05+(i%3)*.032+(i>2?.016:0),.02+(i>2?.03:0),sz+D/2+.075+(i>2?0:.005),fest()*3));   // Säcke am Fuß der Stiege
    // Dreschtenne: festgestampfter Lehm, Stroh, zwei Drescher im Wechsel
    const tx=-.2, tz=.13, TR=.115;
    g.add(H.mesh(H.GEO.cyl12,0xa8906a,TR,.008,TR,tx,.004,tz)); g.add(H.mesh(H.GEO.cyl12,0x8a7656,TR+.01,.004,TR+.01,tx,.002,tz));
    for(let i=0;i<14;i++){ const a=fest()*6.283, d=Math.sqrt(fest())*TR*.75; H.box(g,H.mix(KORN,0xffffff,fest()*.2),.03,.003,.006,tx+Math.cos(a)*d,.008,tz+Math.sin(a)*d,fest()*3); }
    [-1,1].forEach((sd,j)=>{ figur(H,g,tx+sd*.06,tz,j?H.pick(r,[0x6a5a3a,0x4a5a6a]):KITTEL,sd<0?Math.PI/2:-Math.PI/2);
      const fl=new H.THREE.Group(); fl.position.set(tx+sd*.046,.062,tz); g.add(fl);
      fl.add(H.mesh(H.GEO.box,holz,.05,.004,.004,-sd*.025,0,0)); fl.add(H.mesh(H.GEO.box,holz2,.036,.007,.007,-sd*.066,0,0));
      const ph=j*Math.PI; H.anim(fl,(t)=>{ const u=(t*1.4+ph/Math.PI*.5)%1, f=u<.6?Math.sin(u/.6*Math.PI/2):1-(u-.6)/.4; fl.rotation.z=-sd*(-.62+1.6*f); }); });
    for(let i=0;i<4;i++) g.add(H.mesh(H.GEO.cone6,ton(H,fest,KORN,.08),.02,.05,.02,tx-.09+i*.03,.025,tz-TR-.025,fest()*3,(fest()-.5)*.3,(fest()-.5)*.3));   // Garben am Rand der Tenne
    // Magd worfelt: Korb hebt sich, Spreu fliegt
    const mx=-.06, mz=.27; figur(H,g,mx,mz,H.pick(r,[0x8a3a2a,0x3a5a7a,0xa88a5a]),Math.PI*.85);
    const korb=new H.THREE.Group(); korb.position.set(mx-.006,.046,mz-.014); g.add(korb); korb.add(H.mesh(H.GEO.cyl8,0xb89a60,.03,.008,.022,0,0,0));
    relAnim(H,korb,(t,b)=>{ const u=Math.max(0,Math.sin(t*3)); korb.position.y=b.y+u*.01; korb.rotation.z=u*.25; });
    for(let i=0;i<4;i++){ const sp=H.mesh(H.GEO.box,0xe8d8a8,.004,.002,.004,mx-.012,.09,mz-.02); g.add(sp); const ph=i*.25;
      relAnim(H,sp,(t,b)=>{ const u=(t*.8+ph)%1; sp.position.set(b.x+u*.06,b.y+Math.sin(u*Math.PI)*.03,b.z-u*.02); sp.visible=u<.85; }); }
    // Erntewagen mit Ochse, Garben hoch geladen
    const ew=new H.THREE.Group(); ew.position.set(-.2,0,-.21); ew.rotation.y=.35; g.add(ew);
    H.box(ew,holz,.13,.01,.075,0,.034,0); [-1,1].forEach(sd=>{ for(let i=0;i<6;i++) H.box(ew,holz2,.003,.035,.003,-.06+i*.024,.044,sd*.038); H.box(ew,holz2,.13,.004,.004,0,.078,sd*.038); });
    [-1,1].forEach(sd=>[-1,1].forEach(e=>{ const rad=new H.THREE.Mesh(H.GEO.torus,H.M(P.balken)); rad.scale.set(.026,.026,.1); rad.position.set(e*.045,.026,sd*.046); ew.add(rad); }));
    for(let l=0;l<3;l++) for(let a=0;a<2;a++) for(let c=0;c<3-l;c++){ const x=-.03+a*.06, z=(c-(2-l)/2)*.024, y=.052+l*.02; ew.add(H.mesh(H.GEO.cyl8,ton(H,fest,KORN,.08),.012,.058,.012,x,y,z,0,0,Math.PI/2)); ew.add(H.mesh(H.GEO.cyl8,0x9a7a3a,.0125,.006,.0125,x,y,z,0,0,Math.PI/2)); }   // Garben, liegend gebunden
    H.box(ew,holz2,.11,.006,.006,-.12,.034,0);
    const ochs=new H.THREE.Group(); ochs.position.set(-.21,0,0); ew.add(ochs);
    H.box(ochs,0x6a5040,.09,.045,.04,0,.035,0); [[-.035,-.013],[.035,-.013],[-.035,.013],[.035,.013]].forEach(([a,b])=>H.box(ochs,0x4a3a2e,.01,.035,.01,a,0,b));
    H.box(ochs,0x5a4434,.035,.03,.032,-.06,.05,0); [-1,1].forEach(sd=>H.box(ochs,0xe8dcc0,.004,.004,.02,-.07,.08,sd*.018)); H.box(ochs,holz2,.006,.006,.06,-.045,.082,0);   // Joch
    figur(H,g,-.36,-.21,KITTEL,-1.2); H.box(g,holz2,.004,.09,.004,-.348,.02,-.21);                                       // Fuhrmann mit Stecken
    // Knecht trägt Säcke von der Tenne zum Speicher (Sack nur auf dem Hinweg)
    const kn=figur(H,g,-.1,.06,H.pick(r,[0x5a6a4a,0x6a5a3a,0x4a4a5a]),0), ks=H.mesh(H.GEO.ico,SACK,.016,.02,.014,0,.085,-.004); kn.add(ks);
    const A=[-.1,.06], B=[sx-.07,sz+D/2+.09], phk=fest()*6, rich=Math.atan2(B[0]-A[0],B[1]-A[1]);
    relAnim(H,kn,(t,b)=>{ const u=((t*.09+phk)%1), hin=u<.5, q=hin?u*2:2-u*2, s=q*q*(3-2*q);
      kn.position.x=b.x+(B[0]-A[0])*s; kn.position.z=b.z+(B[1]-A[1])*s; kn.position.y=b.y+Math.abs(Math.sin(t*9))*.003; kn.rotation.y=rich+(hin?0:Math.PI); ks.visible=hin; });
    // Hühner picken verstreute Körner, Baum
    for(let i=0;i<3;i++){ const h=new H.THREE.Group(); h.position.set(.06+i*.05,0,.2+(i%2)*.05); h.rotation.y=fest()*6; g.add(h);
      const c=H.pick(r,[0xf0ece2,0xa86a3a,0x6a4a30]); h.add(H.mesh(H.GEO.ico,c,.012,.01,.009,0,.012,0)); const kopf=H.mesh(H.GEO.ico,c,.006,.006,.006,.01,.02,0); h.add(kopf);
      kopf.add(H.mesh(H.GEO.box,0xc8302a,.6,.5,.3,0,.9,0)); H.box(h,0xd8a040,.002,.006,.002,0,0,0);
      const ph=i*2.1; relAnim(H,h,(t,b)=>{ const pick=Math.max(0,Math.sin(t*2.4+ph)); kopf.position.y=.02-pick*.012; h.rotation.y=b.ry+Math.sin(t*.5+ph)*1.1; }); }
    H.baum(g,.4,-.36,.5,r,"laub");
  },
  handoff(g,r,H){                                     // Anlegestelle mit Kontor
    haus(H,g,-.15,-.12,.26,.18,.14,{wand:P.putz,dach:P.dach,kamin:true});
    const steg=new H.THREE.Group(); steg.position.set(.15,0,.12); steg.rotation.y=-.5; g.add(steg);
    H.box(steg,P.holz,.5,.015,.1,.2,.03,0); for(let i=0;i<5;i++){ H.box(steg,P.holz2,.015,.05,.015,i*.11,0,.05); H.box(steg,P.holz2,.015,.05,.015,i*.11,0,-.05); }
    const boot=new H.THREE.Group(); boot.position.set(.3,.03,.09); steg.add(boot);
    boot.add(H.mesh(new H.THREE.CylinderGeometry(.05,.03,.2,8,1,false,0,Math.PI),P.holz2,1,1,.5,0,.02,0,0,0,Math.PI/2));
    H.box(boot,P.holz2,.005,.16,.005,0,.02,0); const segel=H.mesh(H.GEO.box,P.tuch3,.004,.1,.09,.005,.1,0); boot.add(segel);
    H.anim(boot,(t)=>{ boot.position.y=.03+Math.sin(t*1.3)*.006; boot.rotation.x=Math.sin(t*.9)*.04; });
    kiste(H,g,.05,.25,.2); kiste(H,g,.1,.3,.7); fass(H,g,-.02,.3); fahne(H,g,-.36,.1,.2,P.tuch2,1);
  },
  api(g,r,H){                                         // Stadttor
    turm(H,g,-.2,0,.1,.36,{dach:"zinnen"}); turm(H,g,.2,0,.1,.36,{dach:"zinnen"});
    H.box(g,P.stein,.3,.26,.14,0,0,0); H.box(g,P.stein2,.34,.03,.16,0,.26,0);
    for(let i=0;i<5;i++) H.box(g,P.stein2,.04,.03,.16,-.14+i*.07,.29,0);
    H.box(g,0x1e1a16,.12,.16,.004,0,0,.071); g.add(H.mesh(H.GEO.cyl12,0x1e1a16,.06,.004,.06,0,.16,.071,0,Math.PI/2));
    for(let i=0;i<5;i++) H.box(g,P.eisen,.005,.15,.003,-.045+i*.022,0,.074);                 // Fallgitter
    fahne(H,g,-.2,.4,0,P.tuch,1.1); fahne(H,g,.2,.4,0,P.tuch,1.1); fackel(H,g,-.09,.12,.08); fackel(H,g,.09,.12,.08);
    mauer(H,g,-.3,0,-.62,-.1,.14); mauer(H,g,.3,0,.62,-.1,.14);
    const weg=new H.THREE.Mesh(new H.THREE.BoxGeometry(.14,.004,.5),H.M(0x8a7a60)); weg.position.set(0,.002,.32); g.add(weg);
  },
  sonst(g,r,H){                                       // Haus: Bürgerhaus in Fachwerk mit kleinem Hof. Steht für „sonstige“ Arbeit und für alle gesperrten Arten, deshalb ruhig und allgemein:
                                                      // Gemüsegarten mit Staketenzaun, Ziehbrunnen mit Dach, Wäscheleine (weht), Bank mit Nachbar und Katze, Holzstapel, Regentonne, Apfelbaum.
                                                      // Eine Form, Farbvarianz (Putz, Balken, Dach, Läden, Wäsche).
    const putz=H.pick(r,PUTZE), balken=H.pick(r,BALKEN), dach=ton(H,r,H.pick(r,[P.reet,...ZIEGEL,0x5c6370]),.05), laden=H.pick(r,LAEDEN);
    const holz=H.pick(r,[0x7c5738,0x6a4a30,0x8a6a48]), holz2=H.mix(holz,0x000000,.3), fest=H.rng("haus-form");
    fachwerkhaus(H,g,-.04,-.115,0,{r,w:.3,d:.17,h:.115,dachH:.13,putz,balken,dach,laden});
    // Regentonne und Holzstapel an den Giebelseiten
    g.add(H.mesh(H.GEO.cyl8,holz,.022,.05,.022,.15,.025,-.035)); H.box(g,P.eisen,.046,.004,.046,.15,.036,-.035); g.add(H.mesh(H.GEO.cyl8,0x2a4a58,.019,.002,.019,.15,.051,-.035));
    for(let i=0;i<7;i++) g.add(H.mesh(H.GEO.cyl8,ton(H,fest,P.holz,.12),.011,.08,.011,-.23,.011+(i<4?0:.02),-.18+(i<4?i*.022:(i-4)*.022+.011),0,0,Math.PI/2));
    H.box(g,holz2,.004,.06,.004,-.27,0,-.2); H.box(g,holz2,.004,.06,.004,-.19,0,-.2);
    // Gemüsegarten mit Staketenzaun vorn links
    const gx=-.22, gz=.17, GW=.2, GD=.14;
    H.box(g,0x5a4630,GW,.006,GD,gx,0,gz);
    for(let i=0;i<4;i++){ const zz=gz-GD/2+.02+i*.033; H.box(g,0x4a3a28,GW-.02,.008,.012,gx,.004,zz);
      const sorte=i%3; for(let k=0;k<6;k++){ const xx=gx-GW/2+.02+k*.032;
        if(sorte===0) g.add(H.mesh(H.GEO.ico,H.mix(0x5f8a4e,0x4f7a3e,fest()),.011,.009,.011,xx,.016,zz,fest()*3));            // Kohl
        else if(sorte===1){ g.add(H.mesh(H.GEO.cone6,0x6f9a4a,.005,.022,.005,xx,.02,zz)); }                                    // Lauch
        else g.add(H.mesh(H.GEO.ico,H.pick(r,[0xc8402f,0xe0a030,0xd06a9a]),.006,.006,.006,xx,.016,zz)); } }                  // Blumen
    const zaun2=(x1,z1,x2,z2)=>{ const l=Math.hypot(x2-x1,z2-z1), n=Math.round(l/.014), w=-Math.atan2(z2-z1,x2-x1);
      for(let k=0;k<=n;k++){ const u=k/n; H.box(g,0xd8ccb0,.004,.035,.004,x1+(x2-x1)*u,0,z1+(z2-z1)*u); }
      [.012,.028].forEach(y=>g.add(H.mesh(H.GEO.box,0xc8bca0,l,.004,.004,(x1+x2)/2,y,(z1+z2)/2,w))); };
    const x0=gx-GW/2-.008, x1=gx+GW/2+.008, z0=gz-GD/2-.008, z1=gz+GD/2+.008;
    zaun2(x0,z0,x0,z1); zaun2(x0,z1,x1,z1); zaun2(x1,z1,x1,z0); zaun2(x1,z0,x0+.07,z0);
    // Ziehbrunnen mit Dach
    const bx=.12, bz=.12; g.add(H.mesh(H.GEO.cyl12,P.stein2,.032,.035,.032,bx,.0175,bz)); g.add(H.mesh(H.GEO.cyl12,0x1a2a30,.025,.002,.025,bx,.036,bz));
    [-1,1].forEach(s=>H.box(g,holz2,.006,.075,.006,bx+s*.03,0,bz)); H.box(g,holz2,.07,.006,.006,bx,.07,bz);
    g.add(H.mesh(H.GEO.cyl8,holz,.006,.05,.006,bx,.058,bz,0,0,Math.PI/2));
    { const q=new H.THREE.Group(); q.position.set(bx,0,bz); q.rotation.y=Math.PI/2; g.add(q); satteldach(H,q,.075,.07,.035,.08,dach,holz2,false); }
    H.box(g,P.balken,.002,.03,.002,bx,.03,bz); H.box(g,holz,.012,.012,.012,bx,.025,bz);
    // Wäscheleine zwischen zwei Pfosten, Wäsche weht
    const lx0=.2, lx1=.38, lz=-.02; [lx0,lx1].forEach(x=>H.box(g,holz2,.006,.09,.006,x,0,lz)); H.box(g,0xd8d0c0,lx1-lx0,.002,.002,(lx0+lx1)/2,.088,lz);
    const WAE=[0xf0ece2,H.pick(r,[0x34587a,0x8a3a2a,0x3f6b4a]),0xe8dcc0,H.pick(r,[0xa88a5a,0x6a5a7a])];
    WAE.forEach((c,i)=>{ const st=new H.THREE.Group(); st.position.set(lx0+.025+i*.04,.088,lz); g.add(st);
      st.add(H.mesh(H.GEO.box,c,.028,.032+(i%2)*.008,.002,0,-.018-(i%2)*.004,0));
      const ph=i*.9; H.anim(st,(t)=>{ st.rotation.x=.12+Math.sin(t*1.6+ph)*.12; }); });
    // Bank vor dem Haus mit Nachbar, Katze, Apfelbaum
    const nb=figur(H,g,-.12,.01,H.pick(r,[0x5a4a3a,0x4a5a6a,0x6a3a2a]),0); nb.position.y=.012;
    const ka=new H.THREE.Group(); ka.position.set(-.07,.02,.015); g.add(ka); const KF=H.pick(r,[0x3a3632,0xd08a40,0xe8e0d0]);
    ka.add(H.mesh(H.GEO.ico,KF,.01,.008,.008,0,.006,0)); ka.add(H.mesh(H.GEO.ico,KF,.006,.006,.006,.01,.012,0)); ka.add(H.mesh(H.GEO.box,KF,.012,.002,.002,-.012,.01,0,0,0,.6));
    [-1,1].forEach(s=>ka.add(H.mesh(H.GEO.box,KF,.002,.004,.002,.012,.018,s*.003)));
    relAnim(H,ka,(t,b)=>{ ka.rotation.y=b.ry+Math.sin(t*.3)*.4; });
    apfelbaum(H,g,.33,.26,1.0,r);
    for(let i=0;i<5;i++) g.add(H.mesh(H.GEO.ico,0x4f7a3e,.014,.012,.014,.02+i*.03,.01,-.005+(i%2)*.006,fest()*3));            // Büsche vor dem Haus
  },
  meilenstein(g,r,H){                                 // Burg: Burghügel, sechseckige Ringmauer mit Zinnen und Wehrgang, sechs Rundtürme, Torhaus mit Fallgitter und offenen Torflügeln,
                                                      // Bergfried mit Hocheingang und großem Banner, Palas mit Kamin, Brunnen, Schießstand mit Bogenschütze, Wachen (eine läuft den Wehrgang ab).
                                                      // Banner violett; gehaltener Meilenstein: goldene Banner und Glanz. Eine Form, Farbvarianz.
    const gold=H.meilensteinGold(), fb=gold?P.gold:0x6a3fa0, KEGEL4=new H.THREE.ConeGeometry(1,1,4);
    const stein=ton(H,r,H.pick(r,[P.stein,0xb4ab9a,0xc8bca6,0xa8a090]),.03), stein2=H.mix(stein,0x000000,.14), dach=ton(H,r,H.pick(r,[P.schiefer,0x5c6370,0x934030,0xa6452f]),.04);
    const holz=H.pick(r,[0x6a4a30,0x5e4a3a,0x7c5738]), holz2=H.mix(holz,0x000000,.3), fest=H.rng("burg-form"), WACHE=H.pick(r,[0x6a6a72,0x5a5a62]);
    // Burghügel
    g.add(H.mesh(new H.THREE.CylinderGeometry(.47,.5,.04,6),0x6a7a4a,1,1,1,0,.02,0,Math.PI/6));
    for(let i=0;i<14;i++){ const a=fest()*6.283, d=.43+fest()*.04; g.add(H.mesh(H.GEO.ico,H.mix(stein2,0x5a5a50,.4),.02+fest()*.015,.015,.02,Math.sin(a)*d,.03,Math.cos(a)*d,fest()*3)); }
    H.box(g,0x8a7a5a,.08,.008,.09,0,.036,.365);                                                                         // Weg zum Tor
    const Y=.04, R=.36, MH=.13;
    const E=[...Array(6)].map((_,i)=>{ const a=i/6*6.283+Math.PI/6; return [Math.sin(a)*R,Math.cos(a)*R]; });
    // Ringmauer mit Zinnen und Wehrgang (vorn mit Tor)
    E.forEach(([x,z],i)=>{ const [x2,z2]=E[(i+1)%6], l=Math.hypot(x2-x,z2-z), w=-Math.atan2(z2-z,x2-x), cx=(x+x2)/2, cz=(z+z2)/2, nx=-cx/R, nz=-cz/R;
      const teil=(u0,u1)=>{ const L=(u1-u0)*l, ux=x+(x2-x)*(u0+u1)/2, uz=z+(z2-z)*(u0+u1)/2;
        g.add(H.mesh(H.GEO.box,stein,L,MH,.035,ux,Y+MH/2,uz,w));
        const n=Math.round(L/.03); for(let k=0;k<n;k+=2){ const v=(k+.5)/n-.5; g.add(H.mesh(H.GEO.box,stein,L/n,.022,.012,ux+Math.cos(-w)*v*L-nx*.012,Y+MH+.011,uz+Math.sin(-w)*v*L-nz*.012,w)); }
        g.add(H.mesh(H.GEO.box,holz,L,.006,.03,ux+nx*.03,Y+MH-.012,uz+nz*.03,w));                                  // Wehrgang
        for(let k=0;k<Math.max(1,Math.round(L/.08));k++){ const v=(k+.5)/Math.max(1,Math.round(L/.08))-.5; H.box(g,holz2,.008,MH-.012,.008,ux+Math.cos(-w)*v*L+nx*.04,Y,uz+Math.sin(-w)*v*L+nz*.04); } };
      if(i===5){ teil(0,.36); teil(.64,1); } else teil(0,1); });
    // Rundtürme an den Ecken
    E.forEach(([x,z],i)=>{ const TR=.05, TH=MH+.07+(i===2||i===3?.03:0);
      g.add(H.mesh(new H.THREE.CylinderGeometry(TR,TR*1.08,TH,12),stein,1,1,1,x,Y+TH/2,z));
      g.add(H.mesh(new H.THREE.CylinderGeometry(TR+.008,TR+.003,.016,12),stein2,1,1,1,x,Y+TH+.008,z));
      const hm=new H.THREE.Mesh(new H.THREE.ConeGeometry(TR+.016,.11,12),H.M(dach)); hm.position.set(x,Y+TH+.016+.055,z); hm.castShadow=true; g.add(hm);
      for(let k=0;k<3;k++){ const a=Math.atan2(x,z)+(k-1)*.9; H.box(g,0x1e1a18,.008,.022,.004,x+Math.sin(a)*(TR+.002),Y+.05+k*.03,z+Math.cos(a)*(TR+.002),a); }
      if(i%2===0) fahne(H,g,x,Y+TH+.1,z,fb,.55); });
    // Torhaus mit Fallgitter, offenen Torflügeln und Wachen
    const tz=Math.cos(Math.PI/6)*R, TW=.15, TD=.09, THH=MH+.08;
    [-1,1].forEach(s=>{ H.box(g,stein,.05,THH,TD,s*(TW/2-.025),Y,tz); for(let k=0;k<4;k++) H.box(g,stein2,.012,.016,.012,s*(TW/2-.006),Y+.01+k*.05,tz+TD/2-.006); });
    H.box(g,stein,TW,THH-.085,TD,0,Y+.085,tz); H.box(g,0x161210,TW-.1,.085,TD-.004,0,Y,tz);
    g.add(H.mesh(H.GEO.cyl12,0x161210,.025,TD-.004,.025,0,Y+.085,tz,0,Math.PI/2,0));
    for(let k=0;k<5;k++) H.box(g,P.eisen,.003,.035,.003,-.02+k*.01,Y+.065,tz+TD/2-.004); H.box(g,P.eisen,.05,.003,.003,0,Y+.07,tz+TD/2-.004);
    [-1,1].forEach(s=>g.add(H.mesh(H.GEO.box,holz,.024,.075,.004,s*.034,Y+.0375,tz-TD/2-.01,s*.9)));
    for(let k=0;k<5;k++) H.box(g,stein,.022,.02,.022,-TW/2+.011+k*(TW-.022)/4,Y+THH,tz+TD/2-.011);
    H.box(g,stein2,.03,.03,.004,0,Y+THH-.05,tz+TD/2+.001); H.box(g,fb,.02,.02,.002,0,Y+THH-.045,tz+TD/2+.004);                 // Wappen
    [-1,1].forEach(s=>{ const w=figur(H,g,s*.065,tz+TD/2+.025,WACHE,0); H.box(w,P.eisen,.003,.09,.003,s*.014,0,0); });
    // Bergfried mit Hocheingang, Zinnen, Pyramidendach und großem Banner
    const bx=-.13, bz=-.1, BW=.12, BH=.44;
    H.box(g,stein,BW,BH,BW,bx,Y,bz); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ for(let k=0;k<9;k++) H.box(g,stein2,.014+(k%2)*.006,.022,.014+((k+1)%2)*.006,bx+a*(BW/2-.006),Y+.01+k*.048,bz+b*(BW/2-.006)); });
    for(let k=0;k<3;k++) H.box(g,0x1e1a18,.008,.026,.004,bx+(k-1)*.03,Y+.22+k*.06,bz+BW/2+.001);
    H.box(g,stein2,BW+.016,.012,BW+.016,bx,Y+BH,bz); for(let k=0;k<4;k++) [-1,1].forEach(s=>{ H.box(g,stein,.022,.024,.012,bx-BW/2+.011+k*(BW-.022)/3,Y+BH+.012,bz+s*(BW/2+.002)); H.box(g,stein,.012,.024,.022,bx+s*(BW/2+.002),Y+BH+.012,bz-BW/2+.011+k*(BW-.022)/3); });
    g.add(H.mesh(KEGEL4,dach,.085,.12,.085,bx,Y+BH+.012+.06,bz,Math.PI/4));
    H.box(g,0x2a2018,.026,.045,.004,bx+.02,Y+.16,bz+BW/2+.001);                                                           // Hocheingang
    for(let k=0;k<8;k++) H.box(g,holz,.03,.006,.02,bx+.02,Y+k*.02,bz+BW/2+.17-k*.02);                                    // Holztreppe
    [-1,1].forEach(s=>{ const A=new H.THREE.Vector3(bx+.02+s*.016,Y,bz+BW/2+.18), B=new H.THREE.Vector3(bx+.02+s*.016,Y+.16,bz+BW/2+.02), v=B.clone().sub(A);
      const m=H.mesh(H.GEO.box,holz2,.005,v.length(),.005,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2); m.quaternion.setFromUnitVectors(new H.THREE.Vector3(0,1,0),v.normalize()); g.add(m); });
    fahne(H,g,bx,Y+BH+.1,bz,fb,1.3);
    // Palas an der Rückmauer mit Kamin
    const px=.1, pz=-.2, PW=.22, PD=.1, PH=.13;
    H.box(g,stein,PW,PH,PD,px,Y,pz); for(let k=0;k<4;k++){ H.gbox(g,P.fenster,.014,.03,.003,px-PW/2+.03+k*.054,Y+.07,pz+PD/2+.001); g.add(H.mesh(H.GEO.cyl8,P.fenster,.007,.003,.007,px-PW/2+.03+k*.054,Y+.1,pz+PD/2+.001,0,Math.PI/2,0)); }
    H.box(g,0x3a2a1c,.028,.05,.004,px+.06,Y,pz+PD/2+.002); H.box(g,stein2,.04,.01,.02,px+.06,Y,pz+PD/2+.01);
    satteldach(H,(()=>{ const q=new H.THREE.Group(); q.position.set(px,0,pz); g.add(q); [-1,1].forEach(e=>giebel(H,q,e*(PW/2+.001),Y+PH,0,PD,.08,.006,stein,Math.PI/2)); return q; })(),Y+PH,PD+.05,.09,PW+.04,dach,holz2);
    H.box(g,stein2,.028,.12,.028,px-.06,Y+PH,pz-.02); H.rauch(g,px-.06,pz-.02,.3,.6,0x8a8a8a,Y+PH+.13);
    // Hof: Brunnen, Schießstand, Bogenschütze, Wache auf dem Wehrgang
    const wx=.12, wz=.06; g.add(H.mesh(H.GEO.cyl12,stein2,.028,.03,.028,wx,Y+.015,wz)); g.add(H.mesh(H.GEO.cyl12,0x1a2a30,.022,.002,.022,wx,Y+.031,wz));
    [-1,1].forEach(s=>H.box(g,holz2,.005,.06,.005,wx+s*.026,Y,wz)); H.box(g,holz2,.06,.005,.005,wx,Y+.06,wz); g.add(H.mesh(KEGEL4,dach,.04,.025,.03,wx,Y+.075,wz,Math.PI/4));
    const zx=.2, zz=.14; H.box(g,holz2,.006,.05,.006,zx,Y,zz); { const sch=new H.THREE.Group(); sch.position.set(zx,Y+.06,zz); sch.rotation.y=-.9; g.add(sch);
      [[.022,0xe8dcc0],[.016,0xc8402f],[.01,0xe8dcc0],[.005,0xc8402f]].forEach(([rr,c],k)=>sch.add(H.mesh(H.GEO.cyl12,c,rr,.004+k*.0005,rr,0,0,0,0,Math.PI/2,0))); }
    const bs=figur(H,g,zx-.13,zz+.07,H.pick(r,[0x3a5a3a,0x5a4a2a]),-1.0+Math.PI/2+.4); H.box(bs,holz,.003,.07,.003,.012,.02,.01);
    { const ax0=E[5][0]*.35+E[0][0]*.0, az0=tz-.04; const w=figur(H,g,-.12,tz-.05,WACHE,Math.PI/2); w.position.y=Y+MH-.012; H.box(w,P.eisen,.003,.09,.003,.012,0,0);
      relAnim(H,w,(t,b)=>{ const u=(Math.sin(t*.25)+1)/2; w.position.x=b.x-u*.1*1.15; w.rotation.y=Math.cos(t*.25)>0?-Math.PI/2:Math.PI/2; }); }
    if(gold){ const h=H.halo(g,0,.7,0,.5,0xffd27a,.7); [[.0,.06],[-.06,.1]].forEach(([x,z])=>{ const f=figur(H,g,x,z,0x8a7a5a,0); H.box(f,P.gold,.016,.018,.004,0,.035,.009); }); }   // gehalten: Ritter im Hof
  },
  paket(g,r,H){                                       // Großbau: ein Bauabschnitt pro Aufgabe, gebaut wie im Mittelalter von Ost nach West (nach Frist sortiert):
                                                      // erste Aufgabe = Chor, mittlere = Langhausjoche, letzte = Westfassade.
                                                      // Er levelt mit den fertigen Aufgaben: bis 3 fertig Kapelle, 4–6 Kirche mit Westturm, ab 7 Kathedrale mit zwei Türmen; die Länge folgt allen Aufgaben.
    const S=H.paketStand()||{seg:[{s:"fertig"},{s:"fertig"},{s:"offen"},{s:"offen"}],komplett:false}, seg=S.seg, n=seg.length;
    const fe=seg.filter(x=>x.s==="fertig").length, stufe=fe<=3?0:fe<=6?1:2, G=[{NW:.075,AW:0,HN:.12,AH:0,Lb:.11},{NW:.09,AW:0,HN:.15,AH:0,Lb:.095},{NW:.1,AW:.055,HN:.17,AH:.09,Lb:.075}][stufe];   // Stufe nach fertigen Aufgaben
    const {NW,AW,HN,AH}=G, AUSSEN=NW+AW, R=NW+.02, RUSS=0x2a2422, NARBE=0x8a8078, FENSTER=0xf0b860;
    const mitte=n>=3?seg.slice(1,n-1):[n===1?seg[0]:seg[1]], m=mitte.length, naveL=Math.min(.5,m*G.Lb), Lj=naveL/m;
    const zS=(R-naveL-.15)/2, zN=zS+.05, zE=zN+naveL;                                               // Chor-Anschluss, Langhausbeginn, Fassade
    const stein=sg=>sg.narbe?H.mix(P.stein,NARBE,.6):ton(H,r,P.stein,.03), fen=sg=>sg.narbe?0x8a5a3a:FENSTER;
    // Domplatz: Pflaster, Weg zum Portal
    g.add(H.mesh(H.GEO.cyl12,0x9c968a,.6,.004,.62,0,.002,-.02)); for(let i=0;i<40;i++){ const a=r()*6.283, d=r()*.58; H.box(g,H.mix(0x9c968a,r()<.5?0x7a756c:0xb8b2a6,.5),.03,.002,.02,Math.cos(a)*d,.004,Math.sin(a)*d-.02,r()*3); }
    H.box(g,0xa8a294,.12,.004,Math.max(.05,.55-zE),0,.003,(zE+.55)/2+.03);
    // Bausteine je Zustand
    const russ=(x,z,w,d,hmax)=>{ for(let i=0;i<3;i++) H.box(g,H.mix(RUSS,0x000000,r()*.3),d>w?w:w/3,.03+r()*hmax,d>w?d/3:d,x+(d>w?0:(i-1)*w/3),0,z+(d>w?(i-1)*d/3:0)); };
    const glut=(x,z)=>{ for(let i=0;i<4;i++){ const q=H.mesh(H.GEO.box,0xff6a20,.012,.004,.012,x+(r()-.5)*.1,.006,z+(r()-.5)*.1); H.leucht(q); g.add(q); } H.rauch(g,x,z,.25,.6,0x4a4440,.05); };
    const geruest=(x0,x1,z0,z1,h,arbeiter)=>{ [[x0,z0],[x1,z0],[x1,z1],[x0,z1]].forEach(([x,z])=>H.box(g,P.holz2,.007,h,.007,x,0,z));
      for(let y=.06;y<h;y+=.06){ g.add(H.mesh(H.GEO.box,P.holz2,x1-x0,.004,.004,(x0+x1)/2,y,z0)); g.add(H.mesh(H.GEO.box,P.holz2,x1-x0,.004,.004,(x0+x1)/2,y,z1));
        g.add(H.mesh(H.GEO.box,P.holz2,.004,.004,z1-z0,x0,y,(z0+z1)/2)); g.add(H.mesh(H.GEO.box,P.holz2,.004,.004,z1-z0,x1,y,(z0+z1)/2)); }
      const dy=Math.floor(h*.66/.06)*.06; g.add(H.mesh(H.GEO.box,0xa98a5e,x1-x0,.004,.03,(x0+x1)/2,dy+.003,z1-.015));
      g.add(H.mesh(H.GEO.box,P.holz2,Math.hypot(x1-x0,h*.6),.004,.004,(x0+x1)/2,h*.35,z0,0,0,Math.atan2(h*.6,x1-x0)));
      if(arbeiter){ figur(H,g,(x0+x1)/2+(r()-.5)*.06,z1-.015,H.pick(r,[P.tuch2,P.tuch3,P.tuch]),Math.PI).position.y=dy+.005;
        H.box(g,ton(H,r,P.stein,.05),.025,.016,.02,(x0+x1)/2+.04,dy+.005,z1-.015); } };
    // Langhausjoch
    const joch=(z0,z1,sg,letztes)=>{ const L=z1-z0, zc=(z0+z1)/2;
      if(sg.s==="fertig"){ const c=stein(sg);
        [-1,1].forEach(sd=>{ H.box(g,c,.02,HN,L,sd*NW,0,zc);
          if(AW){ H.box(g,c,.018,AH,L,sd*AUSSEN,0,zc); const rw=Math.hypot(AW,.03);
            g.add(H.mesh(H.GEO.box,P.schiefer,rw+.01,.006,L+.002,sd*(NW+AW/2),AH+.016,zc,0,0,-sd*Math.atan2(.03,AW)));
            H.gbox(g,fen(sg),.003,.045,.02,sd*(AUSSEN+.0095),.02,zc); H.gbox(g,fen(sg),.003,.05,.02,sd*(NW+.0105),AH+.035,zc); }
          else { H.gbox(g,fen(sg),.003,HN*.45,.022,sd*(NW+.0105),HN*.25,zc); g.add(H.mesh(H.GEO.cone8,fen(sg),.011,.012,.004,sd*(NW+.0105),HN*.7+.006,zc,0,0,sd*Math.PI/2)); }
          [z0,...(letztes?[z1]:[])].forEach(zb=>{ const bx=sd*(AUSSEN+.016);
            if(AW){ H.box(g,c,.028,AH+.045,.022,bx,0,zb); g.add(H.mesh(H.GEO.cone8,c,.014,.035,.014,bx,AH+.062,zb));
              const dx=AW+.016, dy=HN-.03-(AH+.035); g.add(H.mesh(H.GEO.box,c,.008,Math.hypot(dx,dy),.01,sd*(NW+dx/2),AH+.035+dy/2,zb,0,0,sd*Math.atan2(dx,dy))); }
            else { H.box(g,c,.022,HN*.8,.02,sd*(NW+.012),0,zb); g.add(H.mesh(H.GEO.box,c,.022,.03,.02,sd*(NW+.012),HN*.8+.008,zb,0,0,sd*.6)); } }); });
        giebel(H,g,0,HN,zc,2*NW+.035,stufe?.12:.1,L+.002,P.schiefer,0);
        if(sg.narbe) [-1,1].forEach(sd=>H.box(g,RUSS,.022,.03,L,sd*NW,0,zc));
      } else if(sg.s==="brand"){ [-1,1].forEach(sd=>{ russ(sd*NW,zc,.02,L,HN*.5); if(AW) russ(sd*AUSSEN,zc,.018,L,.05); }); glut(0,zc);
      } else { [-1,1].forEach(sd=>{ H.box(g,ton(H,r,P.stein,.04),.02,.04+r()*.05,L,sd*NW,0,zc); if(AW) H.box(g,ton(H,r,P.stein,.04),.018,.035,L,sd*AUSSEN,0,zc); });
        geruest(-(AUSSEN+.03),AUSSEN+.03,z0+.004,z1-.004,HN+.03,r()<.7); }
    };
    // Chor: halbrunde Apsis mit Strebepfeilern
    const chor=sg=>{ const apsis=(h,c)=>{ const q=new H.THREE.Mesh(new H.THREE.CylinderGeometry(R,R,h,8,1,false,Math.PI/2,Math.PI),H.M(c)); q.position.set(0,h/2,zS); q.castShadow=q.receiveShadow=true; g.add(q); };
      if(sg.s==="fertig"){ const c=stein(sg); apsis(HN,c);
        const d=new H.THREE.Mesh(new H.THREE.ConeGeometry(R+.025,stufe?.12:.1,8,1,false,Math.PI/2,Math.PI),H.M(P.schiefer)); d.position.set(0,HN+(stufe?.06:.05),zS); d.castShadow=true; g.add(d);
        const nf=stufe?5:3; for(let i=0;i<nf;i++){ const a=Math.PI/2+(i+.5)/nf*Math.PI, x=Math.sin(a), z=Math.cos(a);
          H.gbox(g,fen(sg),.02,HN*.42,.003,x*(R+.002),HN*.3,zS+z*(R+.002),Math.atan2(x,z));
          if(i<nf-1){ const b=a+Math.PI/nf/2, bx=Math.sin(b)*(R+.015), bz=zS+Math.cos(b)*(R+.015); H.box(g,c,.02,HN-.03,.02,bx,0,bz,b); if(stufe) g.add(H.mesh(H.GEO.cone8,c,.012,.04,.012,bx,HN-.01,bz)); } }
        [-1,1].forEach(sd=>H.box(g,c,.02,HN,.05,sd*NW,0,zS+.025)); giebel(H,g,0,HN,zS+.025,2*NW+.035,stufe?.12:.1,.052,P.schiefer,0);
      } else if(sg.s==="brand"){ apsis(.05,RUSS); glut(0,zS-.05);
      } else { apsis(.05,ton(H,r,P.stein,.04)); geruest(-R-.02,R+.02,zS-R-.02,zS+.04,HN+.02,true); }
    };
    // Westfassade: Kapelle mit Dachreiter, Kirche mit einem Turm, Kathedrale mit zwei Türmen
    const tauben=[];                                                                                  // Turmspitzen, um die Tauben kreisen
    const turm=(x,z,TW,th,c,narbe)=>{ H.box(g,c,TW,th,TW,x,0,z); for(const y of [th*.2,th*.5]) H.box(g,P.stein2,TW+.008,.008,TW+.008,x,y,z);
      [0,1,2,3].forEach(k=>{ const a=k*Math.PI/2; H.box(g,0x2a2420,.022,.045,.003,x+Math.sin(a)*(TW/2+.001),th-.07,z+Math.cos(a)*(TW/2+.001),a); });
      g.add(H.mesh(H.GEO.cone8,P.schiefer,TW*.62,.2,TW*.62,x,th+.1,z,Math.PI/8));
      if(S.komplett){ H.box(g,P.gold,.006,.05,.006,x,th+.2,z); H.box(g,P.gold,.03,.006,.006,x,th+.235,z); }
      tauben.push([x,th+.06,z]); };
    const giebelwand=(c,sg)=>{ H.box(g,c,2*NW,HN,.03,0,0,zE+.015); g.add(H.mesh(dachGeo(H),c,2*NW,stufe?.12:.1,.03,0,HN,zE+.015));
      H.box(g,0x2a2420,.045,.07,.004,0,0,zE+.031); g.add(H.mesh(H.GEO.cone8,0x2a2420,.0225,.022,.002,0,.07,zE+.032,0,Math.PI/2));
      const rose=H.mesh(H.GEO.cyl12,fen(sg),.028,.003,.028,0,HN*.75,zE+.031,0,Math.PI/2); H.leucht(rose); g.add(rose); g.add(H.mesh(H.GEO.cyl12,c,.034,.002,.034,0,HN*.75,zE+.0295,0,Math.PI/2)); };
    const fassade=sg=>{ const tx=NW+.03, TW=.1;
      if(sg.s==="fertig"){ const c=stein(sg);
        if(stufe===2){ giebelwand(c,sg); [-1,1].forEach(sd=>turm(sd*(tx+TW/2-.03),zE+.01,TW,.34,c)); }
        else if(stufe===1){ giebelwand(c,sg); turm(0,zE+.05,.1,.3,c); H.box(g,0x2a2420,.04,.065,.004,0,0,zE+.101); }
        else { giebelwand(c,sg); const dz=zE-.04;                                                 // Dachreiter mit Glocke
          H.box(g,P.holz2,.035,.06,.035,0,HN+.07,dz); H.box(g,0x2a2420,.025,.03,.036,0,HN+.095,dz); g.add(H.mesh(H.GEO.cone8,P.schiefer,.03,.07,.03,0,HN+.165,dz));
          if(S.komplett){ H.box(g,P.gold,.005,.035,.005,0,HN+.2,dz); H.box(g,P.gold,.02,.005,.005,0,HN+.222,dz); } tauben.push([0,HN+.16,dz]); }
        if(S.komplett) H.halo(g,0,stufe?.5:.32,zE,stufe?.4:.3,0xffd27a,.55);
      } else if(sg.s==="brand"){ russ(0,zE+.015,2*NW+(stufe===2?.2:.05),.03,.1); glut(0,zE+.05);
      } else { if(stufe===2) [-1,1].forEach(sd=>H.box(g,ton(H,r,P.stein,.04),TW,.1+r()*.05,TW,sd*(tx+TW/2-.03),0,zE+.01));
        if(stufe===1) H.box(g,ton(H,r,P.stein,.04),.1,.09+r()*.05,.1,0,0,zE+.05);
        H.box(g,ton(H,r,P.stein,.04),2*NW,.05,.03,0,0,zE+.015);
        const xw=stufe===2?tx+TW:NW+.04; geruest(-xw,xw,zE-.05,zE+(stufe===1?.11:.07),stufe?.22:.15,true); }
    };
    // Abschnitte verteilen
    chor(seg[0]); mitte.forEach((sg,i)=>joch(zN+i*Lj,zN+(i+1)*Lj,sg,i===m-1)); fassade(seg[n-1]);
    // Baubetrieb am ersten offenen Abschnitt: Tretradkran, Materiallager, Träger
    const teile=[seg[0],...mitte,seg[n-1]], oi=teile.findIndex(x=>x.s==="offen");
    if(oi>=0){ const kz=oi===0?zS:oi===m+1?zE:zN+(oi-.5)*Lj, kx=AUSSEN+.13, kh=HN+.13;
      const k=new H.THREE.Group(); k.position.set(kx,0,kz); g.add(k);
      H.box(k,P.holz2,.1,.01,.01,0,0,0); H.box(k,P.holz2,.01,.01,.1,0,0,0); H.box(k,P.holz2,.018,kh,.018,0,0,0); [-1,1].forEach(sd=>k.add(H.mesh(H.GEO.box,P.holz2,.007,kh*.5,.007,0,kh*.22,sd*.03,0,sd*.3,0)));
      k.add(H.mesh(H.GEO.box,P.holz2,.2,.012,.012,-.08,kh,0)); fahne(H,g,kx,kh,kz,P.tuch,.45);
      const rad=new H.THREE.Group(); rad.position.set(0,.07,0); k.add(rad);
      [-1,1].forEach(sd=>{ const ring=new H.THREE.Mesh(H.GEO.torus,H.M(P.holz)); ring.scale.set(.06,.06,.07); ring.position.z=sd*.02; rad.add(ring); });
      for(let i=0;i<6;i++) rad.add(H.mesh(H.GEO.box,P.holz2,.004,.12,.004,0,0,0,0,0,i*Math.PI/6));
      H.anim(rad,(t)=>{ rad.rotation.z=t*.6; });
      const seil=H.mesh(H.GEO.box,P.balken,.002,1,.002,kx-.17,0,kz); g.add(seil); const last=H.mesh(H.GEO.box,ton(H,r,P.stein,.05),.03,.02,.025,kx-.17,0,kz); g.add(last);
      const ph=r()*6; H.anim(last,(t)=>{ const u=(Math.sin(t*.3+ph)+1)/2, y=.02+u*(HN-.01); last.position.y=y; seil.scale.y=kh-y; seil.position.y=(kh+y)/2; }); H.anim(seil,()=>{});
      const lx=-(AUSSEN+.17);                                                                       // Materiallager gegenüber dem Kran
      for(let a=0;a<2;a++) for(let i=0;i<3-a;i++) for(let j=0;j<2;j++) H.box(g,ton(H,r,P.stein,.06),.04,.024,.03,lx+(j-.5)*.032,.002+a*.024,kz-.05+i*.042+a*.021,Math.PI/2);
      for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.cyl8,ton(H,r,P.holz,.08),.011,.2,.011,lx-.06,.011+(i>1?.02:0),kz+(i%2)*.022-.01+(i>1?.011:0),0,Math.PI/2,0));
      H.box(g,P.holz,.06,.016,.04,lx+.02,0,kz+.1); H.box(g,0xcfc8b8,.052,.004,.032,lx+.02,.014,kz+.1);
      const tr=figur(H,g,0,0,P.tuch,0), qs=H.mesh(H.GEO.box,ton(H,r,P.stein,.05),.028,.018,.022,0,.085,0); tr.add(qs);
      const A=[lx+.05,kz+.03], B=[-(AUSSEN+.05),kz+.01], pt=r()*6;
      H.anim(tr,(t)=>{ const u=((t*.13+pt)%1), hin=u<.5, kk=hin?u*2:2-u*2, s=kk*kk*(3-2*kk);
        tr.position.set(A[0]+(B[0]-A[0])*s,Math.abs(Math.sin(t*9))*.004,A[1]+(B[1]-A[1])*s); tr.rotation.y=Math.atan2(B[0]-A[0],B[1]-A[1])+(hin?0:Math.PI); qs.visible=hin; }); }
    // Leben auf dem Domplatz: zwei Spaziergänger vor dem Portal
    [[.22,.07,P.tuch2],[.16,.05,P.tuch3]].forEach(([w,v,c],i)=>{ const f=figur(H,g,0,0,c,0), z=zE+.14+i*.09, ph=r()*6;
      H.anim(f,(t)=>{ const s=Math.sin(t*v*3+ph); f.position.set(s*w,Math.abs(Math.sin(t*7+i))*.003,z); f.rotation.y=Math.cos(t*v*3+ph)>0?Math.PI/2:-Math.PI/2; }); });
    figur(H,g,.27,zE+.06,P.tuch,2.5); figur(H,g,-.3,zS+.02,P.tuch3,.8);
    // Tauben kreisen um die fertigen Turmspitzen
    tauben.forEach(([x,y,z],ti)=>{ for(let i=0;i<2;i++){ const v=H.mesh(H.GEO.box,0xe8e4dc,.014,.003,.006,x,y,z); g.add(v); const ph=r()*6, rr=.07+i*.03, sp=.8+r()*.4;
      H.anim(v,(t)=>{ const a=t*sp+ph+i*Math.PI; v.position.set(x+Math.cos(a)*rr,y+Math.sin(t*1.7+ph)*.02,z+Math.sin(a)*rr); v.rotation.y=-a; v.scale.x=.014*(1+.3*Math.sin(t*14+i)); }); } });
  },
  bauplanEntwurf:false,                               // kein Umriss des Zielgebäudes: Rohbau und Zimmerplatz sagen genug
  bauplan(g,r,H,f,B){                                 // Bauplan: Baubeginn wie im Mittelalter. Mauerfuß mit ersten Steinlagen, Quaderstapel, Bruchstein, Bauholz,
                                                      // Kalkgrube, Steinmetzhütte, Dreibock, Zimmerplatz, Ochsenkarren und ein Träger, der Steine zur Mauer bringt
    const ERDE=0x6e5a44, KALK=0xeeeadf, ST=[P.stein,P.stein2,0xb0a48f,0xc4b9a4];
    g.add(H.mesh(H.GEO.cyl12,H.mix(B?B.top:0x4b6a4c,ERDE,.5),.62,.004,.58,0,.002,.02,Math.PI/8));           // zertretener Boden
    for(let i=0;i<7;i++){ const a=r()*6.283, d=.2+r()*.4; g.add(H.mesh(H.GEO.cyl12,H.mix(ERDE,0x000000,r()*.2),.05+r()*.08,.005,.04+r()*.06,Math.cos(a)*d,.004,Math.sin(a)*d,r()*3)); }
    // Mauerfuß: Fundamentgraben, darauf die ersten Lagen; zur hinteren Ecke hin schon höher, Lücke für die Tür
    const lw=.5, ld=.34, cx=-.02, cz=-.06, SH=.024;
    H.box(g,H.mix(ERDE,0x000000,.3),lw+.05,.006,ld+.05,cx,0,cz);
    const lage=(x1,z1,x2,z2,hoch,tuer)=>{ const L=Math.hypot(x2-x1,z2-z1), ux=(x2-x1)/L, uz=(z2-z1)/L, w=-Math.atan2(uz,ux);
      for(let k=0;k<6;k++){ let s=k%2?.026:0; while(s<L-.005){ const bl=Math.min(.042+r()*.022,L-s), m=s+bl/2, u=m/L;
          const h=hoch(u); if(k<h&&!(tuer&&Math.abs(u-.5)<.11&&k>0)){ const ec=s<.001||s+bl>L-.001;
            g.add(H.mesh(H.GEO.box,ton(H,r,H.pick(r,ST),.07),bl-.003,SH-.002,ec?.038:.032,cx+x1+ux*m,.006+k*SH+SH/2,cz+z1+uz*m,w)); }
          s+=bl; } } };
    const X=lw/2, Z=ld/2, rampe=(a,b)=>u=>Math.round(a+(b-a)*u+(r()-.5)*.8);
    lage(-X,Z,X,Z,rampe(2,3),true);          // Vorderwand mit Türlücke
    lage(X,Z,X,-Z,rampe(3,5));               // rechte Wand steigt nach hinten an
    lage(X,-Z,-X,-Z,rampe(5,2));             // Rückwand: hohe Ecke rechts hinten
    lage(-X,-Z,-X,Z,rampe(2,1));
    H.box(g,KALK,.06,.004,.03,cx+X-.04,.006+4*SH,cz-Z,0);                                         // frischer Mörtel auf der obersten Lage
    // Quaderstapel: fertig behauene Steine, pyramidenförmig gestapelt, daneben ein loser Haufen Bruchstein
    const qx=.44, qz=.2;
    for(let k=0;k<3;k++) for(let i=0;i<3-k;i++) for(let j=0;j<2;j++) H.box(g,ton(H,r,H.pick(r,ST),.06),.05,.03,.034,qx-.05+i*.052+k*.026,.002+k*.03,qz+j*.036,.0);
    for(let i=0;i<9;i++){ const a=r()*6.283, d=r()*.05; g.add(H.mesh(H.GEO.ico,ton(H,r,P.stein3,.12),.018+r()*.01,.014+r()*.008,.018+r()*.01,qx+.07+Math.cos(a)*d,.01+(d<.025?.012:0),qz-.1+Math.sin(a)*d,r()*3,r()*3)); }
    // Bauholz: gestapelte Stämme und Bohlen
    const hz=new H.THREE.Group(); hz.position.set(.5,0,-.26); hz.rotation.y=1.1; g.add(hz);
    for(let k=0;k<3;k++) for(let i=0;i<3-k;i++) hz.add(H.mesh(H.GEO.cyl8,ton(H,r,P.holz,.1),.013,.26,.013,0,.013+k*.022,-.026+i*.026+k*.013,0,0,Math.PI/2));
    for(let i=0;i<3;i++) H.box(g,ton(H,r,P.holz,.08),.24,.008,.04,.36,.002+i*.009,-.46,.4+i*.05);
    // Kalkgrube mit Bretterrand, Mörtelkiste mit Hacke, Sandhaufen
    const kx=-.46, kz=-.12;
    H.box(g,KALK,.13,.004,.1,kx,.002,kz,.3); [[.07,0,.012,.11],[-.07,0,.012,.11],[0,.055,.15,.012],[0,-.055,.15,.012]].forEach(([dx,dz,w,d])=>{
      const ca=Math.cos(.3), sa=Math.sin(.3); H.box(g,P.holz2,w,.014,d,kx+dx*ca+dz*sa,0,kz-dx*sa+dz*ca,.3); });
    H.box(g,P.holz,.08,.018,.05,kx+.02,0,kz+.13,-.2); H.box(g,0xcfc8b8,.07,.004,.04,kx+.02,.016,kz+.13,-.2);
    g.add(H.mesh(H.GEO.box,P.holz2,.004,.004,.08,kx+.05,.03,kz+.13,0,.5,0));
    g.add(H.mesh(H.GEO.cone8,0xc9b083,.07,.045,.07,kx-.04,.022,kz+.26));
    // Steinmetzhütte: Pultdach auf Pfosten, Werkbank mit angefangenem Quader
    const hu=new H.THREE.Group(); hu.position.set(-.18,0,-.5); hu.rotation.y=.15; g.add(hu);
    [[-.12,-.05,.17],[.12,-.05,.17],[-.12,.06,.12],[.12,.06,.12]].forEach(([x,z,h])=>H.box(hu,P.holz2,.012,h,.012,x,0,z));
    for(let i=0;i<6;i++) H.box(hu,ton(H,r,P.holz,.1),.042,.15,.006,-.105+i*.042,0,-.056);                   // Bretterwand hinten
    [-1,1].forEach(sd=>{ for(let i=0;i<2;i++) H.box(hu,ton(H,r,P.holz,.1),.006,.1-i*.02,.05,sd*.123,0,-.03+i*.05); });
    hu.add(H.mesh(H.GEO.box,P.reet,.3,.012,.17,0,.148,.005,0,-.4)); hu.add(H.mesh(H.GEO.box,H.mix(P.reet,0x000000,.25),.3,.006,.012,0,.13,.085));
    for(let i=0;i<3;i++) H.box(hu,P.eisen,.004,.03,.002,-.08+i*.025,.08,-.052);                           // Werkzeug an der Wand
    H.box(hu,P.holz,.07,.035,.04,-.03,0,.03); H.box(hu,ton(H,r,P.stein,.05),.045,.025,.03,-.03,.035,.03);
    for(let i=0;i<5;i++) g.add(H.mesh(H.GEO.ico,0xd8d0c0,.006,.004,.006,-.2+r()*.1,.002,-.42+r()*.06));    // Steinsplitter
    // Dreibock mit Seil über der hohen Ecke
    const dx=cx+X+.05, dz=cz-Z-.05;
    [[.06,.03],[-.05,.04],[0,-.06]].forEach(([a,b])=>{ const l=Math.hypot(a,b,.3); g.add(H.mesh(H.GEO.box,P.holz2,.008,l,.008,dx+a/2,.15,dz+b/2,0,Math.atan2(b,.3)*-1,Math.atan2(a,.3))); });
    const seil=H.mesh(H.GEO.box,P.balken,.002,.1,.002,dx,.24,dz); g.add(seil); const qs=H.mesh(H.GEO.box,ton(H,r,P.stein,.05),.04,.025,.03,dx,.18,dz); g.add(qs);
    const phs=r()*6; H.anim(qs,(t)=>{ const u=(Math.sin(t*.6+phs)+1)/2; qs.position.y=.06+u*.12; seil.scale.y=.3-qs.position.y+.0; seil.position.y=(.3+qs.position.y)/2; });
    // Ochsenkarren mit Steinen
    const ka=new H.THREE.Group(); ka.position.set(.24,0,.52); ka.rotation.y=-.35; g.add(ka);
    H.box(ka,P.holz,.13,.012,.08,0,.035,0); [-1,1].forEach(sd=>H.box(ka,P.holz2,.13,.025,.006,0,.047,sd*.04));
    [-1,1].forEach(sd=>{ const rad=new H.THREE.Mesh(H.GEO.torus,H.M(P.balken)); rad.scale.set(.032,.032,.12); rad.position.set(0,.032,sd*.048); ka.add(rad); });
    H.box(ka,P.holz2,.12,.006,.006,-.12,.035,0);
    for(let i=0;i<4;i++) H.box(ka,ton(H,r,P.stein,.06),.035,.022,.028,-.035+(i%2)*.04,.047,(i<2?-.016:.016),r()*.3);
    const ochs=new H.THREE.Group(); ochs.position.set(-.24,0,0); ka.add(ochs);
    H.box(ochs,0x6a5040,.09,.045,.04,0,.035,0); [[-.035,-.013],[.035,-.013],[-.035,.013],[.035,.013]].forEach(([a,b])=>H.box(ochs,0x4a3a2e,.01,.035,.01,a,0,b));
    H.box(ochs,0x5a4434,.035,.03,.032,-.06,.05,0); [-1,1].forEach(sd=>H.box(ochs,0xe8dcc0,.004,.004,.02,-.07,.08,sd*.018));
    // Träger: holt einen Quader vom Stapel und trägt ihn zur Mauer
    const tr=figur(H,g,0,0,P.tuch,0), last=H.mesh(H.GEO.box,ton(H,r,P.stein,.05),.032,.02,.026,0,.085,0); tr.add(last);
    const A=[qx-.115,qz+.02], Bz=[cx+X-.09,cz+Z+.07], pht=r()*6;   // Weg vor dem Stapel bis vor die Mauerecke, ohne Steine zu schneiden
    H.anim(tr,(t)=>{ const u=((t*.12+pht)%1), hin=u<.5, k=hin?u*2:2-u*2, s=k*k*(3-2*k);
      tr.position.set(A[0]+(Bz[0]-A[0])*s,Math.abs(Math.sin(t*9))*.004,A[1]+(Bz[1]-A[1])*s); tr.rotation.y=Math.atan2(Bz[0]-A[0],Bz[1]-A[1])+(hin?0:Math.PI); last.visible=hin; });
    figur(H,g,cx-X+.08,cz+Z+.07,P.tuch2,2.4);                                                    // Maurer an der Vorderwand
    // Zimmerplatz (statt Bautafel): Sägebock mit Stamm und zwei Sägern, Bohlenstapel, Schubkarre mit Mörtel, Werkzeugkorb
    const zp=new H.THREE.Group(); zp.position.set(-.4,0,.44); zp.rotation.y=.6; g.add(zp);
    [-1,1].forEach(sd=>{ zp.add(H.mesh(H.GEO.box,P.holz2,.008,.07,.008,sd*.07,.03,-.015,0,.35,0)); zp.add(H.mesh(H.GEO.box,P.holz2,.008,.07,.008,sd*.07,.03,.015,0,-.35,0)); });
    zp.add(H.mesh(H.GEO.cyl8,ton(H,r,P.holz,.08),.018,.24,.018,0,.072,0,0,0,Math.PI/2));
    for(let i=0;i<4;i++) H.box(zp,0xe0c89a,.012,.004,.012,-.04+i*.03,.003,.05+r()*.03);                       // Sägespäne
    zp.add(H.mesh(H.GEO.box,P.eisen,.004,.05,.12,.02,.075,0,0,.15,0));                              // Säge steckt im Schnitt (steht still)
    figur(H,zp,.02,.08,P.tuch2,Math.PI); figur(H,zp,.02,-.08,P.tuch3,0);
    for(let i=0;i<4;i++) H.box(zp,ton(H,r,P.holz,.08),.22,.008,.035,-.02,.002+i*.009,-.15+(i%2)*.004,(r()-.5)*.08);   // Bohlenstapel
    const sk=new H.THREE.Group(); sk.position.set(.12,0,.32); sk.rotation.y=-.9; g.add(sk);                      // Schubkarre mit Mörtel
    H.box(sk,P.holz,.06,.025,.045,0,.02,0); H.box(sk,0xcfc8b8,.05,.004,.037,0,.044,0);
    const rad=new H.THREE.Mesh(H.GEO.torus,H.M(P.balken)); rad.scale.set(.018,.018,.08); rad.position.set(.045,.018,0); sk.add(rad);
    [-1,1].forEach(sd=>sk.add(H.mesh(H.GEO.box,P.holz2,.06,.005,.005,-.05,.03,sd*.018,0,0,.25)));
    const ko=H.mesh(H.GEO.cyl8,0x9a7a48,.02,.025,.02,-.2,.012,.58); g.add(ko); H.box(g,P.eisen,.003,.035,.003,-.195,.02,.58);   // Werkzeugkorb
    for(let i=0;i<12;i++){ const a=i/12*6.283+r()*.3, d=.72+r()*.08; H.gras(g,Math.cos(a)*d,Math.sin(a)*d,1,r,H.mix(B?B.top:0x4b6a4c,0x7fae6a,.35)); }
  },
  baustelleEntwurf:false,                             // kein Umriss des Zielgebäudes, wie beim Bauplan
  baustelle(g,r,H,f,p,B){                             // Baustelle: Fortsetzung des Bauplatzes. Die Mauern wachsen mit dem Fortschritt p (0..1),
                                                      // Auslegergerüst, Leiter, Tretradkran, Dachbalken; ab etwa 75 % stehen die ersten Dachgebinde
    p=p==null?.35:p;
    const ERDE=0x6e5a44, KALK=0xeeeadf, ST=[P.stein,P.stein2,0xb0a48f,0xc4b9a4];
    g.add(H.mesh(H.GEO.cyl12,H.mix(B?B.top:0x4b6a4c,ERDE,.5),.62,.004,.58,0,.002,.02,Math.PI/8));            // zertretener Boden
    for(let i=0;i<6;i++){ const a=r()*6.283, d=.25+r()*.35; g.add(H.mesh(H.GEO.cyl12,H.mix(ERDE,0x000000,r()*.2),.05+r()*.07,.005,.04+r()*.05,Math.cos(a)*d,.004,Math.sin(a)*d,r()*3)); }
    // Mauern: Höhe aus dem Fortschritt (4 bis 12 Lagen), Tür vorne, Fensteröffnungen in den Seitenwänden
    const lw=.5, ld=.34, cx=-.02, cz=-.06, SH=.024, N=Math.round(4+p*8), X=lw/2, Z=ld/2;
    H.box(g,H.mix(ERDE,0x000000,.3),lw+.05,.006,ld+.05,cx,0,cz);
    const mauer=(x1,z1,x2,z2,n,luecken)=>{ const L=Math.hypot(x2-x1,z2-z1), ux=(x2-x1)/L, uz=(z2-z1)/L, w=-Math.atan2(uz,ux);
      for(let k=0;k<n;k++){ let s=k%2?.026:0; while(s<L-.005){ const bl=Math.min(.042+r()*.022,L-s), m=s+bl/2, u=m/L;
          const offen=luecken.some(([c,b,k0,k1])=>Math.abs(u-c)<b&&k>=k0&&k<k1);
          if(!offen&&!(k===n-1&&r()<.18)){ const ec=s<.001||s+bl>L-.001;                                 // oberste Lage noch lückenhaft
            g.add(H.mesh(H.GEO.box,ton(H,r,H.pick(r,ST),.07),bl-.003,SH-.002,ec?.038:.032,cx+x1+ux*m,.006+k*SH+SH/2,cz+z1+uz*m,w)); }
          s+=bl; }
        luecken.forEach(([c,b,k0,k1])=>{ if(k===k1&&k<n){ const m=c*L; H.box(g,P.holz2,b*2*L+.02,.008,.036,cx+x1+ux*m,.006+k*SH-.004,cz+z1+uz*m,w); } });   // Sturzbalken
      } };
    const nV=N, nS=Math.max(3,N-1-Math.floor(r()*2));
    mauer(-X,Z,X,Z,nV,[[.5,.1,1,7]]);                         // Vorderwand mit Tür
    mauer(X,Z,X,-Z,nS,[[.5,.13,4,7]]);                        // rechte Wand mit Fenster
    mauer(X,-Z,-X,-Z,nV,[[.3,.08,5,8],[.7,.08,5,8]]);          // Rückwand mit zwei Fenstern
    mauer(-X,-Z,-X,Z,nS,[[.5,.13,4,7]]);
    const HW=.006+nV*SH;
    H.box(g,KALK,.07,.004,.03,cx-X+.08,HW,cz+Z,0);                                                 // frischer Mörtel oben
    // Auslegergerüst vor Vorder- und rechter Wand: Standbäume, Riegel, Bohlenlagen, Streben
    const gh=HW+.07, BO=0xa98a5e, ger=(x1,z1,x2,z2,nx,nz)=>{ const L=Math.hypot(x2-x1,z2-z1), n=Math.max(2,Math.round(L/.12));
      for(let i=0;i<=n;i++){ const x=x1+(x2-x1)*i/n, z=z1+(z2-z1)*i/n; H.box(g,P.holz2,.008,gh,.008,x+nx*.055,0,z+nz*.055); }
      const w=-Math.atan2(z2-z1,x2-x1), mx=(x1+x2)/2+nx*.055, mz=(z1+z2)/2+nz*.055, mx2=(x1+x2)/2+nx*.028, mz2=(z1+z2)/2+nz*.028;
      for(let y=.07;y<gh-.01;y+=.07) g.add(H.mesh(H.GEO.box,P.holz2,L,.005,.005,mx,y,mz,w));
      for(let y=.07;y<HW-.01;y+=.07){ for(let j=0;j<2;j++) g.add(H.mesh(H.GEO.box,ton(H,r,BO,.08),L*.98,.004,.022,mx2+nx*(j*.022-.011),y+.004,mz2+nz*(j*.022-.011),w)); }
      const sl=Math.hypot(L/n,gh*.7); g.add(H.mesh(H.GEO.box,P.holz2,sl,.004,.004,x1+(x2-x1)*.5/n+nx*.06,gh*.38,z1+(z2-z1)*.5/n+nz*.06,w,0,Math.atan2(gh*.7,L/n)));
    };
    ger(cx-X,cz+Z,cx+X,cz+Z,0,1); ger(cx+X,cz+Z,cx+X,cz-Z,1,0);
    // Leiter am Gerüst
    const lh=Math.min(gh,HW+.03), lx=cx-X+.06, lz=cz+Z+.1, la=.32;
    [-1,1].forEach(sd=>g.add(H.mesh(H.GEO.box,P.holz,.006,lh*1.04,.006,lx+sd*.018,lh/2,lz-Math.sin(la)*lh/2,0,-la,0)));
    for(let y=.03;y<lh;y+=.03) g.add(H.mesh(H.GEO.box,P.holz,.036,.004,.004,lx,y,lz-Math.tan(la)*y,0));
    figur(H,g,cx-X+.14,cz+Z+.03,P.tuch2,0).position.y=HW>.07?Math.floor((HW-.01)/.07)*.07+.008:0;   // Maurer auf der obersten Bohlenlage
    // Tretradkran links hinten: Rad dreht sich, Last fährt auf und ab
    const k=new H.THREE.Group(); k.position.set(cx-X-.14,0,cz-Z-.04); g.add(k);
    const kh=Math.max(.36,HW+.16);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>H.box(k,P.holz2,.012,.012,.012,a*.05,0,b*.05)); H.box(k,P.holz2,.12,.012,.012,0,.012,-.05); H.box(k,P.holz2,.12,.012,.012,0,.012,.05);
    H.box(k,P.holz2,.022,kh,.022,0,0,0); [-1,1].forEach(sd=>k.add(H.mesh(H.GEO.box,P.holz2,.008,kh*.5,.008,sd*.035,kh*.22,0,0,0,-sd*.3)));
    const rad=new H.THREE.Group(); rad.position.set(0,.085,0); k.add(rad);
    [-1,1].forEach(sd=>{ const ring=new H.THREE.Mesh(H.GEO.torus,H.M(P.holz)); ring.scale.set(.075,.075,.08); ring.position.z=sd*.025; rad.add(ring); });
    for(let i=0;i<8;i++) rad.add(H.mesh(H.GEO.box,P.holz2,.004,.15,.004,0,0,0,0,0,i*Math.PI/8));
    for(let i=0;i<12;i++){ const a=i/12*6.283; rad.add(H.mesh(H.GEO.box,P.holz,.012,.004,.054,Math.cos(a)*.073,Math.sin(a)*.073,0,0,0,a)); }
    H.anim(rad,(t)=>{ rad.rotation.z=t*.6; });
    const jx=X*.55, jz=Z*.7, jl=Math.hypot(jx,jz)+.06, jw=-Math.atan2(jz,jx);                         // Ausleger zeigt über die Mauerecke
    k.add(H.mesh(H.GEO.box,P.holz2,jl,.014,.014,jx/2,kh,jz/2,jw)); k.add(H.mesh(H.GEO.box,P.holz2,.01,.12,.01,jx*.35,kh-.05,jz*.35,jw,0,.7));
    const seil=H.mesh(H.GEO.box,P.balken,.002,1,.002,0,0,0); seil.position.set(k.position.x+jx,0,k.position.z+jz); g.add(seil);
    const last=H.mesh(H.GEO.box,ton(H,r,P.stein,.05),.04,.026,.032,seil.position.x,0,seil.position.z); g.add(last);
    const phk=r()*6; H.anim(last,(t)=>{ const u=(Math.sin(t*.3+phk)+1)/2, y=.02+u*(HW+.04); last.position.y=y; seil.scale.y=kh-y; seil.position.y=(kh+y)/2; });
    H.anim(seil,()=>{});
    // Material: kleinerer Quaderstapel, Mörtelkiste, Sand, Dachbalken und ein abgebundenes Dachgebinde am Boden
    const qx=.44, qz=.2;
    for(let k2=0;k2<2;k2++) for(let i=0;i<2-k2;i++) for(let j=0;j<2;j++) H.box(g,ton(H,r,H.pick(r,ST),.06),.05,.03,.034,qx-.025+i*.052+k2*.026,.002+k2*.03,qz+j*.036,0);
    H.box(g,P.holz,.08,.018,.05,.44,0,-.04,.2); H.box(g,0xcfc8b8,.07,.004,.04,.44,.016,-.04,.2); g.add(H.mesh(H.GEO.cone8,0xc9b083,.06,.04,.06,.5,.02,-.16));
    for(let i=0;i<5;i++) H.box(g,ton(H,r,P.holz,.08),.36,.014,.014,-.04,.002+(i>2?.014:0),.4+(i%3)*.018,.0);       // Dachbalken
    const gb=new H.THREE.Group(); gb.position.set(-.06,.004,.52); gb.rotation.set(-Math.PI/2,0,0); g.add(gb);   // liegendes Gebinde (A-Form)
    const sp=.17, sh=.13; [-1,1].forEach(sd=>gb.add(H.mesh(H.GEO.box,P.holz2,Math.hypot(sp,sh),.012,.012,sd*sp/2,sh/2,0,0,0,-sd*Math.atan2(sh,sp))));
    gb.add(H.mesh(H.GEO.box,P.holz2,sp*2,.012,.012,0,0,0)); gb.add(H.mesh(H.GEO.box,P.holz2,sp,.01,.01,0,sh*.5,0));
    if(p>=.75){ const nG=p>=.95?4:2;                                                                // erste Gebinde stehen auf der Mauer
      for(let i=0;i<nG;i++){ const x=cx-X+.04+i*(lw-.08)/(Math.max(1,nG-1)), gh2=.15;
        [-1,1].forEach(sd=>g.add(H.mesh(H.GEO.box,P.holz2,.012,Math.hypot(Z+.02,gh2),.012,x,HW+gh2/2,cz+sd*(Z+.02)/2,0,-sd*Math.atan2(Z+.02,gh2),0)));
        g.add(H.mesh(H.GEO.box,P.holz2,.012,.012,ld+.02,x,HW+.006,cz)); }
      g.add(H.mesh(H.GEO.box,P.holz2,lw-.06,.014,.014,cx,HW+.15,cz)); }
    // Steinmetzhütte hinten rechts (ohne Figur), Werkbank mit Quader
    const hu=new H.THREE.Group(); hu.position.set(.3,0,-.5); hu.rotation.y=-.25; g.add(hu);
    [[-.12,-.05,.17],[.12,-.05,.17],[-.12,.06,.12],[.12,.06,.12]].forEach(([x,z,h])=>H.box(hu,P.holz2,.012,h,.012,x,0,z));
    for(let i=0;i<6;i++) H.box(hu,ton(H,r,P.holz,.1),.042,.15,.006,-.105+i*.042,0,-.056);
    hu.add(H.mesh(H.GEO.box,P.reet,.3,.012,.17,0,.148,.005,0,-.4));
    H.box(hu,P.holz,.07,.035,.04,-.03,0,.03); H.box(hu,ton(H,r,P.stein,.05),.045,.025,.03,-.03,.035,.03);
    // Träger: holt Quader vom Stapel und bringt sie zum Leiterfuß
    const tr=figur(H,g,0,0,P.tuch,0), qs=H.mesh(H.GEO.box,ton(H,r,P.stein,.05),.032,.02,.026,0,.085,0); tr.add(qs);
    const A=[qx-.1,qz+.05], Bz=[lx+.05,lz+.03], pht=r()*6;
    H.anim(tr,(t)=>{ const u=((t*.11+pht)%1), hin=u<.5, kk=hin?u*2:2-u*2, s=kk*kk*(3-2*kk);
      tr.position.set(A[0]+(Bz[0]-A[0])*s,Math.abs(Math.sin(t*9))*.004,A[1]+(Bz[1]-A[1])*s); tr.rotation.y=Math.atan2(Bz[0]-A[0],Bz[1]-A[1])+(hin?0:Math.PI); qs.visible=hin; });
    for(let i=0;i<12;i++){ const a=i/12*6.283+r()*.3, d=.72+r()*.08; H.gras(g,Math.cos(a)*d,Math.sin(a)*d,1,r,H.mix(B?B.top:0x4b6a4c,0x7fae6a,.35)); }
  },
  verworfen(g,r,H,f,p,wild,B){                        // Verworfen: aufgegebene Baustelle. Mauern so hoch, wie die Aufgabe kam (p), verwittert und bemoost;
                                                      // umgestürztes Gerüst, liegengebliebenes Material, Absperrung aus Pflöcken und Seil, Schild mit Kreuz.
                                                      // Je länger verworfen (wild 0..1), desto mehr holt sich die Natur zurück: Gras, Büsche, ein junger Baum im Grundriss.
    const ERDE=0x6e5a44, MOOS=0x5d6b4a, ST=[P.stein,P.stein2,0xb0a48f,0xa8a090], top=B?B.top:0x4b6a4c;
    g.add(H.mesh(H.GEO.cyl12,H.mix(top,ERDE,.3-wild*.15),.6,.004,.56,0,.002,.02,Math.PI/8));
    const lw=.5, ld=.34, cx=-.02, cz=-.06, SH=.024, N=Math.max(2,Math.round(2+p*8)), X=lw/2, Z=ld/2;
    H.box(g,H.mix(ERDE,0x000000,.3),lw+.05,.006,ld+.05,cx,0,cz);
    const stein=()=>H.mix(ton(H,r,H.pick(r,ST),.06),MOOS,r()*(.15+wild*.35));
    const mauer=(x1,z1,x2,z2,n,tuer)=>{ const L=Math.hypot(x2-x1,z2-z1), ux=(x2-x1)/L, uz=(z2-z1)/L, w=-Math.atan2(uz,ux);
      let s=0; const spalten=[]; while(s<L-.005){ const bl=Math.min(.046+r()*.02,L-s); spalten.push([s,bl]); s+=bl; }
      spalten.forEach(([s0,bl],i)=>{ const m=s0+bl/2, u=m/L, h=Math.max(1,n-Math.floor(r()*r()*3)-(i%5===2?1:0));   // ausgebrochene Krone
        for(let k=0;k<h;k++){ if(tuer&&Math.abs(u-.5)<.1&&k>0) continue; if(k>0&&r()<.08) continue;                  // einzelne Steine fehlen
          const off=k%2?.013:0; g.add(H.mesh(H.GEO.box,stein(),bl-.003,SH-.002,.034,cx+x1+ux*(m+off),.006+k*SH+SH/2,cz+z1+uz*(m+off),w)); }
        if(r()<.18+wild*.2) g.add(H.mesh(H.GEO.box,H.mix(MOOS,0x2e4a2e,r()*.4),bl,.03+r()*.05,.004,cx+x1+ux*m-uz*.019,.03,cz+z1+uz*m+ux*.019,w));   // Efeu an der Außenseite
      }); };
    mauer(-X,Z,X,Z,N,true); mauer(X,Z,X,-Z,Math.max(2,N-1)); mauer(X,-Z,-X,-Z,N); mauer(-X,-Z,-X,Z,Math.max(2,N-2));
    for(let i=0;i<10;i++){ const a=r()*6.283, d=.27+r()*.12; g.add(H.mesh(H.GEO.box,stein(),.04,.022,.03,cx+Math.cos(a)*d*1.1,.011,cz+Math.sin(a)*d*.8,r()*3,(r()-.5)*.5,(r()-.5)*.5)); }   // heruntergefallene Steine
    // Gerüst: zwei Standbäume schief, drei Stangen umgekippt, eine Bohle hängt
    const gz=cz+Z+.06; H.box(g,P.holz2,.008,.2,.008,cx-X+.04,0,gz); g.add(H.mesh(H.GEO.box,P.holz2,.008,.2,.008,cx+.06,.09,gz+.02,0,.25,.2));
    g.add(H.mesh(H.GEO.box,ton(H,r,0xa98a5e,.1),.18,.004,.024,cx-X+.12,.09,gz,0,0,-.45));
    for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.cyl8,0x6a5a4a,.006,.24,.006,cx+.08+i*.06,.008,gz+.06+i*.03,r()*.6,0,Math.PI/2));
    // liegengebliebenes Material: bemooster Quaderstapel, graues Holz
    const qx=.44, qz=.22; for(let k=0;k<2;k++) for(let i=0;i<2-k;i++) for(let j=0;j<2;j++) H.box(g,stein(),.05,.03,.034,qx-.025+i*.052+k*.026,.002+k*.03,qz+j*.036,0);
    H.box(g,MOOS,.06,.004,.05,qx+.01,.062,qz+.018,0);
    for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.cyl8,0x8a8078,.012,.24,.012,.42,.012+(i>1?.02:0),-.2+(i%2)*.025,0,.4,Math.PI/2));
    // Absperrung: Pflöcke mit durchhängendem Seil, eine Lücke, Schild mit Kreuz
    const pf=[]; for(let i=0;i<8;i++){ const a=i/8*6.283+.2; pf.push([Math.sin(a)*.6,Math.cos(a)*.56]); }
    pf.forEach(([x,z],i)=>{ H.box(g,P.holz2,.01,.07,.01,x,0,z,r()); const [x2,z2]=pf[(i+1)%8]; if(i===5) return;
      const l=Math.hypot(x2-x,z2-z), w=-Math.atan2(z2-z,x2-x); for(let k=0;k<4;k++){ const t=(k+.5)/4; g.add(H.mesh(H.GEO.box,0x8a6a4a,l/4+.004,.003,.003,x+(x2-x)*t,.06-Math.sin(t*Math.PI)*.02,z+(z2-z)*t,w)); } });
    const sx=pf[5][0]*.95, sz=pf[5][1]*.95; H.box(g,P.holz2,.01,.12,.01,sx,0,sz); const sch=new H.THREE.Group(); sch.position.set(sx,.1,sz); sch.rotation.y=Math.atan2(sx,sz); g.add(sch);
    H.box(sch,0xb89a6a,.08,.06,.006,0,0,.008); [.7,-.7].forEach(a=>sch.add(H.mesh(H.GEO.box,0x7a2018,.07,.009,.003,0,.03,.012,0,0,a)));
    [-1,1].forEach(sd=>g.add(H.mesh(H.GEO.box,0x7a6048,.08,.01,.004,cx,.045,cz+Z+.02,0,0,sd*.7)));    // Bretterkreuz vor der Türöffnung
    // Natur holt sich den Platz: Gras, Büsche, junger Baum im Grundriss
    H.streu(r,Math.round(10+wild*28),.62,[],.04).forEach(p2=>H.gras(g,p2[0],p2[1],.85+wild*.15,r,H.mix(top,0x7fae6a,.3)));
    H.streu(r,Math.round(1+wild*5),.6,[[qx,qz,.08]],.1).forEach(p2=>H.busch(g,p2[0],p2[1],.7+wild*.5,r,H.pick(r,[0x3e5a48,0x4a6b4f,0x557a55])));
    for(let i=0;i<Math.round(4+wild*8);i++){ const x=cx+(r()-.5)*(lw-.08), z=cz+(r()-.5)*(ld-.08); H.gras(g,x,z,.8+wild*.15,r,H.mix(top,0x8fbe7a,.3)); }
    if(wild>.25) H.baum(g,cx+.06,cz-.02,.3+wild*.45,r,"laub");
    for(let i=0;i<12;i++){ const a=i/12*6.283+r()*.3, d=.72+r()*.08; H.gras(g,Math.cos(a)*d,Math.sin(a)*d,1,r,H.mix(top,0x7fae6a,.35)); }
    // Krähen auf der Mauerkrone, eine hüpft
    const ky=.006+N*SH; [[cx-X+.1,cz-Z],[cx+X,cz+.04]].forEach(([x,z],i)=>{ const k=new H.THREE.Group(); k.position.set(x,ky,z); k.rotation.y=r()*6; g.add(k);
      k.add(H.mesh(H.GEO.ico,0x1e1e22,.012,.01,.008,0,.01,0)); k.add(H.mesh(H.GEO.box,0x1e1e22,.008,.008,.007,.012,.016,0)); k.add(H.mesh(H.GEO.box,0x3a3020,.006,.003,.003,.019,.015,0));
      if(i===0){ const ph=r()*6; H.anim(k,(t)=>{ const u=(t*.5+ph)%3; k.position.y=ky+(u<.3?Math.sin(u/.3*Math.PI)*.012:0); k.rotation.y=Math.floor((t*.5+ph)/3)*1.3; }); } });
  },
  brandruine(g,r,H,f,st,p,B){                         // Brandruine: die Baustelle, die beim Angriff niederbrannte. Mauern so hoch, wie der Bau am Brandtag war (p),
                                                      // geschwärzt und teils eingestürzt; verkohltes Gerüst, umgestürzter Kran, Katapultkugeln im Schutt.
                                                      // Stufe st nach Tagen seit dem Brand: 0 brennt, 1 glimmt, 2 kalte Asche, 3 Unkraut, 4 überwuchert. Ein Sühnekreuz bleibt.
    const top=B?B.top:0x4b6a4c, RUSS=0x1a1614, ST=[P.stein,P.stein2,0xb0a48f,0xa8a090], MOOS=0x5d6b4a, schwarz=[.9,.86,.78,.66,.5][st];
    g.add(H.mesh(H.GEO.cyl12,H.mix(top,RUSS,[.8,.68,.5,.3,.12][st]),.62,.004,.58,0,.002,.02,Math.PI/8));
    const lw=.5, ld=.34, cx=-.02, cz=-.06, SH=.024, N=Math.max(2,Math.round(3+p*8)), X=lw/2, Z=ld/2;
    const stein=()=>{ let c=H.mix(ton(H,r,H.pick(r,ST),.06),RUSS,Math.min(.96,schwarz*(.85+r()*.25))); if(st>=3) c=H.mix(c,MOOS,r()*(st===4?.4:.2)); return c; };
    const mauer=(x1,z1,x2,z2,n,einsturz,tuer)=>{ const L=Math.hypot(x2-x1,z2-z1), ux=(x2-x1)/L, uz=(z2-z1)/L, w=-Math.atan2(uz,ux);
      let s=0; while(s<L-.005){ const bl=Math.min(.046+r()*.02,L-s), m=s+bl/2, u=m/L;
        const h=einsturz?Math.max(0,Math.round(n*(.15+.5*Math.abs(Math.sin(u*3+r())))*(r()<.3?.3:1))):Math.max(1,n-Math.floor(r()*r()*4));
        for(let k=0;k<h;k++){ if(tuer&&Math.abs(u-.5)<.1&&k>0) continue; const off=k%2?.013:0;
          g.add(H.mesh(H.GEO.box,stein(),bl-.003,SH-.002,.034,cx+x1+ux*(m+off),.006+k*SH+SH/2,cz+z1+uz*(m+off),w)); }
        if(einsturz&&r()<.5) for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.box,stein(),.04,.022,.03,cx+x1+ux*m+uz*(.03+r()*.08),.011+(i===2?.02:0),cz+z1+uz*m-ux*(.03+r()*.08),r()*3,(r()-.5)*.6,(r()-.5)*.6));   // Schuttkegel
        s+=bl; } };
    const eW=Math.floor(r()*4);                                                                   // eine Wand ist eingestürzt
    mauer(-X,Z,X,Z,N,eW===0,true); mauer(X,Z,X,-Z,N-1,eW===1); mauer(X,-Z,-X,-Z,N,eW===2); mauer(-X,-Z,-X,Z,N-1,eW===3);
    H.box(g,H.mix(RUSS,top,st*.15),lw-.04,.004,ld-.04,cx,.006,cz);                                 // Asche im Inneren
    // verkohltes Gerüst, umgestürzter Tretradkran, verbrannte Dachbalken
    const SW=H.mix(0x221c18,0x4a4038,st*.12);
    [[cx-X+.02,cz+Z+.06,.22,.2],[cx+.1,cz+Z+.06,.14,-.35],[cx+X+.06,cz-.05,.18,.15]].forEach(([x,z,h,k])=>g.add(H.mesh(H.GEO.box,SW,.009,h,.009,x+Math.sin(k)*h/2,Math.cos(k)*h/2,z,0,0,-k)));
    for(let i=0;i<4;i++) g.add(H.mesh(H.GEO.box,SW,.16+r()*.08,.01,.016,cx+(r()-.5)*.6,.012,cz+Z+.12+r()*.12,r()*3));
    const kx=cx-X-.13, kz=cz-Z+.02; const rad=new H.THREE.Mesh(H.GEO.torus,H.M(SW)); rad.scale.set(.075,.075,.08); rad.rotation.x=Math.PI/2; rad.position.set(kx,.012,kz); rad.castShadow=true; g.add(rad);
    g.add(H.mesh(H.GEO.box,SW,.32,.018,.018,kx+.1,.015,kz-.12,.7)); g.add(H.mesh(H.GEO.box,SW,.2,.014,.014,kx-.04,.03,kz+.1,-.3,0,.15));
    if(p>.6){ const x=cx+.08, gh=.13, HW=.006+(N-1)*SH;                                         // verkohltes Dachgebinde hängt schief
      g.add(H.mesh(H.GEO.box,SW,.012,Math.hypot(Z,gh),.012,x,HW+gh/2,cz+Z/2,0,-Math.atan2(Z,gh),.25));
      g.add(H.mesh(H.GEO.box,SW,.012,Math.hypot(Z,gh)*.6,.012,x+.02,HW+gh*.3,cz-Z/3,0,Math.atan2(Z,gh),.25)); }
    // Katapultkugeln aus der Schlacht
    for(let i=0;i<5;i++){ const a=r()*6.283, d=.15+r()*.45; g.add(H.mesh(H.GEO.ico,H.pick(r,[0x6b6660,0x5a5550]),.022,.02,.022,cx+Math.cos(a)*d,.018,cz+Math.sin(a)*d*.9,r()*3)); }
    // Asche, Glut, Feuer, Rauch je nach Stufe
    for(let i=0;i<[30,22,16,8,3][st];i++){ const a=r()*6.283, d=Math.sqrt(r())*.58; g.add(H.mesh(H.GEO.dode,H.pick(r,[0x2a2624,0x3a3432,0x4a4440]),.012,.007,.012,Math.cos(a)*d,.008,Math.sin(a)*d,r()*3)); }
    if(st<=1) for(let i=0;i<(st?6:18);i++){ const a=r()*6.283, d=Math.sqrt(r())*.42; const e=H.mesh(H.GEO.box,H.pick(r,[0xff6a20,0xff8a3a,0xd8401a]),.012,.005,.012,cx+Math.cos(a)*d*.8,.012,cz+Math.sin(a)*d*.6,r()*3); H.leucht(e); g.add(e); }
    if(st===0){ [[cx-.08,cz],[cx+X-.04,cz+Z-.02],[kx+.04,kz]].forEach(([x,z],i)=>{ const fe=H.feuer(g,x,z,.8-i*.15,.01+(i===1?.006+(N-1)*SH:0)); fe.userData.keep=true; }); H.rauch(g,cx,cz,1,1.5,0x3a3a3e); }
    if(st===1) H.rauch(g,cx+.05,cz-.05,.35,.8,0x606066);
    // Natur kehrt zurück
    const gruen=[0,3,10,24,38][st];
    H.streu(r,gruen,.82,[],.05).forEach(q=>H.gras(g,q[0],q[1],st>=3?.95:.7,r,H.mix(top,st>=3?0x7fae6a:0x8a8a52,.4)));
    if(st>=3) H.streu(r,st===3?3:7,.75,[[cx,cz,.2]],.12).forEach(q=>H.busch(g,q[0],q[1],.75+r()*.4,r,H.pick(r,[0x3e5a48,0x4a6b4f,0x557a55])));
    if(st>=3) for(let i=0;i<(st===3?2:6);i++){ const a=r()*6.283, d=.3+r()*.45; H.blumen(g,Math.cos(a)*d,Math.sin(a)*d,r); }
    if(st>=4){ H.baum(g,cx+.05,cz,.45,r,"laub"); H.baum(g,-.52,.36,.5,r,"laub"); H.baum(g,.54,-.34,.45,r,"nadel"); }
    // Sühnekreuz aus Stein: bleibt auf jeder Brandruine
    const sk=new H.THREE.Group(); sk.position.set(.5,0,.42); sk.rotation.y=-.6; g.add(sk);
    const kc=st>=3?H.mix(0x8a8478,MOOS,.25):0x8a8478;
    H.box(sk,kc,.05,.012,.03,0,0,0); H.box(sk,kc,.022,.1,.016,0,.012,0); H.box(sk,kc,.07,.02,.016,0,.072,0); H.box(sk,0x6a2a20,.014,.014,.002,0,.077,.009);
    if(st>=2) for(let i=0;i<3;i++) g.add(H.mesh(H.GEO.ico,H.pick(r,[0xc8402f,0xe0a030,0xf0e8d8]),.007,.007,.007,.5+(i-1)*.012,.008,.45+i*.006));
  },
  wohnAbstand:.22, wohnHausAbstand:.36,                // Häuser untereinander mindestens 0,36 auseinander
  wohnLaterne(g,x,z,H){                               // Laterne zwischen den Wohnhäusern: Holzpfosten mit Ausleger und Laterne
    H.box(g,P.holz2,.008,.14,.008,x,0,z); H.box(g,P.holz2,.03,.006,.006,x+.012,.13,z);
    H.box(g,P.eisen,.016,.004,.016,x+.025,.118,z); H.gbox(g,0xffc870,.012,.016,.012,x+.025,.1,z); H.halo(g,x+.025,.11,z,.1,0xffc870,.4);
  },
  wohnTreffpunkt(g,x,z,a,H,r){                        // Treffpunkt in der freien Ecke: Dorflinde mit Rundbank und zwei Leuten im Gespräch
    H.baum(g,x,z,1.15,r,"laub");
    for(let i=0;i<10;i++){ const b=i/10*6.283, nx=x+Math.cos(b)*.05, nz=z+Math.sin(b)*.05; H.box(g,P.holz,.032,.005,.012,nx,.022,nz,-b+Math.PI/2); if(i%2===0) H.box(g,P.holz2,.004,.022,.004,nx,0,nz); }
    figur(H,g,x+Math.sin(a)*.1,z+Math.cos(a)*.1,P.tuch2,a+2.6); figur(H,g,x+Math.sin(a+.5)*.12,z+Math.cos(a+.5)*.12,P.tuch,a-2.2);
  },                                    // Wohnhäuser sind hier bis 0,3 breit: Mittelpunkt mindestens 0,22 vom Hauptgebäude
  wohnhaus(hs,art,stock,r,H){                         // Häuser, die um alte Gebäude wachsen (Maßstab ×3,1, Front nach +z zur Feldmitte): Fachwerkhaus, Steinhaus oder Rundturm.
                                                      // Sauber gebaut wie fachwerkhaus(): Sockel, Geschosse mit Schwelle, Ständern, Riegel und Eckstreben, Fenster mit Kreuz und Läden,
                                                      // dünnes Satteldach mit Windbrettern und First (trauf- oder giebelständig), Fachwerk im Giebel, Kamin, manchmal Gaube, Blumenkasten, Bank.
    const FH=.032, T=.0032, wand=ton(H,r,H.pick(r,PUTZE),.04), holz=H.pick(r,BALKEN), dach=ton(H,r,H.pick(r,DAECHER),.08), laden=H.pick(r,LAEDEN);
    const STEIN=ton(H,r,H.pick(r,[P.stein,0xc8bca6,0xb4ab9a]),.05), dunkel=H.mix(dach,0x000000,.3), hell=H.mix(dach,0xffffff,.1);
    const fenster=(x,y,z,ry=0,lad=true)=>{ const an=r()<.72;                                      // Fenster mit Rahmen, Kreuz und Läden (y = Unterkante)
      const c=Math.cos(ry), s=Math.sin(ry), P2=(dx,dz)=>[x+dx*c+dz*s,z-dx*s+dz*c];
      H.box(hs,holz,.013,.015,.0015,x,y-.001,z,ry); { const [a,b]=P2(0,.0008); (an?H.gbox:H.box)(hs,an?P.fenster:0x2b2f38,.009,.011,.0015,a,y+.001,b,ry); }
      { const [a,b]=P2(0,.0016); H.box(hs,holz,.0012,.011,.001,a,y+.001,b,ry); H.box(hs,holz,.009,.0012,.001,a,y+.007,b,ry); }
      if(lad) [-1,1].forEach(sd=>{ const [a,b]=P2(sd*.0105,.0012); H.box(hs,laden,.0065,.013,.0012,a,y,b,ry); }); };
    if(art===0&&r()<.6) art=1;                                                                      // nur ab und zu ein Rundturm
    if(art===0){                                                                                    // Rundturm: Sockel, Gesims je Geschoss, Fenster, Tür, Kegeldach mit Traufring und Knauf
      const R=.031+r()*.007, h=FH*(stock+.4);
      hs.add(H.mesh(new H.THREE.CylinderGeometry(R+.004,R+.006,.008,14),P.stein3,1,1,1,0,.004,0));
      hs.add(H.mesh(new H.THREE.CylinderGeometry(R,R*1.04,h,14),STEIN,1,1,1,0,.008+h/2,0));
      for(let k=1;k<=stock;k++) hs.add(H.mesh(new H.THREE.CylinderGeometry(R+.0015,R+.0015,.002,14),H.mix(STEIN,0x000000,.15),1,1,1,0,.008+k*FH,0));
      for(let k=0;k<stock;k++){ const a=k===0?.9:(k*2.3); fenster(Math.sin(a)*(R+.0005),.008+k*FH+.012,Math.cos(a)*(R+.0005),a,false); }
      H.box(hs,ton(H,r,P.holz,.15),.011,.02,.002,0,.008,R+.0005); H.box(hs,H.mix(STEIN,0x000000,.15),.015,.003,.003,0,.029,R+.001);
      hs.add(H.mesh(new H.THREE.CylinderGeometry(R+.009,R+.009,.003,14),dunkel,1,1,1,0,.008+h+.0015,0));
      const kg=new H.THREE.Mesh(new H.THREE.ConeGeometry(R+.01,.055+r()*.015,14),H.M(dach)); kg.position.set(0,.008+h+.003+.03,0); kg.castShadow=true; hs.add(kg);
      hs.add(H.mesh(H.GEO.ico,P.gold,.003,.003,.003,0,.008+h+.003+.065,0));
      return;
    }
    const breit=art===2, w=breit?.086+r()*.014:.064+r()*.01, d=.05+r()*.008, massiv=breit&&r()<.3;
    H.box(hs,P.stein3,w+.008,.008,d+.008,0,0,0);                                                     // Sockel
    let y=.008, ww=w, dd=d;
    const nF=Math.max(2,Math.round(w/.021)), tuerI=nF>2?nF-2:nF-1;
    for(let k=0;k<stock;k++){
      if(k>0&&!massiv){ ww+=.006; dd+=.006; H.box(hs,holz,ww+.002,.004,dd+.002,0,y,0);               // Stockwerksschwelle, Obergeschoss kragt vor
        for(let i=0;i<=Math.round(ww/.012);i++) H.box(hs,holz,.003,.003,.004,-ww/2+i*ww/Math.round(ww/.012),y-.003,dd/2+.001); y+=.004; }
      const steinEG=massiv||(k===0&&stock>1&&r()<.35), wf=steinEG?STEIN:wand;
      H.box(hs,wf,ww,FH,dd,0,y,0);
      const pw=ww/nF;
      if(!steinEG){                                                                                  // Fachwerk: Schwelle, Riegel, Rähm, Ständer, Eckstreben
        [-1,1].forEach(sd=>{ const zf=sd*(dd/2+.0006);
          [y,y+FH*.42,y+FH-T].forEach(yy=>H.box(hs,holz,ww+.001,T,.0012,0,yy,zf));
          for(let i=0;i<=nF;i++) H.box(hs,holz,T,FH,.0012,-ww/2+i*pw,y,zf);
          [[0,1],[nF-1,-1]].forEach(([i,dir])=>{ const xa=-ww/2+i*pw+(dir>0?T:pw-T), xb=xa+dir*(pw-2*T), l=Math.hypot(xb-xa,FH*.42-T);
            hs.add(H.mesh(H.GEO.box,holz,l,T*.8,.0012,(xa+xb)/2,y+T+(FH*.42-2*T)/2,zf,0,0,(dir>0?1:-1)*Math.atan2(FH*.42-2*T,Math.abs(xb-xa)))); }); });
        [-1,1].forEach(sd=>{ const xf=sd*(ww/2+.0006); [y,y+FH*.42,y+FH-T].forEach(yy=>H.box(hs,holz,.0012,T,dd+.001,xf,yy,0)); [-1,0,1].forEach(q=>H.box(hs,holz,.0012,FH,T,xf,y,q*dd/2)); }); }
      else [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ for(let q=0;q<2;q++) H.box(hs,H.mix(STEIN,0x000000,.12),.007,.012,.007,a*(ww/2-.002),y+.002+q*.016,b*(dd/2-.002)); });
      for(let i=0;i<nF;i++){ if(k===0&&i===tuerI) continue; const fx=-ww/2+(i+.5)*pw;                 // Fenster vorn, je eins an den Seiten
        fenster(fx,y+FH*.45,dd/2+.0012,0,!steinEG||r()<.5);
        if(k===0&&r()<.35){ H.box(hs,holz,.014,.003,.004,fx,y+FH*.45-.004,dd/2+.003); for(let b=0;b<3;b++) hs.add(H.mesh(H.GEO.ico,H.pick(r,[0xc8402f,0xe0a030,0xd06a9a,0xf0e8d8]),.0025,.0025,.0025,fx-.004+b*.004,y+FH*.45,dd/2+.004)); } }
      [-1,1].forEach(sd=>fenster(sd*(ww/2+.0012),y+FH*.45,0,sd*Math.PI/2,false));
      y+=FH;
    }
    // Tür mit Rahmen und Trittstein
    const tx=-w/2+(tuerI+.5)*(w/nF);
    H.box(hs,holz,.015,.024,.0015,tx,.008,d/2+.0012); H.box(hs,ton(H,r,P.holz,.15),.011,.021,.0015,tx,.008,d/2+.002); H.box(hs,P.stein2,.016,.003,.006,tx,0,d/2+.004);
    // Dach: dünne Flächen mit Streifen, Windbretter, First; Giebel in Wandfarbe mit Stuhlsäule und Streben
    const traufe=breit||r()<.55, dh=.03+r()*.014;
    const dachBau=(q,L,B)=>{ const hl=Math.hypot(B/2,dh), ng=Math.atan2(dh,B/2);
      [-1,1].forEach(sd=>{ q.add(H.mesh(H.GEO.box,dach,L,.0035,hl,0,y+dh/2,sd*B/4,0,sd*ng,0));
        for(let k=1;k<=2;k++){ const u=k/3; q.add(H.mesh(H.GEO.box,k%2?dunkel:hell,L*.995,.0015,.003,0,y+dh*u+.0022,sd*B/2*(1-u),0,sd*ng,0)); }
        [-1,1].forEach(e=>q.add(H.mesh(H.GEO.box,holz,.0025,.005,hl+.002,e*(L/2+.001),y+dh/2-.001,sd*B/4,0,sd*ng,0))); });
      H.box(q,dunkel,L+.003,.004,.007,0,y+dh-.002,0); };
    const giebelW=(x,z,ry,B)=>{ giebel(H,hs,x,y,z,B,dh*.94,.0015,wand,ry); const c=Math.cos(ry), s=Math.sin(ry), o=.0011;
      hs.add(H.mesh(H.GEO.box,holz,T,dh*.85,.0012,x+s*o,y+dh*.425,z+c*o,ry));
      [-1,1].forEach(sd=>{ const ax=sd*B*.36, l=Math.hypot(B*.36,dh*.55); hs.add(H.mesh(H.GEO.box,holz,l,T*.8,.0012,x+s*o+c*ax/2,y+dh*.275,z+c*o-s*ax/2,ry,0,-sd*Math.atan2(dh*.55,B*.36))); }); };
    if(traufe){ dachBau(hs,ww+.012,dd+.018); [-1,1].forEach(sd=>giebelW(sd*(ww/2+.0005),0,sd*Math.PI/2,dd)); }
    else { const q=new H.THREE.Group(); q.rotation.y=Math.PI/2; hs.add(q); dachBau(q,dd+.012,ww+.016); [-1,1].forEach(sd=>giebelW(0,sd*(dd/2+.0005),sd>0?0:Math.PI,ww));
      fenster(0,y+dh*.25,dd/2+.0018,0,false); }
    if(traufe&&ww>.08&&stock>=1&&r()<.6){ const gx=(r()-.5)*ww*.3, gz=dd*.22, gy=y+dh*.28;            // Gaube
      H.box(hs,wand,.016,.014,.016,gx,gy,gz); giebel(H,hs,gx,gy+.014,gz,.022,.012,.02,dach,0); (r()<.7?H.gbox:H.box)(hs,r()<.7?P.fenster:0x2b2f38,.008,.008,.0015,gx,gy+.003,gz+.0085); }
    if(r()<.7){ const kx=(traufe?ww*.25:ww*.2)*(r()<.5?-1:1), kz=traufe?-dd*.18:-dd*.25;               // Kamin
      H.box(hs,STEIN,.009,dh+.014,.009,kx,y+dh*.3,kz); H.box(hs,P.stein3,.012,.003,.012,kx,y+dh*1.3+.014,kz);
      if(r()<.35) H.rauch(hs,kx,kz,.12,.5,0x8a8a8a,y+dh*1.3+.02); }
    if(r()<.4){ const bx=tx+(tx>0?-.022:.022); H.box(hs,P.holz,.018,.002,.005,bx,.012,d/2+.007); [-1,1].forEach(s=>H.box(hs,P.holz2,.0015,.005,.004,bx+s*.007,.007,d/2+.007)); }   // Bank
  }

};

// ---------- Einheiten ----------
function krieger(H,feind){                            // Räuber (feind) bzw. Fußvolk
  const g=new H.THREE.Group(), k=new H.THREE.Group(); g.add(k);
  const rock=feind?0x8a2a24:0x2f5a8a;
  k.add(H.mesh(H.GEO.box,rock,.034,.036,.026,0,.078,0)); k.add(H.mesh(H.GEO.ico,0xe0b89a,.011,.011,.011,0,.108,0));
  k.add(H.mesh(H.GEO.cone8,feind?0x3a2a22:P.eisen,.013,.014,.013,0,.122,0));
  k.add(H.mesh(H.GEO.cyl12,feind?0x5a2a20:P.tuch3,.018,.004,.018,.004,.08,.02,0,Math.PI/2));   // Schild
  k.add(H.mesh(H.GEO.box,P.eisen,.05,.004,.004,.03,.085,-.02));                              // Speer
  const beine=[-1,1].map(s=>{ const b=new H.THREE.Group(); b.position.set(0,.062,s*.008); g.add(b);
    b.add(H.mesh(H.GEO.box,0x3a3028,.01,.058,.009,0,-.03,0)); return b; });
  Object.assign(g.userData,{k,beine,muendung:new H.THREE.Vector3(.055,.085,-.02)});
  return g;
}
const einheiten={
  luftschiff(H,k){ return luftschiff(H,k); },
  laeufer:(H,feind)=>krieger(H,feind),
  armee(H){                                           // Ritter zu Pferd
    const g=new H.THREE.Group();
    g.add(H.mesh(H.GEO.box,0x6a4a30,.08,.035,.03,0,.06,0));
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>g.add(H.mesh(H.GEO.box,0x5a3a24,.01,.045,.01,a*.03,.022,b*.01)));
    g.add(H.mesh(H.GEO.box,0x6a4a30,.02,.035,.018,.045,.085,0,0,0,-.5)); g.add(H.mesh(H.GEO.box,0x2f5a8a,.07,.012,.036,0,.078,0));
    const reiter=new H.THREE.Group(); reiter.position.set(-.005,.08,0); g.add(reiter);
    reiter.add(H.mesh(H.GEO.box,0x2f5a8a,.024,.035,.02,0,.018,0)); reiter.add(H.mesh(H.GEO.ico,P.eisen,.011,.013,.011,0,.046,0));
    reiter.add(H.mesh(H.GEO.box,0xd8c8a6,.1,.004,.004,.05,.03,.012));
    Object.assign(g.userData,{turm:reiter,muendung:new H.THREE.Vector3(.1,.11,.012)});
    return g;
  },
  drohne(H){                                          // Späher-Luftschiff der Räuber: dunkle Hülle, rote Bänder, Laterne mit Suchlicht (Nase nach +x)
    const g=new H.THREE.Group(), HUELLE=0x3a2e2c, ROT=0x8a2a24;
    g.add(H.mesh(new H.THREE.SphereGeometry(1,14,8),HUELLE,.075,.026,.026,0,0,0));
    [-.035,0,.035].forEach(x=>{ const b=new H.THREE.Mesh(H.GEO.torus,H.M(ROT)); b.scale.set(.026*Math.sqrt(1-(x/.075)*(x/.075)),.026*Math.sqrt(1-(x/.075)*(x/.075)),.08); b.rotation.y=Math.PI/2; b.position.x=x; g.add(b); });
    [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{ const f=new H.THREE.Group(); f.rotation.x=a; f.position.x=-.065; g.add(f); f.add(H.mesh(H.GEO.box,ROT,.025,.022,.003,0,.022,0)); });
    H.box(g,P.balken,.04,.012,.016,.004,-.04,0); [-1,1].forEach(s=>g.add(H.mesh(H.GEO.box,P.balken,.002,.016,.002,s*.012,-.028,0)));
    H.gbox(g,0xff6a2a,.008,.008,.008,.022,-.04,0); H.halo(g,.022,-.04,0,.06,0xff5a2a,.8);
    const kegel=new H.THREE.Mesh(new H.THREE.ConeGeometry(.14,.55,16,1,true).translate(0,-.275,0),new H.THREE.MeshBasicMaterial({color:0xffa04a,transparent:true,opacity:.06,blending:H.THREE.AdditiveBlending,depthWrite:false,side:H.THREE.DoubleSide}));
    kegel.position.set(.022,-.045,0); g.add(kegel); g.userData.kegel=kegel;
    const fl=H.mesh(H.GEO.box,ROT,.02,.012,.002,-.07,.035,0); g.add(fl); g.userData.fluegel=t=>{ fl.rotation.x=Math.sin(t*4)*.3; };
    return g;
  },
  geschuetz(H){                                       // Katapult (Mangonel), wirft nach +x: Fahrgestell auf Rädern, Torsionsachse hinten unten,
                                                      // Wurfarm mit Schale und Stein liegt gespannt nach hinten, schnellt beim Wurf gegen den gepolsterten Querbalken; Winde zum Spannen
    const g=new H.THREE.Group(), f=new H.THREE.Group();                                                      // f: feste Teile, werden zu einem Mesh verschmolzen (weniger Draw-Calls)
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>f.add(H.mesh(H.GEO.cyl8,P.balken,.011,.006,.011,a*.032,.011,b*.031,0,Math.PI/2)));   // Räder
    [-1,1].forEach(b=>H.box(f,P.holz2,.094,.01,.01,0,.012,b*.024));                                           // Längsbalken
    [-1,1].forEach(a=>H.box(f,P.holz2,.01,.008,.058,a*.04,.014,0));                                           // Querbalken unten
    [-1,1].forEach(b=>{ H.box(f,P.holz2,.008,.07,.008,.006,.02,b*.024);                                      // Pfosten vorn
      f.add(H.mesh(H.GEO.box,P.holz2,.006,.074,.006,-.0155,.0535,b*.024,0,0,-.554)); });                     // Streben nach hinten
    H.box(f,P.holz,.01,.01,.058,.006,.08,0);                                                                   // Anschlag-Querbalken
    H.box(f,0x9a7a52,.005,.014,.022,.0,.078,0);                                                               // Polster (Strohsack)
    f.add(H.mesh(H.GEO.cyl8,0x6a5440,.009,.05,.009,-.014,.022,0,0,Math.PI/2));                                // Torsionsbündel (Seile)
    const arm=new H.THREE.Group(); arm.position.set(-.014,.022,0); g.add(arm);
    arm.add(H.mesh(H.GEO.box,P.holz,.007,.09,.007,0,.045,0));                                                 // Wurfarm
    arm.add(H.mesh(H.GEO.cyl8,P.holz2,.013,.007,.013,0,.091,0));                                              // Schale
    const stein=H.mesh(H.GEO.dode,P.stein3,.008,.008,.008,0,.098,0); arm.add(stein);
    const winde=new H.THREE.Group(); winde.position.set(-.034,.019,0); g.add(winde);                          // Winde mit Speichen außen
    winde.add(H.mesh(H.GEO.cyl8,P.balken,.005,.07,.005,0,0,0,0,Math.PI/2));
    [-1,1].forEach(b=>{ winde.add(H.mesh(H.GEO.box,P.holz,.024,.003,.002,0,0,b*.034)); winde.add(H.mesh(H.GEO.box,P.holz,.003,.024,.002,0,0,b*.034)); });
    [[-.062,.006,.012],[-.064,.006,-.01],[-.06,.016,0]].forEach(([x,y,z])=>f.add(H.mesh(H.GEO.dode,P.stein2,.008,.008,.008,x,y,z)));   // Steinvorrat
    f.userData.flach=true; g.add(H.bake(f,()=>.5));
    const R=1.2; arm.rotation.z=R;
    Object.assign(g.userData,{arm,stein,winde,armRuhe:R,armWurf:-.13});
    return g;
  },
  lager(H,gross,geschuetz){                           // Kriegsluftschiff der Räuber: schwebt am Inselrand, Katapulte an Deck, Seile hängen herab (Nase nach +x)
    const s=gross?1.3:1, g=new H.THREE.Group(), HUELLE=0x3e302c, ROT=0x8a2a24, SCHWARZ=0x1e1a1a;
    const huelle=new H.THREE.Group(); huelle.position.y=.34*s; g.add(huelle);
    huelle.add(H.mesh(new H.THREE.SphereGeometry(1,20,12),HUELLE,.62*s,.17*s,.2*s,0,0,0));
    for(let i=-4;i<=4;i++){ const x=i*.12*s, k=Math.sqrt(Math.max(0,1-(x/(.62*s))**2)); const b=new H.THREE.Mesh(H.GEO.torus,H.M(i%2?ROT:SCHWARZ)); b.scale.set(.2*s*k*1.01,.17*s*k*1.01,.5); b.rotation.y=Math.PI/2; b.position.x=x; huelle.add(b); }
    [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{ const f=new H.THREE.Group(); f.rotation.x=a; f.position.x=-.55*s; huelle.add(f); f.add(H.mesh(H.GEO.box,ROT,.16*s,.13*s,.006,0,.12*s,0)); });
    const schaedel=H.mesh(H.GEO.ico,0xd8d0c0,.05*s,.05*s,.05*s,.6*s,.02*s,0); huelle.add(schaedel);   // Galionsfigur
    // Deck (Gondel) mit Reling: hier stehen Katapulte und Krieger, lokale Höhe 0
    H.box(g,P.balken,.7*s,.04*s,.3*s,0,-.045*s,0); H.box(g,0x5a3a22,.72*s,.008,.32*s,0,-.006,0);
    [-1,1].forEach(z=>{ H.box(g,P.balken,.7*s,.03,.008,0,0,z*.155*s); }); H.box(g,P.balken,.008,.03,.31*s,.36*s,0,0); H.box(g,P.balken,.008,.03,.31*s,-.36*s,0,0);
    for(let i=0;i<6;i++){ const x=(-.3+i*.12)*s; [-1,1].forEach(z=>g.add(H.mesh(H.GEO.box,0x6a5a48,.003,.2*s,.003,x,.12*s,z*.13*s,0,z*.25,0))); }   // Taue zur Hülle
    for(let i=0;i<3;i++){ const x=(-.2+i*.2)*s; g.add(H.mesh(H.GEO.box,0x6a5a48,.003,.5,.003,x,-.28,(i%2?.1:-.1)*s)); }                                  // Strickleitern hinab
    for(let i=0;i<2;i++){ const p=new H.THREE.Group(); p.position.set(-.37*s,-.02,(i?.1:-.1)*s); g.add(p);                                            // Propeller am Heck
      const bl=H.mesh(H.GEO.box,P.holz,.004,.12*s,.014,0,0,0); p.add(bl); H.anim(bl,(t)=>{ bl.rotation.x=t*14; }); }
    H.box(g,P.balken,.008,.24*s,.008,.22*s,0,0);
    const fahne=new H.THREE.Group(); fahne.position.set(.22*s,.2*s,0); g.add(fahne);
    for(let i=0;i<3;i++) fahne.add(H.mesh(H.GEO.box,i%2?SCHWARZ:ROT,.004,.035,.12*s,0,.05-i*.035,.06*s));
    const leuchte=H.halo(g,.34*s,-.02,0,.18,0xff6a2a,.9);
    const gesch=[[-.15,.07],[-.15,-.07],[.08,0]].slice(0,gross?3:2).map(([x,z])=>{ const e=geschuetz(); e.position.set(x*s,0,z*s); g.add(e); return e; });
    Object.assign(g.userData,{fahne,leuchte,gesch,s,hoehe:.62,luft:true});
    return g;
  },
  kampfluftschiff(H,feind){                           // eigenes Kriegsluftschiff: helle Hülle mit blauen und goldenen Bändern, Armbrustschützen in der Gondel (Nase nach +x)
    const g=new H.THREE.Group(), HUELLE=feind?0x3e302c:0xe8e0cc, B1=feind?0x8a2a24:0x2f5a8a, B2=feind?0x1e1a1a:P.gold;
    g.add(H.mesh(new H.THREE.SphereGeometry(1,18,10),HUELLE,.15,.05,.05,0,.05,0));
    for(let i=-2;i<=2;i++){ const x=i*.05, k=Math.sqrt(Math.max(0,1-(x/.15)**2)); const b=new H.THREE.Mesh(H.GEO.torus,H.M(i%2?B1:B2)); b.scale.set(.05*k*1.01,.05*k*1.01,.4); b.rotation.y=Math.PI/2; b.position.set(x,.05,0); g.add(b); }
    [0,Math.PI/2,Math.PI,Math.PI*1.5].forEach(a=>{ const f=new H.THREE.Group(); f.rotation.x=a; f.position.set(-.13,.05,0); g.add(f); f.add(H.mesh(H.GEO.box,B1,.05,.04,.004,0,.04,0)); });
    H.box(g,P.holz2,.1,.02,.04,0,-.015,0); [-1,1].forEach(s=>g.add(H.mesh(H.GEO.box,P.balken,.002,.03,.002,s*.03,.01,0)));
    for(let i=0;i<3;i++){ g.add(H.mesh(H.GEO.box,0x2f5a8a,.01,.014,.01,-.03+i*.03,.012,(i%2?.012:-.012))); g.add(H.mesh(H.GEO.ico,0xe0b89a,.005,.005,.005,-.03+i*.03,.024,(i%2?.012:-.012))); }
    const fl=H.mesh(H.GEO.box,B1,.03,.018,.002,-.06,.1,0); g.add(fl);
    const p=new H.THREE.Group(); p.position.set(-.06,-.012,0); g.add(p); const bl=H.mesh(H.GEO.box,P.holz,.003,.05,.008,0,0,0); p.add(bl);
    H.anim(bl,(t)=>{ bl.rotation.x=t*16; fl.rotation.x=Math.sin(t*3)*.2; });
    g.userData.muendung=new H.THREE.Vector3(.05,-.01,0);
    return g;
  },
  schild(H,R){                                        // Stadtmauer rund ums Feld: wächst bei der Belagerung aus dem Boden, bröckelt Stück für Stück
    const g=new H.THREE.Group(), rr=Math.min(.9,R*1.12), segs=[], r=H.rng("mauer"+R), apo=rr*Math.cos(Math.PI/6);
    const ecke=i=>{ const a=Math.PI/6+i*Math.PI/3; return [Math.cos(a)*rr,Math.sin(a)*rr]; };
    const wand=ton(H,r,P.stein,.04), dunkel=P.stein2;
    for(let i=0;i<6;i++){
      const [x0,z0]=ecke(i), [x1,z1]=ecke(i+1), L=Math.hypot(x1-x0,z1-z0)*.84;
      const sg=new H.THREE.Group(); sg.position.set((x0+x1)/2,0,(z0+z1)/2); sg.rotation.y=-Math.atan2(z1-z0,x1-x0); g.add(sg);
      const inn=new H.THREE.Group(); sg.add(inn);
      H.box(inn,dunkel,L,.012,.05,0,0,0); H.box(inn,wand,L,.085,.036,0,.01,0);
      const zinnen=[]; for(let k=0;k<Math.round(L/.04);k++) zinnen.push(H.box(inn,wand,.02,.018,.038,-L/2+.012+k*L/Math.round(L/.04),.095,0));   // Zinnen
      for(let k=0;k<5;k++) H.box(inn,P.stein3,.03+r()*.03,.008,.002,-L/2+r()*L,.02+r()*.06,-.019);                       // Fugen
      if(i===1){ H.box(inn,0x241c18,.05,.055,.004,0,.01,-.019); H.box(inn,P.holz2,.056,.006,.006,0,.065,-.02); }            // Tor
      const schutt=new H.THREE.Group(); schutt.visible=false; sg.add(schutt);                                             // Trümmer vor der beschädigten Mauer
      for(let k=0;k<6;k++) schutt.add(H.mesh(H.GEO.box,k%2?wand:dunkel,.016+r()*.012,.01+r()*.008,.014+r()*.01,(r()-.5)*L*.7,.005+r()*.006,.03+r()*.025,r()*3,(r()-.5)*.6,(r()-.5)*.6));
      const bruch=Math.floor(r()*zinnen.length);                                                                      // Bresche: hier fehlen Zinnen und ein Stück Mauerkrone
      segs.push({sg,inn,zinnen,schutt,bruch,schwelle:.15+r()*.75,k:1});
    }
    const tuerme=[];
    for(let i=0;i<6;i++){ const [x,z]=ecke(i), tg=new H.THREE.Group(); tg.position.set(x*.98,0,z*.98); g.add(tg);
      tg.add(H.mesh(H.GEO.cyl8,wand,.045,.13,.045,0,.065,0)); tg.add(H.mesh(H.GEO.cyl8,dunkel,.052,.012,.052,0,.13,0));
      if(i%2) tg.add(H.mesh(H.GEO.cone8,P.dach,.058,.07,.058,0,.17,0));
      else for(let k=0;k<6;k++){ const a=k/6*6.283; tg.add(H.mesh(H.GEO.box,wand,.016,.016,.016,Math.cos(a)*.045,.143,Math.sin(a)*.045)); }
      if(i===0) fahne(H,tg,0,.13,0,P.tuch2,.8);
      tuerme.push({tg,schwelle:.05+r()*.3,k:1}); }
    let auf=null;
    Object.assign(g.userData,{R:apo,bleibt:false,
      setze(st,blitz,t,dt){
        if(auf===null) auf=t; const u=Math.min(1,(t-auf)*.5), ein=u*u*(3-2*u);
        // Beschädigt wird eine Mauer nicht versenkt oder gekippt, sondern bekommt eine Bresche: Zinnen fallen, die Krone sinkt etwas, Trümmer liegen davor (kein Zittern)
        segs.forEach(s=>{ const kaputt=st<s.schwelle, ziel=kaputt?.78:1; s.k+=(ziel-s.k)*Math.min(1,Math.max(dt,.05)*1.5);
          s.inn.scale.y=Math.max(.02,ein*s.k); s.inn.rotation.x=0; s.inn.position.y=0;
          s.zinnen.forEach((z,k)=>{ z.visible=!kaputt||Math.abs(k-s.bruch)>1; }); s.schutt.visible=kaputt&&ein>=1; });
        tuerme.forEach(o=>{ const ziel=st<o.schwelle?.82:1; o.k+=(ziel-o.k)*Math.min(1,Math.max(dt,.05)*1.2); o.tg.scale.y=Math.max(.02,ein*o.k); o.tg.rotation.z=0; });
      },
      treffer(A){ const W=g.getWorldPosition(new H.THREE.Vector3()), d=new H.THREE.Vector3(A.x-W.x,0,A.z-W.z).normalize();
        return new H.THREE.Vector3(W.x+d.x*apo*1.02+(Math.random()-.5)*.08,.04+Math.random()*.06,W.z+d.z*apo*1.02+(Math.random()-.5)*.08); }
    });
    return g;
  },

  bote(H,farbe){                                      // Brieftaube
    const g=new H.THREE.Group(), W=0xe8e4dc;
    g.add(H.mesh(H.GEO.ico,W,.012,.01,.02,0,0,0)); g.add(H.mesh(H.GEO.ico,W,.007,.007,.007,0,.004,.018));
    const fl=[-1,1].map(s=>{ const w=new H.THREE.Group(); w.position.x=s*.006; g.add(w); w.add(H.mesh(H.GEO.box,0xd8d2c6,.03,.002,.016,s*.015,0,0)); return w; });
    H.anim(g,(t)=>{ const a=Math.sin(t*14+g.id)*.8; fl[0].rotation.z=a; fl[1].rotation.z=-a; });
    return g;
  }
};

// ---------- Landschaft: Felder statt Solar- und Hydrokulturen ----------
// Animation relativ zur Startposition: nötig für alles, was mitsamt Feld verschoben gebacken wird (Landschaft)
const relAnim=(H,o,fn)=>H.anim(o,(t)=>{ const b=o.userData.b||(o.userData.b={x:o.position.x,y:o.position.y,z:o.position.z,ry:o.rotation.y}); fn(t,b); });
const natur={
  wiese(g,r,B,H){                                     // Weideland: Gras, Blumen, ein paar Bäume, dazu eins von: Schafweide, Brunnen, Bildstock, Heuschober; Holzlaterne
    const top=B?B.top:0x4b6a4c, gr=H.mix(top,0x7fae6a,.35), frei=[];
    const art=Math.floor(r()*5), mx=(r()-.5)*.5, mz=(r()-.5)*.5; frei.push([mx,mz,.22]);
    if(art===0){                                                                                   // Schafweide mit Zaunstück und grasenden Schafen
      zaun(H,g,[[mx-.2,mz+.18],[mx,mz+.24],[mx+.22,mz+.16]]);
      for(let i=0;i<3+Math.floor(r()*2);i++){ const s=new H.THREE.Group(), x0=mx+(r()-.5)*.3, z0=mz+(r()-.5)*.2, ry=r()*6; s.position.set(x0,0,z0); s.rotation.y=ry; g.add(s);
        s.add(H.mesh(H.GEO.ico,0xeee8dc,.032,.024,.022,0,.032,0)); const kopf=H.mesh(H.GEO.box,0x3a3430,.014,.014,.012,.03,.034,0); s.add(kopf);
        [[-.015,-.008],[.015,-.008],[-.015,.008],[.015,.008]].forEach(([a,b])=>H.box(s,0x3a3430,.005,.018,.005,a,0,b));
        const ph=r()*6, sp=.15+r()*.1; relAnim(H,s,(t,b)=>{ const u=Math.sin(t*sp+ph); s.position.x=b.x+u*.03; s.position.z=b.z+Math.cos(t*sp*.7+ph)*.02; s.rotation.y=b.ry+u*.6;
          kopf.position.y=.034-Math.max(0,Math.sin(t*.8+ph))*.014; }); } }
    else if(art===1){                                                                              // Ziehbrunnen mit Dach
      g.add(H.mesh(H.GEO.cyl12,P.stein2,.05,.04,.05,mx,.02,mz)); g.add(H.mesh(H.GEO.cyl12,0x1a2a30,.04,.002,.04,mx,.041,mz));
      [-1,1].forEach(sd=>H.box(g,P.holz2,.006,.09,.006,mx+sd*.045,.035,mz)); giebel(H,g,mx,.12,mz,.12,.04,.07,P.reet,Math.PI/2);
      g.add(H.mesh(H.GEO.cyl8,P.holz,.004,.08,.004,mx,.11,mz,0,0,Math.PI/2)); H.box(g,P.holz,.014,.014,.014,mx,.07,mz); }
    else if(art===2){                                                                              // Bildstock am Wegrand
      H.box(g,P.stein,.025,.12,.025,mx,0,mz); H.box(g,P.stein2,.04,.03,.03,mx,.12,mz); giebel(H,g,mx,.15,mz,.05,.025,.04,P.dach,0);
      H.gbox(g,0xffd27a,.012,.012,.002,mx,.128,mz+.016); H.blumen(g,mx+.03,mz+.03,r); }
    else if(art===4){                                                                              // Bienenstand: Strohkörbe auf einer Bank, Bienen schwirren
      H.box(g,P.holz2,.16,.008,.04,mx,.04,mz); [-1,1].forEach(sd=>H.box(g,P.holz2,.008,.04,.035,mx+sd*.07,0,mz)); giebel(H,g,mx,.11,mz,.07,.03,.18,P.reet,Math.PI/2);
      [-1,1].forEach(sd=>H.box(g,P.holz2,.006,.07,.006,mx+sd*.08,.04,mz-.018));
      for(let i=0;i<3;i++){ const x=mx-.05+i*.05; g.add(H.mesh(H.GEO.dome20,0xd2b060,.022,.04,.022,x,.048,mz)); g.add(H.mesh(H.GEO.box,0x3a2a1c,.008,.006,.002,x,.054,mz+.021)); }
      for(let i=0;i<5;i++){ const b=H.mesh(H.GEO.box,0x2a2418,.003,.003,.003,mx,.07,mz+.05); g.add(b); const ph=i*1.3;
        relAnim(H,b,(t,bb)=>{ b.position.x=bb.x+Math.sin(t*1.7+ph)*.08; b.position.z=bb.z+Math.cos(t*1.3+ph*.7)*.05; b.position.y=bb.y+Math.sin(t*3+ph)*.02; }); }
      H.streu(r,6,.4,[],.04).forEach(p=>H.blumen(g,mx+p[0]*.4,mz+.12+p[1]*.2,r)); }
    else { [[0,0],[.08,.04],[-.06,.07]].forEach(([a,b],i)=>g.add(H.mesh(H.GEO.cone8,0xcaa95a,.04-i*.006,.07-i*.01,.04-i*.006,mx+a,.035-i*.005,mz+b))); heu(H,g,mx+.1,mz-.06); heu(H,g,mx-.08,mz-.05); }
    H.streu(r,26,.82,frei,.06).forEach(p=>H.gras(g,p[0],p[1],1,r,gr));
    H.streu(r,8,.78,frei,.1).forEach(p=>H.blumen(g,p[0],p[1],r));
    if(r()<.5){ const a0=r()*6.283, x0=Math.cos(a0)*.55, z0=Math.sin(a0)*.55; for(let i=0;i<9;i++){ const u=(i-4)*.035; g.add(H.mesh(H.GEO.dode,H.pick(r,[0x9d9384,0x8a8274,0xb0a898]),.016,.014,.014,x0-Math.sin(a0)*u+(r()-.5)*.006,.01,z0+Math.cos(a0)*u,r()*3)); } }   // Lesesteinmauer
    H.streu(r,1+Math.floor(r()*3),.72,frei,.2).forEach(p=>H.baum(g,p[0],p[1],.8+r()*.4,r,"laub"));
    H.streu(r,2,.75,frei,.15).forEach(p=>H.busch(g,p[0],p[1],1,r,0x467552));
    if(r()<.3){ const p=H.streu(r,1,.7,frei)[0]; if(p){ H.box(g,P.holz2,.008,.16,.008,p[0],0,p[1]); H.box(g,P.holz2,.03,.006,.006,p[0]+.012,.15,p[1]);   // Holzlaterne
      H.gbox(g,0xffc870,.014,.018,.014,p[0]+.026,.125,p[1]); H.halo(g,p[0]+.026,.135,p[1],.12,0xffc870,.4); } }
  },
  wald(g,r,B,H){                                      // Forst: dichter Mischwald, Farn, Pilze, Stümpfe; dazu eins von: Holzfällerlichtung (Axt schlägt), Hochsitz mit äsendem Reh, Waldweg mit Wegkreuz
    const top=B?B.top:0x4b6a4c, frei=[], art=Math.floor(r()*3), mx=(r()-.5)*.3, mz=(r()-.5)*.3; frei.push([mx,mz,art===2?.14:.27]);
    for(let i=0;i<5;i++){ const a=r()*6.283, d=r()*.6; g.add(H.mesh(H.GEO.cyl12,H.mix(top,0x1c2e24,.18+r()*.1),.12+r()*.1,.002,.1+r()*.08,Math.cos(a)*d,.001+i*.0008,Math.sin(a)*d,r()*3)); }   // dunkler Waldboden: jede Fläche eine eigene Höhe, sonst flackern Überlappungen
    if(art===0){                                                                                   // Holzfällerlichtung
      for(let i=0;i<6;i++) g.add(H.mesh(H.GEO.cyl8,H.mix(0x7a5a3a,0x5a4028,r()),.016,.12,.016,mx-.06,.016+(i<3?0:.03),mz-.06+(i<3?i*.033:(i-3)*.033+.016),0,0,Math.PI/2));   // Stammholz
      g.add(H.mesh(H.GEO.cyl8,0x6a4a30,.024,.03,.024,mx+.06,.015,mz+.02)); g.add(H.mesh(H.GEO.cyl8,0xc8a878,.022,.002,.022,mx+.06,.031,mz+.02));                     // Hackklotz
      const hf=new H.THREE.Group(); hf.position.set(mx+.1,0,mz+.02); hf.rotation.y=Math.PI; g.add(hf);
      hf.add(H.mesh(H.GEO.box,0x2a2018,.014,.03,.01,0,.015,0)); hf.add(H.mesh(H.GEO.box,H.pick(r,[0x5a6a3a,0x6a4a3a]),.02,.03,.014,0,.045,0)); hf.add(H.mesh(H.GEO.ico,0xe0b89a,.009,.009,.009,0,.07,0));
      const axt=new H.THREE.Group(); axt.position.set(mx+.086,.07,mz+.02); g.add(axt); axt.add(H.mesh(H.GEO.box,0x7a5a3a,.04,.004,.004,-.02,0,0)); axt.add(H.mesh(H.GEO.box,P.eisen,.008,.014,.003,-.04,0,0));
      H.anim(axt,(t)=>{ const u=(t*1.1)%1, f=u<.7?Math.sin(u/.7*Math.PI/2):1-((u-.7)/.3)**2; axt.rotation.z=.75-1.6*f; });
      for(let i=0;i<8;i++) g.add(H.mesh(H.GEO.box,0xd8b888,.006,.002,.004,mx+.05+(r()-.5)*.08,.003,mz+.02+(r()-.5)*.08,r()*3));   // Späne
      [[-.2,.12],[.18,-.16],[.22,.2]].forEach(([a,b])=>{ g.add(H.mesh(H.GEO.cyl8,0x6a4a30,.02,.025,.02,mx+a,.012,mz+b)); g.add(H.mesh(H.GEO.cyl8,0xc8a878,.018,.002,.018,mx+a,.026,mz+b)); }); }
    else if(art===1){                                                                              // Hochsitz am Waldrand, Reh äst
      const hx=mx-.05, hz=mz-.04; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>H.box(g,0x5e4029,.008,.17,.008,hx+a*.03,0,hz+b*.03));
      H.box(g,0x7c5738,.08,.008,.08,hx,.13,hz); [-1,1].forEach(s=>{ H.box(g,0x7c5738,.08,.03,.004,hx,.138,hz+s*.04); H.box(g,0x7c5738,.004,.03,.08,hx+s*.04,.138,hz); });
      giebel(H,g,hx,.19,hz,.1,.04,.1,0x5a4a3a,0); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>H.box(g,0x5e4029,.005,.05,.005,hx+a*.036,.14,hz+b*.036));
      for(let i=0;i<7;i++) H.box(g,0x7c5738,.03,.004,.008,hx+.07,.018*i,hz+.05-.0*i);                                          // Leiter
      [-1,1].forEach(s=>g.add(H.mesh(H.GEO.box,0x5e4029,.004,.14,.004,hx+.07+s*.014,.065,hz+.05,0,0,-.0)));
      const reh=new H.THREE.Group(); reh.position.set(mx+.12,0,mz+.08); reh.rotation.y=r()*6; g.add(reh); const RF=0x9a6a3a;
      reh.add(H.mesh(H.GEO.ico,RF,.03,.018,.014,0,.045,0)); [[-.02,-.007],[.02,-.007],[-.02,.007],[.02,.007]].forEach(([a,b])=>H.box(reh,RF,.004,.035,.004,a,0,b));
      reh.add(H.mesh(H.GEO.box,RF,.008,.03,.008,.024,.06,0,0,0,-.5)); const kopf=H.mesh(H.GEO.box,RF,.018,.01,.009,.034,.074,0,0,0,-.3); reh.add(kopf); reh.add(H.mesh(H.GEO.box,0xf0e8d8,.006,.008,.01,-.03,.05,0));
      relAnim(H,kopf,(t,b)=>{ const s=Math.max(0,Math.sin(t*.6)); kopf.position.y=b.y-s*.03; kopf.position.x=b.x+s*.008; }); }
    else {                                                                                         // Waldweg mit Wegkreuz und Pilzen
      const pk=[...Array(10)].map((_,i)=>{ const u=i/9-.5; return [mx+u*.95,mz+Math.sin(u*3)*.12]; });
      pk.forEach(([x,z])=>frei.push([x,z,.09]));
      for(let i=0;i<9;i++){ const [x1,z1]=pk[i], [x2,z2]=pk[i+1], l=Math.hypot(x2-x1,z2-z1); g.add(H.mesh(H.GEO.box,0x8a7a5a,l+.03,.003,.05,(x1+x2)/2,.0055,(z1+z2)/2,-Math.atan2(z2-z1,x2-x1))); }   // Weg liegt über dem Waldboden (oben .007)
      H.box(g,0x5e4029,.01,.12,.01,mx+.06,0,mz+.08); H.box(g,0x5e4029,.05,.01,.01,mx+.06,.085,mz+.08); giebel(H,g,mx+.06,.12,mz+.08,.04,.02,.02,0x5a4a3a,0);
      for(let i=0;i<5;i++){ const x=mx+(r()-.5)*.3, z=mz+.15+(r()-.5)*.1; g.add(H.mesh(H.GEO.cyl8,0xe8e0d0,.003,.012,.003,x,.006,z)); g.add(H.mesh(H.GEO.dome20,i%2?0xc8302a:0xb08a5a,.009,.007,.009,x,.012,z)); } }
    H.streu(r,12+Math.floor(r()*4),.8,frei,.14).forEach(p=>H.baum(g,p[0],p[1],.75+r()*.55,r,r()<.55?"nadel":"laub"));
    H.streu(r,7,.78,frei,.08).forEach(p=>{ for(let k=0;k<4;k++) g.add(H.mesh(H.GEO.box,H.mix(0x4a7a3e,0x2e5a2e,r()),.003,.004,.03,p[0]+(r()-.5)*.02,.012,p[1]+(r()-.5)*.02,k*.8,.6,0)); });   // Farn
    H.streu(r,5,.78,frei,.1).forEach(p=>H.busch(g,p[0],p[1],.9,r,0x3d6a4c));
    for(let i=0;i<4;i++){ const x=(r()-.5)*1.1, z=(r()-.5)*1.1; if(Math.hypot(x,z)<.7){ g.add(H.mesh(H.GEO.cyl8,0xe8e0d0,.002,.008,.002,x,.004,z)); g.add(H.mesh(H.GEO.dome20,0xc8302a,.006,.005,.006,x,.008,z)); } }   // Fliegenpilze
    if(r()<.5){ const p=H.streu(r,1,.6,frei)[0]; if(p) H.stamm(g,p[0],p[1],r); }
  },
  schneewald(g,r,B,H){                                // Nordmark: dunkle Tannen mit Schneehauben (heben sich vom Schnee ab), verschneite Felsen, Spuren;
                                                      // dazu eins von: Blockhütte mit rauchendem Kamin, zugefrorener Weiher, Holzschlitten mit Brennholz
    const frei=[], art=Math.floor(r()*3), mx=(r()-.5)*.36, mz=(r()-.5)*.36; frei.push([mx,mz,.22]);
    const SCHNEE=0xf2f5f8, TANNE=[0x2a4436,0x2e4a3a,0x324e3c], STAMM=0x4a3a2c;
    const tanne=(x,z,s)=>{ g.add(H.mesh(H.GEO.cyl8,STAMM,.008*s,.04*s,.008*s,x,.02*s,z));
      for(let k=0;k<3;k++){ const w=(.06-k*.015)*s, h=(.07-k*.012)*s, y=(.035+k*.04)*s, c=H.pick(r,TANNE);
        g.add(H.mesh(H.GEO.cone8,c,w,h,w,x,y+h/2,z,r()*3)); g.add(H.mesh(H.GEO.cone8,SCHNEE,w*.62,h*.4,w*.62,x,y+h*.78,z,r()*3)); } };
    if(art===0){                                                                                   // Blockhütte
      const hk=new H.THREE.Group(); hk.position.set(mx,0,mz); hk.rotation.y=r()*6; g.add(hk);
      for(let i=0;i<6;i++){ [-1,1].forEach(s=>{ hk.add(H.mesh(H.GEO.cyl8,0x6a4a30,.008,.15,.008,0,.008+i*.014,s*.045,0,0,Math.PI/2)); hk.add(H.mesh(H.GEO.cyl8,0x5e4029,.008,.1,.008,s*.068,.008+i*.014,0,0,Math.PI/2,0)); }); }
      hk.add(H.mesh(H.GEO.box,0x3a2a1c,.03,.05,.004,.0,.03,.05)); H.gbox(hk,0xffc870,.016,.014,.003,.045,.05,.05);
      giebel(H,hk,0,.088,0,.13,.06,.17,0x5a4a3a,Math.PI/2); giebel(H,hk,0,.096,0,.13,.055,.172,SCHNEE,Math.PI/2);
      H.box(hk,0x7c7468,.016,.07,.016,-.05,.08,-.02); H.rauch(hk,-.05,-.02,.2,.5,0x9a9a9a,.16);
      for(let i=0;i<3;i++) hk.add(H.mesh(H.GEO.cyl8,0x7a5a3a,.012,.07,.012,.09,.012+(i===2?.02:0),-.03+(i%2)*.025,0,Math.PI/2,0)); }
    else if(art===1){                                                                              // zugefrorener Weiher mit Schilf und Eisloch
      g.add(H.mesh(H.GEO.cyl20,0xbfd8e6,.2,.004,.15,mx,.003,mz)); g.add(H.mesh(H.GEO.cyl20,0xd8e8f0,.12,.0045,.08,mx-.04,.003,mz+.02));
      g.add(H.mesh(H.GEO.cyl12,0x2a4a5a,.022,.005,.022,mx+.08,.003,mz-.03));
      for(let i=0;i<10;i++){ const a=r()*6.283; g.add(H.mesh(H.GEO.box,0xb8a070,.002,.04+r()*.02,.002,mx+Math.cos(a)*.21,.02,mz+Math.sin(a)*.16)); }
      const fi=new H.THREE.Group(); fi.position.set(mx+.1,0,mz-.05); g.add(fi); fi.add(H.mesh(H.GEO.box,0x5a4a6a,.02,.03,.014,0,.015,0)); fi.add(H.mesh(H.GEO.ico,0xe0b89a,.009,.009,.009,0,.04,0)); fi.add(H.mesh(H.GEO.cone8,0x8a2a24,.01,.014,.01,0,.052,0));
      H.box(g,0x7c5738,.003,.003,.05,mx+.09,.035,mz-.035,0,.5,0); }
    else {                                                                                         // Holzschlitten mit Brennholz, Spur
      const sl=new H.THREE.Group(); sl.position.set(mx,0,mz); sl.rotation.y=r()*6; g.add(sl);
      [-1,1].forEach(s=>{ H.box(sl,0x5e4029,.12,.004,.004,0,.004,s*.025); sl.add(H.mesh(H.GEO.box,0x5e4029,.02,.004,.004,.066,.012,s*.025,0,0,.8)); });
      H.box(sl,0x7c5738,.1,.006,.06,0,.016,0); for(let i=0;i<5;i++) sl.add(H.mesh(H.GEO.cyl8,0x7a5a3a,.01,.09,.01,0,.03+(i>2?.018:0),-.02+(i%3)*.02+(i>2?.01:0),0,0,Math.PI/2));
      H.box(sl,0x5e4029,.004,.004,.08,-.09,.03,0); for(let i=0;i<10;i++) g.add(H.mesh(H.GEO.box,0xd8e0e8,.02,.002,.006,mx-.1-i*.05,.002,mz+(i%2?.025:-.025)*.9)); }
    H.streu(r,12+Math.floor(r()*4),.8,frei,.14).forEach(p=>tanne(p[0],p[1],1+r()*.6));
    H.streu(r,4,.75,frei,.12).forEach(p=>{ g.add(H.mesh(H.GEO.dode,0x6a6e74,.04+r()*.03,.03,.04,p[0],.01,p[1],r()*3)); g.add(H.mesh(H.GEO.dode,SCHNEE,.036,.014,.036,p[0],.032,p[1],r()*3)); });
    for(let i=0;i<14;i++){ const a=r()*6.283, d=.2+r()*.55; g.add(H.mesh(H.GEO.cyl8,0xd0dae4,.006,.002,.004,Math.cos(a)*d,.002,Math.sin(a)*d)); }   // Tierspuren
  },
  fels(g,r,B,H){                                      // Bergland: Felsnase aus kantigen Blöcken, Geröll, Kiefern, dazu Steinbruch oder Gipfelkreuz, Ziegen
    const top=B?B.top:0x585d63, fr=[];
    const fx=(r()-.5)*.4, fz=(r()-.5)*.4; fr.push([fx,fz,.25]);
    for(let i=0;i<5;i++){ const a=r()*6.283, d=r()*.1, s=.06+r()*.05; g.add(H.mesh(H.GEO.box,H.pick(r,[0x7a7f86,0x6b717a,0x8a8e92]),s*1.4,s*(1+r()),s,fx+Math.cos(a)*d,s*.5,fz+Math.sin(a)*d,r()*3,(r()-.5)*.3,(r()-.5)*.3)); }
    g.add(H.mesh(H.GEO.box,0x4d6b4a,.1,.008,.07,fx-.02,.1,fz+.02,r()*3));                       // Moos auf dem Fels
    if(r()<.5){ const qx=-fx*.8, qz=-fz*.8-.05; fr.push([qx,qz,.2]);                               // kleiner Steinbruch: Abbruchkante, behauene Blöcke, Hacke
      for(let k=0;k<3;k++) H.box(g,0x9a9a96,.18-k*.04,.05,.04,qx,k*.05,qz-.05-k*.03);
      for(let i=0;i<4;i++) H.box(g,ton(H,r,P.stein,.05),.04,.025,.03,qx-.06+i*.045,0,qz+.06,(r()-.5)*.4);
      g.add(H.mesh(H.GEO.box,P.holz2,.004,.06,.004,qx+.1,.02,qz+.06,0,0,.8)); }
    else { H.box(g,P.holz2,.008,.11,.008,fx,.14,fz); H.box(g,P.holz2,.05,.008,.008,fx,.22,fz); }      // Gipfelkreuz
    for(let i=0;i<14;i++) g.add(H.mesh(H.GEO.dode,H.pick(r,[0x7a7f86,0x5d636b]),.012,.009,.012,(r()-.5)*1.2,.005,(r()-.5)*1.2,r()*3));
    H.streu(r,3,.72,fr,.2).forEach(p=>H.fels(g,p[0],p[1],1+r()*.8,r,H.pick(r,[0x6b717a,0x4d535b]),r()<.6?0x4d6b4a:0));
    H.streu(r,3,.75,fr,.2).forEach(p=>H.baum(g,p[0],p[1],.85+r()*.3,r,"nadel"));
    H.streu(r,8,.8,fr,.07).forEach(p=>H.gras(g,p[0],p[1],.9,r,0x6a7a5a));
    for(let i=0;i<1+Math.floor(r()*2);i++){ const z=new H.THREE.Group(), x0=fx+(r()-.5)*.3, z0=fz+.15+r()*.1; z.position.set(x0,0,z0); g.add(z);   // Ziegen
      z.add(H.mesh(H.GEO.box,0xd8ccb4,.04,.022,.018,0,.03,0)); const k=H.mesh(H.GEO.box,0xb8aa90,.014,.016,.012,.025,.045,0); z.add(k); H.box(z,0x6a5a48,.004,.008,.004,.03,.053,0);
      [[-.014,-.006],[.014,-.006],[-.014,.006],[.014,.006]].forEach(([a,b])=>H.box(z,0x6a5a48,.005,.02,.005,a,0,b));
      const ph=r()*6; z.rotation.y=r()*6; relAnim(H,z,(t,b)=>{ z.rotation.y=b.ry+Math.sin(t*.2+ph)*.8; k.position.y=.045-Math.max(0,Math.sin(t*.6+ph))*.016; }); }
  },
  glut(g,r,B,H){                                      // Aschenland: Köhlerei mit rauchendem Meiler, verkohlte Bäume, glimmende Risse im Boden
    const fr=[], mx=(r()-.5)*.4, mz=(r()-.5)*.4; fr.push([mx,mz,.26]);
    g.add(H.mesh(H.GEO.dome20,0x3a2e28,.13,.09,.13,mx,0,mz)); g.add(H.mesh(H.GEO.dome20,0x2a2220,.14,.03,.14,mx,0,mz));    // Meiler mit Erdmantel
    for(let i=0;i<5;i++){ const a=i/5*6.283; const q=H.mesh(H.GEO.box,0xff7a2a,.012,.006,.004,mx+Math.cos(a)*.115,.02,mz+Math.sin(a)*.115,-a); H.leucht(q); g.add(q); }
    H.rauch(g,mx,mz,.6,1.1,0x5a524c,.09);
    for(let i=0;i<6;i++) g.add(H.mesh(H.GEO.cyl8,ton(H,r,P.holz,.1),.011,.16,.011,mx+.18,.011+Math.floor(i/3)*.02,mz-.04+(i%3)*.022+Math.floor(i/3)*.011,0,Math.PI/2,0));   // Holzstoß
    const hx=mx-.17, hz=mz+.1; for(let i=0;i<6;i++){ const a=i/6*6.283; g.add(H.mesh(H.GEO.box,P.holz2,.005,.13,.005,hx+Math.cos(a)*.025,.055,hz+Math.sin(a)*.025,0,Math.sin(a)*.3,-Math.cos(a)*.3)); }   // Köhlerhütte (Stangenzelt)
    g.add(H.mesh(H.GEO.cone8,0x4a3c30,.045,.1,.045,hx,.05,hz)); figur(H,g,mx+.05,mz+.16,0x4a4038,2.6);
    for(let i=0;i<3;i++){ let x=(r()-.5)*1, z=(r()-.5)*1, a=r()*6.283; if(Math.hypot(x-mx,z-mz)<.25) continue;   // glimmende Risse
      for(let k=0;k<4;k++){ const l=.04+r()*.04, nx=x+Math.cos(a)*l, nz=z+Math.sin(a)*l; const q=H.mesh(H.GEO.box,0xff6a20,l,.003,.006,(x+nx)/2,.004,(z+nz)/2,-a); H.leucht(q); g.add(q); x=nx; z=nz; a+=(r()-.5)*1.2; } }
    H.streu(r,3,.75,fr,.2).forEach(p=>{ const s=.8+r()*.4; g.add(H.mesh(H.GEO.cyl5,0x1e1a18,.01*s,.2*s,.01*s,p[0],.1*s,p[1]));   // verkohlte Bäume
      for(let k=0;k<2;k++) g.add(H.mesh(H.GEO.box,0x1e1a18,.004,.06*s,.004,p[0]+(k?.012:-.012),.14*s+k*.03,p[1],r()*3,0,(k?-.7:.7))); });
    H.streu(r,3,.72,fr,.2).forEach(p=>H.fels(g,p[0],p[1],1+r()*.8,r,H.pick(r,[0x3e3836,0x2e2a28]),0));
    for(let i=0;i<10;i++) g.add(H.mesh(H.GEO.dode,0x2e2a28,.012,.009,.012,(r()-.5)*1.2,.005,(r()-.5)*1.2,r()*3));
  },
  duene(g,r,B,H){                                     // Küste: weiche, langgezogene Dünen mit Strandhafer, Treibholz, Sandfangzaun, Muscheln
    const SAND=0xc8b48a, fr=[];
    const nD=4+Math.floor(r()*2), wind=r()*.6-.3;
    for(let i=0;i<nD;i++){ const x=(r()-.5)*.8, z=(r()-.5)*.8, ry=wind+(r()-.5)*.35; fr.push([x,z,.1]);
      const L=.14+r()*.14, Hh=.035+r()*.045, c=H.mix(B?B.top:0x7a6e58,SAND,.5+r()*.2), ca=Math.cos(ry), sa=Math.sin(ry);
      g.add(H.mesh(H.GEO.dome20,c,L,Hh,L*.45,x,0,z,ry));                                           // Dünenkamm: flache Luvseite, steilere Leeseite
      g.add(H.mesh(H.GEO.dome20,H.mix(c,0xffffff,.06),L*.7,Hh*.8,L*.35,x+sa*.03,0,z+ca*.03,ry));
      g.add(H.mesh(H.GEO.dome20,H.mix(c,0x000000,.06),L*.5,Hh*.6,L*.3,x-sa*.05+ca*L*.4,0,z-ca*.05-sa*L*.4,ry+.3));
      for(let k=0;k<3;k++) g.add(H.mesh(H.GEO.box,H.mix(c,0x6a5a40,.25),L*.6,.002,.004,x-sa*(k*.04+.06),.004,z-ca*(k*.04+.06),ry));   // Rippel
      for(let k=0;k<4;k++){ const a=r()*6.283, d=r()*L*.6; H.gras(g,x+Math.cos(a)*d,z+Math.sin(a)*d*.4,1.2,r,0xa9a26a); } }
    const zx=(r()-.5)*.6, zz=(r()-.5)*.3+.3; for(let i=0;i<9;i++) H.box(g,P.holz2,.004,.04+r()*.02,.004,zx-.16+i*.04,0,zz+(i%2)*.006);   // Sandfangzaun
    g.add(H.mesh(H.GEO.box,P.holz2,.32,.003,.003,zx,.03,zz));
    for(let i=0;i<2;i++){ const p=H.streu(r,1,.7,fr)[0]; if(p) g.add(H.mesh(H.GEO.cyl8,0x9a9288,.012,.18+r()*.1,.012,p[0],.012,p[1],r()*3,0,Math.PI/2)); }   // Treibholz
    for(let i=0;i<8;i++) g.add(H.mesh(H.GEO.ico,H.pick(r,[0xf0e8dc,0xe8c8b8,0xd8d0c0]),.006,.003,.006,(r()-.5)*1.1,.003,(r()-.5)*1.1));     // Muscheln
    H.streu(r,1,.7,fr,.2).forEach(p=>H.baum(g,p[0],p[1],.75,r,"nadel"));
    H.streu(r,8,.8,fr,.07).forEach(p=>H.gras(g,p[0],p[1],1.1,r,0x9c9a62));
  },
  feld(g,r,B,H){
    const ry=r()*.6-.3; acker(H,g,-.22,-.2,.4,.34,ry,r); acker(H,g,.24,.08,.34,.3,ry+.1,r); acker(H,g,-.05,.36,.46,.2,ry,r);
    for(let i=0;i<3;i++) heu(H,g,(r()-.5)*.7,(r()-.5)*.7);
    const v=new H.THREE.Group(); v.position.set(.05,0,-.05); g.add(v);                          // Vogelscheuche
    H.box(v,P.holz2,.006,.12,.006,0,0,0); v.add(H.mesh(H.GEO.box,P.holz2,.07,.005,.005,0,.09,0)); v.add(H.mesh(H.GEO.ico,0xcaa95a,.012,.012,.012,0,.125,0));
    zaun(H,g,[[-.6,.5],[-.2,.62],[.2,.62],[.6,.45]]);
    for(let i=0;i<10;i++){ const a=i/10*6.283+r()*.3; H.gras(g,Math.cos(a)*.74,Math.sin(a)*.74,1,r,H.mix(B?B.top:0x4b6a4c,0x7fae6a,.35)); }
  }
};

window.THEMA={
  name:"Mittelalter",
  landschaft:{ kristalle:false },              // keine leuchtenden Kristalle in der eingebauten Landschaft (Wald)
  kampf:{ ohneFussvolk:true },                 // keine Fußsoldaten: Katapulte rollen heran und beschießen die Mauer
  ui:{ "--bg":"#15110d", "--glass":"rgba(30,23,16,.88)", "--glass2":"rgba(255,235,200,.04)", "--ink":"#f2e8d6", "--ink2":"#d2c3a8", "--muted":"#9c8c74",
       "--line":"rgba(255,235,200,.1)", "--cyan":"#e8b85a", "--amber":"#e8903a", "--green":"#a6d46a", "--red":"#e8604a",
       "--head":"'Cinzel','Space Grotesk',serif",
       hintergrund:"radial-gradient(ellipse at 36% 42%,#2b2419 0%,#1a150f 45%,#0b0906 100%)" },
  schrift:"https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&display=swap",
  szene:{ nebel:0x1a150f, gitter:[0x4a3b28,0x2a2218], hemi:[0xffe6c0,0x2a2018,.6], sonne:[0xffe2b4,1.4], gegenlicht:[0xa8c0ff,.25] },
  farben:{ hull:0xcfc6b4, hull2:0xa89f8c, metal:0x6b5d4f, dark:0x3a2e26, glass:0x2f3a44, plate:0x5a4e42, cyan:0xffc864, schild:0xffd27a },
  biome:{ wiese:{name:"Weideland"}, wald:{name:"Forst"}, steppe:{name:"Äcker"}, fels:{name:"Bergland"}, sand:{name:"Küste"}, schnee:{name:"Nordmark"}, vulkan:{name:"Aschenland"} },
  // Gesperrt, bis ihr Gebäude fertig überarbeitet ist (Prinzip: nur Fertiges ausrollen). Felder dieser Arten stehen als Haus.
  gesperrteTypen:["api","performance","handoff"], ersatzName:"Haus",
  typen:{
    feature:{gebaeude:"Gehöft",sinn:"Etwas Neues wurde angesiedelt."}, bugfix:{gebaeude:"Schmiede",sinn:"Etwas Zerbrochenes wurde neu geschmiedet."},
    refactor:{gebaeude:"Windmühle",sinn:"Neu gemahlen, gleiches Mehl: umgebaut bei gleichem Verhalten."}, test:{gebaeude:"Wachturm",sinn:"Hält Wache gegen Rückfälle."},
    infra:{gebaeude:"Zeppelinplatz",sinn:"Versorgt das Land: Vorbereitung und Werkzeuge, auf denen der Rest aufbaut. Luftschiffe fliegen zwischen allen Zeppelinplätzen hin und her, auch zu anderen Inseln."},
    doku:{gebaeude:"Skriptorium",sinn:"Wissen wurde niedergeschrieben."}, performance:{gebaeude:"Wassermühle",sinn:"Mehr Kraft aus gleichem Wasser."},
    analyse:{gebaeude:"Sternwarte",sinn:"Etwas wurde beobachtet und vermessen, noch nichts gebaut."}, probe:{gebaeude:"Alchemistenturm",sinn:"Ein Versuch, ein Prototyp, ein Probelauf."},
    typing:{gebaeude:"Steinmetzhütte",sinn:"Jedes Teil bekommt seine genaue Form."}, pipeline:{gebaeude:"Kornspeicher",sinn:"Rohes wird gesammelt, verarbeitet, gelagert."},
    handoff:{gebaeude:"Anlegestelle",sinn:"Eine versiegelte Lieferung wird übergeben."}, api:{gebaeude:"Stadttor",sinn:"Ein Tor nach außen: Absprache mit anderen."}
  },
  status:{ geplant:{name:"Bauplan",farbe:"#d9c08a",hex:0xb89a5e} },
  texte:{ leg_fertig:"Fertiges Gebäude, grüner Rand. Welches Gebäude, zeigt die Art der Aufgabe.",
    leg_baustelle:"Baustelle mit Gerüst und Tretradkran. Die Mauern wachsen mit der Zeit bis zur Frist, ab drei Vierteln kommt der Dachstuhl.",
    leg_geplant:"Bauplatz am Inselrand: Material liegt bereit, der Rohbau ist abgesteckt. Noch nicht begonnen.",
    leg_verworfen:"Aufgegeben: Der halbe Bau bleibt stehen und wächst mit den Tagen zu. Wird nicht angegriffen, lässt sich verschieben.",
    leg_ruine0:"Glimmt und raucht. Weitergebaut wird ab dem nächsten Morgen am Inselrand.", leg_ruine2:"Erstes Grün zwischen den verkohlten Balken.",
    leg_ruine4:"Fast wieder Wiese. Das Sühnekreuz bleibt.", leg_meilenstein_name:"Meilenstein · Burg", leg_meilenstein:"Hauptziel der großen Welle. Gehalten: goldene Banner.",
    leg_landschaft:"Wiesen, Wälder, Äcker, Teiche, Felsen",
    // Phasennamen kommen aus der Projektsprache des Kerns (Frist naht, Endspurt, Heute fällig, Überfällig, Abgabe)
    armee:"Ritter", grossbau:"Kathedrale", abschnitt:"Bauabschnitt", abschnitte:"Bauabschnitte",
  },
  schuss:{ feind:0xffa060, geschuetz:0xff7a2a, eigen:0xfff0c8, treffer_feind:0xff8a4a, treffer_eigen:0xfff4d0, bogen:.08, laenge:.09 },
  bau, einheiten, natur
};
})();
