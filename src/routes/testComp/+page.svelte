<script lang='ts'>
	import ActionCard from "$lib/comp/actionCard.svelte";
	import Header from "$lib/comp/header.svelte";
	import ListingComp from "$lib/comp/listingComp.svelte";
	import MessageBox from "$lib/comp/messageBox.svelte";
  import SelamatDatang from "$lib/comp/selamatDatang.svelte";
	import TopActionCard from "$lib/comp/topActionCard.svelte";
  let buttonText = ["Front Office", "House Keeping", "Teknisi", "Host"]
  let selected = $state("Loading");
  let testChangeable = 0;
  let dialog: any;
  type UnitItem = {
    id: number | string;
    name: string;
    name2: string;
    event: void | (() => {}) | (() => void) | any;
    editEvent: void | (() => {}) | (() => void) | any;
  };

  let showThisDialog = $state(false);
  const items: UnitItem[] = [{
    id: 0,
    name: 'QB - 02/12A',
    name2: '',
    event: () => {},
    editEvent: () => {}
  }
  ]

  let object = $state({back: false})

</script>
<form name="testForm" class="text-white">
  <p>Choose to test:</p>
  <label>
	<input type="radio" name="test" value="selamatDatang" bind:group={selected}> test Selamat Datang
  </label><br>
  <label>
	<input type="radio" name="test" value="loginForm" bind:group={selected}> test Login
  </label><br>
  <label>
	<input type="radio" name="test" value="listingCompItems" bind:group={selected}> test Scrollbar Items
  </label><br>
  <label>
	<input type="radio" name="test" value="listingCompOthers" bind:group={selected}> test Scrollbar Other
  </label><br>
  <label>
	<input type="radio" name="test" value="kartuAksi" bind:group={selected}> test Kartu Aksi
  </label><br>
  <label>
	<input type="radio" name="test" value="topKartuAksi" bind:group={selected}> test Kartu Aksi Atas
  </label><br>
  <label>
	<input type="radio" name="test" value="headerCuy" bind:group={selected}> test Header
  </label><br>
  <label>
	<input type="radio" name="test" value="messageBox" bind:group={selected}> test MessageBox
  </label><br>
</form>

{#if selected === "selamatDatang"}
	<SelamatDatang sayText1="Selamat Datang" text1Size="2rem" text2Size="1rem" text1Bold={true} text2Say="Login Sebagai" />
{:else if selected === "loginForm"}
  <div class=" text-white">
    {#if object.back} 
      
      <p>You now login</p>
    {:else}
      <button onclick={() => {
        object.back = !object.back;
      }}>
        <p>Click me to go to Login</p>
      </button>
      <p>You now in back</p>
    {/if}
  </div>
{:else if selected === "listingCompItems"}
    <ListingComp editable={true} items={items} ifItems={true} ifOther={false} itemEdit={false}/>
{:else if selected == "listingCompOthers"}
    <ListingComp ifOther={true} ifItems={false} itemEdit={false}> 
      <div class="flex-col w-full h-fit justify-between">
        <form action="" method="post">
          <div class="">
            <p>Nama Unit: </p>
            <input type="text" name="unitName" class="w-full flex h-7">
          </div>
          <div class="flex py-2 ">
            <button class="flex rounded-[5px] w-full h-fit mt-auto bg-blue-400 items-center text-center justify-center"
            onsubmit={() => {}}>
              <p>
                SUBMIT
              </p>
            </button>
          </div>
        </form>
      </div>
    </ListingComp>
{:else if selected == "kartuAksi"}
    <ActionCard label="HelloWorld" />
{:else if selected == "topKartuAksi"}
<!-- Kartu Informasi Atas -->
<TopActionCard label="Pilih Room">
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
{:else if selected == "headerCuy"}
<Header />
{:else if selected == "messageBox"}
  {#if showThisDialog}
    <MessageBox title="Hello World" type="info" buttonType="yesno" handleResult={(thisDialogResult: any) => {
      const userChoice = thisDialogResult.detail.result;
      
      showThisDialog = false;
    }}>
      <p class="">Are you sure want to quit?</p>
    </MessageBox>
  {/if}
<button onclick={() => {
  
  showThisDialog = true;
}} class="text-white w-fit h-fit rounded-2xl bg-amber-600">Click me to show</button>
{/if}