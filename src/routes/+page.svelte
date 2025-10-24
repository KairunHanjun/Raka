<script lang="ts">
	import logo from "$lib/assets/logo.png?enhanced";
	import { twMerge } from "tailwind-merge";
	import SelamatDatang from "$lib/comp/selamatDatang.svelte";
	import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";
	import MessageBox from "$lib/comp/messageBox.svelte";

    interface MsgBox {
        Title?: string;
        Message?: string;
        NotificationType?: 'info' | 'warning' | 'danger';
        ButtonType?: 'ok' | 'yesno' | 'subcancel';
        Action?: (() => {}) | (() => void) | ((result: any) => void);
    }
    
    type DataLogin = {
        username: string;
        password: string;
        session: string;
    }



    let { data, form }: PageProps = $props();
    let dataLogin: DataLogin | undefined= $state();
    const buttonText = ["Front Office", "House Keeping", "Teknisi", "Host"]
    const selamatDatangtext = ["Selamat Datang", "Login Sebagai"]
    let mergeClass1 = $state(twMerge ("flex group bg-slate-200 text-indigo-600 font-bold px-6 py-2.5 rounded-full border-b-8 border-indigo-400 hover:border-indigo-500 active:border-b-2 active:translate-y-1 transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300 w-full px-20 mt-2 text-center items-center justify-center"));
    let back: boolean = $state(false);
    let selamatText: Array<string> = $state([selamatDatangtext[0], selamatDatangtext[1]]);
    let newMsgBox: MsgBox | undefined = $state(undefined);
    let submiting: boolean = $state(false);
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">

{#if newMsgBox}
    <MessageBox title={newMsgBox?.Title} type={newMsgBox.NotificationType} buttonType={newMsgBox.ButtonType} handleResult={newMsgBox.Action}>
        <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
            <p class=" text-amber-300">{newMsgBox?.Message}</p>
        </div>
    </MessageBox>
{/if}


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
                <div class="bg-slate-200 p-8 md:p-12 rounded-3xl shadow-lg w-full max-w-md border border-slate-300">
                    <form onsubmit={() => {
                        submiting = true;
                        newMsgBox = {
                            Title: "Loadin",
                            Message: "Harap tunggu",
                            NotificationType: 'info',
                            ButtonType: 'ok',
                            Action: () => {
                            }
                        }
                    }} class="flex flex-col gap-6" method="post" use:enhance={() => {
                        return async ({update}) => {
                            newMsgBox = undefined!;
                            await update();
                            if(form?.error){
                                newMsgBox = {
                                    Title: "Gagal Login",
                                    Message: form?.error,
                                    NotificationType: 'danger',
                                    ButtonType: 'ok',
                                    Action: () => {
                                        submiting=false;
                                        newMsgBox = undefined!;
                                    }
                                }
                            }
                        }
                    }}>
                        
                        <!-- Username Input -->
                        <div>
                            <label for="username" class="block text-lg font-semibold text-slate-700 mb-2">
                                Username :
                            </label>
                            <input 
                                type="text" 
                                name="username"
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
                                name="password"
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
                                disabled={submiting}
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
            {/if}
        </div>
    </div>
</div>
