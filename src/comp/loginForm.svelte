<script lang="ts">
  // Svelte state runes to hold the form input values
  let username = $state('');
  let password = $state('');
  let { object = {back: true, selamatText: []} } = $props();
  function handleLogin(){

  }

</script>

<div class="bg-slate-200 p-8 md:p-12 rounded-3xl shadow-lg w-full max-w-md border border-slate-300">
  <form onsubmit={handleLogin} class="flex flex-col gap-6">
    
    <!-- Username Input -->
    <div>
      <label for="username" class="block text-lg font-semibold text-slate-700 mb-2">
        Username :
      </label>
      <input 
        type="text" 
        id="username"
        bind:value={username}
        class="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
      />
    </div>

    <!-- Password Input -->
    <div>
      <label for="password" class="block text-lg font-semibold text-slate-700 mb-2">
        Password :
      </label>
      <input 
        type="password" 
        id="password"
        bind:value={password}
        class="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
      />
    </div>

    <!-- Action Buttons -->
    <div class="mt-4 flex items-center justify-between gap-4">
      <!-- Back Button -->
      <button 
        type="button" 
        onclick={() => {
            object.back = false;
            object.selectedText = ["Selamat Datang", "Login Sebagai"]
        }}
        class="
          w-full bg-slate-400 text-white font-bold
          text-xl py-4 rounded-full
          hover:bg-slate-500
          active:translate-y-0.5
          transition-all duration-150 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-slate-300
        "
      >
        Back
      </button>

      <!-- Login Button -->
      <button 
        type="submit"
        class="
          w-full bg-blue-500 text-white font-bold
          text-xl py-4 rounded-full
          shadow-lg shadow-blue-500/40
          hover:bg-blue-600
          active:translate-y-0.5
          transition-all duration-150 ease-in-out
          focus:outline-none focus:ring-4 focus:ring-blue-300
        "
      >
        Login
      </button>
    </div>
  </form>
</div>

