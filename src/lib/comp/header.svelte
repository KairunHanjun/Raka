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
<div 
  class="
    w-full max-w-md text-white
    bg-gradient-to-b from-blue-600 to-indigo-800
    rounded-b-[9rem] shadow-2xl
    p-6 flex flex-col
  "
>
  <!-- Header: Tombol kembali dan tanggal -->
  <header class="flex items-center gap-4">
    <!-- svelte-ignore a11y_consider_explicit_label -->
    <button onclick={handleBackClick} class="p-2 rounded-full hover:bg-white/10 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    </button>
    <span class="font-semibold text-lg">{formattedDate}</span>
  </header>

  <!-- Konten Utama: Waktu dan Salam -->
  <main class="flex-grow flex flex-col items-center justify-center text-center">
    <div class="text-9xl font-bold tracking-tight">
      {formattedTime}
    </div>
    <div class="mt-4 text-4xl font-light">
      {greeting}
    </div>
    <div class="text-5xl font-bold">
      {name}
    </div>
  </main>
</div>

