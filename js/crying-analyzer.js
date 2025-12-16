// crying-analyzer.js - كود JavaScript الخاص بصفحة فهم بكاء الرضيع

// ===== تهيئة الصفحة عند التحميل =====
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة محلل البكاء
    initCryAnalyzer();
    
    // تهيئة مفسر البكاء
    initSymptomAnalyzer();
    
    // تهيئة مشغل الصوت الأبيض
    initWhiteNoisePlayer();
    
    // تهيئة القائمة المنسدلة
    initMobileMenu();
    
    // تهيئة تفاعلات البطاقات
    initInteractiveCards();
    
    // تحميل سجل التحليلات
    loadAnalysisHistory();
    
    // إضافة تأثيرات الظهور
    initScrollAnimations();
});

// ===== محلل البكاء الذكي =====
function initCryAnalyzer() {
    const recordBtn = document.getElementById('record-btn');
    const recordingStatus = document.getElementById('recording-status');
    const audioVisualization = document.getElementById('audio-visualization');
    const analysisResults = document.getElementById('analysis-results');
    const patternLibrary = document.getElementById('pattern-library');
    const clearHistoryBtn = document.getElementById('clear-history');
    
    if (!recordBtn) return;
    
    let isRecording = false;
    let recordingTimer = null;
    let analysisCount = 0;
    
    // بيانات أنماط البكاء
    const cryPatterns = [
        {
            id: 1,
            name: "بكاء الجوع",
            icon: "fas fa-utensils",
            color: "#4CAF50",
            description: "بكاء قصير ومتقطع يزداد تدريجياً، غالباً ما يمص الطفل أصابعه أو يبحث عن الثدي.",
            confidence: 85,
            frequency: "منخفض إلى متوسط",
            duration: "متقطع",
            pitch: "متوسط",
            solutions: [
                "تقديم الرضاعة (حليب الأم أو الصناعي)",
                "فحص إذا كان الطفل قد أنهى رضعته السابقة",
                "التحقق من جدول الرضاعة"
            ]
        },
        {
            id: 2,
            name: "بكاء التعب والنعاس",
            icon: "fas fa-bed",
            color: "#2196F3",
            description: "أنين متواصل مع فرك العينين والتثاؤب المتكرر، يزداد عندما يحاول الطفل النوم.",
            confidence: 78,
            frequency: "منخفض",
            duration: "طويل ومستمر",
            pitch: "منخفض",
            solutions: [
                "تهيئة بيئة مناسبة للنوم",
                "التقميط اللطيف (للرضع الصغار)",
                "الهز الخفيف أو الغناء",
                "تقليل المحفزات (ضوء، صوت)"
            ]
        },
        {
            id: 3,
            name: "بكاء المغص والغازات",
            icon: "fas fa-wind",
            color: "#FF9800",
            description: "بكاء حاد ومستمر مع شد الساقين نحو البطن وتقوس الظهر، يحدث غالباً بعد الرضاعة.",
            confidence: 92,
            frequency: "مرتفع",
            duration: "طويل (قد يستمر ساعات)",
            pitch: "مرتفع",
            solutions: [
                "تدليك البطن بحركات دائرية",
                "وضعية رفع الساقين لتخفيف الغازات",
                "التمارين الخفيفة للطفل",
                "التحقق من وضعية الرضاعة الصحيحة"
            ]
        },
        {
            id: 4,
            name: "بكاء الحفاض المبلل",
            icon: "fas fa-baby",
            color: "#9C27B0",
            description: "بكاء متقطع مع حركة مستمرة وعدم راحة واضحة، يهدأ عند تغيير الحفاض.",
            confidence: 95,
            frequency: "متوسط",
            duration: "متقطع",
            pitch: "متوسط",
            solutions: [
                "تغيير الحفاض فوراً",
                "تنظيف المنطقة بالماء الدافئ",
                "استخدام كريم الحفاضات عند اللزوم",
                "التحقق من عدم وجود طفح جلدي"
            ]
        },
        {
            id: 5,
            name: "بكاء الاحتياج للحمل",
            icon: "fas fa-hands",
            color: "#E91E63",
            description: "بكاء يتوقف عند حمل الطفل ويهدأ بالاتصال الجسدي، يعود عند وضعه.",
            confidence: 80,
            frequency: "متغير",
            duration: "حتى يتم حمل الطفل",
            pitch: "متوسط",
            solutions: [
                "حمل الطفل وقربه من الجسم",
                "استخدام حاملة الأطفال",
                "التحدث مع الطفل أو الغناء له",
                "المشي به في الغرفة"
            ]
        }
    ];
    
    // إنشاء مكتبة الأنماط
    function createPatternLibrary() {
        if (!patternLibrary) return;
        
        patternLibrary.innerHTML = `
            <h3><i class="fas fa-book"></i> مكتبة أنماط البكاء</h3>
            <div class="patterns-grid">
                ${cryPatterns.map(pattern => `
                    <div class="pattern-card">
                        <div class="pattern-card-header" style="background: ${pattern.color}">
                            <i class="${pattern.icon} pattern-card-icon"></i>
                            <h4>${pattern.name}</h4>
                        </div>
                        <div class="pattern-card-body">
                            <p>${pattern.description}</p>
                            <div class="pattern-card-stats">
                                <div class="stat">
                                    <i class="fas fa-chart-line"></i>
                                    <span>التكرار: ${pattern.frequency}</span>
                                </div>
                                <div class="stat">
                                    <i class="fas fa-music"></i>
                                    <span>النبرة: ${pattern.pitch}</span>
                                </div>
                            </div>
                            <button class="btn-small" onclick="simulatePattern(${pattern.id})">
                                <i class="fas fa-play"></i> محاكاة النمط
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // محاكاة نمط بكاء معين
    window.simulatePattern = function(patternId) {
        const pattern = cryPatterns.find(p => p.id === patternId);
        if (!pattern) return;
        
        showMessage(`تم بدء محاكاة نمط "${pattern.name}"`, 'info');
        
        // تحديث واجهة المحاكاة
        recordBtn.innerHTML = `<i class="fas fa-microphone"></i> جاري محاكاة البكاء...`;
        recordBtn.classList.add('recording');
        recordingStatus.innerHTML = `<span class="pulse"></span> جاري محاكاة: ${pattern.name}`;
        recordingStatus.className = 'status-recording';
        
        // إنشاء تصور صوتي
        createAudioVisualization('simulation');
        
        // عرض نتيجة التحليل بعد محاكاة التسجيل
        setTimeout(() => {
            analyzeCryPattern(pattern);
            analysisCount++;
            
            // إضافة للسجل
            addToHistory(pattern, true);
            
            // إعادة تعيين واجهة التسجيل
            recordBtn.innerHTML = `<i class="fas fa-microphone"></i> بدء تحليل البكاء`;
            recordBtn.classList.remove('recording');
            recordingStatus.innerHTML = 'جاهز للتسجيل';
            recordingStatus.className = 'status-ready';
            clearAudioVisualization();
            
            showMessage(`اكتمل تحليل نمط البكاء: ${pattern.name}`, 'success');
        }, 3000);
    };
    
    // بدء/إيقاف التسجيل
    recordBtn.addEventListener('click', function() {
        if (isRecording) {
            // إيقاف التسجيل
            stopRecording();
        } else {
            // بدء التسجيل
            startRecording();
        }
    });
    
    function startRecording() {
        isRecording = true;
        recordBtn.innerHTML = `<i class="fas fa-stop"></i> إيقاف التسجيل والتحليل`;
        recordBtn.classList.add('recording');
        recordingStatus.innerHTML = `<span class="pulse"></span> جاري تسجيل البكاء...`;
        recordingStatus.className = 'status-recording';
        
        // إنشاء تصور صوتي
        createAudioVisualization();
        
        // مؤقت لمحاكاة التسجيل
        recordingTimer = setTimeout(() => {
            if (isRecording) {
                stopRecording();
            }
        }, 5000);
        
        showMessage('بدأ تسجيل البكاء، دع الطفل يبكي بالقرب من الميكروفون', 'info');
    }
    
    function stopRecording() {
        isRecording = false;
        clearTimeout(recordingTimer);
        
        // محاكاة تحليل البكاء
        const randomPattern = cryPatterns[Math.floor(Math.random() * cryPatterns.length)];
        analyzeCryPattern(randomPattern);
        analysisCount++;
        
        // إضافة للسجل
        addToHistory(randomPattern, false);
        
        // إعادة تعيين واجهة التسجيل
        recordBtn.innerHTML = `<i class="fas fa-microphone"></i> بدء تحليل البكاء`;
        recordBtn.classList.remove('recording');
        recordingStatus.innerHTML = 'جاهز للتسجيل';
        recordingStatus.className = 'status-ready';
        clearAudioVisualization();
        
        showMessage('اكتمل تحليل البكاء بنجاح!', 'success');
    }
    
    // إنشاء تصور بصري للصوت
    function createAudioVisualization(type = 'recording') {
        if (!audioVisualization) return;
        
        audioVisualization.innerHTML = '';
        const barsCount = type === 'simulation' ? 40 : 60;
        
        for (let i = 0; i < barsCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'audio-bar';
            
            // ارتفاع عشوائي مع اختلاف حسب النوع
            const baseHeight = type === 'simulation' ? 10 : 5;
            const randomHeight = baseHeight + Math.random() * 90;
            bar.style.height = `${randomHeight}%`;
            
            // تأخير لإنشاء تأثير متحرك
            bar.style.animationDelay = `${i * 0.05}s`;
            
            audioVisualization.appendChild(bar);
        }
    }
    
    // مسح التصور البصري
    function clearAudioVisualization() {
        if (!audioVisualization) return;
        
        audioVisualization.innerHTML = '<p>سيظهر هنا التصور البصري للصوت عند التسجيل</p>';
    }
    
    // تحليل نمط البكاء وعرض النتائج
    function analyzeCryPattern(pattern) {
        if (!analysisResults) return;
        
        // إنشاء عناصر النتائج
        analysisResults.innerHTML = `
            <h3><i class="fas fa-chart-bar"></i> نتائج تحليل البكاء</h3>
            <div class="result-card">
                <div class="pattern-header" style="background: ${pattern.color}">
                    <i class="${pattern.icon} pattern-icon"></i>
                    <h3>${pattern.name}</h3>
                    <div class="confidence">${pattern.confidence}% تطابق</div>
                </div>
                <div class="pattern-body">
                    <p class="pattern-description">${pattern.description}</p>
                    
                    <div class="stats">
                        <h4><i class="fas fa-chart-line"></i> تحليل الصوت</h4>
                        <div class="stat-row">
                            <span class="stat-label">تردد البكاء:</span>
                            <span class="stat-value">${pattern.frequency}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">المدة النموذجية:</span>
                            <span class="stat-value">${pattern.duration}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">نبرة الصوت:</span>
                            <span class="stat-value">${pattern.pitch}</span>
                        </div>
                        <div class="stat-row">
                            <span class="stat-label">مستوى الثقة:</span>
                            <span class="stat-value">${pattern.confidence}%</span>
                        </div>
                    </div>
                    
                    <div class="solutions">
                        <h4><i class="fas fa-lightbulb"></i> اقتراحات للتعامل</h4>
                        <ul>
                            ${pattern.solutions.map(solution => `<li>${solution}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="note">
                        <strong>ملاحظة:</strong> هذه النتائج تعتمد على التحليل الآلي وقد تختلف عن الواقع. استخدمي حدسك الأمومي واستشيري الطبيب إذا استمر البكاء.
                    </div>
                </div>
            </div>
        `;
        
        // إنشاء الأنماط البديلة
        createAlternativePatterns(pattern);
        
        // حفظ في التخزين المحلي
        saveAnalysisToHistory(pattern);
    }
    
    // إنشاء الأنماط البديلة
    function createAlternativePatterns(currentPattern) {
        const alternativePatterns = document.getElementById('alternative-patterns');
        if (!alternativePatterns) return;
        
        // الحصول على أنماط أخرى (غير النمط الحالي)
        const otherPatterns = cryPatterns.filter(p => p.id !== currentPattern.id)
                                         .slice(0, 3); // أخذ أول 3 أنماط فقط
        
        alternativePatterns.innerHTML = `
            <h3><i class="fas fa-random"></i> أنماط بديلة محتملة</h3>
            <div class="alternative-patterns-list">
                ${otherPatterns.map(pattern => `
                    <div class="alternative-pattern" onclick="selectAlternativePattern(${pattern.id})">
                        <i class="${pattern.icon} alt-pattern-icon" style="color: ${pattern.color}"></i>
                        <div class="alt-pattern-info">
                            <h4>${pattern.name}</h4>
                            <p>${pattern.description.substring(0, 80)}...</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // اختيار نمط بديل
    window.selectAlternativePattern = function(patternId) {
        const pattern = cryPatterns.find(p => p.id === patternId);
        if (pattern) {
            analyzeCryPattern(pattern);
            showMessage(`تم تحميل نمط "${pattern.name}"`, 'info');
        }
    };
    
    // إضافة تحليل للسجل
    function addToHistory(pattern, isSimulation) {
        const historyContainer = document.getElementById('analysis-history');
        if (!historyContainer) return;
        
        const time = new Date().toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        const historyItem = document.createElement('div');
        historyItem.className = 'history-entry';
        historyItem.innerHTML = `
            <div class="history-time">
                <i class="far fa-clock"></i> ${time}
            </div>
            <div class="history-pattern">
                ${isSimulation ? '<i class="fas fa-play-circle"></i>' : '<i class="fas fa-microphone"></i>'} 
                ${pattern.name}
            </div>
            <div class="history-confidence">
                ${pattern.confidence}%
            </div>
            <div class="history-duration">
                ${isSimulation ? 'محاكاة' : 'تسجيل'}
            </div>
        `;
        
        historyContainer.prepend(historyItem);
    }
    
    // حفظ التحليل في التخزين المحلي
    function saveAnalysisToHistory(pattern) {
        try {
            let history = JSON.parse(localStorage.getItem('babyCryAnalysisHistory')) || [];
            
            const analysis = {
                id: Date.now(),
                patternId: pattern.id,
                patternName: pattern.name,
                confidence: pattern.confidence,
                timestamp: new Date().toISOString(),
                isSimulation: false
            };
            
            history.unshift(analysis);
            
            // الاحتفاظ بأخر 20 تحليل فقط
            if (history.length > 20) {
                history = history.slice(0, 20);
            }
            
            localStorage.setItem('babyCryAnalysisHistory', JSON.stringify(history));
        } catch (e) {
            console.error('فشل حفظ السجل:', e);
        }
    }
    
    // تحميل سجل التحليلات
    function loadAnalysisHistory() {
        const historyContainer = document.getElementById('analysis-history');
        if (!historyContainer) return;
        
        try {
            const history = JSON.parse(localStorage.getItem('babyCryAnalysisHistory')) || [];
            
            if (history.length === 0) {
                historyContainer.innerHTML = `
                    <div class="empty-history">
                        <i class="far fa-clipboard"></i>
                        <p>لا توجد تحليلات سابقة</p>
                        <p>قم بتسجيل بكاء طفلك لبدء التحليل</p>
                    </div>
                `;
                return;
            }
            
            historyContainer.innerHTML = history.map(item => {
                const time = new Date(item.timestamp).toLocaleTimeString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                
                const pattern = cryPatterns.find(p => p.id === item.patternId) || cryPatterns[0];
                
                return `
                    <div class="history-entry">
                        <div class="history-time">
                            <i class="far fa-clock"></i> ${time}
                        </div>
                        <div class="history-pattern">
                            ${item.isSimulation ? '<i class="fas fa-play-circle"></i>' : '<i class="fas fa-microphone"></i>'} 
                            ${pattern.name}
                        </div>
                        <div class="history-confidence">
                            ${item.confidence}%
                        </div>
                        <div class="history-duration">
                            ${item.isSimulation ? 'محاكاة' : 'تسجيل'}
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error('فشل تحميل السجل:', e);
            historyContainer.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>حدث خطأ في تحميل السجل</p>
                </div>
            `;
        }
    }
    
    // مسح سجل التحليلات
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('هل أنت متأكد من رغبتك في مسح سجل التحليلات؟')) {
                localStorage.removeItem('babyCryAnalysisHistory');
                loadAnalysisHistory();
                showMessage('تم مسح سجل التحليلات بنجاح', 'success');
            }
        });
    }
    
    // إنشاء مكتبة الأنماط عند التحميل
    createPatternLibrary();
    
    // عرض رسالة ترحيبية
    setTimeout(() => {
        showMessage('مرحباً! يمكنك الآن تسجيل بكاء طفلك للتحليل أو تجربة المحاكاة', 'info');
    }, 1000);
}

// ===== مفسر البكاء بناء على الأعراض =====
function initSymptomAnalyzer() {
    const analyzeBtn = document.querySelector('.analyze-btn');
    const analysisResult = document.getElementById('analysisResult');
    
    if (!analyzeBtn) return;
    
    // قاعدة بيانات التشخيص بناء على الأعراض
    const symptomDiagnoses = [
        {
            symptoms: ['مص الأصابع', 'حركة الفم بحثاً عن الثدي'],
            diagnosis: 'الجوع',
            icon: 'fas fa-utensils',
            color: '#4CAF50',
            description: 'طفلك جائع ويحتاج إلى الرضاعة.',
            actions: [
                'قدمي الرضاعة له',
                'تحققي من آخر مرة أرضعته',
                'إذا كان يرضع حليباً صناعياً، تأكدي من كمية الرضعة'
            ]
        },
        {
            symptoms: ['فرك العينين', 'التثاؤب المتكرر'],
            diagnosis: 'التعب والنعاس',
            icon: 'fas fa-bed',
            color: '#2196F3',
            description: 'طفلك متعب ويحتاج إلى النوم.',
            actions: [
                'هيئي له بيئة مناسبة للنوم',
                'حاولي هزّه أو الغناء له',
                'خففي الإضاءة والأصوات في الغرفة'
            ]
        },
        {
            symptoms: ['شد الساقين', 'تصلب الجسم'],
            diagnosis: 'المغص والغازات',
            icon: 'fas fa-wind',
            color: '#FF9800',
            description: 'طفلك يعاني من مغص أو غازات.',
            actions: [
                'قومي بتدليك بطنه بحركات دائرية',
                'حاولي تمارين رفع الساقين',
                'ضعيه على ظهره وحركي ساقيه كركوب الدراجة'
            ]
        },
        {
            symptoms: ['البكاء عند الوضع', 'الهدوء عند الحمل'],
            diagnosis: 'الحاجة إلى الحمل',
            icon: 'fas fa-hands',
            color: '#E91E63',
            description: 'طفلك يحتاج إلى الاحتضان والشعور بالأمان.',
            actions: [
                'احمليه وقربيه منك',
                'استخدمي حاملة الأطفال',
                'تحدثي معه أو غني له وهو بين ذراعيك'
            ]
        },
        {
            symptoms: ['البكاء المختلف عن المعتاد', 'رفض الرضاعة'],
            diagnosis: 'عدم الراحة أو المرض',
            icon: 'fas fa-thermometer',
            color: '#F44336',
            description: 'طفلك قد يكون مريضاً أو يشعر بعدم الراحة.',
            actions: [
                'تحققي من درجة حرارته',
                'ابحثي عن أي علامات مرض أخرى',
                'استشيري الطبيب إذا استمر البكاء'
            ]
        }
    ];
    
    analyzeBtn.addEventListener('click', function() {
        const selectedSymptoms = [];
        const checkboxes = document.querySelectorAll('input[name="symptom"]:checked');
        
        checkboxes.forEach(checkbox => {
            selectedSymptoms.push(checkbox.value);
        });
        
        if (selectedSymptoms.length === 0) {
            analysisResult.innerHTML = `
                <div class="warning-note">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>الرجاء اختيار عرض واحد على الأقل للحصول على تشخيص.</p>
                </div>
            `;
            analysisResult.classList.add('active');
            return;
        }
        
        // البحث عن التشخيص الأنسب بناء على الأعراض المختارة
        let bestMatch = null;
        let highestScore = 0;
        
        symptomDiagnoses.forEach(diagnosis => {
            let score = 0;
            selectedSymptoms.forEach(symptom => {
                if (diagnosis.symptoms.includes(symptom)) {
                    score++;
                }
            });
            
            // حساب نسبة التطابق
            const matchPercentage = (score / selectedSymptoms.length) * 100;
            
            if (matchPercentage > highestScore) {
                highestScore = matchPercentage;
                bestMatch = { ...diagnosis, matchPercentage };
            }
        });
        
        // عرض النتيجة
        if (bestMatch) {
            analysisResult.innerHTML = `
                <div class="diagnosis-result" style="border-right-color: ${bestMatch.color}">
                    <div class="diagnosis-header">
                        <i class="${bestMatch.icon}"></i>
                        <h4>التشخيص: ${bestMatch.diagnosis}</h4>
                        <span class="match-score">${Math.round(bestMatch.matchPercentage)}% تطابق</span>
                    </div>
                    <div class="diagnosis-body">
                        <p><strong>الوصف:</strong> ${bestMatch.description}</p>
                        <div class="recommended-actions">
                            <h5><i class="fas fa-list-check"></i> الإجراءات المقترحة:</h5>
                            <ul>
                                ${bestMatch.actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="disclaimer">
                            <small><i class="fas fa-info-circle"></i> هذا التشخيص استرشادي ويعتمد على الأعراض المختارة فقط.</small>
                        </div>
                    </div>
                </div>
            `;
        } else {
            analysisResult.innerHTML = `
                <div class="warning-note">
                    <i class="fas fa-question-circle"></i>
                    <p>لم نتمكن من تحديد تشخيص دقيق. حاولي مراقبة طفلك وملاحظة أعراض أخرى.</p>
                    <p>إذا استمر البكاء، استشيري طبيب الأطفال.</p>
                </div>
            `;
        }
        
        analysisResult.classList.add('active');
        showMessage('تم تحليل الأعراض بنجاح', 'success');
    });
}

// ===== مشغل الصوت الأبيض =====
function initWhiteNoisePlayer() {
    const playButton = document.getElementById('playWhiteNoise');
    if (!playButton) return;
    
    let isPlaying = false;
    let audioContext = null;
    let noiseNode = null;
    
    // إنشاء صوت أبيض
    function createWhiteNoise() {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            if (noiseNode) {
                noiseNode.disconnect();
            }
            
            const bufferSize = 4096;
            const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            
            // ملء العازف بضوضاء عشوائية
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            
            noiseNode = audioContext.createBufferSource();
            noiseNode.buffer = noiseBuffer;
            noiseNode.loop = true;
            
            // إنشاء مرشح لتخفيف الحدة
            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            
            // التحكم بالصوت
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.1;
            
            noiseNode.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            return { noiseNode, gainNode };
        } catch (error) {
            console.error('خطأ في إنشاء الصوت:', error);
            return null;
        }
    }
    
    playButton.addEventListener('click', function() {
        if (!isPlaying) {
            // بدء التشغيل
            const audioSetup = createWhiteNoise();
            if (audioSetup) {
                audioSetup.noiseNode.start();
                isPlaying = true;
                playButton.innerHTML = '<i class="fas fa-stop"></i> إيقاف الصوت الأبيض';
                playButton.classList.add('playing');
                
                showMessage('تم تشغيل الصوت الأبيض المهدئ', 'info');
            } else {
                showMessage('تعذر تشغيل الصوت. قد يكون المتصفح لا يدعم هذه الميزة.', 'error');
            }
        } else {
            // إيقاف التشغيل
            if (noiseNode) {
                noiseNode.stop();
                noiseNode = null;
            }
            isPlaying = false;
            playButton.innerHTML = '<i class="fas fa-play"></i> تشغيل صوت أبيض';
            playButton.classList.remove('playing');
            
            showMessage('تم إيقاف الصوت الأبيض', 'info');
        }
    });
}

// ===== إدارة القائمة المنسدلة للهواتف =====
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuBtn.innerHTML = navMenu.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // إدارة القوائم المنسدلة على الهواتف
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        
        if (dropdownLink) {
            dropdownLink.addEventListener('click', function(e) {
                if (window.innerWidth <= 992) {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                    
                    // إغلاق القوائم المنسدلة الأخرى
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('open');
                        }
                    });
                }
            });
        }
    });
    
    // إغلاق القوائم عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav-menu') && !e.target.closest('.mobile-menu-btn')) {
            if (navMenu) navMenu.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('open');
            });
        }
    });
}

// ===== تفاعلات البطاقات =====
function initInteractiveCards() {
    // تفعيل تأثير hover للبطاقات
    const cards = document.querySelectorAll('.crying-type-card, .technique-card, .pattern-card, .sidebar-widget');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // تفعيل النقر على خطوات الفحص
    const flowSteps = document.querySelectorAll('.flow-step');
    flowSteps.forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = this.querySelector('.flow-number').textContent;
            showMessage(`خطوة ${stepNumber}: ${this.querySelector('h4').textContent}`, 'info');
        });
    });
}

// ===== تأثيرات التمرير =====
function initScrollAnimations() {
    // تأثير الظهور عند التمرير
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-up');
            }
        });
    }, observerOptions);
    
    // مراقبة العناصر المراد تحريكها
    const elementsToAnimate = document.querySelectorAll('.content-section, .crying-type-card, .technique-card');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// ===== نظام الرسائل =====
function showMessage(text, type = 'info') {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        // إنشاء حاوية الرسائل إذا لم تكن موجودة
        const container = document.createElement('div');
        container.id = 'message-container';
        container.className = 'message-container';
        document.body.appendChild(container);
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    messageDiv.innerHTML = `
        <i class="${icons[type] || icons.info} message-icon"></i>
        <div class="message-text">${text}</div>
        <i class="fas fa-times close-message"></i>
    `;
    
    const container = document.getElementById('message-container');
    container.appendChild(messageDiv);
    
    // إضافة حدث الإغلاق
    messageDiv.querySelector('.close-message').addEventListener('click', function() {
        messageDiv.classList.add('fade-out');
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 500);
    });
    
    // إزالة الرسالة تلقائياً بعد 5 ثوان
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.classList.add('fade-out');
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 500);
        }
    }, 5000);
}

// ===== وظائف مساعدة =====
// تحديد إذا كان الجهاز هاتفاً
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// تنسيق الوقت
function formatTime(date) {
    return date.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

// تحميل الصفحة مع تأثيرات
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // إضافة تأثيرات تأخير للعناصر
    const animatedElements = document.querySelectorAll('.animate-fade-up, .animate-slide-up');
    animatedElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });
});

// ===== إدارة حالة الصفحة =====
// حفظ حالة الصفحة عند الخروج
window.addEventListener('beforeunload', function() {
    // حفظ التحليلات الأخيرة
    try {
        const recentAnalyses = document.querySelectorAll('.history-entry');
        if (recentAnalyses.length > 0) {
            localStorage.setItem('lastVisit', new Date().toISOString());
        }
    } catch (e) {
        console.error('فشل حفظ حالة الصفحة:', e);
    }
});

// استعادة حالة الصفحة عند العودة
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // الصفحة تم تحميلها من ذاكرة التخزين المؤقت
        showMessage('تم استعادة الصفحة من الذاكرة المؤقتة', 'info');
    }
});