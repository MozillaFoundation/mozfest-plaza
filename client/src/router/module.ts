// import Vue from 'vue'
// import { VueRouter, Route, RouteConfig } from 'vue-router'
// import Vue from 'vue'
// import { VueRouter, Route, RouteConfig } from 'vue-router'
import type { VueI18n } from 'vue-i18n'
import i18n from '../i18n/module'
import { env } from '../plugins/env-plugin'

import AtriumView from '../views/AtriumView.vue'
import TokenCaptureView from '../views/TokenCaptureView.vue'
import ApiMessageView from '../views/ApiMessageView.vue'
import NotFoundView from '../views/NotFoundView.vue'

import {
  createPageViewEvent,
  getRouteTitle,
  getScrollBehaviour,
  localiseFromObject,
  Routes,
} from '@openlab/deconf-ui-toolkit'
import { ExtraRoutes, StorageKey } from '@/lib/module'
import { gaTrack, MetricsPlugin } from '@/plugins/metrics-plugin'
import pages from '@/data/pages.json'
import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  type RouteLocationNormalizedGeneric,
  type RouteRecordRaw,
} from 'vue-router'
import type { Localised } from '@openlab/deconf-shared'

const routes: RouteRecordRaw[] = [
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
    component: () => import('../views/LoginView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.login',
    },
  },
  {
    path: '/profile',
    name: Routes.Profile,
    component: () => import('../views/ProfileView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.profile',
    },
  },
  {
    path: '/profile/calendar',
    name: ExtraRoutes.ProfileCalendar,
    component: () => import('../views/ProfileCalendarView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.profile',
    },
  },
  {
    path: '/profile/notifications',
    name: ExtraRoutes.ProfileNotifications,
    component: () => import('../views/ProfileNotificationsView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.profile',
    },
  },
  {
    path: pages.register.path,
    name: Routes.Register,
    component: () => import('../views/RegisterView.vue'),
    meta: {
      title: pages.register.title,
      // pageTitle: 'mozfest.pageTitles.register',
    },
  },
  {
    path: pages.schedule.path,
    name: Routes.Schedule,
    component: () => import('../views/ScheduleView.vue'),
    meta: {
      title: pages.schedule.title,
      // pageTitle: 'mozfest.pageTitles.schedule',
    },
  },
  {
    path: '/my-schedule',
    name: ExtraRoutes.MySchedule,
    component: () => import('../views/MyScheduleView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.mySchedule',
    },
  },
  {
    path: pages.arts.path,
    name: ExtraRoutes.Arts,
    component: () => import('../views/ArtsView.vue'),
    meta: {
      title: pages.arts.title,
      // pageTitle: 'mozfest.pageTitles.artGallery',
    },
  },
  {
    path: pages.maps.path,
    name: pages.maps.name,
    component: () => import('../views/MapsView.vue'),
    meta: {
      title: pages.maps.title,
    },
  },
  // {
  //   path: '/sneak-peek',
  //   name: Routes.WhatsOn,
  //   component: () =>
  //     import( '../views/WhatsOnView.vue'),
  //   meta: {
  //     pageTitle: 'mozfest.pageTitles.whatsOn',
  //   },
  // },
  {
    path: '/session/:sessionId',
    name: Routes.Session,
    props: true,
    // This is in the "schedule" chunk because it shares CSS
    component: () => import('../views/SessionView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.session',
    },
  },
  {
    path: '/room/:roomId',
    name: 'room',
    component: () => import('../views/RoomView.vue'),
    props: true,
    // NOTE: no page title as this is a hidden page
  },
  {
    path: pages.helpDesk.path,
    name: Routes.HelpDesk,
    component: () => import('../views/HelpDeskView.vue'),
    meta: {
      title: pages.helpDesk.path,
      // pageTitle: 'mozfest.pageTitles.helpDesk',
    },
  },
  {
    path: pages.calendar.path,
    name: ExtraRoutes.Calendar,
    component: () => import('../views/CalendarView.vue'),
    meta: {
      title: pages.calendar.title,
      // pageTitle: 'mozfest.pageTitles.calendar',
    },
  },
  {
    path: '/search',
    name: ExtraRoutes.Search,
    component: () => import('../views/SearchView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.search',
    },
  },

  //
  // Utils
  //
  {
    path: '/utilities',
    name: ExtraRoutes.Utils,
    component: () => import('../views/UtilsView.vue'),
    meta: {
      pageTitle: 'mozfest.pageTitles.utilities',
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
    path: '/:pathMatch(.*)*',
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

const router = createRouter({
  history: env.STATIC_BUILD
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: getScrollBehaviour(SCROLL_OFFSET),
  routes,
})

// Check the pages.json 's title field
function getNewRouteTitle(to: RouteLocationNormalizedGeneric, i18n: VueI18n) {
  const title = to.meta?.title
    ? localiseFromObject(i18n.locale, to.meta?.title as Localised)
    : null
  if (!title) return null
  const app = i18n.t('deconf.general.appName')
  return `${title} | ${app}`
}

router.beforeEach((to, from, next) => {
  document.title =
    getNewRouteTitle(to, i18n.global as VueI18n) ||
    getRouteTitle(to, i18n.global as VueI18n)

  const loggedIn = Boolean(localStorage.getItem(StorageKey.AuthToken))

  MetricsPlugin.shared?.track(
    createPageViewEvent((to.name as string) ?? to.path, to.params)
  )

  const url = new URL(to.fullPath, location.origin)

  gaTrack({
    event: 'virtualPageview',
    pageUrl: url.toString(),
    pageTitle: document.title,
  })

  if (
    !loggedIn &&
    typeof to.name === 'string' &&
    protectedRoutes.has(to.name)
  ) {
    next({ name: Routes.Atrium })
  } else {
    next()
  }
})

export default router
