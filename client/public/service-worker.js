/// <reference lib="WebWorker" />

self.addEventListener('push', async (/** @type {PushEvent} */ event) => {
  console.debug('@push', event.data)
  try {
    const payload = await event.data?.json()
    if (!payload) throw new Error('invalid payload')

    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
    self.registration.showNotification(payload.title, {
      body: payload.body,
      actions: payload.actions,
      data: payload.data,
    })
  } catch (error) {
    console.error('@push error', error)
  }
})

self.addEventListener(
  'notificationclick',
  (/** @type {NotificationEvent} */ event) => {
    console.debug('@notificationclick', event.notification, event.action)

    try {
      if (event.notification.data.url) {
        const { url } = event.notification.data
        event.notification.close()
        event.waitUntil(openUrl(clients, url))
      }
    } catch (error) {
      console.error('@notificationclick', error)
    }
  }
)

/** @param {Clients} clients */
async function openUrl(clients, url) {
  try {
    const windows = await clients.matchAll({ type: 'window' })
    const alreadyOpen = windows.find((w) => w.url === url)
    if (alreadyOpen) {
      exists.focus()
      return
    }

    const newWindow = await clients.openWindow(url)
    newWindow?.focus()
  } catch (error) {
    console.error('Failed to open window', error)
  }
}
