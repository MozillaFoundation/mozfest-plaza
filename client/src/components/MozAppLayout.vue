<template>
  <AppLayout
    :app-settings="settings"
    :user="user"
    :routes="routes"
    :nav-links="navLinks"
    class="mozAppLayout"
  >
    <MozfestLogo slot="brandA" />
    <MozillaLogo slot="brandB" />

    <!-- <LanguageControl slot="languageControl" /> -->

    <router-link slot="brandC" :to="atriumRoute">
      <MozfestSquareLogo />
    </router-link>

    <div slot="main" class="mozAppLayout-main">
      <slot />
      <MozPageFooter />
    </div>
  </AppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import { PageFlag } from '@openlab/deconf-shared'
import {
  AppLayout,
  AppRoute,
  mapApiState,
  Routes,
} from '@openlab/deconf-ui-toolkit'

import MozfestLogo from '@/components/MozfestLogo.vue'
import MozillaLogo from '@/components/MozillaLogo.vue'
import MozfestSquareLogo from '@/components/MozfestSquareLogo.vue'
import MozPageFooter from '@/components/MozPageFooter.vue'

import ArtGalleryIcon from '@/icons/ArtGalleryIcon.vue'
import FringeIcon from '@/icons/FringeIcon.vue'
import HelpDeskIcon from '@/icons/HelpDeskIcon.vue'
import HouseIcon from '@/icons/HouseIcon.vue'
import SkillShareIcon from '@/icons/SkillShareIcon.vue'
import PlazaIcon from '@/icons/PlazaIcon.vue'
import ScheduleIcon from '@/icons/ScheduleIcon.vue'
import SpacesIcon from '@/icons/SpacesIcon.vue'
import EmergentIcon from '@/icons/EmergentIcon.vue'
import WhatsOnIcon from '@/icons/WhatsOnIcon.vue'
import MisinfoConIcon from '@/icons/MisinfoConIcon.vue'
import { ExtraRoutes, MozConferenceConfig } from '@/lib/module'
import { Location } from 'vue-router'

interface RouteIntermediate {
  title: string
  name: string
  icon: Vue.Component
  pageFlag?: PageFlag
}

export default Vue.extend({
  components: {
    AppLayout,
    MozfestLogo,
    MozillaLogo,
    MozfestSquareLogo,
    MozPageFooter,
  },
  computed: {
    ...mapApiState('api', ['schedule', 'user']),
    settings(): MozConferenceConfig | null {
      return (this.schedule?.settings as MozConferenceConfig) ?? null
    },
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

      const routes: RouteIntermediate[] = [
        {
          title: this.$t('mozfest.appLayout.atrium') as string,
          name: Routes.Atrium,
          icon: PlazaIcon,
          pageFlag: this.settings.atrium,
        },
        {
          title: this.$t('mozfest.appLayout.whatsOn') as string,
          name: Routes.WhatsOn,
          icon: WhatsOnIcon,
          pageFlag: this.settings.whatsOn,
        },
        {
          title: this.$t('mozfest.appLayout.schedule') as string,
          name: Routes.Schedule,
          icon: ScheduleIcon,
          pageFlag: this.settings.schedule,
        },
        {
          title: this.$t('mozfest.appLayout.arts') as string,
          name: ExtraRoutes.Arts,
          icon: ArtGalleryIcon,
          pageFlag: this.settings.arts,
        },
        {
          title: this.$t('mozfest.appLayout.skillShare') as string,
          name: ExtraRoutes.SkillShare,
          icon: SkillShareIcon,
          pageFlag: this.settings.skillShare,
        },
        {
          title: this.$t('mozfest.appLayout.fringe') as string,
          name: ExtraRoutes.Fringe,
          icon: FringeIcon,
          pageFlag: this.settings.fringe,
        },
        {
          title: this.$t('mozfest.appLayout.house') as string,
          name: ExtraRoutes.House,
          icon: HouseIcon,
          pageFlag: this.settings.house,
        },
        {
          title: this.$t('mozfest.appLayout.misinfoCon') as string,
          name: ExtraRoutes.MisinfoCon,
          icon: MisinfoConIcon,
          pageFlag: this.settings.misinfoCon,
        },
        {
          title: this.$t('mozfest.appLayout.social') as string,
          name: ExtraRoutes.Spaces,
          icon: SpacesIcon,
          pageFlag: this.settings.social,
        },
        {
          title: this.$t('mozfest.appLayout.emergentSessions') as string,
          name: ExtraRoutes.EmergentInfo,
          icon: EmergentIcon,
          pageFlag: this.settings.emergentInfo,
        },
        {
          title: this.$t('mozfest.appLayout.emergentSessions') as string,
          name: ExtraRoutes.EmergentSessions,
          icon: EmergentIcon,
          pageFlag: this.settings.emergentSessions,
        },
        {
          title: this.$t('mozfest.appLayout.helpDesk') as string,
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
    atriumRoute(): Location {
      return { name: Routes.Atrium }
    },
  },
})
</script>

<style lang="scss">
.mozAppLayout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  align-items: stretch;

  > :not(.pageFooter) {
    flex: 1;
  }
}
</style>
