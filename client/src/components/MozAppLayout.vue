<template>
  <AppLayout
    :app-settings="settings!"
    :user="user ?? undefined"
    :routes="routes"
    :nav-links="navLinks"
    class="mozAppLayout"
  >
    <template v-slot:brandA>
      <MozillaLogo />
    </template>
    <!-- <MozillaLogo slot="brandB" /> -->

    <template v-slot:languageControl>
      <LanguageControl />
    </template>

    <template v-slot:brandC>
      <router-link :to="atriumRoute">
        <MozfestSquareLogo />
      </router-link>
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

// import MozfestLogo from '@/components/MozfestLogo.vue'
import MozillaLogo from '@/components/MozillaLogo.vue'
import MozfestSquareLogo from '@/components/MozfestSquareLogo.vue'
import MozPageFooter from '@/components/MozPageFooter.vue'
import LanguageControl from '@/components/LanguageControl.vue'

import ArtsIcon from '@/icons/ArtsIcon.vue'
import SearchIcon from '@/icons/SearchIcon.vue'
import HelpDeskIcon from '@/icons/HelpDeskIcon.vue'
import MapsIcon from '@/icons/MapsIcon.vue'
import PlazaIcon from '@/icons/PlazaIcon.vue'
import ScheduleIcon from '@/icons/ScheduleIcon.vue'
import MyScheduleIcon from '@/icons/MyScheduleIcon.vue'
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
    // MozfestLogo,
    MozillaLogo,
    MozfestSquareLogo,
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
          title: this.$t('mozfest.appLayout.atrium') as string,
          name: Routes.Atrium,
          icon: PlazaIcon,
          pageFlag: this.settings.atrium,
        },
        {
          title: this.$t('mozfest.appLayout.schedule') as string,
          name: Routes.Schedule,
          icon: ScheduleIcon,
          pageFlag: this.settings.schedule,
        },
        {
          title: this.$t('mozfest.appLayout.mySchedule') as string,
          name: ExtraRoutes.MySchedule,
          icon: MyScheduleIcon,
          pageFlag: this.settings.mySchedule,
        },
        {
          title: this.$t('mozfest.appLayout.arts') as string,
          name: ExtraRoutes.Arts,
          icon: ArtsIcon,
          pageFlag: this.settings.arts,
        },
        {
          title: this.$t('mozfest.appLayout.search') as string,
          name: ExtraRoutes.Search,
          icon: SearchIcon,
          pageFlag: this.settings.search,
        },
        {
          title: localiseFromObject(
            this.$i18n.locale,
            pages.maps.title
          ) as string,
          name: pages.maps.name,
          icon: MapsIcon,
          pageFlag: this.settings.maps,
        },
        {
          title: localiseFromObject(
            this.$i18n.locale,
            pages.helpDesk.title
          ) as string,
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
})
</script>
