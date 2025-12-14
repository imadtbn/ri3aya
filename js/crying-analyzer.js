// crying-analyzer.js
// نظام تحليل بكاء الرضيع - يوفر تفسيرات ذكية لأنواع البكاء المختلفة

class CryingAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isRecording = false;
        this.recordingStartTime = null;
        this.audioData = [];
        this.cryingPatterns = this.initializePatterns();
        this.initializeEventListeners();
        this.initUI();
    }

    // تهيئة أنماط البكاء المعروفة
    initializePatterns() {
        return {
            'hunger': {
                name: 'الجوع',
                description: 'بكاء منتظم ومتكرر مع تحريك الفم وكأنه يبحث عن الثدي',
                frequency: { low: 250, high: 450 },
                pattern: 'rythmic',
                intensity: 'medium',
                solutions: [
                    'قدمي للرضيع الرضاعة (طبيعية أو صناعية)',
                    'تحققي من وقت الرضعة الأخيرة',
                    'تأكدي من وضعية الرضاعة الصحيحة'
                ],
                icon: '🍼'
            },
            'tired': {
                name: 'التعب والحاجة للنوم',
                description: 'بكاء متقطع مع فرك العينين والتثاؤب',
                frequency: { low: 300, high: 500 },
                pattern: 'intermittent',
                intensity: 'low',
                solutions: [
                    'هزي الطفل بلطف أو غنّي له',
                    'وفرّي بيئة هادئة للنوم',
                    'استخدمي اللهاية إذا كان معتاداً عليها',
                    'قومي بتقميط الطفل برفق (إذا كان حديث الولادة)'
                ],
                icon: '😴'
            },
            'discomfort': {
                name: 'عدم الراحة (حفاضة، حر، برد)',
                description: 'بكاء مستمر مع حركات متوترة في الجسم',
                frequency: { low: 400, high: 600 },
                pattern: 'continuous',
                intensity: 'medium',
                solutions: [
                    'تحققي من الحفاضة ونظفيها إذا لزم الأمر',
                    'تأكدي من ملابس الطفل المناسبة للطقس',
                    'افحصي درجة حرارة الطفل',
                    'ابحثي عن أي شيء قد يسبب عدم الراحة (ملصقات الملابس، الخ)'
                ],
                icon: '🩹'
            },
            'pain': {
                name: 'ألم أو مغص',
                description: 'بكاء حاد ومفاجئ مع تقوس الظهر وشد الساقين',
                frequency: { low: 600, high: 900 },
                pattern: 'sharp',
                intensity: 'high',
                solutions: [
                    'حاولي تهدئة الطفل باحتضانه',
                    'ضعي الطفل على بطنه على ذراعك مع تدليك ظهره',
                    'استخدمي قطرات المغص بعد استشارة الطبيب',
                    'جربي تمرين الدراجة لساقي الطفل لتخفيف الغازات'
                ],
                icon: '😫'
            },
            'attention': {
                name: 'الرغبة في الاهتمام',
                description: 'بكاء يهدأ بمجرد حمل الطفل',
                frequency: { low: 200, high: 400 },
                pattern: 'on-and-off',
                intensity: 'low',
                solutions: [
                    'احملي الطفل وقربيه منك',
                    'تفاعلي معه بالحديث والغناء',
                    'غيّري وضعه أو المكان',
                    'قدّمي له لعبة آمنة للتركيز عليها'
                ],
                icon: '🤗'
            },
            'overstimulation': {
                name: 'فرط التحفيز',
                description: 'بكاء مع انزياح النظر وتجنب الاتصال البصري',
                frequency: { low: 350, high: 550 },
                pattern: 'escalating',
                intensity: 'medium',
                solutions: [
                    'قللي من المحفزات البيئية (أضواء، أصوات)',
                    'انتقلي بطفلك إلى مكان هادئ',
                    'لفّي الطفل ببطانية خفيفة',
                    'هدهدي الطفل بلطف مع حركات بسيطة'
                ],
                icon: '🌙'
            }
        };
    }

    // تهيئة واجهة المستخدم
    initUI() {
        this.createAnalysisUI();
        this.createPatternLibrary();
        this.createHistoryLog();
    }

    // إنشاء واجهة التحليل
    createAnalysisUI() {
        // سيتم استدعاء هذه الوظيفة من HTML
        console.log('واجهة تحليل البكاء جاهزة للاستخدام');
    }

    // بدء تسجيل البكاء وتحليله
    async startRecording() {
        if (this.isRecording) return;

        try {
            // الحصول على إذن الميكروفون
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                }
            });

            // تهيئة سياق الصوت
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            // إعداد المحلل
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            this.microphone.connect(this.analyser);
            
            // بدء التسجيل
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            this.audioData = [];
            
            // تحديث الواجهة
            this.updateRecordingUI(true);
            
            // بدء تحليل الصوت
            this.analyzeAudio();
            
            console.log('بدأ تسليل البكاء...');
            
        } catch (error) {
            console.error('خطأ في الوصول إلى الميكروفون:', error);
            this.showMessage('خطأ: لا يمكن الوصول إلى الميكروفون. تأكد من السماح باستخدام الميكروفون.', 'error');
            
            // عرض واجهة محاكاة للاختبار
            this.showSimulationMode();
        }
    }

    // إيقاف التسجيل
    stopRecording() {
        if (!this.isRecording) return;
        
        this.isRecording = false;
        
        // فصل مصادر الصوت
        if (this.microphone) {
            this.microphone.disconnect();
        }
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        // تحديث الواجهة
        this.updateRecordingUI(false);
        
        // تحليل البيانات المجمعة
        this.processRecordedData();
        
        console.log('تم إيقاف تسجيل البكاء');
    }

    // تحليل الصوت في الوقت الحقيقي
    analyzeAudio() {
        if (!this.isRecording) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // الحصول على بيانات التردد
        this.analyser.getByteFrequencyData(dataArray);
        
        // حساب متوسط التردد
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
            total += dataArray[i];
        }
        const avgFrequency = total / bufferLength;
        
        // حساب شدة الصوت
        let intensity = 0;
        for (let i = 0; i < bufferLength; i++) {
            intensity += dataArray[i] * dataArray[i];
        }
        intensity = Math.sqrt(intensity / bufferLength);
        
        // حفظ البيانات
        this.audioData.push({
            timestamp: Date.now() - this.recordingStartTime,
            frequency: avgFrequency,
            intensity: intensity
        });
        
        // تحديث الرسم البياني في الوقت الحقيقي
        this.updateAudioVisualization(dataArray);
        
        // الاستمرار في التحليل
        requestAnimationFrame(() => this.analyzeAudio());
    }

    // معالجة البيانات المسجلة
    processRecordedData() {
        if (this.audioData.length === 0) {
            this.showMessage('لم يتم تسجيل بيانات كافية للتحليل. حاولي مرة أخرى.', 'warning');
            return;
        }
        
        // حساب إحصائيات البكاء
        const stats = this.calculateCryingStats();
        
        // تحديد نمط البكاء
        const pattern = this.identifyCryingPattern(stats);
        
        // عرض النتائج
        this.displayAnalysisResults(stats, pattern);
        
        // حفظ في السجل
        this.addToHistory(stats, pattern);
    }

    // حساب إحصائيات البكاء
    calculateCryingStats() {
        const frequencies = this.audioData.map(d => d.frequency);
        const intensities = this.audioData.map(d => d.duration);
        
        const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
        const maxFrequency = Math.max(...frequencies);
        const minFrequency = Math.min(...frequencies);
        
        const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        const maxIntensity = Math.max(...intensities);
        
        // حساب نمط التكرار
        let patternType = 'continuous';
        const duration = (Date.now() - this.recordingStartTime) / 1000; // بالثواني
        
        if (duration < 10) {
            patternType = 'sharp';
        } else if (this.audioData.length > 0) {
            // تحليل التغير في الشدة لتحديد النمط
            const intensityChanges = [];
            for (let i = 1; i < this.audioData.length; i++) {
                intensityChanges.push(Math.abs(this.audioData[i].intensity - this.audioData[i-1].intensity));
            }
            
            const avgChange = intensityChanges.reduce((a, b) => a + b, 0) / intensityChanges.length;
            
            if (avgChange > 30) {
                patternType = 'intermittent';
            } else if (avgChange > 50) {
                patternType = 'on-and-off';
            }
        }
        
        return {
            avgFrequency,
            maxFrequency,
            minFrequency,
            avgIntensity,
            maxIntensity,
            patternType,
            duration,
            dataPoints: this.audioData.length
        };
    }

    // تحديد نمط البكاء
    identifyCryingPattern(stats) {
        let bestMatch = null;
        let bestScore = 0;
        
        // مقارنة الإحصائيات مع كل نمط معروف
        for (const [key, pattern] of Object.entries(this.cryingPatterns)) {
            let score = 0;
            
            // مطابقة التردد
            if (stats.avgFrequency >= pattern.frequency.low && 
                stats.avgFrequency <= pattern.frequency.high) {
                score += 40;
            } else {
                // حساب القرب من نطاق التردد
                const freqMid = (pattern.frequency.low + pattern.frequency.high) / 2;
                const freqDiff = Math.abs(stats.avgFrequency - freqMid);
                const freqRange = pattern.frequency.high - pattern.frequency.low;
                score += Math.max(0, 40 - (freqDiff / freqRange * 40));
            }
            
            // مطابقة النمط
            if (stats.patternType === pattern.pattern) {
                score += 30;
            }
            
            // مطابقة الشدة
            if (pattern.intensity === 'low' && stats.avgIntensity < 30) {
                score += 15;
            } else if (pattern.intensity === 'medium' && stats.avgIntensity >= 30 && stats.avgIntensity < 60) {
                score += 15;
            } else if (pattern.intensity === 'high' && stats.avgIntensity >= 60) {
                score += 15;
            }
            
            // مدة البكاء
            if (pattern.name === 'الجوع' && stats.duration > 20) {
                score += 15;
            } else if (pattern.name === 'الألم' && stats.duration < 15) {
                score += 15;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = { ...pattern, id: key, confidence: Math.min(100, score) };
            }
        }
        
        return bestMatch;
    }

    // عرض نتائج التحليل
    displayAnalysisResults(stats, pattern) {
        // إنشاء عناصر النتائج
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        // عرض نمط البكاء المحدد
        if (pattern) {
            const patternHTML = `
                <div class="result-card">
                    <div class="pattern-header" style="background-color: ${this.getPatternColor(pattern.id)}">
                        <span class="pattern-icon">${pattern.icon}</span>
                        <h3>${pattern.name}</h3>
                        <div class="confidence">${pattern.confidence.toFixed(0)}% تطابق</div>
                    </div>
                    <div class="pattern-body">
                        <p class="pattern-description">${pattern.description}</p>
                        
                        <div class="stats">
                            <h4>إحصائيات البكاء:</h4>
                            <div class="stat-row">
                                <span class="stat-label">مدة البكاء:</span>
                                <span class="stat-value">${stats.duration.toFixed(1)} ثانية</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">تردد البكاء:</span>
                                <span class="stat-value">${stats.avgFrequency.toFixed(0)} هرتز</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">شدة البكاء:</span>
                                <span class="stat-value">${stats.avgIntensity > 60 ? 'عالية' : stats.avgIntensity > 30 ? 'متوسطة' : 'منخفضة'}</span>
                            </div>
                            <div class="stat-row">
                                <span class="stat-label">نمط البكاء:</span>
                                <span class="stat-value">${this.translatePattern(stats.patternType)}</span>
                            </div>
                        </div>
                        
                        <div class="solutions">
                            <h4>اقتراحات للحل:</h4>
                            <ul>
                                ${pattern.solutions.map(solution => `<li>${solution}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="note">
                            <strong>ملاحظة:</strong> هذه النتائج تعتمد على تحليل تقريبي للبكاء وقد لا تكون دقيقة 100%. استشيري طبيب الأطفال إذا استمر البكاء أو إذا كان مصحوباً بأعراض أخرى.
                        </div>
                    </div>
                </div>
            `;
            
            resultsContainer.innerHTML = patternHTML;
            
            // عرض الأنماط الأخرى المحتملة
            this.showAlternativePatterns(pattern.id);
        } else {
            resultsContainer.innerHTML = `
                <div class="no-result">
                    <h3>⚠️ لم نتمكن من تحديد نمط البكاء بدقة</h3>
                    <p>جربي التسجيل مرة أخرى في بيئة أكثر هدوءاً، أو اختاري نمط البكاء يدوياً من القائمة أدناه.</p>
                </div>
            `;
        }
    }

    // عرض الأنماط البديلة
    showAlternativePatterns(excludedPatternId) {
        const alternativesContainer = document.getElementById('alternative-patterns');
        if (!alternativesContainer) return;
        
        alternativesContainer.innerHTML = '<h3>أنماط بكاء أخرى محتملة:</h3>';
        
        // عرض 2-3 أنماط أخرى مرتبة حسب الاحتمالية
        let patternCount = 0;
        for (const [id, pattern] of Object.entries(this.cryingPatterns)) {
            if (id !== excludedPatternId && patternCount < 3) {
                const patternElement = document.createElement('div');
                patternElement.className = 'alternative-pattern';
                patternElement.innerHTML = `
                    <div class="alt-pattern-icon">${pattern.icon}</div>
                    <div class="alt-pattern-info">
                        <h4>${pattern.name}</h4>
                        <p>${pattern.description.substring(0, 80)}...</p>
                    </div>
                `;
                
                patternElement.addEventListener('click', () => {
                    this.displayPatternDetails(id);
                });
                
                alternativesContainer.appendChild(patternElement);
                patternCount++;
            }
        }
    }

    // عرض تفاصيل نمط معين
    displayPatternDetails(patternId) {
        const pattern = this.cryingPatterns[patternId];
        if (!pattern) return;
        
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="result-card">
                <div class="pattern-header" style="background-color: ${this.getPatternColor(patternId)}">
                    <span class="pattern-icon">${pattern.icon}</span>
                    <h3>${pattern.name}</h3>
                    <div class="confidence">نمط يدوي</div>
                </div>
                <div class="pattern-body">
                    <p class="pattern-description">${pattern.description}</p>
                    
                    <div class="solutions">
                        <h4>اقتراحات للحل:</h4>
                        <ul>
                            ${pattern.solutions.map(solution => `<li>${solution}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="note">
                        <strong>ملاحظة:</strong> هذه المعلومات عامة وقد لا تنطبق على جميع الأطفال. راقبي طفلك واستشيري الطبيب إذا لزم الأمر.
                    </div>
                    
                    <button id="try-analyze-again" class="btn-secondary">جرب التحليل التلقائي مرة أخرى</button>
                </div>
            </div>
        `;
        
        document.getElementById('try-analyze-again').addEventListener('click', () => {
            this.startRecording();
        });
    }

    // إضافة النتيجة إلى السجل
    addToHistory(stats, pattern) {
        const history = this.getHistory();
        const historyEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString('ar-SA'),
            pattern: pattern ? pattern.name : 'غير محدد',
            confidence: pattern ? pattern.confidence : 0,
            duration: stats.duration,
            frequency: stats.avgFrequency
        };
        
        history.unshift(historyEntry);
        
        // حفظ فقط آخر 10 تحليلات
        if (history.length > 10) {
            history.pop();
        }
        
        localStorage.setItem('cryingAnalysisHistory', JSON.stringify(history));
        this.updateHistoryDisplay();
    }

    // الحصول على السجل من localStorage
    getHistory() {
        const history = localStorage.getItem('cryingAnalysisHistory');
        return history ? JSON.parse(history) : [];
    }

    // تحديث عرض السجل
    updateHistoryDisplay() {
        const historyContainer = document.getElementById('analysis-history');
        if (!historyContainer) return;
        
        const history = this.getHistory();
        
        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="empty-history">لا توجد تحليلات سابقة</p>';
            return;
        }
        
        let historyHTML = '<h3>سجل التحليلات السابقة:</h3>';
        
        history.forEach(entry => {
            historyHTML += `
                <div class="history-entry">
                    <div class="history-time">${entry.timestamp}</div>
                    <div class="history-pattern">${entry.pattern}</div>
                    <div class="history-confidence">${entry.confidence.toFixed(0)}%</div>
                    <div class="history-duration">${entry.duration.toFixed(1)} ث</div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = historyHTML;
    }

    // تحديث واجهة التسجيل
    updateRecordingUI(isRecording) {
        const recordBtn = document.getElementById('record-btn');
        const statusIndicator = document.getElementById('recording-status');
        
        if (recordBtn) {
            if (isRecording) {
                recordBtn.innerHTML = '<i class="fas fa-stop-circle"></i> إيقاف التسجيل';
                recordBtn.classList.add('recording');
            } else {
                recordBtn.innerHTML = '<i class="fas fa-microphone"></i> بدء تحليل البكاء';
                recordBtn.classList.remove('recording');
            }
        }
        
        if (statusIndicator) {
            if (isRecording) {
                statusIndicator.innerHTML = '<span class="pulse"></span> جاري تحليل البكاء...';
                statusIndicator.className = 'status-recording';
            } else {
                statusIndicator.innerHTML = 'جاهز للتسجيل';
                statusIndicator.className = 'status-ready';
            }
        }
    }

    // عرض الرسائل
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.innerHTML = `
            <div class="message-icon">
                ${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div class="message-text">${message}</div>
        `;
        
        messageContainer.appendChild(messageElement);
        
        // إزالة الرسالة بعد 5 ثوانٍ
        setTimeout(() => {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 500);
        }, 5000);
    }

    // وضع المحاكاة (عند فشل الوصول إلى الميكروفون)
    showSimulationMode() {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="simulation-mode">
                <h3>وضع المحاكاة (التجريبي)</h3>
                <p>نظراً لعدم تمكننا من الوصول إلى الميكروفون، يمكنك اختيار نمط البكاء يدوياً لمشاهدة كيف يعمل النظام.</p>
                
                <div class="simulation-options">
                    ${Object.entries(this.cryingPatterns).map(([id, pattern]) => `
                        <div class="simulation-option" data-pattern="${id}">
                            <div class="simulation-icon">${pattern.icon}</div>
                            <div class="simulation-info">
                                <h4>${pattern.name}</h4>
                                <p>${pattern.description.substring(0, 60)}...</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <p class="simulation-note">في النسخة الكاملة من التطبيق، يمكنك استخدام الميكروفون لتحليل بكاء طفلك فعلياً.</p>
            </div>
        `;
        
        // إضافة مستمعي الأحداث لخيارات المحاكاة
        document.querySelectorAll('.simulation-option').forEach(option => {
            option.addEventListener('click', () => {
                const patternId = option.getAttribute('data-pattern');
                this.displayPatternDetails(patternId);
            });
        });
    }

    // إنشاء مكتبة أنماط البكاء
    createPatternLibrary() {
        const libraryContainer = document.getElementById('pattern-library');
        if (!libraryContainer) return;
        
        let libraryHTML = '<h3>مكتبة أنماط بكاء الأطفال:</h3><div class="patterns-grid">';
        
        for (const [id, pattern] of Object.entries(this.cryingPatterns)) {
            libraryHTML += `
                <div class="pattern-card" data-pattern="${id}">
                    <div class="pattern-card-header" style="background-color: ${this.getPatternColor(id)}">
                        <span class="pattern-card-icon">${pattern.icon}</span>
                        <h4>${pattern.name}</h4>
                    </div>
                    <div class="pattern-card-body">
                        <p>${pattern.description}</p>
                        <div class="pattern-card-stats">
                            <span class="stat"><i class="fas fa-wave-square"></i> ${pattern.frequency.low}-${pattern.frequency.high} هرتز</span>
                            <span class="stat"><i class="fas fa-volume-up"></i> ${pattern.intensity === 'high' ? 'عالية' : pattern.intensity === 'medium' ? 'متوسطة' : 'منخفضة'}</span>
                        </div>
                        <button class="btn-small" data-pattern="${id}">عرض التفاصيل</button>
                    </div>
                </div>
            `;
        }
        
        libraryHTML += '</div>';
        libraryContainer.innerHTML = libraryHTML;
        
        // إضافة مستمعي الأحداث
        document.querySelectorAll('.pattern-card button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const patternId = button.getAttribute('data-pattern');
                this.displayPatternDetails(patternId);
            });
        });
    }

    // إنشاء سجل التحليلات
    createHistoryLog() {
        this.updateHistoryDisplay();
    }

    // تهيئة مستمعي الأحداث
    initializeEventListeners() {
        // مستمع الأحداث لزر التسجيل
        document.addEventListener('DOMContentLoaded', () => {
            const recordBtn = document.getElementById('record-btn');
            if (recordBtn) {
                recordBtn.addEventListener('click', () => {
                    if (this.isRecording) {
                        this.stopRecording();
                    } else {
                        this.startRecording();
                    }
                });
            }
            
            // زر مسح السجل
            const clearHistoryBtn = document.getElementById('clear-history');
            if (clearHistoryBtn) {
                clearHistoryBtn.addEventListener('click', () => {
                    localStorage.removeItem('cryingAnalysisHistory');
                    this.updateHistoryDisplay();
                    this.showMessage('تم مسح سجل التحليلات السابقة', 'info');
                });
            }
            
            // تحديث السجل عند تحميل الصفحة
            this.updateHistoryDisplay();
        });
    }

    // وظائف مساعدة
    getPatternColor(patternId) {
        const colors = {
            'hunger': '#FFB6C1',
            'tired': '#87CEEB',
            'discomfort': '#98FB98',
            'pain': '#FFA07A',
            'attention': '#DDA0DD',
            'overstimulation': '#F0E68C'
        };
        
        return colors[patternId] || '#E0E0E0';
    }

    translatePattern(patternType) {
        const translations = {
            'continuous': 'مستمر',
            'intermittent': 'متقطع',
            'sharp': 'حاد',
            'on-and-off': 'متناوب',
            'rythmic': 'إيقاعي',
            'escalating': 'متزايد'
        };
        
        return translations[patternType] || patternType;
    }

    // تحديث التصور البصري للصوت
    updateAudioVisualization(dataArray) {
        const visualization = document.getElementById('audio-visualization');
        if (!visualization) return;
        
        // تنظيف المحتوى السابق
        visualization.innerHTML = '';
        
        // إنشاء رسم بياني مبسط
        const barCount = 40;
        const maxBarHeight = 80;
        
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'audio-bar';
            
            // أخذ عينة من بيانات التردد
            const dataIndex = Math.floor(i * dataArray.length / barCount);
            const height = Math.min(maxBarHeight, dataArray[dataIndex] / 2);
            
            bar.style.height = `${height}px`;
            bar.style.backgroundColor = this.getBarColor(height, maxBarHeight);
            
            visualization.appendChild(bar);
        }
    }

    // الحصول على لون الشريط بناءً على الارتفاع
    getBarColor(height, maxHeight) {
        const ratio = height / maxHeight;
        
        if (ratio > 0.7) return '#FF6B6B'; // أحمر للشدة العالية
        if (ratio > 0.4) return '#FFD166'; // أصفر للشدة المتوسطة
        return '#06D6A0'; // أخضر للشدة المنخفضة
    }
}

// تهيئة محلل البكاء عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.cryingAnalyzer = new CryingAnalyzer();
    
    // عرض رسالة ترحيب
    setTimeout(() => {
        if (window.cryingAnalyzer) {
            window.cryingAnalyzer.showMessage('مرحباً! يمكنك الآن تحليل بكاء طفلك باستخدام الميكروفون أو تجربة وضع المحاكاة.', 'info');
        }
    }, 1000);
});

// تصدير الكلاس للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CryingAnalyzer;
}