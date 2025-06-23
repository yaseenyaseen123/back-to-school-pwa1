const CACHE_NAME = 'back-to-school-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('فتح الكاش');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إرجاع الملف من الكاش إذا وُجد
        if (response) {
          return response;
        }

        // إذا لم يوجد في الكاش، جلبه من الشبكة
        return fetch(event.request).then(
          (response) => {
            // التحقق من صحة الاستجابة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // نسخ الاستجابة
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // في حالة عدم توفر الاتصال وعدم وجود الملف في الكاش
        // يمكن إرجاع صفحة افتراضية هنا
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// معالجة الإشعارات
self.addEventListener('notificationclick', (event) => {
  console.log('تم النقر على الإشعار:', event.notification.tag);
  
  event.notification.close();

  // فتح التطبيق عند النقر على الإشعار
  event.waitUntil(
    clients.matchAll().then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// معالجة الرسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// إرسال إشعار دوري (اختياري)
self.addEventListener('sync', (event) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

function sendDailyReminder() {
  const targetDate = new Date('2025-09-01T08:00:00').getTime();
  const now = new Date().getTime();
  const distance = targetDate - now;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return self.registration.showNotification('العد التنازلي للمدارس', {
      body: `متبقي ${days} يوم على بداية العام الدراسي! 📚`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'daily-reminder',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'عرض العد التنازلي'
        }
      ]
    });
  }
}

