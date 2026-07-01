<script>
  import { createEventDispatcher } from 'svelte';
  import HeroIcon from './HeroIcon.svelte';

  export let open = false;
  export let title = '';
  export let subtitle = '';
  export let size = 'md';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function onKeydown(event) {
    if (open && event.key === 'Escape') close();
  }

  function onBackdrop(event) {
    if (event.target === event.currentTarget) close();
  }
</script>

<svelte:window on:keydown={onKeydown} />

{#if open}
  <div class="modal-backdrop" role="presentation" on:click={onBackdrop}>
    <div class="modal modal-{size}" role="dialog" aria-modal="true" aria-label={title}>
      <header class="modal-head">
        <div>
          <h3>{title}</h3>
          {#if subtitle}<p>{subtitle}</p>{/if}
        </div>
        <button class="modal-close" type="button" on:click={close} aria-label="Cerrar modal">
          <HeroIcon name="x-mark" size={18} />
        </button>
      </header>
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
{/if}
