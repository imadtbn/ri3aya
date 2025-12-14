
        // قاعدة بيانات النصائح
        const tipsDatabase = [
            {
                category: "سلامة",
                text: "دائماً اختبري حرارة ماء الاستحمام بمرفقك قبل وضع الطفل. المرفق أكثر حساسية من اليد ويساعدك في تحديد الدرجة المناسبة.",
                author: "نصائح طبية موثقة"
            },
            {
                category: "تغذية",
                text: "عند إدخال الطعام الصلب، قدمي صنفاً واحداً جديداً كل 3-5 أيام لمراقبة أي ردود فعل تحسسية.",
                author: "أخصائية تغذية أطفال"
            },
            {
                category: "نوم",
                text: "حافظي على روتين نوم ثابت حتى في عطلات نهاية الأسبوع. هذا يساعد نظام نوم الطفل على الاستقرار.",
                author: "خبيرة نوم أطفال"
            },
            {
                category: "نظافة",
                text: "اغسلي يديك جيداً قبل وبعد تغيير حفاض الطفل. هذه العادة البسيطة تقلل من انتشار الجراثيم.",
                author: "نصائح طبية موثقة"
            },
            {
                category: "تطور",
                text: "شجعي طفلك على اللعب على بطنه يومياً لتنمية عضلات الرقبة والكتفين استعداداً للجلوس والحبو.",
                author: "أخصائية العلاج الطبيعي"
            },
            {
                category: "سلامة",
                text: "تأكدي من أن سرير الطفل خالٍ من الوسائد والألعاب المحشوة والبطاطين الفضفاضة لتقليل خطر الاختناق.",
                author: "أكاديمية طب الأطفال"
            },
            {
                category: "تغذية",
                text: "لا تجبري الطفل على إنهاء زجاجة الحليب إذا أظهر علامات الشبع. احترمي إشارات الجوع والامتلاء لديه.",
                author: "استشاري رضاعة"
            },
            {
                category: "رعاية",
                text: "خصصي وقتاً للعب والتفاعل مع طفلك يومياً. اللمس والكلام والغناء يوطدان العلاقة بينكما.",
                author: "أخصائية نفسية أطفال"
            },
            {
                category: "نوم",
                text: "علّمي طفلك الفرق بين الليل والنهار من خلال فتح الستائر أثناء النهار وإبقاء الإضاءة خافتة ليلاً.",
                author: "خبيرة نوم أطفال"
            },
            {
                category: "سلامة",
                text: "لا تتركي الطفل أبداً دون مراقبة على سطح مرتفع مثل طاولة التغيير أو السرير أو الأريكة.",
                author: "نصائح طبية موثقة"
            },
            {
                category: "توفير الوقت",
                text: "جهزي حقيبة الخروج ليلاً قبل النوم لتجنب النسيان والتسرع في الصباح.",
                author: "أم خبيرة"
            },
            {
                category: "صحة",
                text: "راقبي عدد حفاضات الطفل المبللة يومياً. 6-8 حفاضات بعد الأسبوع الأول تدل على كفاية السوائل.",
                author: "طبيب أطفال"
            }
        ];

        document.addEventListener('DOMContentLoaded', function() {
            // تفعيل تبويبات الفئات
            const categoryTabs = document.querySelectorAll('.category-tab');
            const categoryContents = document.querySelectorAll('.category-content');
            
            categoryTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    // إزالة النشاط من جميع التبويبات
                    categoryTabs.forEach(t => t.classList.remove('active'));
                    // إضافة النشاط للتبويب الحالي
                    tab.classList.add('active');
                    
                    const categoryId = tab.getAttribute('data-category');
                    
                    // إخفاء جميع المحتويات
                    categoryContents.forEach(content => content.classList.remove('active'));
                    // إظهار المحتوى المطلوب
                    document.getElementById(`${categoryId}-content`).classList.add('active');
                });
            });
            
            // تفعيل مولد النصائح
            const generateTipBtn = document.getElementById('generate-tip');
            const saveTipBtn = document.getElementById('save-tip');
            const shareTipBtn = document.getElementById('share-tip');
            const savedTipsList = document.getElementById('saved-tips-list');
            const randomTipElement = document.getElementById('random-tip');
            
            // تحميل النصائح المحفوظة من localStorage
            let savedTips = JSON.parse(localStorage.getItem('savedTips')) || [];
            updateSavedTipsList();
            
            // توليد نصيحة عشوائية
            function generateRandomTip() {
                const randomIndex = Math.floor(Math.random() * tipsDatabase.length);
                const tip = tipsDatabase[randomIndex];
                
                randomTipElement.innerHTML = `
                    <div class="tip-category">
                        <span class="category-badge">نصيحة ${tip.category}</span>
                    </div>
                    <p class="tip-text">${tip.text}</p>
                    <div class="tip-author">
                        <i class="fas fa-user-md"></i> ${tip.author}
                    </div>
                `;
                
                // حفظ النصيحة الحالية في متغير لتتمكن من حفظها لاحقاً
                currentTip = tip;
            }
            
            // عرض النصيحة الحالية
            let currentTip = null;
            generateRandomTip();
            
            // تفعيل زر توليد نصيحة جديدة
            generateTipBtn.addEventListener('click', generateRandomTip);
            
            // تفعيل زر حفظ النصيحة
            saveTipBtn.addEventListener('click', function() {
                if (!currentTip) return;
                
                // التحقق من عدم تكرار النصيحة
                const isAlreadySaved = savedTips.some(tip => tip.text === currentTip.text);
                
                if (!isAlreadySaved) {
                    savedTips.push(currentTip);
                    localStorage.setItem('savedTips', JSON.stringify(savedTips));
                    updateSavedTipsList();
                    
                    // عرض رسالة نجاح
                    alert('تم حفظ النصيحة بنجاح!');
                } else {
                    alert('هذه النصيحة محفوظة مسبقاً.');
                }
            });
            
            // تفعيل زر مشاركة النصيحة
            shareTipBtn.addEventListener('click', function() {
                if (!currentTip) return;
                
                const shareText = `نصيحة من موقع رعاية الرضع:\n\n${currentTip.text}\n\n- ${currentTip.author}\n\nلمزيد من النصائح زوروا موقعنا`;
                
                // محاولة استخدام Web Share API إذا كان متاحاً
                if (navigator.share) {
                    navigator.share({
                        title: 'نصيحة رعاية الرضع',
                        text: shareText,
                        url: window.location.href
                    });
                } else {
                    // نسخ النص إلى الحافظة
                    navigator.clipboard.writeText(shareText)
                        .then(() => alert('تم نسخ النصيحة إلى الحافظة، يمكنك مشاركتها الآن.'))
                        .catch(() => {
                            // طريقة بديلة للنسخ
                            const textArea = document.createElement('textarea');
                            textArea.value = shareText;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            alert('تم نسخ النصيحة إلى الحافظة، يمكنك مشاركتها الآن.');
                        });
                }
            });
            
            // تحديث قائمة النصائح المحفوظة
            function updateSavedTipsList() {
                if (savedTips.length === 0) {
                    savedTipsList.innerHTML = '<p class="no-saved-tips">لا توجد نصائح محفوظة بعد. احفظي النصائح المفضلة لديك هنا.</p>';
                    return;
                }
                
                let html = '';
                savedTips.forEach((tip, index) => {
                    html += `
                        <div class="saved-tip-item">
                            <div class="saved-tip-content">
                                <span class="saved-tip-category">${tip.category}</span>
                                <p>${tip.text}</p>
                                <div class="saved-tip-footer">
                                    <span class="saved-tip-author">${tip.author}</span>
                                    <button class="delete-tip-btn" data-index="${index}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                savedTipsList.innerHTML = html;
                
                // تفعيل أزرار الحذف
                document.querySelectorAll('.delete-tip-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const index = parseInt(this.getAttribute('data-index'));
                        deleteSavedTip(index);
                    });
                });
            }
            
            // حذف نصيحة محفوظة
            function deleteSavedTip(index) {
                if (confirm('هل أنت متأكدة من حذف هذه النصيحة؟')) {
                    savedTips.splice(index, 1);
                    localStorage.setItem('savedTips', JSON.stringify(savedTips));
                    updateSavedTipsList();
                }
            }
            
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
