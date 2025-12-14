
        // معالجة إرسال نموذج الاتصال
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // الحصول على قيم الحقول
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // هنا عادةً نرسل البيانات إلى الخادم
            // لكن لأغراض العرض، سنقوم بمحاكاة الإرسال الناجح
            
            // إظهار رسالة النجاح
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('errorMessage').style.display = 'none';
            
            // إعادة تعيين النموذج
            setTimeout(() => {
                document.getElementById('contactForm').reset();
                document.getElementById('successMessage').style.display = 'none';
            }, 5000);
            
            // تسجيل البيانات في الكونسول (لأغراض التصحيح)
            console.log('تم إرسال النموذج بنجاح:');
            console.log('الاسم:', name);
            console.log('البريد الإلكتروني:', email);
            console.log('الموضوع:', subject);
            console.log('الرسالة:', message);
        });
        
        // إضافة تأثيرات الرسوم المتحركة عند التمرير
        document.addEventListener('DOMContentLoaded', function() {
            // إضافة تأثيرات للعناصر عند التمرير
            const animatedElements = document.querySelectorAll('.animate');
            
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);
            
            animatedElements.forEach(el => {
                observer.observe(el);
            });
            
            // تأثيرات تفاعلية للأسئلة الشائعة
            const faqItems = document.querySelectorAll('.faq-item');
            faqItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
            
            // محاكاة إرسال النشرة البريدية
            document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                alert(`شكراً على اشتراكك! سيصلك جديدنا على ${emailInput.value}`);
                emailInput.value = '';
            });
        });
        
        // التحقق من صحة رقم الهاتف (اختياري)
        document.getElementById('phone').addEventListener('input', function() {
            const phonePattern = /^05\d{8}$/;
            if (this.value && !phonePattern.test(this.value)) {
                this.style.borderColor = '#ff4757';
            } else {
                this.style.borderColor = this.value ? '#28a745' : '#e0e0e0';
            }
        });
