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
 *
 * Shows the notification to the user
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
 *
 * Parses the notification payload and opens the URL if there is one
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
 *
 * Opens the URL in the first window related to the ServiceWorker
 */
async function openUrl(self, url) {
  try {
    const [window] = await self.clients.matchAll({ type: 'window' })
    if (window) {
      window.focus()
      window.navigate(url)
    }
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
