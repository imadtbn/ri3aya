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
    CryGuide.init();
            Routine.init();
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
            { age: 'عند الولادة', name: 'BCG + التهاب الكبد ب', months: 0, done: false },
            { age: 'شهرين', name: 'الخماسي + شلل + روتا', months: 2, done: false },
            { age: '4 أشهر', name: 'الخماسي + شلل + روتا', months: 4, done: false },
            { age: '6 أشهر', name: 'الخماسي + شلل + التهاب الكبد ب', months: 6, done: false },
            { age: '9 أشهر', name: 'الحصبة + جدري الماء', months: 9, done: false },
            { age: '12 شهر', name: 'الثلاثي الفيروسي + التهاب الكبد أ', months: 12, done: false },
            { age: '18 شهر', name: 'الخماسي + شلل + التهاب الكبد أ', months: 18, done: false },
            { age: '24 شهر', name: 'الحصبة + النكاف + الحصبة الألمانية', months: 24, done: false }
        ],
        uae: [
            { age: 'عند الولادة', name: 'BCG + التهاب الكبد ب', months: 0, done: false },
            { age: 'شهرين', name: 'الخماسي + شلل', months: 2, done: false },
            { age: '4 أشهر', name: 'الخماسي + شلل', months: 4, done: false },
            { age: '6 أشهر', name: 'الخماسي + شلل', months: 6, done: false },
            { age: '12 شهر', name: 'الثلاثي الفيروسي', months: 12, done: false },
            { age: '18 شهر', name: 'الخماسي + شلل', months: 18, done: false }
        ],
        kuwait: [
            { age: 'عند الولادة', name: 'BCG + التهاب الكبد ب', months: 0, done: false },
            { age: 'شهرين', name: 'الخماسي + شلل', months: 2, done: false },
            { age: '4 أشهر', name: 'الخماسي + شلل', months: 4, done: false },
            { age: '6 أشهر', name: 'الخماسي + شلل', months: 6, done: false },
            { age: '12 شهر', name: 'الحصبة + النكاف + الحصبة الألمانية', months: 12, done: false }
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
            { date: '2024-01-01', age: 0, weight: 3.5, height: 50, head: 35, notes: 'عند الولادة' },
            { date: '2024-02-01', age: 1, weight: 4.2, height: 54, head: 37, notes: 'الشهر الأول' },
            { date: '2024-03-01', age: 2, weight: 5.1, height: 58, head: 39, notes: 'الشهر الثاني' },
            { date: '2024-04-01', age: 3, weight: 5.8, height: 61, head: 41, notes: 'الشهر الثالث' },
            { date: '2024-05-01', age: 4, weight: 6.5, height: 64, head: 42, notes: 'الشهر الرابع' }
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
   CRY GUIDE - دليل تثقيفي آمن
   ========================= */
const CryGuide = {
    init() {},
    selectOption() {
        window.Ri3aya?.announce?.('هذه الأسئلة لتنظيم الملاحظات فقط ولا تشخّص سبب البكاء.', 'info');
    },
    toggleSymptom() {},
    restartAnalysis() {},
    saveAnalysis() {
        window.Ri3aya?.announce?.('احفظي ملاحظاتك محليًا فقط، وراجعي طبيب الأطفال عند وجود علامات خطر.', 'info');
    }
};

/* =========================
   ROUTINE - نظام الروتين اليومي
   ========================= */

/* =========================
   ROUTINE - نظام الروتين اليومي (محدث ومفعل)
   ========================= */

const Routine = {
    currentRoutine: null,
    savedRoutines: [],

    init() {
        console.log('جاري تهيئة نظام الروتين...');

        // ربط زر إنشاء الروتين
        const generateBtn = document.getElementById('generate-routine');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateRoutine());
        }

        // ربط زر حفظ الروتين
        const saveBtn = document.getElementById('save-routine');
        if (!saveBtn) {
            // إنشاء زر حفظ إذا لم يكن موجوداً
            const routineResults = document.getElementById('routine-results');
            if (routineResults) {
                const saveButton = document.createElement('button');
                saveButton.id = 'save-routine';
                saveButton.className = 'btn btn-primary';
                saveButton.innerHTML = '<i class="fas fa-save"></i> حفظ الروتين';
                saveButton.style.marginTop = '15px';
                routineResults.appendChild(saveButton);
                saveButton.addEventListener('click', () => this.saveRoutine());
            }
        }

        // ربط زر طباعة الروتين
        const printBtn = document.getElementById('print-routine');
        if (!printBtn) {
            const routineResults = document.getElementById('routine-results');
            if (routineResults) {
                const printButton = document.createElement('button');
                printButton.id = 'print-routine';
                printButton.className = 'btn btn-secondary';
                printButton.innerHTML = '<i class="fas fa-print"></i> طباعة الروتين';
                printButton.style.marginTop = '15px';
                printButton.style.marginRight = '10px';
                routineResults.appendChild(printButton);
                printButton.addEventListener('click', () => this.printRoutine());
            }
        }

        // تحميل الروتينات المحفوظة
        this.loadSavedRoutines();
    },

    generateRoutine() {
        console.log('جاري إنشاء الروتين...');

        // جمع البيانات من النموذج
        const age = document.getElementById('routine-age')?.value || '0-3';
        const wakeup = parseFloat(document.getElementById('routine-wakeup')?.value) || 7;
        const naps = parseInt(document.getElementById('routine-naps')?.value) || 3;
        const feeding = document.getElementById('routine-feeding')?.value || 'breast';

        // جمع الأنشطة المختارة
        const activities = [];
        const activityChecks = [
            'activity-outdoor',
            'activity-reading',
            'activity-music',
            'activity-bath',
            'activity-massage'
        ];

        activityChecks.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox && checkbox.checked) {
                activities.push(id.replace('activity-', ''));
            }
        });

        // إنشاء الروتين
        const routine = this.createRoutine(age, wakeup, naps, feeding, activities);

        // حفظ الروتين الحالي
        this.currentRoutine = {
            ...routine,
            config: { age, wakeup, naps, feeding, activities },
            timestamp: new Date().toISOString()
        };

        // عرض الروتين
        this.displayRoutine(routine);
    },

    createRoutine(age, wakeupTime, napsCount, feedingType, activities) {
        const routines = {
            '0-3': this.createNewbornRoutine(wakeupTime, feedingType, activities),
            '4-6': this.createInfantRoutine(wakeupTime, napsCount, feedingType, activities),
            '7-9': this.createCrawlerRoutine(wakeupTime, napsCount, feedingType, activities),
            '10-12': this.createToddlerRoutine(wakeupTime, napsCount, feedingType, activities),
            '13-18': this.createWalkerRoutine(wakeupTime, napsCount, feedingType, activities),
            '19-24': this.createPreschoolerRoutine(wakeupTime, napsCount, feedingType, activities)
        };

        return routines[age] || routines['0-3'];
    },

    createNewbornRoutine(wakeupTime, feedingType, activities) {
        const routine = [];
        const baseHour = wakeupTime;

        routine.push({
            time: this.formatTime(baseHour),
            activity: 'الرضاعة',
            icon: '🍼',
            duration: '30 دقيقة',
            notes: feedingType === 'breast' ? 'رضاعة طبيعية' : 'رضاعة صناعية'
        });

        routine.push({
            time: this.formatTime(baseHour + 0.5),
            activity: 'التجشؤ والهدوء',
            icon: '🤱',
            duration: '15 دقيقة',
            notes: 'وضعية عمودية للتجشؤ'
        });

        routine.push({
            time: this.formatTime(baseHour + 1),
            activity: 'وقت النوم',
            icon: '😴',
            duration: '2 ساعة',
            notes: 'نوم في سرير الطفل'
        });

        // إضافة أنشطة إذا كانت مختارة
        if (activities.includes('music')) {
            routine.push({
                time: this.formatTime(baseHour + 3.5),
                activity: 'الاستماع للموسيقى',
                icon: '🎵',
                duration: '20 دقيقة',
                notes: 'موسيقى هادئة للاسترخاء'
            });
        }

        if (activities.includes('massage')) {
            routine.push({
                time: this.formatTime(baseHour + 4),
                activity: 'التدليك',
                icon: '💆',
                duration: '15 دقيقة',
                notes: 'تدليك لطيف بزيت الأطفال'
            });
        }

        return {
            title: 'روتين حديث الولادة (0-3 أشهر)',
            schedule: routine,
            tips: [
                'الرضاعة عند الطلب هي الأفضل في هذه المرحلة',
                'استغلي فترات اليقظة للتواصل البصري واللمس',
                'حافظي على درجة حرارة الغرفة بين 22-24 درجة'
            ],
            totalFeeds: '8-12 مرة يومياً',
            totalSleep: '14-17 ساعة يومياً'
        };
    },

    createInfantRoutine(wakeupTime, napsCount, feedingType, activities) {
        const routine = [];
        const baseHour = wakeupTime;

        routine.push({
            time: this.formatTime(baseHour),
            activity: 'الرضاعة/الفطور',
            icon: '🍼',
            duration: '30 دقيقة',
            notes: feedingType === 'solid' ? 'وجبة فطور + حليب' : 'رضاعة'
        });

        routine.push({
            time: this.formatTime(baseHour + 0.5),
            activity: 'لعب خفيف',
            icon: '🧸',
            duration: '45 دقيقة',
            notes: 'ألعاب بصرية وسمعية'
        });

        routine.push({
            time: this.formatTime(baseHour + 1.25),
            activity: 'قيلولة الصباح',
            icon: '😴',
            duration: '1-2 ساعة',
            notes: 'نوم في غرفة هادئة'
        });

        // إضافة المزيد من الأنشطة حسب العدد المحدد
        if (napsCount >= 3) {
            routine.push({
                time: this.formatTime(baseHour + 3.5),
                activity: 'قيلولة الظهر',
                icon: '😴',
                duration: '1-2 ساعة',
                notes: 'بعد وجبة الغداء'
            });
        }

        if (activities.includes('bath')) {
            routine.push({
                time: this.formatTime(baseHour + 6),
                activity: 'وقت الاستحمام',
                icon: '🛁',
                duration: '20 دقيقة',
                notes: 'ماء دافئ وهدوء'
            });
        }

        return {
            title: 'روتين الرضيع (4-6 أشهر)',
            schedule: routine,
            tips: [
                'ابدأي إدخال الأطعمة الصلبة تدريجياً',
                'حافظي على أوقات نوم منتظمة',
                'شجعي الطفل على التقلب واللعب على البطن'
            ],
            totalFeeds: '5-6 مرات يومياً',
            totalSleep: '12-16 ساعة يومياً'
        };
    },

    createCrawlerRoutine(wakeupTime, napsCount, feedingType, activities) {
        // ... كود مشابه للمراحل الأخرى ...
        return this.createGenericRoutine('الحبو (7-9 أشهر)', wakeupTime, napsCount, activities);
    },

    createToddlerRoutine(wakeupTime, napsCount, feedingType, activities) {
        // ... كود مشابه للمراحل الأخرى ...
        return this.createGenericRoutine('المشي المبكر (10-12 شهر)', wakeupTime, napsCount, activities);
    },

    createWalkerRoutine(wakeupTime, napsCount, feedingType, activities) {
        // ... كود مشابه للمراحل الأخرى ...
        return this.createGenericRoutine('المشي (13-18 شهر)', wakeupTime, napsCount, activities);
    },

    createPreschoolerRoutine(wakeupTime, napsCount, feedingType, activities) {
        // ... كود مشابه للمراحل الأخرى ...
        return this.createGenericRoutine('ما قبل المدرسة (19-24 شهر)', wakeupTime, napsCount, activities);
    },

    createGenericRoutine(title, wakeupTime, napsCount, activities) {
        const routine = [];
        const baseHour = wakeupTime;

        // روتين أساسي
        routine.push({
            time: this.formatTime(baseHour),
            activity: 'الاستيقاظ والفطور',
            icon: '☀️',
            duration: '45 دقيقة',
            notes: 'وجبة فطور متكاملة'
        });

        routine.push({
            time: this.formatTime(baseHour + 1),
            activity: 'لعب حر',
            icon: '🧸',
            duration: '1 ساعة',
            notes: 'لعب حر مع الألعاب المناسبة'
        });

        if (napsCount >= 1) {
            routine.push({
                time: this.formatTime(baseHour + 2),
                activity: 'قيلولة',
                icon: '😴',
                duration: '1-2 ساعة',
                notes: 'نوم هادئ'
            });
        }

        if (activities.includes('outdoor')) {
            routine.push({
                time: this.formatTime(baseHour + 4),
                activity: 'اللعب خارج المنزل',
                icon: '🌳',
                duration: '30 دقيقة',
                notes: 'تعرض لأشعة الشمس الصباحية'
            });
        }

        if (activities.includes('reading')) {
            routine.push({
                time: this.formatTime(baseHour + 6),
                activity: 'قراءة القصص',
                icon: '📚',
                duration: '20 دقيقة',
                notes: 'قصص مصورة'
            });
        }

        return {
            title: title,
            schedule: routine,
            tips: [
                'حافظي على روتين منتظم للنوم',
                'قدمي وجبات صحية ومتنوعة',
                'شجعي الطفل على المشاركة في الأنشطة'
            ],
            totalFeeds: '3 وجبات رئيسية + وجبتان خفيفتان',
            totalSleep: '11-14 ساعة يومياً'
        };
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

        const scheduleHTML = routine.schedule.map((item, index) => `
            <div class="routine-item" style="animation-delay: ${index * 0.1}s">
                <div class="routine-time">
                    <i class="far fa-clock"></i> ${item.time}
                </div>
                <div class="routine-activity">
                    ${item.icon} ${item.activity}
                </div>
                <div class="routine-duration">
                    <i class="fas fa-hourglass-half"></i> ${item.duration}
                </div>
                <div class="routine-notes">
                    ${item.notes}
                </div>
            </div>
        `).join('');

        const tipsHTML = routine.tips.map(tip => `<li>${tip}</li>`).join('');

        resultsDiv.innerHTML = `
            <div class="routine-card">
                <div class="routine-header">
                    <h4><i class="fas fa-calendar-day"></i> ${routine.title}</h4>
                    <div class="routine-stats">
                        <span class="stat">
                            <i class="fas fa-bed"></i> ${routine.totalSleep}
                        </span>
                        <span class="stat">
                            <i class="fas fa-utensils"></i> ${routine.totalFeeds}
                        </span>
                    </div>
                </div>
                
                <div class="routine-timeline">
                    ${scheduleHTML}
                </div>
                
                <div class="routine-footer">
                    <div class="routine-tips">
                        <h5><i class="fas fa-lightbulb"></i> نصائح للالتزام بالروتين:</h5>
                        <ul>${tipsHTML}</ul>
                    </div>
                    
                    <div class="routine-actions">
                        <button class="btn btn-primary" id="save-routine">
                            <i class="fas fa-save"></i> حفظ الروتين
                        </button>
                        <button class="btn btn-secondary" id="print-routine">
                            <i class="fas fa-print"></i> طباعة الروتين
                        </button>
                        <button class="btn btn-success" id="share-routine">
                            <i class="fas fa-share"></i> مشاركة
                        </button>
                    </div>
                </div>
            </div>
        `;

        // ربط الأحداث للأزرار الجديدة
        document.getElementById('save-routine')?.addEventListener('click', () => this.saveRoutine());
        document.getElementById('print-routine')?.addEventListener('click', () => this.printRoutine());
        document.getElementById('share-routine')?.addEventListener('click', () => this.shareRoutine());
    },

    saveRoutine() {
        if (!this.currentRoutine) {
            alert('لا يوجد روتين لحفظه. يرجى إنشاء روتين أولاً.');
            return;
        }

        const routineName = prompt('أدخل اسم للروتين:', `روتين ${this.currentRoutine.config.age}`);

        if (routineName) {
            const routineToSave = {
                name: routineName,
                ...this.currentRoutine,
                savedAt: new Date().toISOString()
            };

            this.savedRoutines.push(routineToSave);
            localStorage.setItem('saved_routines', JSON.stringify(this.savedRoutines));

            alert(`تم حفظ الروتين "${routineName}" بنجاح!`);
        }
    },

    printRoutine() {
        const routineCard = document.querySelector('.routine-card');
        if (routineCard) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html dir="rtl">
                <head>
                    <title>روتين يومي للطفل</title>
                    <style>
                        body { 
                            font-family: 'Cairo', sans-serif; 
                            padding: 20px; 
                            background: white;
                        }
                        .routine-card { 
                            border: 2px solid #4CAF50; 
                            border-radius: 10px; 
                            padding: 20px; 
                            margin: 10px 0;
                        }
                        .routine-header { 
                            text-align: center; 
                            margin-bottom: 20px; 
                            border-bottom: 2px solid #eee; 
                            padding-bottom: 10px;
                        }
                        .routine-item { 
                            display: flex; 
                            justify-content: space-between; 
                            padding: 10px; 
                            border-bottom: 1px dashed #ddd; 
                            margin: 5px 0;
                        }
                        .routine-time { font-weight: bold; color: #2196F3; }
                        .routine-activity { color: #333; }
                        .routine-tips { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; }
                        @media print {
                            .routine-actions { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${routineCard.outerHTML}
                    <p style="text-align: center; color: #666; margin-top: 30px;">
                        تم الإنشاء في: ${new Date().toLocaleString('ar-SA')}
                    </p>
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    },

    shareRoutine() {
        const routineData = this.currentRoutine;
        if (!routineData) {
            alert('لا يوجد روتين للمشاركة');
            return;
        }

        const shareText = `
🎯 روتين يومي للطفل:
${routineData.title}

⏰ الجدول اليومي:
${routineData.schedule.map(item => `${item.time} - ${item.icon} ${item.activity} (${item.duration})`).join('\n')}

💡 نصائح:
${routineData.tips.join('\n')}

🛌 مجموع النوم: ${routineData.totalSleep}
🍼 مجموع الوجبات: ${routineData.totalFeeds}

تم الإنشاء بواسطة تطبيق رعاية الرضع
        `.trim();

        // نسخ إلى الحافظة
        navigator.clipboard.writeText(shareText)
            .then(() => alert('تم نسخ الروتين إلى الحافظة. يمكنك مشاركته الآن.'))
            .catch(() => {
                // طريقة بديلة للمتصفحات القديمة
                const textArea = document.createElement('textarea');
                textArea.value = shareText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('تم نسخ الروتين إلى الحافظة.');
            });
    },

    loadSavedRoutines() {
        const saved = localStorage.getItem('saved_routines');
        if (saved) {
            this.savedRoutines = JSON.parse(saved);
            console.log(`تم تحميل ${this.savedRoutines.length} روتين محفوظ`);
        }
    }
};


/* =========================
   MEDICINE - disabled for child safety
   ========================= */

const Medicine = {
    init() {},
    calculateDose() {
        window.Ri3aya?.announce?.('تم تعطيل حساب الجرعات الشخصية. استشيري طبيب الأطفال أو الصيدلي.', 'info');
    },
    calculateWithFDA() {
        window.Ri3aya?.announce?.('المعلومات الدوائية العامة لا تغني عن الطبيب أو الصيدلي.', 'info');
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
                { time: 'الصباح', food: 'حليب الأم أو الصناعي', amount: 'حسب الرغبة' },
                { time: '10 صباحاً', food: 'أرز مطحون مع حليب', amount: '2-3 ملاعق' },
                { time: 'الظهر', food: 'خضار مهروسة (جزر، كوسا)', amount: '2-3 ملاعق' },
                { time: 'المساء', food: 'حليب', amount: 'حسب الرغبة' },
                { time: 'قبل النوم', food: 'حليب', amount: 'حسب الرغبة' }
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
                { time: 'الصباح', food: 'حليب + عصيدة', amount: '½ كوب' },
                { time: '10 صباحاً', food: 'فاكهة مهروسة', amount: '¼ كوب' },
                { time: 'الظهر', food: 'لحوم بيضاء مهروسة مع خضار', amount: '½ كوب' },
                { time: 'العصر', food: 'زبادي', amount: '¼ كوب' },
                { time: 'المساء', food: 'حليب', amount: 'حسب الرغبة' }
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
            return { ...meal, food };
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
            probabilities.push({ reason: 'المغص', probability: 0.7 });
            probabilities.push({ reason: 'الجوع', probability: 0.6 });
            probabilities.push({ reason: 'التعب', probability: 0.5 });
            probabilities.push({ reason: 'الحاجة للتجشؤ', probability: 0.4 });

            recommendations = [
                'حاولي تهدئة الطفل بالهز الخفيف',
                'تأكدي من شبع الطفل',
                'جربي وضعية التجشؤ',
                'استخدمي الضوضاء البيضاء'
            ];
        }
        else if (state.age === '4-6') {
            probabilities.push({ reason: 'التسنين', probability: 0.6 });
            probabilities.push({ reason: 'الملل', probability: 0.5 });
            probabilities.push({ reason: 'الحاجة للنوم', probability: 0.4 });

            recommendations = [
                'استخدمي العضاضة المبردة',
                'قدمي ألعاباً جديدة',
                'حافظي على روتين النوم'
            ];
        }

        // تحليل حسب نوع البكاء
        if (state.cryType === 'high-pitched') {
            probabilities.push({ reason: 'الألم', probability: 0.8 });
            medicalAdvice = 'البكاء الحاد قد يدل على ألم شديد، راجعي الطبيب فوراً';
        }

        if (state.cryType === 'weak') {
            probabilities.push({ reason: 'التعب الشديد', probability: 0.7 });
            recommendations.push('قدمي فرصة للنوم مباشرة');
        }

        // تحليل حسب التوقيت
        if (state.timing === 'evening') {
            probabilities.push({ reason: 'مغص المساء', probability: 0.9 });
            recommendations.push('استخدمي حماماً دافئاً قبل المساء');
        }

        // تحليل الأعراض
        if (state.symptoms.includes('fever')) {
            probabilities.push({ reason: 'مرض', probability: 0.9 });
            medicalAdvice = 'ارتفاع الحرارة مع البكاء يتطلب مراجعة طبية عاجلة';
        }

        // تصنيف الاحتمالات وتصفيتها
        const filteredProbs = probabilities
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 5);

        // إضافة أسباب عامة إذا كانت الاحتمالات قليلة
        if (filteredProbs.length < 3) {
            filteredProbs.push(
                { reason: 'الحاجة للاهتمام', probability: 0.3 },
                { reason: 'عدم الراحة', probability: 0.3 }
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
    reader.onload = function (e) {
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
window.CryGuide = CryGuide;
window.CryAI = CryGuide;
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
    CryGuide.init();
            Routine.init();
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
        btn.addEventListener('click', function () {
            CryGuide.selectOption('age', this.dataset.age);
        });
    });

    const timingOptions = document.querySelectorAll('.timing-option');
    timingOptions.forEach(btn => {
        btn.addEventListener('click', function () {
            CryGuide.selectOption('timing', this.dataset.timing);
        });
    });

    const cryOptions = document.querySelectorAll('.cry-option');
    cryOptions.forEach(btn => {
        btn.addEventListener('click', function () {
            CryGuide.selectOption('cryType', this.dataset.cry);
        });
    });

    // تحديث حالة التبويبات الفرعية للنمو
    const trackerTabs = document.querySelectorAll('.tracker-tab');
    trackerTabs.forEach(tab => {
        tab.addEventListener('click', function () {
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
        btn.addEventListener('click', function () {
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
        cb.addEventListener('change', function () {
            CryGuide.toggleSymptom(this.dataset.symptom, this.checked);
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
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('click', function () {
    if (!Alerts.notificationPermission && Notification.permission === 'default') {
        Alerts.requestNotificationPermission();
    }
});

/* =========================
   تعزيز واجهة المستخدم
   ========================= */

// إضافة تأثيرات عند التفاعل
document.addEventListener('DOMContentLoaded', function () {
    // تأثيرات لأزرار التبويبات
    const toolTabs = document.querySelectorAll('.tool-tab');
    toolTabs.forEach(tab => {
        tab.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
        });

        tab.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // تأثيرات لأزرار الأدوات السريعة
    const quickToolBtns = document.querySelectorAll('.btn-tool-quick');
    quickToolBtns.forEach(btn => {
        btn.addEventListener('mouseenter', function () {
            this.style.transform = 'scale(1.05)';
        });

        btn.addEventListener('mouseleave', function () {
            this.style.transform = 'scale(1)';
        });
    });
});

/* =========================
   تحسينات الوصولية
   ========================= */

// دعم مفاتيح لوحة المفاتيح
document.addEventListener('keydown', function (e) {
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
    exportAllData: function () {
        console.log('تصدير البيانات...');
        // تنفيذ التصدير
    },

    importData: function (event) {
        console.log('استيراد البيانات...');
        // تنفيذ الاستيراد
    },

    clearAllData: function () {
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







