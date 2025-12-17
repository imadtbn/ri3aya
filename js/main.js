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
    
    // تهيئة القائمة المنسدلة المحسنة
    initDropdownMenu();
    
    // تهيئة التمرير السلس للروابط
    initSmoothScroll();
    
    // تهيئة تحميل الصور الكسول
    initLazyLoading();
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
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
            
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
                document.body.style.overflow = '';
                menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            });
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-btn')) {
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                if (menuBtn) {
                    menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    }
}

// القائمة المنسدلة المحسنة
function initDropdownMenu() {
    const dropdownLinks = document.querySelectorAll('.dropdown > a');
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // منع الانتقال إلى الرابط عند النقر
            e.preventDefault();
            e.stopPropagation();
            
            // العثور على القائمة المنسدلة المرتبطة
            const dropdown = this.parentElement;
            
            // إغلاق جميع القوائم الأخرى أولاً
            dropdownLinks.forEach(otherLink => {
                const otherDropdown = otherLink.parentElement;
                if (otherDropdown !== dropdown && otherDropdown.classList.contains('open')) {
                    otherDropdown.classList.remove('open');
                }
            });
            
            // تبديل حالة القائمة الحالية
            dropdown.classList.toggle('open');
            
            // إذا فتحنا القائمة المنسدلة على الهاتف المحمول، نوقف التمرير
            if (window.innerWidth <= 768 && dropdown.classList.contains('open')) {
                document.body.style.overflow = 'hidden';
            } else if (window.innerWidth <= 768) {
                document.body.style.overflow = '';
            }
        });
    });
    
    // إغلاق القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdownLinks.forEach(link => {
                const dropdown = link.parentElement;
                if (dropdown.classList.contains('open')) {
                    dropdown.classList.remove('open');
                    if (window.innerWidth <= 768) {
                        document.body.style.overflow = '';
                    }
                }
            });
        }
    });
    
    // إغلاق القائمة المنسدلة عند النقر على رابط داخلي
    dropdownMenus.forEach(menu => {
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // السماح بالانتقال إلى الرابط عند النقر على عنصر القائمة
                if (this.getAttribute('href') !== '#') {
                    // إغلاق القائمة المنسدلة
                    const dropdown = this.closest('.dropdown');
                    if (dropdown) {
                        dropdown.classList.remove('open');
                        if (window.innerWidth <= 768) {
                            document.body.style.overflow = '';
                        }
                    }
                    
                    // إغلاق القائمة الرئيسية على الهاتف المحمول إذا كانت مفتوحة
                    const navMenu = document.querySelector('.nav-menu');
                    const menuBtn = document.querySelector('.mobile-menu-btn');
                    if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        document.body.style.overflow = '';
                        if (menuBtn) {
                            const icon = menuBtn.querySelector('i');
                            if (icon) {
                                icon.classList.replace('fa-times', 'fa-bars');
                            }
                        }
                    }
                }
            });
        });
    });
    
    // التعامل مع تغيير حجم النافذة
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            document.body.style.overflow = '';
            // إغلاق جميع القوائم المنسدلة عند الانتقال إلى شاشة كبيرة
            dropdownLinks.forEach(link => {
                link.parentElement.classList.remove('open');
            });
        }
    });
    
    // إغلاق القائمة المنسدلة عند الضغط على مفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownLinks.forEach(link => {
                const dropdown = link.parentElement;
                if (dropdown.classList.contains('open')) {
                    dropdown.classList.remove('open');
                    if (window.innerWidth <= 768) {
                        document.body.style.overflow = '';
                    }
                }
            });
        }
    });
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
            toolUrl = 'pages/vaccine.html';
            toolTitle = 'آلة حاسبة التطعيمات';
            break;
        case 'growth':
            toolUrl = 'pages/growth.html';
            toolTitle = 'متابعة النمو';
            break;
        case 'cry':
            toolUrl = 'pages/crying.html';
            toolTitle = 'مفسر البكاء';
            break;
        case 'routine':
            toolUrl = 'pages/sleep.html';
            toolTitle = 'مولد الروتين اليومي';
            break;
    }
    
    if (toolUrl) {
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
            const newTip = getRandomTip();
            tipText.textContent = newTip;
            localStorage.setItem('tipDate', new Date().getDate());
            localStorage.setItem('dailyTip', newTip);
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
            updateTip();
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
                // محاكاة إرسال النموذج
                showNotification('شكراً لك! تم اشتراكك في النشرة البريدية بنجاح.', 'success');
                emailInput.value = '';
                
                // هنا يمكنك إضافة كود AJAX حقيقي
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
                        showNotification('شكراً لك! تم اشتراكك في النشرة البريدية بنجاح.', 'success');
                        emailInput.value = '';
                    } else {
                        showNotification('حدث خطأ. يرجى المحاولة مرة أخرى.', 'error');
                    }
                })
                .catch(error => {
                    showNotification('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.', 'error');
                });
                */
            } else {
                showNotification('الرجاء إدخال بريد إلكتروني صحيح.', 'error');
                emailInput.focus();
            }
        });
    }
}

// التحقق من صحة البريد الإلكتروني
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// التمرير السلس للروابط
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// تحميل الصور بطريقة كسولة
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback للمتصفحات القديمة
        const lazyImages = document.querySelectorAll('img[data-src]');
        let lazyLoadThrottleTimeout;
        
        function lazyLoad() {
            if (lazyLoadThrottleTimeout) {
                clearTimeout(lazyLoadThrottleTimeout);
            }
            
            lazyLoadThrottleTimeout = setTimeout(function() {
                const scrollTop = window.pageYOffset;
                lazyImages.forEach(img => {
                    if (img.offsetTop < (window.innerHeight + scrollTop)) {
                        img.src = img.dataset.src;
                        if (img.dataset.srcset) {
                            img.srcset = img.dataset.srcset;
                        }
                        img.classList.remove('lazy');
                    }
                });
                
                if (lazyImages.length == 0) {
                    document.removeEventListener("scroll", lazyLoad);
                    window.removeEventListener("resize", lazyLoad);
                    window.removeEventListener("orientationchange", lazyLoad);
                }
            }, 20);
        }
        
        document.addEventListener("scroll", lazyLoad);
        window.addEventListener("resize", lazyLoad);
        window.addEventListener("orientationchange", lazyLoad);
        lazyLoad();
    }
}

// إظهار الإشعارات
function showNotification(message, type = 'info') {
    // إنصراف العنصر إذا كان موجوداً بالفعل
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // إضافة الأنماط
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #333;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease;
            border-right: 4px solid;
        }
        
        .notification-success {
            border-right-color: #4CAF50;
        }
        
        .notification-error {
            border-right-color: #f44336;
        }
        
        .notification-info {
            border-right-color: #2196F3;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-content i {
            font-size: 20px;
        }
        
        .notification-success .notification-content i {
            color: #4CAF50;
        }
        
        .notification-error .notification-content i {
            color: #f44336;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 5px;
            margin-right: 10px;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // إضافة حدث الإغلاق
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    });
    
    // إزالة تلقائية بعد 5 ثوان
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// البحث
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const query = searchInput.value.trim();
        if (query) {
            // تخزين البحث مؤقتاً
            sessionStorage.setItem('searchQuery', query);
            // الانتقال لصفحة البحث أو إظهار النتائج
            window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
        }
    }
}

// تحسينات إضافية للواجهة
function initUIEnhancements() {
    // إضافة تأثير hover للبطاقات
    const cards = document.querySelectorAll('.section-card, .tool-card, .blog-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.transition = 'transform 0.3s ease';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // تحسين إمكانية الوصول للروابط
    document.querySelectorAll('a, button').forEach(element => {
        element.addEventListener('focus', () => {
            element.style.outline = '2px solid #4CAF50';
            element.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', () => {
            element.style.outline = '';
        });
    });
    
    // تحميل تقدمي للصور الثقيلة
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });
}

// استدعاء الدوال الإضافية
document.addEventListener('DOMContentLoaded', function() {
    // إضافة الدوال الإضافية هنا بعد التحميل
    setTimeout(() => {
        initSearch();
        initUIEnhancements();
    }, 100);
});

// التعامل مع أخطاء تحميل الصور
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'images/placeholder.jpg';
            this.alt = 'الصورة غير متوفرة';
            this.classList.add('image-error');
        });
    });
});

// حفظ حالة التمرير عند العودة
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        window.scrollTo(0, parseInt(sessionStorage.getItem('scrollPosition')) || 0);
    }
});

window.addEventListener('beforeunload', function() {
    sessionStorage.setItem('scrollPosition', window.pageYOffset);
});





// القائمة المنسدلة المحسنة للهواتف
function initDropdownMenu() {
    const dropdownLinks = document.querySelectorAll('.dropdown > a');
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    let isTouchDevice = false;
    
    // اكتشاف إذا كان الجهاز يدعم اللمس
    try {
        isTouchDevice = ('ontouchstart' in window) || 
                       (navigator.maxTouchPoints > 0) || 
                       (navigator.msMaxTouchPoints > 0);
    } catch (e) {
        isTouchDevice = false;
    }
    
    // تحسين تجربة اللمس على الهواتف
    if (isTouchDevice) {
        document.documentElement.classList.add('touch-device');
    }
    
    // دالة لفتح/إغلاق القائمة المنسدلة
    function toggleDropdown(dropdown, forceClose = false) {
        if (forceClose) {
            dropdown.classList.remove('open');
            if (window.innerWidth <= 768) {
                document.body.style.overflow = '';
            }
            return;
        }
        
        // إغلاق جميع القوائم الأخرى أولاً
        dropdownLinks.forEach(otherLink => {
            const otherDropdown = otherLink.parentElement;
            if (otherDropdown !== dropdown && otherDropdown.classList.contains('open')) {
                otherDropdown.classList.remove('open');
            }
        });
        
        // تبديل حالة القائمة الحالية
        const isOpening = !dropdown.classList.contains('open');
        dropdown.classList.toggle('open');
        
        // التحكم في التمرير على الهاتف المحمول
        if (window.innerWidth <= 768) {
            if (isOpening) {
                document.body.style.overflow = 'hidden';
                // تمرير القائمة المفتوحة إلى العرض
                setTimeout(() => {
                    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                    if (dropdownMenu) {
                        dropdownMenu.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'nearest' 
                        });
                    }
                }, 100);
            } else {
                document.body.style.overflow = '';
            }
        }
        
        return isOpening;
    }
    
    // إضافة أحداث لكل رابط منسدل
    dropdownLinks.forEach(link => {
        let touchTimer;
        let isTouched = false;
        
        // حدث النقر للكمبيوتر
        link.addEventListener('click', function(e) {
            // منع الانتقال إلى الرابط عند النقر
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.parentElement;
            toggleDropdown(dropdown);
        });
        
        // تحسين تجربة اللمس على الهاتف
        if (isTouchDevice) {
            link.addEventListener('touchstart', function(e) {
                isTouched = true;
                touchTimer = setTimeout(() => {
                    // إذا استمر اللمس لمدة طويلة (تأخير)
                    this.classList.add('long-touch');
                }, 500);
            }, { passive: true });
            
            link.addEventListener('touchend', function(e) {
                clearTimeout(touchTimer);
                this.classList.remove('long-touch');
                
                if (isTouched) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const dropdown = this.parentElement;
                    toggleDropdown(dropdown);
                    
                    // إضافة فاصل زمني لمنع النقر المزدوج
                    setTimeout(() => {
                        isTouched = false;
                    }, 300);
                }
            });
            
            link.addEventListener('touchmove', function(e) {
                clearTimeout(touchTimer);
                isTouched = false;
                this.classList.remove('long-touch');
            }, { passive: true });
            
            // منع السلوك الافتراضي عند التمرير على الروابط
            link.addEventListener('touchcancel', function(e) {
                clearTimeout(touchTimer);
                isTouched = false;
                this.classList.remove('long-touch');
            }, { passive: true });
        }
        
        // تحسين إمكانية الوصول بلوحة المفاتيح
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const dropdown = this.parentElement;
                toggleDropdown(dropdown);
            }
            
            if (e.key === 'Escape') {
                const dropdown = this.parentElement;
                if (dropdown.classList.contains('open')) {
                    dropdown.classList.remove('open');
                    if (window.innerWidth <= 768) {
                        document.body.style.overflow = '';
                    }
                }
            }
        });
    });
    
    // إغلاق القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdownLinks.forEach(link => {
                const dropdown = link.parentElement;
                if (dropdown.classList.contains('open')) {
                    toggleDropdown(dropdown, true);
                }
            });
        }
    });
    
    // إغلاق القائمة المنسدلة عند النقر على رابط داخلي
    dropdownMenus.forEach(menu => {
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // السماح بالانتقال إلى الرابط عند النقر على عنصر القائمة
                if (this.getAttribute('href') !== '#') {
                    // إغلاق القائمة المنسدلة
                    const dropdown = this.closest('.dropdown');
                    if (dropdown) {
                        toggleDropdown(dropdown, true);
                    }
                    
                    // إغلاق القائمة الرئيسية على الهاتف المحمول إذا كانت مفتوحة
                    const navMenu = document.querySelector('.nav-menu');
                    const menuBtn = document.querySelector('.mobile-menu-btn');
                    if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        document.body.style.overflow = '';
                        if (menuBtn) {
                            const icon = menuBtn.querySelector('i');
                            if (icon) {
                                icon.classList.replace('fa-times', 'fa-bars');
                            }
                        }
                    }
                }
            });
        });
    });
    
    // التعامل مع تغيير حجم النافذة
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            document.body.style.overflow = '';
            // إغلاق جميع القوائم المنسدلة عند الانتقال إلى شاشة كبيرة
            dropdownLinks.forEach(link => {
                link.parentElement.classList.remove('open');
            });
        }
    });
    
    // إغلاق القائمة المنسدلة عند الضغط على مفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownLinks.forEach(link => {
                const dropdown = link.parentElement;
                if (dropdown.classList.contains('open')) {
                    toggleDropdown(dropdown, true);
                }
            });
        }
    });
    
    // منع التمرير عند فتح القائمة على الهاتف
    dropdownMenus.forEach(menu => {
        menu.addEventListener('touchmove', function(e) {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
            }
        }, { passive: false });
        
        menu.addEventListener('wheel', function(e) {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
            }
        }, { passive: false });
    });
}


// القائمة المنسدلة المحسنة مع تحسين الألوان
function initDropdownMenu() {
    const dropdownLinks = document.querySelectorAll('.dropdown > a');
    const dropdownMenus = document.querySelectorAll('.dropdown-menu');
    
    // إضافة أنماط CSS ديناميكية لتحسين الألوان
    const style = document.createElement('style');
    style.textContent = `
        /* تحسين ألوان القائمة المنسدلة */
        .dropdown-menu {
            background-color: #2c3e50 !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
        }
        
        .dropdown-menu a {
            color: #ffffff !important;
            font-weight: 500 !important;
            text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        
        .dropdown-menu a:hover,
        .dropdown-menu a:focus {
            background-color: #34495e !important;
            color: #4CAF50 !important;
        }
        
        .dropdown-menu a i {
            color: #4CAF50 !important;
            font-size: 16px !important;
            margin-left: 8px !important;
        }
        
        /* تحسينات للهواتف المحمولة */
        @media (max-width: 768px) {
            .dropdown-menu {
                background-color: #1a252f !important;
                max-height: 60vh !important;
                overflow-y: auto !important;
            }
            
            .dropdown-menu a {
                padding: 15px 20px !important;
                font-size: 16px !important;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            }
            
            .dropdown-menu a:last-child {
                border-bottom: none !important;
            }
            
            .dropdown.open > a {
                background-color: rgba(76, 175, 80, 0.1) !important;
                color: #4CAF50 !important;
            }
            
            .dropdown.open > a i {
                color: #4CAF50 !important;
            }
        }
        
        /* تحسينات إضافية للظهور */
        .dropdown-menu li {
            transition: transform 0.2s ease !important;
        }
        
        .dropdown-menu li:hover {
            transform: translateX(-5px) !important;
        }
        
        /* مؤشر النشاط */
        .dropdown.active > a {
            color: #4CAF50 !important;
            font-weight: 600 !important;
        }
        
        .dropdown-menu a.active {
            background-color: rgba(76, 175, 80, 0.15) !important;
            border-right: 3px solid #4CAF50 !important;
        }
    `;
    document.head.appendChild(style);
    
    // تحديد الصفحة النشطة
    function setActiveMenuItem() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // تحديد العنصر النشط في القائمة الرئيسية
        dropdownLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.parentElement.classList.add('active');
            }
        });
        
        // تحديد العنصر النشط في القائمة المنسدلة
        dropdownMenus.forEach(menu => {
            const menuLinks = menu.querySelectorAll('a');
            menuLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href && currentPath.includes(href.replace('pages/', ''))) {
                    link.classList.add('active');
                }
            });
        });
    }
    
    // دالة لفتح/إغلاق القائمة المنسدلة
    function toggleDropdown(dropdown, forceClose = false) {
        if (forceClose) {
            dropdown.classList.remove('open');
            if (window.innerWidth <= 768) {
                document.body.style.overflow = '';
            }
            return;
        }
        
        // إغلاق جميع القوائم الأخرى أولاً
        dropdownLinks.forEach(otherLink => {
            const otherDropdown = otherLink.parentElement;
            if (otherDropdown !== dropdown && otherDropdown.classList.contains('open')) {
                otherDropdown.classList.remove('open');
            }
        });
        
        // تبديل حالة القائمة الحالية
        const isOpening = !dropdown.classList.contains('open');
        dropdown.classList.toggle('open');
        
        // إضافة تأثير ناعم للفتح
        if (isOpening) {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.style.opacity = '0';
                menu.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    menu.style.opacity = '1';
                    menu.style.transform = 'translateY(0)';
                }, 10);
            }
        }
        
        // التحكم في التمرير على الهاتف المحمول
        if (window.innerWidth <= 768) {
            if (isOpening) {
                document.body.style.overflow = 'hidden';
                
                // تمرير القائمة إلى العرض
                setTimeout(() => {
                    const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                    if (dropdownMenu) {
                        dropdownMenu.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }
                }, 300);
            } else {
                document.body.style.overflow = '';
            }
        }
        
        return isOpening;
    }
    
    // إضافة أحداث لكل رابط منسدل
    dropdownLinks.forEach(link => {
        let clickTimer;
        let isClicking = false;
        
        // حدث النقر للكمبيوتر
        link.addEventListener('click', function(e) {
            // منع الانتقال إلى الرابط عند النقر
            e.preventDefault();
            e.stopPropagation();
            
            clearTimeout(clickTimer);
            isClicking = true;
            
            const dropdown = this.parentElement;
            toggleDropdown(dropdown);
            
            // إعادة تعيين مؤشر النقر
            clickTimer = setTimeout(() => {
                isClicking = false;
            }, 300);
        });
        
        // تحسين تجربة اللمس على الهاتف
        link.addEventListener('touchstart', function(e) {
            clearTimeout(clickTimer);
            isClicking = true;
            
            // إضافة تأثير اللمس
            this.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        }, { passive: true });
        
        link.addEventListener('touchend', function(e) {
            if (isClicking) {
                e.preventDefault();
                e.stopPropagation();
                
                const dropdown = this.parentElement;
                toggleDropdown(dropdown);
                
                // إزالة تأثير اللمس
                this.style.backgroundColor = '';
                
                // منع النقر المزدوج
                isClicking = false;
            }
        });
        
        link.addEventListener('touchmove', function() {
            clearTimeout(clickTimer);
            isClicking = false;
            this.style.backgroundColor = '';
        }, { passive: true });
        
        // إمكانية الوصول بلوحة المفاتيح
        link.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const dropdown = this.parentElement;
                toggleDropdown(dropdown);
            }
            
            if (e.key === 'Escape') {
                const dropdown = this.parentElement;
                if (dropdown.classList.contains('open')) {
                    toggleDropdown(dropdown, true);
                }
            }
        });
        
        // تأثير hover للنقرات
        link.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        link.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.backgroundColor = '';
        });
    });
    
    // إغلاق القائمة المنسدلة عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdownLinks.forEach(link => {
                const dropdown = link.parentElement;
                if (dropdown.classList.contains('open')) {
                    toggleDropdown(dropdown, true);
                }
            });
        }
    });
    
    // إغلاق القائمة المنسدلة عند النقر على رابط داخلي
    dropdownMenus.forEach(menu => {
        const menuLinks = menu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // السماح بالانتقال إلى الرابط عند النقر على عنصر القائمة
                if (this.getAttribute('href') !== '#') {
                    // إغلاق القائمة المنسدلة
                    const dropdown = this.closest('.dropdown');
                    if (dropdown) {
                        toggleDropdown(dropdown, true);
                    }
                    
                    // إغلاق القائمة الرئيسية على الهاتف المحمول إذا كانت مفتوحة
                    const navMenu = document.querySelector('.nav-menu');
                    const menuBtn = document.querySelector('.mobile-menu-btn');
                    if (window.innerWidth <= 768 && navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        document.body.style.overflow = '';
                        if (menuBtn) {
                            const icon = menuBtn.querySelector('i');
                            if (icon) {
                                icon.classList.replace('fa-times', 'fa-bars');
                            }
                        }
                    }
                }
            });
        });
    });
    
    // التعامل مع تغيير حجم النافذة
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            document.body.style.overflow = '';
            // إغلاق جميع القوائم المنسدلة عند الانتقال إلى شاشة كبيرة
            dropdownLinks.forEach(link => {
                link.parentElement.classList.remove('open');
            });
        }
    });
    
    // إغلاق القائمة المنسدلة عند الضغط على مفتاح Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownLinks.forEach(link => {
                const dropdown = link.parentElement;
                if (dropdown.classList.contains('open')) {
                    toggleDropdown(dropdown, true);
                }
            });
        }
    });
    
    // تحسين التمرير للقائمة المنسدلة على الهاتف
    dropdownMenus.forEach(menu => {
        menu.addEventListener('touchmove', function(e) {
            if (window.innerWidth <= 768) {
                e.stopPropagation();
            }
        }, { passive: false });
    });
    
    // تحديد العنصر النشط عند التحميل
    setTimeout(setActiveMenuItem, 100);
}

// تحسين رأس الصفحة مع تأثيرات تفاعلية
function enhancePageHeader() {
    const pageHeader = document.querySelector('.page-header');
    const headerImage = document.querySelector('.page-header-image img');
    
    if (pageHeader && headerImage) {
        // تحسين تحميل الصورة
        headerImage.addEventListener('load', function() {
            this.classList.add('loaded');
            this.style.opacity = '1';
        });
        
        // إضافة تأثير التمرير
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;
            
            if (pageHeader && rate < 300) {
                pageHeader.style.transform = `translateY(${rate * 0.1}px)`;
                pageHeader.style.opacity = `${1 - rate * 0.002}`;
            }
        });
        
        // تأثيرات عند التمرير للداخل
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, observerOptions);
        
        observer.observe(pageHeader);
    }
}

// استدعاء الدالة في DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ... الدوال الأخرى
    enhancePageHeader();
});