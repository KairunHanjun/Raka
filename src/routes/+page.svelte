<script lang="ts">
	import logo from "$lib/assets/logo.png?enhanced";
	import { twMerge } from "tailwind-merge";
	import SelamatDatang from "$lib/comp/selamatDatang.svelte";
	import LoginForm from "$lib/comp/loginForm.svelte";
    import type { PageProps } from './$types';
    
    type DataLogin = {
        username: string;
        password: string;
        session: string;
    }


    let { data }: PageProps = $props();
    let dataLogin: DataLogin | undefined= $state();
    const buttonText = ["Front Office", "House Keeping", "Teknisi", "Host"]
    const selamatDatangtext = ["Selamat Datang", "Login Sebagai"]
    let mergeClass1 = $state(twMerge ("flex group bg-slate-200 text-indigo-600 font-bold px-6 py-2.5 rounded-full border-b-8 border-indigo-400 hover:border-indigo-500 active:border-b-2 active:translate-y-1 transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300 w-full px-20 mt-2 text-center items-center justify-center"));
    let back: boolean = $state(false);
    let selamatText: Array<string> = $state([selamatDatangtext[0], selamatDatangtext[1]]);

</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">

<div class="flex-col justify-center items-center text-center object-center w-screen h-fit">
    <enhanced:img src={logo} alt="LOGO" width=200 height=200 class="mx-auto" />
    <div class="flex w-screen h-fit items-center justify-center text-center p-2 mt-20">
        <SelamatDatang sayText1={selamatText[0]} text2Say={selamatText[1]} text1Bold={true} text1Size="2rem" text2Size="1rem" class="text-white"/>
    </div>
    <div class="flex w-screen h-fit items-center justify-center text-center ">
        <div class="flex-col w-fit h-fit items-center justify-center text-center place-content-center object-center">
            {#if !back}
                {#each buttonText as bText}
                    <button class={mergeClass1} onclick={() => {
                        back = !back;
                        selamatText = [bText, "Masukan Akun"]
                    }}>
                        <p>{bText}</p>
                    </button>
                {/each}
            {:else}
                <LoginForm action="?/login" selamatText={selamatText} back={back} dataLogin={dataLogin}/>
            {/if}
        </div>
    </div>
</div>
