// تهيئة الموقع عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة التاريخ الحالي
    initializeDate();
    
    // تهيئة قائمة الهاتف المحمول
    initMobileMenu();
    
    // تهيئة زر العودة للأعلى
    initBackToTop();
    
    // تهيئة أدوات سريعة
    initQuickTools();
    
    // تهيئة نصيحة اليوم
    initDailyTips();
    
    // تهيئة النشرة البريدية
    initNewsletter();
});

// تهيئة التاريخ الحالي
function initializeDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('ar-SA', options);
    }
}

// قائمة الهاتف المحمول
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });
        
        // إغلاق القائمة عند النقر على رابط
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            });
        });
    }
}

// زر العودة للأعلى
function initBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });
        
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// الأدوات السريعة
function initQuickTools() {
    const toolButtons = document.querySelectorAll('.btn-tool');
    
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tool = this.getAttribute('data-tool');
            openTool(tool);
        });
    });
}

function openTool(toolName) {
    let toolUrl = '';
    let toolTitle = '';
    
    switch(toolName) {
        case 'vaccine':
            toolUrl = 'pages/vaccine-calculator.html';
            toolTitle = 'آلة حاسبة التطعيمات';
            break;
        case 'growth':
            toolUrl = 'pages/growth-tracker.html';
            toolTitle = 'متابعة النمو';
            break;
        case 'cry':
            toolUrl = 'pages/cry-analyzer.html';
            toolTitle = 'مفسر البكاء';
            break;
        case 'routine':
            toolUrl = 'pages/routine-generator.html';
            toolTitle = 'مولد الروتين اليومي';
            break;
    }
    
    if (toolUrl) {
        // يمكن فتح الأداة في نافذة منبثقة أو الانتقال للصفحة
        window.location.href = toolUrl;
    }
}

// نصيحة اليوم
function initDailyTips() {
    const tips = [
        "تأكدي دائمًا من نوم طفلك على ظهره لتقليل خطر متلازمة موت الرضع المفاجئ.",
        "اغسلي يديك دائمًا قبل التعامل مع طفلك، خاصة بعد العطس أو السعال.",
        "لا تستخدمي وسادات أو ألعاب محشوة في سرير الطفل خلال السنة الأولى.",
        "تحدثي مع طفلك باستمرار، فهذا يساعد في تطوير مهاراته اللغوية.",
        "عند تقديم الطعام الصلب لأول مرة، ابدئي بكميات صغيرة ونوع واحد فقط.",
        "احرصي على أن تكون درجة حرارة ماء الاستحمام حوالي 37 درجة مئوية.",
        "غيري حفاض طفلك كل 2-3 ساعات، أو فور تبلله أو اتساخه.",
        "قدمي لطفلك وقتًا للاستلقاء على بطنه أثناء استيقاظه لتقوية عضلاته.",
        "لا تتركي طفلك أبدًا دون مراقبة على سطح مرتفع مثل طاولة التغيير.",
        "استخدمي دائمًا مقعد السيارة المخصص للرضع أثناء السفر."
    ];
    
    const tipText = document.getElementById('daily-tip-text');
    const nextTipBtn = document.getElementById('next-tip');
    
    if (tipText && nextTipBtn) {
        // الحصول على نصيحة عشوائية
        function getRandomTip() {
            const randomIndex = Math.floor(Math.random() * tips.length);
            return tips[randomIndex];
        }
        
        // تحديث نصيحة اليوم
        function updateTip() {
            tipText.textContent = getRandomTip();
        }
        
        // حدث الزر
        nextTipBtn.addEventListener('click', updateTip);
        
        // تحديث النصيحة كل يوم
        const today = new Date().getDate();
        const storedDate = localStorage.getItem('tipDate');
        const storedTip = localStorage.getItem('dailyTip');
        
        if (storedDate == today && storedTip) {
            tipText.textContent = storedTip;
        } else {
            const newTip = getRandomTip();
            tipText.textContent = newTip;
            localStorage.setItem('tipDate', today);
            localStorage.setItem('dailyTip', newTip);
        }
    }
}

// النشرة البريدية
function initNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // هنا يمكن إرسال البريد الإلكتروني للخادم
                alert('شكراً لك! تم اشتراكك في النشرة البريدية بنجاح.');
                emailInput.value = '';
                
                // يمكن إضافة كود AJAX هنا لإرسال البيانات للخادم
                /*
                fetch('/api/newsletter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('شكراً لك! تم اشتراكك في النشرة البريدية بنجاح.');
                        emailInput.value = '';
                    }
                });
                */
            } else {
                alert('الرجاء إدخال بريد إلكتروني صحيح.');
            }
        });
    }
}

// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// تأثير التمرير السلس للروابط
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// تحميل الصور بطريقة كسولة
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}