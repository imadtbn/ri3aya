        document.addEventListener('DOMContentLoaded', function() {
            // تفعيل البحث عن الأمراض
            const diseaseTags = document.querySelectorAll('.disease-tag');
            const diseaseContents = document.querySelectorAll('.disease-content');
            const searchInput = document.getElementById('disease-search');
            
            // تفعيل علامات الأمراض
            diseaseTags.forEach(tag => {
                tag.addEventListener('click', () => {
                    // إزالة النشاط من جميع العلامات
                    diseaseTags.forEach(t => t.classList.remove('active'));
                    // إضافة النشاط للعلامة الحالية
                    tag.classList.add('active');
                    
                    const diseaseId = tag.getAttribute('data-disease');
                    
                    // إخفاء جميع المحتويات
                    diseaseContents.forEach(content => content.classList.remove('active'));
                    // إظهار المحتوى المطلوب
                    document.getElementById(`${diseaseId}-content`).classList.add('active');
                    
                    // التمرير إلى المحتوى
                    document.getElementById(`${diseaseId}-content`).scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                });
            });
            
            // تفعيل البحث النصي
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                
                diseaseTags.forEach(tag => {
                    const diseaseName = tag.textContent.toLowerCase();
                    const diseaseId = tag.getAttribute('data-disease');
                    
                    if (diseaseName.includes(searchTerm) || diseaseId.includes(searchTerm)) {
                        tag.style.display = 'inline-block';
                    } else {
                        tag.style.display = 'none';
                    }
                });
            });
            
            // تفعيل أزرار درجة الحرارة
            const tempButtons = document.querySelectorAll('.temp-btn');
            const tempInput = document.getElementById('temperature');
            
            tempButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const tempValue = this.getAttribute('data-temp');
                    tempInput.value = tempValue;
                });
            });
            
            // تفعيل مساعد تقييم الأعراض
            const checkSymptomsBtn = document.getElementById('check-symptoms');
            
            checkSymptomsBtn.addEventListener('click', function() {
                evaluateSymptoms();
            });
            
            // تفعيل الأسئلة الشائعة
            const faqQuestions = document.querySelectorAll('.faq-question');
            
            faqQuestions.forEach(question => {
                question.addEventListener('click', () => {
                    const answer = question.nextElementSibling;
                    const icon = question.querySelector('i');
                    
                    // إغلاق جميع الإجابات الأخرى
                    document.querySelectorAll('.faq-answer').forEach(item => {
                        if (item !== answer && item.classList.contains('active')) {
                            item.classList.remove('active');
                            item.previousElementSibling.querySelector('i').classList.remove('fa-chevron-up');
                            item.previousElementSibling.querySelector('i').classList.add('fa-chevron-down');
                        }
                    });
                    
                    // تبديل الإجابة الحالية
                    answer.classList.toggle('active');
                    icon.classList.toggle('fa-chevron-down');
                    icon.classList.toggle('fa-chevron-up');
                });
            });
            
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
            
            // تقييم افتراضي عند تحميل الصفحة
            evaluateSymptoms();
        });
        
        // دالة تقييم الأعراض
        function evaluateSymptoms() {
            const age = document.getElementById('child-age-symptoms').value;
            const temperature = parseFloat(document.getElementById('temperature').value) || 37.5;
            
            // جمع الأعراض المختارة
            const selectedSymptoms = [];
            document.querySelectorAll('input[name="symptoms"]:checked').forEach(checkbox => {
                selectedSymptoms.push(checkbox.value);
            });
            
            // تحليل النتائج
            let severity = 'low';
            let recommendation = '';
            let actions = [];
            
            // تحليل درجة الحرارة
            if (age === '0-3' && temperature >= 38) {
                severity = 'high';
                recommendation = 'تحذير: الرضع أقل من 3 أشهر مع حرارة 38°م أو أكثر يحتاجون تقييم طبي فوري. اذهبي للطوارئ الآن.';
                actions = [
                    'اذهبي إلى أقرب طوارئ أطفال فوراً',
                    'لا تعطي أي دواء قبل استشارة الطبيب',
                    'راقبي تنفس الطفل ووعيه'
                ];
            } else if (temperature >= 39.5) {
                severity = 'high';
                recommendation = 'درجة الحرارة مرتفعة جداً. استشيري الطبيب فوراً أو اذهبي للطوارئ.';
                actions = [
                    'اعطي خافض حرارة مناسب للعمر',
                    'استخدمي كمادات فاترة',
                    'استشيري الطبيب أو اذهبي للطوارئ'
                ];
            } else if (temperature >= 38.5) {
                severity = 'medium';
                recommendation = 'درجة الحرارة مرتفعة. راقبي الطفل جيداً واستشيري الطبيب إذا استمرت.';
                actions = [
                    'اعطي خافض حرارة مناسب للعمر',
                    'راقبي درجة الحرارة كل 4 ساعات',
                    'أكثري من السوائل والرضاعة',
                    'استشيري الطبيب إذا استمرت الحرارة أكثر من 48 ساعة'
                ];
            } else {
                severity = 'low';
                recommendation = 'درجة الحرارة طبيعية أو مرتفعة قليلاً.';
                actions = [
                    'راقبي درجة الحرارة بانتظام',
                    'أكثري من السوائل والرضاعة',
                    'استشيري الطبيب إذا ظهرت أعراض جديدة'
                ];
            }
            
            // تحليل الأعراض الإضافية
            if (selectedSymptoms.length > 0) {
                if (selectedSymptoms.includes('lethargy') || selectedSymptoms.includes('poor-feeding')) {
                    if (severity !== 'high') severity = 'medium';
                    recommendation += ' الخمول وضعف الرضاعة علامات خطيرة خاصة عند الرضع.';
                    actions.push('راقبي مستوى نشاط الطفل واستشيري الطبيب إذا استمر الخمول');
                }
                
                if (selectedSymptoms.includes('vomiting') && selectedSymptoms.includes('diarrhea')) {
                    if (severity !== 'high') severity = 'medium';
                    recommendation += ' القيء والإسهال قد يسببان الجفاف سريعاً.';
                    actions.push('استخدمي محاليل معالجة الجفاف الفموية');
                    actions.push('راقبي علامات الجفاف (قلة التبول، جفاف الفم)');
                }
                
                if (selectedSymptoms.includes('rash')) {
                    recommendation += ' الطفح الجلدي يحتاج تقييم طبي لمعرفة سببه.';
                    actions.push('صوري الطفح الجلدي لتظهريه للطبيب');
                    actions.push('تجنبي حك أو خدش الطفح');
                }
            }
            
            // تحديد لون النتيجة
            let resultClass = '';
            let resultIcon = '';
            if (severity === 'high') {
                resultClass = 'result-high';
                resultIcon = 'fa-exclamation-circle';
            } else if (severity === 'medium') {
                resultClass = 'result-medium';
                resultIcon = 'fa-exclamation-triangle';
            } else {
                resultClass = 'result-low';
                resultIcon = 'fa-check-circle';
            }
            
            // عرض النتائج
            const resultsDiv = document.getElementById('symptoms-results');
            resultsDiv.innerHTML = `
                <div class="symptom-result ${resultClass}">
                    <div class="result-header">
                        <h3><i class="fas ${resultIcon}"></i> نتيجة التقييم</h3>
                        <span class="result-severity">${severity === 'high' ? 'عالية' : severity === 'medium' ? 'متوسطة' : 'منخفضة'}</span>
                    </div>
                    <div class="result-body">
                        <p><strong>التوصية:</strong> ${recommendation}</p>
                        
                        <div class="symptoms-list">
                            <h4><i class="fas fa-clipboard-list"></i> الأعراض المدخلة:</h4>
                            <ul>
                                <li>العمر: ${getAgeText(age)}</li>
                                <li>درجة الحرارة: ${temperature}°م</li>
                                ${selectedSymptoms.length > 0 ? `
                                    <li>الأعراض: ${selectedSymptoms.map(s => getSymptomText(s)).join('، ')}</li>
                                ` : '<li>لا توجد أعراض إضافية</li>'}
                            </ul>
                        </div>
                        
                        <div class="actions-list">
                            <h4><i class="fas fa-tasks"></i> الإجراءات الموصى بها:</h4>
                            <ol>
                                ${actions.map(action => `<li>${action}</li>`).join('')}
                            </ol>
                        </div>
                        
                        <div class="disclaimer">
                            <p><i class="fas fa-info-circle"></i> <strong>تنويه:</strong> هذا التقييم للأغراض الإرشادية فقط وليس بديلاً عن الاستشارة الطبية. إذا كنت قلقة على صحة طفلك، استشيري الطبيب دائماً.</p>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // دالة للحصول على نص العمر
        function getAgeText(ageValue) {
            const ages = {
                '0-3': '0-3 أشهر',
                '4-6': '4-6 أشهر',
                '7-12': '7-12 شهر',
                '1-2': '1-2 سنة'
            };
            return ages[ageValue] || ageValue;
        }
        
        // دالة للحصول على نص العرض
        function getSymptomText(symptomValue) {
            const symptoms = {
                'cough': 'كحة',
                'runny-nose': 'سيلان الأنف',
                'vomiting': 'تقيؤ',
                'diarrhea': 'إسهال',
                'rash': 'طفح جلدي',
                'lethargy': 'خمول',
                'poor-feeding': 'ضعف الرضاعة',
                'fussiness': 'بكاء مستمر'
            };
            return symptoms[symptomValue] || symptomValue;
        }
