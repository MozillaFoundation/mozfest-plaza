<template>
  <UtilLayout>
    <div class="content">
      <h1>{{ $t('mozfest.notFound.title') }}</h1>
      <p>{{ $t('mozfest.notFound.info') }}</p>
    </div>
  </UtilLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import UtilLayout from '@/components/MozUtilLayout.vue'

export default defineComponent({
  components: { UtilLayout },
})
</script>
