// تهيئة صفحة صحة الجهاز الهضمي
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة أداة تشخيص الاضطرابات
    initDiagnosisTool();
    
    // تهيئة مسجل الأعراض
    initSymptomTracker();
    
    // تهيئة تفاعلية كروت الاضطرابات
    initDisorderCards();
    
    // إضافة أي تفاعلات إضافية خاصة بصفحة الجهاز الهضمي
});

// أداة تشخيص الاضطرابات
function initDiagnosisTool() {
    const diagnoseBtn = document.getElementById('diagnoseDisorder');
    const diagnosisResult = document.getElementById('diagnosisResult');
    
    if (diagnoseBtn && diagnosisResult) {
        diagnoseBtn.addEventListener('click', function() {
            const symptoms = [];
            
            // جمع الأعراض المحددة
            document.querySelectorAll('.symptoms-checklist input[type="checkbox"]:checked').forEach(checkbox => {
                symptoms.push(checkbox.value);
            });
            
            // التحقق من اختيار أعراض
            if (symptoms.length === 0) {
                showDiagnosisError(diagnosisResult, 'الرجاء اختيار عرض واحد على الأقل');
                return;
            }
            
            // إخفاء النتيجة السابقة
            diagnosisResult.style.display = 'none';
            
            // إضافة تأثير التحميل
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحليل...';
            this.disabled = true;
            
            // محاكاة وقت المعالجة
            setTimeout(() => {
                let diagnosis = '';
                let description = '';
                let recommendations = [];
                let severity = '';
                
                // تحليل الأعراض وتقديم التشخيص المحتمل
                if (symptoms.includes('بكاء') && symptoms.includes('انتفاخ')) {
                    diagnosis = 'مغص الرضع';
                    description = 'نوبات بكاء شديدة مع انتفاخ البطن وتصلبها، شائع بين عمر 2 أسابيع و4 أشهر';
                    recommendations = [
                        'حاولي وضعيات حمل مهدئة مثل وضعية النمر على الشجرة',
                        'قومي بتدليك بطن الطفل باتجاه عقارب الساعة',
                        'جربي تمارين الدراجة للساقين',
                        'احملي الطفل عمودياً بعد الرضاعة'
                    ];
                    severity = 'متوسط';
                } else if (symptoms.includes('تقيؤ') && symptoms.includes('رفض')) {
                    diagnosis = 'ارتجاع مريئي';
                    description = 'عودة محتويات المعدة إلى المريء بعد الرضاعة، قد يكون طبيعياً أو مرضياً';
                    recommendations = [
                        'أرضعي الطفل في وضع نصف جالس',
                        'احملي الطفل عمودياً 20-30 دقيقة بعد الرضاعة',
                        'قدمي وجبات صغيرة متكررة',
                        'ارفعي رأس السرير قليلاً أثناء النوم'
                    ];
                    severity = 'خفيف إلى متوسط';
                } else if (symptoms.includes('انتفاخ') && symptoms.includes('بكاء')) {
                    diagnosis = 'غازات';
                    description = 'تراكم الغازات في الأمعاء يسبب انتفاخاً وبكاءً وانزعاجاً';
                    recommendations = [
                        'قومي بتجشئة الطفل بعد كل رضعة',
                        'استخدمي زجاجات الرضاعة المضادة للمغص',
                        'مارسي تمارين الدراجة للساقين',
                        'دلكي بطن الطفل بزيت دافئ'
                    ];
                    severity = 'خفيف';
                } else if (symptoms.includes('براز') && symptoms.length === 1) {
                    diagnosis = 'اضطراب في حركة الأمعاء';
                    description = 'تغير في طبيعة البراز قد يشير إلى إمساك أو إسهال';
                    recommendations = [
                        'راقبي لون وقوام البراز',
                        'زيدي كمية السوائل إذا كان الطفل يتناول الطعام الصلب',
                        'سجلي عدد مرات التبرز',
                        'استشيري الطبيب إذا استمر التغير أكثر من يومين'
                    ];
                    severity = 'يحدد حسب نوع التغير';
                } else {
                    diagnosis = 'اضطراب هضمي عام';
                    description = 'مجموعة من الأعراض تشير إلى اضطراب في الجهاز الهضمي يحتاج مراقبة';
                    recommendations = [
                        'راقبي الأعراض وتسجيلها',
                        'تأكدي من نظافة أدوات الرضاعة',
                        'حافظي على روتين تغذية منتظم',
                        'استشيري الطبيب إذا ساءت الأعراض'
                    ];
                    severity = 'يحدد حسب تطور الأعراض';
                }
                
                // عرض النتيجة
                diagnosisResult.innerHTML = `
                    <h4><i class="fas fa-stethoscope"></i> التشخيص المحتمل</h4>
                    <div class="diagnosis-type">
                        <strong>${diagnosis}</strong>
                        <span class="severity-badge">${severity}</span>
                    </div>
                    <p>${description}</p>
                    
                    <div class="diagnosis-details">
                        <h5><i class="fas fa-list-check"></i> التوصيات</h5>
                        <ul>
                            ${recommendations.map(rec => `<li><i class="fas fa-check"></i> ${rec}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="diagnosis-warning">
                        <p><i class="fas fa-exclamation-triangle"></i> <strong>تذكير:</strong> هذا التشخيص هو تقدير استرشادي بناءً على الأعراض المختارة. استشيري الطبيب للحصول على تشخيص دقيق وعلاج مناسب.</p>
                    </div>
                `;
                diagnosisResult.style.display = 'block';
                
                // إعادة تعيين الزر
                this.innerHTML = '<i class="fas fa-stethoscope"></i> احصلي على التشخيص المحتمل';
                this.disabled = false;
                
                // التمرير إلى النتيجة
                diagnosisResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1000);
        });
    }
    
    function showDiagnosisError(element, message) {
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

// مسجل الأعراض
function initSymptomTracker() {
    const trackBtn = document.getElementById('trackSymptom');
    const symptomHistory = document.getElementById('symptomHistory');
    
    // تحميل السجلات المحفوظة
    loadSymptomHistory();
    
    if (trackBtn) {
        trackBtn.addEventListener('click', function() {
            const disorderType = document.getElementById('disorderType').value;
            const symptomSeverity = document.getElementById('symptomSeverity').value;
            const symptomDuration = document.getElementById('symptomDuration').value;
            const currentDate = new Date();
            
            // التحقق من اكتمال البيانات
            if (!disorderType || !symptomSeverity || !symptomDuration) {
                showTrackerMessage('الرجاء تعبئة جميع الحقول', 'error');
                return;
            }
            
            if (parseInt(symptomDuration) <= 0 || parseInt(symptomDuration) > 24) {
                showTrackerMessage('الرجاء إدخال مدة صحيحة بين 1 و 24 ساعة', 'error');
                return;
            }
            
            // إنشاء كائن السجل
            const record = {
                id: Date.now(),
                date: currentDate.toLocaleString('ar-SA'),
                disorder: disorderType,
                severity: symptomSeverity,
                duration: symptomDuration + ' ساعة',
                timestamp: currentDate.getTime()
            };
            
            // حفظ السجل
            saveSymptomRecord(record);
            
            // إضافة السجل إلى القائمة
            addSymptomRecordToHistory(record);
            
            // مسح الحقول
            document.getElementById('disorderType').value = '';
            document.getElementById('symptomSeverity').value = '';
            document.getElementById('symptomDuration').value = '';
            
            // عرض رسالة نجاح
            showTrackerMessage('تم تسجيل الأعراض بنجاح', 'success');
        });
    }
    
    function saveSymptomRecord(record) {
        let records = JSON.parse(localStorage.getItem('symptomRecords') || '[]');
        
        // إضافة السجل الجديد
        records.unshift(record);
        
        // الاحتفاظ فقط بآخر 10 سجلات
        if (records.length > 10) {
            records = records.slice(0, 10);
        }
        
        // حفظ في localStorage
        localStorage.setItem('symptomRecords', JSON.stringify(records));
    }
    
    function loadSymptomHistory() {
        const records = JSON.parse(localStorage.getItem('symptomRecords') || '[]');
        
        if (records.length > 0 && symptomHistory) {
            records.forEach(record => {
                addSymptomRecordToHistory(record);
            });
        } else if (symptomHistory) {
            symptomHistory.innerHTML = '<p class="empty-history">لا توجد سجلات سابقة. ابدأي بتسجيل الأعراض اليوم.</p>';
        }
    }
    
    function addSymptomRecordToHistory(record) {
        if (!symptomHistory) return;
        
        // ترجمة القيم
        const disorderNames = {
            'colic': 'مغص',
            'gas': 'غازات',
            'reflux': 'ارتجاع',
            'constipation': 'إمساك',
            'diarrhea': 'إسهال'
        };
        
        const severityNames = {
            'mild': 'خفيفة',
            'moderate': 'متوسطة',
            'severe': 'شديدة'
        };
        
        const severityColors = {
            'mild': '#4CAF50',
            'moderate': '#FF9800',
            'severe': '#F44336'
        };
        
        // إنشاء عنصر السجل
        const recordElement = document.createElement('div');
        recordElement.className = 'tracker-history-item';
        recordElement.innerHTML = `
            <div class="record-header">
                <strong>${disorderNames[record.disorder] || record.disorder}</strong>
                <span class="record-severity" style="background-color: ${severityColors[record.severity] || '#757575'}">
                    ${severityNames[record.severity] || record.severity}
                </span>
            </div>
            <div class="record-details">
                <span><i class="far fa-clock"></i> ${record.duration}</span>
                <span><i class="far fa-calendar"></i> ${record.date}</span>
            </div>
        `;
        
        // إضافة زر حذف
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-record';
        deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
        deleteBtn.title = 'حذف السجل';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteSymptomRecord(record.id, recordElement);
        });
        
        recordElement.querySelector('.record-header').appendChild(deleteBtn);
        
        // إضافة السجل إلى بداية القائمة
        if (symptomHistory.querySelector('.empty-history')) {
            symptomHistory.innerHTML = '';
        }
        
        symptomHistory.insertBefore(recordElement, symptomHistory.firstChild);
    }
    
    function deleteSymptomRecord(id, element) {
        // إزالة من localStorage
        let records = JSON.parse(localStorage.getItem('symptomRecords') || '[]');
        records = records.filter(record => record.id !== id);
        localStorage.setItem('symptomRecords', JSON.stringify(records));
        
        // إزالة من الواجهة
        element.remove();
        
        // إذا لم تعد هناك سجلات، عرض رسالة
        if (symptomHistory.children.length === 0) {
            symptomHistory.innerHTML = '<p class="empty-history">لا توجد سجلات سابقة. ابدأي بتسجيل الأعراض اليوم.</p>';
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

// تفاعلية كروت الاضطرابات
function initDisorderCards() {
    const disorderCards = document.querySelectorAll('.disorder-card');
    
    disorderCards.forEach(card => {
        card.addEventListener('click', function() {
            const disorderType = this.classList[1]; // colic, reflux, gas, etc.
            
            // العثور على قسم الاضطراب المناسب
            const targetSection = document.querySelector(`.disorder-detail .disorder-header.${disorderType}`);
            
            if (targetSection) {
                // التمرير إلى القسم المطلوب
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // إضافة تأثير مرئي مؤقت
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 300);
            }
        });
    });
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
    
    .record-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    
    .record-severity {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        color: white;
        font-size: 0.75rem;
        font-weight: 500;
    }
    
    .record-details {
        display: flex;
        justify-content: space-between;
        color: var(--gray-600);
        font-size: 0.8rem;
    }
    
    .record-details span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
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
    
    @media (min-width: 768px) {
        .tracker-message {
            left: auto;
            right: 20px;
            max-width: 400px;
        }
    }
`;
document.head.appendChild(style);

// إضافة إلى digestive.js
document.addEventListener('DOMContentLoaded', function() {
    // تفعيل التنقل بين الاضطرابات
    const disorderNavBtns = document.querySelectorAll('.disorder-nav-btn');
    const disorderCards = document.querySelectorAll('.disorders-overview.improved .disorder-card');
    
    if (disorderNavBtns.length > 0) {
        disorderNavBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // إزالة النشاط من جميع الأزرار
                disorderNavBtns.forEach(b => b.classList.remove('active'));
                // إضافة النشاط للزر المختار
                this.classList.add('active');
                
                // إخفاء جميع البطاقات
                disorderCards.forEach(card => card.classList.remove('active'));
                
                // إظهار البطاقة المحددة
                const disorderType = this.getAttribute('data-disorder');
                const targetCard = document.querySelector(`.disorder-card[data-disorder="${disorderType}"]`);
                if (targetCard) {
                    targetCard.classList.add('active');
                }
            });
        });
    }
    
    // في حالة الهواتف، إظهار جميع البطاقات وإلغاء التنقل
    function adjustForMobile() {
        if (window.innerWidth <= 768) {
            disorderCards.forEach(card => {
                card.style.display = 'flex';
            });
            if (document.querySelector('.disorders-nav')) {
                document.querySelector('.disorders-nav').style.display = 'none';
            }
        } else {
            disorderCards.forEach(card => {
                card.style.display = '';
            });
            if (document.querySelector('.disorders-nav')) {
                document.querySelector('.disorders-nav').style.display = 'flex';
            }
        }
    }
    
    // استدعاء الدالة عند التحميل وعند تغيير حجم النافذة
    adjustForMobile();
    window.addEventListener('resize', adjustForMobile);
});