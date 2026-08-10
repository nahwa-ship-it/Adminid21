// ================================================
// Laporan Penjualan Nahwa — logika utama
// ================================================

// ---------- State ----------
let belanjaItems = []; // [{nama, harga}]
let stokHabis = [];    // [nama]
let laporanGlobal = "";

// ---------- Format Rupiah ----------
function formatRp(angka) {
  const n = Math.round(Number(angka) || 0);
  return n.toLocaleString("id-ID");
}

function numVal(id, fallback = 0) {
  const v = document.getElementById(id).value.trim();
  if (v === "") return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

// ---------- Tema ----------
const themeToggle = document.getElementById("themeToggle");
function applyTheme(mode) {
  document.documentElement.setAttribute("data-theme", mode);
  themeToggle.textContent = mode === "light" ? "🌙" : "☀️";
  localStorage.setItem("nahwa-theme", mode);
}
(function initTheme() {
  const saved = localStorage.getItem("nahwa-theme") || "dark";
  applyTheme(saved);
})();
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "light" ? "dark" : "light");
});

// ---------- Toast ----------
let toastTimer;
function showToast(msg, isErr = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.toggle("err", isErr);
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

// ---------- Belanja ----------
function renderBelanja() {
  const ul = document.getElementById("belanjaList");
  ul.innerHTML = "";
  if (belanjaItems.length === 0) {
    ul.innerHTML = `<li class="empty-hint">Belum ada item belanja</li>`;
  } else {
    belanjaItems.forEach((item, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="item-name">${idx + 1}. ${escapeHtml(item.nama)}</span>
        <span style="display:flex;align-items:center;gap:8px;">
          <span class="item-harga">Rp ${formatRp(item.harga)}</span>
          <button class="del-btn" data-idx="${idx}" title="Hapus">✕</button>
        </span>`;
      ul.appendChild(li);
    });
  }
  const total = belanjaItems.reduce((s, i) => s + i.harga, 0);
  document.getElementById("totalBelanja").textContent = `Rp ${formatRp(total)}`;

  ul.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      belanjaItems.splice(Number(btn.dataset.idx), 1);
      renderBelanja();
    });
  });
}

document.getElementById("addBelanja").addEventListener("click", () => {
  const nama = document.getElementById("belanjaNama").value.trim();
  const harga = Number(document.getElementById("belanjaHarga").value);
  if (!nama) return showToast("Masukkan nama barang", true);
  if (!document.getElementById("belanjaHarga").value.trim() || isNaN(harga)) {
    return showToast("Harga harus berupa angka", true);
  }
  belanjaItems.push({ nama, harga });
  document.getElementById("belanjaNama").value = "";
  document.getElementById("belanjaHarga").value = "";
  renderBelanja();
});

// ---------- Stok habis ----------
function renderStok() {
  const ul = document.getElementById("stokList");
  ul.innerHTML = "";
  if (stokHabis.length === 0) {
    ul.innerHTML = `<li class="empty-hint">Belum ada stok habis dicatat</li>`;
  } else {
    stokHabis.forEach((item, idx) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="item-name">${idx + 1}. ${escapeHtml(item)}</span>
        <button class="del-btn" data-idx="${idx}" title="Hapus">✕</button>`;
      ul.appendChild(li);
    });
  }
  ul.querySelectorAll(".del-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      stokHabis.splice(Number(btn.dataset.idx), 1);
      renderStok();
    });
  });
}

document.getElementById("addStok").addEventListener("click", () => {
  const val = document.getElementById("stokEntry").value.trim();
  if (!val) return;
  stokHabis.push(val);
  document.getElementById("stokEntry").value = "";
  renderStok();
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ---------- Hitung Laporan ----------
document.getElementById("hitungBtn").addEventListener("click", async () => {
  const modal = numVal("modal", 650000);
  const snack = numVal("snack", 0);
  const bakso = numVal("bakso", 0);
  const titipan = numVal("titipan", 0);
  const rokok = numVal("rokok", 0);
  const sop = numVal("sop", 0);
  const qris = numVal("qris", 0);
  const tunai = numVal("tunai", 0);
  const edc = numVal("edc", 0);
  const hutangRaw = document.getElementById("hutang").value.trim();
  const hutang = ["", "-", "0"].includes(hutangRaw) ? 0 : Number(hutangRaw) || 0;

  const totalOmset = snack + bakso + titipan + rokok + sop;
  const totalRincian = tunai + qris + edc + hutang;

  if (Math.abs(totalOmset - totalRincian) > 1) {
    const selisih = totalOmset - totalRincian;
    showToast(
      `Tidak sinkron! Omset Rp ${formatRp(totalOmset)} ≠ Rincian Rp ${formatRp(totalRincian)} (selisih Rp ${formatRp(selisih)})`,
      true
    );
    return;
  }

  const totalBelanjaAll = belanjaItems.reduce((s, i) => s + i.harga, 0);
  const setoranBakso = Math.trunc(bakso * 0.8);
  const totalSetoran = setoranBakso + titipan + rokok + sop;
  const totalPengeluaran = totalSetoran + totalBelanjaAll;
  const omsetBersih = totalOmset - totalPengeluaran;
  const cashBersih = tunai - totalPengeluaran;

  const hariMap = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const now = new Date();
  const bulanMap = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const tanggalLaporan = `${hariMap[now.getDay()]}, ${now.getDate()} ${bulanMap[now.getMonth()]} ${now.getFullYear()}`;

  let laporan = `Selamat malam pak Zay, berikut laporan penjualan hari ini. Terimakasih 🙏\n\n`;
  laporan += `${tanggalLaporan}\n\n`;
  laporan += `2. Total penjualan minuman & snack : ${formatRp(snack)}\n`;
  laporan += `3. Total penjualan bakso : ${formatRp(bakso)}\n`;
  laporan += `4. Total penjualan titipan : ${formatRp(titipan)}\n`;
  laporan += `5. Total penjualan rokok : ${formatRp(rokok)}\n`;
  laporan += `6. Total penjualan sop : ${formatRp(sop)}\n\n`;
  laporan += `*Total Omset Kotor: ${formatRp(totalOmset)}\n\n`;
  laporan += `Rincian Penjualan\n`;
  laporan += `QRIS : ${formatRp(qris)}\n`;
  laporan += `Tunai : ${formatRp(tunai)}\n`;
  laporan += `EDC BCA : ${formatRp(edc)}\n`;
  laporan += `Hutang : ${hutangRaw ? hutangRaw : "-"}\n\n`;
  laporan += `Pengeluaran\n`;
  laporan += `Setoran bakso : ${formatRp(setoranBakso)}\n`;
  laporan += `Setoran titipan : ${formatRp(titipan)}\n`;
  laporan += `Setoran rokok : ${formatRp(rokok)}\n`;
  laporan += `Setoran sop : ${formatRp(sop)}\n`;
  laporan += `→ Total seluruh setoran : ${formatRp(totalSetoran)}\n\n`;
  laporan += `Belanja barang:\n`;
  belanjaItems.forEach((item, idx) => {
    laporan += `${idx + 1}. ${item.nama} : ${formatRp(item.harga)}\n`;
  });
  laporan += `\n*Total Omset Bersih : ${formatRp(omsetBersih)}\n`;
  laporan += `   - Cash : ${formatRp(cashBersih)}\n`;
  laporan += `   - QRIS : ${formatRp(qris)}\n`;
  laporan += `   - EDC BCA : ${formatRp(edc)}\n\n`;
  laporan += `Kas besok : ${formatRp(modal)}\n\n`;
  laporan += `Stok habis :\n`;
  stokHabis.forEach((item, idx) => {
    laporan += `${idx + 1}. ${item}\n`;
  });
  laporan += `\n— Sistem Sukses Nahwa 💼`;

  laporanGlobal = laporan;
  document.getElementById("receiptOutput").textContent = laporan;

  // simpan ke Supabase (kalau gagal, laporan tetap tampil, cuma riwayat yg gak kesimpan)
  try {
    await simpanRiwayat(tanggalLaporan, laporan, totalOmset, omsetBersih, totalBelanjaAll, totalPengeluaran);
    showToast("Laporan dibuat & tersimpan ke riwayat ✅");
  } catch (e) {
    showToast("Laporan dibuat, tapi gagal simpan ke riwayat (cek koneksi Supabase)", true);
  }
});

// ---------- Kirim WhatsApp ----------
document.getElementById("waBtn").addEventListener("click", () => {
  if (!laporanGlobal) return showToast("Klik Hitung Laporan dulu", true);
  let nomor = document.getElementById("nomorWa").value.trim() || "6282136953426";
  nomor = nomor.replace(/[^0-9]/g, "");
  if (nomor.startsWith("0")) nomor = "62" + nomor.slice(1);
  const pesan = encodeURIComponent(laporanGlobal);
  const link = `https://wa.me/${nomor}?text=${pesan}`;
  window.open(link, "_blank");
});

// ---------- Export TXT ----------
document.getElementById("exportBtn").addEventListener("click", () => {
  if (!laporanGlobal) return showToast("Buat laporan dulu", true);
  const blob = new Blob([laporanGlobal], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  a.href = url;
  a.download = `Laporan_Nahwa_${today}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

// ---------- Riwayat ----------
const riwayatOverlay = document.getElementById("riwayatOverlay");
document.getElementById("riwayatBtn").addEventListener("click", async () => {
  riwayatOverlay.classList.add("open");
  const box = document.getElementById("riwayatContent");
  box.innerHTML = `<p class="empty-hint">Memuat riwayat…</p>`;
  try {
    const data = await ambilRiwayat(30);
    if (!data || data.length === 0) {
      box.innerHTML = `<p class="empty-hint">Belum ada riwayat.</p>`;
      return;
    }
    box.innerHTML = "";
    data.forEach((r) => {
      const div = document.createElement("div");
      div.className = "hist-item";
      const pengirim = r.submitted_by_email ? ` · oleh ${escapeHtml(r.submitted_by_email)}` : "";
      div.innerHTML = `<div class="hist-date">📅 ${escapeHtml(r.tanggal)}${pengirim}</div><pre>${escapeHtml(r.laporan)}</pre>`;
      box.appendChild(div);
    });
  } catch (e) {
    box.innerHTML = `<p class="empty-hint">Gagal memuat riwayat. Cek koneksi Supabase kamu.</p>`;
  }
});
document.getElementById("closeRiwayat").addEventListener("click", () => {
  riwayatOverlay.classList.remove("open");
});
riwayatOverlay.addEventListener("click", (e) => {
  if (e.target === riwayatOverlay) riwayatOverlay.classList.remove("open");
});

// ---------- Init ----------
renderBelanja();
renderStok();
