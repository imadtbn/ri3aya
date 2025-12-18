/* =========================
   Ri3aya Tools Bundle v2.0
   أدوات شاملة لرعاية الرضع مع تحليلات متقدمة
   ========================= */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Ri3aya Tools v2.0 - جاري التحميل...');
    
    // تهيئة جميع الوحدات
    Tabs.init();
    Vaccine.init();
    Growth.init();
    CryAI.init();
    CryAudio.init();
    CryPattern.init();
    Routine.init();
    Medicine.init();
    Meals.init();
    Alerts.init();
    
    // تحميل البيانات المحفوظة
    loadSavedData();
});

/* =========================
   CORE - نظام التخزين والتهيئة
   ========================= */

const Storage = {
    get: (k, defaultValue = []) => {
        try {
            const data = localStorage.getItem(k);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('خطأ في قراءة التخزين:', e);
            return defaultValue;
        }
    },
    
    set: (k, v) => {
        try {
            localStorage.setItem(k, JSON.stringify(v));
            return true;
        } catch (e) {
            console.error('خطأ في حفظ التخزين:', e);
            return false;
        }
    },
    
    remove: (k) => {
        localStorage.removeItem(k);
    },
    
    clear: () => {
        localStorage.clear();
    }
};

// نظام التنقل بين الأدوات
const Tabs = {
    currentTab: 'vaccine',
    
    init() {
        console.log('جاري تهيئة نظام التبويب...');
        
        // إضافة أحداث للنقر على التبويبات
        document.querySelectorAll('.tool-tab').forEach(tab => {
            tab.onclick = () => {
                const toolName = tab.dataset.tool;
                this.switchTo(toolName);
            };
        });

        // إضافة أحداث للأزرار السريعة
        document.querySelectorAll('.btn-tool-quick').forEach(btn => {
            btn.onclick = () => {
                const toolName = btn.dataset.tool;
                this.switchTo(toolName);
            };
        });
        
        // تهيئة التبويب الأول
        this.switchTo('vaccine');
    },
    
    switchTo(toolName) {
        console.log(`التبديل إلى أداة: ${toolName}`);
        
        // إزالة النشاط من جميع التبويبات
        document.querySelectorAll('.tool-tab, .tool-content').forEach(el => {
            el.classList.remove('active');
        });
        
        // إضافة النشاط للتبويب المحدد
        const activeTab = document.querySelector(`.tool-tab[data-tool="${toolName}"]`);
        const activeContent = document.getElementById(`${toolName}-content`);
        
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        if (activeContent) {
            activeContent.classList.add('active');
        }
        
        this.currentTab = toolName;
        
        // تشغيل التهيئة المحددة للأداة إذا كانت موجودة
        if (window[toolName.charAt(0).toUpperCase() + toolName.slice(1)]?.onTabOpen) {
            window[toolName.charAt(0).toUpperCase() + toolName.slice(1)].onTabOpen();
        }
        
        // إضافة تأثير بسيط
        if (activeContent) {
            activeContent.style.opacity = '0';
            setTimeout(() => {
                activeContent.style.opacity = '1';
                activeContent.style.transition = 'opacity 0.3s ease';
            }, 50);
        }
    }
};

/* =========================
   VACCINE - نظام التطعيمات المتقدم
   ========================= */

const Vaccine = {
    countryData: {
        saudi: [
            {age: 'عند الولادة', name: 'BCG + التهاب الكبد ب', months: 0, done: false},
            {age: 'شهرين', name: 'الخماسي + شلل + روتا', months: 2, done: false},
            {age: '4 أشهر', name: 'الخماسي + شلل + روتا', months: 4, done: false},
            {age: '6 أشهر', name: 'الخماسي + شلل + التهاب الكبد ب', months: 6, done: false},
            {age: '9 أشهر', name: 'الحصبة + جدري الماء', months: 9, done: false},
            {age: '12 شهر', name: 'الثلاثي الفيروسي + التهاب الكبد أ', months: 12, done: false},
            {age: '18 شهر', name: 'الخماسي + شلل + التهاب الكبد أ', months: 18, done: false},
            {age: '24 شهر', name: 'الحصبة + النكاف + الحصبة الألمانية', months: 24, done: false}
        ],
        uae: [
            {age: 'عند الولادة', name: 'BCG + التهاب الكبد ب', months: 0, done: false},
            {age: 'شهرين', name: 'الخماسي + شلل', months: 2, done: false},
            {age: '4 أشهر', name: 'الخماسي + شلل', months: 4, done: false},
            {age: '6 أشهر', name: 'الخماسي + شلل', months: 6, done: false},
            {age: '12 شهر', name: 'الثلاثي الفيروسي', months: 12, done: false},
            {age: '18 شهر', name: 'الخماسي + شلل', months: 18, done: false}
        ],
        kuwait: [
            {age: 'عند الولادة', name: 'BCG + التهاب الكبد ب', months: 0, done: false},
            {age: 'شهرين', name: 'الخماسي + شلل', months: 2, done: false},
            {age: '4 أشهر', name: 'الخماسي + شلل', months: 4, done: false},
            {age: '6 أشهر', name: 'الخماسي + شلل', months: 6, done: false},
            {age: '12 شهر', name: 'الحصبة + النكاف + الحصبة الألمانية', months: 12, done: false}
        ]
    },
    
    init() {
        console.log('جاري تهيئة نظام التطعيمات...');
        
        const calculateBtn = document.getElementById('calculate-vaccine');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateSchedule());
        }
        
        // تعبئة تاريخ اليوم كقيمة افتراضية
        const today = new Date().toISOString().split('T')[0];
        const birthInput = document.getElementById('baby-birthdate-vaccine');
        if (birthInput) {
            birthInput.max = today;
        }
        
        this.loadSavedVaccines();
    },
    
    onTabOpen() {
        console.log('تم فتح تبويب التطعيمات');
        this.updateUpcomingVaccines();
    },
    
    calculateSchedule() {
        const birthDate = document.getElementById('baby-birthdate-vaccine')?.value;
        const country = document.getElementById('vaccine-country')?.value || 'saudi';
        
        if (!birthDate) {
            alert('الرجاء إدخال تاريخ ميلاد الطفل');
            return;
        }
        
        const birth = new Date(birthDate);
        const today = new Date();
        const months = Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 30.44));
        
        const vaccineData = this.countryData[country] || this.countryData.saudi;
        
        // تحديث حالة كل تطعيم
        const updatedData = vaccineData.map(vaccine => ({
            ...vaccine,
            done: months >= vaccine.months,
            dueDate: this.calculateDueDate(birth, vaccine.months)
        }));
        
        this.renderSchedule(updatedData, months);
        this.saveVaccines(updatedData);
        
        // إرسال تنبيه بالتطعيمات القادمة
        this.checkUpcomingVaccines(updatedData);
    },
    
    calculateDueDate(birthDate, monthsToAdd) {
        const dueDate = new Date(birthDate);
        dueDate.setMonth(dueDate.getMonth() + monthsToAdd);
        return dueDate.toLocaleDateString('ar-SA');
    },
    
    renderSchedule(data, babyMonths) {
        const resultsDiv = document.getElementById('vaccine-results');
        if (!resultsDiv) return;
        
        const scheduleHTML = data.map(vaccine => {
            const statusClass = vaccine.done ? 'done' : 'next';
            const statusIcon = vaccine.done ? '✅' : '⏳';
            const statusText = vaccine.done ? 'مكتمل' : `قادم - ${vaccine.dueDate}`;
            
            return `
                <div class="schedule-row ${statusClass}">
                    <div class="vaccine-age">${vaccine.age}</div>
                    <div class="vaccine-name">${vaccine.name}</div>
                    <div class="vaccine-status">${statusIcon} ${statusText}</div>
                </div>
            `;
        }).join('');
        
        resultsDiv.innerHTML = `
            <div class="vaccine-summary">
                <h4>ملخص التطعيمات</h4>
                <p>عمر الطفل: ${babyMonths} شهر</p>
                <p>المكتمل: ${data.filter(v => v.done).length} من ${data.length}</p>
            </div>
            <div class="vaccine-list">
                ${scheduleHTML}
            </div>
            <div class="vaccine-actions">
                <button class="btn btn-secondary" onclick="Vaccine.printSchedule()">
                    <i class="fas fa-print"></i> طباعة الجدول
                </button>
                <button class="btn btn-secondary" onclick="Vaccine.exportSchedule()">
                    <i class="fas fa-download"></i> تصدير كـ PDF
                </button>
            </div>
        `;
    },
    
    saveVaccines(data) {
        const babyName = document.getElementById('baby-name-vaccine')?.value || 'طفلي';
        const saveData = {
            babyName,
            schedule: data,
            lastUpdated: new Date().toISOString()
        };
        Storage.set('vaccine_schedule', saveData);
    },
    
    loadSavedVaccines() {
        const saved = Storage.get('vaccine_schedule');
        if (saved && saved.schedule) {
            this.renderSchedule(saved.schedule, 
                Math.floor((new Date() - new Date(saved.lastUpdated)) / (1000 * 60 * 60 * 24 * 30.44)));
        }
    },
    
    checkUpcomingVaccines(data) {
        const upcoming = data.filter(v => !v.done);
        if (upcoming.length > 0) {
            const nextVaccine = upcoming[0];
            Alerts.notify(`📅 تذكير: تطعيم ${nextVaccine.name} قادم في ${nextVaccine.age}`);
        }
    },
    
    updateUpcomingVaccines() {
        const saved = Storage.get('vaccine_schedule');
        if (saved) {
            this.checkUpcomingVaccines(saved.schedule);
        }
    },
    
    printSchedule() {
        window.print();
    },
    
    exportSchedule() {
        alert('ميزة التصدير كـ PDF قريباً...');
    }
};

/* =========================
   GROWTH - نظام متابعة النمو المتقدم
   ========================= */

const Growth = {
    growthChart: null,
    
    init() {
        console.log('جاري تهيئة نظام متابعة النمو...');
        
        document.getElementById('save-measurement')?.addEventListener('click', () => this.saveMeasurement());
        document.getElementById('load-sample')?.addEventListener('click', () => this.loadSampleData());
        document.getElementById('export-chart')?.addEventListener('click', () => this.exportChart());
        
        // إضافة أحداث للتحكم في الرسم البياني
        ['show-weight', 'show-height', 'show-head'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.updateChart());
        });
        
        this.renderMeasurements();
        this.initChart();
    },
    
    saveMeasurement() {
        const measurement = {
            date: document.getElementById('measurement-date')?.value || new Date().toISOString().split('T')[0],
            age: parseInt(document.getElementById('baby-age-months')?.value) || 0,
            weight: parseFloat(document.getElementById('baby-weight')?.value) || 0,
            height: parseFloat(document.getElementById('baby-height')?.value) || 0,
            head: parseFloat(document.getElementById('baby-head')?.value) || 0,
            notes: document.getElementById('measurement-notes')?.value || ''
        };
        
        if (measurement.age === 0 || measurement.weight === 0) {
            alert('الرجاء إدخال العمر والوزن على الأقل');
            return;
        }
        
        const measurements = Storage.get('growth_measurements');
        measurements.push(measurement);
        Storage.set('growth_measurements', measurements);
        
        this.renderMeasurements();
        this.updateChart();
        this.updateAnalysis();
        
        alert('تم حفظ القياس بنجاح!');
    },
    
    renderMeasurements() {
        const measurements = Storage.get('growth_measurements');
        if (measurements.length === 0) return;
        
        const latest = measurements[measurements.length - 1];
        
        // تحديث حقول الإدخال بالقيم الأخيرة
        document.getElementById('measurement-date').value = latest.date;
        document.getElementById('baby-age-months').value = latest.age;
        document.getElementById('baby-weight').value = latest.weight;
        document.getElementById('baby-height').value = latest.height;
        document.getElementById('baby-head').value = latest.head;
        document.getElementById('measurement-notes').value = latest.notes;
    },
    
    initChart() {
        const ctx = document.getElementById('growth-chart');
        if (!ctx) return;
        
        const measurements = Storage.get('growth_measurements');
        if (measurements.length === 0) return;
        
        const labels = measurements.map(m => `شهر ${m.age}`);
        const weights = measurements.map(m => m.weight);
        const heights = measurements.map(m => m.height);
        const heads = measurements.map(m => m.head);
        
        this.growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'الوزن (كجم)',
                        data: weights,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'الطول (سم)',
                        data: heights,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 2,
                        tension: 0.4
                    },
                    {
                        label: 'محيط الرأس (سم)',
                        data: heads,
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        borderWidth: 2,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    tooltip: {
                        rtl: true,
                        bodyFont: {
                            family: 'Cairo, sans-serif'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'العمر (أشهر)',
                            font: {
                                family: 'Cairo, sans-serif',
                                size: 14
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'القياسات',
                            font: {
                                family: 'Cairo, sans-serif',
                                size: 14
                            }
                        }
                    }
                }
            }
        });
    },
    
    updateChart() {
        if (!this.growthChart) return;
        
        const showWeight = document.getElementById('show-weight')?.checked ?? true;
        const showHeight = document.getElementById('show-height')?.checked ?? true;
        const showHead = document.getElementById('show-head')?.checked ?? true;
        
        this.growthChart.data.datasets[0].hidden = !showWeight;
        this.growthChart.data.datasets[1].hidden = !showHeight;
        this.growthChart.data.datasets[2].hidden = !showHead;
        
        this.growthChart.update();
    },
    
    updateAnalysis() {
        const measurements = Storage.get('growth_measurements');
        if (measurements.length === 0) return;
        
        const latest = measurements[measurements.length - 1];
        const analysisDiv = document.getElementById('growth-analysis');
        
        if (!analysisDiv) return;
        
        const analysis = AI.analyzeGrowth(latest);
        analysisDiv.innerHTML = analysis;
    },
    
    loadSampleData() {
        const sampleData = [
            {date: '2024-01-01', age: 0, weight: 3.5, height: 50, head: 35, notes: 'عند الولادة'},
            {date: '2024-02-01', age: 1, weight: 4.2, height: 54, head: 37, notes: 'الشهر الأول'},
            {date: '2024-03-01', age: 2, weight: 5.1, height: 58, head: 39, notes: 'الشهر الثاني'},
            {date: '2024-04-01', age: 3, weight: 5.8, height: 61, head: 41, notes: 'الشهر الثالث'},
            {date: '2024-05-01', age: 4, weight: 6.5, height: 64, head: 42, notes: 'الشهر الرابع'}
        ];
        
        Storage.set('growth_measurements', sampleData);
        this.renderMeasurements();
        this.updateChart();
        this.updateAnalysis();
        
        alert('تم تحميل بيانات نموذجية بنجاح!');
    },
    
    exportChart() {
        if (!this.growthChart) return;
        
        const link = document.createElement('a');
        link.download = 'نمو-الطفل.png';
        link.href = this.growthChart.toBase64Image();
        link.click();
    }
};

/* =========================
   CRY AI - نظام تحليل البكاء المتقدم
   ========================= */

const CryAI = {
    currentState: {
        age: null,
        timing: null,
        cryType: null,
        symptoms: [],
        intensity: 'medium',
        duration: 'short',
        pattern: 'continuous'
    },
    
    init() {
        console.log('جاري تهيئة نظام تحليل البكاء...');
        
        // تهيئة أزرار الاختيار
        document.querySelectorAll('[data-age]').forEach(btn => {
            btn.onclick = () => this.selectOption('age', btn.dataset.age);
        });
        
        document.querySelectorAll('[data-timing]').forEach(btn => {
            btn.onclick = () => this.selectOption('timing', btn.dataset.timing);
        });
        
        document.querySelectorAll('[data-cry]').forEach(btn => {
            btn.onclick = () => this.selectOption('cryType', btn.dataset.cry);
        });
        
        document.querySelectorAll('[data-symptom]').forEach(checkbox => {
            checkbox.onchange = () => this.toggleSymptom(checkbox.dataset.symptom, checkbox.checked);
        });
        
        // أزرار التنقل
        document.getElementById('next-step')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prev-step')?.addEventListener('click', () => this.prevStep());
        document.getElementById('restart-decoder')?.addEventListener('click', () => this.restartAnalysis());
        document.getElementById('save-analysis')?.addEventListener('click', () => this.saveAnalysis());
        
        this.updateStep(1);
    },
    
    selectOption(type, value) {
        this.currentState[type] = value;
        this.highlightSelection(type, value);
        
        // الانتقال التلقائي للخطوة التالية
        setTimeout(() => this.nextStep(), 500);
    },
    
    toggleSymptom(symptom, isChecked) {
        if (isChecked) {
            this.currentState.symptoms.push(symptom);
        } else {
            const index = this.currentState.symptoms.indexOf(symptom);
            if (index > -1) {
                this.currentState.symptoms.splice(index, 1);
            }
        }
    },
    
    highlightSelection(type, value) {
        // إزالة التحديد السابق
        document.querySelectorAll(`[data-${type}]`).forEach(el => {
            el.classList.remove('selected');
        });
        
        // إضافة التحديد الجديد
        document.querySelectorAll(`[data-${type}="${value}"]`).forEach(el => {
            el.classList.add('selected');
        });
    },
    
    nextStep() {
        const currentStep = this.getCurrentStep();
        if (currentStep < 5) {
            this.updateStep(currentStep + 1);
        }
        
        if (currentStep === 4) {
            this.analyze();
        }
    },
    
    prevStep() {
        const currentStep = this.getCurrentStep();
        if (currentStep > 1) {
            this.updateStep(currentStep - 1);
        }
    },
    
    getCurrentStep() {
        const activeStep = document.querySelector('.step-content.active');
        return activeStep ? parseInt(activeStep.id.split('-')[1]) : 1;
    },
    
    updateStep(stepNumber) {
        // إخفاء جميع الخطوات
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.remove('active');
        });
        
        // إظهار الخطوة الحالية
        const currentStep = document.getElementById(`step-${stepNumber}-content`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
        
        // تحديث مؤشر الخطوات
        document.querySelectorAll('.step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            if (stepNum <= stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // تحديث حالة أزرار التنقل
        this.updateNavigationButtons(stepNumber);
    },
    
    updateNavigationButtons(step) {
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        
        if (prevBtn) {
            prevBtn.disabled = step === 1;
        }
        
        if (nextBtn) {
            if (step === 4) {
                nextBtn.innerHTML = '<i class="fas fa-stethoscope"></i> تحليل البكاء';
            } else {
                nextBtn.innerHTML = '<i class="fas fa-arrow-left"></i> التالي';
            }
        }
    },
    
    analyze() {
        const results = AI.analyzeCry(this.currentState);
        const resultsDiv = document.getElementById('cry-analysis-results');
        
        if (resultsDiv) {
            resultsDiv.innerHTML = `
                <div class="analysis-card">
                    <div class="analysis-header">
                        <h4><i class="fas fa-diagnoses"></i> نتائج تحليل البكاء</h4>
                    </div>
                    <div class="analysis-body">
                        <div class="probability-chart">
                            ${this.generateProbabilityChart(results.probabilities)}
                        </div>
                        <div class="recommendations">
                            <h5><i class="fas fa-lightbulb"></i> توصيات مقترحة:</h5>
                            <ul>
                                ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="when-to-see-doctor">
                            <h5><i class="fas fa-user-md"></i> متى يجب مراجعة الطبيب:</h5>
                            <p>${results.medicalAdvice}</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.updateStep(5);
        
        // حفظ التحليل
        this.saveAnalysis();
    },
    
    generateProbabilityChart(probabilities) {
        let chartHTML = '<div class="probabilities">';
        probabilities.forEach(item => {
            const width = Math.min(item.probability * 100, 100);
            chartHTML += `
                <div class="probability-item">
                    <div class="prob-label">${item.reason}</div>
                    <div class="prob-bar">
                        <div class="prob-fill" style="width: ${width}%; background-color: ${this.getProbabilityColor(item.probability)}"></div>
                        <span class="prob-percentage">${Math.round(item.probability * 100)}%</span>
                    </div>
                </div>
            `;
        });
        chartHTML += '</div>';
        return chartHTML;
    },
    
    getProbabilityColor(probability) {
        if (probability > 0.7) return '#f44336';
        if (probability > 0.4) return '#ff9800';
        return '#4caf50';
    },
    
    restartAnalysis() {
        this.currentState = {
            age: null,
            timing: null,
            cryType: null,
            symptoms: [],
            intensity: 'medium',
            duration: 'short',
            pattern: 'continuous'
        };
        
        // إعادة تعيين جميع الاختيارات
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
        
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        this.updateStep(1);
    },
    
    saveAnalysis() {
        const analysis = {
            state: this.currentState,
            results: AI.analyzeCry(this.currentState),
            timestamp: new Date().toISOString()
        };
        
        const savedAnalyses = Storage.get('cry_analyses');
        savedAnalyses.push(analysis);
        Storage.set('cry_analyses', savedAnalyses);
        
        alert('تم حفظ التحليل بنجاح!');
    }
};

/* =========================
   ROUTINE - نظام الروتين اليومي
   ========================= */

const Routine = {
    init() {
        console.log('جاري تهيئة نظام الروتين...');
        document.getElementById('generate-routine')?.addEventListener('click', () => this.generateRoutine());
    },
    
    generateRoutine() {
        const age = document.getElementById('routine-age')?.value;
        const wakeup = document.getElementById('routine-wakeup')?.value;
        const naps = document.getElementById('routine-naps')?.value;
        const feeding = document.getElementById('routine-feeding')?.value;
        
        const activities = [];
        if (document.getElementById('activity-outdoor')?.checked) activities.push('outside');
        if (document.getElementById('activity-reading')?.checked) activities.push('reading');
        if (document.getElementById('activity-music')?.checked) activities.push('music');
        if (document.getElementById('activity-bath')?.checked) activities.push('bath');
        if (document.getElementById('activity-massage')?.checked) activities.push('massage');
        
        const routine = this.createRoutine(age, wakeup, naps, feeding, activities);
        this.displayRoutine(routine);
    },
    
    createRoutine(age, wakeup, naps, feeding, activities) {
        // قاعدة بيانات للروتين حسب العمر
        const routines = {
            '0-3': this.createNewbornRoutine(wakeup, feeding),
            '4-6': this.createInfantRoutine(wakeup, naps, feeding),
            '7-9': this.createCrawlerRoutine(wakeup, naps, feeding),
            '10-12': this.createToddlerRoutine(wakeup, naps, feeding),
            '13-18': this.createWalkerRoutine(wakeup, naps, feeding),
            '19-24': this.createPreschoolerRoutine(wakeup, naps, feeding)
        };
        
        return routines[age] || routines['0-3'];
    },
    
    createNewbornRoutine(wakeup, feeding) {
        const baseHour = parseFloat(wakeup);
        return [
            {time: this.formatTime(baseHour), activity: 'الرضاعة', icon: '🍼'},
            {time: this.formatTime(baseHour + 0.5), activity: 'التجشؤ والهدوء', icon: '🤱'},
            {time: this.formatTime(baseHour + 1), activity: 'وقت النوم', icon: '😴'},
            {time: this.formatTime(baseHour + 3), activity: 'الرضاعة', icon: '🍼'},
            {time: this.formatTime(baseHour + 3.5), activity: 'تغيير الحفاض واللعب', icon: '🧸'},
            {time: this.formatTime(baseHour + 4), activity: 'وقت النوم', icon: '😴'},
            {time: this.formatTime(baseHour + 6), activity: 'الرضاعة', icon: '🍼'},
            {time: this.formatTime(baseHour + 6.5), activity: 'التدليك والهدوء', icon: '🛁'},
            {time: this.formatTime(baseHour + 7), activity: 'وقت النوم الطويل', icon: '🌙'}
        ];
    },
    
    formatTime(hour) {
        const totalMinutes = hour * 60;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        const period = hours >= 12 ? 'مساءً' : 'صباحاً';
        const displayHour = hours > 12 ? hours - 12 : hours;
        return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
    },
    
    displayRoutine(routine) {
        const resultsDiv = document.getElementById('routine-results');
        if (!resultsDiv) return;
        
        const routineHTML = routine.map(item => `
            <div class="routine-item">
                <div class="routine-time">
                    <i class="far fa-clock"></i> ${item.time}
                </div>
                <div class="routine-activity">
                    ${item.icon} ${item.activity}
                </div>
            </div>
        `).join('');
        
        resultsDiv.innerHTML = `
            <div class="routine-schedule">
                <h4><i class="fas fa-calendar-day"></i> الروتين اليومي المقترح</h4>
                <div class="routine-list">
                    ${routineHTML}
                </div>
                <div class="routine-tips">
                    <h5><i class="fas fa-tips"></i> نصائح للالتزام بالروتين:</h5>
                    <ul>
                        <li>حافظي على نفس الأوقات يومياً</li>
                        <li>كوني مرنة وقابلة للتعديل</li>
                        <li>سجلي ملاحظاتك حول الروتين</li>
                    </ul>
                </div>
            </div>
        `;
    }
};

/* =========================
   MEDICINE - نظام حساب الأدوية المتقدم
   ========================= */

const Medicine = {
    drugDatabase: {
        paracetamol: {
            name: 'باراسيتامول',
            concentration: 120,
            maxDose: 60,
            frequency: 'كل 4-6 ساعات',
            uses: ['خافض حرارة', 'مسكن للألم'],
            warnings: ['لا تتجاوز الجرعة القصوى', 'يسبب تلف الكبد عند الجرعات الزائدة']
        },
        ibuprofen: {
            name: 'إيبوبروفين',
            concentration: 100,
            maxDose: 40,
            frequency: 'كل 6-8 ساعات',
            uses: ['خافض حرارة', 'مضاد للالتهاب'],
            warnings: ['يؤخذ مع الطعام', 'قد يسبب اضطراب معوي']
        }
    },
    
    init() {
        console.log('جاري تهيئة نظام حساب الأدوية...');
        
        // زر الحساب المحلي
        const calculateBtn = document.getElementById('calculate-medicine');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateDose());
        }
        
        // زر الحساب من FDA
        const fdaBtn = document.getElementById('calculate-fda');
        if (fdaBtn) {
            fdaBtn.addEventListener('click', () => this.calculateWithFDA());
        }
    },
    
    calculateDose() {
        const weight = parseFloat(document.getElementById('baby-weight-medicine')?.value);
        const drugName = document.getElementById('medicine-name')?.value;
        const concentration = parseInt(document.getElementById('medicine-concentration')?.value);
        
        if (!weight || !drugName) {
            alert('الرجاء إدخال الوزن واسم الدواء');
            return;
        }
        
        const drug = this.drugDatabase[drugName];
        if (!drug) {
            alert('هذا الدواء غير موجود في قاعدة البيانات');
            return;
        }
        
        // حساب الجرعة
        let doseMg, doseMl;
        if (drugName === 'paracetamol') {
            doseMg = weight * 15; // 15mg/kg
            doseMl = (doseMg / drug.concentration) * 5;
        } else if (drugName === 'ibuprofen') {
            doseMg = weight * 10; // 10mg/kg
            doseMl = (doseMg / drug.concentration) * 5;
        } else {
            doseMg = weight * 5; // جرعة افتراضية
            doseMl = (doseMg / concentration) * 5;
        }
        
        // التحقق من الجرعة القصوى
        const maxDoseMg = drug.maxDose;
        if (doseMg > maxDoseMg) {
            doseMg = maxDoseMg;
            doseMl = (doseMg / drug.concentration) * 5;
            alert(`⚠️ تم تعديل الجرعة للحد الأقصى المسموح: ${maxDoseMg} ملغ`);
        }
        
        this.displayResults(drug, doseMg, doseMl);
    },
    
    async calculateWithFDA() {
        const drugName = document.getElementById('medicine-name')?.value;
        
        try {
            const drugInfo = await OpenFDA.getDrugInfo(drugName);
            this.displayFDAInfo(drugInfo);
        } catch (error) {
            alert('حدث خطأ في جلب المعلومات من قاعدة البيانات');
            console.error(error);
        }
    },
    
    displayResults(drug, doseMg, doseMl) {
        const resultsDiv = document.getElementById('medicine-results');
        if (!resultsDiv) return;
        
        resultsDiv.innerHTML = `
            <div class="medicine-result-card">
                <h4><i class="fas fa-capsules"></i> نتائج حساب الجرعة</h4>
                <div class="medicine-details">
                    <p><strong>الدواء:</strong> ${drug.name}</p>
                    <p><strong>الجرعة:</strong> ${doseMg.toFixed(1)} مجم (≈ ${doseMl.toFixed(1)} مل)</p>
                    <p><strong>التكرار:</strong> ${drug.frequency}</p>
                    <p><strong>الاستخدامات:</strong> ${drug.uses.join('، ')}</p>
                    <p><strong>التحذيرات:</strong> ${drug.warnings.join('، ')}</p>
                </div>
                <div class="medicine-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>هذه النتائج إرشادية فقط. استشيري الطبيب قبل الاستخدام.</span>
                </div>
            </div>
        `;
    },
    
    displayFDAInfo(drugInfo) {
        const resultsDiv = document.getElementById('medicine-results');
        if (!resultsDiv) return;
        
        if (!drugInfo) {
            resultsDiv.innerHTML = '<p class="warning">⚠️ لم يتم العثور على معلومات لهذا الدواء</p>';
            return;
        }
        
        resultsDiv.innerHTML = `
            <div class="fda-info-card">
                <h4><i class="fas fa-database"></i> معلومات من قاعدة الأدوية</h4>
                <div class="fda-details">
                    <p><strong>الاسم العلمي:</strong> ${drugInfo.generic_name || 'غير متوفر'}</p>
                    <p><strong>الجرعة الرسمية:</strong> ${drugInfo.dosage || 'غير متوفر'}</p>
                    <p><strong>التحذيرات:</strong> ${drugInfo.warnings || 'غير متوفر'}</p>
                    <p><strong>التفاعلات:</strong> ${drugInfo.interactions || 'غير متوفر'}</p>
                </div>
            </div>
        `;
    }
};

/* =========================
   MEALS - نظام تخطيط الوجبات
   ========================= */

const Meals = {
    mealDatabase: {
        '6-8': {
            title: 'المرحلة الأولى (6-8 أشهر)',
            meals: [
                {time: 'الصباح', food: 'حليب الأم أو الصناعي', amount: 'حسب الرغبة'},
                {time: '10 صباحاً', food: 'أرز مطحون مع حليب', amount: '2-3 ملاعق'},
                {time: 'الظهر', food: 'خضار مهروسة (جزر، كوسا)', amount: '2-3 ملاعق'},
                {time: 'المساء', food: 'حليب', amount: 'حسب الرغبة'},
                {time: 'قبل النوم', food: 'حليب', amount: 'حسب الرغبة'}
            ],
            tips: [
                'ابدأي بكميات صغيرة وتزودي تدريجياً',
                'قدمي نوعاً واحداً من الطعام لمدة 3 أيام',
                'راقبي ظهور أي حساسية'
            ]
        },
        '9-11': {
            title: 'المرحلة الثانية (9-11 شهر)',
            meals: [
                {time: 'الصباح', food: 'حليب + عصيدة', amount: '½ كوب'},
                {time: '10 صباحاً', food: 'فاكهة مهروسة', amount: '¼ كوب'},
                {time: 'الظهر', food: 'لحوم بيضاء مهروسة مع خضار', amount: '½ كوب'},
                {time: 'العصر', food: 'زبادي', amount: '¼ كوب'},
                {time: 'المساء', food: 'حليب', amount: 'حسب الرغبة'}
            ],
            tips: [
                'أضيفي مصادر البروتين',
                'قدمي أطعمة يمكن الإمساك بها',
                'شجعي الطفل على الشرب من الكوب'
            ]
        }
    },
    
    init() {
        console.log('جاري تهيئة نظام تخطيط الوجبات...');
        document.getElementById('generate-meal-plan')?.addEventListener('click', () => this.generateMealPlan());
    },
    
    generateMealPlan() {
        const age = document.getElementById('planner-age')?.value;
        const allergies = document.getElementById('planner-allergies')?.value;
        
        const mealPlan = this.createMealPlan(age, allergies);
        this.displayMealPlan(mealPlan);
    },
    
    createMealPlan(age, allergies) {
        const basePlan = this.mealDatabase[age] || this.mealDatabase['6-8'];
        
        // تعديل الوجبات حسب الحساسية
        const modifiedMeals = this.adjustForAllergies(basePlan.meals, allergies);
        
        return {
            ...basePlan,
            meals: modifiedMeals,
            allergies: allergies
        };
    },
    
    adjustForAllergies(meals, allergy) {
        if (allergy === 'none') return meals;
        
        const allergyMap = {
            dairy: ['حليب', 'زبادي', 'جبن'],
            eggs: ['بيض'],
            nuts: ['مكسرات', 'زبدة الفول السوداني'],
            wheat: ['قمح', 'خبز', 'معكرونة']
        };
        
        const allergens = allergyMap[allergy] || [];
        
        return meals.map(meal => {
            let food = meal.food;
            allergens.forEach(allergen => {
                if (food.includes(allergen)) {
                    food = food.replace(allergen, `بديل ${allergen}`);
                }
            });
            return {...meal, food};
        });
    },
    
    displayMealPlan(plan) {
        const resultsDiv = document.getElementById('meal-plan-results');
        if (!resultsDiv) return;
        
        const mealsHTML = plan.meals.map(meal => `
            <div class="meal-item">
                <div class="meal-time">${meal.time}</div>
                <div class="meal-food">${meal.food}</div>
                <div class="meal-amount">${meal.amount}</div>
            </div>
        `).join('');
        
        const tipsHTML = plan.tips.map(tip => `<li>${tip}</li>`).join('');
        
        resultsDiv.innerHTML = `
            <div class="meal-plan-card">
                <h4><i class="fas fa-utensils"></i> ${plan.title}</h4>
                <div class="meal-plan-header">
                    <div class="time-label">الوقت</div>
                    <div class="food-label">الوجبة</div>
                    <div class="amount-label">الكمية</div>
                </div>
                <div class="meal-plan-list">
                    ${mealsHTML}
                </div>
                <div class="meal-tips">
                    <h5><i class="fas fa-lightbulb"></i> نصائح هامة:</h5>
                    <ul>${tipsHTML}</ul>
                </div>
                ${plan.allergies !== 'none' ? 
                    `<div class="allergy-note">
                        <i class="fas fa-exclamation-circle"></i>
                        تم تعديل الوجبات لتجنب ${plan.allergies}
                    </div>` : ''
                }
            </div>
        `;
    }
};

/* =========================
   AI ENGINE - محرك الذكاء الاصطناعي المحسن
   ========================= */

const AI = {
    // تحليل البكاء المتقدم
    analyzeCry(state) {
        const probabilities = [];
        let recommendations = [];
        let medicalAdvice = 'إذا استمر البكاء لأكثر من ساعتين أو ظهرت أعراض أخرى، راجعي الطبيب';
        
        // تحليل حسب العمر
        if (state.age === '0-3') {
            probabilities.push({reason: 'المغص', probability: 0.7});
            probabilities.push({reason: 'الجوع', probability: 0.6});
            probabilities.push({reason: 'التعب', probability: 0.5});
            probabilities.push({reason: 'الحاجة للتجشؤ', probability: 0.4});
            
            recommendations = [
                'حاولي تهدئة الطفل بالهز الخفيف',
                'تأكدي من شبع الطفل',
                'جربي وضعية التجشؤ',
                'استخدمي الضوضاء البيضاء'
            ];
        } 
        else if (state.age === '4-6') {
            probabilities.push({reason: 'التسنين', probability: 0.6});
            probabilities.push({reason: 'الملل', probability: 0.5});
            probabilities.push({reason: 'الحاجة للنوم', probability: 0.4});
            
            recommendations = [
                'استخدمي العضاضة المبردة',
                'قدمي ألعاباً جديدة',
                'حافظي على روتين النوم'
            ];
        }
        
        // تحليل حسب نوع البكاء
        if (state.cryType === 'high-pitched') {
            probabilities.push({reason: 'الألم', probability: 0.8});
            medicalAdvice = 'البكاء الحاد قد يدل على ألم شديد، راجعي الطبيب فوراً';
        }
        
        if (state.cryType === 'weak') {
            probabilities.push({reason: 'التعب الشديد', probability: 0.7});
            recommendations.push('قدمي فرصة للنوم مباشرة');
        }
        
        // تحليل حسب التوقيت
        if (state.timing === 'evening') {
            probabilities.push({reason: 'مغص المساء', probability: 0.9});
            recommendations.push('استخدمي حماماً دافئاً قبل المساء');
        }
        
        // تحليل الأعراض
        if (state.symptoms.includes('fever')) {
            probabilities.push({reason: 'مرض', probability: 0.9});
            medicalAdvice = 'ارتفاع الحرارة مع البكاء يتطلب مراجعة طبية عاجلة';
        }
        
        // تصنيف الاحتمالات وتصفيتها
        const filteredProbs = probabilities
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5);
        
        // إضافة أسباب عامة إذا كانت الاحتمالات قليلة
        if (filteredProbs.length < 3) {
            filteredProbs.push(
                {reason: 'الحاجة للاهتمام', probability: 0.3},
                {reason: 'عدم الراحة', probability: 0.3}
            );
        }
        
        // إضافة توصيات عامة
        if (recommendations.length === 0) {
            recommendations = [
                'تحققي من الحفاض',
                'تأكدي من درجة حرارة الغرفة',
                'قدمي حضناً دافئاً'
            ];
        }
        
        return {
            probabilities: filteredProbs,
            recommendations,
            medicalAdvice
        };
    },
    
    // تحليل النمو المتقدم
    analyzeGrowth(measurement) {
        let analysis = '';
        const age = measurement.age;
        const weight = measurement.weight;
        const height = measurement.height;
        const head = measurement.head;
        
        // مقارنة الوزن بمعايير WHO
        const whoWeight = WHO_WEIGHT.female.find(w => w.m === age) || WHO_WEIGHT.male.find(w => w.m === age);
        if (whoWeight) {
            const percent = (weight / whoWeight.w) * 100;
            
            if (percent < 80) {
                analysis += `<div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>انتباه:</strong> الوزن أقل من المعدل الطبيعي (${percent.toFixed(1)}% من المعدل)
                </div>`;
            } else if (percent > 120) {
                analysis += `<div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <strong>ملاحظة:</strong> الوزن أعلى من المعدل الطبيعي (${percent.toFixed(1)}% من المعدل)
                </div>`;
            } else {
                analysis += `<div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <strong>ممتاز:</strong> الوزن ضمن المعدل الطبيعي (${percent.toFixed(1)}% من المعدل)
                </div>`;
            }
        }
        
        // تحليل الطول
        if (height > 0) {
            const expectedHeight = 50 + (age * 2.5);
            const heightPercent = (height / expectedHeight) * 100;
            
            if (heightPercent < 90) {
                analysis += `<div class="alert alert-warning">
                    <i class="fas fa-ruler-vertical"></i>
                    <strong>ملاحظة:</strong> الطول أقل قليلاً من المتوقع
                </div>`;
            }
        }
        
        // تحليل محيط الرأس
        if (head > 0) {
            const expectedHead = 35 + (age * 0.5);
            if (head < expectedHead * 0.9 || head > expectedHead * 1.1) {
                analysis += `<div class="alert alert-info">
                    <i class="fas fa-brain"></i>
                    <strong>ملاحظة:</strong> محيط الرأس خارج النطاق المتوسط، استشيري الطبيب
                </div>`;
            }
        }
        
        // إضافة توصيات عامة
        if (analysis === '') {
            analysis = `<div class="alert alert-success">
                <i class="fas fa-heart"></i>
                <strong>رائع:</strong> جميع القياسات ضمن المعدلات الطبيعية
            </div>`;
        }
        
        // إضافة نصيحة أخيرة
        analysis += `<div class="growth-tips">
            <h5><i class="fas fa-lightbulb"></i> نصائح للنمو الصحي:</h5>
            <ul>
                <li>التزمي بمواعيد الرضاعة المنتظمة</li>
                <li>وفربي بيئة آمنة للحركة واللعب</li>
                <li>تابعي النمو مع طبيب الأطفال بانتظام</li>
            </ul>
        </div>`;
        
        return analysis;
    },
    
    // تحليل الصوت المتقدم
    analyzeAudio(frequencyData, duration) {
        const avgFreq = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length;
        const maxFreq = Math.max(...frequencyData);
        const minFreq = Math.min(...frequencyData);
        
        let analysis = '';
        
        // تحليل الترددات العالية
        if (maxFreq > 150 && avgFreq > 80) {
            analysis = '🔴 <strong>بكاء حاد جداً:</strong> يشير إلى ألم شديد أو إزعاج كبير';
        } 
        else if (maxFreq > 100 && avgFreq > 60) {
            analysis = '🟠 <strong>بكاء متوسط الشدة:</strong> قد يكون بسبب جوع أو تعب';
        } 
        else if (maxFreq < 50 && avgFreq < 30) {
            analysis = '🟢 <strong>بكاء خفيف:</strong> طبيعي للنعاس أو طلب الاهتمام';
        } 
        else {
            analysis = '⚪ <strong>نمط معتدل:</strong> راقبي الطفل للتعرف على السبب';
        }
        
        // إضافة تحليل المدة
        if (duration > 300) { // أكثر من 5 دقائق
            analysis += '<br>⏱️ <em>البكاء طويل المدة، قد يحتاج تدخل</em>';
        }
        
        return analysis;
    },
    
    // تحليل النمط الزمني
    analyzePattern(patternData) {
        const { intervals, durations, intensities } = patternData;
        
        let patternType = 'غير محدد';
        let confidence = 0.5;
        
        // تحليل الفواصل الزمنية
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        if (avgInterval < 10) { // بكاء متواصل
            patternType = 'بكاء متواصل';
            confidence = 0.8;
        } else if (avgInterval > 30 && avgInterval < 60) { // بكاء متقطع
            patternType = 'بكاء متقطع';
            confidence = 0.7;
        } else if (avgInterval > 60) { // بكاء نادر
            patternType = 'بكاء عابر';
            confidence = 0.6;
        }
        
        // تحليل الشدة
        const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        if (avgIntensity > 0.7) {
            patternType += ' شديد';
            confidence += 0.1;
        }
        
        return {
            pattern: patternType,
            confidence: Math.min(confidence, 0.95),
            description: this.getPatternDescription(patternType)
        };
    },
    
    getPatternDescription(pattern) {
        const descriptions = {
            'بكاء متواصل شديد': 'قد يشير إلى مشكلة صحية تحتاج مراجعة طبية',
            'بكاء متواصل': 'قد يكون بسبب مغص أو ألم مستمر',
            'بكاء متقطع': 'طبيعي للجوع أو التعب أو تغيير الحفاض',
            'بكاء عابر': 'طبيعي لطلب الاهتمام أو الملل'
        };
        
        return descriptions[pattern] || 'نمط بكاء يحتاج للمراقبة';
    }
};

/* =========================
   CRY AUDIO - نظام تحليل الصوت
   ========================= */

const CryAudio = {
    isRecording: false,
    audioContext: null,
    analyser: null,
    microphone: null,
    dataArray: null,
    
    init() {
        console.log('جاري تهيئة نظام تحليل الصوت...');
        
        // زر البدء
        const startBtn = document.querySelector('[onclick="CryAudio.start()"]');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        
        // زر الإيقاف
        const stopBtn = document.querySelector('[onclick="CryAudio.stop()"]');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stop());
        }
    },
    
    async start() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            this.analyser.fftSize = 2048;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            this.microphone.connect(this.analyser);
            
            this.isRecording = true;
            this.analyzeLoop();
            
            this.updateStatus('🎤 جاري تحليل الصوت...', 'recording');
            
        } catch (error) {
            console.error('خطأ في الوصول للميكروفون:', error);
            alert('تعذر الوصول إلى الميكروفون. تأكدي من الصلاحيات.');
        }
    },
    
    stop() {
        this.isRecording = false;
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.updateStatus('⏹️ توقف التحليل', 'stopped');
    },
    
    analyzeLoop() {
        if (!this.isRecording || !this.analyser) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // تحليل البيانات
        const analysis = AI.analyzeAudio(this.dataArray, this.getRecordingDuration());
        this.displayAnalysis(analysis);
        
        // استمرار الحلقة
        requestAnimationFrame(() => this.analyzeLoop());
    },
    
    displayAnalysis(analysis) {
        const resultsDiv = document.getElementById('cry-analysis-results');
        if (resultsDiv && this.isRecording) {
            resultsDiv.innerHTML = `
                <div class="audio-analysis-card">
                    <h5><i class="fas fa-wave-square"></i> تحليل الصوت الحي</h5>
                    <div class="audio-visualizer">
                        ${this.generateVisualizer()}
                    </div>
                    <div class="audio-result">${analysis}</div>
                    <div class="recording-time">
                        <i class="far fa-clock"></i>
                        ${this.getRecordingDuration()} ثانية
                    </div>
                </div>
            `;
        }
    },
    
    generateVisualizer() {
        if (!this.dataArray) return '';
        
        let visualizer = '<div class="visualizer-bars">';
        const barCount = 20;
        const step = Math.floor(this.dataArray.length / barCount);
        
        for (let i = 0; i < barCount; i++) {
            const value = this.dataArray[i * step] / 255;
            const height = Math.max(5, value * 50);
            const color = this.getBarColor(value);
            
            visualizer += `
                <div class="visualizer-bar" style="
                    height: ${height}px;
                    background-color: ${color};
                    width: ${100 / barCount}%;
                "></div>
            `;
        }
        
        visualizer += '</div>';
        return visualizer;
    },
    
    getBarColor(value) {
        if (value > 0.7) return '#f44336';
        if (value > 0.4) return '#ff9800';
        if (value > 0.2) return '#4caf50';
        return '#2196f3';
    },
    
    updateStatus(message, status) {
        const statusElement = document.getElementById('audio-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-${status}`;
        }
    },
    
    getRecordingDuration() {
        if (!this.startTime) {
            this.startTime = Date.now();
            return 0;
        }
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
};

/* =========================
   CRY PATTERN - نظام تحليل الأنماط
   ========================= */

const CryPattern = {
    patterns: [],
    currentPattern: null,
    
    init() {
        console.log('جاري تهيئة نظام تحليل الأنماط...');
        this.loadPatterns();
    },
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new MediaRecorder(stream);
            this.chunks = [];
            
            this.recorder.ondataavailable = (e) => {
                this.chunks.push(e.data);
            };
            
            this.recorder.onstop = () => {
                this.analyzePattern();
            };
            
            this.recorder.start();
            this.startTime = Date.now();
            
            this.updatePatternStatus('جاري التسجيل...');
            
        } catch (error) {
            console.error('خطأ في التسجيل:', error);
            alert('تعذر الوصول إلى الميكروفون.');
        }
    },
    
    stopRecording() {
        if (this.recorder && this.recorder.state === 'recording') {
            this.recorder.stop();
            this.recorder.stream.getTracks().forEach(track => track.stop());
        }
    },
    
    analyzePattern() {
        const duration = (Date.now() - this.startTime) / 1000;
        const pattern = {
            duration,
            timestamp: new Date().toISOString(),
            intensity: this.calculateIntensity()
        };
        
        this.patterns.push(pattern);
        this.currentPattern = pattern;
        
        const analysis = this.getPatternAnalysis(pattern);
        this.displayPatternAnalysis(analysis);
        
        this.savePatterns();
    },
    
    calculateIntensity() {
        // محاكاة حساب الشدة (في التطبيق الحقيقي، يتم حسابها من البيانات الصوتية)
        return Math.random() * 0.5 + 0.5;
    },
    
    getPatternAnalysis(pattern) {
        let level = 'normal';
        let message = '';
        
        if (pattern.duration > 180) { // أكثر من 3 دقائق
            level = 'high';
            message = 'بكاء طويل الأمد، يحتاج انتباهاً فورياً';
        } else if (pattern.duration > 60) { // أكثر من دقيقة
            level = 'medium';
            message = 'بكاء متوسط المدة، راقبي الطفل';
        } else {
            level = 'low';
            message = 'بكاء قصير، طبيعي غالباً';
        }
        
        if (pattern.intensity > 0.8) {
            message += ' مع شدة عالية';
        }
        
        return { level, message, pattern };
    },
    
    displayPatternAnalysis(analysis) {
        const resultsDiv = document.getElementById('cry-analysis-results');
        if (!resultsDiv) return;
        
        const levelClass = `pattern-${analysis.level}`;
        
        resultsDiv.innerHTML = `
            <div class="pattern-analysis ${levelClass}">
                <h5><i class="fas fa-chart-line"></i> تحليل النمط الزمني</h5>
                <div class="pattern-details">
                    <p><strong>المدة:</strong> ${analysis.pattern.duration.toFixed(1)} ثانية</p>
                    <p><strong>الشدة:</strong> ${(analysis.pattern.intensity * 100).toFixed(0)}%</p>
                    <p><strong>التحليل:</strong> ${analysis.message}</p>
                </div>
                <div class="pattern-history">
                    <h6>سجل الأنماط السابقة:</h6>
                    ${this.generatePatternHistory()}
                </div>
            </div>
        `;
    },
    
    generatePatternHistory() {
        if (this.patterns.length === 0) return '<p>لا توجد أنماط مسجلة سابقاً</p>';
        
        const recentPatterns = this.patterns.slice(-5).reverse();
        
        return recentPatterns.map(pattern => `
            <div class="history-item">
                <span class="history-time">${new Date(pattern.timestamp).toLocaleTimeString('ar-SA')}</span>
                <span class="history-duration">${pattern.duration.toFixed(1)}s</span>
                <span class="history-intensity">${(pattern.intensity * 100).toFixed(0)}%</span>
            </div>
        `).join('');
    },
    
    updatePatternStatus(message) {
        const statusElement = document.getElementById('pattern-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    },
    
    savePatterns() {
        Storage.set('cry_patterns', this.patterns);
    },
    
    loadPatterns() {
        this.patterns = Storage.get('cry_patterns', []);
    }
};

/* =========================
   ALERTS - نظام التنبيهات الذكي
   ========================= */

const Alerts = {
    notificationPermission: false,
    
    init() {
        console.log('جاري تهيئة نظام التنبيهات...');
        this.requestNotificationPermission();
        this.setupAutoAlerts();
    },
    
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('هذا المتصفح لا يدعم الإشعارات');
            return;
        }
        
        if (Notification.permission === 'granted') {
            this.notificationPermission = true;
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.notificationPermission = permission === 'granted';
        }
    },
    
    setupAutoAlerts() {
        // تنبيهات التطعيمات
        this.checkVaccineAlerts();
        
        // تنبيهات النمو
        this.checkGrowthAlerts();
        
        // تنبيهات دورية
        setInterval(() => {
            this.checkVaccineAlerts();
            this.checkGrowthAlerts();
        }, 24 * 60 * 60 * 1000); // كل 24 ساعة
    },
    
    checkVaccineAlerts() {
        const vaccineData = Storage.get('vaccine_schedule');
        if (!vaccineData || !vaccineData.schedule) return;
        
        const upcomingVaccines = vaccineData.schedule.filter(v => !v.done);
        
        if (upcomingVaccines.length > 0) {
            const nextVaccine = upcomingVaccines[0];
            this.notify('📅 تذكير بالتطعيم', `تطعيم ${nextVaccine.name} قادم في ${nextVaccine.age}`);
        }
    },
    
    checkGrowthAlerts() {
        const growthData = Storage.get('growth_measurements');
        if (growthData.length === 0) return;
        
        const latest = growthData[growthData.length - 1];
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        // التحقق إذا مر أسبوع دون تسجيل
        const lastMeasurementDate = new Date(growthData[growthData.length - 1].date);
        if (lastMeasurementDate < lastWeek) {
            this.notify('📏 تذكير بمتابعة النمو', 'مر أسبوع دون تسجيل قياسات النمو');
        }
    },
    
    notify(title, body) {
        if (!this.notificationPermission) return;
        
        try {
            // إشعار المتصفح
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon: '../images/icons/icons.png',
                    badge: '../images/icons/icons.png'
                });
            }
            
            // إشعار داخل التطبيق
            this.showInAppNotification(title, body);
            
        } catch (error) {
            console.error('خطأ في إرسال الإشعار:', error);
        }
    },
    
    showInAppNotification(title, message) {
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // إضافة أنيميشن
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // إزالة تلقائية بعد 5 ثوانٍ
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
};

/* =========================
   OPENFDA - دمج قاعدة بيانات الأدوية
   ========================= */

const OpenFDA = {
    baseURL: 'https://api.fda.gov/drug/label.json',
    
    async getDrugInfo(drugName) {
        try {
            const response = await fetch(
                `${this.baseURL}?search=openfda.generic_name:"${drugName}"&limit=1`
            );
            
            if (!response.ok) {
                throw new Error('فشل في جلب البيانات');
            }
            
            const data = await response.json();
            
            if (!data.results || data.results.length === 0) {
                return null;
            }
            
            const drugInfo = data.results[0];
            
            return {
                generic_name: drugInfo.openfda?.generic_name?.[0] || drugName,
                brand_name: drugInfo.openfda?.brand_name?.[0] || 'غير معروف',
                dosage: drugInfo.dosage_and_administration?.[0] || 'غير متوفر',
                warnings: drugInfo.warnings?.[0] || 'لا توجد تحذيرات',
                interactions: drugInfo.drug_interactions?.[0] || 'غير معروف',
                side_effects: drugInfo.adverse_reactions?.[0] || 'غير معروف'
            };
            
        } catch (error) {
            console.error('خطأ في جلب بيانات الدواء:', error);
            return null;
        }
    },
    
    async searchDrugs(query) {
        try {
            const response = await fetch(
                `${this.baseURL}?search=${encodeURIComponent(query)}&limit=10`
            );
            
            if (!response.ok) {
                throw new Error('فشل في البحث');
            }
            
            const data = await response.json();
            return data.results || [];
            
        } catch (error) {
            console.error('خطأ في البحث:', error);
            return [];
        }
    }
};

/* =========================
   UTILITIES - دوال مساعدة
   ========================= */

// دالة تحميل البيانات المحفوظة
function loadSavedData() {
    console.log('جاري تحميل البيانات المحفوظة...');
    
    // تحميل بيانات التطعيمات
    const vaccineData = Storage.get('vaccine_schedule');
    if (vaccineData) {
        console.log('تم تحميل جدول التطعيمات');
    }
    
    // تحميل قياسات النمو
    const growthData = Storage.get('growth_measurements');
    if (growthData.length > 0) {
        console.log(`تم تحميل ${growthData.length} قياسات للنمو`);
    }
    
    // تحميل تحليلات البكاء
    const cryAnalyses = Storage.get('cry_analyses');
    if (cryAnalyses.length > 0) {
        console.log(`تم تحميل ${cryAnalyses.length} تحليل للبكاء`);
    }
    
    // تحميل أنماط البكاء
    const cryPatterns = Storage.get('cry_patterns');
    if (cryPatterns.length > 0) {
        console.log(`تم تحميل ${cryPatterns.length} نمط بكاء`);
    }
}

// دالة التصدير لجميع البيانات
function exportAllData() {
    const allData = {
        vaccines: Storage.get('vaccine_schedule'),
        growth: Storage.get('growth_measurements'),
        cryAnalyses: Storage.get('cry_analyses'),
        cryPatterns: Storage.get('cry_patterns'),
        exportDate: new Date().toISOString(),
        version: 'Ri3aya Tools v2.0'
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ri3aya-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// دالة الاستيراد
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.vaccines) Storage.set('vaccine_schedule', data.vaccines);
            if (data.growth) Storage.set('growth_measurements', data.growth);
            if (data.cryAnalyses) Storage.set('cry_analyses', data.cryAnalyses);
            if (data.cryPatterns) Storage.set('cry_patterns', data.cryPatterns);
            
            alert('تم استيراد البيانات بنجاح!');
            location.reload();
            
        } catch (error) {
            alert('خطأ في استيراد البيانات: ' + error.message);
        }
    };
    
    reader.readAsText(file);
}

// دالة النسخ الاحتياطي التلقائي
function setupAutoBackup() {
    // نسخ احتياطي أسبوعي
    setInterval(() => {
        exportAllData();
        console.log('تم النسخ الاحتياطي التلقائي');
    }, 7 * 24 * 60 * 60 * 1000);
}

// دالة تعطيل الذاكرة المؤقتة
function clearAllData() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
        Storage.clear();
        alert('تم حذف جميع البيانات بنجاح');
        location.reload();
    }
}

// تهيئة النسخ الاحتياطي عند التحميل
setupAutoBackup();

/* =========================
   EXPORTS - تصدير الكائنات للنطاق العام
   ========================= */

window.Storage = Storage;
window.Tabs = Tabs;
window.Vaccine = Vaccine;
window.Growth = Growth;
window.CryAI = CryAI;
window.CryAudio = CryAudio;
window.CryPattern = CryPattern;
window.Routine = Routine;
window.Medicine = Medicine;
window.Meals = Meals;
window.AI = AI;
window.Alerts = Alerts;
window.OpenFDA = OpenFDA;

window.exportAllData = exportAllData;
window.importData = importData;
window.clearAllData = clearAllData;

console.log('✅ تم تحميل Ri3aya Tools Bundle v2.0 بنجاح');






/* =========================
   Ri3aya Tools Bundle v2.0 - الجزء النهائي
   ========================= */

// الكود الموجود يبقى كما هو...

// عند نهاية الملف، أضف هذا الكود للتهيئة النهائية
document.addEventListener('DOMContentLoaded', () => {
    console.log('جاري تهيئة جميع الأدوات...');
    
    // تهيئة جميع الوحدات
    Tabs.init();
    Vaccine.init();
    Growth.init();
    CryAI.init();
    CryAudio.init();
    CryPattern.init();
    Routine.init();
    Medicine.init();
    Meals.init();
    Alerts.init();
    
    // تحميل البيانات المحفوظة
    loadSavedData();
    
    // إضافة أحداث إضافية
    setupAdditionalEvents();
    
    // عرض البيانات المبدئية
    setTimeout(() => {
        initialDataDisplay();
    }, 500);
});

/* =========================
   تهيئة أحداث إضافية
   ========================= */

function setupAdditionalEvents() {
    console.log('إعداد الأحداث الإضافية...');
    
    // أحداث أداة الروتين
    const generateRoutineBtn = document.getElementById('generate-routine');
    if (generateRoutineBtn) {
        generateRoutineBtn.addEventListener('click', () => {
            Routine.generateRoutine();
        });
    }
    
    // أحداث أداة الدواء
    const calculateMedicineBtn = document.getElementById('calculate-medicine');
    if (calculateMedicineBtn) {
        calculateMedicineBtn.addEventListener('click', () => {
            Medicine.calculateDose();
        });
    }
    
    const calculateFDABtn = document.getElementById('calculate-fda');
    if (calculateFDABtn) {
        calculateFDABtn.addEventListener('click', () => {
            Medicine.calculateWithFDA();
        });
    }
    
    // أحداث أداة الوجبات
    const generateMealPlanBtn = document.getElementById('generate-meal-plan');
    if (generateMealPlanBtn) {
        generateMealPlanBtn.addEventListener('click', () => {
            Meals.generateMealPlan();
        });
    }
    
    // أحداث تحليل البكاء
    const ageOptions = document.querySelectorAll('.age-option');
    ageOptions.forEach(btn => {
        btn.addEventListener('click', function() {
            CryAI.selectOption('age', this.dataset.age);
        });
    });
    
    const timingOptions = document.querySelectorAll('.timing-option');
    timingOptions.forEach(btn => {
        btn.addEventListener('click', function() {
            CryAI.selectOption('timing', this.dataset.timing);
        });
    });
    
    const cryOptions = document.querySelectorAll('.cry-option');
    cryOptions.forEach(btn => {
        btn.addEventListener('click', function() {
            CryAI.selectOption('cryType', this.dataset.cry);
        });
    });
    
    // تحديث حالة التبويبات الفرعية للنمو
    const trackerTabs = document.querySelectorAll('.tracker-tab');
    trackerTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const trackerType = this.dataset.tracker;
            
            // إزالة النشاط من الجميع
            document.querySelectorAll('.tracker-tab, .tracker-pane').forEach(el => {
                el.classList.remove('active');
            });
            
            // إضافة النشاط للعناصر المحددة
            this.classList.add('active');
            document.getElementById(`${trackerType}-pane`).classList.add('active');
            
            // إذا كان التبويب المحدد هو الرسوم البيانية، قم بتحديث الرسم البياني
            if (trackerType === 'charts' && Growth.growthChart) {
                Growth.updateChart();
            }
        });
    });
    
    // إضافة حدث للتصدير
    const exportChartBtn = document.getElementById('export-chart');
    if (exportChartBtn) {
        exportChartBtn.addEventListener('click', () => {
            Growth.exportChart();
        });
    }
    
    // تحديث حالة العناصر المختارة في البكاء
    document.querySelectorAll('.age-option, .timing-option, .cry-option').forEach(btn => {
        btn.addEventListener('click', function() {
            // إزالة التحديد من جميع الأزرار في نفس المجموعة
            const parent = this.parentElement;
            parent.querySelectorAll('button').forEach(b => {
                b.classList.remove('selected');
            });
            
            // إضافة التحديد للزر المضغوط
            this.classList.add('selected');
        });
    });
    
    // تحديث حالة أعراض البكاء
    document.querySelectorAll('[data-symptom]').forEach(cb => {
        cb.addEventListener('change', function() {
            CryAI.toggleSymptom(this.dataset.symptom, this.checked);
        });
    });
}

/* =========================
   عرض البيانات المبدئية
   ========================= */

function initialDataDisplay() {
    console.log('عرض البيانات المبدئية...');
    
    // عرض بيانات التطعيمات المحفوظة
    const vaccineData = Storage.get('vaccine_schedule');
    if (vaccineData && vaccineData.schedule) {
        const birthDate = document.getElementById('baby-birthdate-vaccine');
        if (birthDate && !birthDate.value) {
            // تعيين تاريخ افتراضي (منذ 3 أشهر)
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            birthDate.value = threeMonthsAgo.toISOString().split('T')[0];
        }
        
        Vaccine.renderSchedule(vaccineData.schedule, vaccineData.babyAge || 3);
    }
    
    // عرض بيانات النمو المحفوظة
    const growthData = Storage.get('growth_measurements');
    if (growthData && growthData.length > 0) {
        Growth.renderMeasurements();
        Growth.updateChart();
        Growth.updateAnalysis();
    }
    
    // تحميل أي بيانات نموذجية إذا لم تكن هناك بيانات
    if (growthData.length === 0) {
        // عرض رسالة ترحيبية
        const growthAnalysis = document.getElementById('growth-analysis');
        if (growthAnalysis) {
            growthAnalysis.innerHTML = `
                <div class="welcome-message">
                    <h4>مرحباً بك في أداة متابعة النمو!</h4>
                    <p>لبدء استخدام الأداة، قم بتسجيل قياسات النمو لطفلك أو استخدم البيانات النموذجية للتعرف على كيفية عمل الأداة.</p>
                    <button class="btn btn-primary" onclick="Growth.loadSampleData()">
                        <i class="fas fa-download"></i> تحميل بيانات نموذجية
                    </button>
                </div>
            `;
        }
    }
    
    // تحميل تحليلات البكاء المحفوظة
    const cryAnalyses = Storage.get('cry_analyses');
    if (cryAnalyses && cryAnalyses.length > 0) {
        console.log(`تم تحميل ${cryAnalyses.length} تحليل بكاء`);
    }
    
    // تعيين تواريخ افتراضية
    const today = new Date().toISOString().split('T')[0];
    const measurementDate = document.getElementById('measurement-date');
    if (measurementDate) {
        measurementDate.value = today;
    }
    
    const vaccineBirthDate = document.getElementById('baby-birthdate-vaccine');
    if (vaccineBirthDate) {
        vaccineBirthDate.max = today;
    }
}

/* =========================
   دعم إضافي للرسوم البيانية
   ========================= */

// تحديث الرسم البياني عند تغيير الخيارات
document.addEventListener('DOMContentLoaded', function() {
    // إضافة مستمعين لأحداث تغيير خيارات الرسم البياني
    const chartOptions = ['show-weight', 'show-height', 'show-head'];
    chartOptions.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                if (Growth.growthChart) {
                    Growth.updateChart();
                }
            });
        }
    });
});

/* =========================
   دعم التنبيهات والإشعارات
   ========================= */

// طلب إذن الإشعارات عند التفاعل مع المستخدم
document.addEventListener('click', function() {
    if (!Alerts.notificationPermission && Notification.permission === 'default') {
        Alerts.requestNotificationPermission();
    }
});

/* =========================
   تعزيز واجهة المستخدم
   ========================= */

// إضافة تأثيرات عند التفاعل
document.addEventListener('DOMContentLoaded', function() {
    // تأثيرات لأزرار التبويبات
    const toolTabs = document.querySelectorAll('.tool-tab');
    toolTabs.forEach(tab => {
        tab.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        tab.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // تأثيرات لأزرار الأدوات السريعة
    const quickToolBtns = document.querySelectorAll('.btn-tool-quick');
    quickToolBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

/* =========================
   تحسينات الوصولية
   ========================= */

// دعم مفاتيح لوحة المفاتيح
document.addEventListener('keydown', function(e) {
    // التنقل بين التبويبات باستخدام مفاتيح الأسهم
    if (e.altKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const tabs = document.querySelectorAll('.tool-tab');
        const currentIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
        
        if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
            tabs[currentIndex + 1].click();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            tabs[currentIndex - 1].click();
        }
    }
});

/* =========================
   الكود النهائي للتشغيل
   ========================= */

console.log('✅ تم تحميل Ri3aya Tools Bundle v2.0 بنجاح وجاهز للاستخدام!');

// تصدير الدوال التي تحتاجها HTML
window.setupAdditionalEvents = setupAdditionalEvents;
window.initialDataDisplay = initialDataDisplay;




// إضافة تعريفات للدوال المفقودة
const DataManager = {
    exportAllData: function() {
        console.log('تصدير البيانات...');
        // تنفيذ التصدير
    },
    
    importData: function(event) {
        console.log('استيراد البيانات...');
        // تنفيذ الاستيراد
    },
    
    clearAllData: function() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟')) {
            console.log('حذف البيانات...');
            // تنفيذ الحذف
        }
    }
};

// جعل الدوال متاحة عالمياً
window.exportAllData = DataManager.exportAllData;
window.importData = DataManager.importData;
window.clearAllData = DataManager.clearAllData;


// إضافة مؤشرات تحميل
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                جاري التحميل...
            </div>
        `;
    }
}