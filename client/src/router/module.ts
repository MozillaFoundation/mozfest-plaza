import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import i18n from '../i18n/module'

import AtriumView from '../views/AtriumView.vue'
import TokenCaptureView from '../views/TokenCaptureView.vue'
import ApiMessageView from '../views/ApiMessageView.vue'
import NotFoundView from '../views/NotFoundView.vue'

import {
  createPageViewEvent,
  getRouteTitle,
  getScrollBehaviour,
  Routes,
} from '@openlab/deconf-ui-toolkit'
import { ExtraRoutes, StorageKey } from '@/lib/module'
import { MetricsPlugin } from '@/plugins/metrics-plugin'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    redirect: { name: Routes.Atrium },
  },
  {
    path: '/plaza',
    name: Routes.Atrium,
    component: AtriumView,
    meta: {
      pageTitle: 'mozfest.pageTitles.atrium',
    },
  },
  {
    path: '/_auth',
    name: Routes.TokenCapture,
    component: TokenCaptureView,
  },

  {
    path: '/login',
    name: Routes.Login,
    component: () =>
      import(/* webpackChunkName: "registration" */ '../views/LoginView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.login',
    },
  },
  {
    path: '/profile',
    name: Routes.Profile,
    component: () =>
      import(/* webpackChunkName: "registration" */ '../views/ProfileView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.profile',
    },
  },
  {
    path: '/register',
    name: Routes.Register,
    component: () =>
      import(
        /* webpackChunkName: "registration" */ '../views/RegisterView.vue'
      ),
  },
  {
    path: '/schedule',
    name: Routes.Schedule,
    component: () =>
      import(/* webpackChunkName: "schedule" */ '../views/ScheduleView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.schedule',
    },
  },
  {
    path: '/sneak-peak',
    redirect: { name: Routes.Schedule },
  },
  {
    path: '/sneak-peek',
    name: Routes.WhatsOn,
    // redirect: { name: Routes.Schedule },
    component: () =>
      import(/* webpackChunkName: "schedule" */ '../views/WhatsOnView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.whatsOn',
    },
  },
  {
    path: '/session/:sessionId',
    name: Routes.Session,
    props: true,
    // This is in the "schedule" chunk because it shares CSS
    component: () =>
      import(/* webpackChunkName: "schedule" */ '../views/SessionView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.session',
    },
  },
  {
    path: '/social',
    name: ExtraRoutes.Spaces,
    component: () =>
      import(/* webpackChunkName: "static" */ '../views/SpacesView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.spaces',
    },
  },
  {
    path: '/skill-share',
    redirect: { name: ExtraRoutes.SkillShare },
  },
  {
    path: '/lightning-talks',
    name: ExtraRoutes.SkillShare,
    component: () =>
      import(/* webpackChunkName: "schedule" */ '../views/SkillShareView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.skillShare',
    },
  },
  {
    path: '/art-gallery',
    redirect: { name: ExtraRoutes.Arts },
  },
  {
    path: '/art-and-media',
    name: ExtraRoutes.Arts,
    component: () =>
      import(/* webpackChunkName: "schedule" */ '../views/ArtGalleryView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.artGallery',
    },
  },
  {
    path: '/help',
    name: Routes.HelpDesk,
    component: () =>
      import(/* webpackChunkName: "static" */ '../views/HelpDeskView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.helpDesk',
    },
  },
  {
    path: '/fringe',
    name: ExtraRoutes.Fringe,
    component: () =>
      import(
        /* webpackChunkName: "schedule" */ '../views/FringeEventsView.vue'
      ),
    meta: {
      pageTitle: 'mozfest.pageTitles.fringeEvents',
    },
  },
  {
    path: '/house',
    name: ExtraRoutes.House,
    component: () =>
      import(/* webpackChunkName: "schedule" */ '../views/HouseEventsView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.houseEvents',
    },
  },
  {
    path: '/misinfocon',
    name: ExtraRoutes.MisinfoCon,
    component: () =>
      import(/* webpackChunkName: "schedule" */ '../views/MisinfoConView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.misinfoCon',
    },
  },
  {
    path: '/emergent',
    name: ExtraRoutes.EmergentInfo,
    component: () =>
      import(/* webpackChunkName: "static" */ '../views/EmergentInfoView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.emergentSessions',
    },
  },
  {
    path: '/emergent-sessions',
    name: ExtraRoutes.EmergentSessions,
    component: () =>
      import(
        /* webpackChunkName: "schedule" */ '../views/EmergentSessionsView.vue'
      ),
    meta: {
      pageTitle: 'mozfest.pageTitles.emergentSessions',
    },
  },
  {
    path: '/calendar',
    name: ExtraRoutes.Calendar,
    component: () =>
      import(/* webpackChunkName: "static" */ '../views/CalendarView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.calendar',
    },
  },

  //
  // Errors
  //
  {
    path: '/error/:errorCode',
    props: true,
    name: Routes.Error,
    component: ApiMessageView,
  },
  {
    path: '/error',
    component: ApiMessageView,
  },
  {
    path: '/not-found',
    name: Routes.NotFound,
    component: NotFoundView,
  },
  {
    path: '*',
    component: NotFoundView,
  },
]

const protectedRoutes = new Set<string>([
  Routes.Profile,
  // Routes.Session,
  Routes.InterpretHome,
  Routes.InterpretSession,
  // Routes.HelpDesk,
  Routes.CoffeeChatLobby,
  Routes.CoffeeChatRoom,
])

// 5.25rem into pixels ($navbar-height + tabbar height)
const SCROLL_OFFSET = 80

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: getScrollBehaviour(SCROLL_OFFSET),
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = getRouteTitle(to, i18n)

  const loggedIn = Boolean(localStorage.getItem(StorageKey.AuthToken))

  MetricsPlugin.shared?.track(
    createPageViewEvent(to.name ?? to.path, to.params)
  )

  if (!loggedIn && to.name && protectedRoutes.has(to.name)) {
    next({ name: Routes.Atrium })
  } else {
    next()
  }
})

export default router
