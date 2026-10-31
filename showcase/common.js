window.__modOK = true;
// AI Vision Showcase · pembantu kamera dikongsi (ES module)
export const $ = s => document.querySelector(s);
export const masa = () => new Date().toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// Kamera: mula, tukar depan/belakang, berhenti. Fail video/gambar juga boleh dijadikan sumber.
export function kamera({ video, pentas, onReady, onStatus }) {
  let stream = null, hadap = "user";
  async function mula() {
    henti();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { onStatus && onStatus("Pelayar ini tidak menyokong kamera. Cuba Chrome atau Edge terkini."); return false; }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: hadap, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    } catch (e) {
      const msg = (e && e.name === "NotAllowedError" ? "Akses kamera ditolak. Benarkan kamera pada ikon kunci di bar alamat, kemudian cuba lagi." : "Kamera tidak dapat dibuka: " + (e && (e.name + " – " + e.message) || e)); onStatus && onStatus(msg); const t = document.querySelector("#tunggu p"); if (t) t.textContent = msg;
      return false;
    }
    video.srcObject = stream; video.muted = true; video.playsInline = true; await video.play().catch(() => {});
    pentas.classList.toggle("cermin", hadap === "user");
    onReady && onReady("kamera"); return true;
  }
  function henti() { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; video.srcObject = null; }
  async function tukar() { hadap = hadap === "user" ? "environment" : "user"; return mula(); }
  function fail(f) {   // video daripada fail (untuk demo tanpa subjek sebenar)
    henti(); pentas.classList.remove("cermin");
    video.src = URL.createObjectURL(f); video.loop = true; video.muted = true; video.play().catch(() => {});
    onReady && onReady("fail");
  }
  return { mula, henti, tukar, fail, get aktif() { return !!stream || !!video.src; } };
}

// Saiz kanvas ikut sumber video
export function padanKanvas(canvas, video) {
  const w = video.videoWidth, h = video.videoHeight;
  if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; }
}

// Bunyi amaran ringkas (selepas pengguna menekan butang)
let ac = null;
export function bip(f = 880, ms = 160, vol = .25) {
  try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = f; g.gain.value = vol; o.connect(g); g.connect(ac.destination); o.start(); g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + ms / 1000); o.stop(ac.currentTime + ms / 1000 + .02); } catch (e) {}
}
export function cakap(teks, bahasa = "ms-MY") {
  try { const u = new SpeechSynthesisUtterance(teks); u.lang = bahasa; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {}
}
export function status(el, teks, jenis) { el.className = "pil" + (jenis ? " " + jenis : ""); el.innerHTML = "<i></i>" + teks; }
export function logTambah(el, teks, max = 30) {
  const k = el.querySelector(".kosong"); if (k) k.remove();
  const d = document.createElement("div"); d.innerHTML = `<time>${masa()}</time><span></span>`; d.querySelector("span").textContent = teks;
  el.prepend(d); while (el.children.length > max) el.lastChild.remove();
}
// Kadar bingkai
export function fps() { let n = 0, t0 = performance.now(), v = 0; return () => { n++; const t = performance.now(); if (t - t0 > 1000) { v = Math.round(n * 1000 / (t - t0)); n = 0; t0 = t; } return v; }; }

// MediaPipe Tasks Vision
export const MP_VER = "0.10.14";
export async function mediapipe() {
  const m = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}/vision_bundle.mjs`);
  const fs = await m.FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VER}/wasm`);
  return { m, fs };
}

// Ralat memuat model (tiada internet / CDN disekat): papar mesej mesra
addEventListener("unhandledrejection", () => { const p = document.querySelector("#pil"); if (p) status(p, "Model AI gagal dimuat. Semak internet, kemudian muat semula halaman.", "bahaya"); });
