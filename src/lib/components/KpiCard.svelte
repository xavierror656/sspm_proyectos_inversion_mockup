<script>
  export let label = '';
  export let value = '';
  export let note = '';
</script>

<section class="card kpi-card">
  <div class="kpi-label">{label}</div>
  <div class="kpi-value">{value}</div>
  {#if note}<div class="kpi-note">{note}</div>{/if}
</section>
