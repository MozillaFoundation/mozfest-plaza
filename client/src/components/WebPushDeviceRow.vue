<script lang="ts" setup>
import { type WebPushDevice, type WebPushDeviceUpdate } from '@/lib/module.js'
import { computed, ref, watchEffect } from 'vue'

const props = defineProps<{
  device: WebPushDevice
  isCurrent?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', id: number, update: WebPushDeviceUpdate): void
  (e: 'delete', id: number): void
}>()

const categories = ref<string[]>([])
watchEffect(() => {
  categories.value = props.device.categories
})

const hasChanges = computed(
  () => categories.value.join(',') !== props.device.categories.join(',')
)

function onUpdate() {
  emit('update', props.device.id, {
    name: props.device.name,
    categories: categories.value,
  })
}

function onDelete() {
  emit('delete', props.device.id)
}
</script>

<template>
  <div class="webPushDevice">
    <span class="webPushDevice-title">
      <span class="webPushDevice-name">
        {{ device.name }}
      </span>
      <template v-if="isCurrent"> (this device)</template>
    </span>

    <span class="webPushDevice-categories">
      <label>
        <input
          type="checkbox"
          :name="`webPushDevice-${device.id}-categories`"
          v-model="categories"
          value="MySchedule"
        />
        MySchedule events
      </label>
      <label>
        <input
          type="checkbox"
          :name="`webPushDevice-${device.id}-categories`"
          v-model="categories"
          value="Special"
        />
        Special messages
      </label>
    </span>
    <span class="webPushDevice-spacer"></span>
    <button
      class="button is-small is-primary"
      :disabled="!hasChanges"
      @click="onUpdate"
    >
      Update
    </button>
    <button class="button is-small is-danger" @click="onDelete">Delete</button>
  </div>
</template>

<style lang="scss">
.webPushDevice {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25em;
  align-items: center;
}
.webPushDevice-title {
  width: 100%;
}
.webPushDevice-name {
  font-weight: $weight-bold;
  font-size: 1.2em;
}
.webPushDevice-spacer {
  flex: 1;
}
.webPushDevice-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  align-items: center;
}
.webPushDevice + .webPushDevice {
  margin-block-start: 2em;
}
</style>
