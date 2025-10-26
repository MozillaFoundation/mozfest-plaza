<template>
  <div class="libreMap" ref="container"></div>
</template>

<script lang="ts" setup>
import maplibre from 'maplibre-gl'
import * as pmtiles from 'pmtiles'
import { layers, namedFlavor } from '@protomaps/basemaps'
import {
  shallowRef,
  onMounted,
  onUnmounted,
  markRaw,
  useTemplateRef,
  computed,
  watchEffect,
} from 'vue'
import { once } from '@/lib/module.js'

const container = useTemplateRef('container')

const map = shallowRef<maplibre.Map>()

const props = defineProps<{
  source: string
  center: maplibre.LngLatLike
  zoom: number
  bounds?: [number, number, number, number]
  minZoom?: number
}>()

const addProtocol = once(() => {
  const protocol = new pmtiles.Protocol()
  maplibre.addProtocol('pmtiles', protocol.tile)
})

const emit = defineEmits<{
  (e: 'setup', map: maplibre.Map): void
}>()

// const colorScheme = useColorScheme()

const style = computed<maplibre.StyleSpecification>(() => ({
  version: 8,
  glyphs: 'https://mzf.st/cdn/maps/fonts/{fontstack}/{range}.pbf',
  sources: {
    protomaps: {
      type: 'vector',
      url: props.source,
    },
  },
  layers: layers('protomaps', namedFlavor('light'), { lang: 'en' }),
}))

onMounted(() => {
  addProtocol()
  map.value = markRaw(
    new maplibre.Map({
      container: container.value!,
      style: style.value,
      center: props.center,
      zoom: props.zoom,
      attributionControl: false,
      dragRotate: false,
    })
  )
  map.value.once('styledata', () => emit('setup', map.value!))

  map.value.addControl(new maplibre.NavigationControl({ showCompass: false }))

  map.value.addControl(
    new maplibre.AttributionControl({
      compact: true,
      customAttribution: [
        '<a href="https://maplibre.org/" target="_blank">MapLibre</a>',
        '<a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      ],
    }),
    'bottom-right'
  )
})

watchEffect(() => map.value?.setCenter(props.center))
watchEffect(() => map.value?.setZoom(props.zoom))
watchEffect(() => map.value?.setMinZoom(props.minZoom))
watchEffect(() => map.value?.setStyle(style.value))
watchEffect(() => map.value?.setMaxBounds(props.bounds))

onUnmounted(() => {
  map.value?.remove()
})

defineExpose({ map, container })
</script>

<style lang="scss">
@import 'maplibre-gl/dist/maplibre-gl.css';
</style>
