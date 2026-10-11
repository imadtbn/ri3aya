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
            
        });
        
        // دالة تقييم الأعراض
        function evaluateSymptoms() {
            const age = document.getElementById('child-age-symptoms').value;
            const input = document.getElementById('temperature');
            const temperature = Number(input.value);
            const result = document.getElementById('symptoms-results');
            result.replaceChildren();
            const message = document.createElement('p');
            if (!input.value.trim() || !Number.isFinite(temperature) || temperature < 34 || temperature > 43) {
                message.textContent = 'أدخلي قراءة حرارة صحيحة بين 34 و43°م. إذا كانت القراءة خارج هذا المجال أو كان الطفل مريضًا، تحققي من القياس واطلبي المشورة الطبية دون انتظار نتيجة الأداة.';
                result.append(message);
                return;
            }
            const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked')).map(input => getSymptomText(input.value));
            const heading = document.createElement('h3');
            heading.textContent = 'ملخص الملاحظات لمناقشته مع الطبيب';
            const summary = document.createElement('p');
            summary.textContent = `العمر: ${getAgeText(age)} — الحرارة: ${temperature}°م — الملاحظات: ${symptoms.join('، ') || 'لم تُحدد ملاحظات إضافية'}.`;
            message.textContent = age === '0-3' && temperature >= 38
                ? 'إذا كان عمر الرضيع أقل من 3 أشهر وبلغت حرارته 38°م أو أكثر، اطلبي تقييمًا طبيًا عاجلًا.'
                : 'هذه القائمة لا تشخّص الحالة ولا تستبعد المرض. تواصلي مع الطبيب عند المرض أو القلق، حتى لو لم تظهر حرارة مرتفعة.';
            const warning = document.createElement('p');
            warning.textContent = 'صعوبة التنفس أو فقدان الوعي أو تغير اللون إلى الأزرق تستدعي المساعدة العاجلة. الخمول غير المعتاد أو ضعف الرضاعة أو قلة التبول أو القيء المتكرر تستلزم التواصل مع الطبيب. لا يحدد الموقع دواءً أو جرعة.';
            result.append(heading, summary, message, warning);
            result.setAttribute('role', 'status');
            result.setAttribute('aria-live', 'polite');
        }

        // دالة للحصول على نص العمر
        function getAgeText(ageValue) {
            const ages = {
                '0-3': 'أقل من 3 أشهر',
                '4-6': 'من 3 إلى 6 أشهر',
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
