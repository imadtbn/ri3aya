// تهيئة صفحة التغذية والطعام
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة فحص الاستعداد
    initReadinessChecker();
    
    // تهيئة مولد الوجبات
    initMealGenerator();
    
    // تهيئة حاسبة الكميات
    initQuantityCalculator();
    
    // تهيئة سجل تقديم الأطعمة
    initFoodTracker();
    
    // إضافة أي تفاعلات إضافية خاصة بصفحة التغذية
});

// فحص استعداد الطفل للطعام الصلب
function initReadinessChecker() {
    const optionButtons = document.querySelectorAll('.option-btn');
    const checkBtn = document.getElementById('checkReadiness');
    const readinessResult = document.getElementById('readinessResult');
    
    // إضافة أحداث لأزرار الخيارات
    optionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة النشاط من جميع الأزرار في نفس المجموعة
            const questionDiv = this.closest('.checker-question');
            questionDiv.querySelectorAll('.option-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة النشاط للزر المضغوط
            this.classList.add('active');
        });
    });
    
    if (checkBtn && readinessResult) {
        checkBtn.addEventListener('click', function() {
            // جمع الإجابات
            const questions = document.querySelectorAll('.checker-question');
            let yesCount = 0;
            let noCount = 0;
            let totalQuestions = 0;
            
            questions.forEach(question => {
                const activeBtn = question.querySelector('.option-btn.active');
                if (activeBtn) {
                    totalQuestions++;
                    const value = activeBtn.getAttribute('data-value');
                    
                    if (value === 'yes') {
                        yesCount++;
                    } else if (value === 'no') {
                        noCount++;
                    }
                }
            });
            
            // التحقق من إجابة جميع الأسئلة
            if (totalQuestions < questions.length) {
                showCheckerError(readinessResult, 'الرجاء الإجابة على جميع الأسئلة أولاً');
                return;
            }
            
            // إخفاء النتيجة السابقة
            readinessResult.style.display = 'none';
            
            // إضافة تأثير التحميل
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحليل...';
            this.disabled = true;
            
            // محاكاة وقت المعالجة
            setTimeout(() => {
                let resultTitle = '';
                let resultMessage = '';
                let resultClass = '';
                let recommendations = [];
                
                // تحليل النتائج
                if (yesCount === 3) {
                    resultTitle = 'مؤشرات استعداد محتملة';
                    resultMessage = 'توجد إشارات مشجعة، لكنها لا تثبت الاستعداد ولا تحدد متى يبدأ الطفل الأكل. يبدأ الطعام التكميلي عادة حول 6 أشهر مع توافر مهارات البلع والجلوس؛ استشيري المختص عند الشك أو الولادة المبكرة.';
                    resultClass = 'ready';
                    recommendations = [
                        'ناقشي تقديم طعام غني بالحديد وملائم للعمر مع المختص',
                        'قدمي كميات صغيرة جداً في البداية',
                        'اختاري وقتاً يكون فيه الطفل هادئاً ومستيقظاً',
                        'استمري في الرضاعة الطبيعية أو الصناعية'
                    ];
                } else if (yesCount >= 2) {
                    resultTitle = 'بعض المؤشرات تحتاج متابعة';
                    resultMessage = 'بعض الإشارات موجودة، لكن لا يمكن اعتبار النتيجة تصريحًا ببدء الطعام. تأكدي من العمر والقدرة على التحكم بالرأس والبلع، واطلبي توجيهًا فرديًا عند الحاجة.';
                    resultClass = 'almost-ready';
                    recommendations = [
                        'ابدئي بكميات صغيرة بعد تحقق العمر والاستعداد، ولا تجبري الطفل',
                        'راقبي الطفل جيداً أثناء الأكل',
                        'تأكدي من جلوس الطفل بشكل صحيح',
                        'إذا لم يكن مهتماً، انتظري أسبوعاً آخر وحاولي مجدداً'
                    ];
                } else {
                    resultTitle = 'راجعي المؤشرات مع الوقت';
                    resultMessage = 'توجد مهارات لم تظهر بعد وفق إجاباتك. لا يمكن للأداة تحديد موعد البدء أو استبعاد مشكلة تغذية؛ تحدثي مع الطبيب إذا كانت هناك صعوبة مستمرة.';
                    resultClass = 'not-ready';
                    recommendations = [
                        'التغذية التكميلية تبدأ عادة حول 6 أشهر وليس بناءً على مجموع الإجابات فقط',
                        'تابعي علامات الاستعداد كل أسبوع',
                        'استمري في الرضاعة الطبيعية أو الصناعية فقط',
                        'لا تجبري الطفل على الأكل قبل أن يكون مستعداً'
                    ];
                }
                
                // عرض النتيجة
                readinessResult.innerHTML = `
                    <h4><i class="fas fa-clipboard-check"></i> نتيجة الفحص</h4>
                    <div class="result-status ${resultClass}">
                        <strong>${resultTitle}</strong>
                    </div>
                    <p>${resultMessage}</p><p class="medical-safety-note">هذه أسئلة للتثقيف فقط؛ لا تشمل عمر الطفل أو تقييم البلع أو الحساسية أو حالته الطبية، ولا تقدّم حكمًا سريريًا.</p>
                    <p><small>الإجابات: ${yesCount} نعم، ${noCount} لا</small></p>
                    
                    <div class="result-recommendations">
                        <h5><i class="fas fa-lightbulb"></i> إرشادات عامة:</h5>
                        <ul>
                            ${recommendations.map(rec => `<li><i class="fas fa-check"></i> ${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
                readinessResult.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-clipboard-check"></i> راجعي مؤشرات الاستعداد';
                this.disabled = false;
                
                // التمرير إلى النتيجة
                readinessResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 800);
        });
    }
    
    function showCheckerError(element, message) {
        element.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
        element.style.display = 'block';
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// مولد وجبات مخصصة
function initMealGenerator() {
    const generateBtn = document.getElementById('generateMeals');
    const mealSuggestions = document.getElementById('mealSuggestions');
    
    if (generateBtn && mealSuggestions) {
        generateBtn.addEventListener('click', function() {
            const babyAge = document.getElementById('babyAge').value;
            const mealCount = document.getElementById('mealCount').value;
            
            // التحقق من اختيار الخيارات
            if (!babyAge || !mealCount) {
                showGeneratorError(mealSuggestions, 'الرجاء اختيار عمر الطفل وعدد الوجبات');
                return;
            }
            
            // إخفاء النتيجة السابقة
            mealSuggestions.style.display = 'none';
            
            // إضافة تأثير التحميل
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التوليد...';
            this.disabled = true;
            
            // محاكاة وقت المعالجة
            setTimeout(() => {
                let mealPlan = [];
                let stageTitle = '';
                
                // تحديد المرحلة بناءً على العمر
                if (babyAge === '6-8') {
                    stageTitle = 'المرحلة الأولى (6-8 أشهر)';
                    mealPlan = [
                        'وجبة فطور: حبوب الأطفال مع حليب الثدي أو الصناعي',
                        'وجبة غداء: بطاطا حلوة مهروسة',
                        'وجبة عشاء: جزر مهروس'
                    ];
                } else if (babyAge === '8-10') {
                    stageTitle = 'المرحلة الثانية (8-10 أشهر)';
                    mealPlan = [
                        'وجبة فطور: شوفان مع موز مهروس',
                        'وجبة غداء: دجاج مهروس مع أرصيصه',
                        'وجبة عشاء: زبادي مع أفوكادو مهروس'
                    ];
                } else if (babyAge === '10-12') {
                    stageTitle = 'المرحلة الثالثة (10-12 شهر)';
                    mealPlan = [
                        'وجبة فطور: بيضة مسلوقة مع خبز محمص',
                        'وجبة غداء: أرز مع لحمة مفرومة وخضروات',
                        'وجبة عشاء: مكرونة صغيرة مع جبنة وخضروات'
                    ];
                } else {
                    stageTitle = 'مرحلة الطفل الكبير (12-18 شهر)';
                    mealPlan = [
                        'وجبة فطور: حبوب كاملة مع حليب كامل الدسم',
                        'وجبة غداء: طعام العائلة المعدل (أرز، لحمة، خضار)',
                        'وجبة عشاء: ساندويتش صغير مع جبنة وخضار'
                    ];
                }
                
                // تحديد عدد الوجبات المطلوبة
                const requestedMeals = parseInt(mealCount);
                const selectedMeals = mealPlan.slice(0, requestedMeals);
                
                // عرض الاقتراحات
                mealSuggestions.innerHTML = `
                    <h4><i class="fas fa-utensils"></i> اقتراحات وجبات ل${stageTitle}</h4>
                    <ul>
                        ${selectedMeals.map(meal => `<li>${meal}</li>`).join('')}
                    </ul>
                    
                    <div class="meal-tips">
                        <h5><i class="fas fa-lightbulb"></i> نصائح مهمة:</h5>
                        <ul>
                            <li>ابدئي بالأطعمة المفردة تدريجيًا لملاحظة التفاعل، مع الحفاظ على التنوع الملائم للعمر</li>
                            <li>راقبي الطفل للكشف عن أي علامات حساسية</li>
                            <li>استمري في الرضاعة الطبيعية أو الصناعية</li>
                            <li>لا تجبري الطفل على إنهاء الوجبة</li>
                        </ul>
                    </div>
                `;
                mealSuggestions.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-magic"></i> توليد اقتراحات وجبات';
                this.disabled = false;
                
                // التمرير إلى النتيجة
                mealSuggestions.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 800);
        });
    }
    
    function showGeneratorError(element, message) {
        element.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
        element.style.display = 'block';
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// حاسبة كميات الطعام

function initQuantityCalculator() {
    const button = document.getElementById('calculateQuantity');
    const result = document.getElementById('quantityResult');
    if (!button || !result) return;
    const foodNames = { cereal: 'حبوب الأطفال', fruit: 'الفواكه', vegetable: 'الخضروات', protein: 'الأطعمة الغنية بالبروتين' };
    button.addEventListener('click', function() {
        const food = document.getElementById('foodType')?.value;
        const raw = document.getElementById('childMonths')?.value;
        const age = Number(raw);
        if (!Object.hasOwn(foodNames, food) || raw === '' || !Number.isInteger(age) || age < 6 || age > 24) {
            result.textContent = 'اختاري نوع الطعام وأدخلي عمرًا صحيحًا بين 6 و24 شهرًا.';
            result.style.display = 'block';
            return;
        }
        const frequency = age <= 8 ? 'تشير WHO إلى 2–3 وجبات تكميلية يوميًا عادةً لعمر 6–8 أشهر.'
            : age <= 23 ? 'تشير WHO إلى 3–4 وجبات تكميلية يوميًا عادةً لعمر 9–23 شهرًا، مع وجبات خفيفة عند الحاجة.'
            : 'بعد إتمام عامين تتنوع الوجبات بحسب نمو الطفل ونشاطه وعاداته الغذائية.';
        const title = document.createElement('h4');
        title.textContent = 'إرشادات عامة حسب العمر — ليست حاسبة جرعات أو حصص';
        const description = document.createElement('p');
        description.textContent = 'العمر: ' + age + ' شهرًا؛ نوع الطعام: ' + foodNames[food] + '. ' + frequency;
        const note = document.createElement('p');
        note.className = 'medical-safety-note';
        note.textContent = 'لا توجد كمية ثابتة مناسبة لكل رضيع بناءً على العمر ونوع الطعام وحدهما. قدّمي قوامًا آمنًا وبكميات تتدرج وفق إشارات الجوع والشبع واستمرار الرضاعة، ولا تجبري الطفل على إنهاء وجبته. اسألي طبيب الطفل عند وجود قلق حول النمو أو البلع أو الحساسية.';
        const source = document.createElement('a');
        source.href = 'https://www.who.int/health-topics/complementary-feeding';
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.textContent = 'المصدر: إرشادات منظمة الصحة العالمية للتغذية التكميلية';
        result.replaceChildren(title, description, note, source);
        result.style.display = 'block';
    });
}

// سجل تقديم الأطعمة
function initFoodTracker() {
    const trackBtn = document.getElementById('trackFood');
    const foodHistory = document.getElementById('foodHistory');
    const reactionButtons = document.querySelectorAll('.reaction-btn');
    let selectedReaction = null;
    
    // تحميل السجلات المحفوظة
    loadFoodHistory();
    
    // إضافة أحداث لأزرار رد الفعل
    reactionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة النشاط من جميع الأزرار
            reactionButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إضافة النشاط للزر المضغوط
            this.classList.add('active');
            selectedReaction = this.getAttribute('data-reaction');
        });
    });
    
    if (trackBtn) {
        trackBtn.addEventListener('click', function() {
            const newFood = document.getElementById('newFood').value.trim();
            const foodDate = document.getElementById('foodDate').value;
            const currentDate = new Date().toISOString().split('T')[0];
            
            // التحقق من البيانات
            if (!newFood || newFood.length > 100) {
                showTrackerMessage('الرجاء إدخال اسم الطعام (حتى 100 حرف)', 'error');
                return;
            }
            
            if (!foodDate) {
                showTrackerMessage('الرجاء اختيار تاريخ التقديم', 'error');
                return;
            }
            
            if (!selectedReaction) {
                showTrackerMessage('الرجاء اختيار رد فعل الطفل', 'error');
                return;
            }
            
            // إنشاء كائن السجل
            const record = {
                id: Date.now(),
                food: newFood,
                date: foodDate,
                reaction: selectedReaction,
                timestamp: Date.now()
            };
            
            // حفظ السجل
            if (!saveFoodRecord(record)) return;
            
            // إضافة السجل إلى القائمة

            
            // مسح الحقول
            document.getElementById('newFood').value = '';
            document.getElementById('foodDate').value = '';
            reactionButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            selectedReaction = null;
            
            // عرض رسالة نجاح
            showTrackerMessage('تم تسجيل الطعام بنجاح', 'success');
        });
    }
    
    function saveFoodRecord(record) {
        const result = window.Ri3ayaLocal.add('foodRecords', record);
        if (!result.ok) { window.Ri3ayaLocal.notify(result.error); showTrackerMessage(result.error, 'error'); }
        return result.ok;
    }

    function loadFoodHistory() {
        if (!foodHistory) return;
        const result = window.Ri3ayaLocal.read('foodRecords');
        foodHistory.replaceChildren();
        if (!result.ok || !result.records.length) {
            const note = document.createElement('p'); note.className = 'empty-history';
            note.textContent = result.ok ? 'لا توجد أطعمة مسجلة بعد.' : result.error;
            foodHistory.append(note); return;
        }
        result.records.forEach(record => {
            const element = document.createElement('div'); element.className = 'tracker-history-item';
            const info = document.createElement('div'); info.className = 'record-info';
            const values = [record.food, new Date(record.date + 'T12:00:00').toLocaleDateString('ar-DZ'), ({like:'أعجبه',dislike:'لم يعجبه',neutral:'محايد'})[record.reaction]];
            values.forEach((value, index) => { const node = document.createElement(index === 0 ? 'strong' : 'span'); node.textContent = value; info.append(node); });
            const button = document.createElement('button'); button.type = 'button'; button.className = 'delete-record'; button.textContent = 'حذف'; button.setAttribute('aria-label', 'حذف هذا السجل');
            button.addEventListener('click', () => {
                if (!confirm('حذف هذا السجل من المتصفح؟')) return;
                const deleted = window.Ri3ayaLocal.removeRecord('foodRecords', record);
                window.Ri3ayaLocal.notify(deleted.ok ? 'تم حذف السجل.' : deleted.error);
                showTrackerMessage(deleted.ok ? 'تم حذف السجل.' : deleted.error, deleted.ok ? 'success' : 'error');
            });
            element.append(info, button); foodHistory.append(element);
        });
    }
    window.addEventListener('ri3aya-data-change', event => { if (!event.detail.key || event.detail.key === 'foodRecords') loadFoodHistory(); });

    function showTrackerMessage(message, type) {
        // إنشاء عنصر الرسالة
        const messageDiv = document.createElement('div');
        messageDiv.className = `tracker-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.setAttribute('role', 'status');
        
        // إضافة الرسالة إلى الصفحة
        document.body.appendChild(messageDiv);
        
        // إظهار الرسالة
        setTimeout(() => {
            messageDiv.classList.add('show');
        }, 10);
        
        // إخفاء الرسالة بعد 3 ثوانٍ
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}

// إضافة أنماط الرسائل المؤقتة
const style = document.createElement('style');
style.textContent = `
    .tracker-message {
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: var(--white);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 10000;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .tracker-message.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .tracker-message.success {
        border-right: 4px solid var(--success);
    }
    
    .tracker-message.success i {
        color: var(--success);
    }
    
    .tracker-message.error {
        border-right: 4px solid var(--danger);
    }
    
    .tracker-message.error i {
        color: var(--danger);
    }
    
    .tracker-message i {
        font-size: 1.5rem;
    }
    
    .tracker-message span {
        color: var(--gray-800);
        font-weight: 500;
    }
    
    .delete-record {
        background: none;
        border: none;
        color: var(--gray-500);
        cursor: pointer;
        font-size: 0.9rem;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .delete-record:hover {
        color: var(--danger);
        background-color: rgba(244, 67, 54, 0.1);
    }
    
    .empty-history {
        text-align: center;
        color: var(--gray-500);
        font-style: italic;
        padding: 1rem;
    }
    
    .record-info {
        flex: 1;
    }
    
    .record-info strong {
        display: block;
        margin-bottom: 0.25rem;
        color: var(--gray-800);
    }
    
    .record-date {
        font-size: 0.8rem;
        color: var(--gray-500);
    }
    
    @media (min-width: 768px) {
        .tracker-message {
            left: auto;
            right: 20px;
            max-width: 400px;
        }
    }
`;
document.head.appendChild(style);

