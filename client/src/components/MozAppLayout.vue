<template>
  <AppLayout
    :app-settings="settings!"
    :user="user ?? undefined"
    :routes="routes"
    :nav-links="navLinks"
    class="mozAppLayout"
  >
    <template v-slot:brandA>
      <MozfestLogo />
    </template>
    <!-- <MozillaLogo slot="brandB" /> -->

    <template v-slot:languageControl>
      <LanguageControl />
    </template>

    <template v-slot:brandC>
      <!-- <router-link :to="atriumRoute">
        <MozfestSquareLogo />
      </router-link> -->
    </template>

    <template v-slot:main>
      <slot></slot>
      <MozPageFooter />
    </template>
  </AppLayout>
</template>

<script lang="ts">
import { defineComponent, type Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { PageFlag } from '@openlab/deconf-shared'
import {
  AppLayout,
  type AppRoute,
  localiseFromObject,
  Routes,
} from '@openlab/deconf-ui-toolkit'

import MozfestLogo from '@/components/MozfestLogo.vue'
// import MozillaLogo from '@/components/MozillaLogo.vue'
// import MozfestSquareLogo from '@/components/MozfestSquareLogo.vue'
import MozPageFooter from '@/components/MozPageFooter.vue'
import LanguageControl from '@/components/LanguageControl.vue'

import ArtsIcon from '@/icons/ArtsIcon.vue'
import ExpoIcon from '@/icons/ExpoIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import HelpDeskIcon from '@/icons/HelpDeskIcon.vue'
import MapsIcon from '@/icons/MapsIcon.vue'
import PlazaIcon from '@/icons/PlazaIcon.vue'
import ScheduleIcon from '@/icons/ScheduleIcon.vue'
import MyScheduleIcon from '@/icons/MyScheduleIcon.vue'
import MapIcon from '@/icons/MapIcon.vue'
import { ExtraRoutes, mapApiState, pages } from '@/lib/module'

interface RouteIntermediate {
  title: string
  name: string
  icon: Component
  pageFlag?: PageFlag
}

export default defineComponent({
  name: 'MozAppLayout',
  components: {
    AppLayout,
    MozfestLogo,
    // MozillaLogo,
    // MozfestSquareLogo,
    MozPageFooter,
    LanguageControl,
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'settings']),
    navLinks(): string[] {
      const links: string[] = []
      if (this.settings?.navigation.showInterpret) links.push('interpret')
      if (this.settings?.navigation.showLogin) links.push('login')
      if (this.settings?.navigation.showProfile) links.push('profile')
      if (this.settings?.navigation.showRegister) links.push('register')
      return links
    },
    routes(): AppRoute[] {
      if (!this.settings) return []

      // TODO: migrate this toward @/data/pages.json
      const routes: RouteIntermediate[] = [
        {
          title: this.pageTitle('plaza'),
          name: Routes.Atrium,
          icon: PlazaIcon,
          pageFlag: this.settings.atrium,
        },
        {
          title: this.pageTitle('schedule'),
          name: Routes.Schedule,
          icon: ScheduleIcon,
          pageFlag: this.settings.schedule,
        },
        {
          title: this.$t('mozfest.mySchedule.title') as string,
          name: ExtraRoutes.MySchedule,
          icon: MyScheduleIcon,
          pageFlag: this.settings.mySchedule,
        },
        {
          title: this.pageTitle('arts'),
          name: pages.arts.name,
          icon: ArtsIcon,
          pageFlag: this.settings.arts,
        },
        {
          title: this.pageTitle('expo'),
          name: pages.expo.name,
          icon: ExpoIcon,
          pageFlag: this.settings.expo,
        },
        {
          title: this.$t('mozfest.searchView.title') as string,
          name: ExtraRoutes.Search,
          icon: SearchIcon,
          pageFlag: this.settings.search,
        },
        {
          title: this.pageTitle('map'),
          name: pages.map.name,
          icon: MapIcon,
          pageFlag: this.settings.map,
        },
        {
          title: this.pageTitle('helpDesk'),
          name: Routes.HelpDesk,
          icon: HelpDeskIcon,
          pageFlag: this.settings.helpDesk,
        },
      ]

      return routes
        .filter((r) => r.pageFlag?.visible)
        .map((r) => ({
          title: r.title,
          name: r.name,
          icon: r.icon,
          enabled: r.pageFlag?.enabled == true,
        }))
    },
    atriumRoute(): RouteLocationRaw {
      return { name: Routes.Atrium }
    },
  },
  methods: {
    pageTitle(name: string) {
      return localiseFromObject(this.$i18n.locale, pages[name].title) as string
    },
  },
})
</script>
