<script>
  export let value = 0;
  export let tone = 'green';
  $: width = Math.max(0, Math.min(100, Number(value || 0)));
</script>

<div class="progress" aria-label="Porcentaje de avance">
  <span class={tone} style={`width:${width}%`}></span>
</div>
