<script>
  export let color = 'gray';
  export let label = 'Gris';
  export let reason = '';
</script>

<span class="badge {color}" title={reason}>
  <span class="traffic-dot {color}"></span>
  {label}
</span>
