<script lang='ts'>
	import LoginForm from "../../comp/loginForm.svelte";
  import SelamatDatang from "../../comp/selamatDatang.svelte";
  let buttonText = ["Front Office", "House Keeping", "Teknisi", "Host"]
  let selected = $state("Loading");
  let testChangeable = 0;

  let object = $state({back: false})
  

</script>
<form name="testForm">
  <p>Choose to test:</p>
  <label>
	<input type="radio" name="test" value="selamatDatang" bind:group={selected}> test Selamat Datang
  </label><br>
  <label>
	<input type="radio" name="test" value="loginForm" bind:group={selected}> test Login
  </label><br>
</form>

{#if selected === "logoFront"}
	<SelamatDatang sayText1="Selamat Datang" text1Size="2rem" text2Size="1rem" text1Bold={true} text2Say="Login Sebagai" />
{:else if selected === "loginForm"}
  {#if object.back}
    <LoginForm {object}/>
    <p>You now back</p>
  {:else}
    <button onclick={() => {
      object.back = !object.back;
    }}>
      <p>Go to Login</p>
    </button>
    <p>You now in login</p>
  {/if}
{/if}