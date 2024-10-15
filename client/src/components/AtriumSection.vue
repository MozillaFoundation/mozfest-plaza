<template>
  <div class="atriumSection">
    <img v-if="image" class="atriumSection-image" :src="image" />
    <div class="atriumSection-content">
      <div class="content">
        <h3 v-if="title">{{ title }}</h3>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

export default defineComponent({
  props: {
    title: { type: String as PropType<string | null>, default: null },
    image: { type: String as PropType<string | null>, default: null },
  },
})
</script>

<style lang="scss">
.atriumSection {
  margin: 2em 0;

  @include mobile {
    .atriumSection-image {
      width: 100px;
      height: 100px;
    }
  }

  &:after {
    content: '';
    display: table;
    clear: both;
  }
}
.atriumSection-image {
  float: left;
  margin-right: 1em;
  width: 150px;
  height: 150px;
}
</style>
