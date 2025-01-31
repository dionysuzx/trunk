<script lang="ts">
export let blocks: {
  index: number;
  hash: string;
  previousHash: string;
  nonce: number;
  transactions: number;
}[] = [];

let scrollContainer: HTMLDivElement;

$: if (blocks.length > 0 && scrollContainer) {
  scrollContainer.scrollLeft = scrollContainer.scrollWidth;
}
</script>

<div class="blockchain-wrapper">
  <div class="blockchain-scroll" bind:this={scrollContainer}>
    <div class="blockchain">
      {#each blocks as block, i}
        <div class="block-container">
          <div class="block">
            <div class="block-header">Block {block.index}</div>
            <div class="block-content">
              <div class="block-detail">
                <span class="label">Prev:</span>
                <span class="hash">{block.previousHash.substring(0, 6)}...{block.previousHash.slice(-6)}</span>
              </div>
              <div class="block-detail">
                <span class="label">Hash:</span>
                <span class="hash">{block.hash.substring(0, 6)}...{block.hash.slice(-6)}</span>
              </div>
              <div class="block-detail">
                <span class="label">Nonce:</span>
                <span class="value">{block.nonce.toLocaleString()}</span>
              </div>
              <div class="block-detail">
                <span class="label">Transactions:</span>
                <span class="value">{block.transactions.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {#if i < blocks.length - 1}
            <div class="arrow">→</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .blockchain-wrapper {
    position: relative;
    max-width: 1200px;
    width: 100%;
    margin: 1rem auto;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .blockchain-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 1rem;
    scrollbar-width: thin;
    -ms-overflow-style: -ms-autohiding-scrollbar;
    -webkit-overflow-scrolling: touch;
  }

  .blockchain {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-height: 120px;  /* Reduced height */
    width: max-content;
  }

  .block-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .block {
    width: 200px;  /* Smaller width */
    background: #f8f9fa;
    border: 1.5px solid #1a73e8;
    border-radius: 8px;
    padding: 0.75rem;  /* Smaller padding */
    display: flex;
    flex-direction: column;
    gap: 0.4rem;  /* Smaller gap */
    flex-shrink: 0;
  }

  .block-header {
    font-weight: bold;
    font-size: 13px;  /* Slightly smaller font */
    text-align: center;
    color: #1a73e8;
    margin-bottom: 0.2rem;
  }

  .block-content {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .block-detail {
    display: flex;
    gap: 0.2rem;
    font-family: monospace;
    font-size: 11px;
    line-height: 1.3;
    align-items: center;
  }

  .label {
    color: #666;
  }

  .hash, .value {
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .arrow {
    color: #1a73e8;
    font-size: 20px;  /* Slightly smaller arrow */
    font-weight: bold;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  /* Show minimal scrollbar */
  .blockchain-scroll::-webkit-scrollbar {
    height: 6px;
    display: block;
  }

  .blockchain-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .blockchain-scroll::-webkit-scrollbar-thumb {
    background: #1a73e8;
    border-radius: 3px;
    opacity: 0.8;
  }

  .blockchain-scroll::-webkit-scrollbar-thumb:hover {
    background: #1557b0;
  }

  /* Mobile Responsive Styles */
  @media (max-width: 768px) {
    .blockchain-wrapper {
      margin: 0.5rem auto;
      max-width: 100%;
      width: 100vw;
      position: relative;
      left: 50%;
      right: 50%;
      margin-left: -50vw;
      margin-right: -50vw;
      border-radius: 0;
    }

    .blockchain-scroll {
      padding: 0.5rem;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .blockchain {
      min-height: 100px;
      gap: 0.5rem;
      padding: 0 1rem;
    }

    .block {
      width: 160px;
      padding: 0.5rem;
      gap: 0.3rem;
    }

    .block-header {
      font-size: 12px;
      margin-bottom: 0.1rem;
    }

    .block-detail {
      display: flex;
      gap: 0.2rem;
    }

    .arrow {
      font-size: 16px;
    }
  }
</style>