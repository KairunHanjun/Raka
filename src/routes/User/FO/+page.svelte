<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
	import ActionCard from "$lib/comp/actionCard.svelte";
	import Header from "$lib/comp/header.svelte";
	import ListingComp from "$lib/comp/listingComp.svelte";
	import MessageBox from "$lib/comp/messageBox.svelte";
	import TopActionCard from "$lib/comp/topActionCard.svelte";
	import { onMount } from "svelte";
    import type { PageProps } from "./$types";
	import { browser } from "$app/environment";
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
                    kebersihan: data.kebersihan
                });
            })
        }
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
    let bindThisButton: HTMLButtonElement | undefined = $state(undefined);
    let isOnline: boolean = $state(true);

    $effect(() => {
		const interval = setInterval(async () => {
			isOnline = navigator.onLine;
		}, 1000); // every 0.5 minutes

		return () => clearInterval(interval);
	});

    $effect(() => {
        const timer = setInterval(() => {
            now = new Date();
        }, 1000);
        // Membersihkan interval saat komponen dihancurkan
        return () => clearInterval(timer);
    });

    $effect(() => {
		const interval = setInterval(async () => {
			if (navigator.onLine) {
				try {
					await invalidateAll();
					refreshData();
				} catch (err) {}
			} else {
			}
		}, 5 * 60 * 1000); // every 5 minutes

		return () => clearInterval(interval);
	});

    onMount(() => {
        if(browser){
            let online = navigator.onLine;
            window.addEventListener('online', () => (online = true));
            window.addEventListener('offline', () => (online = false));
            // Intercept F5 / Ctrl+R / Cmd+R when offline
            const blockReloadKeys = (e: KeyboardEvent) => {
                const isReloadKey =
                    e.key === 'F5' ||
                    ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r');

                if (!navigator.onLine && isReloadKey) {
                    e.preventDefault();
                }
            };

            window.addEventListener('keydown', blockReloadKeys);

            return () => {
                window.removeEventListener('keydown', blockReloadKeys);
            };
        }
    });

    refreshData();
</script>

{#if !isOnline}
    <MessageBox title={"Offline Mode"} type={'warning'} handleResult={() => {}}>
        <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
            <p class=" text-amber-300">Anda terputus dari koneksi internet, silahkan hubungkan kembali koneksi internet anda</p>
        </div>
    </MessageBox>
{/if}

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
        {#if editOther[0] === "Ready"}
            <form onsubmit={() => {
                submiting=true;
                newMsgBox.push({
                    Title: "Loading",
                    Message: "Harap Tunggu",
                    NotificationType: "info",
                    Action: () => {}
                })
                
            }} action="?/costumer" method="post" class="flex flex-col w-full h-fit gap-2" enctype="multipart/form-data" use:enhance={async () => {
                return async ({update}) => {
                    submiting = false;
                    deleteArray(newMsgBox, "Loading");
                    await update();
                    edit = false;
                    await invalidateAll();
                    if(form?.success){
                        newMsgBox.push({
                            Title: "Berhasil",
                            Message: "Berhasil menambahkan customer",
                            NotificationType: 'info',
                            ButtonType: 'ok',
                            Action: () => {
                                emptiedArray(editOther);
                                refreshData()
                                deleteArray(newMsgBox, "Berhasil");
                            }
                        });
                    }else error = true;
                }
            }}>
                <label for="name">Nama Customer: </label>
                <input type="text" name="name" id="name" required>
                <label for="duration">Lama: </label>
                <select name="duration" id="duration" bind:this={bindThisSelect} onchange={() => {
                    updateWaktu = updateDataToTime();
                    JamorHari = bindThisSelect?.options[bindThisSelect.selectedIndex].text ?? '';
                }} required>
                    <option value="3">3 Jam</option>
                    <option value="6">6 Jam</option>
                    <option value="9">9 Jam</option>
                    <option value="12">12 Jam</option>
                    <option value="24">24 Jam</option>
                    <option value="0">Kostum Jam</option>
                    <option value="9999">Kostum Hari</option>
                </select>
                {#if JamorHari !== "Kostum Hari"}
                    <div class="flex justify-between items-center h-fit w-full">
                        <div class="flex flex-col h-fit w-fit">
                            <label for="enter">Jam Masuk: </label>
                            <input type="time" name="enter" id="" bind:this={bindThisInput} onchange={() => updateWaktu = updateDataToTime()} required>
                        </div>
                        
                        <div class="flex flex-col h-fit w-fit">
                            <label for="out">Jam Keluar: </label>
                            <input type="time" name="out" id="" readonly={bindThisSelect?.options[bindThisSelect?.selectedIndex].text !== "Kostum Jam"} value={updateWaktu} required>
                        </div>
                    </div>
                {:else}
                    <div class="flex flex-col justify-between items-center h-fit w-full">
                        <div class="flex flex-col h-fit w-fit">
                            <label for="enter">Hari Masuk: </label>
                            <input type="date" name="enter" id="" required>
                        </div>
                        
                        <div class="flex flex-col h-fit w-fit">
                            <label for="out">Hari Keluar: </label>
                            <input type="date" name="out" id="" required>
                        </div>
                    </div>
                {/if}
                <label for="agent">Pilih Agent: </label>
                <select name="agent" id="" required>
                    {#each data?.dataAgents as agent}
                        <option value={agent.id + "|" + agent.createdByWho}>{agent.nameAgent} (Host: {agent.createdByWho})</option>
                    {/each}
                </select>
                <label for="price">Input Harga: </label>
                <input type="number" name="price" pattern="[0-9]*" id="" required>
                <label for="ktp">Foto KTP:</label>
                <input type="file" id="ktp" name="ktp" accept="image/*" capture="environment" required />           
                <input type="hidden" name="unit_id" value={editId}>
                <button disabled={submiting} type="submit" class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"> SUBMIT </button>
            </form>
        {:else if editOther[0] === "Working"}
            <form onsubmit={() => {
                submiting=true;
                newMsgBox.push({
                    Title: "Loading",
                    Message: "Harap Tunggu",
                    NotificationType: "info",
                    Action: () => {}
                })
                
            }} action="?/editcostumer" method="post" class="flex flex-col w-full h-fit gap-2" enctype="multipart/form-data" use:enhance={async () => {
                return async ({update}) => {
                    submiting = false;
                    deleteArray(newMsgBox, "Loading");
                    await update();
                    edit = false;
                    await invalidateAll();
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
                <p>Nama Customer: {editOther[1]}</p>
                <input type="hidden" name="unit_id" value={editId}>
                <label for="duration">Lama: </label>
                <select name="duration" id="duration" bind:this={bindThisSelect} onchange={() => {
                    updateWaktu = updateDataToTime();
                    JamorHari = bindThisSelect?.options[bindThisSelect.selectedIndex].text ?? '';
                }}>
                    {JamorHari = bindThisSelect?.options[bindThisSelect.selectedIndex].text ?? ''}
                    <option value="">Ubah Status Room</option>
                    <option value="3">3 Jam</option>
                    <option value="6">6 Jam</option>
                    <option value="9">9 Jam</option>
                    <option value="12">12 Jam</option>
                    <option value="24">24 Jam</option>
                    <option value="0">Kostum Jam</option>
                    <option value="9999">Kostum Hari</option>
                </select>
                {#if JamorHari === "Ubah Status Room"}
                    <div class="flex gap-3 w-fit h-fit">
                        <label for="readyState">Kembali ke ready? </label>
                        <input type="checkbox" name="readyState" id="" required>
                    </div>
                {:else}
                    {#if JamorHari !== "Kostum Hari"}
                        <div class="flex justify-between items-center h-fit w-full">
                            <div class="flex flex-col h-fit w-fit">
                                <label for="enter">Jam Masuk: </label>
                                <input type="time" name="enter" id="" bind:this={bindThisInput} onchange={() => updateWaktu = updateDataToTime()} required>
                            </div>
                            
                            <div class="flex flex-col h-fit w-fit">
                                <label for="out">Jam Keluar: </label>
                                <input type="time" name="out" id="" readonly={bindThisSelect?.options[bindThisSelect?.selectedIndex].text !== "Kostum Jam"} value={updateWaktu} required>
                            </div>
                        </div>
                    {:else}
                        <div class="flex flex-col justify-between items-center h-fit w-full">
                            <div class="flex flex-col h-fit w-fit">
                                <label for="enter">Hari Masuk: </label>
                                <input type="date" name="enter" id="" >
                            </div>
                            
                            <div class="flex flex-col h-fit w-fit">
                                <label for="out">Hari Keluar: </label>
                                <input type="date" name="out" id="" >
                            </div>
                        </div>
                    {/if}
                {/if}
                <button disabled={submiting} type="submit" class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"> SUBMIT </button>
            </form>
        {:else if editOther[0] === "StandBy"}
            <form onsubmit={() => {
                submiting=true;
                newMsgBox.push({
                    Title: "Loading",
                    Message: "Harap Tunggu",
                    NotificationType: "info",
                    Action: () => {}
                })
                
            }} action="?/approve" method="post" use:enhance={async () => {
                return async ({update}) => {
                    submiting = false;
                    deleteArray(newMsgBox, "Loading");
                    await update();
                    edit = false;
                    editId = "";
                    editName = "";
                    emptiedArray(editOther);
                    await invalidateAll();
                    refreshData();
                    if(form?.success){
                        newMsgBox.push({
                            Title: "Berhasil",
                            Message: "Approve Berhasil Dilakukan",
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
                <input type="hidden" name="unitId" value={editId}>
                <input type="hidden" name="kebersihanId" value={editName}>
                <input type="hidden" name="approve" value={editOther[4]}>
                <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center gap-1">
                    <div class="w-full h-fit flex justify-center justify-items-center items-center text-center gap-0.5">
                        <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center">
                            <p class="text-[1rem] font-bold">Ruangan</p>
                            <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${editOther[2]}.jpg`} alt="">
                        </div>
                        <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center">
                            <p class="text-[1rem] font-bold">Kamar Mandi</p>
                            <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${editOther[3]}.jpg`} alt="">
                        </div>
                    </div>
                    <p class="font-bold text-[1rem] text-center">{editOther[1]}</p>
                    <p class="font-bold text-2xl text-center">Apakah semuanya aman?</p>
                    <div class="w-full h-full flex justify-center justify-items-center items-center text-center">
                        <button class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans" onclick={() => {
                            editOther.push("Terima");
                        }}> Ya </button>
                        <button class="flex w-full h-fit bg-gradient-to-b from-red-500 via-red-600 to-red-700 justify-center items-center text-center text-2xl rounded-2xl font-sans" onclick={() => {
                            editOther.push("Tolak");
                        }}> Tidak </button>
                    </div>
                </div>
                <button disabled={submiting} type="submit" class="hidden" aria-label="i" bind:this={bindThisButton}></button>
            </form>
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
            <button class="
                  w-full text-white flex-col text-3xl font-bold p-5 rounded-2xl
                    bg-gradient-to-b {(unit.state == 'Ready') ? "from-green-500 to-green-700" : (unit.state == 'StandBy') ? "from-yellow-500 to-yellow-700" : (unit.state == 'Working') ? "from-red-500 to-red-700" : "from-gray-500 to-gray-700"}
                    shadow-md hover:shadow-lg {(unit.state == "StandBy" && unit.pending) ? "animate-pulse" : ""}
                    active:translate-y-0.5
                    transition-all duration-200 ease-in-out
                    focus:outline-none focus:ring-4 focus:ring-blue-400
                  "
                onclick={() => {
                    if(unit.state === "Ready"){
                        edit = true;
                        editId = unit.id;
                        editName = unit.name;
                        editOther.push(unit.state);
                    }else if(unit.state === "Working"){
                        const costumerBersangkutan = data?.dataCustomers?.find(x => x.unitId === unit.id)?.name ?? undefined;
                        if(!costumerBersangkutan){
                            newMsgBox.push({
                                Title: "Status Room",
                                Message: "Kostumer tidak ditemukan, terjadi kesalahan, harap panggil developernya",
                                NotificationType: 'warning',
                                ButtonType: 'ok',
                                Action: async (result: any) => {
                                    deleteArray(newMsgBox, "Status Room");
                                }
                            })
                            return;
                        }
                        edit = true;
                        editId = unit.id;
                        editName = unit.name;
                        editOther.push(unit.state);
                        editOther.push(costumerBersangkutan);
                    }else if (unit.state === "StandBy"){
                        if(!unit.pending){
                            newMsgBox.push({
                                Title: "Status Room",
                                Message: "Ruangan sedang dibersihkan",
                                NotificationType: 'info',
                                ButtonType: 'ok',
                                Action: async (result: any) => {
                                    deleteArray(newMsgBox, "Status Room");
                                }
                            })
                            return;
                        }
                        const dataKebersihanTerkini = data?.dataKebersihan?.find(x => x.id === unit.kebersihan);
                        if(!dataKebersihanTerkini){
                            newMsgBox.push({
                                Title: "Status Room",
                                Message: "Ruangan tidak ditemukan",
                                NotificationType: 'info',
                                ButtonType: 'ok',
                                Action: async (result: any) => {
                                    deleteArray(newMsgBox, "Status Room");
                                }
                            })
                            return;
                        }
                        edit = true;
                        editId = unit.id;
                        editName = dataKebersihanTerkini.id;
                        editOther.push(unit.state);
                        editOther.push(dataKebersihanTerkini.when.toString());
                        editOther.push(dataKebersihanTerkini.imgRuang);
                        editOther.push(dataKebersihanTerkini.imgMandi);
                    }else{
                        newMsgBox.push({
                            Title: "Status Room",
                            Message: "Ruangan Bermasalah",
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
                    await invalidateAll();
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
                        await invalidateAll();
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

<svelte:window on:focus={async () => {
    await invalidateAll();
    refreshData();
}} />