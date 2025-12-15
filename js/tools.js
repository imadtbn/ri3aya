        // تهيئة متغيرات الصفحة
        let currentStep = 1;
        let cryAnalysisData = {};
        let growthChart = null;
        
        document.addEventListener('DOMContentLoaded', function() {
            // تفعيل تبويبات الأدوات المتقدمة
            const toolTabs = document.querySelectorAll('.tool-tab');
            const toolContents = document.querySelectorAll('.tool-content');
            
            toolTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // إزالة النشاط من جميع التبويبات
                    toolTabs.forEach(t => t.classList.remove('active'));
                    // إضافة النشاط للتبويب الحالي
                    tab.classList.add('active');
                    
                    const toolId = tab.getAttribute('data-tool');
                    
                    // إخفاء جميع المحتويات
                    toolContents.forEach(content => content.classList.remove('active'));
                    // إظهار المحتوى المطلوب
                    document.getElementById(`${toolId}-content`).classList.add('active');
                    
                    // التمرير إلى بداية المحتوى
                    document.getElementById(`${toolId}-content`).scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                });
            });
            
            // تفعيل تبويبات متابعة النمو
            const trackerTabs = document.querySelectorAll('.tracker-tab');
            const trackerPanes = document.querySelectorAll('.tracker-pane');
            
            trackerTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // إزالة النشاط من جميع التبويبات
                    trackerTabs.forEach(t => t.classList.remove('active'));
                    // إضافة النشاط للتبويب الحالي
                    tab.classList.add('active');
                    
                    const paneId = tab.getAttribute('data-tracker');
                    
                    // إخفاء جميع المحتويات
                    trackerPanes.forEach(pane => pane.classList.remove('active'));
                    // إظهار المحتوى المطلوب
                    document.getElementById(`${paneId}-pane`).classList.add('active');
                });
            });
            
            // تفعيل مفسر البكاء
            initCryDecoder();
            
            // تفعيل آلة حاسبة التطعيمات
            initVaccineCalculator();
            
            // تفعيل متابعة النمو
            initGrowthTracker();
            
            // تفعيل مولد الروتين
            initRoutineGenerator();
            
            // تفعيل حاسبة جرعات الدواء
            initMedicineCalculator();
            
            // تفعيل مخطط وجبات الطعام
            initMealPlanner();
            
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
            
            // تفعيل الأزرار السريعة
            const quickToolButtons = document.querySelectorAll('.btn-tool-quick');
            
            quickToolButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const toolId = this.getAttribute('data-tool');
                    
                    // البحث عن التبويب المناسب وتفعيله
                    const targetTab = document.querySelector(`.tool-tab[data-tool="${toolId}"]`);
                    if (targetTab) {
                        targetTab.click();
                    }
                });
            });
            
            // تعيين تاريخ افتراضي لحقول التاريخ
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('measurement-date').value = formattedDate;
            
            // تعيين تاريخ ميلاد افتراضي للطفل (3 أشهر مضت)
            const birthDate = new Date();
            birthDate.setMonth(birthDate.getMonth() - 3);
            document.getElementById('baby-birthdate-vaccine').valueAsDate = birthDate;
        });
        
        // تهيئة مفسر البكاء
        function initCryDecoder() {
            const nextStepBtn = document.getElementById('next-step');
            const prevStepBtn = document.getElementById('prev-step');
            const restartBtn = document.getElementById('restart-decoder');
            const saveBtn = document.getElementById('save-analysis');
            
            // تفعيل الخطوة الأولى
            updateDecoderSteps();
            
            // تفعيل زر التالي
            nextStepBtn.addEventListener('click', function() {
                if (currentStep < 4) {
                    currentStep++;
                    updateDecoderSteps();
                } else if (currentStep === 4) {
                    // عند الوصول للخطوة الرابعة، عرض النتائج
                    analyzeCry();
                    currentStep = 5; // الانتقال لصفحة النتائج
                    updateDecoderSteps();
                }
            });
            
            // تفعيل زر السابق
            prevStepBtn.addEventListener('click', function() {
                if (currentStep > 1) {
                    currentStep--;
                    updateDecoderSteps();
                }
            });
            
            // تفعيل زر إعادة البدء
            restartBtn.addEventListener('click', function() {
                currentStep = 1;
                cryAnalysisData = {};
                updateDecoderSteps();
            });
            
            // تفعيل زر حفظ النتائج
            saveBtn.addEventListener('click', function() {
                saveCryAnalysis();
            });
            
            // تفعيل خيارات العمر
            document.querySelectorAll('.age-option').forEach(option => {
                option.addEventListener('click', function() {
                    cryAnalysisData.age = this.getAttribute('data-age');
                    document.querySelectorAll('.age-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
            
            // تفعيل خيارات التوقيت
            document.querySelectorAll('.timing-option').forEach(option => {
                option.addEventListener('click', function() {
                    cryAnalysisData.timing = this.getAttribute('data-timing');
                    document.querySelectorAll('.timing-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
            
            // تفعيل خيارات البكاء
            document.querySelectorAll('.cry-option').forEach(option => {
                option.addEventListener('click', function() {
                    cryAnalysisData.cryType = this.getAttribute('data-cry');
                    document.querySelectorAll('.cry-option').forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
            
            // تفعيل خيارات الأعراض
            document.querySelectorAll('.symptom-option input').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    if (!cryAnalysisData.symptoms) {
                        cryAnalysisData.symptoms = [];
                    }
                    
                    const symptom = this.getAttribute('data-symptom');
                    if (this.checked) {
                        if (!cryAnalysisData.symptoms.includes(symptom)) {
                            cryAnalysisData.symptoms.push(symptom);
                        }
                    } else {
                        const index = cryAnalysisData.symptoms.indexOf(symptom);
                        if (index > -1) {
                            cryAnalysisData.symptoms.splice(index, 1);
                        }
                    }
                });
            });
        }
        
        // تحديث خطوات مفسر البكاء
        function updateDecoderSteps() {
            const steps = document.querySelectorAll('.step');
            const stepContents = document.querySelectorAll('.step-content');
            const nextStepBtn = document.getElementById('next-step');
            const prevStepBtn = document.getElementById('prev-step');
            
            // تحديث الخطوات النشطة
            steps.forEach(step => {
                const stepNum = parseInt(step.getAttribute('data-step'));
                if (stepNum === currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
            
            // تحديث محتوى الخطوات
            stepContents.forEach(content => {
                const contentId = content.id;
                if (contentId === `step-${currentStep}-content` || (currentStep === 5 && contentId === 'step-results-content')) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            
            // تحديث حالة الأزرار
            prevStepBtn.disabled = currentStep === 1;
            
            if (currentStep < 4) {
                nextStepBtn.textContent = 'التالي';
                nextStepBtn.innerHTML = '<i class="fas fa-arrow-left"></i> التالي';
            } else if (currentStep === 4) {
                nextStepBtn.textContent = 'عرض النتائج';
                nextStepBtn.innerHTML = '<i class="fas fa-stethoscope"></i> عرض النتائج';
            } else {
                nextStepBtn.style.display = 'none';
                prevStepBtn.style.display = 'none';
            }
            
            // التحقق من اكتمال البيانات قبل الانتقال
            if (currentStep === 1 && !cryAnalysisData.age) {
                nextStepBtn.disabled = true;
            } else if (currentStep === 2 && !cryAnalysisData.timing) {
                nextStepBtn.disabled = true;
            } else if (currentStep === 3 && !cryAnalysisData.cryType) {
                nextStepBtn.disabled = true;
            } else {
                nextStepBtn.disabled = false;
            }
        }
        
        // تحليل البكاء
        function analyzeCry() {
            const resultsDiv = document.getElementById('cry-analysis-results');
            let analysis = '';
            
            // تحليل حسب العمر
            if (cryAnalysisData.age === '0-3') {
                analysis += '<div class="analysis-section"><h5>بكاء حديثي الولادة (0-3 أشهر):</h5><p>في هذا العمر، البكاء غالباً يكون بسبب: الجوع، التعب، المغص، الحاجة للتجشؤ، أو الحفاض المتسخ.</p></div>';
            } else if (cryAnalysisData.age === '4-6') {
                analysis += '<div class="analysis-section"><h5>بكاء الرضع (4-6 أشهر):</h5><p>بالإضافة للأسباب السابقة، قد يكون البكاء بسبب: التسنين، الملل، الرغبة في اللعب، أو تغيير الروتين.</p></div>';
            } else {
                analysis += '<div class="analysis-section"><h5>بكاء الرضع الأكبر سناً:</h5><p>قد يكون البكاء بسبب: الخوف، القلق من الغرباء، الإحباط من عدم القدرة على فعل شيء، أو المرض.</p></div>';
            }
            
            // تحليل حسب التوقيت
            if (cryAnalysisData.timing === 'evening') {
                analysis += '<div class="analysis-section"><h5>بكاء المساء:</h5><p>شائع جداً عند الرضع. غالباً يكون بسبب: التعب المتراكم خلال اليوم، المغص المسائي، أو الحاجة للراحة قبل النوم.</p></div>';
            } else if (cryAnalysisData.timing === 'after-feeding') {
                analysis += '<div class="analysis-section"><h5>بكاء بعد الرضاعة:</h5><p>قد يكون بسبب: المغص، الغازات، الارتجاع المعدي، أو الحاجة للتجشؤ.</p></div>';
            }
            
            // تحليل حسب نوع البكاء
            if (cryAnalysisData.cryType === 'weak') {
                analysis += '<div class="analysis-section"><h5>بكاء ضعيف ومتقطع:</h5><p>قد يشير إلى: التعب، المرض، أو ضعف التغذية. راقبي علامات أخرى للجفاف أو المرض.</p></div>';
            } else if (cryAnalysisData.cryType === 'high-pitched') {
                analysis += '<div class="analysis-section"><h5>بكاء عالي النبرة:</h5><p>قد يشير إلى: الألم الشديد، المغص الحاد، أو حالة طبية تحتاج استشارة طبية.</p></div>';
            }
            
            // تحليل حسب الأعراض
            if (cryAnalysisData.symptoms && cryAnalysisData.symptoms.length > 0) {
                analysis += '<div class="analysis-section"><h5>الأعراض المصاحبة:</h5><ul>';
                
                cryAnalysisData.symptoms.forEach(symptom => {
                    if (symptom === 'fever') {
                        analysis += '<li><strong>ارتفاع الحرارة:</strong> قد يشير إلى عدوى أو مرض. استشيري الطبيب إذا كانت الحرارة فوق 38°م للرضع أقل من 3 أشهر.</li>';
                    } else if (symptom === 'vomiting') {
                        analysis += '<li><strong>التقيؤ:</strong> قد يكون علامة على عدوى أو ارتجاع. راقبي علامات الجفاف.</li>';
                    } else if (symptom === 'diarrhea') {
                        analysis += '<li><strong>الإسهال:</strong> قد يكون بسبب عدوى أو حساسية غذائية. قدمي سوائل كافية.</li>';
                    }
                });
                
                analysis += '</ul></div>';
            }
            
            // إضافة اقتراحات الحلول
            analysis += '<div class="analysis-section solutions"><h5><i class="fas fa-lightbulb"></i> اقتراحات للحلول:</h5><ol>';
            analysis += '<li>تأكدي من أن الطفل ليس جائعاً أو بحاجة لتغيير الحفاض</li>';
            analysis += '<li>حاولي تهدئة الطفل بالهز الخفيف أو الغناء</li>';
            analysis += '<li>افحصي درجة حرارة الطفل واستخدمي كمادات فاترة إذا كانت مرتفعة</li>';
            analysis += '<li>قدمي للطفل لهاية إذا كان عمره مناسباً</li>';
            analysis += '<li>جربي تغيير الوضعية أو المشي بالطفل</li>';
            analysis += '</ol></div>';
            
            // إضافة متى تزورين الطبيب
            analysis += '<div class="analysis-section warning"><h5><i class="fas fa-exclamation-triangle"></i> متى تزورين الطبيب:</h5><ul>';
            analysis += '<li>إذا استمر البكاء لأكثر من 3 ساعات متواصلة</li>';
            analysis += '<li>إذا رفض الطفل الرضاعة لأكثر من 6 ساعات</li>';
            analysis += '<li>إذا كان عمر الطفل أقل من 3 أشهر ودرجة حرارته 38°م أو أكثر</li>';
            analysis += '<li>إذا لاحظت أي علامات للجفاف (قلة التبول، جفاف الفم، عدم وجود دموع)</li>';
            analysis += '<li>إذا كان البكاء مصحوباً بطفح جلدي أو صعوبة في التنفس</li>';
            analysis += '</ul></div>';
            
            resultsDiv.innerHTML = analysis;
        }
        
        // حفظ تحليل البكاء
        function saveCryAnalysis() {
            const savedAnalyses = JSON.parse(localStorage.getItem('cryAnalyses')) || [];
            
            const analysisToSave = {
                ...cryAnalysisData,
                date: new Date().toISOString().split('T')[0],
                time: new Date().toLocaleTimeString('ar-SA')
            };
            
            savedAnalyses.push(analysisToSave);
            localStorage.setItem('cryAnalyses', JSON.stringify(savedAnalyses));
            
            alert('تم حفظ تحليل البكاء بنجاح! يمكنك العودة إليه في أي وقت.');
        }
        
        // تهيئة آلة حاسبة التطعيمات
        function initVaccineCalculator() {
            const calculateBtn = document.getElementById('calculate-vaccine');
            
            calculateBtn.addEventListener('click', function() {
                calculateVaccineSchedule();
            });
            
            // حساب تلقائي عند تحميل الصفحة
            calculateVaccineSchedule();
        }
        
        // حساب جدول التطعيمات
        function calculateVaccineSchedule() {
            const birthdateInput = document.getElementById('baby-birthdate-vaccine');
            const babyName = document.getElementById('baby-name-vaccine').value || 'طفلك';
            const gender = document.getElementById('baby-gender-vaccine').value;
            const country = document.getElementById('vaccine-country').value;
            
            if (!birthdateInput.value) {
                alert('الرجاء إدخال تاريخ ميلاد الطفل');
                return;
            }
            
            const birthdate = new Date(birthdateInput.value);
            const today = new Date();
            
            // حساب العمر بالأشهر
            let months = (today.getFullYear() - birthdate.getFullYear()) * 12;
            months -= birthdate.getMonth();
            months += today.getMonth();
            
            // تحديد التطعيمات حسب العمر
            const vaccineSchedule = getVaccineSchedule(months, country);
            
            // عرض النتائج
            const resultsDiv = document.getElementById('vaccine-results');
            resultsDiv.innerHTML = `
                <div class="vaccine-schedule">
                    <div class="schedule-header">
                        <h4><i class="fas fa-calendar-check"></i> جدول التطعيمات ل${babyName}</h4>
                        <span class="baby-age">العمر: ${months} شهراً</span>
                    </div>
                    
                    <div class="schedule-table">
                        <div class="schedule-row header">
                            <div class="schedule-cell">العمر</div>
                            <div class="schedule-cell">التطعيم</div>
                            <div class="schedule-cell">الحالة</div>
                        </div>
                        
                        ${vaccineSchedule.map(vaccine => `
                            <div class="schedule-row">
                                <div class="schedule-cell age">${vaccine.age}</div>
                                <div class="schedule-cell vaccine">${vaccine.name}</div>
                                <div class="schedule-cell status ${vaccine.status}">
                                    <span>${vaccine.status === 'completed' ? 'مكتمل' : vaccine.status === 'upcoming' ? 'قادم' : 'متأخر'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="schedule-actions">
                        <button class="btn btn-secondary" onclick="printVaccineSchedule()">
                            <i class="fas fa-print"></i> طباعة الجدول
                        </button>
                        <button class="btn btn-secondary" onclick="saveVaccineSchedule()">
                            <i class="fas fa-bell"></i> تفعيل التذكيرات
                        </button>
                    </div>
                </div>
            `;
        }
        
        // الحصول على جدول التطعيمات
        function getVaccineSchedule(ageMonths, country) {
            const schedules = {
                'birth': { age: 'عند الولادة', name: 'السل (BCG) + التهاب الكبد ب (الجرعة الأولى)', status: 'completed' },
                '2months': { age: 'شهران', name: 'الخماسي (الجرعة الأولى) + شلل الأطفال الفموي + الروتا', status: ageMonths >= 2 ? 'completed' : 'upcoming' },
                '4months': { age: '4 أشهر', name: 'الخماسي (الجرعة الثانية) + شلل الأطفال الفموي + الروتا', status: ageMonths >= 4 ? 'completed' : 'upcoming' },
                '6months': { age: '6 أشهر', name: 'الخماسي (الجرعة الثالثة) + شلل الأطفال الفموي + التهاب الكبد ب', status: ageMonths >= 6 ? 'completed' : 'upcoming' },
                '9months': { age: '9 أشهر', name: 'الحصبة (الجرعة الأولى) + التهاب الكبد أ (اختياري)', status: ageMonths >= 9 ? 'completed' : 'upcoming' },
                '12months': { age: '12 شهر', name: 'الثلاثي الفيروسي (MMR) + الجديري المائي (الجرعة الأولى)', status: ageMonths >= 12 ? 'completed' : 'upcoming' },
                '18months': { age: '18 شهر', name: 'الخماسي (الجرعة الرابعة) + شلل الأطفال الفموي + التهاب الكبد أ', status: ageMonths >= 18 ? 'completed' : 'upcoming' }
            };
            
            // تعديل الحالة حسب العمر الفعلي
            Object.keys(schedules).forEach(key => {
                const schedule = schedules[key];
                const scheduleAge = parseInt(schedule.age.match(/\d+/)?.[0]) || 0;
                
                if (ageMonths > scheduleAge + 2) {
                    schedule.status = 'overdue';
                }
            });
            
            return Object.values(schedules);
        }
        
        // طباعة جدول التطعيمات
        function printVaccineSchedule() {
            const printContent = document.querySelector('.vaccine-schedule').outerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <title>جدول تطعيمات الطفل</title>
                    <style>
                        body { font-family: 'Cairo', sans-serif; padding: 20px; }
                        .vaccine-schedule { width: 100%; }
                        .schedule-header { text-align: center; margin-bottom: 20px; }
                        .schedule-table { width: 100%; border-collapse: collapse; }
                        .schedule-row { display: flex; }
                        .schedule-cell { flex: 1; padding: 10px; border: 1px solid #ddd; }
                        .schedule-row.header { background: #f0f0f0; font-weight: bold; }
                        .status.completed { background: #d4edda; color: #155724; }
                        .status.upcoming { background: #fff3cd; color: #856404; }
                        .status.overdue { background: #f8d7da; color: #721c24; }
                        @media print {
                            .schedule-actions { display: none; }
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
        
        // حفظ جدول التطعيمات
        function saveVaccineSchedule() {
            const birthdate = document.getElementById('baby-birthdate-vaccine').value;
            const babyName = document.getElementById('baby-name-vaccine').value || 'طفلي';
            
            const schedule = {
                babyName,
                birthdate,
                created: new Date().toISOString(),
                vaccines: getVaccineSchedule(
                    Math.floor((new Date() - new Date(birthdate)) / (1000 * 60 * 60 * 24 * 30.44)),
                    document.getElementById('vaccine-country').value
                )
            };
            
            localStorage.setItem('vaccineSchedule', JSON.stringify(schedule));
            alert('تم حفظ جدول التطعيمات وتفعيل التذكيرات بنجاح!');
        }
        
        // تهيئة متابعة النمو
        function initGrowthTracker() {
            const saveBtn = document.getElementById('save-measurement');
            const loadBtn = document.getElementById('load-sample');
            const exportBtn = document.getElementById('export-chart');
            
            // تحميل البيانات المخزنة
            loadGrowthData();
            
            // تفعيل زر حفظ القياس
            saveBtn.addEventListener('click', function() {
                saveMeasurement();
            });
            
            // تفعيل زر تحميل بيانات نموذجية
            loadBtn.addEventListener('click', function() {
                loadSampleData();
            });
            
            // تفعيل زر تصدير الرسم البياني
            exportBtn.addEventListener('click', function() {
                exportGrowthChart();
            });
            
            // تفعيل خيارات عرض الرسم البياني
            document.getElementById('show-weight').addEventListener('change', updateGrowthChart);
            document.getElementById('show-height').addEventListener('change', updateGrowthChart);
            document.getElementById('show-head').addEventListener('change', updateGrowthChart);
            
            // إنشاء الرسم البياني
            createGrowthChart();
        }
        
        // إنشاء الرسم البياني للنمو
        function createGrowthChart() {
            const ctx = document.getElementById('growth-chart').getContext('2d');
            
            // بيانات نموذجية
            const sampleData = [
                { age: 1, weight: 4.2, height: 52, head: 36 },
                { age: 2, weight: 5.5, height: 58, head: 39 },
                { age: 3, weight: 6.3, height: 61, head: 41 },
                { age: 4, weight: 7.1, height: 64, head: 42.5 },
                { age: 5, weight: 7.8, height: 66, head: 43.5 },
                { age: 6, weight: 8.4, height: 68, head: 44.5 }
            ];
            
            growthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: sampleData.map(d => `${d.age} شهر`),
                    datasets: [
                        {
                            label: 'الوزن (كجم)',
                            data: sampleData.map(d => d.weight),
                            borderColor: '#4caf50',
                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'الطول (سم)',
                            data: sampleData.map(d => d.height),
                            borderColor: '#2196f3',
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'محيط الرأس (سم)',
                            data: sampleData.map(d => d.head),
                            borderColor: '#ff9800',
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'مخطط نمو الطفل',
                            font: {
                                size: 16,
                                family: "'Cairo', sans-serif"
                            }
                        },
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    family: "'Cairo', sans-serif"
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'العمر (أشهر)',
                                font: {
                                    family: "'Cairo', sans-serif"
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'القياسات',
                                font: {
                                    family: "'Cairo', sans-serif"
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // تحديث الرسم البياني للنمو
        function updateGrowthChart() {
            if (!growthChart) return;
            
            const showWeight = document.getElementById('show-weight').checked;
            const showHeight = document.getElementById('show-height').checked;
            const showHead = document.getElementById('show-head').checked;
            
            growthChart.data.datasets[0].hidden = !showWeight;
            growthChart.data.datasets[1].hidden = !showHeight;
            growthChart.data.datasets[2].hidden = !showHead;
            
            growthChart.update();
        }
        
        // حفظ القياس
        function saveMeasurement() {
            const date = document.getElementById('measurement-date').value;
            const age = parseInt(document.getElementById('baby-age-months').value) || 0;
            const weight = parseFloat(document.getElementById('baby-weight').value) || 0;
            const height = parseInt(document.getElementById('baby-height').value) || 0;
            const head = parseFloat(document.getElementById('baby-head').value) || 0;
            const notes = document.getElementById('measurement-notes').value;
            
            if (!date || !age || !weight || !height || !head) {
                alert('الرجاء ملء جميع الحقول المطلوبة');
                return;
            }
            
            const measurement = {
                date,
                age,
                weight,
                height,
                head,
                notes,
                timestamp: new Date().toISOString()
            };
            
            // تحميل القياسات الحالية
            const measurements = JSON.parse(localStorage.getItem('growthMeasurements')) || [];
            measurements.push(measurement);
            
            // حفظ القياسات
            localStorage.setItem('growthMeasurements', JSON.stringify(measurements));
            
            // تحديث الرسم البياني
            updateChartWithMeasurements(measurements);
            
            // تحديث تحليل النمو
            updateGrowthAnalysis(measurements);
            
            // إعادة تعيين النموذج
            document.getElementById('baby-weight').value = '';
            document.getElementById('baby-height').value = '';
            document.getElementById('baby-head').value = '';
            document.getElementById('measurement-notes').value = '';
            
            alert('تم حفظ القياس بنجاح!');
        }
        
        // تحميل بيانات النمو
        function loadGrowthData() {
            const measurements = JSON.parse(localStorage.getItem('growthMeasurements')) || [];
            
            if (measurements.length > 0) {
                updateChartWithMeasurements(measurements);
                updateGrowthAnalysis(measurements);
            }
        }
        
        // تحميل بيانات نموذجية
        function loadSampleData() {
            const sampleMeasurements = [
                { date: '2024-01-15', age: 1, weight: 4.2, height: 52, head: 36, notes: 'القياس الأول' },
                { date: '2024-02-15', age: 2, weight: 5.5, height: 58, head: 39, notes: 'نمو جيد' },
                { date: '2024-03-15', age: 3, weight: 6.3, height: 61, head: 41, notes: 'مستمر في النمو' },
                { date: '2024-04-15', age: 4, weight: 7.1, height: 64, head: 42.5, notes: 'بداية الطعام الصلب' },
                { date: '2024-05-15', age: 5, weight: 7.8, height: 66, head: 43.5, notes: '' },
                { date: '2024-06-15', age: 6, weight: 8.4, height: 68, head: 44.5, notes: 'فحص الـ6 أشهر' }
            ];
            
            localStorage.setItem('growthMeasurements', JSON.stringify(sampleMeasurements));
            updateChartWithMeasurements(sampleMeasurements);
            updateGrowthAnalysis(sampleMeasurements);
            
            alert('تم تحميل بيانات نموذجية بنجاح!');
        }
        
        // تحديث الرسم البياني بالقياسات
        function updateChartWithMeasurements(measurements) {
            if (!growthChart) return;
            
            // ترتيب القياسات حسب العمر
            measurements.sort((a, b) => a.age - b.age);
            
            growthChart.data.labels = measurements.map(m => `${m.age} شهر`);
            growthChart.data.datasets[0].data = measurements.map(m => m.weight);
            growthChart.data.datasets[1].data = measurements.map(m => m.height);
            growthChart.data.datasets[2].data = measurements.map(m => m.head);
            
            growthChart.update();
        }
        
        // تحديث تحليل النمو
        function updateGrowthAnalysis(measurements) {
            if (measurements.length === 0) return;
            
            // ترتيب القياسات حسب العمر
            measurements.sort((a, b) => a.age - b.age);
            
            const latest = measurements[measurements.length - 1];
            const first = measurements[0];
            
            // حساب معدل النمو
            const weightGain = latest.weight - first.weight;
            const heightGain = latest.height - first.height;
            const headGain = latest.head - first.head;
            const months = latest.age - first.age;
            
            const weightPerMonth = months > 0 ? (weightGain / months).toFixed(2) : 0;
            const heightPerMonth = months > 0 ? (heightGain / months).toFixed(1) : 0;
            const headPerMonth = months > 0 ? (headGain / months).toFixed(1) : 0;
            
            // تقييم النمو
            let weightStatus = 'طبيعي';
            let weightClass = 'normal';
            
            if (weightPerMonth < 0.5) {
                weightStatus = 'بطيء';
                weightClass = 'warning';
            } else if (weightPerMonth > 0.9) {
                weightStatus = 'سريع';
                weightClass = 'good';
            }
            
            let heightStatus = 'طبيعي';
            let heightClass = 'normal';
            
            if (heightPerMonth < 2) {
                heightStatus = 'بطيء';
                heightClass = 'warning';
            } else if (heightPerMonth > 3) {
                heightStatus = 'سريع';
                heightClass = 'good';
            }
            
            // عرض النتائج
            const analysisDiv = document.getElementById('growth-analysis');
            analysisDiv.innerHTML = `
                <div class="analysis-summary">
                    <h4><i class="fas fa-chart-bar"></i> ملخص النمو</h4>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">عدد القياسات</div>
                            <div class="summary-value">${measurements.length}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">فترة المتابعة</div>
                            <div class="summary-value">${months} شهر</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">آخر قياس</div>
                            <div class="summary-value">${latest.date}</div>
                        </div>
                    </div>
                </div>
                
                <div class="growth-analysis">
                    <h4><i class="fas fa-stethoscope"></i> تحليل معدلات النمو</h4>
                    
                    <div class="analysis-item ${weightClass}">
                        <div class="analysis-header">
                            <h5><i class="fas fa-weight"></i> الوزن</h5>
                            <span class="analysis-status">${weightStatus}</span>
                        </div>
                        <div class="analysis-details">
                            <p>معدل الزيادة: <strong>${weightPerMonth} كجم/شهر</strong></p>
                            <p>الزيادة الإجمالية: <strong>${weightGain.toFixed(1)} كجم</strong></p>
                        </div>
                    </div>
                    
                    <div class="analysis-item ${heightClass}">
                        <div class="analysis-header">
                            <h5><i class="fas fa-ruler-vertical"></i> الطول</h5>
                            <span class="analysis-status">${heightStatus}</span>
                        </div>
                        <div class="analysis-details">
                            <p>معدل الزيادة: <strong>${heightPerMonth} سم/شهر</strong></p>
                            <p>الزيادة الإجمالية: <strong>${heightGain} سم</strong></p>
                        </div>
                    </div>
                    
                    <div class="analysis-item normal">
                        <div class="analysis-header">
                            <h5><i class="fas fa-brain"></i> محيط الرأس</h5>
                            <span class="analysis-status">طبيعي</span>
                        </div>
                        <div class="analysis-details">
                            <p>معدل الزيادة: <strong>${headPerMonth} سم/شهر</strong></p>
                            <p>الزيادة الإجمالية: <strong>${headGain.toFixed(1)} سم</strong></p>
                        </div>
                    </div>
                </div>
                
                <div class="growth-recommendations">
                    <h4><i class="fas fa-lightbulb"></i> توصيات</h4>
                    <ul>
                        <li>استمري في متابعة نمو طفلك كل شهر</li>
                        <li>احرصي على التغذية المتوازنة المناسبة لعمره</li>
                        ${weightClass === 'warning' ? '<li>راجعي طبيب الأطفال لمناقشة معدل زيادة الوزن</li>' : ''}
                        ${heightClass === 'warning' ? '<li>تأكدي من حصول الطفل على كفايته من النوم والتغذية</li>' : ''}
                        <li>سجلي موعد القياس القادم بعد شهر من آخر قياس</li>
                    </ul>
                </div>
            `;
        }
        
        // تصدير الرسم البياني للنمو
        function exportGrowthChart() {
            if (!growthChart) return;
            
            const link = document.createElement('a');
            link.download = 'مخطط-نمو-الطفل.png';
            link.href = growthChart.toBase64Image();
            link.click();
        }
        
        // تهيئة مولد الروتين
        function initRoutineGenerator() {
            const generateBtn = document.getElementById('generate-routine');
            
            generateBtn.addEventListener('click', function() {
                generateRoutine();
            });
            
            // توليد روتين تلقائي عند تحميل الصفحة
            generateRoutine();
        }
        
        // توليد الروتين اليومي
        function generateRoutine() {
            const age = document.getElementById('routine-age').value;
            const wakeup = parseFloat(document.getElementById('routine-wakeup').value);
            const naps = parseInt(document.getElementById('routine-naps').value);
            const feeding = document.getElementById('routine-feeding').value;
            
            // بناء الروتين حسب العمر
            let routine = '';
            
            if (age === '0-3') {
                routine = generateNewbornRoutine(wakeup, feeding);
            } else if (age === '4-6') {
                routine = generate46MonthsRoutine(wakeup, naps, feeding);
            } else if (age === '7-9') {
                routine = generate79MonthsRoutine(wakeup, naps, feeding);
            } else {
                routine = generateOlderBabyRoutine(wakeup, naps, feeding);
            }
            
            // عرض الروتين
            const resultsDiv = document.getElementById('routine-results');
            resultsDiv.innerHTML = routine;
        }
        
        // توليد روتين حديثي الولادة
        function generateNewbornRoutine(wakeup, feeding) {
            const wakeupTime = formatTime(wakeup);
            
            return `
                <div class="routine-schedule">
                    <div class="routine-header">
                        <h4><i class="fas fa-baby"></i> روتين حديثي الولادة (0-3 أشهر)</h4>
                        <p>يركز هذا الروتين على تلبية احتياجات الطفل الأساسية من نوم ورضاعة</p>
                    </div>
                    
                    <div class="routine-timeline">
                        <div class="timeline-item">
                            <div class="timeline-time">${wakeupTime}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-sun"></i> وقت الاستيقاظ والرضعة الصباحية</h5>
                                <p>غيري حفاض الطفل، قدمي له الرضعة الأولى في اليوم</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 1.5)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-bed"></i> قيلولة الصباح</h5>
                                <p>ضعي الطفل للنوم بعد التجشؤ. قد تكون القيلولة قصيرة (30-45 دقيقة)</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 2.5)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-utensils"></i> الرضعة والنشاط</h5>
                                <p>رضاعة ثم وقت للنشاط الخفيف مثل اللعب على البطن أو الاستماع للموسيقى</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 4)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-bed"></i> قيلولة الظهيرة</h5>
                                <p>وقت لقيلولة أطول (1-2 ساعة). حاولي أن تكون في غرفة هادئة ومظلمة</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 6)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-utensils"></i> الرضعة والنشاط المسائي</h5>
                                <p>رضاعة ثم وقت للعب والتفاعل. يمكنك الخروج لمشي قصير إذا كان الطقس مناسباً</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 8)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-bath"></i> وقت الاستحمام والتحضير للنوم</h5>
                                <p>حمام دافئ، تدليك، ارتداء ملابس النوم، رضاعة مسائية</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 9)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-moon"></i> وقت النوم الليلي</h5>
                                <p>ضعي الطفل في سريره وهو نعسان ولكن مستيقظ. توقعي استيقاظه كل 2-3 ساعات للرضاعة</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="routine-tips">
                        <h5><i class="fas fa-lightbulb"></i> نصائح للنجاح:</h5>
                        <ul>
                            <li>الرضاعة حسب الطلب وليس وفق جدول صارم</li>
                            <li>حاولي تعريض الطفل للضوء الطبيعي خلال النهار</li>
                            <li>اختاري إضاءة خافتة وأصواتاً هادئة خلال الليل</li>
                            <li>كوني مرنة - الروتين قد يتغير من يوم لآخر</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // توليد روتين 4-6 أشهر
        function generate46MonthsRoutine(wakeup, naps, feeding) {
            const wakeupTime = formatTime(wakeup);
            
            return `
                <div class="routine-schedule">
                    <div class="routine-header">
                        <h4><i class="fas fa-baby"></i> روتين الرضيع (4-6 أشهر)</h4>
                        <p>يبدأ الطفل في هذا العمر بإظهار انتظام أكثر في النوم وقد تبدأ مرحلة التسنين</p>
                    </div>
                    
                    <div class="routine-timeline">
                        <div class="timeline-item">
                            <div class="timeline-time">${wakeupTime}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-sun"></i> وقت الاستيقاظ والرضعة الصباحية</h5>
                                <p>غيري حفاض الطفل، قدمي الرضعة، وقت للنشاط الصباحي</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 2)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-bed"></i> قيلولة الصباح</h5>
                                <p>قيلولة تستمر 1-1.5 ساعة. حاولي أن تكون في نفس المكان كل يوم</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 3.5)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-utensils"></i> الرضعة والنشاط</h5>
                                <p>رضاعة ثم وقت للعب النشط (اللعب على البطن، الجلوس بمساعدة)</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 5.5)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-bed"></i> قيلولة الظهيرة</h5>
                                <p>قيلولة طويلة (1.5-2 ساعة). استغلي هذا الوقت للراحة أو إنجاز الأعمال</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 7.5)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-utensils"></i> الرضعة والنشاط المسائي</h5>
                                ${feeding === 'solid' ? '<p>وجبة طعام صلب خفيفة ثم رضاعة، وقت للعب مع العائلة</p>' : '<p>رضاعة ثم وقت للعب والتفاعل مع العائلة</p>'}
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 9)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-bath"></i> روتين ما قبل النوم</h5>
                                <p>حمام دافئ، تدليك، قصة، رضاعة مسائية، أغنية هادئة</p>
                            </div>
                        </div>
                        
                        <div class="timeline-item">
                            <div class="timeline-time">${formatTime(wakeup + 9.5)}</div>
                            <div class="timeline-content">
                                <h5><i class="fas fa-moon"></i> وقت النوم الليلي</h5>
                                <p>النوم لمدة 10-12 ساعة مع استيقاظ 1-2 مرات للرضاعة</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="routine-tips">
                        <h5><i class="fas fa-lightbulb"></i> نصائح للنجاح:</h5>
                        <ul>
                            <li>حافظي على نفس روتين ما قبل النوم كل ليلة</li>
                            <li>ابدئي بإدخال الطعام الصلب إذا كان الطفل مستعداً (بعد استشارة الطبيب)</li>
                            <li>قدمي الكثير من الفرص للعب على البطن لتقوية العضلات</li>
                            <li>كوني مستعدة للتغيرات خلال مرحلة التسنين</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // تنسيق الوقت
        function formatTime(time) {
            const hours = Math.floor(time);
            const minutes = Math.round((time - hours) * 60);
            const ampm = hours >= 12 ? 'مساءً' : 'صباحاً';
            const displayHours = hours > 12 ? hours - 12 : hours;
            
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        }
        
        // تهيئة حاسبة جرعات الدواء
        function initMedicineCalculator() {
            const calculateBtn = document.getElementById('calculate-medicine');
            
            calculateBtn.addEventListener('click', function() {
                calculateMedicineDose();
            });
            
            // حساب تلقائي عند تغيير القيم
            document.getElementById('medicine-name').addEventListener('change', calculateMedicineDose);
            document.getElementById('medicine-concentration').addEventListener('change', calculateMedicineDose);
            document.getElementById('baby-weight-medicine').addEventListener('input', calculateMedicineDose);
            document.getElementById('baby-age-medicine').addEventListener('change', calculateMedicineDose);
        }
        
        // حساب جرعة الدواء
        function calculateMedicineDose() {
            const medicine = document.getElementById('medicine-name').value;
            const concentration = parseInt(document.getElementById('medicine-concentration').value);
            const weight = parseFloat(document.getElementById('baby-weight-medicine').value) || 0;
            const age = document.getElementById('baby-age-medicine').value;
            
            if (!weight || weight <= 0) {
                document.getElementById('medicine-results').innerHTML = `
                    <div class="medicine-result warning">
                        <p><i class="fas fa-exclamation-triangle"></i> الرجاء إدخال وزن الطفل أولاً</p>
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
                // جرعة الباراسيتامول: 10-15 مجم/كجم كل 4-6 ساعات
                doseMg = weight * 15; // نستخدم الجرعة القصوى
                doseMl = (doseMg / concentration) * 5; // تحويل إلى مل
                frequency = 'كل 4-6 ساعات (حسب الحاجة)';
                maxDaily = weight * 60; // أقصى جرعة يومية: 60 مجم/كجم/يوم
            } else if (medicine === 'ibuprofen') {
                // جرعة الإيبوبروفين: 5-10 مجم/كجم كل 6-8 ساعات
                doseMg = weight * 10; // نستخدم الجرعة القصوى
                doseMl = (doseMg / concentration) * 5; // تحويل إلى مل
                frequency = 'كل 6-8 ساعات';
                maxDaily = weight * 40; // أقصى جرعة يومية: 40 مجم/كجم/يوم
            } else {
                // أدوية أخرى - جرعات عامة
                doseMg = weight * 5; // جرعة تقديرية
                doseMl = (doseMg / concentration) * 5;
                frequency = 'حسب إرشادات الطبيب';
                maxDaily = doseMg * 4;
            }
            
            // تقييد الجرعة حسب العمر
            let ageWarning = '';
            if (age === '0-3' && medicine !== 'paracetamol') {
                ageWarning = '<div class="warning-note"><i class="fas fa-exclamation-triangle"></i> <strong>تحذير:</strong> لا تعطي إيبوبروفين للأطفال أقل من 3 أشهر إلا تحت إشراف الطبيب.</div>';
            }
            
            if (age === '0-3' && medicine === 'antibiotic') {
                ageWarning = '<div class="warning-note"><i class="fas fa-exclamation-triangle"></i> <strong>تحذير:</strong> المضادات الحيوية تحتاج وصفة طبية دقيقة من الطبيب.</div>';
            }
            
            // عرض النتائج
            const resultsDiv = document.getElementById('medicine-results');
            resultsDiv.innerHTML = `
                <div class="medicine-result">
                    <div class="result-header">
                        <h4><i class="fas fa-pills"></i> نتيجة حساب الجرعة</h4>
                        <span class="medicine-name">${getMedicineName(medicine)}</span>
                    </div>
                    
                    <div class="result-details">
                        <div class="detail-row">
                            <div class="detail-label">الجرعة الموصى بها:</div>
                            <div class="detail-value">${doseMg.toFixed(1)} مجم (${doseMl.toFixed(1)} مل)</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">عدد الجرعات:</div>
                            <div class="detail-value">${frequency}</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">أقصى جرعة يومية:</div>
                            <div class="detail-value">${maxDaily.toFixed(1)} مجم</div>
                        </div>
                        
                        <div class="detail-row">
                            <div class="detail-label">وزن الطفل:</div>
                            <div class="detail-value">${weight} كجم</div>
                        </div>
                    </div>
                    
                    ${ageWarning}
                    
                    <div class="result-note">
                        <p><i class="fas fa-info-circle"></i> <strong>ملاحظة:</strong> هذه الجرعة لأغراض إرشادية فقط. استشيري الطبيب أو الصيدلي قبل إعطاء أي دواء للطفل.</p>
                    </div>
                </div>
            `;
        }
        
        // الحصول على اسم الدواء
        function getMedicineName(medicine) {
            const names = {
                'paracetamol': 'باراسيتامول',
                'ibuprofen': 'إيبوبروفين',
                'antihistamine': 'مضاد الهيستامين',
                'cough': 'دواء الكحة',
                'antibiotic': 'مضاد حيوي'
            };
            
            return names[medicine] || medicine;
        }
        
        // تهيئة مخطط وجبات الطعام
        function initMealPlanner() {
            const generateBtn = document.getElementById('generate-meal-plan');
            
            generateBtn.addEventListener('click', function() {
                generateMealPlan();
            });
            
            // توليد تلقائي عند تحميل الصفحة
            generateMealPlan();
        }
        
        // توليد خطة وجبات الطعام
        function generateMealPlan() {
            const age = document.getElementById('planner-age').value;
            const allergies = document.getElementById('planner-allergies').value;
            
            let mealPlan = '';
            
            if (age === '6-8') {
                mealPlan = generate68MonthsMealPlan(allergies);
            } else if (age === '9-11') {
                mealPlan = generate911MonthsMealPlan(allergies);
            } else {
                mealPlan = generate12PlusMonthsMealPlan(allergies);
            }
            
            // عرض خطة الوجبات
            const resultsDiv = document.getElementById('meal-plan-results');
            resultsDiv.innerHTML = mealPlan;
        }
        
        // توليد خطة وجبات 6-8 أشهر
        function generate68MonthsMealPlan(allergies) {
            return `
                <div class="meal-plan">
                    <div class="plan-header">
                        <h4><i class="fas fa-utensils"></i> خطة وجبات الأسبوع (6-8 أشهر)</h4>
                        <p>التركيز على الأطعمة المهروسة والخالية من السكر والملح</p>
                    </div>
                    
                    <div class="plan-table">
                        <div class="plan-row header">
                            <div class="plan-cell">اليوم</div>
                            <div class="plan-cell">الفطور</div>
                            <div class="plan-cell">الغداء</div>
                            <div class="plan-cell">العشاء</div>
                        </div>
                        
                        <div class="plan-row">
                            <div class="plan-cell day">السبت</div>
                            <div class="plan-cell">أرز مطحون مع حليب الثدي/الصناعي</div>
                            <div class="plan-cell">تفاح مهروس</div>
                            <div class="plan-cell">بطاطا حلوة مهروسة</div>
                        </div>
                        
                        <div class="plan-row">
                            <div class="plan-cell day">الأحد</div>
                            <div class="plan-cell">شوفان مطحون مع حليب</div>
                            <div class="plan-cell">موز مهروس</div>
                            <div class="plan-cell">جزر مهروس</div>
                        </div>
                        
                        <div class="plan-row">
                            <div class="plan-cell day">الإثنين</div>
                            <div class="plan-cell">أرز مطحون مع حليب</div>
                            <div class="plan-cell">كمثرى مهروسة</div>
                            <div class="plan-cell">قرع مهروس</div>
                        </div>
                        
                        <div class="plan-row">
                            <div class="plan-cell day">الثلاثاء</div>
                            <div class="plan-cell">شوفان مطحون مع حليب</div>
                            <div class="plan-cell">تفاح وكمثرى مهروسان</div>
                            <div class="plan-cell">بطاطا مهروسة</div>
                        </div>
                        
                        <div class="plan-row">
                            <div class="plan-cell day">الأربعاء</div>
                            <div class="plan-cell">أرز مطحون مع حليب</div>
                            <div class="plan-cell">موز وأفوكادو مهروسان</div>
                            <div class="plan-cell">بطاطا حلوة وجزر مهروسان</div>
                        </div>
                        
                        <div class="plan-row">
                            <div class="plan-cell day">الخميس</div>
                            <div class="plan-cell">شوفان مطحون مع حليب</div>
                            <div class="plan-cell">تفاح مهروس</div>
                            <div class="plan-cell">قرع مهروس</div>
                        </div>
                        
                        <div class="plan-row">
                            <div class="plan-cell day">الجمعة</div>
                            <div class="plan-cell">أرز مطحون مع حليب</div>
                            <div class="plan-cell">كمثرى مهروسة</div>
                            <div class="plan-cell">بطاطا مهروسة</div>
                        </div>
                    </div>
                    
                    <div class="plan-tips">
                        <h5><i class="fas fa-lightbulb"></i> نصائح هامة:</h5>
                        <ul>
                            <li>ابدئي بملعقة صغيرة يومياً وزدى الكمية تدريجياً</li>
                            <li>قدمي صنفاً واحداً جديداً كل 3-5 أيام لمراقبة الحساسية</li>
                            <li>استمري في الرضاعة الطبيعية أو الصناعية كالمعتاد</li>
                            <li>تجنبي العسل قبل عمر سنة</li>
                            ${allergies !== 'none' ? `<li>تجنبي ${getAllergyName(allergies)} ومشتقاته</li>` : ''}
                        </ul>
                    </div>
                </div>
            `;
        }
        
        // الحصول على اسم الحساسية
        function getAllergyName(allergy) {
            const names = {
                'dairy': 'الحليب ومنتجات الألبان',
                'eggs': 'البيض',
                'nuts': 'المكسرات',
                'wheat': 'القمح'
            };
            
            return names[allergy] || allergy;
        }
// دعم وضع التباين العالي والوضع الداكن
function initAccessibilityModes() {
    const htmlElement = document.documentElement;
    
    // التحقق من تفضيلات المستخدم
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    // إضافة وضع التباين العالي إذا طلب المستخدم
    if (prefersContrast) {
        htmlElement.classList.add('high-contrast-mode');
    }
    
    // إضافة الوضع الداكن إذا طلب المستخدم
    if (prefersDark) {
        htmlElement.classList.add('dark-mode');
    }
    
    // إضافة تحسينات القراءة
    const readingModeBtn = document.createElement('button');
    readingModeBtn.id = 'reading-mode-toggle';
    readingModeBtn.innerHTML = '<i class="fas fa-book-reader"></i> وضع القراءة';
    readingModeBtn.className = 'btn btn-secondary';
    readingModeBtn.style.position = 'fixed';
    readingModeBtn.style.bottom = '80px';
    readingModeBtn.style.left = '20px';
    readingModeBtn.style.zIndex = '1000';
    
    document.body.appendChild(readingModeBtn);
    
    readingModeBtn.addEventListener('click', function() {
        htmlElement.classList.toggle('enhanced-reading');
        this.innerHTML = htmlElement.classList.contains('enhanced-reading') 
            ? '<i class="fas fa-book"></i> الخروج من وضع القراءة' 
            : '<i class="fas fa-book-reader"></i> وضع القراءة';
    });
    
    // إضافة أزرار التحكم بالأوضاع
    const modeControls = document.createElement('div');
    modeControls.id = 'mode-controls';
    modeControls.style.position = 'fixed';
    modeControls.style.bottom = '20px';
    modeControls.style.left = '20px';
    modeControls.style.zIndex = '1000';
    modeControls.style.display = 'flex';
    modeControls.style.gap = '10px';
    
    const highContrastBtn = document.createElement('button');
    highContrastBtn.innerHTML = '<i class="fas fa-adjust"></i>';
    highContrastBtn.title = 'التباين العالي';
    highContrastBtn.className = 'btn btn-secondary';
    highContrastBtn.style.width = '50px';
    highContrastBtn.style.height = '50px';
    highContrastBtn.style.borderRadius = '50%';
    highContrastBtn.style.padding = '0';
    highContrastBtn.style.display = 'flex';
    highContrastBtn.style.alignItems = 'center';
    highContrastBtn.style.justifyContent = 'center';
    
    const darkModeBtn = document.createElement('button');
    darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    darkModeBtn.title = 'الوضع الداكن';
    darkModeBtn.className = 'btn btn-secondary';
    darkModeBtn.style.width = '50px';
    darkModeBtn.style.height = '50px';
    darkModeBtn.style.borderRadius = '50%';
    darkModeBtn.style.padding = '0';
    darkModeBtn.style.display = 'flex';
    darkModeBtn.style.alignItems = 'center';
    darkModeBtn.style.justifyContent = 'center';
    
    highContrastBtn.addEventListener('click', function() {
        htmlElement.classList.toggle('high-contrast-mode');
        htmlElement.classList.remove('dark-mode');
        highContrastBtn.innerHTML = htmlElement.classList.contains('high-contrast-mode') 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-adjust"></i>';
    });
    
    darkModeBtn.addEventListener('click', function() {
        htmlElement.classList.toggle('dark-mode');
        htmlElement.classList.remove('high-contrast-mode');
        darkModeBtn.innerHTML = htmlElement.classList.contains('dark-mode') 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    });
    
    modeControls.appendChild(highContrastBtn);
    modeControls.appendChild(darkModeBtn);
    document.body.appendChild(modeControls);
    
    // تحسين التركيز للوحة المفاتيح
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.documentElement.classList.add('focus-visible');
        }
    });
    
    document.addEventListener('click', function(e) {
        if (e.detail === 0) {
            // تم الضغط باستخدام لوحة المفاتيح
            document.documentElement.classList.add('focus-visible');
        } else {
            document.documentElement.classList.remove('focus-visible');
        }
    });
}

// تهيئة الأوضاع عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initAccessibilityModes();
    
    // تحسينات تفاعلية إضافية
    const toolCards = document.querySelectorAll('.quick-tool-card, .tip-item-tool');
    toolCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = this.classList.contains('quick-tool-card') 
                ? 'translateY(-8px)' 
                : 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // تحسينات للأزرار
    const buttons = document.querySelectorAll('.btn, .tool-tab, .age-option, .timing-option, .cry-option');
    buttons.forEach(button => {
        button.addEventListener('focus', function() {
            this.classList.add('focus-visible');
        });
        
        button.addEventListener('blur', function() {
            this.classList.remove('focus-visible');
        });
    });
});