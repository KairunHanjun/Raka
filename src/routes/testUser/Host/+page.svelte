<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import ActionCard from "$lib/comp/actionCard.svelte";
	import Header from "$lib/comp/header.svelte";
	import ListingComp from "$lib/comp/listingComp.svelte";
	import MessageBox from "$lib/comp/messageBox.svelte";
	import TopActionCard from "$lib/comp/topActionCard.svelte";
	import type { PageProps } from "./$types";

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
            subMenu.currentItemEditID = 1;
            subMenu.titleSubMenu = 'Edit Unit';
            if(subMenu.pengaturan < 2){
                subMenu.pengaturan++;
            }
            for (let i = 0; i < menuClick.length; i++) {
                menuClick[i] = false;
            }
            menuClick[4] = true;
            //TODO: get unit here in here
        },
        editEvent: () => {}
    },
    {
        id: 2,
        name: 'Edit Agent',
        name2: '',
        event: () => {
            itemEdit = false;
            subMenu.currentItemEditID = 2;
            subMenu.titleSubMenu = 'Edit Agent';
            if(subMenu.pengaturan < 2){
                subMenu.pengaturan++;
            }
            for (let i = 0; i < menuClick.length; i++) {
                menuClick[i] = false;
            }
            menuClick[5] = true;
            //TODO: get agent in here
        },
        editEvent: () => {}
    }])

    let editAkun: string = $state('');
    let editAkunId: string = $state('');
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
        dataAkun?: Array<{ id: string; username: string; accountType: "FO" | "HK" | "T" | "H"; }>;
        success?: boolean;
        message?: string;
        error?: string;
    }
        
    let serverResponseFetch: ServerResponseFetch = $state(undefined!);

    let addAccount: boolean = $state(false);
    let forAccount: number = $state(0);
    const menuClick: Array<boolean> = $state([false, false, false, false, false, false]);
    let subMenu: SubMenu = $state({pengaturan: 0, laporan: 0, currentItemEditID: -1, titleSubMenu: ""});
    let itemEdit: boolean = $state(false);
    function pengaturanClick2(){
        pengaturanAturan2[0] = !pengaturanAturan2[0];
        pengaturanAturan2[1] = !pengaturanAturan2[1];
    }


    function emptiedArray(arrayHere: Array<any>){
        while(arrayHere.length > 0) {
            arrayHere.pop();
        }
    }
    // IN HERE WE FETCH DATA FROM BACKEND OR SEND IT
    let { data, form }: PageProps = $props();
    let getData: any = $state(false);
    let editData: any = $state(false);
    if(data){
        if(data.error) getData = true;
        else {
            data.dataAkun?.forEach((data) => {
                userItems.push({
                    id: data.id,
                    name: data.username.toLocaleUpperCase(),
                    name2: accountTypeMap[data.accountType] || 'Tidak Dikenali',
                    event: (() => {
                        pengaturanClick2();
                        editAkun = data.username;
                        editAkunId = data.id;
                    }),
                    editEvent: (() => {
                        editAkun = data.username;
                        editAkunId = data.id;
                        forAccount = -1;
                        editData = true;
                        getData = false;
                    })
                })
            })
        }
    }
</script>

<!-- <svelte:window onbeforeunload={beforeUnload} /> -->
<!-- HERE THE MSG BOX FOR ERROR, LOGOUT, DELETE CONFIRMATION -->
{#if serverResponseFetch?.success}
    <MessageBox title="Berhasil dihapus" type="info" buttonType="ok" handleResult={
        async () => {
            await invalidateAll();
            if (!pengaturanAturan2[0] && pengaturanAturan2[1]) {
                pengaturanClick2();
                addAccount = false;
                forAccount = 0;
                editData = false;
                serverResponseFetch = undefined!;
                return;
            }
        }
    }>
        <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
            <p class=" font-bold">Berhasil: </p>
            <p class=" text-amber-300">{serverResponseFetch?.message}</p>
        </div>
    </MessageBox>
{:else if serverResponseFetch}
    {#if !serverResponseFetch.success}
        <MessageBox title="Gagal dihapus" type="info" buttonType="ok" handleResult={
            async () => {
                await invalidateAll();
                if (!pengaturanAturan2[0] && pengaturanAturan2[1]) {
                    pengaturanClick2();
                    addAccount = false;
                    forAccount = 0;
                    editData = false;
                    serverResponseFetch = undefined!;
                    return;
                }
            }
        }>
            <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
                <p class=" font-bold">Masukan Error: </p>
                <p class=" text-amber-300">{serverResponseFetch.message}</p>
            </div>
        </MessageBox>
    {/if}
{/if}

{#if (form?.error && getData) || (data?.error && getData)}
    <MessageBox title="Masalah Terjadi!" type="warning" buttonType="ok" handleResult={
        () => {
            getData = false;
        }
    }>
        <div class="w-full h-fit flex flex-col justify-between items-center object-center text-center">
            {#if form}
                <p class=" font-bold">Masukan Error: </p>
                <p class=" text-amber-300">{form?.description}</p>
            {/if}
            {#if data}
                <p class=" font-bold">Masukan Error: </p>
                <p class=" text-amber-300">{data?.description}</p>
            {/if}
        </div>
    </MessageBox>
{:else if editData && !getData}
    <MessageBox title="Hapus Akun" type="warning" buttonType='yesno' handleResult={
        async (result: any) => {
            if(result){
                if(result === 'yes'){
                    const formData = new FormData();
                    formData.append('id', editAkunId);
                    formData.append('username', editAkun);
                    try{
                        const response = await fetch('?/deleteAccount', {
                            method: 'POST',
                            body: formData
                        });
                        if(!response.ok){
                            serverResponseFetch = {
                                dataAkun: undefined!,
                                success: false,
                                message: "Cannot get the data, something went wrong",
                                error: "Fetch data from server"
                            };
                            editData = false;
                            return;
                        }
                        const result = await response.json();
                        const parseResult = JSON.parse(result.data);
                        serverResponseFetch = {
                            dataAkun: parseResult[1],
                            success: parseResult[2],
                            error: parseResult[4],
                            message: parseResult[3]
                        }
                        if(serverResponseFetch.dataAkun){
                            emptiedArray(userItems);
                            serverResponseFetch.dataAkun?.forEach((data) => {
                                userItems.push({
                                    id: data.id,
                                    name: data.username.toLocaleUpperCase(),
                                    name2: accountTypeMap[data.accountType] || 'Tidak Dikenali',
                                    event: (() => {
                                        pengaturanClick2();
                                        editAkun = data.username;
                                        editAkunId = data.id;
                                    }),
                                    editEvent: (() => {
                                        editAkun = data.username;
                                        editAkunId = data.id;
                                        forAccount = -1;
                                        editData = true;
                                        getData = false;
                                    })
                                })
                            })
                        }
                        
                    }catch (error) {console.log(error);}
                }
            }
            editData = false;
        }
    }>
    <p class=" text-amber-300">Yakin ingin hapus akun ini? {editAkun}</p>
    </MessageBox>
{/if}
<!-- END THE DELETE ACCOUNT -->

<div class="h-fit w-screen flex flex-col justify-center items-center gap-4">
    <Header onclick={() => {
        if (!pengaturanAturan2[0] && pengaturanAturan2[1]) {
            pengaturanClick2();
            addAccount = false;
            forAccount = 0;
            return;
        }
        for (let i = 0; i < menuClick.length; i++) {
            menuClick[i] = false;
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
        }else{
            subMenu.pengaturan = 0;
            subMenu.laporan = 0;
        }
    }}/>
    {#if subMenu.pengaturan === 0 && subMenu.laporan === 0}
        <div class="h-fit w-fit flex flex-col justify-center items-center gap-4">
            <TopActionCard label="Lihat Room" onclick={() => {
                for (let i = 0; i < menuClick.length; i++) {
                    menuClick[i] = false;
                }
                menuClick[0] = true;
                subMenu.pengaturan = -1;
                subMenu.laporan = -1;
                }}>
                <div class="flex flex-col w-full h-fit justify-start gap-2">
                    <div class="flex w-full h-fit justify-center items-center">
                        <div class="w-6 h-6 bg-yellow-600 rounded-md me-3"></div>
                        <h2 class="text-white text-4xl font-bold">Proccess : {5} Unit</h2>
                    </div>
                    <div class="flex w-full h-fit justify-between">
                        <div class="flex w-fit h-fit items-center object-center">
                            <div class="w-3 h-3 bg-green-600 rounded-sm me-2"></div>
                            <h2 class="text-white text-xl font-bold">Ready : {10} Unit</h2>
                        </div>
                        <div class="flex w-fit h-fit items-center object-center">
                            <div class="w-3 h-3 bg-red-600 rounded-sm me-2"></div>
                            <h2 class="text-white text-xl font-bold">Used : {5} Unit</h2>
                        </div>
                    </div>
                </div>
            </TopActionCard>
            <TopActionCard label="Lihat Masalah" onclick={() => {
                for (let i = 0; i < menuClick.length; i++) {
                    menuClick[i] = false;
                }
                menuClick[1] = true;
                subMenu.pengaturan = -1;
                subMenu.laporan = -1;
                }}>
                <div class="flex flex-col w-full h-fit justify-start gap-2">
                    <div class="flex w-full h-fit justify-center items-center">
                        <div class="w-6 h-6 bg-red-600 rounded-md me-3"></div>
                        <h2 class="text-white text-4xl font-bold">Masalah : {3} Unit</h2>
                    </div>
                </div>
            </TopActionCard>
            <ActionCard useSVG={false} label="Lihat Absensi" class="bg-gradient-to-b from-green-500 via-green-600 to-green-700 w-full" onclick={() => {
                for (let i = 0; i < menuClick.length; i++) {
                    menuClick[i] = false;
                }
                menuClick[2] = true;
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
            }}>
                {#if (addAccount && !form?.horay) || ((editAkun || editAkun.trim() !== '') && !form?.horay)}
                    <form action="?/{((editAkun || editAkun.trim() !== '')) ? 'editAccount' : 'addAccount'}" method="post" class="flex flex-col w-full max-w-sm h-fit gap-2" use:enhance={() => {
                        return async ({update}) => {
                            await update();
                            emptiedArray(userItems);
                            form?.dataAkun?.forEach((data) => {
                                userItems.push({
                                    id: data.id,
                                    name: data.username.toLocaleUpperCase(),
                                    name2: accountTypeMap[data.accountType] || 'Tidak Dikenali',
                                    event: (() => {
                                        pengaturanClick2();
                                        editAkun = data.username;
                                        editAkunId = data.id;
                                    }),
                                    editEvent: (() => {
                                        editAkun = data.username;
                                        editAkunId = data.id;
                                        forAccount = -1;
                                        editData = true;
                                        getData = false;
                                    })
                                })
                            });
                            getData = true;
                            
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
                        <input type="text" name="Username" id="username" value={((editAkun || editAkun.trim() !== '')) ? editAkun : ''} required>
                        <label for="">Password: </label>
                        <input type="password" name="Password" id="password" required>
                        <input type="hidden" name="editAkunId" class="" value={(editAkunId.trim() !== '') ? editAkunId : ''}>
                        <button type="submit" class="flex w-full h-fit bg-gradient-to-b from-green-500 via-green-600 to-green-700 justify-center items-center text-center text-2xl rounded-2xl font-sans"> SUBMIT </button>
                    </form>
                {:else if getData}
                    <MessageBox title="Berhasil" type="info" buttonType="ok" 
                        handleResult={
                            () => {
                                if (!pengaturanAturan2[0] && pengaturanAturan2[1]) {
                                    pengaturanClick2();
                                    addAccount = false;
                                    forAccount = 0;
                                    return;
                                }
                                getData = false;    
                            }
                        }
                    >
                        <div class="w-full h-fit flex justify-between items-center object-center text-center">
                            <p class=" font-bold text-amber-300">Sudah berhasil tambah akun</p>
                        </div>
                    </MessageBox>
                {/if}
            </ListingComp>
        <!-- HERE LAY THE ADD UNIT -->
        {:else if subMenu.pengaturan == 2 && menuClick[4]}
            <ListingComp disableAddButton={false} editable={false} items={[]} ifItems={true} ifOther={false} itemEdit={false} title={subMenu.titleSubMenu}>

            </ListingComp>
        <!-- HERE LAY THE ADD AGENT -->
        {:else if subMenu.pengaturan == 2 && menuClick[5]}
            <ListingComp disableAddButton={false} editable={false} items={[]} ifItems={true} ifOther={false} itemEdit={false} title={subMenu.titleSubMenu}>

            </ListingComp>
        {:else}
            <ListingComp disableAddButton={true} editable={false} items={pengaturanItems} ifItems={pengaturanAturan[0]} ifOther={pengaturanAturan[1]} title={subMenu.titleSubMenu} itemEdit={itemEdit} selectedItemsID = {subMenu.currentItemEditID}>

            </ListingComp>
        {/if}
    {:else if subMenu.pengaturan < 0 && subMenu.laporan < 0}
        {#if menuClick[0]}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={true} title="Room" itemEdit={false} >

        </ListingComp>
        {:else if menuClick[1]}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={true} title="Masalah" itemEdit={false} >
            
        </ListingComp>
        {:else if menuClick[2]}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={true} title="Absensi" itemEdit={false} >
            
        </ListingComp>
        {/if}
    {/if}
</div>