// medicine-result-enhancer.js - محسن عرض نتيجة حساب الجرعة

class MedicineResultEnhancer {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        this.setupEnhancedResultDisplay();
        this.setupHighContrastMode();
        this.setupDosageCalculator();
        this.setupSafetyIndicators();
        this.setupPrintAndShare();
    }
    
    setupEnhancedResultDisplay() {
        // استبدال عرض النتيجة التقليدي بالعرض المحسن
        document.addEventListener('medicineResultReady', (e) => {
            this.displayEnhancedMedicineResult(e.detail);
        });
    }
    
    displayEnhancedMedicineResult(data) {
        const resultsDiv = document.getElementById('medicine-results');
        
        // حساب مؤشر الأمان
        const safetyPercentage = this.calculateSafetyPercentage(data);
        const safetyLevel = this.getSafetyLevel(safetyPercentage);
        
        // إنشاء واجهة النتيجة المحسنة
        resultsDiv.innerHTML = this.createEnhancedResultHTML(data, safetyPercentage, safetyLevel);
        
        // تفعيل المؤشرات التفاعلية
        this.setupInteractiveElements();
        
        // إرسال حدث نجاح العرض
        document.dispatchEvent(new CustomEvent('medicineResultDisplayed', {
            detail: data
        }));
    }
    
    createEnhancedResultHTML(data, safetyPercentage, safetyLevel) {
        return `
            <div class="medicine-result-enhanced" role="region" aria-label="نتيجة حساب جرعة الدواء">
                <!-- رأس النتيجة -->
                <div class="result-header-enhanced">
                    <h4><i class="fas fa-pills"></i> نتيجة حساب الجرعة</h4>
                    <span class="medicine-name-enhanced">${this.getMedicineName(data.medicine)}</span>
                </div>
                
                <!-- بطاقة الجرعة الرئيسية -->
                <div class="dosage-card">
                    <div class="dosage-title">الجرعة الموصى بها</div>
                    <div class="dosage-amount">
                        <span class="dosage-unit">مجم</span>
                        ${data.doseMg.toFixed(1)}
                    </div>
                    <div class="dosage-equivalent">
                        ما يعادل <strong>${data.doseMl.toFixed(1)} مل</strong>
                    </div>
                </div>
                
                <!-- تفاصيل الجرعة -->
                <div class="result-details-enhanced">
                    <div class="detail-row-enhanced">
                        <div class="detail-label-enhanced">
                            <i class="fas fa-syringe"></i> نوع الدواء
                        </div>
                        <div class="detail-value-enhanced">${this.getMedicineName(data.medicine)}</div>
                    </div>
                    
                    <div class="detail-row-enhanced highlight">
                        <div class="detail-label-enhanced">
                            <i class="fas fa-weight"></i> الجرعة حسب الوزن
                        </div>
                        <div class="detail-value-enhanced">
                            <span class="dosage">${data.doseMg.toFixed(1)} مجم</span>
                            (${data.doseMl.toFixed(1)} مل)
                        </div>
                    </div>
                    
                    <div class="detail-row-enhanced">
                        <div class="detail-label-enhanced">
                            <i class="fas fa-clock"></i> عدد الجرعات
                        </div>
                        <div class="detail-value-enhanced">${data.frequency}</div>
                    </div>
                    
                    <div class="detail-row-enhanced">
                        <div class="detail-label-enhanced">
                            <i class="fas fa-chart-line"></i> أقصى جرعة يومية
                        </div>
                        <div class="detail-value-enhanced">${data.maxDaily.toFixed(1)} مجم</div>
                    </div>
                    
                    <div class="detail-row-enhanced">
                        <div class="detail-label-enhanced">
                            <i class="fas fa-baby"></i> وزن الطفل
                        </div>
                        <div class="detail-value-enhanced">${data.weight} كجم</div>
                    </div>
                </div>
                
                <!-- مؤشر الجرعة الآمنة -->
                <div class="safety-indicator">
                    <div class="safety-title">
                        <i class="fas fa-shield-alt"></i> مؤشر أمان الجرعة
                    </div>
                    <div class="safety-meter">
                        <div class="safety-fill" style="width: ${safetyPercentage}%"></div>
                    </div>
                    <div class="safety-labels">
                        <span>منخفضة</span>
                        <span>${safetyLevel}</span>
                        <span>عالية</span>
                    </div>
                </div>
                
                <!-- تحذيرات حسب العمر -->
                ${this.createAgeWarningsHTML(data.age, data.medicine)}
                
                <!-- مخطط الجرعات -->
                ${this.createDosageScheduleHTML(data)}
                
                <!-- تحذيرات هامة -->
                ${this.createCriticalWarningsHTML()}
                
                <!-- الإرشادات -->
                <div class="instructions-enhanced">
                    <div class="instructions-title">
                        <i class="fas fa-info-circle"></i> إرشادات هامة
                    </div>
                    <ul class="instructions-list">
                        <li>استخدمي الحقنة المناسبة لقياس الجرعة بدقة</li>
                        <li>تأكدي من تاريخ صلاحية الدواء قبل الاستخدام</li>
                        <li>لا تخلطي الدواء مع مشروبات أو أطعمة ساخنة</li>
                        <li>اتبعي التعليمات المكتوبة على عبوة الدواء</li>
                        <li>استشيري الصيدلي في حالة عدم التأكد من الجرعة</li>
                    </ul>
                </div>
                
                <!-- شريط الإجراءات -->
                <div class="result-actions-enhanced">
                    <button class="action-btn print" onclick="printMedicineResult()">
                        <i class="fas fa-print"></i> طباعة النتيجة
                    </button>
                    <button class="action-btn save" onclick="saveMedicineResult()">
                        <i class="fas fa-save"></i> حفظ الجرعة
                    </button>
                    <button class="action-btn share" onclick="shareMedicineResult()">
                        <i class="fas fa-share-alt"></i> مشاركة النتيجة
                    </button>
                </div>
            </div>
        `;
    }
    
    createAgeWarningsHTML(age, medicine) {
        let warnings = '';
        
        if (age === '0-3' && medicine !== 'paracetamol') {
            warnings = `
                <div class="warning-note-enhanced">
                    <div class="warning-content">
                        <div class="warning-title">
                            <i class="fas fa-exclamation-triangle"></i> تحذير هام
                        </div>
                        <div class="warning-text">
                            <strong>تنبيه:</strong> لا تعطي إيبوبروفين للأطفال أقل من 3 أشهر 
                            إلا تحت إشراف الطبيب مباشرة. استشيري طبيب الأطفال قبل إعطاء أي دواء.
                        </div>
                    </div>
                </div>
            `;
        }
        
        if (age === '0-3' && medicine === 'antibiotic') {
            warnings += `
                <div class="danger-note">
                    <div class="danger-title">
                        <i class="fas fa-skull-crossbones"></i> تحذير شديد
                    </div>
                    <div class="warning-text">
                        <strong>تحذير:</strong> المضادات الحيوية تحتاج وصفة طبية دقيقة من الطبيب. 
                        لا تعطي أي مضاد حيوي للطفل دون استشارة الطبيب وفحص الطفل.
                    </div>
                </div>
            `;
        }
        
        if (age === '3-6' && medicine === 'ibuprofen') {
            warnings += `
                <div class="warning-note-enhanced">
                    <div class="warning-content">
                        <div class="warning-title">
                            <i class="fas fa-exclamation-circle"></i> ملاحظة هامة
                        </div>
                        <div class="warning-text">
                            بالنسبة للأطفال بين 3-6 أشهر، يجب استخدام إيبوبروفين بحذر 
                            وتحت إشراف الطبيب خاصة إذا كان الطفل يعاني من مشاكل في الكلى.
                        </div>
                    </div>
                </div>
            `;
        }
        
        return warnings;
    }
    
    createDosageScheduleHTML(data) {
        const schedule = this.generateDosageSchedule(data);
        
        return `
            <div class="dosage-chart">
                <div class="chart-header">
                    <i class="fas fa-calendar-alt"></i> جدول الجرعات المقترح
                </div>
                <div class="chart-grid">
                    ${schedule.map(item => `
                        <div class="chart-item">
                            <div class="chart-time">${item.time}</div>
                            <div class="chart-dose">${item.dose}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    createCriticalWarningsHTML() {
        return `
            <div class="critical-warnings">
                <div class="critical-title">
                    <i class="fas fa-ban"></i> تحذيرات حرجة
                </div>
                <ul class="critical-list">
                    <li>لا تزيدي الجرعة الموصى بها تحت أي ظرف</li>
                    <li>توقفي عن إعطاء الدواء فوراً إذا ظهرت أي أعراض جانبية</li>
                    <li>اذهبي إلى الطوارئ إذا ظهر طفح جلدي أو صعوبة في التنفس</li>
                    <li>احفظي الدواء بعيداً عن متناول الأطفال</li>
                    <li>استشيري الطبيب إذا لم تتحسن حالة الطفل خلال 48 ساعة</li>
                </ul>
            </div>
        `;
    }
    
    calculateSafetyPercentage(data) {
        // حساب نسبة الأمان بناءً على الجرعة والعمر والوزن
        let safety = 100;
        
        if (data.age === '0-3') safety -= 20;
        if (data.age === '3-6') safety -= 10;
        if (data.medicine === 'ibuprofen') safety -= 15;
        if (data.medicine === 'antibiotic') safety -= 25;
        
        const dosePerKg = data.doseMg / data.weight;
        if (dosePerKg > 15) safety -= 20;
        else if (dosePerKg > 12) safety -= 10;
        
        return Math.max(30, Math.min(100, safety));
    }
    
    getSafetyLevel(percentage) {
        if (percentage >= 80) return 'آمنة جداً';
        if (percentage >= 60) return 'آمنة';
        if (percentage >= 40) return 'متوسطة';
        return 'تحتاج حذر';
    }
    
    getMedicineName(medicine) {
        const names = {
            'paracetamol': 'باراسيتامول (خافض حرارة/مسكن)',
            'ibuprofen': 'إيبوبروفين (خافض حرارة/مسكن/مضاد التهاب)',
            'antihistamine': 'مضاد الهيستامين (للحساسية)',
            'cough': 'دواء الكحة',
            'antibiotic': 'مضاد حيوي'
        };
        
        return names[medicine] || medicine;
    }
    
    generateDosageSchedule(data) {
        const schedule = [];
        let time = 8; // 8 صباحاً
        
        if (data.frequency.includes('4-6')) {
            // كل 4-6 ساعات
            for (let i = 0; i < 4; i++) {
                schedule.push({
                    time: this.formatTime(time),
                    dose: `${data.doseMl.toFixed(1)} مل`
                });
                time += 6;
                if (time >= 24) time -= 24;
            }
        } else if (data.frequency.includes('6-8')) {
            // كل 6-8 ساعات
            for (let i = 0; i < 3; i++) {
                schedule.push({
                    time: this.formatTime(time),
                    dose: `${data.doseMl.toFixed(1)} مل`
                });
                time += 8;
                if (time >= 24) time -= 24;
            }
        }
        
        return schedule;
    }
    
    formatTime(hour) {
        const ampm = hour >= 12 ? 'مساءً' : 'صباحاً';
        const displayHour = hour > 12 ? hour - 12 : hour;
        return `${displayHour}:00 ${ampm}`;
    }
    
    setupHighContrastMode() {
        // تفعيل وضع التباين العالي للنتيجة
        const contrastBtn = document.createElement('button');
        contrastBtn.className = 'medicine-contrast-toggle';
        contrastBtn.innerHTML = '<i class="fas fa-adjust"></i> تباين عالي';
        contrastBtn.title = 'تبديل وضع التباين العالي لعرض الجرعة';
        
        contrastBtn.addEventListener('click', () => {
            const result = document.querySelector('.medicine-result-enhanced');
            if (result) {
                result.classList.toggle('high-contrast');
                contrastBtn.classList.toggle('active');
                
                const icon = contrastBtn.querySelector('i');
                if (result.classList.contains('high-contrast')) {
                    icon.className = 'fas fa-sun';
                    contrastBtn.innerHTML = '<i class="fas fa-sun"></i> وضع عادي';
                } else {
                    icon.className = 'fas fa-adjust';
                    contrastBtn.innerHTML = '<i class="fas fa-adjust"></i> تباين عالي';
                }
            }
        });
        
        // إضافة زر التحكم
        document.addEventListener('medicineResultDisplayed', () => {
            const actions = document.querySelector('.result-actions-enhanced');
            if (actions && !document.querySelector('.medicine-contrast-toggle')) {
                actions.insertBefore(contrastBtn, actions.firstChild);
            }
        });
    }
    
    setupInteractiveElements() {
        // إضافة تفاعلية للعناصر
        const rows = document.querySelectorAll('.detail-row-enhanced');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                row.classList.toggle('expanded');
            });
        });
    }
}

// تعديل دالة calculateMedicineDose الأصلية
function calculateMedicineDose() {
    const medicine = document.getElementById('medicine-name').value;
    const concentration = parseInt(document.getElementById('medicine-concentration').value);
    const weight = parseFloat(document.getElementById('baby-weight-medicine').value) || 0;
    const age = document.getElementById('baby-age-medicine').value;
    
    if (!weight || weight <= 0) {
        document.getElementById('medicine-results').innerHTML = `
            <div class="medicine-result-enhanced error">
                <div class="result-header-enhanced">
                    <h4><i class="fas fa-exclamation-triangle"></i> خطأ في الإدخال</h4>
                </div>
                <div class="result-details-enhanced">
                    <div class="detail-row-enhanced">
                        <div class="detail-label-enhanced">
                            <i class="fas fa-exclamation-circle"></i> ملاحظة
                        </div>
                        <div class="detail-value-enhanced warning">
                            الرجاء إدخال وزن الطفل أولاً
                        </div>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    let doseMg = 0;
    let doseMl = 0;
    let frequency = '';
    let maxDaily = 0;
    
    // حساب الجرعة حسب نوع الدواء
    if (medicine === 'paracetamol') {
        doseMg = weight * 15;
        doseMl = (doseMg / concentration) * 5;
        frequency = 'كل 4-6 ساعات (حسب الحاجة)';
        maxDaily = weight * 60;
    } else if (medicine === 'ibuprofen') {
        doseMg = weight * 10;
        doseMl = (doseMg / concentration) * 5;
        frequency = 'كل 6-8 ساعات';
        maxDaily = weight * 40;
    } else {
        doseMg = weight * 5;
        doseMl = (doseMg / concentration) * 5;
        frequency = 'حسب إرشادات الطبيب';
        maxDaily = doseMg * 4;
    }
    
    // تجميع البيانات
    const resultData = {
        medicine,
        concentration,
        weight,
        age,
        doseMg,
        doseMl,
        frequency,
        maxDaily
    };
    
    // إرسال حدث لعرض النتيجة المحسنة
    document.dispatchEvent(new CustomEvent('medicineResultReady', {
        detail: resultData
    }));
}

// تهيئة المحسن عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const enhancer = new MedicineResultEnhancer();
    
    // تعديل الحدث الأصلي
    const calculateBtn = document.getElementById('calculate-medicine');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateMedicineDose);
    }
});

// وظائف مساعدة للطباعة والمشاركة
function printMedicineResult() {
    const printContent = document.querySelector('.medicine-result-enhanced').outerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <title>نتيجة حساب جرعة الدواء</title>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: 'Cairo', sans-serif; 
                    padding: 20px;
                    background: white;
                }
                .medicine-result-enhanced { 
                    border: 2px solid black;
                    border-radius: 10px;
                    padding: 15px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .result-header-enhanced { 
                    text-align: center;
                    margin-bottom: 20px;
                }
                .dosage-card { 
                    border: 3px solid black;
                    padding: 15px;
                    text-align: center;
                    margin: 20px 0;
                }
                .detail-row-enhanced { 
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    padding: 10px;
                    border-bottom: 1px solid #ddd;
                }
                .warning-note-enhanced, .danger-note { 
                    border: 2px solid #000;
                    padding: 15px;
                    margin: 15px 0;
                }
                .result-actions-enhanced { display: none; }
                @media print {
                    .dosage-amount { font-size: 2rem; }
                    .warning-title { color: black; }
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function saveMedicineResult() {
    const result = {
        medicine: document.querySelector('.medicine-name-enhanced').textContent,
        dose: document.querySelector('.dosage-amount').textContent,
        date: new Date().toLocaleString('ar-SA'),
        data: {
            weight: parseFloat(document.getElementById('baby-weight-medicine').value),
            age: document.getElementById('baby-age-medicine').value
        }
    };
    
    const savedResults = JSON.parse(localStorage.getItem('medicineResults') || '[]');
    savedResults.push(result);
    localStorage.setItem('medicineResults', JSON.stringify(savedResults));
    
    alert('تم حفظ نتيجة الجرعة بنجاح!');
}

function shareMedicineResult() {
    const resultText = `جرعة الدواء الموصى بها: ${document.querySelector('.dosage-amount').textContent}\n\nوزن الطفل: ${document.getElementById('baby-weight-medicine').value} كجم\n\nهذه النتيجة لأغراض إرشادية فقط - استشيري الطبيب أو الصيدلي`;
    
    if (navigator.share) {
        navigator.share({
            title: 'نتيجة حساب جرعة الدواء',
            text: resultText,
            url: window.location.href
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(resultText)
            .then(() => alert('تم نسخ النتيجة إلى الحافظة'))
            .catch(console.error);
    }
}