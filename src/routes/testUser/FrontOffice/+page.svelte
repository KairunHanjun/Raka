<script lang="ts">
	import ActionCard from "$lib/comp/actionCard.svelte";
	import Header from "$lib/comp/header.svelte";
	import TopActionCard from "$lib/comp/topActionCard.svelte";


</script>

<div class="h-fit w-screen flex flex-col justify-center items-center gap-4">
    <Header onclick={() => {

    }} />

    <div class="h-fit w-fit flex flex-col justify-center items-center gap-4">
            <TopActionCard label="Lihat Room" onclick={() => {}}>
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
            <div class="h-fit w-full flex justify-between items-center gap-2">
                <ActionCard label="Input Masalah" class="bg-gradient-to-b from-red-600 via-red-700 to-red-800 p-3.5">
                    <svg width="95" height="95" viewBox="0 0 83 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.9794 0.272725L15.5945 51.196H2.5973L1.17685 0.272725H16.9794ZM9.09588 73.9233C6.75213 73.9233 4.73982 73.0947 3.05895 71.4375C1.37808 69.7566 0.549479 67.7443 0.573154 65.4006C0.549479 63.0805 1.37808 61.0919 3.05895 59.4347C4.73982 57.7775 6.75213 56.9489 9.09588 56.9489C11.3449 56.9489 13.3217 57.7775 15.0263 59.4347C16.7308 61.0919 17.5949 63.0805 17.6186 65.4006C17.5949 66.9631 17.1806 68.3954 16.3757 69.6974C15.5945 70.9759 14.5646 72.0057 13.2862 72.7869C12.0078 73.5445 10.611 73.9233 9.09588 73.9233ZM49.4013 0.272725L48.0163 51.196H35.0192L33.5987 0.272725H49.4013ZM41.5178 73.9233C39.174 73.9233 37.1617 73.0947 35.4808 71.4375C33.8 69.7566 32.9714 67.7443 32.995 65.4006C32.9714 63.0805 33.8 61.0919 35.4808 59.4347C37.1617 57.7775 39.174 56.9489 41.5178 56.9489C43.7668 56.9489 45.7436 57.7775 47.4482 59.4347C49.1527 61.0919 50.0168 63.0805 50.0405 65.4006C50.0168 66.9631 49.6025 68.3954 48.7976 69.6974C48.0163 70.9759 46.9865 72.0057 45.7081 72.7869C44.4297 73.5445 43.0329 73.9233 41.5178 73.9233ZM81.8232 0.272725L80.4382 51.196H67.4411L66.0206 0.272725H81.8232ZM73.9396 73.9233C71.5959 73.9233 69.5836 73.0947 67.9027 71.4375C66.2218 69.7566 65.3932 67.7443 65.4169 65.4006C65.3932 63.0805 66.2218 61.0919 67.9027 59.4347C69.5836 57.7775 71.5959 56.9489 73.9396 56.9489C76.1887 56.9489 78.1655 57.7775 79.87 59.4347C81.5746 61.0919 82.4387 63.0805 82.4624 65.4006C82.4387 66.9631 82.0244 68.3954 81.2195 69.6974C80.4382 70.9759 79.4084 72.0057 78.13 72.7869C76.8516 73.5445 75.4548 73.9233 73.9396 73.9233Z" fill="white"/>
                    </svg>
                </ActionCard>
                <ActionCard label="Input Masalah" class="bg-gradient-to-b from-green-600 via-green-700 to-green-800 p-3.5">
                    <svg width="95" height="95" viewBox="0 0 95 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="95" height="95" rx="47.5" fill="#EADDFF"/>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M61.7506 38C61.7506 45.8701 55.3706 52.25 47.5006 52.25C39.6305 52.25 33.2506 45.8701 33.2506 38C33.2506 30.1299 39.6305 23.75 47.5006 23.75C55.3706 23.75 61.7506 30.1299 61.7506 38ZM57.0006 38C57.0006 43.2467 52.7473 47.5 47.5006 47.5C42.2539 47.5 38.0006 43.2467 38.0006 38C38.0006 32.7533 42.2539 28.5 47.5006 28.5C52.7473 28.5 57.0006 32.7533 57.0006 38Z" fill="#4F378A"/>
                        <path d="M47.5006 59.375C32.1239 59.375 19.0226 68.4675 14.032 81.2061C15.2477 82.4133 16.5284 83.5553 17.8684 84.6261C21.5846 72.9308 33.2428 64.125 47.5006 64.125C61.7584 64.125 73.4165 72.9308 77.1328 84.6262C78.4727 83.5553 79.7534 82.4134 80.9692 81.2061C75.9786 68.4675 62.8773 59.375 47.5006 59.375Z" fill="#4F378A"/>
                    </svg>
                </ActionCard>
            </div>
        </div>
</div>