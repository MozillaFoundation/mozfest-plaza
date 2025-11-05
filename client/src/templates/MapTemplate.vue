<template>
  <div class="mapTemplate appLayout-main section flow">
    <BoxContent>
      <div class="content">
        <MozApiContent :slug="config.name" />
      </div>
    </BoxContent>

    <LibreMap
      :center="config.options.center"
      :source="config.options.tiles"
      :zoom="config.options.zoom"
      :min-zoom="config.options.minZoom"
      :bounds="config.options.bounds"
      @setup="setupMap"
    />
  </div>
</template>

<script lang="ts">
import maplibre from 'maplibre-gl'
import { defineComponent, type PropType } from 'vue'

import LibreMap from '@/components/LibreMap.vue'
import type { MapOptions, PageConfig } from '@/lib/module.js'
import { BoxContent } from '@openlab/deconf-ui-toolkit'
import MozApiContent from '@/components/MozApiContent.vue'

type Config = PageConfig<string, MapOptions>

const icons = [
  'blue',
  'food',
  'green',
  'magenta',
  'medical',
  'purple',
  'red',
  'toilet',
  'yellow',
]

async function addIcon(map: maplibre.Map, icon: string) {
  const url = `/maps/icon-${icon}.png`
  // console.debug('icon', icon, url)
  const image = await map.loadImage(url)
  map.addImage(icon, image.data)
}

export default defineComponent({
  components: { LibreMap, BoxContent, MozApiContent },
  props: {
    config: { type: Object as PropType<Config>, required: true },
  },
  methods: {
    async setupMap(map: maplibre.Map) {
      // for (const icon of icons) {
      //   const url = `/maps/icon-${icon}.png`
      //   console.debug('icon', icon, url)
      //   const image = await map.loadImage(url)
      //   map.addImage(icon, image.data)
      // }

      await Promise.all(icons.map((n) => addIcon(map, n)))

      const source = 'annotations'

      map.addControl(
        new maplibre.GeolocateControl({
          trackUserLocation: true,
        }),
        'top-right'
      )

      map.addSource(source, {
        type: 'geojson',
        data: this.config.options.annotations,
      })

      // Outline polygons
      map.addLayer({
        id: 'outline',
        source,
        type: 'line',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'line-color': ['get', 'theme'],
          'line-width': 2,
        },
      })

      // fill polygons
      map.addLayer({
        id: 'fill',
        source,
        type: 'fill',
        filter: ['==', ['geometry-type'], 'Polygon'],
        paint: {
          'fill-color': ['get', 'theme'],
          'fill-opacity': 0.2,
        },
      })
      map.addLayer({
        id: 'mozfest-poi',
        type: 'symbol',
        source,
        filter: ['all', ['==', ['geometry-type'], 'Point']],
        layout: {
          'text-field': ['get', 'title'],
          'text-font': ['Inter Medium'],
          'text-offset': [0, 2],
          'text-size': 12,
          'text-justify': 'auto',
          'icon-image': ['get', 'icon'],
          'icon-size': 0.5,
        },
        paint: {
          'text-halo-color': ['get', 'theme'],
          'text-color': 'white',
          'text-halo-width': 1,
        },
      })

      // Hide maplibre toilets
      map.removeLayer('pois')

      map.on('mouseenter', 'mozfest-poi', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'mozfest-poi', () => {
        map.getCanvas().style.cursor = ''
      })

      // Navigate to URLs from poi
      map.on('click', 'mozfest-poi', (e) => {
        for (const feature of e.features ?? []) {
          if (typeof feature.properties.url === 'string') {
            location.href = feature.properties.url
          }
        }
      })

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'points-of-interest', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'points-of-interest', () => {
        map.getCanvas().style.cursor = ''
      })

      console.debug(map.getStyle().layers)
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

.mapTemplate .content details {
  border: none;
  padding: 0;
}

.mapTemplate .content summary {
  margin-inline: -1em;
  padding-inline: 1em;
  margin-block-start: -1em;
  padding-block-start: 1em;
}

@media (max-width: 640px) {
  .mapTemplate .iframeEmbed {
    padding-bottom: 150%;
  }
}
</style>
