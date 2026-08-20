(function () {
    'use strict';

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

    window.Ri3ayaRoutine = Routine;
    document.addEventListener('DOMContentLoaded', () => Routine.init());
})();
