
        // بيانات نموذجية لمخططات النمو (بيانات الذكور)
        const growthData = {
            male: {
                weight: {
                    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                    datasets: [
                        { label: "97%", data: [4.8, 6.0, 7.2, 8.1, 8.8, 9.4, 9.9, 10.4, 10.8, 11.2, 11.5, 11.9, 12.2], borderColor: "#ff6b6b", borderWidth: 2, fill: false },
                        { label: "85%", data: [4.3, 5.4, 6.5, 7.3, 7.9, 8.4, 8.8, 9.2, 9.6, 9.9, 10.2, 10.5, 10.8], borderColor: "#4ecdc4", borderWidth: 2, fill: false },
                        { label: "50%", data: [3.5, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6], borderColor: "#45b7d1", borderWidth: 3, fill: false },
                        { label: "15%", data: [2.9, 3.7, 4.8, 5.5, 6.1, 6.6, 7.0, 7.4, 7.7, 8.0, 8.3, 8.5, 8.7], borderColor: "#96ceb4", borderWidth: 2, fill: false },
                        { label: "3%", data: [2.5, 3.2, 4.2, 4.9, 5.5, 6.0, 6.4, 6.8, 7.1, 7.4, 7.7, 7.9, 8.1], borderColor: "#feca57", borderWidth: 2, fill: false }
                    ]
                },
                height: {
                    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                    datasets: [
                        { label: "97%", data: [54, 59, 63, 66, 68, 70, 72, 73, 75, 76, 77, 78, 79], borderColor: "#ff6b6b", borderWidth: 2, fill: false },
                        { label: "85%", data: [52, 57, 61, 64, 66, 68, 69, 71, 72, 73, 74, 75, 76], borderColor: "#4ecdc4", borderWidth: 2, fill: false },
                        { label: "50%", data: [50, 55, 59, 62, 64, 66, 67, 69, 70, 71, 72, 73, 74], borderColor: "#45b7d1", borderWidth: 3, fill: false },
                        { label: "15%", data: [48, 53, 57, 60, 62, 64, 65, 67, 68, 69, 70, 71, 72], borderColor: "#96ceb4", borderWidth: 2, fill: false },
                        { label: "3%", data: [46, 51, 55, 58, 60, 62, 63, 65, 66, 67, 68, 69, 70], borderColor: "#feca57", borderWidth: 2, fill: false }
                    ]
                },
                head: {
                    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                    datasets: [
                        { label: "97%", data: [38, 41, 43, 44.5, 45.5, 46.5, 47, 47.5, 48, 48.5, 49, 49.5, 50], borderColor: "#ff6b6b", borderWidth: 2, fill: false },
                        { label: "85%", data: [37, 40, 42, 43.5, 44.5, 45.5, 46, 46.5, 47, 47.5, 48, 48.5, 49], borderColor: "#4ecdc4", borderWidth: 2, fill: false },
                        { label: "50%", data: [35, 38, 40, 41.5, 42.5, 43.5, 44, 44.5, 45, 45.5, 46, 46.5, 47], borderColor: "#45b7d1", borderWidth: 3, fill: false },
                        { label: "15%", data: [34, 37, 39, 40.5, 41.5, 42.5, 43, 43.5, 44, 44.5, 45, 45.5, 46], borderColor: "#96ceb4", borderWidth: 2, fill: false },
                        { label: "3%", data: [33, 36, 38, 39.5, 40.5, 41.5, 42, 42.5, 43, 43.5, 44, 44.5, 45], borderColor: "#feca57", borderWidth: 2, fill: false }
                    ]
                }
            },
            female: {
                weight: {
                    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                    datasets: [
                        { label: "97%", data: [4.6, 5.6, 6.6, 7.4, 8.0, 8.5, 8.9, 9.3, 9.7, 10.0, 10.3, 10.6, 10.9], borderColor: "#ff6b6b", borderWidth: 2, fill: false },
                        { label: "85%", data: [4.1, 5.0, 6.0, 6.7, 7.3, 7.8, 8.2, 8.6, 8.9, 9.2, 9.5, 9.8, 10.0], borderColor: "#4ecdc4", borderWidth: 2, fill: false },
                        { label: "50%", data: [3.4, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9], borderColor: "#45b7d1", borderWidth: 3, fill: false },
                        { label: "15%", data: [2.8, 3.5, 4.4, 5.0, 5.6, 6.0, 6.4, 6.7, 7.0, 7.3, 7.6, 7.8, 8.0], borderColor: "#96ceb4", borderWidth: 2, fill: false },
                        { label: "3%", data: [2.4, 3.0, 3.9, 4.5, 5.0, 5.4, 5.8, 6.1, 6.4, 6.7, 7.0, 7.2, 7.4], borderColor: "#feca57", borderWidth: 2, fill: false }
                    ]
                },
                height: {
                    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                    datasets: [
                        { label: "97%", data: [53, 58, 62, 65, 67, 69, 70, 72, 73, 74, 75, 76, 77], borderColor: "#ff6b6b", borderWidth: 2, fill: false },
                        { label: "85%", data: [51, 56, 60, 63, 65, 67, 68, 70, 71, 72, 73, 74, 75], borderColor: "#4ecdc4", borderWidth: 2, fill: false },
                        { label: "50%", data: [49, 54, 58, 61, 63, 65, 66, 68, 69, 70, 71, 72, 73], borderColor: "#45b7d1", borderWidth: 3, fill: false },
                        { label: "15%", data: [47, 52, 56, 59, 61, 63, 64, 66, 67, 68, 69, 70, 71], borderColor: "#96ceb4", borderWidth: 2, fill: false },
                        { label: "3%", data: [45, 50, 54, 57, 59, 61, 62, 64, 65, 66, 67, 68, 69], borderColor: "#feca57", borderWidth: 2, fill: false }
                    ]
                },
                head: {
                    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                    datasets: [
                        { label: "97%", data: [37, 40, 42, 43.5, 44.5, 45.5, 46, 46.5, 47, 47.5, 48, 48.5, 49], borderColor: "#ff6b6b", borderWidth: 2, fill: false },
                        { label: "85%", data: [36, 39, 41, 42.5, 43.5, 44.5, 45, 45.5, 46, 46.5, 47, 47.5, 48], borderColor: "#4ecdc4", borderWidth: 2, fill: false },
                        { label: "50%", data: [34, 37, 39, 40.5, 41.5, 42.5, 43, 43.5, 44, 44.5, 45, 45.5, 46], borderColor: "#45b7d1", borderWidth: 3, fill: false },
                        { label: "15%", data: [33, 36, 38, 39.5, 40.5, 41.5, 42, 42.5, 43, 43.5, 44, 44.5, 45], borderColor: "#96ceb4", borderWidth: 2, fill: false },
                        { label: "3%", data: [32, 35, 37, 38.5, 39.5, 40.5, 41, 41.5, 42, 42.5, 43, 43.5, 44], borderColor: "#feca57", borderWidth: 2, fill: false }
                    ]
                }
            }
        };

        // متغيرات الرسم البياني
        let growthChart;
        let currentChartType = 'weight';
        let currentGender = 'male';

        document.addEventListener('DOMContentLoaded', function() {
            // تهيئة الرسم البياني
            initGrowthChart();
            
            // تفعيل تبويبات الرسوم البيانية
            const chartTabBtns = document.querySelectorAll('.chart-tab-btn');
            
            chartTabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    chartTabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    currentChartType = btn.getAttribute('data-chart');
                    updateChart();
                });
            });
            
            // تفعيل أداة حساب النمو
            const calculateBtn = document.getElementById('calculate-growth');
            
            calculateBtn.addEventListener('click', function() {
                calculateGrowth();
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
            
            // تفعيل سجل النمو
            initGrowthTracker();
            
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
            
            // حساب النمو افتراضياً عند تحميل الصفحة
            calculateGrowth();
        });

        // تهيئة الرسم البياني
        function initGrowthChart() {
            const ctx = document.getElementById('growth-chart').getContext('2d');
            
            growthChart = new Chart(ctx, {
                type: 'line',
                data: growthData.male.weight,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'مخطط الوزن للذكور (0-12 شهر)',
                            font: {
                                size: 16,
                                family: "'Cairo', sans-serif"
                            },
                            color: '#333'
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'العمر (أشهر)',
                                font: {
                                    size: 14,
                                    family: "'Cairo', sans-serif"
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'الوزن (كجم)',
                                font: {
                                    size: 14,
                                    family: "'Cairo', sans-serif"
                                }
                            }
                        }
                    }
                }
            });
        }

        // تحديث الرسم البياني
        function updateChart() {
            const gender = document.getElementById('child-gender').value;
            const chartTitle = getChartTitle(currentChartType, gender);
            
            growthChart.data = growthData[gender][currentChartType];
            growthChart.options.plugins.title.text = chartTitle;
            growthChart.update();
        }

        // الحصول على عنوان الرسم البياني
        function getChartTitle(chartType, gender) {
            const genderText = gender === 'male' ? 'الذكور' : 'الإناث';
            const chartText = {
                'weight': 'الوزن',
                'height': 'الطول',
                'head': 'محيط الرأس'
            };
            
            return `مخطط ${chartText[chartType]} ل${genderText} (0-12 شهر)`;
        }

        // حساب مؤشرات النمو
        function calculateGrowth() {
            const gender = document.getElementById('child-gender').value;
            const years = parseInt(document.getElementById('child-years').value) || 0;
            const months = parseInt(document.getElementById('child-months').value) || 0;
            const weight = parseFloat(document.getElementById('child-weight').value) || 0;
            const height = parseInt(document.getElementById('child-height').value) || 0;
            const head = parseFloat(document.getElementById('child-head').value) || 0;
            
            const totalMonths = years * 12 + months;
            
            if (totalMonths === 0 || weight === 0 || height === 0 || head === 0) {
                document.getElementById('growth-results').innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i> الرجاء إدخال جميع البيانات المطلوبة
                    </div>
                `;
                return;
            }
            
            // تحديث الرسم البياني بناءً على الجنس
            currentGender = gender;
            updateChart();
            
            // حساب مؤشر كتلة الجسم (BMI)
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            
            // تقييم الوزن حسب العمر
            const weightStatus = evaluateWeightForAge(weight, totalMonths, gender);
            
            // تقييم الطول حسب العمر
            const heightStatus = evaluateHeightForAge(height, totalMonths, gender);
            
            // تقييم محيط الرأس حسب العمر
            const headStatus = evaluateHeadForAge(head, totalMonths, gender);
            
            // تقييم مؤشر كتلة الجسم
            const bmiStatus = evaluateBMI(bmi, totalMonths, gender);
            
            // عرض النتائج
            const resultsHTML = `
                <div class="results-container">
                    <div class="results-header">
                        <h3><i class="fas fa-chart-pie"></i> نتائج تقييم النمو</h3>
                        <span class="results-age">العمر: ${totalMonths} شهر</span>
                    </div>
                    
                    <div class="results-grid">
                        <div class="result-card ${weightStatus.class}">
                            <h4><i class="fas fa-weight"></i> الوزن</h4>
                            <div class="result-value">${weight.toFixed(1)} كجم</div>
                            <div class="result-status">${weightStatus.text}</div>
                            <p>${weightStatus.description}</p>
                        </div>
                        
                        <div class="result-card ${heightStatus.class}">
                            <h4><i class="fas fa-ruler-vertical"></i> الطول</h4>
                            <div class="result-value">${height} سم</div>
                            <div class="result-status">${heightStatus.text}</div>
                            <p>${heightStatus.description}</p>
                        </div>
                        
                        <div class="result-card ${headStatus.class}">
                            <h4><i class="fas fa-brain"></i> محيط الرأس</h4>
                            <div class="result-value">${head.toFixed(1)} سم</div>
                            <div class="result-status">${headStatus.text}</div>
                            <p>${headStatus.description}</p>
                        </div>
                        
                        <div class="result-card ${bmiStatus.class}">
                            <h4><i class="fas fa-balance-scale"></i> مؤشر كتلة الجسم</h4>
                            <div class="result-value">${bmi.toFixed(1)}</div>
                            <div class="result-status">${bmiStatus.text}</div>
                            <p>${bmiStatus.description}</p>
                        </div>
                    </div>
                    
                    <div class="results-summary">
                        <h4><i class="fas fa-clipboard-check"></i> التوصيات العامة</h4>
                        <ul>
                            <li>${getGeneralRecommendation(weightStatus, heightStatus)}</li>
                            <li>تابعي نمو طفلك بانتظام وسجلي القياسات كل شهر</li>
                            <li>التزمي بمواعيد زيارات الطبيب للفحوصات الدورية</li>
                            <li>قدمي تغذية متوازنة ومناسبة لعمر الطفل</li>
                        </ul>
                    </div>
                </div>
            `;
            
            document.getElementById('growth-results').innerHTML = resultsHTML;
        }

        // تقييم الوزن حسب العمر
        function evaluateWeightForAge(weight, ageMonths, gender) {
            // بيانات تقريبية للمتوسطات
            const avgWeights = {
                male: [3.5, 4.5, 5.6, 6.4, 7.0, 7.5, 7.9, 8.3, 8.6, 8.9, 9.2, 9.4, 9.6],
                female: [3.4, 4.2, 5.1, 5.8, 6.4, 6.9, 7.3, 7.6, 7.9, 8.2, 8.5, 8.7, 8.9]
            };
            
            if (ageMonths > 12) ageMonths = 12;
            const avgWeight = avgWeights[gender][ageMonths];
            const percentage = (weight / avgWeight) * 100;
            
            if (percentage > 120) {
                return {
                    class: 'warning',
                    text: 'أعلى من المتوسط',
                    description: 'الوزن أعلى من المتوقع لعمره. استشيري الطبيب إذا كان الوزن مستمراً في الارتفاع.'
                };
            } else if (percentage >= 90 && percentage <= 110) {
                return {
                    class: 'normal',
                    text: 'طبيعي',
                    description: 'الوزن ضمن المعدل الطبيعي لعمر الطفل. استمري في التغذية المناسبة.'
                };
            } else if (percentage >= 80 && percentage < 90) {
                return {
                    class: 'monitor',
                    text: 'يحتاج مراقبة',
                    description: 'الوزن أقل قليلاً من المتوسط. راجعي تغذية الطفل مع الطبيب.'
                };
            } else {
                return {
                    class: 'warning',
                    text: 'أقل من المتوسط',
                    description: 'الوزن أقل من المتوقع لعمره. راجعي الطبيب لفحص شامل.'
                };
            }
        }

        // تقييم الطول حسب العمر
        function evaluateHeightForAge(height, ageMonths, gender) {
            // بيانات تقريبية للمتوسطات
            const avgHeights = {
                male: [50, 55, 59, 62, 64, 66, 67, 69, 70, 71, 72, 73, 74],
                female: [49, 54, 58, 61, 63, 65, 66, 68, 69, 70, 71, 72, 73]
            };
            
            if (ageMonths > 12) ageMonths = 12;
            const avgHeight = avgHeights[gender][ageMonths];
            const percentage = (height / avgHeight) * 100;
            
            if (percentage > 105) {
                return {
                    class: 'normal',
                    text: 'أطول من المتوسط',
                    description: 'الطول أعلى من المتوسط. هذا مؤشر إيجابي إذا كان الوزن متناسباً.'
                };
            } else if (percentage >= 95 && percentage <= 105) {
                return {
                    class: 'normal',
                    text: 'طبيعي',
                    description: 'الطول ضمن المعدل الطبيعي لعمر الطفل.'
                };
            } else if (percentage >= 90 && percentage < 95) {
                return {
                    class: 'monitor',
                    text: 'يحتاج مراقبة',
                    description: 'الطول أقل قليلاً من المتوسط. تأكدي من التغذية المناسبة.'
                };
            } else {
                return {
                    class: 'warning',
                    text: 'أقصر من المتوسط',
                    description: 'الطول أقل من المتوقع لعمره. راجعي الطبيب للفحص.'
                };
            }
        }

        // تقييم محيط الرأس حسب العمر
        function evaluateHeadForAge(head, ageMonths, gender) {
            // بيانات تقريبية للمتوسطات
            const avgHeads = {
                male: [35, 38, 40, 41.5, 42.5, 43.5, 44, 44.5, 45, 45.5, 46, 46.5, 47],
                female: [34, 37, 39, 40.5, 41.5, 42.5, 43, 43.5, 44, 44.5, 45, 45.5, 46]
            };
            
            if (ageMonths > 12) ageMonths = 12;
            const avgHead = avgHeads[gender][ageMonths];
            const percentage = (head / avgHead) * 100;
            
            if (percentage > 105) {
                return {
                    class: 'warning',
                    text: 'أكبر من المتوسط',
                    description: 'محيط الرأس أكبر من المتوقع. راجعي الطبيب لاستبعاد أي مشاكل.'
                };
            } else if (percentage >= 95 && percentage <= 105) {
                return {
                    class: 'normal',
                    text: 'طبيعي',
                    description: 'محيط الرأس ضمن المعدل الطبيعي لنمو الدماغ.'
                };
            } else if (percentage >= 90 && percentage < 95) {
                return {
                    class: 'monitor',
                    text: 'يحتاج مراقبة',
                    description: 'محيط الرأس أقل قليلاً من المتوسط. تابعي النمو مع الطبيب.'
                };
            } else {
                return {
                    class: 'warning',
                    text: 'أصغر من المتوسط',
                    description: 'محيط الرأس أقل من المتوقع. راجعي الطبيب للفحص العصبي.'
                };
            }
        }

        // تقييم مؤشر كتلة الجسم
        function evaluateBMI(bmi, ageMonths, gender) {
            if (ageMonths <= 12) {
                // معايير تقريبية للرضع
                if (bmi > 18) {
                    return {
                        class: 'warning',
                        text: 'مرتفع',
                        description: 'مؤشر كتلة الجسم مرتفع. راجعي تغذية الطفل مع الطبيب.'
                    };
                } else if (bmi >= 14 && bmi <= 18) {
                    return {
                        class: 'normal',
                        text: 'طبيعي',
                        description: 'مؤشر كتلة الجسم ضمن المعدل الطبيعي للرضع.'
                    };
                } else {
                    return {
                        class: 'warning',
                        text: 'منخفض',
                        description: 'مؤشر كتلة الجسم منخفض. قد يحتاج الطفل لمزيد من التغذية.'
                    };
                }
            }
            
            return {
                class: 'normal',
                text: 'غير متاح',
                description: 'حاسبة مؤشر كتلة الجسم للأطفال فوق سنة متوفرة في زيارة الطبيب.'
            };
        }

        // الحصول على التوصية العامة
        function getGeneralRecommendation(weightStatus, heightStatus) {
            if (weightStatus.class === 'normal' && heightStatus.class === 'normal') {
                return 'نمو الطفل طبيعي ومتوازن. استمري في العناية والتغذية المناسبة.';
            } else if (weightStatus.class === 'warning' && heightStatus.class === 'normal') {
                return 'الوزن يحتاج اهتماماً مع الحفاظ على الطول الطبيعي. راجعي تغذية الطفل.';
            } else if (weightStatus.class === 'normal' && heightStatus.class === 'warning') {
                return 'الطول يحتاج متابعة مع الحفاظ على الوزن الطبيعي. تأكدي من التغذية الكافية.';
            } else {
                return 'النمو يحتاج لمتابعة طبية. راجعي طبيب الأطفال للفحص الشامل.';
            }
        }

        // تهيئة سجل متابعة النمو
        function initGrowthTracker() {
            // تحميل البيانات من localStorage
            const trackerData = JSON.parse(localStorage.getItem('growthTracker')) || [];
            
            // عرض البيانات في الجدول
            displayTrackerData(trackerData);
            
            // تفعيل إضافة قياس جديد
            const addBtn = document.getElementById('add-measurement');
            const clearBtn = document.getElementById('clear-tracker');
            const printBtn = document.getElementById('print-tracker');
            
            addBtn.addEventListener('click', addMeasurement);
            clearBtn.addEventListener('click', clearTracker);
            printBtn.addEventListener('click', printTracker);
        }

        // عرض بيانات سجل النمو
        function displayTrackerData(data) {
            const tbody = document.getElementById('tracker-body');
            
            if (data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-tracker">
                            <i class="fas fa-clipboard-list"></i>
                            <p>لا توجد قياسات مسجلة بعد. أضفي أول قياس لطفلك.</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // ترتيب البيانات من الأحدث إلى الأقدم
            data.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            let html = '';
            data.forEach((item, index) => {
                html += `
                    <tr>
                        <td>${item.date}</td>
                        <td>${item.age} شهر</td>
                        <td>${item.weight} كجم</td>
                        <td>${item.height} سم</td>
                        <td>${item.head} سم</td>
                        <td>${item.notes || '-'}</td>
                    </tr>
                `;
            });
            
            tbody.innerHTML = html;
        }

        // إضافة قياس جديد
        function addMeasurement() {
            const date = document.getElementById('track-date').value;
            const age = document.getElementById('track-age').value;
            const weight = document.getElementById('track-weight').value;
            const height = document.getElementById('track-height').value;
            const head = document.getElementById('track-head').value;
            const notes = document.getElementById('track-notes').value;
            
            if (!date || !age || !weight || !height || !head) {
                alert('الرجاء ملء جميع الحقول المطلوبة (التاريخ، العمر، الوزن، الطول، محيط الرأس)');
                return;
            }
            
            // تحميل البيانات الحالية
            const trackerData = JSON.parse(localStorage.getItem('growthTracker')) || [];
            
            // إضافة القياس الجديد
            trackerData.push({
                date,
                age: parseInt(age),
                weight: parseFloat(weight),
                height: parseInt(height),
                head: parseFloat(head),
                notes
            });
            
            // حفظ البيانات
            localStorage.setItem('growthTracker', JSON.stringify(trackerData));
            
            // تحديث العرض
            displayTrackerData(trackerData);
            
            // مسح النموذج
            document.getElementById('track-date').value = '';
            document.getElementById('track-age').value = '';
            document.getElementById('track-weight').value = '';
            document.getElementById('track-height').value = '';
            document.getElementById('track-head').value = '';
            document.getElementById('track-notes').value = '';
            
            // إشعار النجاح
            alert('تم إضافة القياس بنجاح إلى سجل النمو!');
        }

        // مسح سجل النمو
        function clearTracker() {
            if (confirm('هل أنت متأكدة من مسح جميع قياسات النمو؟ لا يمكن التراجع عن هذا الإجراء.')) {
                localStorage.removeItem('growthTracker');
                displayTrackerData([]);
                alert('تم مسح سجل النمو بنجاح.');
            }
        }

        // طباعة سجل النمو
        function printTracker() {
            const trackerData = JSON.parse(localStorage.getItem('growthTracker')) || [];
            
            if (trackerData.length === 0) {
                alert('لا توجد بيانات لطباعتها. أضفي قياسات أولاً.');
                return;
            }
            
            // إنشاء نافذة طباعة
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <title>سجل نمو الطفل</title>
                    <style>
                        body { font-family: 'Cairo', sans-serif; padding: 20px; }
                        h1 { color: #2e7d32; text-align: center; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: center; }
                        th { background-color: #e8f5e9; }
                        .print-date { text-align: left; margin-bottom: 20px; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>سجل متابعة نمو الطفل</h1>
                    <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
                    <table>
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>العمر (شهر)</th>
                                <th>الوزن (كجم)</th>
                                <th>الطول (سم)</th>
                                <th>محيط الرأس (سم)</th>
                                <th>ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${trackerData.map(item => `
                                <tr>
                                    <td>${item.date}</td>
                                    <td>${item.age}</td>
                                    <td>${item.weight}</td>
                                    <td>${item.height}</td>
                                    <td>${item.head}</td>
                                    <td>${item.notes || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="no-print" style="margin-top: 30px; text-align: center;">
                        <button onclick="window.print()">طباعة</button>
                        <button onclick="window.close()">إغلاق</button>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
