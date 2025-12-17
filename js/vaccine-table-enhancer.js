// vaccine-table-enhancer.js - محسن جدول التطعيمات

class VaccineTableEnhancer {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        this.setupHighContrastMode();
        this.setupVaccineDetails();
        this.setupTimelineView();
        this.setupExportOptions();
        this.setupReminderSystem();
    }
    
    setupHighContrastMode() {
        // تفعيل وضع التباين العالي
        const contrastToggle = document.createElement('button');
        contrastToggle.className = 'contrast-toggle';
        contrastToggle.innerHTML = '<i class="fas fa-adjust"></i> وضع التباين العالي';
        contrastToggle.title = 'تبديل وضع التباين العالي';
        
        contrastToggle.addEventListener('click', () => {
            document.body.classList.toggle('high-contrast-mode');
            contrastToggle.classList.toggle('active');
            
            const icon = contrastToggle.querySelector('i');
            if (document.body.classList.contains('high-contrast-mode')) {
                icon.className = 'fas fa-sun';
                contrastToggle.innerHTML = '<i class="fas fa-sun"></i> الوضع العادي';
                this.savePreference('highContrast', true);
            } else {
                icon.className = 'fas fa-adjust';
                contrastToggle.innerHTML = '<i class="fas fa-adjust"></i> وضع التباين العالي';
                this.savePreference('highContrast', false);
            }
        });
        
        // إضافة زر التحكم في التباين
        const controls = document.querySelector('.schedule-actions') || document.querySelector('.calculator-results');
        if (controls) {
            controls.insertBefore(contrastToggle, controls.firstChild);
        }
        
        // تحميل التفضيل المحفوظ
        if (this.getPreference('highContrast') === 'true') {
            document.body.classList.add('high-contrast-mode');
            contrastToggle.classList.add('active');
            contrastToggle.innerHTML = '<i class="fas fa-sun"></i> الوضع العادي';
        }
    }
    
    setupVaccineDetails() {
        // إضافة تفاصيل عند النقر على التطعيم
        document.addEventListener('click', (e) => {
            const vaccineCell = e.target.closest('.schedule-cell.vaccine');
            if (vaccineCell) {
                this.showVaccineDetails(vaccineCell.textContent.trim());
            }
            
            const statusCell = e.target.closest('.status');
            if (statusCell) {
                this.showStatusDetails(statusCell);
            }
        });
    }
    
    setupTimelineView() {
        // تبديل بين عرض الجدول وعرض المخطط الزمني
        const viewToggle = document.createElement('button');
        viewToggle.className = 'view-toggle';
        viewToggle.innerHTML = '<i class="fas fa-chart-bar"></i> عرض المخطط الزمني';
        
        viewToggle.addEventListener('click', () => {
            const table = document.querySelector('.schedule-table');
            const timeline = document.querySelector('.vaccine-timeline');
            
            if (timeline) {
                timeline.remove();
                viewToggle.innerHTML = '<i class="fas fa-chart-bar"></i> عرض المخطط الزمني';
            } else {
                this.createTimelineView();
                viewToggle.innerHTML = '<i class="fas fa-table"></i> عرض الجدول';
            }
        });
        
        // إضافة زر تبديل العرض
        const header = document.querySelector('.schedule-header');
        if (header) {
            header.appendChild(viewToggle);
        }
    }
    
    createTimelineView() {
        const schedule = this.getVaccineSchedule();
        const container = document.querySelector('.vaccine-schedule');
        
        const timeline = document.createElement('div');
        timeline.className = 'vaccine-timeline';
        
        const track = document.createElement('div');
        track.className = 'timeline-track';
        
        schedule.forEach((vaccine, index) => {
            const marker = document.createElement('div');
            marker.className = `timeline-marker ${vaccine.status}`;
            marker.style.left = `${(index / (schedule.length - 1)) * 100}%`;
            marker.title = `${vaccine.age} - ${vaccine.name}`;
            
            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = vaccine.age;
            
            marker.appendChild(label);
            track.appendChild(marker);
        });
        
        timeline.appendChild(track);
        container.appendChild(timeline);
    }
    
    getVaccineSchedule() {
        const rows = document.querySelectorAll('.schedule-row:not(.header)');
        return Array.from(rows).map(row => ({
            age: row.querySelector('.age').textContent,
            name: row.querySelector('.vaccine').textContent,
            status: row.querySelector('.status').className.includes('completed') ? 'completed' :
                   row.querySelector('.status').className.includes('upcoming') ? 'upcoming' : 'overdue'
        }));
    }
    
    showVaccineDetails(vaccineName) {
        // إنشاء نافذة تفاصيل التطعيم
        const details = document.createElement('div');
        details.className = 'vaccine-details-popup';
        
        const vaccineInfo = this.getVaccineInfo(vaccineName);
        
        details.innerHTML = `
            <div class="popup-content">
                <h4><i class="fas fa-syringe"></i> ${vaccineName}</h4>
                <div class="vaccine-info-grid">
                    ${vaccineInfo.map(info => `
                        <div class="vaccine-info-item">
                            <span class="vaccine-info-label">${info.label}</span>
                            <span class="vaccine-info-value">${info.value}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-sm btn-secondary close-popup">إغلاق</button>
            </div>
        `;
        
        document.body.appendChild(details);
        
        // إغلاق النافذة
        details.querySelector('.close-popup').addEventListener('click', () => {
            details.remove();
        });
        
        // إغلاق عند النقر خارج النافذة
        details.addEventListener('click', (e) => {
            if (e.target === details) {
                details.remove();
            }
        });
    }
    
    getVaccineInfo(vaccineName) {
        // معلومات التطعيمات (يمكن توسيعها)
        const vaccineDatabase = {
            'السل (BCG) + التهاب الكبد ب (الجرعة الأولى)': [
                { label: 'العمر الموصى', value: 'عند الولادة' },
                { label: 'الجرعات', value: 'جرعة واحدة' },
                { label: 'طريقة التطعيم', value: 'حقنة عضلية' },
                { label: 'الحماية من', value: 'السل والتهاب الكبد ب' }
            ],
            'الخماسي (الجرعة الأولى) + شلل الأطفال الفموي + الروتا': [
                { label: 'العمر الموصى', value: 'شهران' },
                { label: 'الجرعات', value: '3 جرعات' },
                { label: 'طريقة التطعيم', value: 'حقنة عضلية + فموي' },
                { label: 'الحماية من', value: 'الدفتيريا، الكزاز، السعال الديكي، شلل الأطفال، الإنفلونزا البكتيرية' }
            ]
            // إضافة بقية التطعيمات...
        };
        
        return vaccineDatabase[vaccineName] || [
            { label: 'معلومات', value: 'لمزيد من المعلومات استشيري الطبيب' }
        ];
    }
    
    setupExportOptions() {
        // إضافة خيارات تصدير متقدمة
        const exportBtn = document.querySelector('button[onclick="printVaccineSchedule()"]');
        if (exportBtn) {
            exportBtn.onclick = null;
            exportBtn.addEventListener('click', () => {
                this.showExportOptions();
            });
        }
    }
    
    showExportOptions() {
        const options = document.createElement('div');
        options.className = 'export-options';
        options.innerHTML = `
            <div class="export-popup">
                <h5><i class="fas fa-download"></i> تصدير جدول التطعيمات</h5>
                <div class="export-buttons">
                    <button class="btn btn-primary export-pdf">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-primary export-png">
                        <i class="fas fa-image"></i> صورة
                    </button>
                    <button class="btn btn-primary export-csv">
                        <i class="fas fa-file-csv"></i> CSV
                    </button>
                    <button class="btn btn-secondary close-export">إلغاء</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(options);
        
        // تفعيل أزرار التصدير
        options.querySelector('.export-pdf').addEventListener('click', () => this.exportAsPDF());
        options.querySelector('.export-png').addEventListener('click', () => this.exportAsPNG());
        options.querySelector('.export-csv').addEventListener('click', () => this.exportAsCSV());
        options.querySelector('.close-export').addEventListener('click', () => options.remove());
        
        // إغلاق عند النقر خارج النافذة
        options.addEventListener('click', (e) => {
            if (e.target === options) {
                options.remove();
            }
        });
    }
    
    exportAsPDF() {
        // منطق تصدير PDF
        alert('جاري تحضير ملف PDF...');
        // window.print(); // يمكن استخدام الطباعة لإنشاء PDF
    }
    
    exportAsPNG() {
        // منطق تصدير صورة
        alert('جاري تصدير الصورة...');
    }
    
    exportAsCSV() {
        const schedule = this.getVaccineSchedule();
        const csvContent = [
            ['العمر', 'التطعيم', 'الحالة'],
            ...schedule.map(v => [v.age, v.name, v.status === 'completed' ? 'مكتمل' : v.status === 'upcoming' ? 'قادم' : 'متأخر'])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'جدول-التطعيمات.csv';
        link.click();
    }
    
    setupReminderSystem() {
        // إضافة نظام تذكيرات
        const reminderBtn = document.createElement('button');
        reminderBtn.className = 'reminder-setup';
        reminderBtn.innerHTML = '<i class="fas fa-bell"></i> تفعيل التذكيرات';
        
        reminderBtn.addEventListener('click', () => {
            this.setupVaccineReminders();
        });
        
        // إضافة زر التذكيرات
        const actions = document.querySelector('.schedule-actions');
        if (actions) {
            actions.appendChild(reminderBtn);
        }
    }
    
    setupVaccineReminders() {
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.scheduleVaccineNotifications();
                    alert('تم تفعيل التذكيرات بنجاح!');
                }
            });
        }
    }
    
    savePreference(key, value) {
        localStorage.setItem(`vaccine_${key}`, value);
    }
    
    getPreference(key) {
        return localStorage.getItem(`vaccine_${key}`);
    }
}

// تهيئة محسن الجدول عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new VaccineTableEnhancer();
});

// تحسينات إضافية لوظائف الجدول
function enhanceVaccineTable() {
    // إضافة مؤشرات وصول
    const rows = document.querySelectorAll('.schedule-row:not(.header)');
    rows.forEach((row, index) => {
        row.setAttribute('role', 'row');
        row.setAttribute('aria-rowindex', index + 2);
        
        const cells = row.querySelectorAll('.schedule-cell');
        cells.forEach((cell, cellIndex) => {
            cell.setAttribute('role', 'cell');
            cell.setAttribute('aria-colindex', cellIndex + 1);
        });
    });
    
    // إضافة وصف للجدول
    const table = document.querySelector('.schedule-table');
    if (table) {
        table.setAttribute('role', 'table');
        table.setAttribute('aria-label', 'جدول تطعيمات الطفل');
        
        const header = document.querySelector('.schedule-row.header');
        if (header) {
            header.setAttribute('role', 'rowgroup');
            header.querySelectorAll('.schedule-cell').forEach(cell => {
                cell.setAttribute('role', 'columnheader');
            });
        }
    }
    
    // إضافة ألوان مميزة حسب الحالة مع التباين العالي
    const statusCells = document.querySelectorAll('.status');
    statusCells.forEach(cell => {
        const status = cell.textContent.trim();
        const contrastColors = {
            'مكتمل': { bg: '#d4edda', text: '#0a5c0a', border: '#28a745' },
            'قادم': { bg: '#fff3cd', text: '#856404', border: '#ffc107' },
            'متأخر': { bg: '#f8d7da', text: '#721c24', border: '#dc3545' }
        };
        
        const colors = contrastColors[status] || { bg: '#e9ecef', text: '#495057', border: '#6c757d' };
        
        cell.style.backgroundColor = colors.bg;
        cell.style.color = colors.text;
        cell.style.borderColor = colors.border;
        cell.style.borderWidth = '2px';
        cell.style.borderStyle = 'solid';
        cell.style.fontWeight = '600';
    });
}

// تفعيل التحسينات عند إنشاء الجدول
function createEnhancedVaccineTable(schedule) {
    const tableHTML = `
        <div class="vaccine-schedule" role="region" aria-label="جدول تطعيمات الطفل">
            <div class="schedule-header">
                <h4><i class="fas fa-calendar-check"></i> جدول التطعيمات</h4>
                <div class="progress-summary">
                    <div class="progress-stats">
                        <div class="progress-stat completed">
                            <span class="stat-count">${schedule.filter(v => v.status === 'completed').length}</span>
                            <span class="stat-label">مكتمل</span>
                        </div>
                        <div class="progress-stat upcoming">
                            <span class="stat-count">${schedule.filter(v => v.status === 'upcoming').length}</span>
                            <span class="stat-label">قادم</span>
                        </div>
                        <div class="progress-stat overdue">
                            <span class="stat-count">${schedule.filter(v => v.status === 'overdue').length}</span>
                            <span class="stat-label">متأخر</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="vaccine-alerts">
                <h5><i class="fas fa-exclamation-circle"></i> ملاحظات مهمة</h5>
                <ul>
                    <li>جميع التواريخ تقريبية - استشيري طبيب الأطفال</li>
                    <li>يجب تأجيل التطعيم إذا كان الطفل مريضاً</li>
                    <li>احتفظي بسجل التطعيمات دائماً</li>
                </ul>
            </div>
            
            <div class="schedule-table" role="table">
                <div class="schedule-row header" role="rowgroup">
                    <div class="schedule-cell" role="columnheader">العمر</div>
                    <div class="schedule-cell" role="columnheader">التطعيم</div>
                    <div class="schedule-cell" role="columnheader">الحالة</div>
                </div>
                
                ${schedule.map((vaccine, index) => `
                    <div class="schedule-row" role="row" aria-rowindex="${index + 2}">
                        <div class="schedule-cell age" role="cell" aria-colindex="1">${vaccine.age}</div>
                        <div class="schedule-cell vaccine" role="cell" aria-colindex="2">${vaccine.name}</div>
                        <div class="schedule-cell status ${vaccine.status}" role="cell" aria-colindex="3">
                            <span class="sr-only">حالة التطعيم: </span>
                            ${vaccine.status === 'completed' ? 'مكتمل' : vaccine.status === 'upcoming' ? 'قادم' : 'متأخر'}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="vaccine-booklet">
                <div class="vaccine-details">
                    <h5><i class="fas fa-info-circle"></i> معلومات عامة</h5>
                    <div class="vaccine-info-grid">
                        <div class="vaccine-info-item">
                            <span class="vaccine-info-label">آخر تحديث</span>
                            <span class="vaccine-info-value">${new Date().toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div class="vaccine-info-item">
                            <span class="vaccine-info-label">عدد التطعيمات</span>
                            <span class="vaccine-info-value">${schedule.length}</span>
                        </div>
                        <div class="vaccine-info-item">
                            <span class="vaccine-info-label">المصدر</span>
                            <span class="vaccine-info-value">وزارة الصحة</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="schedule-actions">
                <button class="btn btn-secondary" onclick="window.print()">
                    <i class="fas fa-print"></i> طباعة الجدول
                </button>
                <button class="btn btn-secondary" onclick="saveVaccineSchedule()">
                    <i class="fas fa-bell"></i> تفعيل التذكيرات
                </button>
                <button class="btn btn-secondary" onclick="shareVaccineSchedule()">
                    <i class="fas fa-share-alt"></i> مشاركة
                </button>
            </div>
        </div>
    `;
    
    return tableHTML;
}