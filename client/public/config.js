import pages from "./pages.json" with { type: "json" }

// Set global config for the deployment
// to be overwritten in production
window.CONFIG = {
  SELF_URL: 'http://localhost:8080/',
  SERVER_URL: 'http://localhost:3000/legacy/1/',
  BUILD_NAME: '',
  JWT_ISSUER: 'deconf.app',
  // SESSION_SHARE_URL: 'http://localhost:3000/share/session/$1',
  DISABLE_SOCKETS: true,

  DECONF_API_URL: 'http://localhost:3000/',
  DECONF_CONFERENCE: 1,

  // GA_TOKEN: 'G-HXLCGDQJZB',
  // CONSENT_ID: "0198a3bb-c388-70f1-8d6d-d2cbf7d0bbfa-test",
}

// async function fetchPages() {
//   try {
//     const res = await fetch("./pages.json")
//     return res.json()
//   } catch (error) {
//     return null
//   }
// }

window.PAGES = pages

//
// Static mode live
//
// window.CONFIG.SELF_URL = 'https://mozfest-static.openlab.dev/'
// window.CONFIG.SERVER_URL = 'https://mozfest-static.openlab.dev/schedule/'
// window.CONFIG.STATIC_BUILD = true
// window.CONFIG.DISABLE_SOCKETS = true
// window.CONFIG.GA_TOKEN = 'UA-87658599-22'
// window.CONFIG.JWT_ISSUER = 'mozfest-2023-static'

//
// Static mode local
//
// window.CONFIG.SELF_URL = 'http://localhost:8080/'
// window.CONFIG.SERVER_URL = 'http://localhost:8080/schedule/'
// window.CONFIG.STATIC_BUILD = true
// window.CONFIG.DISABLE_SOCKETS = true
// window.CONFIG.GA_TOKEN = 'UA-87658599-22'
// window.CONFIG.JWT_ISSUER = 'mozfest-2023-static'
