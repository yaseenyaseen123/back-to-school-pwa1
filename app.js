// تواريخ بداية العام الدراسي لكل دولة
const schoolDates = {
    'JO': { // الأردن
        date: new Date('2025-09-01T08:00:00+03:00'), // 1 سبتمبر 2025
        name: 'الأردن',
        flag: '🇯🇴',
        timezone: 'Asia/Amman'
    },
    'PS': { // فلسطين
        date: new Date('2025-09-09T08:00:00+03:00'), // 9 سبتمبر 2025
        name: 'فلسطين',
        flag: '🇵🇸',
        timezone: 'Asia/Gaza'
    },
    'SA': { // السعودية
        date: new Date('2025-08-27T08:00:00+03:00'), // 27 أغسطس 2025
        name: 'السعودية',
        flag: '🇸🇦',
        timezone: 'Asia/Riyadh'
    }
};

// متغيرات عامة
let currentCountry = 'JO'; // افتراضي
let targetDate = schoolDates[currentCountry].date;
let countdownInterval;

// رسائل الدعابة للأطفال
const funMessages = [
    "يلا يا شاطر قريبًا المدرسة تبدأ! 🎒",
    "استعد يا بطل، المدرسة على الأبواب! 💪",
    "هيا نحضر الحقيبة المدرسية! 📚",
    "المدرسة قريبة، وقت المرح والتعلم! 🌟",
    "يا نجم، جهز أقلامك للمدرسة! ✏️",
    "المدرسة تنتظرك يا ذكي! 🧠",
    "استعد للمغامرات الجديدة في المدرسة! 🚀",
    "يلا يا شاطر، نحضر للعام الدراسي الجديد! 📖",
    "المدرسة مكان الأصدقاء والمرح! 👫",
    "هيا نتعلم أشياء جديدة ومثيرة! 🎨"
];

// تحديد الدولة بناءً على IP
async function detectCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.country_code && schoolDates[data.country_code]) {
            currentCountry = data.country_code;
        } else {
            // إذا لم تكن الدولة مدعومة، استخدم الأردن كافتراضي
            currentCountry = 'JO';
        }
        
        targetDate = schoolDates[currentCountry].date;
        updateCountryInfo();
        
    } catch (error) {
        console.log('تعذر تحديد الموقع، سيتم استخدام الأردن كافتراضي');
        currentCountry = 'JO';
        targetDate = schoolDates[currentCountry].date;
        updateCountryInfo();
    }
}

// تحديث معلومات الدولة في الواجهة
function updateCountryInfo() {
    const country = schoolDates[currentCountry];
    const countryElement = document.getElementById('country-info');
    const targetDateElement = document.getElementById('targetDate');
    
    if (countryElement) {
        countryElement.innerHTML = `
            <span class="country-flag">${country.flag}</span>
            <span class="country-name">${country.name}</span>
        `;
    }
    
    if (targetDateElement) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            timeZone: country.timezone
        };
        targetDateElement.textContent = country.date.toLocaleDateString('ar-SA', options);
    }
}

// تحديث العد التنازلي
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    
    if (distance < 0) {
        // إذا انتهى الوقت
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        
        // إظهار رسالة بدء العام الدراسي
        const messageElement = document.querySelector('.target-date p');
        if (messageElement) {
            messageElement.innerHTML = `🎉 بدأ العام الدراسي في ${schoolDates[currentCountry].name}! 🎉`;
        }
        
        clearInterval(countdownInterval);
        return;
    }
    
    // حساب الوقت المتبقي
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // تحديث العرض
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// بدء العد التنازلي
function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// تهيئة التطبيق
async function initApp() {
    // إزالة حالة التحميل
    document.body.classList.remove("loading");
    
    // تحديد الدولة
    await detectCountry();
    
    // بدء العد التنازلي
    startCountdown();
    
    // طلب إذن الإشعارات
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // تسجيل Service Worker
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker مسجل بنجاح');
        } catch (error) {
            console.log('فشل في تسجيل Service Worker:', error);
        }
    }
}

// إظهار الإشعارات
function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('العد التنازلي للمدارس', {
            body: message,
            icon: './icon-192x192.png',
            badge: './icon-192x192.png',
            tag: 'school-countdown'
        });
        
        // إغلاق الإشعار بعد 5 ثوانٍ
        setTimeout(() => {
            notification.close();
        }, 5000);
    }
}

// إشعارات كل ساعة
function scheduleHourlyNotifications() {
    // إرسال إشعار فوري
    setTimeout(() => {
        sendFunNotification();
        
        // ثم إرسال إشعار كل ساعة
        setInterval(() => {
            sendFunNotification();
        }, 60 * 60 * 1000); // كل ساعة
        
    }, 5000); // بعد 5 ثوانٍ من تحميل التطبيق
}

// إرسال إشعار دعابة عشوائي
function sendFunNotification() {
    const distance = targetDate.getTime() - new Date().getTime();
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
        const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];
        showNotification(randomMessage);
    }
}

// إشعار يومي (اختياري)
function scheduleDailyNotification() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 صباحًا
    
    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
        const distance = targetDate.getTime() - new Date().getTime();
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        
        if (days > 0) {
            showNotification(`متبقي ${days} يوم على بداية العام الدراسي في ${schoolDates[currentCountry].name}! 📚`);
        }
        
        // جدولة الإشعار التالي
        setInterval(() => {
            const distance = targetDate.getTime() - new Date().getTime();
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            
            if (days > 0) {
                showNotification(`متبقي ${days} يوم على بداية العام الدراسي في ${schoolDates[currentCountry].name}! 📚`);
            }
        }, 24 * 60 * 60 * 1000); // كل 24 ساعة
        
    }, timeUntilTomorrow);
}

// معالجة الأخطاء
window.addEventListener("error", (e) => {
    console.error("خطأ في التطبيق:", e.error);
});

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    // إضافة حالة التحميل
    document.body.classList.add("loading");
    
    // تأخير قصير لإظهار تأثير التحميل
    setTimeout(initApp, 500);
    
    // جدولة الإشعارات اليومية
    scheduleDailyNotification();
    
    // جدولة الإشعارات كل ساعة
    scheduleHourlyNotifications();
});

// معالجة تغيير حالة الاتصال
window.addEventListener("online", () => {
    console.log("تم استعادة الاتصال بالإنترنت");
});

window.addEventListener("offline", () => {
    console.log("تم فقدان الاتصال بالإنترنت");
});

