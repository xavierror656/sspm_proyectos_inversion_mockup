<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import HeroIcon from '$lib/components/HeroIcon.svelte';

  const navGroups = [
    {
      label: 'Operación',
      items: [
        { href: '/', icon: 'squares-2x2', label: 'Dashboard', hint: 'KPIs' },
        { href: '/projects', icon: 'folder', label: 'Cartera', hint: 'Tabla' },
        { href: '/forms', icon: 'pencil-square', label: 'Captura', hint: 'Forms' },
        { href: '/analysis', icon: 'presentation-chart-line', label: 'Análisis', hint: 'Semáforo' },
        { href: '/movements', icon: 'arrow-trending-up', label: 'Movimientos', hint: 'Simular' },
        { href: '/commitments', icon: 'shopping-cart', label: 'Compromisos', hint: 'Compras' },
        { href: '/redistributions', icon: 'arrows-right-left', label: 'Redistribuciones', hint: 'Remanente' },
        { href: '/alerts', icon: 'exclamation-triangle', label: 'Alertas', hint: 'Riesgos' }
      ]
    },
    {
      label: 'Reportes',
      items: [
        { href: '/reports', icon: 'document-text', label: 'Reportes', hint: 'Mock' },
        { href: '/audit', icon: 'clock', label: 'Auditoría', hint: 'Timeline' }
      ]
    },
    {
      label: 'Configuración',
      items: [
        { href: '/forms#database', icon: 'cog-6-tooth', label: 'Base local', hint: 'JSON' }
      ]
    }
  ];

  $: pathname = $page.url.pathname;
  const isActive = (href) => {
    const full = `${base}${href}`;
    return pathname === full || (href !== '/' && pathname.startsWith(full));
  };
</script>

<div class="app-shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">
        <HeroIcon name="shield-check" size={30} strokeWidth={1.6} />
      </div>
      <div>
        <h1>Investment Portfolio SSPM</h1>
        <p>Panel demo · Filament style</p>
      </div>
    </div>

    <nav class="nav" aria-label="Navegación principal">
      {#each navGroups as group}
        <section class="nav-group" aria-label={group.label}>
          <p class="nav-group-label">{group.label}</p>
          {#each group.items as item}
            <a class:active={isActive(item.href)} href={`${base}${item.href}`}>
              <span class="nav-icon"><HeroIcon name={item.icon} size={20} /></span>
              <span class="nav-label">{item.label}</span>
              <small>{item.hint}</small>
            </a>
          {/each}
        </section>
      {/each}
    </nav>
  </aside>
  <main class="main">
    <slot />
  </main>
</div>
