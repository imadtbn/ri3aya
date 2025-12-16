/**
 * ملف JavaScript لأداة مخطط وجبات الطعام
 * يحتوي على منطق إنشاء خطة وجبات مخصصة حسب عمر الطفل والحساسيات
 */

document.addEventListener('DOMContentLoaded', function() {
    // تهيئة الأداة عند تحميل الصفحة
    initMealPlanner();
    
    // إضافة مستمع حدث لزر إنشاء خطة الوجبات
    const generateButton = document.getElementById('generate-meal-plan');
    if (generateButton) {
        generateButton.addEventListener('click', generateMealPlan);
    }
});

/**
 * تهيئة أداة مخطط الوجبات
 */
function initMealPlanner() {
    // تعبئة حقل خطة الوجبات ببعض التعليمات
    const resultsContainer = document.getElementById('meal-plan-results');
    if (resultsContainer && resultsContainer.innerHTML.trim() === '') {
        resultsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>جاهز لإنشاء خطة وجبات لطفلك</h3>
                <p>اختر عمر الطفل وأي حساسيات غذائية، ثم انقر على "إنشاء خطة الوجبات"</p>
            </div>
        `;
    }
}

/**
 * إنشاء خطة وجبات مخصصة
 */
function generateMealPlan() {
    // جمع بيانات الإدخال
    const ageRange = document.getElementById('planner-age').value;
    const allergies = document.getElementById('planner-allergies').value;
    
    // التحقق من صحة البيانات
    if (!ageRange) {
        showError('الرجاء اختيار عمر الطفل');
        return;
    }
    
    // إنشاء خطة الوجبات
    const mealPlan = createMealPlan(ageRange, allergies);
    
    // عرض النتائج
    displayMealPlan(mealPlan);
    
    // إضافة تأثير بصرية
    const resultsContainer = document.getElementById('meal-plan-results');
    resultsContainer.classList.add('show-plan');
    
    // إضافة زر الطباعة
    addPrintButton();
}

/**
 * إنشاء خطة وجبات مخصصة بناءً على العمر والحساسيات
 */
function createMealPlan(ageRange, allergies) {
    // تعريف بيانات الوجبات حسب العمر
    const mealPlans = {
        '6-8': {
            title: 'خطة وجبات للأطفال 6-8 أشهر',
            description: 'في هذا العمر، يبدأ الطفل بتذوق الأطعمة الصلبة. التركيز على الأطعمة المهروسة والناعمة.',
            dailyMeals: 2,
            meals: {
                breakfast: 'حليب الأم أو الحليب الصناعي',
                lunch: 'خضروات مهروسة (جزر، بطاطا حلوة، كوسا)',
                dinner: 'فاكهة مهروسة (تفاح، كمثرى، موز)'
            },
            tips: [
                'ابدئي بملعقة صغيرة يومياً وزدها تدريجياً',
                'قدمي نوعاً واحداً من الطعام لمدة 3 أيام لمراقبة الحساسية',
                'تجنبي العسل قبل عمر السنة'
            ]
        },
        '9-11': {
            title: 'خطة وجبات للأطفال 9-11 شهر',
            description: 'الطفل الآن جاهز لمزيد من التنوع والقوام السميك. يمكن تقديم أطعمة مقطعة صغيرة.',
            dailyMeals: 3,
            meals: {
                breakfast: 'حليب + عصيدة (شوفان، قمح)',
                lunch: 'خضروات مع أرز أو معكرونة مسلوقة',
                snack: 'فاكهة مقطعة صغيرة أو زبادي',
                dinner: 'حليب + خضروات مهروسة'
            },
            tips: [
                'قدمي الأطعمة المقطعة بدلاً من المهروسة لتشجيع المضغ',
                'يمكن إضافة كميات صغيرة من اللحوم المهروسة',
                'تجنبي الأطعمة المالحة والسكرية'
            ]
        },
        '12-18': {
            title: 'خطة وجبات للأطفال 12-18 شهر',
            description: 'الطفل الآن يأكل مع الأسرة. يمكن تقديم معظم الأطعمة مع تعديل القوام والقطع.',
            dailyMeals: 3,
            meals: {
                breakfast: 'حليب + بيض مسلوق + خبز صغير',
                lunch: 'خضروات + بروتين (دجاج، لحم، سمك) + أرز',
                snack: 'فاكهة + زبادي أو جبن',
                dinner: 'حليب + خضروات + معكرونة أو شوربة'
            },
            tips: [
                'قدمي الماء مع الوجبات',
                'قللي من الحليب إلى 500 مل يومياً ليتناول طعاماً أكثر',
                'تجنبي المكسرات الكاملة والعنب الكامل'
            ]
        },
        '19-24': {
            title: 'خطة وجبات للأطفال 19-24 شهر',
            description: 'الطفل الآن يأكل معظم الأطعمة العائلية. التركيز على التنوع والتوازن الغذائي.',
            dailyMeals: 3,
            meals: {
                breakfast: 'حليب + بيض + خبز + خضروات',
                lunch: 'بروتين + خضروات + نشويات (أرز، معكرونة، بطاطا)',
                snack: 'فاكهة + منتجات ألبان (زبادي، جبن)',
                dinner: 'حليب + خضروات + بروتين خفيف أو شوربة'
            },
            tips: [
                'شجعي الطفل على استخدام الملعقة بنفسه',
                'قدمي حصص صغيرة واتركي الطفل يطلب المزيد',
                'اجعلي وقت الطعام ممتعاً وهادئاً'
            ]
        }
    };
    
    // الحصول على خطة الوجبات الأساسية حسب العمر
    let plan = mealPlans[ageRange];
    
    if (!plan) {
        plan = mealPlans['12-18']; // خطة افتراضية
    }
    
    // تعديل الخطة حسب الحساسيات
    plan = adjustPlanForAllergies(plan, allergies);
    
    // إضافة جدول أسبوعي متنوع
    plan.weeklyPlan = generateWeeklyPlan(plan, allergies);
    
    return plan;
}

/**
 * تعديل خطة الوجبات حسب الحساسيات الغذائية
 */
function adjustPlanForAllergies(plan, allergies) {
    const adjustments = {
        'dairy': {
            titleSuffix: ' (مناسبة لحساسية الألبان)',
            substitutes: {
                'حليب': 'حليب الصويا أو حليب الأرز المدعم بالكالسيوم',
                'زبادي': 'زبادي الصويا أو جوز الهند',
                'جبن': 'بدائل الجبن النباتية'
            },
            warnings: [
                'تأكدي من تزويد الطفل بكميات كافية من الكالسيوم من مصادر نباتية',
                'اقرئي ملصقات المنتجات بعناية'
            ]
        },
        'eggs': {
            titleSuffix: ' (مناسبة لحساسية البيض)',
            substitutes: {
                'بيض': 'مهروس الموز أو التفاح للخبز، التوفو للبروتين'
            },
            warnings: [
                'تجنبي جميع منتجات البيض بما في ذلك المايونيز والبعض المخبوزات',
                'استخدمي بدائل الخبز التي لا تحتوي على بيض'
            ]
        },
        'nuts': {
            titleSuffix: ' (مناسبة لحساسية المكسرات)',
            substitutes: {},
            warnings: [
                'تجنبي جميع أنواع المكسرات والزبدة المصنوعة منها',
                'اقرئي الملصقات بعناية (قد تحتوي بعض المنتجات على أثر للمكسرات)'
            ]
        },
        'wheat': {
            titleSuffix: ' (مناسبة لحساسية القمح)',
            substitutes: {
                'خبز': 'خبز الذرة أو الأرز',
                'معكرونة': 'معكرونة الأرز أو الذرة',
                'عصيدة': 'عصيدة الذرة أو الشوفان الخالي من الغلوتين'
            },
            warnings: [
                'استخدمي بدائل الحبوب الخالية من الغلوتين',
                'تجنبي منتجات القمح والشعير والجاودار'
            ]
        }
    };
    
    if (allergies !== 'none' && adjustments[allergies]) {
        const adjustment = adjustments[allergies];
        
        // إضافة لاحقة للعنوان
        plan.title += adjustment.titleSuffix;
        
        // تعديل الوجبات
        for (const mealType in plan.meals) {
            let meal = plan.meals[mealType];
            for (const food in adjustment.substitutes) {
                if (meal.includes(food)) {
                    meal = meal.replace(food, adjustment.substitutes[food]);
                }
            }
            plan.meals[mealType] = meal;
        }
        
        // إضافة تحذيرات
        if (adjustment.warnings && adjustment.warnings.length > 0) {
            plan.tips = [...adjustment.warnings, ...plan.tips];
        }
    }
    
    return plan;
}

/**
 * إنشاء جدول أسبوعي متنوع للوجبات
 */
function generateWeeklyPlan(basePlan, allergies) {
    // قائمة بالأطعمة المتنوعة حسب الفئة
    const foodOptions = {
        proteins: ['دجاج', 'لحم بقري', 'سمك', 'عدس', 'حمص', 'فول', 'بيض'],
        vegetables: ['جزر', 'بروكلي', 'سبانخ', 'بطاطا حلوة', 'كوسا', 'بازلاء', 'فاصوليا خضراء'],
        fruits: ['تفاح', 'موز', 'كمثرى', 'خوخ', 'مشمش', 'بطيخ', 'برتقال'],
        carbs: ['أرز', 'معكرونة', 'خبز', 'بطاطا', 'شوفان', 'كسكس'],
        dairy: ['حليب', 'زبادي', 'جبن', 'لبن']
    };
    
    // إزالة الأطعمة المسببة للحساسية
    if (allergies === 'dairy') {
        foodOptions.dairy = ['حليب الصويا', 'زبادي الصويا', 'جبن نباتي'];
    }
    
    if (allergies === 'eggs') {
        foodOptions.proteins = foodOptions.proteins.filter(item => item !== 'بيض');
    }
    
    if (allergies === 'wheat') {
        foodOptions.carbs = ['أرز', 'بطاطا', 'ذرة', 'كسكس خالي من الغلوتين'];
    }
    
    // أيام الأسبوع
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    // إنشاء جدول أسبوعي
    const weeklyPlan = [];
    
    days.forEach(day => {
        // اختيار أطعمة عشوائية متنوعة
        const protein = foodOptions.proteins[Math.floor(Math.random() * foodOptions.proteins.length)];
        const vegetable = foodOptions.vegetables[Math.floor(Math.random() * foodOptions.vegetables.length)];
        const fruit = foodOptions.fruits[Math.floor(Math.random() * foodOptions.fruits.length)];
        const carb = foodOptions.carbs[Math.floor(Math.random() * foodOptions.carbs.length)];
        const dairy = foodOptions.dairy[Math.floor(Math.random() * foodOptions.dairy.length)];
        
        weeklyPlan.push({
            day: day,
            breakfast: `${dairy} + ${carb}`,
            lunch: `${protein} + ${vegetable} + ${carb}`,
            dinner: `${dairy} + ${vegetable} + ${fruit}`
        });
    });
    
    return weeklyPlan;
}

/**
 * عرض خطة الوجبات في الصفحة
 */
function displayMealPlan(plan) {
    const resultsContainer = document.getElementById('meal-plan-results');
    
    // بناء HTML لخطة الوجبات
    let html = `
        <div class="meal-plan-header">
            <h3><i class="fas fa-calendar-check"></i> ${plan.title}</h3>
            <p class="plan-description">${plan.description}</p>
            <div class="plan-summary">
                <div class="summary-item">
                    <i class="fas fa-utensil-spoon"></i>
                    <span>${plan.dailyMeals} وجبات يومياً</span>
                </div>
                <div class="summary-item">
                    <i class="fas fa-clock"></i>
                    <span>خطة أسبوعية متنوعة</span>
                </div>
            </div>
        </div>
        
        <div class="meal-plan-content">
            <div class="plan-tabs">
                <button class="plan-tab active" data-tab="daily">الروتين اليومي</button>
                <button class="plan-tab" data-tab="weekly">الجدول الأسبوعي</button>
                <button class="plan-tab" data-tab="tips">نصائح مهمة</button>
            </div>
            
            <div class="plan-tab-content">
                <!-- المحتوى اليومي -->
                <div class="tab-pane active" id="daily-pane">
                    <h4><i class="fas fa-sun"></i> الروتين اليومي المقترح</h4>
                    <div class="daily-meals">
    `;
    
    // إضافة الوجبات اليومية
    for (const mealType in plan.meals) {
        html += `
            <div class="meal-item">
                <div class="meal-time">${getMealTimeText(mealType)}</div>
                <div class="meal-food">${plan.meals[mealType]}</div>
            </div>
        `;
    }
    
    html += `
                    </div>
                </div>
                
                <!-- المحتوى الأسبوعي -->
                <div class="tab-pane" id="weekly-pane">
                    <h4><i class="fas fa-calendar-alt"></i> جدول الوجبات الأسبوعي</h4>
                    <div class="weekly-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>اليوم</th>
                                    <th>الفطور</th>
                                    <th>الغداء</th>
                                    <th>العشاء</th>
                                </tr>
                            </thead>
                            <tbody>
    `;
    
    // إضافة الجدول الأسبوعي
    plan.weeklyPlan.forEach(dayPlan => {
        html += `
            <tr>
                <td class="day-name">${dayPlan.day}</td>
                <td>${dayPlan.breakfast}</td>
                <td>${dayPlan.lunch}</td>
                <td>${dayPlan.dinner}</td>
            </tr>
        `;
    });
    
    html += `
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- المحتوى النصائح -->
                <div class="tab-pane" id="tips-pane">
                    <h4><i class="fas fa-lightbulb"></i> نصائح مهمة</h4>
                    <ul class="tips-list">
    `;
    
    // إضافة النصائح
    plan.tips.forEach(tip => {
        html += `<li><i class="fas fa-check-circle"></i> ${tip}</li>`;
    });
    
    html += `
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="plan-actions">
            <button class="btn btn-secondary" id="print-plan">
                <i class="fas fa-print"></i> طباعة الخطة
            </button>
            <button class="btn btn-secondary" id="save-plan">
                <i class="fas fa-save"></i> حفظ الخطة
            </button>
            <button class="btn btn-primary" id="regenerate-plan">
                <i class="fas fa-sync-alt"></i> إنشاء خطة جديدة
            </button>
        </div>
    `;
    
    // تعبئة النتائج
    resultsContainer.innerHTML = html;
    
    // إضافة مستمعي الأحداث للأزرار الجديدة
    addPlanEventListeners();
}

/**
 * الحصول على نص وقت الوجبة
 */
function getMealTimeText(mealType) {
    const mealTimes = {
        'breakfast': 'الفطور',
        'lunch': 'الغداء',
        'dinner': 'العشاء',
        'snack': 'وجبة خفيفة'
    };
    
    return mealTimes[mealType] || mealType;
}

/**
 * إضافة مستمعي الأحداث لأزرار الخطة
 */
function addPlanEventListeners() {
    // أزرار التبويب
    const tabButtons = document.querySelectorAll('.plan-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // إزالة النشاط من جميع الأزرار
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // إضافة النشاط للزر المختار
            this.classList.add('active');
            
            // إخفاء جميع المحتويات
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // إظهار المحتوى المختار
            document.getElementById(`${tabId}-pane`).classList.add('active');
        });
    });
    
    // زر الطباعة
    const printButton = document.getElementById('print-plan');
    if (printButton) {
        printButton.addEventListener('click', printMealPlan);
    }
    
    // زر الحفظ
    const saveButton = document.getElementById('save-plan');
    if (saveButton) {
        saveButton.addEventListener('click', saveMealPlan);
    }
    
    // زر إنشاء خطة جديدة
    const regenerateButton = document.getElementById('regenerate-plan');
    if (regenerateButton) {
        regenerateButton.addEventListener('click', function() {
            document.getElementById('generate-meal-plan').click();
        });
    }
}

/**
 * طباعة خطة الوجبات
 */
function printMealPlan() {
    const planContent = document.getElementById('meal-plan-results').innerHTML;
    const originalContent = document.body.innerHTML;
    
    // إنشاء نافذة طباعة
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>خطة وجبات الطفل</title>
            <style>
                body { font-family: 'Cairo', sans-serif; padding: 20px; color: #333; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                .meal-plan-header { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
                .plan-summary { display: flex; gap: 20px; margin-top: 15px; }
                .summary-item { display: flex; align-items: center; gap: 8px; }
                .daily-meals { margin: 20px 0; }
                .meal-item { display: flex; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
                .meal-time { font-weight: bold; width: 100px; color: #2c3e50; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th { background: #3498db; color: white; padding: 12px; text-align: right; }
                td { padding: 10px; border: 1px solid #ddd; }
                .day-name { font-weight: bold; color: #2c3e50; }
                .tips-list { padding-right: 20px; }
                .tips-list li { margin-bottom: 10px; }
                @media print {
                    body { font-size: 12pt; }
                    .plan-actions { display: none; }
                    .plan-tabs { display: none; }
                    .tab-pane { display: block !important; }
                    .tab-pane:not(.active) { display: none !important; }
                }
            </style>
        </head>
        <body>
            ${planContent}
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 100);
                };
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * حفظ خطة الوجبات
 */
function saveMealPlan() {
    const planContent = document.getElementById('meal-plan-results').innerText;
    const planTitle = document.querySelector('.meal-plan-header h3')?.innerText || 'خطة وجبات الطفل';
    
    // إنشاء عنصر a للتحميل
    const element = document.createElement('a');
    const file = new Blob([planContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${planTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // إظهار رسالة نجاح
    showSuccess('تم حفظ خطة الوجبات بنجاح!');
}

/**
 * إضافة زر الطباعة
 */
function addPrintButton() {
    // تمت إضافة زر الطباعة في displayMealPlan
}

/**
 * عرض رسالة خطأ
 */
function showError(message) {
    alert(`خطأ: ${message}`);
}

/**
 * عرض رسالة نجاح
 */
function showSuccess(message) {
    // يمكن استبدال هذا بمكون رسائل أكثر تطوراً
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // إزالة الرسالة بعد 3 ثوان
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}