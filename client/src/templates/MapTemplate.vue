<template>
  <div class="mapTemplate appLayout-main section">
    <!-- <section class="section"> -->
    <!-- <BoxContent>
          <IframeEmbed
            src="https://www.google.com/maps/d/embed?mid=1DL8-SHjXdL9TRRtAEP3gCQbx9IgyucM&ehbc=2E312F&noprof=1"
          />
        </BoxContent> -->

    <!-- <BoxContent> -->
    <LibreMap
      :center="config.options.center"
      :source="config.options.tiles"
      :zoom="config.options.zoom"
      :min-zoom="config.options.minZoom"
      :bounds="config.options.bounds"
      @setup="setupMap"
    />
    <!-- </BoxContent> -->
    <!-- </section> -->
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import maplibre from 'maplibre-gl'

import type { MapOptions, PageConfig } from '@/lib/module.js'
import LibreMap from '@/components/LibreMap.vue'

type Config = PageConfig<string, MapOptions>

async function getBytes(url: string) {
  const res = await fetch(url)
  return res.bytes()
}

const icons = [
  'blue',
  'food',
  'green',
  'magenta',
  'medical',
  'purple',
  'red',
  'toilets',
  'yellow',
]

export default defineComponent({
  components: { LibreMap },
  props: {
    config: { type: Object as PropType<Config>, required: true },
  },
  methods: {
    async setupMap(map: maplibre.Map) {
      const source = 'annotations'

      map.addSource(source, {
        type: 'geojson',
        data: this.config.options.annotations,
      })

      map.addLayer({
        id: 'anno-line',
        source,
        type: 'line',
        paint: {
          'line-color': ['get', 'theme'],
          'line-width': 2,
        },
      })

      await Promise.all(
        icons.map((icon) => async () => {
          const image = await map.loadImage(`/maps/icon-${icon}.png`)
          map.addImage(icon, image.data)
        })
      )

      console.log('loaded')

      // map.addLayer({
      //   id: 'anno-text',
      //   source,
      //   type: 'symbol',
      //   layout: {
      //     'text-field': ['get', 'name'],
      //   },
      // })
      map.addLayer({
        id: 'anno-fill',
        source,
        type: 'fill',
        paint: {
          'fill-color': ['get', 'theme'],
          'fill-opacity': 0.2,
        },
      })
      // map.addLayer({
      //   id: 'anno-circle',
      //   source,
      //   type: 'circle',
      //   paint: {
      //     'circle-color': ['get', 'theme'],
      //   },
      // })
      map.addLayer({
        id: 'anno-symbol',
        source,
        type: 'symbol',
        layout: {
          // 'text-field': ['get', 'title'],
          // 'text-font': ['Noto Sans Regular'],
          'icon-image': ['get', 'icon'],
        },
      })

      // map.addSource('annotations', {
      //   type: 'geojson',
      //   data: { type: 'FeatureCollection' },
      // })
    },
  },
})
</script>

<style lang="scss">
.mapTemplate {
  background-color: $background;
  display: flex;
  flex-direction: column;
}

.mapTemplate .libreMap {
  // margin: 3rem 3rem;
  flex: 1;
}

@media (max-width: 640px) {
  .mapTemplate .iframeEmbed {
    padding-bottom: 150%;
  }
}
</style>
