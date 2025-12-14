// تهيئة صفحة النوم الآمن
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة الأسئلة الشائعة
    initFAQ();
    
    // تهيئة فحص بيئة النوم
    initSleepChecker();
    
    // تهيئة مولد روتين النوم
    initRoutineGenerator();
    
    // إضافة أي تفاعلات إضافية خاصة بصفحة النوم
});

// تهيئة الأسئلة الشائعة
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const isActive = answer.classList.contains('active');
            
            // إغلاق جميع الإجابات الأخرى
            document.querySelectorAll('.faq-answer.active').forEach(item => {
                if (item !== answer) {
                    item.classList.remove('active');
                    item.previousElementSibling.classList.remove('active');
                }
            });
            
            // فتح/إغلاق الإجابة الحالية
            this.classList.toggle('active');
            answer.classList.toggle('active');
            
            // إذا كانت الإجابة مفتوحة، قم بالتمرير إليها
            if (!isActive) {
                setTimeout(() => {
                    answer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 300);
            }
        });
    });
}

// فحص بيئة النوم
function initSleepChecker() {
    const checkBtn = document.querySelector('.check-btn');
    const checkResult = document.getElementById('sleepCheckResult');
    
    if (checkBtn && checkResult) {
        checkBtn.addEventListener('click', function() {
            const checkboxes = document.querySelectorAll('input[name="sleep-check"]:checked');
            const checkedCount = checkboxes.length;
            
            // إخفاء النتيجة السابقة
            checkResult.style.display = 'none';
            checkResult.className = 'check-result';
            
            // إضافة تأثير التحميل
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الفحص...';
            this.disabled = true;
            
            // محاكاة وقت المعالجة
            setTimeout(() => {
                let resultClass = '';
                let resultMessage = '';
                let resultIcon = '';
                
                if (checkedCount === 5) {
                    resultClass = 'safe';
                    resultIcon = '<i class="fas fa-check-circle"></i> ';
                    resultMessage = 'ممتاز! بيئة نوم طفلك آمنة جداً. استمري في اتباع قواعد النوم الآمن.';
                } else if (checkedCount >= 3) {
                    resultClass = 'warning';
                    resultIcon = '<i class="fas fa-exclamation-triangle"></i> ';
                    resultMessage = 'جيد، ولكن هناك مجال للتحسين. راجعي القواعد غير المطبقة لتحسين سلامة بيئة نوم طفلك.';
                } else {
                    resultClass = 'danger';
                    resultIcon = '<i class="fas fa-times-circle"></i> ';
                    resultMessage = 'تحذير! بيئة نوم طفلك تحتاج إلى تحسينات عاجلة لضمان سلامته. راجعي جميع قواعد النوم الآمن.';
                }
                
                // عرض النتيجة
                checkResult.className = `check-result ${resultClass}`;
                checkResult.innerHTML = `
                    <div class="result-header">
                        ${resultIcon}<strong>نتيجة الفحص</strong>
                    </div>
                    <p>${resultMessage}</p>
                    <p><small>تم تطبيق ${checkedCount} من أصل 5 قواعد للنوم الآمن.</small></p>
                `;
                checkResult.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-check-circle"></i> تحقق من السلامة';
                this.disabled = false;
                
                // التمرير إلى النتيجة
                checkResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1000);
        });
    }
}

// مولد روتين النوم
function initRoutineGenerator() {
    const generateBtn = document.querySelector('.generate-btn');
    const generatedRoutine = document.getElementById('generatedRoutine');
    
    if (generateBtn && generatedRoutine) {
        generateBtn.addEventListener('click', function() {
            const ageSelect = document.getElementById('childAge');
            const selectedAge = ageSelect.value;
            
            if (!selectedAge) {
                alert('الرجاء اختيار عمر الطفل أولاً');
                return;
            }
            
            // إخفاء النتيجة السابقة
            generatedRoutine.style.display = 'none';
            
            // إضافة تأثير التحميل
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التوليد...';
            this.disabled = true;
            
            // محاكاة وقت المعالجة
            setTimeout(() => {
                let routineData = {};
                
                // بيانات الروتين حسب العمر
                const routines = {
                    '0-3': {
                        title: 'روتين نوم للطفل (0-3 أشهر)',
                        items: [
                            'ابدئي الروتين بين الساعة 7-8 مساءً',
                            'حمام دافئ لمدة 5-10 دقائق',
                            'تدليك لطيف بزيت الأطفال',
                            'إرضاع الطفل حتى يشبع',
                            'تهدئة الطفل بالهز اللطيف أو الغناء',
                            'وضع الطفل في سريره وهو نعسان ولكن مستيقظ'
                        ]
                    },
                    '4-6': {
                        title: 'روتين نوم للطفل (4-6 أشهر)',
                        items: [
                            'ابدئي الروتين بين الساعة 7-7:30 مساءً',
                            'حمام دافئ مع ألعاب استحمام بسيطة',
                            'ارتداء ملابس النوم المريحة',
                            'قراءة قصة قصيرة بصوت هادئ',
                            'الرضاعة أو الحليب الصناعي',
                            'وضع الطفل في سريره وإطفاء الأنوار'
                        ]
                    },
                    '7-12': {
                        title: 'روتين نوم للطفل (7-12 شهر)',
                        items: [
                            'ابدئي الروتين بين الساعة 7-7:30 مساءً',
                            'وجبة عشاء خفيفة (إذا بدأ الطعام الصلب)',
                            'حمام دافئ وتنظيف الأسنان (إذا ظهرت)',
                            'قراءة كتاب أو غناء أغنية',
                            'عناق وقبلة ليلة سعيدة',
                            'وضع الطفل في سريره وإطفاء الأنوار'
                        ]
                    },
                    '1-2': {
                        title: 'روتين نوم للطفل (1-2 سنة)',
                        items: [
                            'ابدئي الروتين بين الساعة 7-8 مساءً',
                            'وجبة عشاء خفيفة',
                            'حمام وتنظيف الأسنان',
                            'قراءة قصة أو كتاب مفضل',
                            'محادثة هادئة عن أحداث اليوم',
                            'وضع الطفل في سريره مع دمية مفضلة'
                        ]
                    }
                };
                
                routineData = routines[selectedAge];
                
                // عرض الروتين
                generatedRoutine.innerHTML = `
                    <h4><i class="fas fa-moon"></i> ${routineData.title}</h4>
                    <ul>
                        ${routineData.items.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                    <p><small><i class="fas fa-lightbulb"></i> تذكير: حافظي على نفس الروتين كل ليلة لتعويد الطفل على النوم المنتظم.</small></p>
                `;
                generatedRoutine.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-cogs"></i> توليد الروتين';
                this.disabled = false;
                
                // التمرير إلى النتيجة
                generatedRoutine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 800);
        });
    }
}

// محاكاة اختبار درجة حرارة الغرفة
function simulateRoomTempCheck() {
    const tempCheckBtn = document.querySelector('.temp-check-btn');
    
    if (tempCheckBtn) {
        tempCheckBtn.addEventListener('click', function() {
            // توليد درجة حرارة عشوائية بين 18 و 25
            const randomTemp = Math.floor(Math.random() * 7) + 18;
            let tempStatus = '';
            let tempClass = '';
            
            if (randomTemp >= 20 && randomTemp <= 22) {
                tempStatus = 'مثالية';
                tempClass = 'safe';
            } else if (randomTemp >= 18 && randomTemp <= 24) {
                tempStatus = 'مقبولة';
                tempClass = 'warning';
            } else {
                tempStatus = 'غير مناسبة';
                tempClass = 'danger';
            }
            
            alert(`درجة حرارة الغرفة: ${randomTemp}°C\nالحالة: ${tempStatus}`);
            
            // يمكن تحديث واجهة المستخدم بناءً على النتيجة
            const tempIndicator = document.querySelector('.temp-indicator');
            if (tempIndicator) {
                tempIndicator.className = `temp-indicator ${tempClass}`;
                tempIndicator.textContent = `${randomTemp}°C - ${tempStatus}`;
            }
        });
    }
}

// تفعيل اختبار درجة حرارة الغرفة إذا كان الزر موجوداً
if (document.querySelector('.temp-check-btn')) {
    simulateRoomTempCheck();
}