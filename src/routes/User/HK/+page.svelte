<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
	import ActionCard from "$lib/comp/actionCard.svelte";
	import Header from "$lib/comp/header.svelte";
	import ListingComp from "$lib/comp/listingComp.svelte";
	import MessageBox from "$lib/comp/messageBox.svelte";
	import TopActionCard from "$lib/comp/topActionCard.svelte";
    import type { PageProps } from "./$types";
    let { data, form }: PageProps = $props();

    const editOther: string[] = $state([]);
    const accountTypeMap = {
        'FO': 'Front Office',
        'HK': 'House Keeping',
        'T': 'Teknisi',
        'H': 'Host'
    };

    const rooms: Array<{
        id: string;
        name: string;
        times: string;
        state: string;
        pending: boolean;
        kebersihan: string | null;
    }> = $state([]);

    const newMsgBox: Array<{
        Title?: string;
        Message?: string;
        NotificationType?: 'info' | 'warning' | 'danger';
        ButtonType?: 'ok' | 'yesno' | 'subcancel';
        Action?: (() => {}) | (() => void) | ((result: any) => void);
    }> = $state([]);

    const Items: Array<{
        id: number | string | any;
        name: string | any;
        name2: string | any;
        event: void | (() => {}) | (() => void) | any;
        editEvent: void | (() => {}) | (() => void) | any;
    }> = $state([]);

    function emptiedArray(arrayHere: Array<any>){
        while(arrayHere.length > 0) {
            arrayHere.pop();
        }
    }

    function deleteArray(arrayHere: Array<any>, idToDelete: string){
        const theIndex: number = arrayHere.findIndex(
            item => item.Title?.toLowerCase() === idToDelete.toLowerCase()
        );
        if( theIndex != -1){
            arrayHere.splice(theIndex, 1);
        }
    }

    function refreshData() {
        if(data){
            emptiedArray(Items);
            emptiedArray(rooms);
            data.dataUnits?.forEach(data => {
                Items.push({
                    id: data.id,
                    name: data.nameUnit.toLocaleUpperCase(),
                    name2: (data.fromTime && data.toTime) ? data.fromTime + " - " + data.toTime : null,
                    event: (() => {
                        edit = true;
                        editName = data.nameUnit;
                    }),
                    editEvent: (() => {
                        
                    })
                });
                rooms.push({
                    id: data.id,
                    name: data.nameUnit,
                    times: (data.fromTime && data.toTime) ? data.fromTime + " - " + data.toTime : '',
                    state: data.unitState ?? '',
                    pending: data.pending ?? false,
                    kebersihan: data.kebersihan,
                });
            })
        }
        rooms.sort((a, b) => {
            // StandBy should come first
            if (a.state === 'StandBy' && b.state !== 'StandBy') return -1;
            if (a.state !== 'StandBy' && b.state === 'StandBy') return 1;
            return 0; // keep original order otherwise
        });
    }

    function formatTime(value: number) {
        return value < 10 ? `0${value}` : value.toString();
    }

    function parseTimeStringToHoursMinutes(timeString: string, addHours: number = 0, addMinutes: number = 0): { hours: number; minutes: number } | null {
        // Regular expression to match "HH:MM" or "HH:MM AM/PM"
        const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
        const match = timeString.match(timeRegex);

        if (!match) {
            return null;
        }
        let hours = parseInt(match[1], 10) + addHours;
        const minutes = parseInt(match[2], 10) + addMinutes;
        
        // Basic validation for hours and minutes
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) hours = hours - 24

        return { hours, minutes };
    }

    function updateDataToTime(): string{
        if(!bindThisSelect?.value.includes("Kustom")){
            const udin = parseTimeStringToHoursMinutes(bindThisInput?.value ?? "", parseInt(bindThisSelect?.value ?? "0", 10));
            if(udin){
                return ((udin.hours < 10) ? "0" : "") + udin.hours + ":" + ((udin.minutes < 10) ? "0" : "") + udin.minutes;
            }
        }
        return "";
    }

    let loading: boolean = false;
    let edit: boolean = $state(false);
    let editName: string = $state("");
    let editId: string = $state("");
    let editAny: any | undefined = $state(undefined);
    let menuClick: string | undefined = $state(undefined);
    let bindThisSelect: HTMLSelectElement | undefined = $state(undefined);
    let bindThisInput: HTMLInputElement | undefined = $state(undefined);
    let bindThisSubmit: HTMLButtonElement | undefined = $state(undefined);
    let now: Date = $state(new Date());
    let hours = $derived(now.getHours());
    let minutes = $derived(now.getMinutes());
    let updateWaktu = $state('');
    let JamorHari = $state("");
    let submiting = $state(false);
    let error = $state(false);
    let lihatAbsen: boolean = $state(false);
    let editApprove: string | undefined = $state(undefined);

    $effect(() => {
        const timer = setInterval(() => {
            now = new Date();
        }, 1000);
        // Membersihkan interval saat komponen dihancurkan
        return () => clearInterval(timer);
    });

    refreshData();
</script>

{#if ((form?.error) || (data?.error))}
    {error = true}
    {#if error}
        <MessageBox title="Masalah Terjadi!" type="warning" buttonType="ok" handleResult={() => {
            error = false;
        }}>
            <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
                {#if form?.error}
                    <p class=" font-bold">Masukan Error: </p>
                    <p class=" text-amber-300">{form?.error}</p>
                {/if}
                {#if data?.description}
                    <p class=" font-bold">Masukan Error: </p>
                    <p class=" text-amber-300">{data?.description}</p>
                {/if}
            </div>
        </MessageBox>
    {/if}
{/if}

{#if newMsgBox.length > 0}
    {#each newMsgBox as msgBox}
        <MessageBox title={msgBox?.Title} type={msgBox.NotificationType} buttonType={msgBox.ButtonType} handleResult={msgBox.Action}>
            <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
                <p class=" text-amber-300">{msgBox?.Message}</p>
            </div>
        </MessageBox>
    {/each}
{/if}

<div class="h-fit w-screen flex flex-col justify-center! items-center gap-4">
    <Header name={data?.userNow.username.toUpperCase() ?? "User"} onclick={() => {
        emptiedArray(editOther);
        if(lihatAbsen){
            lihatAbsen = false;
            return;
        }
        if(edit){
            edit = false;
            return;
        }
        if(menuClick) {
            menuClick = undefined;
            return;
        }
        newMsgBox.push({
            Title: "Keluar",
            Message: "Apakah yakin ingin keluar?",
            NotificationType: 'warning',
            ButtonType: 'yesno',
            Action: async (result: any) => {
                if(result){
                    if(result === 'yes' && !loading){
                        loading = true;
                        try{
                            await fetch('/logout', {
                                method: 'GET'
                            });
                            loading = false;
                            deleteArray(newMsgBox, "Keluar");
                            goto('/');
                        }catch (error) {console.log(error);}
                    }else if(result === 'no' && !loading){
                        deleteArray(newMsgBox, "Keluar");
                    }
                }
            }
        })
    }} />

{#if !menuClick}
    <div class="h-fit w-fit flex flex-col justify-center items-center gap-4">
        <TopActionCard label="Lihat Room" onclick={() => {
                menuClick = "Lihat Room";
            }}>
            <div class="flex w-full h-fit justify-between gap-2">
                <div class="flex flex-col w-full h-fit justify-between">
                    <div class="flex w-fit h-fit items-center object-center">
                        <div class="w-3 h-3 bg-green-600 rounded-sm me-2"></div>
                        <h2 class="text-white text-[15px] font-bold">Ready : {(rooms.filter(room => room.state === 'Ready').length)} Unit</h2>
                    </div>
                    <div class="flex w-fit h-fit items-center object-center">
                        <div class="w-3 h-3 bg-red-600 rounded-sm me-2"></div>
                        <h2 class="text-white text-[15px] font-bold">Used : {(rooms.filter(room => room.state === 'Working').length)} Unit</h2>
                    </div>
                </div>
                <div class="flex flex-col w-full h-fit justify-between">
                    <div class="flex w-fit h-fit items-center object-center">
                        <div class="w-3 h-3 bg-yellow-600 rounded-sm me-2"></div>
                        <h2 class="text-white text-[15px] font-bold">Process : {(rooms.filter(room => room.state === 'StandBy').length)} Unit</h2>
                    </div>
                    <div class="flex w-fit h-fit items-center object-center">
                        <div class="w-3 h-3 bg-gray-600 rounded-sm me-2"></div>
                        <h2 class="text-white text-[15px] font-bold">Closed : {(rooms.filter(room => room.state === 'Closed').length)} Unit</h2>
                    </div>
                </div>
            </div>
        </TopActionCard>
        <div class="h-fit w-full flex justify-between items-center gap-2">
            <ActionCard label="Input Masalah" class="bg-gradient-to-b from-red-600 via-red-700 to-red-800 p-3.5" onclick={() => {
                menuClick = "Input Masalah"
            }}>
                <svg width="95" height="95" viewBox="0 0 83 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.9794 0.272725L15.5945 51.196H2.5973L1.17685 0.272725H16.9794ZM9.09588 73.9233C6.75213 73.9233 4.73982 73.0947 3.05895 71.4375C1.37808 69.7566 0.549479 67.7443 0.573154 65.4006C0.549479 63.0805 1.37808 61.0919 3.05895 59.4347C4.73982 57.7775 6.75213 56.9489 9.09588 56.9489C11.3449 56.9489 13.3217 57.7775 15.0263 59.4347C16.7308 61.0919 17.5949 63.0805 17.6186 65.4006C17.5949 66.9631 17.1806 68.3954 16.3757 69.6974C15.5945 70.9759 14.5646 72.0057 13.2862 72.7869C12.0078 73.5445 10.611 73.9233 9.09588 73.9233ZM49.4013 0.272725L48.0163 51.196H35.0192L33.5987 0.272725H49.4013ZM41.5178 73.9233C39.174 73.9233 37.1617 73.0947 35.4808 71.4375C33.8 69.7566 32.9714 67.7443 32.995 65.4006C32.9714 63.0805 33.8 61.0919 35.4808 59.4347C37.1617 57.7775 39.174 56.9489 41.5178 56.9489C43.7668 56.9489 45.7436 57.7775 47.4482 59.4347C49.1527 61.0919 50.0168 63.0805 50.0405 65.4006C50.0168 66.9631 49.6025 68.3954 48.7976 69.6974C48.0163 70.9759 46.9865 72.0057 45.7081 72.7869C44.4297 73.5445 43.0329 73.9233 41.5178 73.9233ZM81.8232 0.272725L80.4382 51.196H67.4411L66.0206 0.272725H81.8232ZM73.9396 73.9233C71.5959 73.9233 69.5836 73.0947 67.9027 71.4375C66.2218 69.7566 65.3932 67.7443 65.4169 65.4006C65.3932 63.0805 66.2218 61.0919 67.9027 59.4347C69.5836 57.7775 71.5959 56.9489 73.9396 56.9489C76.1887 56.9489 78.1655 57.7775 79.87 59.4347C81.5746 61.0919 82.4387 63.0805 82.4624 65.4006C82.4387 66.9631 82.0244 68.3954 81.2195 69.6974C80.4382 70.9759 79.4084 72.0057 78.13 72.7869C76.8516 73.5445 75.4548 73.9233 73.9396 73.9233Z" fill="white"/>
                </svg>
            </ActionCard>
            <ActionCard label="Absensi" class="bg-gradient-to-b from-green-600 via-green-700 to-green-800 p-3.5" onclick={()=>{
                menuClick = "Absensi"
            }}>
                <svg width="95" height="95" viewBox="0 0 95 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="95" height="95" rx="47.5" fill="#EADDFF"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M61.7506 38C61.7506 45.8701 55.3706 52.25 47.5006 52.25C39.6305 52.25 33.2506 45.8701 33.2506 38C33.2506 30.1299 39.6305 23.75 47.5006 23.75C55.3706 23.75 61.7506 30.1299 61.7506 38ZM57.0006 38C57.0006 43.2467 52.7473 47.5 47.5006 47.5C42.2539 47.5 38.0006 43.2467 38.0006 38C38.0006 32.7533 42.2539 28.5 47.5006 28.5C52.7473 28.5 57.0006 32.7533 57.0006 38Z" fill="#4F378A"/>
                    <path d="M47.5006 59.375C32.1239 59.375 19.0226 68.4675 14.032 81.2061C15.2477 82.4133 16.5284 83.5553 17.8684 84.6261C21.5846 72.9308 33.2428 64.125 47.5006 64.125C61.7584 64.125 73.4165 72.9308 77.1328 84.6262C78.4727 83.5553 79.7534 82.4134 80.9692 81.2061C75.9786 68.4675 62.8773 59.375 47.5006 59.375Z" fill="#4F378A"/>
                </svg>
            </ActionCard>
        </div>
    </div>
{:else if menuClick === "Lihat Room"}
    <ListingComp disableAddButton={true} editable={false} items={[]} ifItems={false} ifOther={false} itemEdit={true} title={"Rooms"} selectedItemsID={0} onclick={() => {

    }}>
    {#if edit}
        <div class="flex w-full h-fit justify-center gap-2 bg-blue-950 rounded-2xl p-2">
            <h1 class=" text-2xl font-bold">{editName}</h1>
        </div>
        {#if !editOther[1]}
            <form onsubmit={async () => {
                    submiting=true;
                    newMsgBox.push({
                        Title: "Loading",
                        Message: "Harap Tunggu",
                        NotificationType: "info",
                        Action: () => {}
                    });
                }} action="?/keep" method="post" class="flex flex-col w-full h-fit gap-2" enctype="multipart/form-data" use:enhance={() => {
                    return async ({update}) => {
                        submiting = false;
                        await update();
                        deleteArray(newMsgBox, "Loading");
                        edit = false;
                        invalidateAll();
                        refreshData();
                        if(form?.success){
                            newMsgBox.push({
                                Title: "Berhasil",
                                Message: "Berhasil membersihkan unit",
                                NotificationType: 'info',
                                ButtonType: 'ok',
                                Action: () => {
                                    emptiedArray(editOther);
                                    deleteArray(newMsgBox, "Berhasil");
                                }
                            });
                        }else error = true;
                    }
                }}>
                <label for="name">Nama Staff: </label>
                <input type="text" name="name" id="name" value={data?.userNow.username} required readonly>
                <label for="jabatan">Jabatan: </label>
                <input type="text" name="jabatan" value={accountTypeMap[data?.userNow.accountType] || 'Tidak Dikenali'} id="" required readonly>
                <label for="jam">Jam: </label>
                <input type="text" name="jam" id="" value={(formatTime(hours)+":"+formatTime(minutes))} required readonly>
                {#if editName === "Tidak Approve"}
                    <label for="kebersihanId">Id Kebersihan Ruangan: </label>
                    <input type="text" name="kebersihanId" readonly>
                {/if}
                <label for="foto">Foto Ruangan:</label>
                <input type="file" id="foto" name="foto" accept="image/*" capture="environment"  required />           
                <label for="foto2">Foto Kamar Mandi:</label>
                <input type="file" id="foto" name="foto2" accept="image/*" capture="environment"  required /> 

                <input type="hidden" name="unit_id" value={editId}>
                <input type="hidden" name="accountType" value={data?.userNow.accountType}>

                <button disabled={submiting} type="button" class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"
                onclick={() => {
                    bindThisSubmit?.click();
                }}> SUBMIT </button>
                <button type="submit" class="hidden" bind:this={bindThisSubmit}>submit</button>
            </form>
        {:else}
            <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center gap-1">
                <div class="w-full h-fit flex justify-center justify-items-center items-center text-center gap-0.5">
                    <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center">
                        <p class="text-[1rem] font-bold">Ruangan</p>
                        <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${editAny.imgRuang}.jpg`} alt="">
                    </div>
                    <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center">
                        <p class="text-[1rem] font-bold">Kamar Mandi</p>
                        <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${editAny.imgMandi}.jpg`} alt="">
                    </div>
                </div>
                <p class="font-bold text-[1rem] text-center">{editAny.when.toString()}</p>
                <p class="font-bold text-2xl text-center">Sudah Approve? {(editAny.approve) ? "Sudah" : ((editAny.approve == null) ? "Sedang dinilai" : "Ditolak")}</p>
            </div>
        {/if}
    {:else}
        <div class="flex w-full h-fit justify-between gap-2 bg-blue-950 rounded-2xl p-2">
            <div class="flex flex-col w-full h-fit justify-between">
                <div class="flex w-fit h-fit items-center object-center">
                    <div class="w-3 h-3 bg-green-600 rounded-sm me-2"></div>
                    <h2 class="text-white text-[1rem] font-bold">Ready : {(rooms.filter(room => room.state === 'Ready').length)} Unit</h2>
                </div>
                <div class="flex w-fit h-fit items-center object-center">
                    <div class="w-3 h-3 bg-red-600 rounded-sm me-2"></div>
                    <h2 class="text-white text-[1rem] font-bold">Used : {(rooms.filter(room => room.state === 'Working').length)} Unit</h2>
                </div>
            </div>
            <div class="flex flex-col w-full h-fit justify-between">
                <div class="flex w-fit h-fit items-center object-center">
                    <div class="w-3 h-3 bg-yellow-600 rounded-sm me-2"></div>
                    <h2 class="text-white text-[1rem] font-bold">Process : {(rooms.filter(room => room.state === 'StandBy').length)} Unit</h2>
                </div>
                <div class="flex w-fit h-fit items-center object-center">
                    <div class="w-3 h-3 bg-gray-600 rounded-sm me-2"></div>
                    <h2 class="text-white text-[1rem] font-bold">Closed : {(rooms.filter(room => room.state === 'Closed').length)} Unit</h2>
                </div>
            </div>
        </div>
        {#each rooms as unit (unit.id)}
        <!-- DO SOMETHING WHEN CLICK OR NOT AND CHANGE COLOR BASED ON UNIT STATE -->
            {#if unit.state === 'StandBy' || unit.state === 'Ready'}
                <button class="
                w-full text-white flex-col text-3xl font-bold p-5 rounded-2xl
                bg-gradient-to-b {(unit.state == 'Ready') ? "from-green-500 to-green-700" : "from-yellow-500 to-yellow-700" }
                shadow-md hover:shadow-lg
                active:translate-y-0.5
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-4 focus:ring-blue-400
                "
                    onclick={() => {
                        editAny = data?.dataKebersihan?.find(x => x.id === unit.kebersihan);
                        if(!unit.pending || editAny.approve === false){
                            edit = true;
                            editId = unit.id;
                            editName = (editAny.approve === false) ? "Tidak Approve" : unit.name;
                            editApprove = editAny.id;
                            editOther.push(unit.state);
                            if(editAny.approve === false) newMsgBox.push({
                                Title: "Tidak Approve",
                                Message: "Maaf, ruangan ini belum di approve",
                                ButtonType: 'ok',
                                NotificationType: 'info',
                                Action: () => {
                                    deleteArray(newMsgBox, "Tidak Approve");
                                }
                            });
                        }
                        edit = true;
                        editId = unit.id;
                        editName = unit.name;
                        editOther.push(unit.state);
                        editOther.push("pending");
                    }}
                >
                    <p class=" font-bold text-[2rem] text-center">{unit.name}</p>
                    {#if unit.times != ""}
                    <p class=" text-[1rem] text-center">{unit.times}</p>
                    {/if}
                </button>
            {/if}
        {/each}
    {/if}
    </ListingComp> 
{:else if menuClick === "Input Masalah"}
    <ListingComp disableAddButton={true} title="Masalah" editable={false} items={[]} ifItems={false} ifOther={false} itemEdit={true} selectedItemsID={0} onclick={() => {

    }}>
        {#if edit}
            <div class="flex w-full h-fit justify-center gap-2 bg-blue-950 rounded-2xl p-2">
                <h1 class=" text-2xl font-bold">{editName}</h1>
            </div>
            <form onsubmit={async () => {
                submiting=true;
                newMsgBox.push({
                    Title: "Loading",
                    Message: "Harap Tunggu",
                    NotificationType: "info",
                    Action: () => {}
                });
            }} action="?/masalah" method="post" class="flex flex-col w-full h-fit gap-2" enctype="multipart/form-data" use:enhance={() => {
                return async ({update}) => {
                    submiting = false;
                    deleteArray(newMsgBox, "Loading");
                    deleteArray(newMsgBox, "Perhatian");
                    await update();
                    edit = false;
                    invalidateAll();
                    refreshData();
                    if(form?.success){
                        newMsgBox.push({
                            Title: "Berhasil",
                            Message: "Berhasil mengubah customer",
                            NotificationType: 'info',
                            ButtonType: 'ok',
                            Action: () => {
                                emptiedArray(editOther);
                                deleteArray(newMsgBox, "Berhasil");
                            }
                        });
                    }else error = true;
                }
            }}>
                <label for="name">Nama Staff: </label>
                <input type="text" name="name" id="name" value={data?.userNow.username} required readonly>
                <label for="jabatan">Jabatan: </label>
                <input type="text" name="jabatan" value={accountTypeMap[data?.userNow.accountType] || 'Tidak Dikenali'} id="" required readonly>
                <label for="jam">Jam: </label>
                <input type="text" name="jam" id="" value={(formatTime(hours)+":"+formatTime(minutes))} required readonly>
                {#if editOther[0] === 'Working'}
                    <label for="berat">Apakah masalahnya berat? Jika berat akan kami tutup unitnya: </label>
                    <input type="checkbox" name="berat" id="" bind:this={bindThisInput}>
                {/if}
                <label for="masalah">Masalah: </label>
                <textarea name="masalah" id="" rows="4" cols="50" required ></textarea>
                <label for="foto">Foto Masalah:</label>
                <input type="file" id="foto" name="foto" accept="image/*" capture="environment"  required />           
            
                <input type="hidden" name="unit_id" value={editId}>
                <input type="hidden" name="accountType" value={data?.userNow.accountType}>
                <button disabled={submiting} type="button" class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"
                onclick={() => {
                    if(bindThisInput?.checked){
                        newMsgBox.push({
                            Title: "Perhatian",
                            Message: `Akan kami tutup unit ${editName} ini! Jika didalamnya ada kustomer maka akan kami usir paksa kostumernya dari unit tersebut!, Apakah anda ingin melanjutkan?.`,
                            NotificationType: "warning",
                            ButtonType: 'yesno',
                            Action: (result: any) => {
                                if(result === "yes"){
                                    bindThisSubmit?.click();
                                    return;
                                }else if(result === "no"){
                                    deleteArray(newMsgBox, "Perhatian");
                                    return;
                                }
                            }
                        })
                    }
                    bindThisSubmit?.click();
                }}> SUBMIT </button>
                <button type="submit" class="hidden" bind:this={bindThisSubmit}>submit</button>
            </form>
        {:else}
            <div class="flex w-full h-fit justify-between gap-2 bg-blue-950 rounded-2xl p-2">
                <div class="flex flex-col w-full h-fit justify-between">
                    <div class="flex w-fit h-fit items-center object-center">
                        <div class="w-3 h-3 bg-green-600 rounded-sm me-2"></div>
                        <h2 class="text-white text-[1rem] font-bold">Ready : {(rooms.filter(room => room.state === 'Ready').length)} Unit</h2>
                    </div>
                    <div class="flex w-fit h-fit items-center object-center">
                        <div class="w-3 h-3 bg-red-600 rounded-sm me-2"></div>
                        <h2 class="text-white text-[1rem] font-bold">Used : {(rooms.filter(room => room.state === 'Working').length)} Unit</h2>
                    </div>
                </div>
                <div class="flex flex-col w-full h-fit justify-between">
                    <div class="flex w-fit h-fit items-center object-center">
                        <div class="w-3 h-3 bg-yellow-600 rounded-sm me-2"></div>
                        <h2 class="text-white text-[1rem] font-bold">Process : {(rooms.filter(room => room.state === 'StandBy').length)} Unit</h2>
                    </div>
                    <div class="flex w-fit h-fit items-center object-center">
                        <div class="w-3 h-3 bg-gray-600 rounded-sm me-2"></div>
                        <h2 class="text-white text-[1rem] font-bold">Closed : {(rooms.filter(room => room.state === 'Closed').length)} Unit</h2>
                    </div>
                </div>
            </div>
            {#each rooms as unit (unit.id)}
            <!-- DO SOMETHING WHEN CLICK OR NOT AND CHANGE COLOR BASED ON UNIT STATE -->
                <button class="
                    w-full text-white flex-col text-3xl font-bold p-5 rounded-2xl
                    bg-gradient-to-b {(unit.state == 'Ready') ? "from-green-500 to-green-700" : (unit.state == 'StandBy') ? "from-yellow-500 to-yellow-700" : (unit.state == 'Working') ? "from-red-500 to-red-700" : "from-gray-500 to-gray-700"}
                    shadow-md hover:shadow-lg
                    active:translate-y-0.5
                    transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-4 focus:ring-blue-400
                    "
                    onclick={() => {
                        if(unit.state === "Ready" || unit.state === "Working"){
                            edit = true;
                            editId = unit.id;
                            editName = unit.name;
                            editOther.push(unit.state);
                        }else{
                            newMsgBox.push({
                                Title: "Status Room",
                                Message: ((unit.state === "StandBy") ? "Ruangan sedang dalam kondisi belum siap" : ((unit.state === "Closed") ? "Ruangan Belum diperbaiki" : "Ruangan status tidak diketahui")),
                                NotificationType: 'warning',
                                ButtonType: 'ok',
                                Action: async (result: any) => {
                                    deleteArray(newMsgBox, "Status Room");
                                }
                            })
                        }
                    }}
                >
                <p class=" font-bold text-[2rem] text-center">{unit.name}</p>
                    {#if unit.times != ""}
                        <p class=" text-[1rem] text-center">{unit.times}</p>
                    {/if}
                </button>
            {/each}
        {/if}
    </ListingComp>
{:else if menuClick === "Absensi"}
    <ListingComp title="Absensi" disableAddButton={true} editable={false} items={[]} ifItems={false} ifOther={false} itemEdit={true} selectedItemsID={0} onclick={() => {

    }}>
    {#if !edit && !lihatAbsen}
        <div class=" flex flex-col justify-center items-center text-center flex-grow w-full h-fit bg-slate-900 rounded-2xl p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
            {#each data?.dataAbsensi as absen}
                <button class="
                    justify-center items-center text-center
                    flex w-fit h-fit text-white flex-col text-3xl font-bold p-5 rounded-2xl
                    bg-gradient-to-b from-green-500 via-green-600 to-green-700 
                    shadow-md hover:shadow-lg
                    active:translate-y-0.5
                    transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-4 focus:ring-blue-400
                    "
                    onclick={() => {
                        editId = absen.id;
                        editName = absen.name;
                        editOther.push(absen.fotoUrl);
                        editOther.push(absen.whenEntry.toString());
                        editOther.push(accountTypeMap[absen.accountType] || 'Tidak Dikenali');
                        lihatAbsen = true;
                    }}
                    aria-label="i"
                >

                    <p class="text-center font-bold text-[1rem] text-white">{absen.name.toUpperCase()}</p>
                    <p class="text-center text-[15px] text-white">{accountTypeMap[absen.accountType] || 'Tidak Dikenali'}</p>
                    <p class="text-center text-[15px] text-white">{absen.whenEntry.toLocaleDateString()} {absen.whenEntry.toLocaleTimeString()}</p>
                </button>
            {/each}
        </div>
        {#if !(data?.dataAbsensi?.some(data => data.whenEntry.toDateString() === (new Date()).toDateString())) || (data?.dataAbsensi.length == 0)}
            <button
                class="
                w-full text-white text-3xl font-bold p-5 rounded-2xl
                bg-gradient-to-b from-blue-500 to-blue-700
                shadow-md hover:shadow-lg
                active:translate-y-0.5
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-4 focus:ring-blue-400
                "
                onclick={() => {
                    edit = true;
                }}
            >
                Input Absensi
            </button>
        {/if}
    {:else if edit}
        <form 
            onsubmit={async () => {
                //submiting=true;
                newMsgBox.push({
                    Title: "Loading",
                    Message: "Harap Tunggu",
                    NotificationType: "info",
                    Action: () => {}
                });
            }}
            
        action="?/absen" method="post" class="flex flex-col w-full h-fit gap-2" enctype="multipart/form-data"
            use:enhance={() => {
                    return async ({update}) => {
                        submiting = false;
                        deleteArray(newMsgBox, "Loading");
                        await update();
                        edit = false;
                        invalidateAll();
                        refreshData();
                        if(form?.success){
                            newMsgBox.push({
                                Title: "Berhasil",
                                Message: "Berhasil mengubah customer",
                                NotificationType: 'info',
                                ButtonType: 'ok',
                                Action: () => {
                                    emptiedArray(editOther);
                                    deleteArray(newMsgBox, "Berhasil");
                                }
                            });
                        }else error = true;
                    }
                }
            }
        >
            <label for="name">Nama Staff: </label>
            <input type="text" name="name" id="name" value={data?.userNow.username} required readonly>
            <label for="jabatan">Jabatan: </label>
            <input type="text" name="jabatan" value={accountTypeMap[data?.userNow.accountType] || 'Tidak Dikenali'} id="" required readonly>
            <label for="jam">Jam: </label>
            <input type="text" name="jam" id="" value={(formatTime(hours)+":"+formatTime(minutes))} required readonly>
            <label for="foto">Foto Absensi:</label>
            <input type="file" id="foto" name="foto" accept="image/*" capture="user"  required />           
        
            <input type="hidden" name="unit_id" value={editId}>
            <input type="hidden" name="accountType" value={data?.userNow.accountType}>
            <button disabled={submiting} type="submit" class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"> SUBMIT </button>
        </form>
    {:else if lihatAbsen}
        <div class=" flex-grow bg-slate-900 rounded-2xl p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
            <div class="flex flex-col bg-transparent h-fit w-full justify-items-center justify-center items-center text-center">
                <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${editOther[0]}.jpg`} alt={`Foto Absen ${editName}`} class=" rounded-2xl">
                <p class="text-center font-bold text-[1rem] text-white">Nama: {editName}</p>
                <p class="text-center text-[15px] text-white">Jabatan: {editOther[2]}</p>
                <p class="text-center text-[15px] text-white">Waktu: {editOther[1]}</p>
            </div>
        </div>
    {/if}
    </ListingComp>
{/if}
</div>

<svelte:window on:focus={() => {
    invalidateAll();
    refreshData();
}} />