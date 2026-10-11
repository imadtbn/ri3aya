(function () {
    'use strict';
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const Routine = {
    currentRoutine: null,
    savedRoutines: [],

    init() {


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
        window.addEventListener('ri3aya-data-change', event => { if (!event.detail.key || event.detail.key === 'saved_routines') this.loadSavedRoutines(); });
    },

    generateRoutine() {


        // جمع البيانات من النموذج
        const age = document.getElementById('routine-age')?.value || '0-3';
        const timeField = document.getElementById('routine-wakeup');
        if (!timeField.reportValidity()) return;
        const [hour, minute] = timeField.value.split(':').map(Number);
        const wakeup = hour + minute / 60;
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
        let routine;
        try { routine = this.createRoutine(age, wakeup, naps, feeding, activities); }
        catch (error) { window.Ri3ayaLocal.notify(error.message); return; }

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
        const ages = ['0-3', '4-6', '7-9', '10-12', '13-18', '19-24'];
        const optional = {
            outdoor: ['🌳', 'وقت خارج المنزل', 'مكان مناسب للعمر مع مراقبة مستمرة'],
            reading: ['📚', 'قراءة وتواصل', 'اختاري قصة أو تواصلًا مناسبًا للعمر'],
            music: ['🎵', 'موسيقى هادئة', 'توقفي إذا انزعج الطفل'],
            bath: ['🛁', 'استحمام آمن', 'مراقبة مستمرة طوال الاستحمام'],
            massage: ['🤲', 'تواصل لمسي لطيف', 'بحسب تقبل الطفل']
        };
        if (!ages.includes(age) || !Number.isFinite(wakeupTime) || wakeupTime < 0 || wakeupTime >= 24 || !Number.isInteger(napsCount) || napsCount < 1 || napsCount > 4 || !['breast', 'solid'].includes(feedingType) || !Array.isArray(activities) || activities.some(a => !Object.hasOwn(optional, a))) {
            throw new Error('تحققي من إعدادات العمر والوقت وعدد القيلولات والأنشطة.');
        }
        const blocks = [{ icon: '🍼', activity: 'الحليب والتغذية', notes: feedingType === 'solid' ? 'طعام تكميلي مناسب للعمر مع الحليب؛ راجعي دليل التغذية' : 'الحليب حسب احتياجات الطفل؛ لا تؤخري الرضعة بسبب الجدول' },
            { icon: '🧸', activity: 'لعب وتواصل', notes: 'لعب مناسب للعمر أثناء اليقظة وتحت المراقبة' }];
        const selected = [...new Set(activities)].map(key => ({ icon: optional[key][0], activity: optional[key][1], notes: optional[key][2] }));
        for (let n = 0; n < Math.max(napsCount, selected.length); n++) {
            if (n < napsCount) blocks.push({ icon: '😴', activity: `قيلولة ${n + 1}`, notes: 'قدّمي النوم أو أخريه حسب حاجة الطفل، واتبعي دليل النوم الآمن' });
            if (selected[n]) blocks.push(selected[n]);
        }
        return {
            title: `روتين مرن — من ${age.split('-')[0]} إلى ${age.split('-')[1]} شهرًا`,
            schedule: blocks.map((block, index) => ({ ...block, time: this.formatTime(wakeupTime + index * 1.5), duration: 'مرنة حسب حاجة الطفل' })),
            tips: ['الأوقات أمثلة تنظيمية قابلة للتغيير، ولا تحدد مواعيد الرضاعة أو مدد النوم.', 'عدد القيلولات يعكس اختيارك، وليس توصية طبية.', 'تجاوز الجدول عند ظهور علامات الجوع أو التعب أو المرض.'],
            totalFeeds: 'التغذية حسب حاجة الطفل',
            totalSleep: `${napsCount} قيلولات اخترتها؛ المدة مرنة`
        };
    },

    formatTime(hour) {
        const total = Math.round(hour * 60);
        const day = Math.floor(total / 1440);
        const minutes = ((total % 1440) + 1440) % 1440;
        const h = Math.floor(minutes / 60);
        return `${String(h).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}${day ? ` (+${day} يوم)` : ''}`;
    },

    restoreConfig(config = {}) {
        for (const [id, value] of [['routine-age', config.age], ['routine-naps', config.naps], ['routine-feeding', config.feeding]]) {
            const field = document.getElementById(id);
            if (field && [...field.options].some(o => o.value === String(value))) field.value = String(value);
        }
        if (Number.isFinite(config.wakeup) && config.wakeup >= 0 && config.wakeup < 24) document.getElementById('routine-wakeup').value = this.formatTime(config.wakeup);
        document.querySelectorAll('[id^="activity-"]').forEach(field => { field.checked = Array.isArray(config.activities) && config.activities.includes(field.id.replace('activity-', '')); });
    },

    displayRoutine(routine) {
        const resultsDiv = document.getElementById('routine-results');
        if (!resultsDiv) return;

        const scheduleHTML = routine.schedule.map((item, index) => `
            <div class="routine-item" style="animation-delay: ${index * 0.1}s">
                <div class="routine-time">
                    <i class="far fa-clock"></i> <bdi dir="ltr">${escape(item.time)}</bdi>
                </div>
                <div class="routine-activity">
                    ${escape(item.icon)} ${escape(item.activity)}
                </div>
                <div class="routine-duration">
                    <i class="fas fa-hourglass-half"></i> ${escape(item.duration)}
                </div>
                <div class="routine-notes">
                    ${escape(item.notes)}
                </div>
            </div>
        `).join('');

        const tipsHTML = routine.tips.map(tip => `<li>${escape(tip)}</li>`).join('');

        resultsDiv.innerHTML = `
            <div class="routine-card">
                <div class="routine-header">
                    <h4><i class="fas fa-calendar-day"></i> ${escape(routine.title)}</h4>
                    <div class="routine-stats">
                        <span class="stat">
                            <i class="fas fa-bed"></i> ${escape(routine.totalSleep)}
                        </span>
                        <span class="stat">
                            <i class="fas fa-utensils"></i> ${escape(routine.totalFeeds)}
                        </span>
                    </div>
                </div>
                
                <div class="routine-timeline">
                    ${scheduleHTML}
                </div>
                
                <div class="routine-footer">
                    <div class="routine-tips">
                        <h5><i class="fas fa-lightbulb"></i> إرشادات استخدام الروتين:</h5>
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

        if (routineName !== null && routineName.trim()) {
            if (routineName.trim().length > 120) { window.Ri3ayaLocal.notify('اسم الروتين لا يتجاوز 120 حرفًا.'); return; }
            const routineToSave = { ...this.currentRoutine, name: routineName.trim(), savedAt: new Date().toISOString() };
            const result = window.Ri3ayaLocal.add('saved_routines', routineToSave);
            window.Ri3ayaLocal.notify(result.ok ? 'تم حفظ الروتين محليًا. يمكنك فتحه من القائمة المحفوظة.' : result.error);
        }
    },

    printRoutine() {
        const routineCard = document.querySelector('.routine-card');
        if (routineCard) {
            const printWindow = window.open('', '_blank');
            if (!printWindow) { window.Ri3ayaLocal.notify('تعذر فتح نافذة الطباعة. اسمحي بالنوافذ المنبثقة ثم حاولي مجددًا.'); return; }
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

🛌 تنظيم النوم: ${routineData.totalSleep}
🍼 التغذية: ${routineData.totalFeeds}

تم الإنشاء بواسطة تطبيق رعاية الرضع
        `.trim();

        // Clipboard permissions can be unavailable; leave a selectable manual copy.
        Promise.resolve().then(() => navigator.clipboard.writeText(shareText))
            .then(() => window.Ri3ayaLocal.notify('تم نسخ الروتين إلى الحافظة.'))
            .catch(() => {
                let textArea = document.getElementById('routine-share-copy');
                if (!textArea) { textArea = document.createElement('textarea'); textArea.id = 'routine-share-copy'; textArea.readOnly = true; textArea.setAttribute('aria-label', 'نص الروتين للنسخ اليدوي'); textArea.style.width = '100%'; textArea.rows = 8; document.getElementById('routine-results').append(textArea); }
                textArea.value = shareText; textArea.focus(); textArea.select();
                window.Ri3ayaLocal.notify('تعذر النسخ التلقائي. انسخي النص من الحقل الظاهر.');
            });
    },

    loadSavedRoutines() {
        const snapshot = window.Ri3ayaLocal.read('saved_routines');
        this.savedRoutines = snapshot.ok ? snapshot.records : [];
        let section = document.getElementById('saved-routines');
        if (!section) {
            section = document.createElement('section'); section.id = 'saved-routines'; section.setAttribute('aria-label', 'الروتينات المحفوظة');
            document.getElementById('local-data-panel').after(section);
        }
        section.replaceChildren();
        const heading = document.createElement('h2'); heading.textContent = 'روتيناتك المحفوظة'; section.append(heading);
        if (!snapshot.ok || !this.savedRoutines.length) {
            const note = document.createElement('p'); note.textContent = snapshot.ok ? 'لا توجد روتينات محفوظة بعد.' : snapshot.error; section.append(note); return;
        }
        this.savedRoutines.forEach(record => {
            const card = document.createElement('article'); card.className = 'saved-routine-card';
            const title = document.createElement('h3'); title.textContent = record.name;
            const meta = document.createElement('p'); meta.textContent = `${record.title} · ${new Date(record.savedAt).toLocaleDateString('ar-DZ')}`;
            const actions = document.createElement('div'); actions.className = 'saved-routine-actions';
            const open = document.createElement('button'); open.type = 'button'; open.className = 'btn btn-primary'; open.textContent = 'عرض الروتين';
            open.addEventListener('click', () => { this.currentRoutine = record; this.restoreConfig(record.config); this.displayRoutine(record); document.getElementById('routine-results').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); });
            const del = document.createElement('button'); del.type = 'button'; del.className = 'btn tracker-delete'; del.textContent = 'حذف';
            del.addEventListener('click', () => { if (!confirm(`حذف الروتين «${record.name}»؟`)) return; const r = window.Ri3ayaLocal.removeRecord('saved_routines', record); window.Ri3ayaLocal.notify(r.ok ? 'تم حذف الروتين المحفوظ.' : r.error); });
            actions.append(open, del); card.append(title, meta, actions); section.append(card);
        });
    }

};

    window.Ri3ayaRoutine = Routine;
    document.addEventListener('DOMContentLoaded', () => Routine.init());
})();
