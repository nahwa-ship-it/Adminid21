// ================================================
// Koneksi Supabase
// Ganti dua nilai di bawah dengan punya kamu sendiri
// (Project Settings -> API di dashboard Supabase)
// ================================================

const SUPABASE_URL = "https://wvkduzsaqfelzpumgkfd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_61BO1gW-IKGV4BgvHfGeKA_puvF-irS";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Simpan satu laporan ke Supabase
async function simpanRiwayat(tanggal, laporan, totalOmset, omsetBersih, totalBelanja, totalPengeluaran) {
  const { data: userData } = await supabaseClient.auth.getUser();
  const user = userData?.user;
  const { error } = await supabaseClient.from("riwayat_laporan").insert({
    tanggal,
    laporan,
    total_omset: totalOmset,
    total_belanja: totalBelanja,
    total_pengeluaran: totalPengeluaran,
    omset_bersih: omsetBersih,
    submitted_by: user?.id || null,
    submitted_by_email: user?.email || null,
  });
  if (error) {
    console.error("Gagal simpan riwayat:", error);
    throw error;
  }
}

// Ambil riwayat terbaru (default 30)
async function ambilRiwayat(limit = 30) {
  const { data, error } = await supabaseClient
    .from("riwayat_laporan")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Gagal ambil riwayat:", error);
    throw error;
  }
  return data;
}

// Hapus satu laporan (RLS: cuma admin yang diizinkan Supabase-nya)
async function hapusRiwayat(id) {
  const { error } = await supabaseClient.from("riwayat_laporan").delete().eq("id", id);
  if (error) {
    console.error("Gagal hapus riwayat:", error);
    throw error;
  }
}
