<script lang="ts">
	import type { Snippet } from "svelte";

  /**
   * Komponen kartu yang dapat diklik untuk aksi utama (Input Masalah, Input Absensi).
   * Menerima kelas CSS untuk warna latar belakang dan slot 'children' untuk ikon.
   */
  let { 
    label, 
    class: extraClass = '',
    children,
    onclick: handleClick,
  } = $props<{
    label?: string;
    class?: string;
    children?: Snippet;
    onclick?: void | (() => void) | (() => {});
  }>();
</script>

<div class="bg-slate-800 rounded-3xl p-6 shadow-lg flex flex-col w-full max-w-sm">
  
  <!-- Judul Masalah -->
  <div class="flex items-center gap-4 mb-5">
    {#if children}
        {@render children()}
    {/if}
    <!-- <div class="w-6 h-6 bg-red-600 rounded-md"></div>
    <h2 class="text-white text-4xl font-bold">Masalah : {4}</h2> -->
  </div>

  <!-- Tombol Aksi Utama -->
  <button
    class="
    w-full text-white text-3xl font-bold p-5 rounded-2xl
      bg-gradient-to-b from-blue-500 to-blue-700
      shadow-md hover:shadow-lg
      active:translate-y-0.5
      transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-4 focus:ring-blue-400
    "
    onclick={handleClick}
  >
    {label}
  </button>
  
</div>