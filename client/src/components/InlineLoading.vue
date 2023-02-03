<template>
  <section class="section is-large">
    <div class="container">
      <h1 class="title has-text-centered">
        <slot>
          {{ $t('mozfest.general.loading') }}
        </slot>
      </h1>
    </div>
  </section>
</template>
