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
                    resultTitle = 'مستعد تماماً!';
                    resultMessage = 'طفلك يظهر جميع علامات الاستعداد للطعام الصلب. يمكنك البدء بتقديم أول وجبة له.';
                    resultClass = 'ready';
                    recommendations = [
                        'ابدئي بحبوب الأطفال المدعمة بالحديد',
                        'قدمي كميات صغيرة جداً في البداية',
                        'اختاري وقتاً يكون فيه الطفل هادئاً ومستيقظاً',
                        'استمري في الرضاعة الطبيعية أو الصناعية'
                    ];
                } else if (yesCount >= 2) {
                    resultTitle = 'شبه مستعد';
                    resultMessage = 'طفلك يظهر بعض علامات الاستعداد. يمكنك البدء ولكن بحذر، وراقبي ردود فعله.';
                    resultClass = 'almost-ready';
                    recommendations = [
                        'ابدئي بكميات صغيرة جداً',
                        'راقبي الطفل جيداً أثناء الأكل',
                        'تأكدي من جلوس الطفل بشكل صحيح',
                        'إذا لم يكن مهتماً، انتظري أسبوعاً آخر وحاولي مجدداً'
                    ];
                } else {
                    resultTitle = 'ليس مستعداً بعد';
                    resultMessage = 'طفلك لا يظهر علامات استعداد كافية للطعام الصلب. انتظري بضعة أسابيع وحاولي مرة أخرى.';
                    resultClass = 'not-ready';
                    recommendations = [
                        'انتظري حتى يبلغ الطفل 6 أشهر على الأقل',
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
                    <p>${resultMessage}</p>
                    <p><small>الإجابات: ${yesCount} نعم، ${noCount} لا</small></p>
                    
                    <div class="result-recommendations">
                        <h5><i class="fas fa-lightbulb"></i> التوصيات:</h5>
                        <ul>
                            ${recommendations.map(rec => `<li><i class="fas fa-check"></i> ${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
                readinessResult.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-calculator"></i> احسبي درجة الاستعداد';
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
                            <li>قدمي صنفاً واحداً جديداً كل 3-5 أيام</li>
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
    const calculateBtn = document.getElementById('calculateQuantity');
    const quantityResult = document.getElementById('quantityResult');
    
    if (calculateBtn && quantityResult) {
        calculateBtn.addEventListener('click', function() {
            const foodType = document.getElementById('foodType').value;
            const childMonths = parseInt(document.getElementById('childMonths').value);
            
            // التحقق من المدخلات
            if (!foodType || !childMonths || isNaN(childMonths) || childMonths < 6 || childMonths > 24) {
                showCalculatorError(quantityResult, 'الرجاء إدخال بيانات صحيحة (العمر بين 6 و 24 شهراً)');
                return;
            }
            
            // إخفاء النتيجة السابقة
            quantityResult.style.display = 'none';
            
            // إضافة تأثير التحميل
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحساب...';
            this.disabled = true;
            
            // محاكاة وقت المعالجة
            setTimeout(() => {
                let foodName = '';
                let recommendedAmount = '';
                let servingSize = '';
                let tips = [];
                
                // تحديد الكمية بناءً على نوع الطعام والعمر
                if (foodType === 'cereal') {
                    foodName = 'حبوب الأطفال';
                    
                    if (childMonths <= 8) {
                        recommendedAmount = '1-2 ملاعق طعام';
                        servingSize = 'مرة أو مرتين يومياً';
                    } else if (childMonths <= 12) {
                        recommendedAmount = '¼ - ½ كوب';
                        servingSize = 'مرتين يومياً';
                    } else {
                        recommendedAmount = '½ - ¾ كوب';
                        servingSize = 'مرتين يومياً';
                    }
                    
                    tips = [
                        'اخلطي الحبوب بحليب الثدي أو الصناعي',
                        'ابدئي بقوام سائل ثم زيدي السماكة تدريجياً',
                        'اختاري حبوب الأطفال المدعمة بالحديد'
                    ];
                } else if (foodType === 'fruit') {
                    foodName = 'الفواكه المهروسة';
                    
                    if (childMonths <= 8) {
                        recommendedAmount = '1-2 ملاعق طعام';
                        servingSize = 'مرة يومياً';
                    } else if (childMonths <= 12) {
                        recommendedAmount = '¼ - ½ كوب';
                        servingSize = 'مرتين يومياً';
                    } else {
                        recommendedAmount = '½ - ¾ كوب';
                        servingSize = 'مرتين يومياً';
                    }
                    
                    tips = [
                        'ابدئي بالفواكه سهلة الهضم مثل الموز والتفاح',
                        'قشري الفواكه جيداً قبل التقديم',
                        'تجنبي الفواكه المعلبة المضاف إليها سكر'
                    ];
                } else if (foodType === 'vegetable') {
                    foodName = 'الخضروات المهروسة';
                    
                    if (childMonths <= 8) {
                        recommendedAmount = '1-2 ملاعق طعام';
                        servingSize = 'مرة يومياً';
                    } else if (childMonths <= 12) {
                        recommendedAmount = '¼ - ½ كوب';
                        servingSize = 'مرتين يومياً';
                    } else {
                        recommendedAmount = '½ - ¾ كوب';
                        servingSize = 'مرتين يومياً';
                    }
                    
                    tips = [
                        'ابدئي بالخضروات الحلوة مثل البطاطا الحلوة والجزر',
                        'اطبخي الخضروات حتى تصبح طرية جداً',
                        'اهرسي الخضرواس جيداً وقدميها بدون كتل'
                    ];
                } else if (foodType === 'protein') {
                    foodName = 'البروتينات';
                    
                    if (childMonths <= 8) {
                        recommendedAmount = '1-2 ملاعق طعام';
                        servingSize = 'مرة يومياً';
                    } else if (childMonths <= 12) {
                        recommendedAmount = '¼ - ½ كوب';
                        servingSize = 'مرتين يومياً';
                    } else {
                        recommendedAmount = '½ - ¾ كوب';
                        servingSize = 'مرتين يومياً';
                    }
                    
                    tips = [
                        'ابدئي باللحوم المهروسة جيداً',
                        'تأكدي من نزع العظام والجلد',
                        'قدمي البياض بعد التأكد من عدم وجود حساسية للصفار'
                    ];
                }
                
                // عرض النتيجة
                quantityResult.innerHTML = `
                    <h4><i class="fas fa-weight"></i> الكمية الموصى بها</h4>
                    <div class="quantity-details">
                        <p><strong>نوع الطعام:</strong> ${foodName}</p>
                        <p><strong>العمر:</strong> ${childMonths} شهراً</p>
                        <p><strong>الكمية لكل وجبة:</strong> ${recommendedAmount}</p>
                        <p><strong>عدد الوجبات:</strong> ${servingSize}</p>
                    </div>
                    
                    <div class="quantity-tips">
                        <h5><i class="fas fa-lightbulb"></i> نصائح:</h5>
                        <ul>
                            ${tips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="quantity-note">
                        <p><small><i class="fas fa-info-circle"></i> هذه الكميات هي معدلات عامة. راقبي إشارات الجوع والشبع لدى طفلك.</small></p>
                    </div>
                `;
                quantityResult.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-calculator"></i> احسبي الكمية';
                this.disabled = false;
                
                // التمرير إلى النتيجة
                quantityResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 600);
        });
    }
    
    function showCalculatorError(element, message) {
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
            if (!newFood) {
                showTrackerMessage('الرجاء إدخال اسم الطعام', 'error');
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
            saveFoodRecord(record);
            
            // إضافة السجل إلى القائمة
            addFoodRecordToHistory(record);
            
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
        let records = JSON.parse(localStorage.getItem('foodRecords') || '[]');
        
        // إضافة السجل الجديد
        records.unshift(record);
        
        // الاحتفاظ فقط بآخر 15 سجل
        if (records.length > 15) {
            records = records.slice(0, 15);
        }
        
        // حفظ في localStorage
        localStorage.setItem('foodRecords', JSON.stringify(records));
    }
    
    function loadFoodHistory() {
        const records = JSON.parse(localStorage.getItem('foodRecords') || '[]');
        
        if (records.length > 0 && foodHistory) {
            records.forEach(record => {
                addFoodRecordToHistory(record);
            });
        } else if (foodHistory) {
            foodHistory.innerHTML = '<p class="empty-history">لا توجد سجلات سابقة. ابدأي بتسجيل الأطعمة الجديدة.</p>';
        }
    }
    
    function addFoodRecordToHistory(record) {
        if (!foodHistory) return;
        
        // تنسيق التاريخ
        const dateObj = new Date(record.date);
        const formattedDate = dateObj.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // ترجمة رد الفعل
        const reactionNames = {
            'like': 'أعجبه',
            'dislike': 'لم يعجبه',
            'neutral': 'محايد'
        };
        
        const reactionColors = {
            'like': '#4CAF50',
            'dislike': '#F44336',
            'neutral': '#757575'
        };
        
        // إنشاء عنصر السجل
        const recordElement = document.createElement('div');
        recordElement.className = 'tracker-history-item';
        recordElement.innerHTML = `
            <div class="record-info">
                <strong>${record.food}</strong>
                <span class="record-date">${formattedDate}</span>
            </div>
            <span class="food-reaction ${record.reaction}" style="background-color: ${reactionColors[record.reaction] + '20'}; color: ${reactionColors[record.reaction]}">
                ${reactionNames[record.reaction]}
            </span>
        `;
        
        // إضافة زر حذف
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-record';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.title = 'حذف السجل';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteFoodRecord(record.id, recordElement);
        });
        
        recordElement.querySelector('.record-info').appendChild(deleteBtn);
        
        // إضافة السجل إلى بداية القائمة
        if (foodHistory.querySelector('.empty-history')) {
            foodHistory.innerHTML = '';
        }
        
        foodHistory.insertBefore(recordElement, foodHistory.firstChild);
    }
    
    function deleteFoodRecord(id, element) {
        // إزالة من localStorage
        let records = JSON.parse(localStorage.getItem('foodRecords') || '[]');
        records = records.filter(record => record.id !== id);
        localStorage.setItem('foodRecords', JSON.stringify(records));
        
        // إزالة من الواجهة
        element.remove();
        
        // إذا لم تعد هناك سجلات، عرض رسالة
        if (foodHistory.children.length === 0) {
            foodHistory.innerHTML = '<p class="empty-history">لا توجد سجلات سابقة. ابدأي بتسجيل الأطعمة الجديدة.</p>';
        }
        
        showTrackerMessage('تم حذف السجل بنجاح', 'success');
    }
    
    function showTrackerMessage(message, type) {
        // إنشاء عنصر الرسالة
        const messageDiv = document.createElement('div');
        messageDiv.className = `tracker-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
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