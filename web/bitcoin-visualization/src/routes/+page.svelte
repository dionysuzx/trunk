<script lang="ts">
import { onMount } from "svelte";
import CryptoJS from "crypto-js";
import BlockchainVisualization from "$lib/components/BlockchainVisualization.svelte";

interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
}

interface BlockData {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  nonce: number;
  merkleRoot: string;
}

interface BlockchainBlock {
  index: number;
  hash: string;
  previousHash: string;
  nonce: number;
  transactions: number; // Number of transactions in block
}

// Constants for block limits (actual Bitcoin values)
const MAX_BLOCK_SIZE_MB = 1; // Traditional 1MB limit (simplified from SegWit)
const BYTES_PER_TX = 250; // Average transaction size in bytes (simplified)
const MAX_BLOCK_SIZE_BYTES = MAX_BLOCK_SIZE_MB * 1024 * 1024;

// Block header structure
let blockData: BlockData = {
  index: 1,
  timestamp: Date.now(),
  transactions: [],
  previousHash: "0".repeat(64),
  nonce: 0,
  merkleRoot: "0".repeat(64),
};

// Add pending transactions
let pendingTransactions: Transaction[] = [];
let currentBlockSize = 0; // Track current block size in bytes

function getTransactionSize(tx: Transaction): number {
  // Simplified size calculation (in reality, varies based on inputs/outputs)
  return BYTES_PER_TX;
}

function updateBlockData() {
  // Keep block data in sync with pending transactions
  blockData = {
    ...blockData,
    transactions: [...pendingTransactions],
    merkleRoot: calculateMerkleRoot(pendingTransactions),
  };
  currentHash = calculateHash(blockData);
}

function calculateMerkleRoot(transactions: Transaction[]): string {
  if (transactions.length === 0) return "0".repeat(64);

  // Simple merkle root calculation (in reality, Bitcoin uses double SHA256)
  const txHashes = transactions.map((tx) =>
    CryptoJS.SHA256(JSON.stringify(tx)).toString(),
  );
  return CryptoJS.SHA256(txHashes.join("")).toString();
}

// Modified to include merkle root in block header
function calculateHash(block: typeof blockData): string {
  const { index, timestamp, merkleRoot, previousHash, nonce } = block;
  const blockHeader = `${index}${timestamp}${merkleRoot}${previousHash}${nonce}`;
  return CryptoJS.SHA256(blockHeader).toString();
}

// Target is a 256-bit number that the block hash must be below
// For simplicity, we represent it as leading zeros
let targetZeros = "000"; // Default: 3 leading zeros
let mining = false;
let currentHash = "";
let miningInterval: ReturnType<typeof setInterval>;
let blocks: BlockchainBlock[] = [];
let hashRate = 0;
let lastTime = Date.now();
let hashCount = 0;

// Mining settings
let miningSpeed = 85; // 85 hashes per interval * (1000/50ms) = 1700 hashes/sec
let intervalMs = 50; // 50ms interval (slower updates for better visualization)

function updateHashRate() {
  const now = Date.now();
  const timeDiff = (now - lastTime) / 1000;
  hashRate = Math.round(hashCount / timeDiff);
  lastTime = now;
  hashCount = 0;
}

function mine() {
  if (mining) {
    // Try multiple hashes based on mining speed setting
    for (let i = 0; i < miningSpeed; i++) {
      blockData.nonce++;
      currentHash = calculateHash(blockData);
      hashCount++;

      if (currentHash.startsWith(targetZeros)) {
        mining = false;
        clearInterval(miningInterval);
        addBlockToChain();
        break;
      }
    }
  }
}

function startMining() {
  // Only copy transactions when starting fresh (not resuming from pause)
  if (
    !mining &&
    pendingTransactions.length > 0 &&
    blockData.transactions.length === 0
  ) {
    blockData.transactions = [...pendingTransactions];
    blockData.merkleRoot = calculateMerkleRoot(blockData.transactions);
    currentBlockSize = pendingTransactions.reduce(
      (sum, tx) => sum + getTransactionSize(tx),
      0,
    );
    pendingTransactions = [];
  }

  mining = true;
  lastTime = Date.now();
  hashCount = 0;
  miningInterval = setInterval(() => {
    mine();
    updateHashRate();
  }, intervalMs);
}

function stopMining() {
  mining = false;
  clearInterval(miningInterval);
}

function generateRandomTransactions() {
  // Clear existing transactions
  pendingTransactions = [];
  currentBlockSize = 0;

  // Generate a random number of transactions between 1000 and 3000
  // (typical Bitcoin block has ~2000-3000 transactions)
  const numTransactions = 1000 + Math.floor(Math.random() * 2001); // 1000 to 3000

  const sampleAddresses = [
    "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX",
    "1HLoD9E4SDFFPDiYfNYnkBLQ85Y51J3Zb1",
  ];

  for (let i = 0; i < numTransactions; i++) {
    // Generate a more realistic amount:
    // 80% chance of 0.1 to 10 BTC
    // 15% chance of 10 to 1000 BTC
    // 5% chance of 1000 to 5000 BTC
    const rand = Math.random();
    let amount: number;
    if (rand < 0.8) {
      amount = 0.1 + Math.random() * 9.9; // 0.1 to 10 BTC
    } else if (rand < 0.95) {
      amount = 10 + Math.random() * 990; // 10 to 1000 BTC
    } else {
      amount = 1000 + Math.random() * 4000; // 1000 to 5000 BTC
    }

    const newTx = {
      from: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
      to: sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)],
      amount: amount,
      timestamp: Date.now(),
    };

    const txSize = getTransactionSize(newTx);
    if (currentBlockSize + txSize <= MAX_BLOCK_SIZE_BYTES) {
      pendingTransactions = [...pendingTransactions, newTx];
      currentBlockSize += txSize;
    } else {
      break; // Stop if we hit the block size limit
    }
  }

  updateBlockData();
}

function addBlockToChain() {
  blocks = [
    ...blocks,
    {
      index: blockData.index,
      hash: currentHash,
      previousHash: blockData.previousHash,
      nonce: blockData.nonce,
      transactions: blockData.transactions.length, // Add transaction count to block visualization
    },
  ];

  // Prepare next block
  blockData = {
    index: blockData.index + 1,
    timestamp: Date.now(),
    transactions: [], // Start with empty transactions for the next block
    previousHash: currentHash,
    nonce: 0,
    merkleRoot: "0".repeat(64),
  };

  // Generate new transactions for the next block
  generateRandomTransactions();
}

function handleDifficultyChange(event: Event) {
  const input = event.target as HTMLInputElement;
  targetZeros = "0".repeat(Number.parseInt(input.value, 10));
}

onMount(() => {
  currentHash = calculateHash(blockData);
  generateRandomTransactions();
});
</script>

<main class="container">
  <h1>Bitcoin Mining Visualization</h1>
  
  <div class="mining-container">
    <div class="top-row">
      <div class="settings-panel">
        <h2>Mining Settings</h2>
        <p class="panel-hint">Bitcoin mining finds a special number (nonce) that creates a hash meeting the network's difficulty target</p>
        <div class="settings-grid">
          <div class="setting">
            <label for="difficulty">Mining Difficulty</label>
            <div class="setting-control">
              <input 
                type="range" 
                id="difficulty" 
                min="1" 
                max="6" 
                bind:value={targetZeros.length}
                disabled={mining}
                on:input={handleDifficultyChange}
              />
              <span class="setting-value">{targetZeros.length} zeros</span>
            </div>
            <p class="setting-hint">Number of leading zeros required (higher = harder, real Bitcoin ≈ 19)</p>
          </div>

          <div class="setting">
            <label for="hashrate">Hash Rate</label>
            <div class="setting-control">
              <input 
                type="range" 
                id="hashrate" 
                min="5" 
                max="150" 
                step="5"
                bind:value={miningSpeed}
                disabled={mining}
              />
              <span class="setting-value">{(miningSpeed * (1000/intervalMs)).toFixed(0)} hashes/sec</span>
            </div>
            <p class="setting-hint">Hash rate of this miner (higher = faster mining, real miners ≈ 100 TH/sec)</p>
          </div>
        </div>
      </div>
    </div>

    <div class="info-row">
      <div class="transaction-pool card">
        <h2>Transaction Pool</h2>
        <div class="pool-stats">
          <p class="hint">Transactions waiting to be included in the next block</p>
          <div class="stats">
            <span>Block Size: {(currentBlockSize / 1024).toFixed(1)}KB/{MAX_BLOCK_SIZE_MB * 1024}KB</span>
            <span>Transactions: {pendingTransactions.length}</span>
          </div>
        </div>
        <div class="pool-controls">
          <button class="secondary" 
                  on:click={generateRandomTransactions}
                  disabled={currentBlockSize + (BYTES_PER_TX * 3) > MAX_BLOCK_SIZE_BYTES || mining}>
            Select Random Transactions From Pool
          </button>
        </div>
        
        {#if pendingTransactions.length === 0}
          <div class="transactions">
            <p class="empty-pool">No pending transactions</p>
          </div>
        {:else}
          <div class="sample-hint-container">
            <p class="sample-hint">Showing {Math.min(5, pendingTransactions.length)} of the transactions selected for the block</p>
          </div>
          <div class="transactions">
            {#each pendingTransactions.slice(0, 5) as tx}
              <div class="transaction">
                <div class="tx-header">
                  <span class="tx-amount">{tx.amount.toFixed(2)} BTC</span>
                  <span class="tx-size">{getTransactionSize(tx)} bytes</span>
                </div>
                <div class="tx-addresses">
                  <div class="tx-address">
                    <span class="address-label">From:</span>
                    <span class="address-value">{tx.from.substring(0, 6)}...{tx.from.slice(-6)}</span>
                  </div>
                  <div class="tx-address">
                    <span class="address-label">To:</span>
                    <span class="address-value">{tx.to.substring(0, 6)}...{tx.to.slice(-6)}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <div class="block-info card">
        <h2>Current Block Header</h2>
        <p class="hint">Essential data that gets hashed during mining</p>
        <div class="block-details">
          <p>Block Index: {blockData.index}</p>
          <p>Nonce: {blockData.nonce.toLocaleString()}</p>
          <p>Previous Hash: {blockData.previousHash.substring(0, 6)}...{blockData.previousHash.slice(-6)}</p>
          <p>Transactions: {blockData.transactions.length}</p>
          <p>Merkle Root: {blockData.merkleRoot.substring(0, 6)}...{blockData.merkleRoot.slice(-6)}</p>
        </div>
      </div>

      <div class="hash-info card">
        <h2>Current Hash</h2>
        <p class="hint">Mining increments the nonce until enough leading zeros are found</p>
        <div class="hash-visualization">
          {#each currentHash.split('') as char, i}
            <span class="hash-char" class:matching={i < targetZeros.length && char === '0'}>
              {char}
            </span>
          {/each}
        </div>
        <p class="target-info">Target: Hash must start with {targetZeros}</p>
      </div>
    </div>

    <div class="mining-controls">
      {#if !mining}
        <button class="secondary mining-btn" 
                disabled={pendingTransactions.length === 0 && blockData.transactions.length === 0} 
                on:click={startMining}>
          {pendingTransactions.length === 0 && blockData.transactions.length === 0
            ? 'Add Transactions First' 
            : 'Start Mining'}
        </button>
      {:else}
        <button class="mining-btn" on:click={stopMining}>
          Pause Mining
        </button>
      {/if}
    </div>

    <div class="blockchain-view">
      <h3>Blockchain</h3>
      <p class="hint">Each block links to the previous one through its hash, creating an immutable chain</p>
      <BlockchainVisualization {blocks} />
    </div>
  </div>
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.5rem;
    overflow-x: hidden; /* Prevent horizontal scroll from blockchain visualization */
  }

  h1 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    text-align: center;
  }

  h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
  }

  .mining-container {
    display: grid;
    gap: 0.75rem;
  }

  .top-row {
    display: grid;
    grid-template-columns: 1fr;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .settings-panel {
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .settings-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .card {
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    height: 270px;
    display: flex;
    flex-direction: column;
  }

  .transactions {
    height: 190px;
    overflow-y: auto;
    margin: 0.25rem 0;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    flex: 1;
    position: relative;
  }

  .transaction {
    padding: 0.4rem;
    margin-bottom: 0.2rem;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 4px solid #1a73e8;
    font-size: 0.9rem;
  }

  .blockchain-view {
    background: transparent;
    padding: 0;
    box-shadow: none;
    margin-top: -0.75rem;
    width: 100%;
    overflow: hidden;
  }

  .mining-btn {
    width: 100%;
    white-space: nowrap;
  }

  .panel-hint {
    font-size: 0.8rem;
    margin: 0.25rem 0;
  }

  .hint {
    font-size: 0.8rem;
    margin: 0.1rem 0;
  }

  .setting-hint {
    font-size: 0.75rem;
    margin-top: 0.1rem;
  }

  .hash-visualization {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    font-family: monospace;
    justify-content: flex-start;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .hash-char {
    padding: 3px;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 1rem;
  }

  .matching {
    background: #4caf50;
    color: white;
  }

  .target-info {
    margin-top: 1rem;
    font-family: monospace;
    color: #666;
  }

  .transaction-pool {
    background: #f8f9fa;
    padding: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }

  .pool-stats {
    margin-bottom: 0.25rem;
  }

  .stats {
    display: flex;
    justify-content: space-between;
    background: #e8f0fe;
    padding: 0.4rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #1557b0;
    margin-top: 0.15rem;
  }

  .tx-size {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.25rem;
    text-align: right;
  }

  .pool-controls {
    display: flex;
    margin: 0.25rem 0;
  }

  .pool-controls button {
    flex: 1;
  }

  button {
    padding: 0.5rem 0.75rem;
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button:hover {
    background: #1557b0;
  }

  button.secondary {
    background: #f8f9fa;
    color: #1a73e8;
    border: 1px solid #1a73e8;
  }

  button.secondary:hover {
    background: #e8f0fe;
  }

  button:disabled,
  button.secondary:disabled {
    background: #f8f9fa;
    border: 1px solid #ccc;
    color: #666;
    cursor: not-allowed;
  }

  .setting {
    display: grid;
    gap: 0.5rem;
  }

  .setting label {
    font-weight: 500;
    color: #1a73e8;
  }

  .setting-control {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .setting-control input[type="range"] {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: #e8f0fe;
    border-radius: 3px;
    outline: none;
  }

  .setting-control input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 18px;
    background: #1a73e8;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s;
  }

  .setting-control input[type="range"]:disabled {
    opacity: 0.5;
  }

  .setting-control input[type="range"]:disabled::-webkit-slider-thumb {
    background: #ccc;
    cursor: not-allowed;
  }

  .setting-value {
    min-width: 4rem;
    padding: 0.25rem 0.5rem;
    background: #e8f0fe;
    border-radius: 4px;
    color: #1557b0;
    font-family: monospace;
    text-align: center;
  }

  .empty-pool {
    text-align: center;
    color: #666;
    padding: 1rem;
  }

  .info-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
  }

  .block-info, .hash-info {
    height: auto;
  }

  .hash-info {
    display: flex;
    flex-direction: column;
  }

  .hash-visualization {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    font-family: monospace;
    justify-content: flex-start;
    align-content: flex-start;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }

  .panel-hint {
    color: #666;
    font-size: 0.9rem;
    margin: 0.5rem 0 1rem;
  }

  .hint {
    color: #666;
    font-size: 0.9rem;
    margin: 0.15rem 0;
  }

  button {
    padding: 0.75rem 1rem;
    background: #1a73e8;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button:hover {
    background: #1557b0;
  }

  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .mining-controls {
    display: flex;
    justify-content: center;
    margin: 0.75rem 0;
  }

  .mining-btn {
    width: 200px;
    white-space: nowrap;
  }

  .block-details {
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .block-details p {
    margin: 0;
    font-family: monospace;
  }

  /* Mobile Responsive Styles */
  @media (max-width: 768px) {
    .container {
      padding: 0.25rem;
      width: 100%;
    }

    h1 {
      font-size: 1.25rem;
    }

    .settings-grid {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .info-row {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }

    .card {
      height: auto;
      min-height: 200px;
    }

    .transaction {
      font-size: 0.8rem;
    }

    .stats {
      flex-direction: column;
      gap: 0.25rem;
    }

    .mining-btn {
      width: 100%;
      max-width: none;
    }

    .hash-visualization {
      padding: 0.5rem;
    }

    .hash-char {
      font-size: 0.8rem;
      padding: 2px;
    }

    .block-details {
      gap: 0.5rem;
      font-size: 0.8rem;
    }

    button {
      height: 40px;
      font-size: 0.9rem;
      padding: 0.5rem 0.75rem;
    }

    .sample-hint {
      color: #666;
      font-size: 0.75rem;
      text-align: center;
      font-style: italic;
    }

    .transactions {
      height: auto;
      max-height: 400px;
    }

    .blockchain-view {
      margin: 0 -0.25rem;
      width: calc(100% + 0.5rem);
    }
  }

  .sample-hint {
    color: #666;
    font-size: 0.8rem;
    margin: 0.5rem 0;
    text-align: center;
    font-style: italic;
    opacity: 0.8;
    letter-spacing: 0.2px;
  }

  .sample-hint-container {
    display: flex;
    justify-content: center;
    padding: 0.25rem 0;
    margin: 0.25rem 0 0 0;
  }

  .sample-hint {
    color: #666;
    font-size: 0.8rem;
    text-align: center;
    font-style: italic;
    opacity: 0.8;
    letter-spacing: 0.2px;
    margin: 0;
  }

  .transactions {
    height: 190px;
    overflow-y: auto;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    flex: 1;
  }
</style>
