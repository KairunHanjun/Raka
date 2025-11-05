<script lang="ts">
	import logo from "$lib/assets/logo.png?enhanced";
    import offlineGif from "$lib/assets/offline.gif?enhanced";
	import { twMerge } from "tailwind-merge";
	import SelamatDatang from "$lib/comp/selamatDatang.svelte";
	import { enhance } from "$app/forms";
    import type { PageProps } from "./$types";
	import MessageBox from "$lib/comp/messageBox.svelte";
    import { page } from '$app/state'
	import { goto } from "$app/navigation";

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



    let { data }: PageProps = $props();
    let dataLogin: DataLogin | undefined= $state();
    const buttonText = ["Front Office", "House Keeping", "Teknisi", "Host"]
    const selamatDatangtext = ["Selamat Datang", "Login Sebagai"]
    let mergeClass1 = $state(twMerge ("flex group bg-slate-200 text-indigo-600 font-bold px-6 py-2.5 rounded-full border-b-8 border-indigo-400 hover:border-indigo-500 active:border-b-2 active:translate-y-1 transition-all duration-150 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300 w-full px-20 mt-2 text-center items-center justify-center"));
    let back: boolean = $state(false);
    let selamatText: Array<string> = $state([selamatDatangtext[0], selamatDatangtext[1]]);
    let newMsgBox: MsgBox | undefined = $state(undefined);
    let submiting: boolean = $state(false);

    function checkIfExpired(){
        if(page.url.searchParams.get("reason")){
            newMsgBox = {
                Title: "Sesi berakhir",
                Message: "Sesi anda telah berakhir, harap login ulang",
                NotificationType: "warning",
                ButtonType: 'ok',
                Action: () => {
                    goto("/");
                    newMsgBox = undefined!;
                }
            }
        }
    }

    checkIfExpired();
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
        <SelamatDatang sayText1={"Anda Sedang Offline"} text2Say={"Silahkan koneksikan kembali perangkat anda ke internet"} text1Bold={true} text1Size="2rem" text2Size="1rem" class="text-white"/>
    </div>
    
</div>
