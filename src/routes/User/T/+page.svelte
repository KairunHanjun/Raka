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
                    name2:  ((data.fromTime && data.toTime) ? `${(data.fromTime.getHours() < 10) ? ("0"+data.fromTime.getHours().toString()) : data.fromTime.getHours().toString()}:${(data.fromTime.getMinutes() < 10) ? "0"+data.fromTime.getMinutes().toString() : data.fromTime.getMinutes()}` + " - " + `${(data.toTime.getHours() < 10) ? "0"+data.toTime.getHours().toString() : data.toTime.getHours()}:${(data.toTime.getMinutes() < 10) ? "0"+data.toTime.getMinutes().toString() : data.toTime.getMinutes()}` : ''),
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
                    times:  ((data.fromTime && data.toTime) ? `${(data.fromTime.getHours() < 10) ? ("0"+data.fromTime.getHours().toString()) : data.fromTime.getHours().toString()}:${(data.fromTime.getMinutes() < 10) ? "0"+data.fromTime.getMinutes().toString() : data.fromTime.getMinutes()}` + " - " + `${(data.toTime.getHours() < 10) ? "0"+data.toTime.getHours().toString() : data.toTime.getHours()}:${(data.toTime.getMinutes() < 10) ? "0"+data.toTime.getMinutes().toString() : data.toTime.getMinutes()}` : ''),
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
    let submiting = $state(false);
    let error = $state(false);
    let lihatAbsen: boolean = $state(false);
    let masalahLihat: boolean = $state(false);
    let inspeksiMasalah: boolean = $state(false);
    let dataMasalahTerkini: string[] = $state([]);
    let benarSalah: boolean = $state(false);
    let anyThing: any = $state(undefined);
    let isOnline: boolean = $state(true);


    $effect(() => {
        const timer = setInterval(() => {
            now = new Date();
            isOnline = navigator.onLine;
        }, 1000);
        // Membersihkan interval saat komponen dihancurkan
        return () => clearInterval(timer);
    });

    $effect(() => {
		const interval = setInterval(() => {
			if (navigator.onLine) {
				try {
					invalidateAll().then(() => {
                        refreshData();
                    });
				} catch (err) {}
			} else {
			}
		}, 5 * 60 * 1000); // every 5 minutes

		return () => clearInterval(interval);
	});

    $effect(() => {
		const interval = setInterval(async () => {
			navigator.onLine
		}, 500); // every 0.5 minutes

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
        if(inspeksiMasalah){
            inspeksiMasalah = false;
            emptiedArray(dataMasalahTerkini);
            return;
        }
        if(masalahLihat){
            masalahLihat = false;
            return;
        }
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
                            newMsgBox.push({
                                Title: "Loading",
                                Message: "Harap Tunggu",
                                NotificationType: "info",
                                Action: () => {}
                            });
                            await fetch('/logout', {
                                method: 'GET'
                            });
                            loading = false;
                            deleteArray(newMsgBox, "Keluar");
                            deleteArray(newMsgBox, "Loading");
                            goto('/');
                        }catch (error) {console.log(error); deleteArray(newMsgBox, "Loading");}
                    }else if(result === 'no' && !loading){
                        deleteArray(newMsgBox, "Keluar");
                    }
                }
            }
        })
    }} />

    {#if !menuClick}
        <div class="h-fit w-fit flex flex-col justify-center items-center gap-4">
            <TopActionCard label="Lihat Masalah" onclick={() => {
                    menuClick = "Masalah"

                    }}>
                    <div class="flex flex-col w-full h-fit justify-start gap-2">
                        <div class="flex w-full h-fit justify-center items-center">
                            <div class="w-6 h-6 bg-red-600 rounded-md me-3"></div>
                            <h2 class="text-white text-4xl font-bold">Masalah : {data?.dataMasalah?.length} Unit</h2>
                        </div>
                    </div>
            </TopActionCard>

            <ActionCard label="Absensi" class="w-full bg-gradient-to-b from-green-600 via-green-700 to-green-800 p-3.5" onclick={()=>{
                menuClick = "Absensi"
            }}>
                <svg width="95" height="95" viewBox="0 0 95 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="95" height="95" rx="47.5" fill="#EADDFF"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M61.7506 38C61.7506 45.8701 55.3706 52.25 47.5006 52.25C39.6305 52.25 33.2506 45.8701 33.2506 38C33.2506 30.1299 39.6305 23.75 47.5006 23.75C55.3706 23.75 61.7506 30.1299 61.7506 38ZM57.0006 38C57.0006 43.2467 52.7473 47.5 47.5006 47.5C42.2539 47.5 38.0006 43.2467 38.0006 38C38.0006 32.7533 42.2539 28.5 47.5006 28.5C52.7473 28.5 57.0006 32.7533 57.0006 38Z" fill="#4F378A"/>
                    <path d="M47.5006 59.375C32.1239 59.375 19.0226 68.4675 14.032 81.2061C15.2477 82.4133 16.5284 83.5553 17.8684 84.6261C21.5846 72.9308 33.2428 64.125 47.5006 64.125C61.7584 64.125 73.4165 72.9308 77.1328 84.6262C78.4727 83.5553 79.7534 82.4134 80.9692 81.2061C75.9786 68.4675 62.8773 59.375 47.5006 59.375Z" fill="#4F378A"/>
                </svg>
            </ActionCard>

        </div>
    {:else if menuClick == "Masalah"}
        <ListingComp refreshButton={() => {invalidateAll(); refreshData()}} editable={false} items={[]} ifItems={false} ifOther={true} title="Masalah" selectedItemsID={0} itemEdit={false} >
            {#if masalahLihat}
                {#if inspeksiMasalah}
                    {#if benarSalah}
                        <MessageBox title="Apakah sudah benar?" type='info' buttonType='yesno' handleResult={(result) => {
                            if(result === 'yes'){
                                bindThisSubmit?.click();
                            }else if(result === 'no'){
                                benarSalah = false;
                            }
                        }}>
                            <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center gap-1">
                                <div class="w-full h-fit flex justify-center justify-items-center items-center text-center gap-0.5">
                                    <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center">
                                        <p class="text-[1rem] font-bold">Sebelum</p>
                                        <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${dataMasalahTerkini[2]}.jpg`} alt="" />
                                    </div>
                                    <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center">
                                        <p class="text-[1rem] font-bold">Sesudah</p>
                                        <img src={anyThing} alt="" />
                                    </div>
                                </div>
                                <p class="font-bold text-[1rem] text-center">Nama: {data?.userNow.username}</p>
                                <p class="font-bold text-[1rem] text-center">Jabatan: {accountTypeMap[data?.userNow.accountType] || 'Tidak Dikenali'}</p>
                                <p class="font-bold text-[1rem] text-center">Jam: {(formatTime(hours)+":"+formatTime(minutes))}</p>
                            </div>
                        </MessageBox>
                    {/if}
                    <div class=" flex-grow bg-slate-900 rounded-2xl p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
                        <div class="flex flex-col bg-transparent h-fit w-full justify-items-center justify-center items-center text-center">
                            <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${dataMasalahTerkini[2]}.jpg`} alt={`Masalah ${dataMasalahTerkini[0]}`} class=" rounded-2xl">
                            <p class="text-center font-bold text-[1rem] text-white">{dataMasalahTerkini[1]}</p>
                            <p class="text-center text-[15px] text-white">Di Unit Apa?: {rooms.find(x => x.id === dataMasalahTerkini[3])?.name}</p>
                            <p class="text-center text-[15px] text-white">Waktu: {dataMasalahTerkini[4]}</p>
                        </div> 
                        <form onsubmit={async () => {
                                benarSalah = false;
                                submiting=true;
                                newMsgBox.push({
                                    Title: "Loading",
                                    Message: "Harap Tunggu",
                                    NotificationType: "info",
                                    Action: () => {}
                                });
                            }} action="?/repairman" method="post" class="flex flex-col w-full h-fit gap-2 text-white" enctype="multipart/form-data" use:enhance={() => {
                                return async ({update}) => {
                                    submiting = false;
                                    await update();
                                    edit = false;
                                    invalidateAll().then(() => {
                                        refreshData();
                                    });
                                    if(form?.success){
                                        newMsgBox.push({
                                            Title: "Berhasil",
                                            Message: "Berhasil membersihkan unit",
                                            NotificationType: 'info',
                                            ButtonType: 'ok',
                                            Action: () => {
                                                emptiedArray(editOther);
                                                deleteArray(newMsgBox, "Berhasil");
                                                benarSalah = false;
                                                inspeksiMasalah = false;
                                            }
                                        });
                                    }else error = true;
                                    deleteArray(newMsgBox, "Loading");
                                    anyThing = undefined!;
                                }
                            }}>
                            <p class=" text-blue-600 font-bold text-3xl mt-2 pt-2">Opsi Teknisi</p>
                            <label for="name">Nama Staff: </label>
                            <input class="text-black!" type="text" name="name" id="name" value={data?.userNow.username} required readonly>
                            <label for="jabatan">Jabatan: </label>
                            <input class="text-black!" type="text" name="jabatan" value={accountTypeMap[data?.userNow.accountType] || 'Tidak Dikenali'} id="" required readonly>
                            <label for="jam">Jam: </label>
                            <input class="text-black!" type="text" name="jam" id="" value={(formatTime(hours)+":"+formatTime(minutes))} required readonly>

                            <img src={anyThing} alt="" />
                            <input disabled={submiting} type="file" id="foto" name="foto" accept="image/*" bind:this={bindThisInput} 
                                onchange={() => {
                                    if(bindThisInput?.files){
                                        const reader = new FileReader(); 
                                        reader.onload = function(event) {
                                            anyThing = event.target?.result;
                                        }
                                        reader.readAsDataURL(bindThisInput?.files[0]);
                                    }
                                }}
                            required />           

                            <input type="hidden" name="unit_id" value={editId}>
                            <input type="hidden" name="masalah_id" value={dataMasalahTerkini[0]}>
                            <input type="hidden" name="accountType" value={data?.userNow.accountType}>
                            <!-- <input type="hidden" name="pic1Id" bind:value={pic1Id}>
                            <input type="hidden" name="pic2Id" bind:value={pic2Id}> -->

                            <button disabled={submiting} type="button" class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"
                            onclick={() => {
                                benarSalah = true;
                            }}> Check </button>
                            <button type="submit" class="hidden" bind:this={bindThisSubmit}>submit</button>
                        </form>
                    </div>
                {:else}
                    {#each data?.dataMasalah as masalah, i (masalah.id)}
                        {#if masalah.unitId === editId}
                            <button class="
                                w-full text-white flex-col text-3xl font-bold p-5 rounded-2xl
                                bg-gradient-to-b from-red-500 via-red-600 to-red-700
                                shadow-md hover:shadow-lg
                                active:translate-y-0.5
                                transition-all duration-200 ease-in-out
                                focus:outline-none focus:ring-4 focus:ring-blue-400
                                "
                                onclick={() => {
                                    dataMasalahTerkini.push(masalah.id);
                                    dataMasalahTerkini.push(masalah.desc);
                                    dataMasalahTerkini.push(masalah.imageUrl);
                                    dataMasalahTerkini.push(masalah.unitId ?? '');
                                    dataMasalahTerkini.push(masalah.when.toDateString() + " " + masalah.when.toTimeString());
                                    inspeksiMasalah = true;
                                }}
                            >
                                <p class=" font-bold text-[2rem] text-center">Masalah {i+1}</p>
                                <p class=" text-[1rem] text-center">{masalah.when.toDateString()}</p>
                            </button>
                        {/if}
                    {/each}
                {/if}
            {:else}
                {#each rooms as unit (unit.id)}
                <!-- DO SOMETHING WHEN CLICK OR NOT AND CHANGE COLOR BASED ON UNIT STATE -->
                    {#if data?.dataMasalah?.some(data => data.unitId === unit.id)}
                        <button class="
                            w-full text-white flex-col text-3xl font-bold p-5 rounded-2xl
                            bg-gradient-to-b {(unit.state == 'Ready') ? "from-green-500 to-green-700" : (unit.state == 'StandBy') ? "from-yellow-500 to-yellow-700" : (unit.state == 'Working') ? "from-red-500 to-red-700" : "from-gray-500 to-gray-700"}
                            shadow-md hover:shadow-lg
                            active:translate-y-0.5
                            transition-all duration-200 ease-in-out
                            focus:outline-none focus:ring-4 focus:ring-blue-400
                            "
                            onclick={() => {
                                editId=unit.id;
                                masalahLihat = true;
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
    {:else if menuClick == "Absensi"}
        <ListingComp refreshButton={() => {invalidateAll(); refreshData()}} title="Absensi" disableAddButton={true} editable={false} items={[]} ifItems={false} ifOther={false} itemEdit={true} selectedItemsID={0} onclick={() => {

    }}>
    {#if !edit && !lihatAbsen}
        <div class=" flex flex-col justify-center items-center text-center flex-grow w-full h-fit bg-slate-900 rounded-2xl p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
            {#each data?.dataAbsensi?.filter(data => data.whenEntry.getDate() === (new Date()).getDate()) as absen}
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
        {#if (data?.dataAbsensi?.filter(data => data.whenEntry.getDate() === (new Date()).getDate()))?.length != 2 || (data?.dataAbsensi?.length == 0)}
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
                            await update();
                            edit = false;
                            invalidateAll().then(() => {
                                refreshData();
                            });
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
                            deleteArray(newMsgBox, "Loading");
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
    invalidateAll().then(() => {
        refreshData();
    });
}} />