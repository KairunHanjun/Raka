<script lang="ts">
	import { createRawSnippet, type Snippet } from "svelte";
	import ActionCard from "../../../comp/actionCard.svelte";
	import Header from "../../../comp/header.svelte";
	import ListingComp from "../../../comp/listingComp.svelte";
	import TopActionCard from "../../../comp/topActionCard.svelte";

  type UnitItem = {
    id: number | string;
    name: string;
    name2: string;
    event: void | (() => {}) | (() => void);
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
        }
    },
    {
        id: 1,
        name: 'Masalah',
        name2: '',
        event: () => {
            itemEdit = true;
            subMenu.currentItemEditID = 1;
            subMenu.titleSubMenu = 'Masalah';
        }
    },
    {
        id: 2,
        name: 'Absensi',
        name2: '',
        event: () => {
            itemEdit = true;
            subMenu.currentItemEditID = 2;
            subMenu.titleSubMenu = 'Absensi';
        }
    }
    ]);

  const pengaturanItems: UnitItem[] = $state([
    {
        id: 0,
        name: 'Edit Akun',
        name2: '',
        event: () => {
            itemEdit = true;
            subMenu.currentItemEditID = 0;
            subMenu.titleSubMenu = 'Edit Akun';
        }
    },
    {
        id: 1,
        name: 'Edit Unit',
        name2: '',
        event: () => {
            itemEdit = true;
            subMenu.currentItemEditID = 1;
            subMenu.titleSubMenu = 'Edit Unit';
        }
    },
    {
        id: 2,
        name: 'Edit Agent',
        name2: '',
        event: () => {
            itemEdit = true;
            subMenu.currentItemEditID = 2;
            subMenu.titleSubMenu = 'Edit Agent';
        }
    }
])

  interface SubMenu {
    pengaturan: number;
    laporan: number;
    currentItemEditID: number;
    titleSubMenu: string;
  }
    let lihatRoom: boolean = $state(false)
    let lihatAbsensi: boolean = $state(false)
    let lihatMasalah: boolean = $state(false)
    let subMenu: SubMenu = $state({pengaturan: 0, laporan: 0, currentItemEditID: -1, titleSubMenu: ""});
    let itemEdit: boolean = $state(false);
</script>

<div class="h-fit w-screen flex flex-col justify-center items-center gap-4">
    <Header onclick={() => {
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
            lihatRoom=false;lihatAbsensi=false;lihatMasalah=false;
            subMenu.pengaturan = 0;
            subMenu.laporan = 0;
        }
    }}/>
    {#if subMenu.pengaturan === 0 && subMenu.laporan === 0}
        <div class="h-fit w-fit flex flex-col justify-center items-center gap-4">
            <TopActionCard label="Lihat Room" onclick={() => {
                lihatRoom=true;lihatAbsensi=false;lihatMasalah=false;
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
                lihatRoom=false;lihatAbsensi=false;lihatMasalah=true;
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
            <ActionCard useSVG={false} label="Lihat Absensi" class="bg-green-500 w-full" onclick={() => {
                lihatRoom=false;lihatAbsensi=true;lihatMasalah=false;
                subMenu.pengaturan = -1;
                subMenu.laporan = -1;
                }}/>
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <footer class="w-full h-fit inset-x-0 bottom-0 rounded-t-2xl bg-gradient-to-r from-blue-600 to-indigo-800 flex items-center justify-around z-40">
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
        <ListingComp editable={false} items={laporanItems} ifItems={true} ifOther={false} title={subMenu.titleSubMenu} itemEdit={itemEdit} selectedItemsID={subMenu.currentItemEditID}>
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
    {:else if subMenu.pengaturan >= 1 && subMenu.laporan === 0}
        <ListingComp editable={false} items={pengaturanItems} ifItems={true} ifOther={false} title={subMenu.titleSubMenu} itemEdit={itemEdit} selectedItemsID = {subMenu.currentItemEditID}>
            <section>
                
            </section>
        </ListingComp>
    {:else if subMenu.pengaturan < 0 && subMenu.laporan < 0}
        {#if lihatRoom}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={true} title="Room" itemEdit={false} >

        </ListingComp>
        {:else if lihatMasalah}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={true} title="Masalah" itemEdit={false} >
            
        </ListingComp>
        {:else if lihatAbsensi}
        <ListingComp editable={false} items={[]} ifItems={false} ifOther={true} title="Absensi" itemEdit={false} >
            
        </ListingComp>
        {/if}
    {/if}
</div>