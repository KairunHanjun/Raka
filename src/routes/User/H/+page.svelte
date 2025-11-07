<!-- USE newMsgBox to create a new MessageBox
to Dissapear that MessageBox Simply undefined the newMsgBox -->

<script lang="ts">

	import { enhance } from "$app/forms";
	import { goto, invalidate, invalidateAll } from "$app/navigation";
	import ActionCard from "$lib/comp/actionCard.svelte";
	import Header from "$lib/comp/header.svelte";
	import ListingComp from "$lib/comp/listingComp.svelte";
	import MessageBox from "$lib/comp/messageBox.svelte";
	import TopActionCard from "$lib/comp/topActionCard.svelte";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";
	import { browser } from "$app/environment";

    let deleteFormData: Array<{
        action: string;
        input: Array<{name: string; value: string}>;
        enhanceAction: (() => void);
    }> = $state(undefined!)

  type UnitItem = {
    id: number | string | any;
    name: string | any;
    name2: string | any;
    event: void | (() => {}) | (() => void) | any;
    editEvent: void | (() => {}) | (() => void) | any;
  };

  const accountTypeMap = {
    'FO': 'Front Office',
    'HK': 'House Keeping',
    'T': 'Teknisi',
    'H': 'Host'
  };

  const laporanItems: UnitItem[] = $state([
    {
        id: 0,
        name: 'Unit',
        name2: '',
        event: () => {
            itemEdit = true;
            subMenu.currentItemEditID = 0;
            subMenu.titleSubMenu = 'Unit';
        },
        editEvent: () => {}
    },
    {
        id: 1,
        name: 'Masalah',
        name2: '',
        event: () => {
            itemEdit = true;
            subMenu.currentItemEditID = 1;
            subMenu.titleSubMenu = 'Masalah';
        },
        editEvent: () => {}
    },
    {
        id: 2,
        name: 'Absensi',
        name2: '',
        event: () => {
            itemEdit = true;
            subMenu.currentItemEditID = 2;
            subMenu.titleSubMenu = 'Absensi';
        },
        editEvent: () => {}
    }
    ]);

  const pengaturanItems: UnitItem[] = $state([
    {
        id: 0,
        name: 'Edit Akun',
        name2: '',
        event: () => {
            itemEdit = false;
            emptiedArray(edit);
            subMenu.currentItemEditID = 0;
            subMenu.titleSubMenu = 'Edit Akun';
            if(subMenu.pengaturan < 2){
                subMenu.pengaturan++;
            }
            for (let i = 0; i < menuClick.length; i++) {
                menuClick[i] = false;
            }
            menuClick[3] = true;
        },
        editEvent: () => {}
    },
    {
        id: 1,
        name: 'Edit Unit',
        name2: '',
        event: () => {
            
            itemEdit = false;
            emptiedArray(edit);
            subMenu.currentItemEditID = 1;
            subMenu.titleSubMenu = 'Edit Unit';
            if(subMenu.pengaturan < 2){
                subMenu.pengaturan++;
            }
            for (let i = 0; i < menuClick.length; i++) {
                menuClick[i] = false;
            }
            menuClick[4] = true;
            
        },
        editEvent: () => {

        }
    },
    {
        id: 2,
        name: 'Edit Agent',
        name2: '',
        event: () => {
            itemEdit = false;
            emptiedArray(edit);
            subMenu.currentItemEditID = 2;
            subMenu.titleSubMenu = 'Edit Agent';
            if(subMenu.pengaturan < 2){
                subMenu.pengaturan++;
            }
            for (let i = 0; i < menuClick.length; i++) {
                menuClick[i] = false;
            }
            menuClick[5] = true;
        },
        editEvent: () => {}
    }])

    const edit: Array<string> = $state([]);
    const userItems: UnitItem[] = $state([]);
    interface SubMenu {
        pengaturan: number;
        laporan: number;
        currentItemEditID: number;
        titleSubMenu: string;
    }
    const pengaturanAturan: Array<boolean> = $state([true, false]);
    const pengaturanAturan2: Array<boolean> = $state([true, false]);
    
    interface ServerResponseFetch {
        data?: any;
        success?: boolean;
        message?: string;
        error?: string;
    }
    
    interface MsgBox {
        Title?: string;
        Message?: string;
        NotificationType?: 'info' | 'warning' | 'danger';
        ButtonType?: 'ok' | 'yesno' | 'subcancel';
        Action?: (() => {}) | (() => void) | ((result: any) => void);
    }

    let serverResponseFetch: ServerResponseFetch = $state(undefined!);


    /**
     * {
        id: 1,
        name: 'UNIT TEST',
        name2: '',
        event: () => {
            pengaturanClick2();
            emptiedArray(edit);
            edit.push("UNIT TEST");
        },
        editEvent: () => {
            emptiedArray(edit);
            edit.push("UNIT TEST");
            hapusUnitMsgBox();
        }
    }
     */
    interface Rooms {
        id: string;
        name: string;
        times: string;
        state: string;
        pending: boolean;
        kebersihan: string | null;
    };
    let rooms: Array<Rooms> = $state([]);
    let unitItems: UnitItem[] = $state([])
    let agentItems: UnitItem[] = $state([])
    let ExclusiveButtonType: 'ok' | 'yesno' | 'subcancel' | undefined = 'yesno';
    function hapusUnitMsgBox(deleteWhat: 'unit' | 'agent'){
        newMsgBox = {
                Title: "Hapus "+ deleteWhat +"?",
                Message: "Apakah kamu yakin untuk hapus " + deleteWhat + "?",
                NotificationType: 'warning',
                ButtonType: ExclusiveButtonType,
                Action: (async (result: any) => {
                    await invalidateAll();
                    if(result){
                        if(result === 'yes' && !deleting){
                            deleting = true;
                            ExclusiveButtonType = undefined!;
                            const formData = new FormData();
                            formData.append(deleteWhat+'Name', edit[0]);
                            try{
                                const fetchRoute = (deleteWhat === 'unit') ? "?/deleteUnit" : "?/deleteAgent";
                                //console.log(fetchRoute);
                                const response = await fetch(fetchRoute, {
                                    method: 'POST',
                                    body: formData
                                });
                                if(!response.ok){
                                    serverResponseFetch = {
                                        data: undefined!,
                                        success: false,
                                        message: "Cannot get the data, something went wrong",
                                        error: "Fetch data from server"
                                    };
                                    newMsgBox = undefined!
                                    return;
                                }
                                const result = await response.json();
                                await invalidateAll();
                                refreshData();
                                deleting = false;
                            }catch (error) {console.log(error);}
                        }
                    }
                    newMsgBox = undefined!
                })
            }
        if(!form?.error){
            newMsgBox = {
                Title: "Berhasil",
                Message: "Berhasil hapus " + deleteWhat,
                NotificationType: 'info',
                ButtonType: 'ok',
                Action: () => {
                    
                }
            }
        }
    }
    let addAccount: boolean = $state(false);
    let forAccount: number = $state(0);
    let deleting: boolean = $state(false);
    const menuClick: Array<boolean> = $state([false, false, false, false, false, false]);
    let subMenu: SubMenu = $state({pengaturan: 0, laporan: 0, currentItemEditID: -1, titleSubMenu: ""});
    let itemEdit: boolean = $state(false);
    let lihatRooms: boolean = $state(false);
    let lihatRooms2: boolean = $state(false);
    let lihatMasalah: boolean = $state(false);
    let inspeksiMasalah: boolean = $state(false);
    let dataMasalahTerkini: string[] = $state([]);
    let lihatAbsensi: boolean = $state(false);
    let lihatAbsensi2: boolean = $state(false);
    let bindThisButton: HTMLButtonElement | undefined = $state(undefined);
    
    function pengaturanClick2(){
        pengaturanAturan2[0] = !pengaturanAturan2[0];
        pengaturanAturan2[1] = !pengaturanAturan2[1];
    }


    function emptiedArray(arrayHere: Array<any>){
        while(arrayHere.length > 0) {
            arrayHere.pop();
        }
    }

    let newMsgBox: MsgBox = $state(undefined!);
    let submiting: boolean = $state(false);
    // IN HERE WE FETCH DATA FROM BACKEND OR SEND IT
    let { data, form }: PageProps = $props();
    let getData: any = $state(false);
    let editData: any = $state(false);
    let masalahLihat: boolean = $state(false);
    let isOnline: boolean = $state(true);
    function refreshData() {
        emptiedArray(rooms);
        emptiedArray(userItems);
        emptiedArray(unitItems);
        emptiedArray(agentItems);
        if(data){
            if(!data.error) {
                data.dataAkun?.forEach((data) => {
                    userItems.push({
                        id: data.id,
                        name: data.username.toLocaleUpperCase(),
                        name2: accountTypeMap[data.accountType] || 'Tidak Dikenali',
                        event: (() => {
                            pengaturanClick2();
                            emptiedArray(edit);
                            edit.push(data.username);
                            edit.push(data.id)
                        }),
                        editEvent: (() => {
                            emptiedArray(edit);
                            edit.push(data.username);
                            edit.push(data.id)
                            forAccount = -1;
                            editData = true;
                            getData = false;
                        })
                    })
                })
                data.dataUnits?.forEach((data) => {
                    unitItems.push({
                        id: data.id,
                        name: data.nameUnit.toLocaleUpperCase(),
                        name2: (data.fromTime && data.toTime) ? data.fromTime + " - " + data.toTime : null,
                        event: (() => {
                            pengaturanClick2();
                            emptiedArray(edit);
                            edit.push(data.nameUnit);
                            
                        }),
                        editEvent: (() => {
                            emptiedArray(edit);
                            edit.push(data.nameUnit);
                            hapusUnitMsgBox('unit');
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
                    //console.log(rooms);
                })
                data.dataAgents?.forEach(data => {
                    agentItems.push({
                        id: data.id,
                        name: data.nameAgent.toLocaleUpperCase(),
                        name2: data.createdByWho,
                        event: (() => {
                            pengaturanClick2();
                            emptiedArray(edit);
                            edit.push(data.nameAgent);
                            edit.push(data.id);
                            
                        }),
                        editEvent: (() => {
                            emptiedArray(edit);
                            edit.push(data.nameAgent);
                            edit.push(data.id);
                            hapusUnitMsgBox('unit');
                        })
                    });
                });
            }else{
                getData = true;
            }
        }
    }

    $effect(() => {
		const interval = setInterval(async () => {
			isOnline = navigator.onLine;
		}, 1000); // every 0.5 minutes

		return () => clearInterval(interval);
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

    const combined = data?.dataCustomers?.map((cust, i) => {
		const agent = data.dataAgents.find(a => a.id === cust.agents);
		const host = data.dataAkun.find(acc => acc.username === unit?.createdByWho);

		return {
			no: i + 1,
			customerName: cust.name,
			unitName: unit?.nameUnit,
			agentName: agent?.nameAgent,
			hostName: host?.username,
			duration: cust.duration || "3 Jam",
			price: `Rp. ${cust.price?.toLocaleString("id-ID") || "0"}`,
			time: `${cust.startTime}–${cust.endTime}`
		};
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

{#if newMsgBox}
    <MessageBox title={newMsgBox?.Title} type={newMsgBox.NotificationType} buttonType={newMsgBox.ButtonType} handleResult={newMsgBox.Action}>
        <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
            <p class=" text-amber-300">{newMsgBox?.Message}</p>
        </div>
    </MessageBox>
{/if}

<!-- <svelte:window onbeforeunload={beforeUnload} /> -->
<!-- HERE THE MSG BOX FOR ERROR, LOGOUT, DELETE CONFIRMATION -->

{#if (form?.error && getData) || (data?.error && getData)}
    <MessageBox title="Masalah Terjadi!" type="warning" buttonType="ok" handleResult={
        () => {
            submiting = false;
            getData = false;
        }
    }>
        <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
            {#if form?.description}
                <p class=" font-bold">Masukan Error: </p>
                <p class=" text-amber-300">{form?.description}</p>
            {/if}
            {#if data?.description}
                <p class=" font-bold">Masukan Error: </p>
                <p class=" text-amber-300">{data?.description}</p>
            {/if}
        </div>
    </MessageBox>
{:else if editData && !getData}
    <MessageBox title="Hapus Akun" type="warning" buttonType='yesno' handleResult={
        async (result: any) => {
            if(result){
                if(result === 'yes' && !deleting){
                    deleting = true;
                    const formData = new FormData();
                    formData.append('id', edit[1]);
                    formData.append('username', edit[0]);
                    try{
                        const response = await fetch('?/deleteAccount', {
                            method: 'POST',
                            body: formData
                        });
                        if(!response.ok){
                            serverResponseFetch = {
                                data: undefined!,
                                success: false,
                                message: "Cannot get the data, something went wrong",
                                error: "Fetch data from server"
                            };
                            editData = false;
                            return;
                        }
                        const result = await response.json();
                        await invalidateAll();
                        refreshData();
                        //console.log(userItems);
                    }catch (error) {console.log(error);}
                    newMsgBox = {
                        Title: (form?.error) ? 'Gagal' : 'Berhasil',
                        Message: (form?.error) ? (form?.error as string) : "Data berhasil dihapus",
                        NotificationType: 'info',
                        ButtonType: 'ok',
                        Action: (() => {
                            pengaturanClick2()
                            submiting = false;
                            deleting = false;
                            newMsgBox = undefined!;
                        })
                    }
                }else if(result === 'no' && !deleting){
                    pengaturanClick2();
                }
            }
            editData = false;
        }
    }>
    <p class=" text-amber-300">Yakin ingin hapus akun ini? {edit[0]}</p>
    </MessageBox>
{/if}
<!-- END THE DELETE ACCOUNT -->

<div class="h-fit w-screen flex flex-col justify-center items-center gap-4">
    <Header onclick={() => {
        if(lihatRooms2){
            emptiedArray(dataMasalahTerkini);
            lihatRooms2 = false;
            return;
        }
        if(inspeksiMasalah){
            emptiedArray(dataMasalahTerkini);
            inspeksiMasalah = false;
            return;
        }
        if(lihatAbsensi2 || masalahLihat) {
            emptiedArray(edit);
            lihatAbsensi2 = false;
            masalahLihat = false;
            return;
        }
        if(lihatAbsensi || lihatMasalah || lihatRooms){
            emptiedArray(edit);
            lihatAbsensi = false;
            lihatMasalah = false;
            lihatRooms = false;
        }
        if (!pengaturanAturan2[0] && pengaturanAturan2[1]) {
            pengaturanClick2();
            addAccount = false;
            forAccount = 0;
            return;
        }
        if(itemEdit){
            itemEdit = false;
            subMenu.titleSubMenu = (subMenu.pengaturan >= 1) ? "Pengaturan" : ((subMenu.laporan >= 1) ? "Laporan" : "");
            return;
        };
        if(subMenu.pengaturan >= 1){
            subMenu.pengaturan--;
            subMenu.titleSubMenu = "Pengaturan"

        }else if(subMenu.laporan >= 1){
            subMenu.laporan--;
            subMenu.titleSubMenu = "Laporan"
        }else if(subMenu.laporan != 0 && subMenu.pengaturan != 0){
            subMenu.pengaturan = 0;
            subMenu.laporan = 0;
        }else{
            if(menuClick.find(x => x === true)){
                for (let i = 0; i < menuClick.length; i++) {
                    menuClick[i] = false;
                }
                return;
            }
            newMsgBox = {
                Title: "Keluar",
                Message: "Apakah yakin ingin keluar?",
                NotificationType: 'warning',
                ButtonType: 'yesno',
                Action: async (result: any) => {
                    if(result){
                        if(result === 'yes' && !deleting){
                            deleting = true;
                            try{
                                await fetch('/logout', {
                                    method: 'GET'
                                });
                                deleting = false;
                                newMsgBox = undefined!
                                goto('/')
                            }catch (error) {console.log(error);}
                        }else if(result === 'no' && !deleting){
                           newMsgBox = undefined!
                        }
                    }
                }
            }
        }
        
        
    }} name={(data?.userNow?.username ?? 'User').toUpperCase()}/>
    {#if subMenu.pengaturan === 0 && subMenu.laporan === 0}
        <div class="h-fit w-fit flex flex-col justify-center items-center gap-4">
            <TopActionCard label="Lihat Room" onclick={() => {
                lihatAbsensi = false;
                lihatMasalah = false;
                lihatRooms = true;
                subMenu.pengaturan = -1;
                subMenu.laporan = -1;
                }}>
                <div class="flex w-full h-fit justify-between gap-2">
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
            </TopActionCard>
            <TopActionCard label="Lihat Masalah" onclick={() => {
                lihatAbsensi = false;
                lihatMasalah = true;
                lihatRooms = false;
                subMenu.pengaturan = -1;
                subMenu.laporan = -1;
                }}>
                <div class="flex flex-col w-full h-fit justify-start gap-2">
                    <div class="flex w-full h-fit justify-center items-center">
                        <div class="w-6 h-6 bg-red-600 rounded-md me-3"></div>
                        <h2 class="text-white text-4xl font-bold">Masalah : {data?.dataMasalah?.length} Unit</h2>
                    </div>
                </div>
            </TopActionCard>
            <ActionCard useSVG={false} label="Lihat Absensi" class="bg-gradient-to-b from-green-500 via-green-600 to-green-700 w-full" onclick={() => {
                lihatAbsensi = true;
                lihatMasalah = false;
                lihatRooms = false;
                subMenu.pengaturan = -1;
                subMenu.laporan = -1;
                }}/>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <footer class="w-full h-full mt-auto inset-x-0 bottom-0 rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-800 flex items-center justify-around z-40">
            <!-- Tombol Clipboard -->
                <button onclick={() => {
                    subMenu.pengaturan = 0;
                    subMenu.laporan++;
                    subMenu.titleSubMenu = 'Laporan';
                }} class="p-3 text-slate-900 hover:text-white transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3.293 2.293a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L9 10.414l-1.293 1.293a1 1 0 01-1.414-1.414l3-3z" clip-rule="evenodd" />
                    </svg>
                </button>
                
                <!-- Tombol Pengaturan -->
                <button onclick={() => {
                    subMenu.laporan = 0;
                    subMenu.pengaturan++;
                    subMenu.titleSubMenu = 'Pengaturan';
                }} class="p-3 text-slate-900 hover:text-white transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </footer>
        </div>
    {:else if subMenu.laporan >= 1 && subMenu.pengaturan === 0}
        <ListingComp disableAddButton={true} editable={false} items={laporanItems} ifItems={true} ifOther={false} title={subMenu.titleSubMenu} itemEdit={itemEdit} selectedItemsID={subMenu.currentItemEditID}>
            <section>
                <div class="w-full h-full flex flex-col justify-between items-center bg-amber-100">
                    <div class="w-full h-fit flex justify-between items-center">
                        <div class="w-fit h-fit flex flex-col">
                            <p>Tahun :</p>
                            <input type="number" min="1900" max="2999" step="1" value="2025" />
                        </div>
                        <div class="w-fit h-fit flex flex-col">
                            <p>Tahun :</p>
                            <select name="month" id="month">
                                <option value="">-- Select Month --</option>
                                <option value="January">January</option>
                                <option value="February">February</option>
                                <option value="March">March</option>
                                <option value="April">April</option>
                                <option value="May">May</option>
                                <option value="June">June</option>
                                <option value="July">July</option>
                                <option value="August">August</option>
                                <option value="September">September</option>
                                <option value="October">October</option>
                                <option value="November">November</option>
                                <option value="December">December</option>
                            </select>
                        </div>
                    </div>
                    <div class="w-full flex flex-col ">
                    </div>
                </div>
            </section>
        </ListingComp>
    <!-- HERE LAY THE ADD AND EDIT ACCOUNT -->
    {:else if subMenu.pengaturan >= 1 && subMenu.laporan === 0}
        {#if subMenu.pengaturan == 2 && menuClick[3]}
            <ListingComp disableAddButton={false} editable={true} items={userItems} ifItems={pengaturanAturan2[0]} ifOther={false} itemEdit={pengaturanAturan2[1]} title={subMenu.titleSubMenu} selectedItemsID={forAccount} onclick={() => {
                addAccount = true; 
                pengaturanClick2();
                forAccount = 1 ;
                emptiedArray(edit);
                getData = false;
                submiting = false;
            }}>
                {#if (addAccount && !form?.horay) || (edit.length != 0) || addAccount}
                    <form onsubmit={() => {
                        submiting = true;
                        newMsgBox = {
                            Title: "LOADING",
                            Message: "Tunggu Dulu",
                            NotificationType: 'info',
                        };
                    }} action="?/{((edit.length != 0)) ? 'editAccount' : 'addAccount'}" method="post" class="flex flex-col w-full max-w-sm h-fit gap-2" use:enhance={() => {
                        return async ({update}) => {
                            await update();
                            newMsgBox = undefined!;
                            emptiedArray(edit);
                            await invalidateAll();
                            refreshData();
                            newMsgBox = {
                                Title: (form?.error) ? "Gagal" : "Berhasil",
                                Message: (form?.error) ? (form?.description as string) : "Berhasil tambah akun",
                                NotificationType: (form?.error) ? 'danger' : 'info',
                                ButtonType: 'ok',
                                Action: () => {
                                    pengaturanClick2();
                                    submiting = false;
                                    newMsgBox = undefined!;
                                }
                            }
                            
                        }
                    }}>
                        <label for="Role">Role :</label>
                        <select name="Role" id="role" required>
                            <option value="FO">Front Office</option>
                            <option value="HK">House Keeping</option>
                            <option value="T">Teknisi</option>
                            <option value="H">Host</option>
                        </select>
                        <label for="Email">Email: </label>
                        <input type="email" name="Email" id="email" required>
                        <label for="Telp">Nomor Whatsapp: </label>
                        <input type="text" name="Telp" id="telp" required>
                        <label for="Username">Username: </label>
                        <input type="text" name="Username" id="username" value={((edit.length != 0)) ? edit[0] : ''} required>
                        <label for="">Password: </label>
                        <input type="password" name="Password" id="password" required>
                        <input type="hidden" name="editAkunId" class="" value={(edit) ? edit[1] : ''}>
                        <button disabled={submiting} type="submit" class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"> SUBMIT </button>
                    </form>
                {/if}
            </ListingComp>
        <!-- HERE LAY THE ADD UNIT -->
        {:else if subMenu.pengaturan == 2 && menuClick[4]}
            <ListingComp disableAddButton={false} editable={true} items={unitItems} ifItems={pengaturanAturan2[0]} ifOther={false} itemEdit={pengaturanAturan2[1]} title={subMenu.titleSubMenu} selectedItemsID={0} onclick={() => {
                pengaturanClick2();
                emptiedArray(edit);
                submiting = false;
            }}>

                    <form onsubmit={() => {
                        submiting = true;
                        newMsgBox = {
                            Title: "LOADING",
                            Message: "Tunggu Dulu",
                            NotificationType: 'info',
                        };
                    }} class="flex flex-col w-full max-w-sm h-fit gap-2" action="?/{(edit === undefined || (edit as Array<string>).length != 0) ? 'editUnit' : 'addUnit'}" method="post" use:enhance={() => {
                        return async ({update}) => {
                            await update();
                            newMsgBox = undefined!;
                            submiting = false;
                            //console.log(edit);
                            emptiedArray(edit);
                            //console.log(form);
                            if(!form?.error){
                                newMsgBox = {
                                    Title: "Berhasil Ditambahkan",
                                    Message: "Unit berhasil ditambahkan",
                                    NotificationType: 'info',
                                    ButtonType: 'ok',
                                    Action: (() => {
                                        pengaturanClick2();
                                        submiting = false;
                                        newMsgBox = undefined!;
                                    })
                                }
                                await invalidateAll();
                                refreshData();
                            }else{
                                newMsgBox = {
                                    Title: "Gagal Ditambahkan",
                                    Message: "Unit gagal ditambahkan",
                                    NotificationType: 'danger',
                                    ButtonType: 'ok',
                                    Action: (() => {
                                        pengaturanClick2();
                                        submiting = false;
                                        newMsgBox = undefined!;
                                    })
                                }
                            }
                        }
                    }}>
                        <label for="UnitName">Unit Name: </label>
                        <input type="text" value={(edit.length != 0) ? edit[0] : ''} readonly={(edit.length != 0)} name="UnitName" id="unitName" required>
                        <label for="Status">Status :</label>
                        <select name="Status" id="status" required>
                            <option value="Ready">Ready</option>
                            <option value="StandBy">Stand By</option>
                            <option value="Working">Working</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <label for="FromWhenToWhen">Dari Kapan ke Kapan: </label>
                        <input type="time" id="from-time" name="from-time">
                        <input type="time" id="to-time" name="to-time">
                        <button type="submit" disabled={submiting} class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"> SUBMIT </button>
                    </form>
            </ListingComp>
        <!-- HERE LAY THE ADD AGENT -->
        {:else if subMenu.pengaturan == 2 && menuClick[5]}
            <ListingComp disableAddButton={false} editable={true} items={agentItems} ifItems={pengaturanAturan2[0]} ifOther={false} itemEdit={pengaturanAturan2[1]} title={subMenu.titleSubMenu} selectedItemsID={0} onclick={() => {
                pengaturanClick2();
                emptiedArray(edit);
                submiting = false;
            }}>
                
                    <form onsubmit={() => {
                        submiting = true;
                        newMsgBox = {
                            Title: "LOADING",
                            Message: "Tunggu Dulu",
                            NotificationType: 'info',
                        };
                    }} class="flex flex-col w-full max-w-sm h-fit gap-2" action="{(edit === undefined || (edit as Array<string>).length != 0) ? '?/editAgent' : '?/addAgent'}" method="post" use:enhance={() => {
                        return async ({update}) => {
                            await update();
                            newMsgBox = undefined!
                            submiting = false;
                            //console.log(edit);
                            emptiedArray(edit);
                            if(!form?.error){
                                await invalidateAll();
                                refreshData();
                                newMsgBox ={
                                    Title: "Berhasil Ditambahkan",
                                    Message: "Unit berhasil ditambahkan",
                                    NotificationType: 'info',
                                    ButtonType: 'ok',
                                    Action: (() => {
                                        pengaturanClick2();
                                        submiting = false;
                                        newMsgBox = undefined!;
                                    })
                                }
                            }else{
                                newMsgBox = {
                                    Title: "Gagal Ditambahkan",
                                    Message: "Agent gagal ditambahkan",
                                    NotificationType: 'danger',
                                    ButtonType: 'ok',
                                    Action: (() => {
                                        pengaturanClick2();
                                        submiting = false;
                                        newMsgBox = undefined!;
                                    })
                                }
                            }
                        }
                    }}>
                        <label for="AgentName">Agent Name: </label>
                        <input type="text" value={(edit.length != 0) ? edit[0] : ''} readonly={(edit.length != 0)} name="AgentName" id="AgentName" required>
                        <label for="EmailAgent">Agent Email: </label>
                        <input type="email"  name="EmailAgent" id="EmailAgent" required>
                        <label for="PhoneAgent">Phone Name: </label>
                        <input type="text"  name="PhoneAgent" id="PhoneAgent" required>
                        <input type="hidden" name="IdAgent" value={(edit) ? edit[1] : ''}>
                        <button type="submit" disabled={submiting} class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"> SUBMIT </button>
                    </form>
            </ListingComp>
        {:else}
        <!-- HERE LAY THE MAIN PENGATURAN -->
            <ListingComp disableAddButton={true} editable={false} items={pengaturanItems} ifItems={pengaturanAturan[0]} ifOther={pengaturanAturan[1]} title={subMenu.titleSubMenu} itemEdit={itemEdit} selectedItemsID = {subMenu.currentItemEditID} onclick={() => {
                
            }}>

            </ListingComp>
        {/if}
    {:else if subMenu.pengaturan < 0 && subMenu.laporan < 0}
        {#if lihatRooms}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={false} title="Room" selectedItemsID={0} itemEdit={true} >
            {#if lihatRooms2}
                <form onsubmit={() => {
                    submiting=true;
                    newMsgBox = {
                        Title: "Loading",
                        Message: "Harap Tunggu",
                        NotificationType: "info",
                        Action: () => {}
                    }
                    
                }} action="?/approve" method="post" use:enhance={async () => {
                    return async ({update}) => {
                        submiting = false;
                        newMsgBox = undefined!;
                        await update();
                        lihatRooms2 = false;
                        emptiedArray(dataMasalahTerkini);
                        await invalidateAll();
                        refreshData();
                        if(form?.success){
                            newMsgBox = {
                                Title: "Berhasil",
                                Message: "Approve Berhasil Dilakukan",
                                NotificationType: 'info',
                                ButtonType: 'ok',
                                Action: () => {
                                    emptiedArray(dataMasalahTerkini);
                                    newMsgBox = undefined!;
                                }
                            };
                        }
                    }
                }}>
                    
                    <input type="hidden" name="unitId" value={dataMasalahTerkini[4]}>
                    <input type="hidden" name="kebersihanId" value={dataMasalahTerkini[3]}>
                    <input type="hidden" name="approve" value={dataMasalahTerkini[5]}>
                    <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center gap-1">
                        <div class="w-full h-fit flex justify-center justify-items-center items-center text-center gap-0.5">
                            <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center">
                                <p class="text-[1rem] font-bold">Ruangan</p>
                                <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${dataMasalahTerkini[1]}.jpg`} alt="">
                            </div>
                            <div class="w-full h-fit flex flex-col justify-center justify-items-center items-center text-center">
                                <p class="text-[1rem] font-bold">Kamar Mandi</p>
                                <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${dataMasalahTerkini[2]}.jpg`} alt="">
                            </div>
                        </div>
                        <p class="font-bold text-[1rem] text-center">{dataMasalahTerkini[0]}</p>
                        <p class="font-bold text-2xl text-center">Apakah semuanya aman?</p>
                        <div class="w-full h-full flex justify-center justify-items-center items-center text-center">
                            <button class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans" onclick={() => {
                                dataMasalahTerkini.push("Terima");
                                bindThisButton?.click();
                            }}> Ya </button>
                            <button class="flex w-full h-fit bg-gradient-to-b from-red-500 via-red-600 to-red-700 justify-center items-center text-center text-2xl rounded-2xl font-sans" onclick={() => {
                                dataMasalahTerkini.push("Tolak");
                                bindThisButton?.click();
                            }}> Tidak </button>
                        </div>
                    </div>
                    <button disabled={submiting} type="submit" class="hidden" aria-label="i" bind:this={bindThisButton}></button>
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
                        shadow-md hover:shadow-lg {(unit.state == "StandBy" && unit.pending) ? "animate-pulse" : ""}
                        active:translate-y-0.5
                        transition-all duration-200 ease-in-out
                        focus:outline-none focus:ring-4 focus:ring-blue-400
                    "
                    onclick={() => {
                        if(!unit.pending){
                            newMsgBox = ({
                                Title: "Status Room",
                                Message: "Ruangan sedang dibersihkan",
                                NotificationType: 'info',
                                ButtonType: 'ok',
                                Action: async (result: any) => {
                                    newMsgBox = undefined!
                                }
                            })
                            return;
                        }
                        const dataKebersihanTerkini = data?.dataKebersihan?.find(x => x.id === unit.kebersihan);
                        if(!dataKebersihanTerkini){
                            newMsgBox = ({
                                Title: "Status Room",
                                Message: "Ruangan tidak ditemukan",
                                NotificationType: 'info',
                                ButtonType: 'ok',
                                Action: async (result: any) => {
                                    newMsgBox = undefined!;
                                }
                            })
                            return;
                        }
                        lihatRooms2 = true;
                        dataMasalahTerkini.push(dataKebersihanTerkini.when.toString());
                        dataMasalahTerkini.push(dataKebersihanTerkini.imgRuang);
                        dataMasalahTerkini.push(dataKebersihanTerkini.imgMandi);
                        dataMasalahTerkini.push(dataKebersihanTerkini.id);
                        dataMasalahTerkini.push(unit.id);
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
        {:else if lihatMasalah}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={true} title="Masalah" selectedItemsID={0} itemEdit={false} >
            {#if masalahLihat}
                {#if inspeksiMasalah}
                    <div class=" flex-grow bg-slate-900 rounded-2xl p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
                        <div class="flex flex-col bg-transparent h-fit w-full justify-items-center justify-center items-center text-center">
                            <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${dataMasalahTerkini[2]}.jpg`} alt={`Masalah ${dataMasalahTerkini[0]}`} class=" rounded-2xl">
                            <p class="text-center font-bold text-[1rem] text-white">{dataMasalahTerkini[1]}</p>
                            <p class="text-center text-[15px] text-white">Di Unit Apa?: {rooms.find(x => x.id === dataMasalahTerkini[3])?.name}</p>
                            <p class="text-center text-[15px] text-white">Waktu: {dataMasalahTerkini[4]}</p>
                        </div>
                    </div>
                {:else}
                    {#each data?.dataMasalah as masalah, i (masalah.id)}
                        {#if masalah.unitId === edit[0]}
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
                                edit.push(unit.id);
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
        {:else if lihatAbsensi}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={true} title="Absensi" selectedItemsID={0} itemEdit={false} >
            {#if !lihatAbsensi2}
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
                                edit.push(absen.id);
                                edit.push(absen.name);
                                edit.push(absen.fotoUrl);
                                edit.push(absen.when.toString());
                                edit.push(accountTypeMap[absen.accountType] || 'Tidak Dikenali')
                                lihatAbsensi2 = true;
                            }}
                            aria-label="i"
                        >
                            <p class="text-center font-bold text-[1rem] text-white">{absen.name.toUpperCase()}</p>
                            <p class="text-center text-[15px] text-white">{accountTypeMap[absen.accountType] || 'Tidak Dikenali'}</p>
                            <p class="text-center text-[15px] text-white">{absen.when.toLocaleDateString()} {absen.when.toLocaleTimeString()}</p>
                        </button>
                    {/each}
                </div>
            {:else}
                <div class=" flex-grow bg-slate-900 rounded-2xl p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-900">
                    <div class="flex flex-col bg-transparent h-fit w-full justify-items-center justify-center items-center text-center">
                        <img src={`https://res.cloudinary.com/du0gb4nqq/image/upload/v1762169111/${edit[2]}.jpg`} alt={`Foto Absen ${edit[1]}`} class=" rounded-2xl">
                        <p class="text-center font-bold text-[1rem] text-white">Nama: {edit[1]}</p>
                        <p class="text-center text-[15px] text-white">Jabatan: {edit[4]}</p>
                        <p class="text-center text-[15px] text-white">Waktu: {edit[3]}</p>
                    </div>
                </div>
            {/if}
        </ListingComp>            
        {/if}
    {/if}
</div>

<svelte:window on:focus={async () => {
    await invalidateAll();
    refreshData();
}} />