<script lang="ts">
  // Svelte state runes to hold the form input values
  import { enhance } from "$app/forms";

  type DataLogin = {
    username: string;
    password: string;
    session: string;
  }

  let { 
    back = true, 
    selamatText = [],
    onsubmit: handleLogin = () => {},
    dataLogin = {username: '', password: '', session: ''}
  } = $props<{
    dataLogin?: DataLogin
    back?: boolean;
    selamatText?: Array<string>;
    onsubmit?: void | (() => void) | (() => {});
  }>();
  

</script>

<div class="bg-slate-200 p-8 md:p-12 rounded-3xl shadow-lg w-full max-w-md border border-slate-300">
  <form onsubmit={handleLogin} class="flex flex-col gap-6" method="post" use:enhance>
    
    <!-- Username Input -->
    <div>
      <label for="username" class="block text-lg font-semibold text-slate-700 mb-2">
        Username :
      </label>
      <input 
        type="text" 
        id="username"
        bind:value={dataLogin.username}
        class="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
        required
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
        bind:value={dataLogin.password}
        class="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 bg-white focus:outline-none focus:ring-4 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200"
        required
        />
    </div>

    <!-- Action Buttons -->
    <div class="mt-4 flex items-center justify-between gap-4">
      <!-- Back Button -->
      <button 
        type="button" 
        onclick={() => {
            back = false;
            selamatText = ["Selamat Datang", "Login Sebagai"]
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

