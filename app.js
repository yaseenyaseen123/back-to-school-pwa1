// تاريخ بداية العام الدراسي (1 سبتمبر 2025)
const targetDate = new Date("2025-09-01T08:00:00").getTime();

// عناصر DOM
const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const progressFill = document.getElementById("progressFill");
const targetDateElement = document.getElementById("targetDate");

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

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    // إضافة حالة التحميل
    document.body.classList.add("loading");
    
    // تأخير قصير لإظهار تأثير التحميل
    setTimeout(initApp, 500);
});

// معالجة تغيير حالة الاتصال
window.addEventListener("online", () => {
    console.log("تم استعادة الاتصال بالإنترنت");
});

window.addEventListener("offline", () => {
    console.log("تم فقدان الاتصال بالإنترنت - التطبيق يعمل في وضع عدم الاتصال");
});

