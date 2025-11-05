<script lang="ts">
	import { type Snippet } from "svelte";


  // Tipe notifikasi visual
    type NotificationType = 'info' | 'warning' | 'danger';
  // Tipe set tombol yang akan ditampilkan
    type ButtonSetType = 'ok' | 'yesno' | 'subcancel';
  // Tipe hasil yang akan dikembalikan, diekspor agar bisa digunakan di parent
    type DialogResult = 'ok' | 'yes' | 'no' | 'submit' | 'cancel';

  // Mendefinisikan props komponen, sekarang menggunakan 'children'
  let { 
    title = 'Pesan', 
    children,
    type = 'info' as NotificationType,
    buttonType = undefined,
    handleResult = (type: DialogResult) => {},
  } = $props<{
    title?: string;
    children?: Snippet; // Mengganti 'message' dengan 'children'
    type?: NotificationType;
    buttonType?: ButtonSetType;
    handleResult?: ((type: DialogResult) => void) | (() => void) | void;
  }>();

  // Menentukan kelas warna secara dinamis
  const colorClasses = $derived.by(() => {
    switch (type) {
      case 'warning':
        return {
          header: 'bg-yellow-500',
          button: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400'
        };
      case 'danger':
        return {
          header: 'bg-red-600',
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-400'
        };
      case 'info':
      default:
        return {
          header: 'bg-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-400'
        };
    }
  });

  // Fungsi untuk menangani klik tombol dan mengirim hasil

  // Kelas dasar untuk semua tombol
  const baseButtonClass = `
    w-full text-white font-bold text-xl py-3 rounded-2xl 
    active:translate-y-0.5 transition-all duration-150 ease-in-out 
    focus:outline-none focus:ring-4
  `;
</script>

<!-- Kontainer utama kartu notifikasi -->
<div class="fixed top-0 left-0 w-screen h-screen flex 
                items-center justify-center">
  <div class="">
    <div class="bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
      
      <!-- Header dengan warna dinamis -->
      <header class={`p-4 text-white text-3xl font-bold ${colorClasses.header}`}>
        {title}
      </header>
      
      <!-- Konten utama dengan pesan dan tombol -->
      <main class="p-8 text-center">
        <!-- Konten sekarang dirender dari children -->
        <div class="text-white text-2xl min-h-[6rem] flex flex-col items-center justify-center">
          {#if children}
            {@render children()}
          {/if}
        </div>
        
        <!-- Kontainer untuk tombol-tombol -->
        <div class="mt-6 flex justify-center gap-4">
          <!-- Menampilkan tombol berdasarkan buttonType -->
          {#if buttonType}
            {#if buttonType === 'ok'}
              <button onclick={() => {handleResult('ok'); }} class={`${baseButtonClass} max-w-[200px] ${colorClasses.button}`}>
                OK
              </button>
            {:else if buttonType === 'yesno'}
              <button onclick={() => {handleResult('no'); }} class={`${baseButtonClass} bg-slate-500 hover:bg-slate-600 focus:ring-slate-400`}>
                No
              </button>
              <button onclick={() => {handleResult('yes'); }} class={`${baseButtonClass} ${colorClasses.button}`}>
                Yes
              </button>
            {:else if buttonType === 'subcancel'}
              <button onclick={() => {handleResult('cancel'); }} class={`${baseButtonClass} bg-slate-500 hover:bg-slate-600 focus:ring-slate-400`}>
                Cancel
              </button>
              <button onclick={() => {handleResult('submit'); }} class={`${baseButtonClass} ${colorClasses.button}`}>
                Submit
              </button>
            {/if}
          {/if}
        </div>
      </main>
    </div>
  </div>
</div>