// تاريخ بداية العام الدراسي (1 سبتمبر 2025)
const targetDate = new Date("2025-09-01T08:00:00").getTime();

// عناصر DOM
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const progressFill = document.getElementById("progressFill");
const targetDateElement = document.getElementById("targetDate");
const installPrompt = document.getElementById("installPrompt");
const installButton = document.getElementById("installButton");

// متغير لحفظ حدث التثبيت
let deferredPrompt;

// تحديث العد التنازلي
function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
        // إذا انتهى الوقت
        daysElement.textContent = "00";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";
        progressFill.style.width = "100%";
        
        // تغيير النص
        document.querySelector("header h1").textContent = "🎉 بدأ العام الدراسي!";
        document.querySelector(".subtitle").textContent = "نتمنى لكم عامًا دراسيًا موفقًا";
        
        return;
    }
    
    // حساب الوقت المتبقي
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // تحديث العناصر مع إضافة تأثير التحديث
    updateElement(daysElement, days.toString().padStart(2, "0"));
    updateElement(hoursElement, hours.toString().padStart(2, "0"));
    updateElement(minutesElement, minutes.toString().padStart(2, "0"));
    updateElement(secondsElement, seconds.toString().padStart(2, "0"));
    
    // حساب التقدم (من بداية العام حتى تاريخ المدرسة)
    const yearStart = new Date("2025-01-01T00:00:00").getTime();
    const totalDuration = targetDate - yearStart;
    const elapsed = now - yearStart;
    const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
    
    progressFill.style.width = progress + "%";
}

// تحديث عنصر مع تأثير بصري
function updateElement(element, newValue) {
    if (element.textContent !== newValue) {
        element.parentElement.classList.add("updating");
        element.textContent = newValue;
        
        setTimeout(() => {
            element.parentElement.classList.remove("updating");
        }, 300);
    }
}

// تهيئة التطبيق
function initApp() {
    // تحديث تاريخ الهدف في الواجهة
    const options = { 
        year: "numeric", 
        month: "long", 
        day: "numeric",
        weekday: "long"
    };
    const formattedDate = new Date(targetDate).toLocaleDateString("ar-SA", options);
    targetDateElement.textContent = formattedDate;
    
    // بدء العد التنازلي
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // إزالة حالة التحميل
    document.body.classList.remove("loading");
}

// معالجة تثبيت PWA
window.addEventListener("beforeinstallprompt", (e) => {
    // منع عرض المطالبة التلقائية
    e.preventDefault();
    
    // حفظ الحدث للاستخدام لاحقًا
    deferredPrompt = e;
    
    // إظهار زر التثبيت المخصص
    installPrompt.style.display = "block";
});

// معالجة النقر على زر التثبيت
installButton.addEventListener("click", async () => {
    if (!deferredPrompt) {
        return;
    }
    
    // إظهار مطالبة التثبيت
    deferredPrompt.prompt();
    
    // انتظار اختيار المستخدم
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
        console.log("تم قبول تثبيت التطبيق");
    } else {
        console.log("تم رفض تثبيت التطبيق");
    }
    
    // إخفاء المطالبة
    installPrompt.style.display = "none";
    deferredPrompt = null;
});

// معالجة تثبيت التطبيق بنجاح
window.addEventListener("appinstalled", () => {
    console.log("تم تثبيت التطبيق بنجاح");
    installPrompt.style.display = "none";
    
    // إظهار إشعار
    showNotification("تم تثبيت التطبيق بنجاح! 🎉");
});

// إظهار الإشعارات
function showNotification(message) {
    // التحقق من دعم الإشعارات
    if ("Notification" in window) {
        // طلب الإذن إذا لم يتم منحه
        if (Notification.permission === "default") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("العد التنازلي للمدارس", {
                        body: message,
                        icon: "icon-192x192.png",
                        badge: "icon-192x192.png"
                    });
                }
            });
        } else if (Notification.permission === "granted") {
            new Notification("العد التنازلي للمدارس", {
                body: message,
                icon: "icon-192x192.png",
                badge: "icon-192x192.png"
            });
        }
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
        const distance = targetDate - new Date().getTime();
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        
        if (days > 0) {
            showNotification(`متبقي ${days} يوم على بداية العام الدراسي! 📚`);
        }
        
        // جدولة الإشعار التالي
        setInterval(() => {
            const distance = targetDate - new Date().getTime();
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            
            if (days > 0) {
                showNotification(`متبقي ${days} يوم على بداية العام الدراسي! 📚`);
            }
        }, 24 * 60 * 60 * 1000); // كل 24 ساعة
        
    }, timeUntilTomorrow);
}

// معالجة الأخطاء
window.addEventListener("error", (e) => {
    console.error("خطأ في التطبيق:", e.error);
});

// معالجة أخطاء Service Worker
window.addEventListener("unhandledrejection", (e) => {
    console.error("خطأ غير معالج:", e.reason);
});

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    // إضافة حالة التحميل
    document.body.classList.add("loading");
    
    // تأخير قصير لإظهار تأثير التحميل
    setTimeout(initApp, 500);
    
    // جدولة الإشعارات اليومية
    scheduleDailyNotification();
});

// معالجة تغيير حالة الاتصال
window.addEventListener("online", () => {
    console.log("تم استعادة الاتصال بالإنترنت");
});

window.addEventListener("offline", () => {
    console.log("تم فقدان الاتصال بالإنترنت - التطبيق يعمل في وضع عدم الاتصال");
});

