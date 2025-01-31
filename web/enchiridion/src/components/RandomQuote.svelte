<script>
import { onMount } from "svelte";
import data from "../data/enchiridion.json";

let randomKey;
let randomValue;

function getRandomKey() {
  const keys = Object.keys(data);
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
}

function updateRandomQuote() {
  randomKey = getRandomKey();
  randomValue = data[randomKey];
}

onMount(() => {
  updateRandomQuote();
});
</script>

<div>
  <button on:click={updateRandomQuote}>Shuffle</button>
  {#if randomKey && randomValue}
    <p>{randomKey}: {randomValue}</p>
  {/if}
</div>
