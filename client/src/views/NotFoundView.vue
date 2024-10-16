<template>
  <MozUtilLayout>
    <div class="content">
      <h1>{{ $t('mozfest.notFound.title') }}</h1>
      <p>{{ $t('mozfest.notFound.info') }}</p>
    </div>
  </MozUtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MozUtilLayout from '@/components/MozUtilLayout.vue'

export default defineComponent({
  components: { MozUtilLayout },
})
</script>
