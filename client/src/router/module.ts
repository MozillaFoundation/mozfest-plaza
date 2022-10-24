import Vue from 'vue'
import VueRouter, { Route, RouteConfig } from 'vue-router'
import i18n from '../i18n/module'

import AtriumView from '../views/AtriumView.vue'
import TokenCaptureView from '../views/TokenCaptureView.vue'
import ApiErrorView from '../views/ApiErrorView.vue'
import NotFoundView from '../views/NotFoundView.vue'

import { createPageViewEvent, Routes } from '@openlab/deconf-ui-toolkit'
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
    redirect: { name: Routes.Schedule },
    // component: () =>
    //   import(/* webpackChunkName: "schedule" */ '../views/WhatsOnView.vue'),
    // meta: {
    //   pageTitle: 'mozfest.pageTitles.whatsOn',
    // },
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

  //
  // Errors
  //
  {
    path: '/error/:errorCode',
    props: true,
    name: Routes.Error,
    component: ApiErrorView,
  },
  {
    path: '/error',
    component: ApiErrorView,
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

function getRouteTitle(route: Route): string {
  const routeWithTitle = [...route.matched]
    .reverse()
    .find((r) => r.meta.pageTitle)

  const appName = i18n.t('mozfest.general.appName') as string

  if (routeWithTitle) {
    const pageName = i18n.t(routeWithTitle.meta.pageTitle)
    return [pageName, appName].join(' | ')
  }

  return appName
}

// 5.25rem into pixels ($navbar-height + tabbar height)
const SCROLL_OFFSET = 80

function scrollBehavior(
  to: Route,
  from: Route,
  savedPosition: { x: number; y: number } | void
) {
  // If they clicked on a hash, scroll to that
  if (to.hash && to.name !== Routes.TokenCapture) {
    return {
      selector: to.hash,
      offset: { x: 0, y: SCROLL_OFFSET },
    }
  }

  // If they've been to the page, scroll back to there
  // Only available when navigating back via the browser
  if (savedPosition) return savedPosition

  // Otherwise, its a new page so go to the top
  return { x: 0, y: 0 }
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior,
})

router.beforeEach((to, from, next) => {
  document.title = getRouteTitle(to)

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
