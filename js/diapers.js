// تهيئة صفحة العناية بالحفاضات
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة حاسبة مقاس الحفاض
    initSizeCalculator();
    
    // تهيئة أداة اختيار نوع الحفاض
    initDiaperSelector();
    
    // تهيئة قائمة التحقق اليومي
    initChecklist();
    
    // إضافة أي تفاعلات إضافية خاصة بصفحة الحفاضات
});

// حاسبة مقاس الحفاض
function initSizeCalculator() {
    const calculateBtn = document.getElementById('calculateSize');
    const sizeResult = document.getElementById('sizeResult');
    
    if (calculateBtn && sizeResult) {
        calculateBtn.addEventListener('click', function() {
            const weightInput = document.getElementById('babyWeight');
            const ageInput = document.getElementById('babyAge');
            
            const weight = parseFloat(weightInput.value);
            const age = parseInt(ageInput.value);
            
            // التحقق من صحة المدخلات
            if (!weight || isNaN(weight) || weight < 2 || weight > 25) {
                showError(sizeResult, 'الرجاء إدخال وزن صحيح بين 2 و 25 كجم');
                return;
            }
            
            if (!age || isNaN(age) || age < 0 || age > 36) {
                showError(sizeResult, 'الرجاء إدخال عمر صحيح بين 0 و 36 شهراً');
                return;
            }
            
            // إخفاء النتيجة السابقة
            sizeResult.style.display = 'none';
            
            // إضافة تأثير التحميل
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحساب...';
            this.disabled = true;
            
            // محاكاة وقت المعالجة
            setTimeout(() => {
                let recommendedSize = '';
                let sizeDescription = '';
                let sizeClass = '';
                
                // تحديد المقاس المناسب بناءً على الوزن والعمر
                if (weight < 3) {
                    recommendedSize = 'مولود جديد';
                    sizeDescription = 'يناسب الأطفال حديثي الولادة حتى وزن 3 كجم';
                    sizeClass = 'newborn';
                } else if (weight >= 3 && weight < 5) {
                    recommendedSize = 'المقاس 1';
                    sizeDescription = 'الوزن المثالي: 3-5 كجم، العمر: 1-3 أشهر';
                    sizeClass = 'size1';
                } else if (weight >= 5 && weight < 7) {
                    recommendedSize = 'المقاس 2';
                    sizeDescription = 'الوزن المثالي: 5-7 كجم، العمر: 3-6 أشهر';
                    sizeClass = 'size2';
                } else if (weight >= 7 && weight < 10) {
                    recommendedSize = 'المقاس 3';
                    sizeDescription = 'الوزن المثالي: 7-10 كجم، العمر: 6-12 شهر';
                    sizeClass = 'size3';
                } else if (weight >= 10 && weight < 13) {
                    recommendedSize = 'المقاس 4';
                    sizeDescription = 'الوزن المثالي: 10-13 كجم، العمر: 12-24 شهر';
                    sizeClass = 'size4';
                } else {
                    recommendedSize = 'المقاس 5';
                    sizeDescription = 'الوزن المثالي: 13-18 كجم، العمر: 24-36 شهر';
                    sizeClass = 'size5';
                }
                
                // تعديل التوصية بناءً على العمر إذا كان الوزن في حدود متداخلة
                if (age >= 6 && recommendedSize === 'المقاس 1') {
                    recommendedSize = 'المقاس 2';
                    sizeDescription = 'بناءً على عمر الطفل، المقاس 2 أنسب رغم الوزن';
                    sizeClass = 'size2';
                }
                
                // عرض النتيجة
                sizeResult.innerHTML = `
                    <h4><i class="fas fa-child"></i> المقاس الموصى به</h4>
                    <div class="recommended-size ${sizeClass}">
                        <strong>${recommendedSize}</strong>
                    </div>
                    <p>${sizeDescription}</p>
                    <p><strong>وزن الطفل:</strong> ${weight} كجم</p>
                    <p><strong>عمر الطفل:</strong> ${age} شهراً</p>
                    <div class="recommendation-tips">
                        <p><i class="fas fa-lightbulb"></i> <strong>نصيحة:</strong> جربي المقاس الموصى به أولاً، ولكن ضعي في اعتبارك شكل جسم الطفل أيضاً.</p>
                    </div>
                `;
                sizeResult.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-calculator"></i> احسبي المقاس المناسب';
                this.disabled = false;
                
                // التمرير إلى النتيجة
                sizeResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 800);
        });
    }
    
    function showError(element, message) {
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

// أداة اختيار نوع الحفاض
function initDiaperSelector() {
    const recommendBtn = document.getElementById('recommendDiaper');
    const recommendationDiv = document.getElementById('diaperRecommendation');
    
    if (recommendBtn && recommendationDiv) {
        recommendBtn.addEventListener('click', function() {
            const budget = document.getElementById('budget').value;
            const time = document.getElementById('time').value;
            const environment = document.getElementById('environment').value;
            const mobility = document.getElementById('mobility').value;
            
            // التحقق من إجابة جميع الأسئلة
            if (!budget || !time || !environment || !mobility) {
                showSelectorError(recommendationDiv, 'الرجاء الإجابة على جميع الأسئلة أولاً');
                return;
            }
            
            // إخفاء النتيجة السابقة
            recommendationDiv.style.display = 'none';
            
            // إضافة تأثير التحميل
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحليل...';
            this.disabled = true;
            
            // محاكاة وقت المعالجة
            setTimeout(() => {
                let recommendedType = '';
                let recommendationText = '';
                let pros = [];
                let cons = [];
                
                // تحليل الإجابات وتقديم التوصية
                const score = {
                    cloth: 0,
                    disposable: 0,
                    hybrid: 0
                };
                
                // نظام التسجيل
                if (budget === 'high') score.cloth += 2;
                if (budget === 'medium') score.hybrid += 1;
                if (budget === 'low') score.disposable += 2;
                
                if (time === 'high') score.cloth += 2;
                if (time === 'medium') score.hybrid += 1;
                if (time === 'low') score.disposable += 2;
                
                if (environment === 'high') score.cloth += 2;
                if (environment === 'medium') score.hybrid += 1;
                if (environment === 'low') score.disposable += 1;
                
                if (mobility === 'high') score.disposable += 2;
                if (mobility === 'medium') score.hybrid += 1;
                if (mobility === 'low') score.cloth += 1;
                
                // تحديد التوصية بناءً على أعلى درجة
                let maxScore = Math.max(score.cloth, score.disposable, score.hybrid);
                
                if (maxScore === score.cloth && maxScore === score.disposable) {
                    recommendedType = 'نظام مختلط';
                    recommendationText = 'نوصي باستخدام نظام مختلط يجمع بين الحفاضات القماشية في المنزل والحفاضات ذات الاستخدام الواحد خارج المنزل';
                    pros = ['توفير مالي على المدى الطويل', 'مرونة في الاستخدام', 'تأثير بيئي أقل'];
                    cons = ['يتطلب تنظيماً أكثر', 'تكلفة أولية متوسطة'];
                } else if (maxScore === score.cloth) {
                    recommendedType = 'حفاضات القماش';
                    recommendationText = 'نوصي باستخدام حفاضات القماش لأنها تناسب أولوياتك في التوفير المالي والاهتمام بالبيئة';
                    pros = ['توفير مالي كبير على المدى الطويل', 'صديقة للبيئة', 'أفضل لصحة بشرة الطفل'];
                    cons = ['تتطلب وقتاً للغسل والتجفيف', 'غير عملية خارج المنزل'];
                } else if (maxScore === score.disposable) {
                    recommendedType = 'حفاضات الاستخدام الواحد';
                    recommendationText = 'نوصي باستخدام حفاضات الاستخدام الواحد لأنها تناسب نمط حياتك المشغول والكثير التنقل';
                    pros = ['مريحة وسهلة الاستخدام', 'مناسبة للسفر والخروج', 'تتطلب وقتاً وجهداً أقل'];
                    cons = ['تكلفة عالية على المدى الطويل', 'تأثير سلبي على البيئة'];
                } else {
                    recommendedType = 'نظام مختلط';
                    recommendationText = 'نوصي باستخدام نظام مختلط يجمع بين مزايا النوعين حسب الظروف';
                    pros = ['مرونة عالية', 'توازن بين التكلفة والراحة', 'خيار عملي لمعظم العائلات'];
                    cons = ['يتطلب تخطيطاً', 'تكلفة أولية متوسطة'];
                }
                
                // عرض التوصية
                recommendationDiv.innerHTML = `
                    <h4><i class="fas fa-award"></i> توصيتنا لكِ</h4>
                    <div class="recommended-type">
                        <strong>${recommendedType}</strong>
                    </div>
                    <p>${recommendationText}</p>
                    
                    <div class="recommendation-details">
                        <div class="details-pros">
                            <h5><i class="fas fa-check-circle"></i> المزايا</h5>
                            <ul>
                                ${pros.map(item => `<li><i class="fas fa-check"></i> ${item}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="details-cons">
                            <h5><i class="fas fa-times-circle"></i> الاعتبارات</h5>
                            <ul>
                                ${cons.map(item => `<li><i class="fas fa-times"></i> ${item}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="next-steps">
                        <h5><i class="fas fa-forward"></i> الخطوات التالية</h5>
                        <p>ابدئي بشراء كمية صغيرة من النوع الموصى به لجربته قبل الالتزام بكميات كبيرة.</p>
                    </div>
                `;
                recommendationDiv.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-magic"></i> احصلي على التوصية';
                this.disabled = false;
                
                // التمرير إلى النتيجة
                recommendationDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1000);
        });
    }
    
    function showSelectorError(element, message) {
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

// قائمة التحقق اليومي
function initChecklist() {
    const checklistItems = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const progressFill = document.getElementById('checklistProgress');
    const progressText = document.getElementById('progressText');
    const resetBtn = document.getElementById('resetChecklist');
    
    // تحميل الحالة المحفوظة
    loadChecklistState();
    
    // تحديث التقدم عند تغيير أي عنصر
    checklistItems.forEach(item => {
        item.addEventListener('change', updateChecklistProgress);
    });
    
    // زر إعادة التعيين
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            checklistItems.forEach(item => {
                item.checked = false;
                // حفظ الحالة
                localStorage.setItem(item.id, 'false');
            });
            updateChecklistProgress();
            
            // رسالة تأكيد
            showTempMessage('تم إعادة تعيين قائمة التحقق', 'success');
        });
    }
    
    function updateChecklistProgress() {
        const totalItems = checklistItems.length;
        const checkedItems = Array.from(checklistItems).filter(item => item.checked).length;
        const percentage = (checkedItems / totalItems) * 100;
        
        // تحديث شريط التقدم
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        // تحديث النص
        if (progressText) {
            progressText.textContent = `${checkedItems}/${totalItems} مكتمل`;
        }
        
        // حفظ الحالة
        checklistItems.forEach(item => {
            localStorage.setItem(item.id, item.checked.toString());
        });
        
        // رسالة تحفيزية عند إكمال جميع المهام
        if (checkedItems === totalItems) {
            showTempMessage('أحسنتِ! لقد أكملتِ جميع مهام العناية بالحفاضات اليوم', 'success');
        }
    }
    
    function loadChecklistState() {
        checklistItems.forEach(item => {
            const savedState = localStorage.getItem(item.id);
            if (savedState === 'true') {
                item.checked = true;
            }
        });
        updateChecklistProgress();
    }
    
    function showTempMessage(message, type) {
        // إنشاء عنصر الرسالة
        const messageDiv = document.createElement('div');
        messageDiv.className = `temp-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
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
    .temp-message {
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
    
    .temp-message.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .temp-message.success {
        border-right: 4px solid var(--success);
    }
    
    .temp-message.success i {
        color: var(--success);
    }
    
    .temp-message.info {
        border-right: 4px solid var(--info);
    }
    
    .temp-message.info i {
        color: var(--info);
    }
    
    .temp-message i {
        font-size: 1.5rem;
    }
    
    .temp-message span {
        color: var(--gray-800);
        font-weight: 500;
    }
    
    @media (min-width: 768px) {
        .temp-message {
            left: auto;
            right: 20px;
            max-width: 400px;
        }
    }
`;
document.head.appendChild(style);