// تهيئة صفحة صحة الجهاز الهضمي
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة دليل ملاحظات الجهاز الهضمي
    initDiagnosisTool();
    
    // تهيئة مسجل الأعراض
    initSymptomTracker();
    
    // تهيئة تفاعلية كروت الاضطرابات
    initDisorderCards();
    
    // إضافة أي تفاعلات إضافية خاصة بصفحة الجهاز الهضمي
});

// دليل ملاحظات الجهاز الهضمي
function initDiagnosisTool() {
    const button = document.getElementById('diagnoseDisorder');
    const result = document.getElementById('diagnosisResult');
    if (!button || !result) return;
    button.addEventListener('click', () => {
        const symptoms = Array.from(document.querySelectorAll('.symptoms-checklist input:checked')).map(input => input.value);
        result.replaceChildren();
        const heading = document.createElement('h4');
        heading.textContent = symptoms.length ? 'ملخص الملاحظات' : 'اختاري ملاحظة واحدة على الأقل';
        const summary = document.createElement('p');
        summary.textContent = symptoms.length ? `الملاحظات المختارة: ${symptoms.join('، ')}. لا تحدد هذه القائمة سبب الأعراض ولا درجة خطورتها.` : 'لا يستطيع الموقع تشخيص اضطراب هضمي أو استبعاد المرض.';
        const note = document.createElement('p');
        note.textContent = 'عند صعوبة التنفس أو فقدان الوعي أو تغير اللون، اطلبي المساعدة العاجلة. عند القيء المتكرر أو رفض الرضاعة أو قلة التبول أو أعراض غير معتادة، تواصلي مع الطبيب. لا تنتظري نتيجة من الموقع.';
        result.append(heading, summary, note);
        result.style.display = 'block';
        result.setAttribute('role', 'status');
        result.setAttribute('aria-live', 'polite');
    });
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
            
            if (!Number.isFinite(Number(symptomDuration)) || Number(symptomDuration) < 1 || Number(symptomDuration) > 24) {
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
            if (!saveSymptomRecord(record)) return;
            
            // إضافة السجل إلى القائمة

            
            // مسح الحقول
            document.getElementById('disorderType').value = '';
            document.getElementById('symptomSeverity').value = '';
            document.getElementById('symptomDuration').value = '';
            
            // عرض رسالة نجاح
            showTrackerMessage('تم تسجيل الأعراض بنجاح', 'success');
        });
    }
    
    function saveSymptomRecord(record) {
        const result = window.Ri3ayaLocal.add('symptomRecords', record);
        if (!result.ok) { window.Ri3ayaLocal.notify(result.error); showTrackerMessage(result.error, 'error'); }
        return result.ok;
    }

    function loadSymptomHistory() {
        if (!symptomHistory) return;
        const result = window.Ri3ayaLocal.read('symptomRecords');
        symptomHistory.replaceChildren();
        if (!result.ok || !result.records.length) {
            const note = document.createElement('p'); note.className = 'empty-history';
            note.textContent = result.ok ? 'لا توجد ملاحظات أعراض مسجلة بعد.' : result.error;
            symptomHistory.append(note); return;
        }
        result.records.forEach(record => {
            const element = document.createElement('div'); element.className = 'tracker-history-item';
            const info = document.createElement('div'); info.className = 'record-info';
            const values = [({colic:'مغص',gas:'غازات',reflux:'ارتجاع',constipation:'إمساك',diarrhea:'إسهال'})[record.disorder], ({mild:'خفيفة',moderate:'متوسطة',severe:'شديدة'})[record.severity], record.duration, record.date];
            values.forEach((value, index) => { const node = document.createElement(index === 0 ? 'strong' : 'span'); node.textContent = value; info.append(node); });
            const button = document.createElement('button'); button.type = 'button'; button.className = 'delete-record'; button.textContent = 'حذف'; button.setAttribute('aria-label', 'حذف هذا السجل');
            button.addEventListener('click', () => {
                if (!confirm('حذف هذا السجل من المتصفح؟')) return;
                const deleted = window.Ri3ayaLocal.removeRecord('symptomRecords', record);
                window.Ri3ayaLocal.notify(deleted.ok ? 'تم حذف السجل.' : deleted.error);
                showTrackerMessage(deleted.ok ? 'تم حذف السجل.' : deleted.error, deleted.ok ? 'success' : 'error');
            });
            element.append(info, button); symptomHistory.append(element);
        });
    }
    window.addEventListener('ri3aya-data-change', event => { if (!event.detail.key || event.detail.key === 'symptomRecords') loadSymptomHistory(); });

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