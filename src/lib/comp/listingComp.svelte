    <script lang="ts">
	import type { Snippet } from "svelte";

  /**
   * Tipe data untuk setiap item unit.
   */
  type UnitItem = {
    id: number | string;
    name: string;
    name2: string;
    event: void | (() => {}) | (() => void) | any;
    editEvent: void | (() => {}) | (() => void) | any;
  };


  // Mendefinisikan props menggunakan Svelte 5 Runes
  let {
    title = 'Default',
    items = {id: 1, name: 'default', name2: '', event: (() => {})},
    onclick: mainButton = () => {},
    editable = false,
    ifItems = false,
    ifOther = false,
    itemEdit = false,
    disableAddButton = false,
    selectedItemsID = -1,
    children,
  } = $props<{
    title?: String;
    items?: UnitItem[];
    onclick?: void | (() => {}) | (() => void);
    edit?: void | ((itemsId: any) => {}) | ((itemsId: any) => void) ;
    editable?: boolean;
    ifItems: boolean;
    ifOther: boolean;
    children?: Snippet;
    itemEdit: boolean;
    selectedItemsID?: number;
    disableAddButton?: boolean;
  }>();
</script>

<!-- Kontainer Utama -->
<div class="bg-slate-800 w-full max-w-sm max-w rounded-3xl p-6 shadow-2xl border border-slate-700 flex flex-col h-[40rem]">
  
  <!-- Judul Form -->
  <h1 class="text-white text-4xl font-bold text-center mb-6">
    {title}
  </h1>

  <!-- Kontainer Daftar dengan Scroll -->
  <div class=" flex-grow {ifOther || itemEdit ? 'bg-amber-100' : 'bg-slate-900'} rounded-2xl p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
    {#if ifOther && !ifItems && children && !itemEdit}
        {@render children?.()}
    {/if}
    {#if ifItems && !ifOther && !itemEdit}
        {#if items && !itemEdit}
          {#each items as item (item.id)}
              <!-- Item dalam Daftar -->
              {#if editable}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class={`
                w-full text-white flex justify-center text-3xl font-bold p-5 rounded-2xl
                    bg-gradient-to-b from-blue-500 to-blue-700
                    shadow-md hover:shadow-lg
                    active:translate-y-0.5
                    transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-4 focus:ring-blue-400
                `} onclick={item.event}>
                  <div class="flex flex-col w-fit h-fit justify-center items-center text-center">
                    <p class=" font-bold text-[2rem] text-center">{item.name}</p>
                    {#if item.name2 != ""}
                      <p class=" text-[1rem] text-center">{item.name2}</p>
                    {/if}
                  </div>
                  <button 
                      onclick={item.editEvent}
                      class="hover:bg-blue-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white z-255"
                      aria-label="Edit {item.name}"
                  >
                      <!-- Ikon Pengaturan (SVG) -->
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                      <path d="M0 0 C5.80142431 3.68167312 8.86857617 8.46968018 11 15 C12.13364646 22.57078681 11.38724944 29.60294915 7 36 C2.14284265 41.39454498 -2.38188013 44.51670839 -9.6875 45.28125 C-17.18157036 45.66360053 -22.90029895 44.49337408 -29 40 C-34.34885904 34.69552983 -36.61820937 29.12333883 -37.3125 21.625 C-36.66025853 14.05899896 -34.34302435 8.28700991 -29.0859375 2.73046875 C-20.36483673 -4.50445193 -9.9742556 -4.5607191 0 0 Z " fill="#F44437" transform="translate(37,3)"/>
                      <path d="M0 0 C2.86697492 1.28519565 4.97607712 2.57129254 7 5 C7 5.66 7 6.32 7 7 C10.96 3.535 10.96 3.535 15 0 C16.65 1.32 18.3 2.64 20 4 C18.70700306 6.88437779 17.34058637 8.87219421 15 11 C16.01889939 13.27292941 16.80902631 14.83024561 18.6875 16.5 C20 18 20 18 19.9375 20.0625 C18.73944098 22.53848865 17.51570636 23.02617818 15 24 C14.2575 23.154375 13.515 22.30875 12.75 21.4375 C10.35481767 18.79043429 10.35481767 18.79043429 7.9375 18.9375 C5.50607372 20.2708628 3.85098018 21.95070051 2 24 C-1.16115776 22.63016497 -1.9927092 22.0109362 -4 19 C-2.02 17.02 -0.04 15.04 2 13 C0.47291037 9.56404834 -1.59927045 6.88087546 -4 4 C-2.68 2.68 -1.36 1.36 0 0 Z " fill="#FEF8F8" transform="translate(16,12)"/>
                      </svg>
                  </button>
                </div>
              {:else}
                <button class="
                  w-full text-white flex-col text-3xl font-bold p-5 rounded-2xl
                    bg-gradient-to-b from-blue-500 to-blue-700
                    shadow-md hover:shadow-lg
                    active:translate-y-0.5
                    transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-4 focus:ring-blue-400
                  "
                  onclick={item.event}
                >
                  <p class=" font-bold text-[2rem] text-center">{item.name}</p>
                  {#if item.name2 != ""}
                    <p class=" text-[1rem] text-center">{item.name2}</p>
                  {/if}
                </button>
              {/if}
          {/each}
        {:else}
        <div class="text-slate-500 text-center py-10">
            Tidak ada unit.
        </div>
        {/if}
      {#if !disableAddButton}
        <div class="mt-auto">
            <button
            onclick={mainButton}
            class="w-full justify-center item-center flex bg-blue-600  py-4 rounded-2xl hover:bg-blue-700 active:translate-y-0.5 transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-400"
            aria-label="i">
              <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 122.875 122.648" enable-background="new 0 0 122.875 122.648" xml:space="preserve"><g><path fill-rule="evenodd" clip-rule="evenodd" d="M108.993,47.079c7.683-0.059,13.898,6.12,13.882,13.805 c-0.018,7.683-6.26,13.959-13.942,14.019L75.24,75.138l-0.235,33.73c-0.063,7.619-6.338,13.789-14.014,13.78 c-7.678-0.01-13.848-6.197-13.785-13.818l0.233-33.497l-33.558,0.235C6.2,75.628-0.016,69.448,0,61.764 c0.018-7.683,6.261-13.959,13.943-14.018l33.692-0.236l0.236-33.73C47.935,6.161,54.209-0.009,61.885,0 c7.678,0.009,13.848,6.197,13.784,13.818l-0.233,33.497L108.993,47.079L108.993,47.079z"/></g></svg>
            </button>
        </div>
      {/if}
      {:else if itemEdit && selectedItemsID >= 0}
        {@render children?.()}
    {/if}
  </div>
</div>

<style>
  /* Plugin tambahan untuk scrollbar (membutuhkan `tailwindcss-scrollbar`) */
  /* Jika tidak menggunakan plugin, scrollbar akan menjadi default browser */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #3d3a3ae5;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #242323e5;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: #3d3a3ae5;
    border-radius: 10px;
    border: 3px solid #242323e5;
  }

  /* Animasi sederhana untuk item daftar */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
