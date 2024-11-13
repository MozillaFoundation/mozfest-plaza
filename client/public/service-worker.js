/// <reference lib="WebWorker" />

self.addEventListener('push', (event) => {
  event.waitUntil(onPush(self, event))
})

self.addEventListener('notificationclick', (event) => {
  event.waitUntil(onNotificationClick(self, event))
})

self.addEventListener('install', () => {
  self.skipWaiting()
})

/**
 * @param {ServiceWorkerGlobalScope} self
 * @param {PushEvent} event
 */
async function onPush(self, event) {
  try {
    console.debug('@push', event.data)

    const payload = event.data?.json()
    if (!payload) throw new Error('invalid payload')

    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
    await self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag ?? 'Special',
      data: {
        url: payload.data?.url,
      },
    })
  } catch (error) {
    console.error('@push error', error)
    await log(self, '@push error: ' + error?.message)
  }
}

/**
 * @param {ServiceWorkerGlobalScope} self
 * @param {NotificationEvent} event
 */
async function onNotificationClick(self, event) {
  try {
    console.debug('@notificationclick', event.notification)
    event.notification.close()

    if (event.notification.data?.url) {
      const { url } = event.notification.data ?? {}
      await openUrl(self, url)
    }
  } catch (error) {
    console.error('@notificationclick', error)
    await log(self, '@notificationclick error: ' + error?.message)
  }
}

/**
 * @param {ServiceWorkerGlobalScope} self
 * @param {URL|string} url
 */
async function openUrl(self, url) {
  try {
    const windows = await self.clients.matchAll({ type: 'window' })
    if (windows[0]) {
      windows[0].focus()
      windows[0].navigate(url)
    }
    // const alreadyOpen = windows.find((w) => w.url === url)
    // if (alreadyOpen) {
    //   exists.focus()
    //   return
    // }

    // const newWindow = await self.clients.openWindow(url)
    // newWindow?.focus?.()
  } catch (error) {
    console.error('Failed to open window', error)
    await log(self, 'Failed to open window: ' + error?.message)
  }
}

/** @param {ServiceWorkerGlobalScope} self */
async function log(self, message, ...args) {
  const windows = await self.clients.matchAll({ type: 'window' })
  for (const client of windows) {
    client.postMessage({ message, args })
  }
}
