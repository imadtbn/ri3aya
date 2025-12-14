
        // تفعيل تبويبات جدول التطعيمات
        document.addEventListener('DOMContentLoaded', function() {
            // تبويبات الجدول
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabPanes = document.querySelectorAll('.tab-pane');
            
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.getAttribute('data-tab');
                    
                    // إزالة النشاط من جميع الأزرار
                    tabBtns.forEach(b => b.classList.remove('active'));
                    // إضافة النشاط للزر الحالي
                    btn.classList.add('active');
                    
                    // إخفاء جميع المحتويات
                    tabPanes.forEach(pane => pane.classList.remove('active'));
                    // إظهار المحتوى المطلوب
                    document.getElementById(tabId).classList.add('active');
                });
            });
            
            // تفعيل الأسئلة الشائعة
            const faqQuestions = document.querySelectorAll('.faq-question');
            
            faqQuestions.forEach(question => {
                question.addEventListener('click', () => {
                    const answer = question.nextElementSibling;
                    const icon = question.querySelector('i');
                    
                    // إغلاق جميع الإجابات الأخرى
                    document.querySelectorAll('.faq-answer').forEach(item => {
                        if (item !== answer && item.classList.contains('active')) {
                            item.classList.remove('active');
                            item.previousElementSibling.querySelector('i').classList.remove('fa-chevron-up');
                            item.previousElementSibling.querySelector('i').classList.add('fa-chevron-down');
                        }
                    });
                    
                    // تبديل الإجابة الحالية
                    answer.classList.toggle('active');
                    icon.classList.toggle('fa-chevron-down');
                    icon.classList.toggle('fa-chevron-up');
                });
            });
            
            // أداة حساب التطعيمات القادمة
            const calculateBtn = document.getElementById('calculate-vaccines');
            const birthDateInput = document.getElementById('birth-date');
            const resultDiv = document.getElementById('vaccine-result');
            
            // تعيين تاريخ افتراضي (طفل عمره شهرين)
            const defaultDate = new Date();
            defaultDate.setMonth(defaultDate.getMonth() - 2);
            birthDateInput.valueAsDate = defaultDate;
            
            // بيانات التطعيمات حسب العمر
            const vaccineSchedule = {
                "birth": ["السل (BCG)", "التهاب الكبد ب (الجرعة الأولى)"],
                "2months": ["الخماسي (الجرعة الأولى)", "شلل الأطفال الفموي (الجرعة الأولى)", "الروتا (الجرعة الأولى)"],
                "4months": ["الخماسي (الجرعة الثانية)", "شلل الأطفال الفموي (الجرعة الثانية)", "الروتا (الجرعة الثانية)"],
                "6months": ["الخماسي (الجرعة الثالثة)", "شلل الأطفال الفموي (الجرعة الثالثة)", "التهاب الكبد ب (الجرعة الثالثة)"],
                "9months": ["الحصبة (الجرعة الأولى)", "التهاب الكبد أ (اختياري)"],
                "12months": ["الثلاثي الفيروسي (MMR)", "الجديري المائي (الجرعة الأولى)"],
                "18months": ["الخماسي (الجرعة الرابعة)", "شلل الأطفال الفموي (الجرعة الرابعة)", "التهاب الكبد أ (الجرعة الثانية)"]
            };
            
            calculateBtn.addEventListener('click', function() {
                const birthDate = new Date(birthDateInput.value);
                const today = new Date();
                
                if (!birthDateInput.value) {
                    resultDiv.innerHTML = '<div class="alert alert-warning">الرجاء إدخال تاريخ ميلاد الطفل</div>';
                    return;
                }
                
                if (birthDate > today) {
                    resultDiv.innerHTML = '<div class="alert alert-warning">تاريخ الميلاد لا يمكن أن يكون في المستقبل</div>';
                    return;
                }
                
                // حساب عمر الطفل بالأشهر
                let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
                months -= birthDate.getMonth();
                months += today.getMonth();
                
                // تحديد التطعيمات المناسبة للعمر
                let upcomingVaccines = [];
                const ageInMonths = months;
                
                if (ageInMonths < 2) {
                    upcomingVaccines.push({age: "عند الولادة", vaccines: vaccineSchedule.birth});
                    upcomingVaccines.push({age: "شهران", vaccines: vaccineSchedule["2months"]});
                } else if (ageInMonths < 4) {
                    upcomingVaccines.push({age: "4 أشهر", vaccines: vaccineSchedule["4months"]});
                } else if (ageInMonths < 6) {
                    upcomingVaccines.push({age: "6 أشهر", vaccines: vaccineSchedule["6months"]});
                } else if (ageInMonths < 9) {
                    upcomingVaccines.push({age: "9 أشهر", vaccines: vaccineSchedule["9months"]});
                } else if (ageInMonths < 12) {
                    upcomingVaccines.push({age: "12 شهر", vaccines: vaccineSchedule["12months"]});
                } else if (ageInMonths < 18) {
                    upcomingVaccines.push({age: "18 شهر", vaccines: vaccineSchedule["18months"]});
                } else {
                    upcomingVaccines.push({age: "4-6 سنوات", vaccines: ["الثنائي (DTaP)", "شلل الأطفال المعطل (IPV)", "الثلاثي الفيروسي (MMR)", "الجديري المائي (الجرعة الثانية)"]});
                }
                
                // عرض النتائج
                let resultHTML = `<div class="alert alert-success">
                    <h4><i class="fas fa-baby"></i> عمر الطفل: ${ageInMonths} شهراً</h4>
                    <p>التطعيمات القادمة:</p>
                    <ul class="vaccine-list">`;
                
                upcomingVaccines.forEach(item => {
                    resultHTML += `<li><strong>عند ${item.age}:</strong><ul>`;
                    item.vaccines.forEach(vaccine => {
                        resultHTML += `<li>${vaccine}</li>`;
                    });
                    resultHTML += '</ul></li>';
                });
                
                resultHTML += `</ul>
                    <div class="reminder-note">
                        <i class="fas fa-bell"></i> نوصي بتسجيل هذه التواريخ في التقويم أو استخدام تطبيق تذكير
                    </div>
                </div>`;
                
                resultDiv.innerHTML = resultHTML;
            });
            
            // حساب التطعيمات افتراضياً عند تحميل الصفحة
            calculateBtn.click();
            
            // تفعيل زر العودة للأعلى
            const backToTopButton = document.querySelector('.back-to-top');
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            });
            
            backToTopButton.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        });
