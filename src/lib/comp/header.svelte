<script lang="ts">
  /**
   * Komponen ini menampilkan kartu dengan waktu, tanggal, dan salam
   * yang diperbarui secara real-time.
   */

  // Menerima 'name' sebagai prop untuk personalisasi
  let { 
    name = 'User',
    onclick: handleBackClick = () => {}
  } = $props<{ 
    onclick?: void | (() => void) | (() => {});
    name?: string ;
  }>();

  // State untuk menyimpan waktu saat ini, diperbarui setiap detik
  let now = $state(new Date());
  $effect(() => {
    const timer = setInterval(() => {
      now = new Date();
    }, 1000);
    // Membersihkan interval saat komponen dihancurkan
    return () => clearInterval(timer);
  });

  // Menggunakan $derived untuk menghitung nilai turunan secara efisien
  // Nilai ini hanya akan dihitung ulang ketika 'now' berubah
  const formattedTime = $derived(
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\./g, ':')
  );

  const formattedDate = $derived(
    new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(now)
  );

  const greeting = $derived.by(() => {
    const hour = now.getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  });
</script>

<!-- Kontainer Utama dengan gradien dan bentuk yang disederhanakan -->
<div class="w-[428px] h-[239px]">
  <svg
    width="428"
    height="70"
    viewBox="0 0 428 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="absolute left-[-0.5px] top-[169.24px]"
    preserveAspectRatio="none"
  >
    <ellipse cx="214" cy="34.6306" rx="214" ry="34.6306" fill="#324494"></ellipse>
  </svg>
  <div
    class="w-[428px] h-[205.83px] absolute left-[-0.5px] top-[-0.5px] bg-gradient-to-b from-[#5472f8] to-[#314392]"
  ></div>
  <button onclick={handleBackClick} aria-label="i">
      <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="w-[50px] h-[50px] absolute left-[11px] top-[9px]"
      preserveAspectRatio="none"
    >
      <path
        d="M16.3021 27.0834L27.9687 38.75L25 41.6667L8.33331 25L25 8.33337L27.9687 11.25L16.3021 22.9167H41.6666V27.0834H16.3021Z"
        fill="#FEF7FF"
      ></path>
    </svg>
  </button>
  <p
    class="w-[281px] h-[46px] absolute left-[73px] top-[175px] text-[35px] font-bold text-center text-white"
  >
    {name}
  </p>
  <p
    class="w-[281px] h-[37px] absolute left-[73px] top-[138px] text-3xl font-medium text-center text-white"
  >
    {greeting}
  </p>
  <p
    class="w-[281px] h-[37px] absolute left-[73px] top-[21px] text-xl font-medium text-center text-white"
  >
    {formattedDate}
  </p>
  <p
    class="w-[281px] h-24 absolute left-[73px] top-[42px] text-[80px] font-bold text-center text-white"
  >
    {formattedTime}
  </p>
</div>

