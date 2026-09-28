/* ===== Bantuan ===== */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const kurangiGerak = matchMedia("(prefers-reduced-motion: reduce)").matches;
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));
const root = document.documentElement;

/* ===== Latar: simbol kode melayang ===== */
const cv = $("#bg");
const cx = cv.getContext("2d");
const simbol = ["{ }", ";", "</>", "=>", "01", "#", "[ ]", "( )", "==", "&&"];
let W, H, titik = [], warna = "157,107,255";

function ukur() {
  const d = devicePixelRatio || 1;
  W = innerWidth; H = innerHeight;
  cv.width = W * d; cv.height = H * d;
  cx.setTransform(d, 0, 0, d, 0, 0);
  titik = Array.from({ length: Math.min(34, Math.round(W / 38)) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    v: 0.15 + Math.random() * 0.35,
    s: 14 + Math.random() * 16,
    t: simbol[Math.floor(Math.random() * simbol.length)],
  }));
  if (kurangiGerak) gambar();
}
function gambar() {
  cx.clearRect(0, 0, W, H);
  cx.fillStyle = `rgba(${warna},.14)`;
  titik.forEach((p) => {
    cx.font = `600 ${p.s}px Consolas, monospace`;
    cx.fillText(p.t, p.x, p.y);
    if (!kurangiGerak) {
      p.y -= p.v;
      if (p.y < -30) { p.y = H + 30; p.x = Math.random() * W; }
    }
  });
  if (!kurangiGerak) requestAnimationFrame(gambar);
}
addEventListener("resize", ukur);
ukur();
if (!kurangiGerak) gambar();

/* ===== Tema gelap / terang ===== */
const btnTema = $("#tema");
function setTema(t) {
  root.dataset.tema = t;
  btnTema.textContent = t === "terang" ? "Mode gelap" : "Mode terang";
  btnTema.setAttribute("aria-pressed", String(t === "terang"));
  warna = t === "terang" ? "100,70,200" : "157,107,255";
  if (kurangiGerak) gambar();
  try { localStorage.setItem("tema", t); } catch (e) {}
}
let temaAwal = "gelap";
try { temaAwal = localStorage.getItem("tema") || "gelap"; } catch (e) {}
setTema(temaAwal);
btnTema.addEventListener("click", () => setTema(root.dataset.tema === "terang" ? "gelap" : "terang"));

/* ===== Teks mengetik di hero ===== */
const kata = ["aplikasi desktop.", "website.", "gim seru.", "API dengan ASP.NET."];
const elKetik = $("#ketik");
let ki = 0, kh = 0, hapus = false;
function ketikKata() {
  const teks = kata[ki];
  elKetik.textContent = teks.slice(0, kh);
  if (!hapus && kh < teks.length) { kh++; setTimeout(ketikKata, 90); }
  else if (!hapus) { hapus = true; setTimeout(ketikKata, 1400); }
  else if (kh > 0) { kh--; setTimeout(ketikKata, 45); }
  else { hapus = false; ki = (ki + 1) % kata.length; setTimeout(ketikKata, 300); }
}
if (kurangiGerak) elKetik.textContent = kata[0]; else ketikKata();

/* ===== Editor C# di hero ===== */
const berkas = {
  "Siswa.cs": {
    kode: `using System;

class Siswa
{
    string nama = "Arga";
    string kelas = "X PPLG";

    static void Main()
    {
        var s = new Siswa();
        Console.WriteLine("Halo, dunia PPLG!");
        Console.WriteLine("Nama  : " + s.nama);
        Console.WriteLine("Kelas : " + s.kelas);
    }
}`,
    keluaran: ["Halo, dunia PPLG!", "Nama  : Arga", "Kelas : X PPLG"],
  },
  "PPLG.cs": {
    kode: `using System;

class PPLG
{
    static void Main()
    {
        // 3 tahun belajar
        string[] prospek = { "Software Developer",
            "Web Developer", "Game Developer" };

        Console.WriteLine("Jurusan PPLG, 3 tahun");
        foreach (var p in prospek)
            Console.WriteLine("- " + p);
    }
}`,
    keluaran: ["Jurusan PPLG, 3 tahun", "- Software Developer", "- Web Developer", "- Game Developer"],
  },
};

const RE = /(\/\/.*)|("(?:[^"\\\n]|\\.)*"?)|\b(using|class|static|void|string|new|var|foreach|in|public|private|return|int|if|is|null|readonly|nameof|get|set)\b|\b([A-Za-z_]\w*)(?=\()|\b([A-Z]\w*)\b|\b(\d+)\b/g;
function warnai(kode) {
  const aman = kode.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return aman.replace(RE, (m, kom, str, kw, fn, tipe) => {
    if (kom) return `<span class="c">${m}</span>`;
    if (str) return `<span class="s">${m}</span>`;
    if (kw) return `<span class="k">${m}</span>`;
    if (fn) return `<span class="f">${m}</span>`;
    if (tipe) return `<span class="t">${m}</span>`;
    return `<span class="n">${m}</span>`;
  });
}

const elKode = $("#kode"), elGutter = $("#gutter"), konsol = $("#konsol"), btnRun = $("#run");
let tabAktif = "Siswa.cs", timerKetik = null, sedangJalan = false;

function render(teks, mengetik) {
  elKode.innerHTML = warnai(teks) + (mengetik ? '<span class="cur"></span>' : "");
  const baris = teks.split("\n").length;
  elGutter.textContent = Array.from({ length: baris }, (_, i) => i + 1).join("\n");
}
function tampilKode(nama, animasi) {
  clearTimeout(timerKetik);
  const kode = berkas[nama].kode;
  if (!animasi || kurangiGerak) { render(kode, false); return; }
  let i = 0;
  (function langkah() {
    i = Math.min(kode.length, i + 1 + Math.floor(Math.random() * 3));
    render(kode.slice(0, i), i < kode.length);
    if (i < kode.length) timerKetik = setTimeout(langkah, 24);
  })();
}
function tambahBaris(teks, kelas) {
  const d = document.createElement("div");
  d.className = "baris " + (kelas || "");
  d.textContent = teks;
  konsol.appendChild(d);
}
function resetKonsol() {
  konsol.innerHTML = '<div class="redup">Klik Run untuk menjalankan kode.</div>';
}
async function jalankan() {
  if (sedangJalan) return;
  sedangJalan = true; btnRun.disabled = true;
  tampilKode(tabAktif, false);
  konsol.innerHTML = "";
  tambahBaris("$ dotnet run", "prompt");
  for (const b of berkas[tabAktif].keluaran) {
    await tunggu(kurangiGerak ? 0 : 420);
    tambahBaris(b);
  }
  await tunggu(kurangiGerak ? 0 : 300);
  tambahBaris("Program selesai (exit code 0).", "redup");
  sedangJalan = false; btnRun.disabled = false;
}
$$(".tab").forEach((t) => t.addEventListener("click", () => {
  if (sedangJalan) return;
  $$(".tab").forEach((x) => { x.classList.remove("aktif"); x.setAttribute("aria-selected", "false"); });
  t.classList.add("aktif"); t.setAttribute("aria-selected", "true");
  tabAktif = t.dataset.berkas;
  tampilKode(tabAktif, false);
  resetKonsol();
}));
btnRun.addEventListener("click", jalankan);
tampilKode(tabAktif, true);
resetKonsol();

/* Jendela kode miring mengikuti kursor */
const ideWrap = $(".ide-wrap"), ide = $(".ide");
if (matchMedia("(hover: hover)").matches && !kurangiGerak) {
  ideWrap.addEventListener("pointermove", (e) => {
    const r = ide.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ide.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 9}deg)`;
  });
  ideWrap.addEventListener("pointerleave", () => { ide.style.transform = ""; });
}

/* Cahaya header mengikuti kursor */
const header = $("header");
header.addEventListener("pointermove", (e) => {
  const r = header.getBoundingClientRect();
  header.style.setProperty("--mx", e.clientX - r.left + "px");
  header.style.setProperty("--my", e.clientY - r.top + "px");
});

/* ===== Muncul saat di-scroll + angka menghitung ===== */
function hitung(b) {
  const target = +b.dataset.count;
  if (kurangiGerak) { b.textContent = target; return; }
  const mulai = performance.now(), durasi = 1000;
  (function frame(t) {
    const p = Math.min(1, (t - mulai) / durasi);
    b.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(frame);
  })(mulai);
}
const ioReveal = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("show");
    $$("[data-count]", e.target).forEach(hitung);
    ioReveal.unobserve(e.target);
  });
}, { threshold: 0.12 });
$$(".reveal").forEach((n, i) => {
  n.style.transitionDelay = (i % 3) * 90 + "ms";
  ioReveal.observe(n);
});

/* ===== Progress bar scroll ===== */
const bar = $(".progress");
addEventListener("scroll", () => {
  const max = root.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
}, { passive: true });

/* ===== Menu aktif sesuai bagian yang dibaca ===== */
const linkNav = $$("nav a");
const ioNav = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    linkNav.forEach((a) => a.classList.toggle("aktif", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
["home", "profil", "kompetensi", "api", "kontak"].forEach((id) => ioNav.observe(document.getElementById(id)));

/* ===== Filter + kartu kompetensi ===== */
$$(".filter button").forEach((b) => b.addEventListener("click", () => {
  $$(".filter button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  const kat = b.dataset.kat;
  $$(".skills li").forEach((li) => { li.hidden = !(kat === "semua" || li.dataset.kat === kat); });
}));
$$(".kartu").forEach((k) => k.addEventListener("click", () => {
  const buka = k.getAttribute("aria-expanded") === "true";
  k.setAttribute("aria-expanded", String(!buka));
  k.nextElementSibling.hidden = buka;
}));

/* ===== ASP.NET API: simulasi Swagger ===== */
const endpoint = [
  { m: "GET", p: "/api/siswa", ket: "Ambil semua siswa" },
  { m: "GET", p: "/api/siswa/{id}", ket: "Ambil satu siswa berdasarkan id", param: "id" },
  { m: "POST", p: "/api/siswa", ket: "Tambah siswa baru", body: '{\n  "nama": "Rafi",\n  "kelas": "X PPLG"\n}' },
];
let dataSiswa = [
  { id: 1, nama: "Arga", kelas: "X PPLG" },
  { id: 2, nama: "Sinta", kelas: "X PPLG" },
];
const teksStatus = { 200: "OK", 201: "Created", 400: "Bad Request", 404: "Not Found" };
const swagger = $("#swagger");

endpoint.forEach((e, i) => {
  const box = document.createElement("div");
  box.className = "ep m-" + e.m.toLowerCase();
  box.dataset.i = i;
  box.innerHTML = `
    <button type="button" class="ep-head" aria-expanded="false" aria-controls="ep${i}">
      <span class="met">${e.m}</span><code>${e.p}</code><span class="ket">${e.ket}</span>
    </button>
    <div class="ep-isi" id="ep${i}" hidden>
      ${e.param ? `<label>Parameter <code>${e.param}</code> (integer)<input class="ep-in" type="number" value="1" min="0"></label>` : ""}
      ${e.body ? `<label>Request body (JSON)<textarea class="ep-in" rows="4" spellcheck="false">${e.body}</textarea></label>` : ""}
      <button type="button" class="ep-run">Execute</button>
      <div class="ep-hasil" aria-live="polite"></div>
    </div>`;
  swagger.appendChild(box);
});

async function animasiAlur() {
  const item = $$("#alur li");
  item.forEach((x) => x.classList.remove("nyala"));
  for (const x of item) {
    x.classList.add("nyala");
    await tunggu(kurangiGerak ? 0 : 230);
  }
  setTimeout(() => item.forEach((x) => x.classList.remove("nyala")), kurangiGerak ? 0 : 700);
}

function isiHasil(hasil, cmd, status, badan, hdr, ms) {
  hasil.innerHTML = '<pre class="cmd"></pre><div class="st"><span class="kode-st"></span><span class="ms"></span></div><p class="hdr"></p><pre class="json"></pre>';
  $(".cmd", hasil).textContent = cmd;
  const st = $(".kode-st", hasil);
  st.textContent = status;
  if (status >= 400) st.classList.add("err");
  $(".ms", hasil).textContent = teksStatus[status] + " \u2022 " + ms + " ms";
  $(".hdr", hasil).textContent = hdr;
  $(".json", hasil).textContent = JSON.stringify(badan, null, 2);
}

async function eksekusi(box) {
  const e = endpoint[+box.dataset.i];
  const hasil = $(".ep-hasil", box), tombol = $(".ep-run", box), input = $(".ep-in", box);
  tombol.disabled = true;
  hasil.textContent = "Menjalankan request...";
  await animasiAlur();

  let url = e.p, status = 200, badan = null, hdr = "content-type: application/json; charset=utf-8";
  const ms = 12 + Math.floor(Math.random() * 30);

  if (e.m === "GET" && !e.param) {
    badan = dataSiswa;
  } else if (e.m === "GET") {
    const id = parseInt(input.value, 10);
    if (Number.isNaN(id)) {
      status = 400;
      badan = { title: "One or more validation errors occurred.", status: 400, errors: { id: ["The value is not valid."] } };
      hdr = "content-type: application/problem+json; charset=utf-8";
    } else {
      url = e.p.replace("{id}", id);
      const s = dataSiswa.find((x) => x.id === id);
      if (s) badan = s;
      else {
        status = 404;
        badan = { type: "https://tools.ietf.org/html/rfc9110#section-15.5.5", title: "Not Found", status: 404 };
        hdr = "content-type: application/problem+json; charset=utf-8";
      }
    }
  } else {
    let baru = null;
    try { baru = JSON.parse(input.value); } catch (err) {}
    if (baru && typeof baru.nama === "string" && baru.nama.trim()) {
      const obj = {
        id: Math.max(0, ...dataSiswa.map((x) => x.id)) + 1,
        nama: baru.nama.trim(),
        kelas: typeof baru.kelas === "string" ? baru.kelas : "",
      };
      dataSiswa.push(obj);
      status = 201; badan = obj;
      hdr += "\nlocation: https://localhost:7000/api/siswa/" + obj.id;
    } else {
      status = 400;
      badan = { title: "One or more validation errors occurred.", status: 400, errors: { nama: ["Nama wajib diisi."] } };
      hdr = "content-type: application/problem+json; charset=utf-8";
    }
  }

  let cmd = `curl -X ${e.m} "https://localhost:7000${url}"`;
  if (e.m === "POST") cmd += ' -H "Content-Type: application/json"';
  isiHasil(hasil, cmd, status, badan, hdr, ms);
  tombol.disabled = false;
}

swagger.addEventListener("click", (ev) => {
  const head = ev.target.closest(".ep-head");
  if (head) {
    const buka = head.getAttribute("aria-expanded") === "true";
    head.setAttribute("aria-expanded", String(!buka));
    document.getElementById(head.getAttribute("aria-controls")).hidden = buka;
    return;
  }
  const run = ev.target.closest(".ep-run");
  if (run) eksekusi(run.closest(".ep"));
});

/* Kode ASP.NET Core */
const kodeApi = {
  "Program.cs": `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.Run();`,
  "SiswaController.cs": `using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class SiswaController : ControllerBase
{
    private static readonly List<Siswa> data = new()
    {
        new Siswa { Id = 1, Nama = "Arga", Kelas = "X PPLG" },
        new Siswa { Id = 2, Nama = "Sinta", Kelas = "X PPLG" }
    };

    [HttpGet]
    public ActionResult<List<Siswa>> GetAll()
    {
        return data;
    }

    [HttpGet("{id}")]
    public ActionResult<Siswa> GetById(int id)
    {
        var siswa = data.FirstOrDefault(s => s.Id == id);
        if (siswa is null) return NotFound();
        return siswa;
    }

    [HttpPost]
    public ActionResult<Siswa> Tambah(Siswa baru)
    {
        baru.Id = data.Max(s => s.Id) + 1;
        data.Add(baru);
        return CreatedAtAction(nameof(GetById), new { id = baru.Id }, baru);
    }
}

public class Siswa
{
    public int Id { get; set; }
    public string Nama { get; set; } = "";
    public string Kelas { get; set; } = "";
}`,
};
const ketBerkas = {
  "Program.cs": "Mengaktifkan controller dan Swagger",
  "SiswaController.cs": "Tiga endpoint: GET, GET by id, POST",
};
const elKodeApi = $("#kode-api"), ketKode = $("#ket-kode");
let berkasApi = "Program.cs";
function tampilApi(nama) {
  berkasApi = nama;
  elKodeApi.innerHTML = warnai(kodeApi[nama]);
  ketKode.textContent = ketBerkas[nama];
}
$$(".ktab").forEach((t) => t.addEventListener("click", () => {
  $$(".ktab").forEach((x) => { x.classList.toggle("aktif", x === t); x.setAttribute("aria-selected", String(x === t)); });
  tampilApi(t.dataset.k);
}));
tampilApi(berkasApi);
$("#salin-kode").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(kodeApi[berkasApi]);
    ketKode.textContent = "Kode tersalin";
  } catch (e) {
    ketKode.textContent = "Salin manual dengan memblok teks";
  }
  setTimeout(() => tampilApi(berkasApi), 2000);
});

/* ===== Prospek kerja ===== */
const infoProspek = {
  "Software developer": "Merancang dan membuat aplikasi untuk perusahaan atau pengguna umum, lalu merawatnya agar tetap berjalan baik.",
  "Web developer": "Membuat dan merawat website, dari tampilan yang dilihat pengunjung sampai sistem di belakangnya.",
  "Mobile app developer": "Membuat aplikasi untuk ponsel, seperti aplikasi belajar, belanja, atau layanan antar.",
  "Game developer": "Membuat gim: menyusun aturan main, karakter, gerakan, dan tampilannya.",
  "QA tester": "Menguji aplikasi dan gim untuk menemukan bug sebelum dipakai orang banyak.",
  "UI designer": "Merancang tampilan dan alur pemakaian aplikasi supaya mudah dan enak dipakai.",
};
const elInfo = $("#info-prospek");
$$(".jobs button").forEach((b) => b.addEventListener("click", () => {
  $$(".jobs button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  elInfo.textContent = infoProspek[b.textContent.trim()];
}));

/* ===== Tes: cocok di PPLG? ===== */
const soal = [
  "Kamu suka memecahkan teka-teki dan soal logika?",
  "Kamu penasaran bagaimana sebuah gim dibuat?",
  "Kalau ada error, kamu mau mencoba lagi sampai berhasil?",
  "Kamu senang membuat sesuatu yang bisa dipakai orang lain?",
];
const kuis = $("#kuis");
let no = 0, skor = 0;
function tampilSoal(fokus) {
  kuis.innerHTML = `
    <p class="no">Pertanyaan ${no + 1} dari ${soal.length}</p>
    <h3>${soal[no]}</h3>
    <div class="jawab"><button type="button" data-j="1">Ya</button><button type="button" data-j="0">Belum</button></div>
    <div class="titik" aria-hidden="true">${soal.map((_, i) => `<i class="${i < no ? "isi" : ""}"></i>`).join("")}</div>`;
  if (fokus) $("button", kuis).focus();
}
function tampilHasil() {
  let judul, isi;
  if (skor === soal.length) {
    judul = "Kamu cocok banget di PPLG";
    isi = "Semua jawabanmu mengarah ke dunia pemrograman. Tinggal mulai belajar dan rajin berlatih.";
  } else if (skor >= 2) {
    judul = "Kamu cukup cocok";
    isi = "Sebagian besar sudah sesuai. Minat bisa tumbuh lewat latihan, jadi jangan ragu untuk mencoba.";
  } else {
    judul = "Kenali PPLG lebih dulu";
    isi = "Belum terlalu cocok sekarang. Coba ngobrol dengan kakak kelas atau lihat praktik di kelas sebelum memutuskan.";
  }
  kuis.innerHTML = `
    <p class="no">Hasil kamu: ${skor} dari ${soal.length}</p>
    <h3>${judul}</h3>
    <p>${isi}</p>
    <button type="button" id="ulang" class="btn">Ulangi tes</button>`;
  $("#ulang").focus();
}
kuis.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.id === "ulang") { no = 0; skor = 0; tampilSoal(true); return; }
  skor += +b.dataset.j; no++;
  if (no < soal.length) tampilSoal(true); else tampilHasil();
});
tampilSoal(false);

/* ===== Fakta acak ===== */
const fakta = [
  "Istilah \"bug\" makin terkenal setelah seekor ngengat ditemukan di komputer Harvard Mark II pada 1947.",
  "C# dikembangkan Microsoft dan menjadi bahasa utama di Unity, mesin gim yang sangat populer.",
  "Swagger dipakai untuk membuat dokumentasi API yang bisa langsung dicoba di browser.",
  "HTML, CSS, dan JavaScript adalah tiga bahasa dasar yang membentuk hampir semua website.",
  "Programmer menghabiskan lebih banyak waktu membaca dan memperbaiki kode daripada menulis kode baru.",
];
const elFakta = $("#fakta");
let fi = Math.floor(Math.random() * fakta.length);
elFakta.textContent = fakta[fi];
$("#fakta-lagi").addEventListener("click", () => {
  let n;
  do { n = Math.floor(Math.random() * fakta.length); } while (n === fi);
  fi = n;
  elFakta.textContent = fakta[fi];
});

/* ===== Salin email ===== */
const info = $("#salin-info");
$("#salin").addEventListener("click", async () => {
  const email = $("#email").textContent;
  try {
    await navigator.clipboard.writeText(email);
    info.textContent = "Email tersalin";
  } catch (e) {
    info.textContent = "Salin manual: " + email;
  }
  setTimeout(() => { info.textContent = ""; }, 2500);
});