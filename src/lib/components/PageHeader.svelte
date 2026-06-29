<script>
  import HeroIcon from './HeroIcon.svelte';

  export let title = '';
  export let subtitle = '';
</script>

<header class="topbar">
  <div>
    <h2>{title}</h2>
    {#if subtitle}<p>{subtitle}</p>{/if}
  </div>
  <span class="demo-pill"><HeroIcon name="shield-check" size={16} /> Ambiente de validación</span>
</header>
