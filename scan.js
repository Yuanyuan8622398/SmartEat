const GEMINI_API_KEY = "AIzaSyB9Akl1PtVZp96-paMkXbfg11ZhGcn-ac0";

document.addEventListener("DOMContentLoaded", () => {
    const cameraSection = document.getElementById("cameraSection");
    const uploadSection = document.getElementById("uploadSection");
    const cameraModeBtn = document.getElementById("cameraModeBtn");
    const uploadModeBtn = document.getElementById("uploadModeBtn");
    const cameraStream = document.getElementById("cameraStream");
    const captureBtn = document.getElementById("captureBtn");
    const fileInput = document.getElementById("fileInput");
    const uploadBtn = document.getElementById("uploadBtn");
    const uploadArea = document.getElementById("uploadArea");
    const uploadPreview = document.getElementById("uploadPreview");
    const previewImage = document.getElementById("previewImage");
    const removeImageBtn = document.getElementById("removeImageBtn");
    const analyzeUploadBtn = document.getElementById("analyzeUploadBtn");
    const analysisResult = document.getElementById("analysisResult");
    const closeResultBtn = document.getElementById("closeResultBtn");
    const nutritionList = document.getElementById("nutritionList");
    const deficiencyTags = document.getElementById("deficiencyTags");
    const recommendationContent = document.getElementById("recommendationContent");
    const foodNameEl = document.getElementById("foodName");
    const foodBrandEl = document.getElementById("foodBrand");
    const foodIconEl = document.getElementById("foodIcon");
    const nutritionScoreEl = document.getElementById("nutritionScore");
    const scoreBarEl = document.getElementById("scoreBar");
    const scoreGradeEl = document.getElementById("scoreGrade");

    cameraModeBtn.addEventListener("click", () => {
        cameraModeBtn.classList.add("active");
        uploadModeBtn.classList.remove("active");
        cameraSection.style.display = "block";
        uploadSection.style.display = "none";
    });

    uploadModeBtn.addEventListener("click", () => {
        uploadModeBtn.classList.add("active");
        cameraModeBtn.classList.remove("active");
        cameraSection.style.display = "none";
        uploadSection.style.display = "block";
    });

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                cameraStream.srcObject = stream;
            })
            .catch(() => {
                showMessage("Camera access denied - using upload mode");
            });
    }

    captureBtn.addEventListener("click", () => {
        if (!cameraStream.srcObject) {
            showMessage("Camera not available - please use upload");
            return;
        }
        
        const canvas = document.createElement("canvas");
        canvas.width = cameraStream.videoWidth || 640;
        canvas.height = cameraStream.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(cameraStream, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        analyzeWithGemini(imageData);
    });

    uploadBtn.addEventListener("click", () => fileInput.click());
    uploadArea.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (ev) {
            previewImage.src = ev.target.result;
            uploadPreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    });

    removeImageBtn.addEventListener("click", () => {
        fileInput.value = "";
        previewImage.src = "";
        uploadPreview.style.display = "none";
    });

    analyzeUploadBtn.addEventListener("click", () => {
        if (!previewImage.src) {
            showMessage("Please select an image first");
            return;
        }
        analyzeWithGemini(previewImage.src);
    });

    closeResultBtn.addEventListener("click", () => {
        analysisResult.style.display = "none";
    });

    async function analyzeWithGemini(imageData) {
        showLoading();

        try {
            const base64Data = imageData.split(',')[1];
            
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
            
            console.log("📤 Sending to Gemini 2.0 Flash...");

            const prompt = `Analyze this food image and return a JSON object with:
            {
              "name": "food name",
              "calories": number,
              "protein": number (grams),
              "carbs": number (grams),
              "fat": number (grams),
              "fiber": number (grams),
              "healthScore": number 0-100,
              "deficiencies": ["Vitamin D", "Iron"],
              "recommendations": [
                {"icon": "🥗", "name": "suggestion", "desc": "explanation"}
              ]
            }
            
            Return ONLY the JSON object, no other text.`;
            
            const requestBody = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Data
                            }
                        }
                    ]
                }]
            };

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error:", errorText);
                showMessage("⚠️ Using demo data (API unavailable)");
                showDemoData();
                return;
            }

            const data = await response.json();
            console.log("✅ Gemini response:", data);

            const text = data.candidates[0].content.parts[0].text;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) {
                throw new Error("No JSON found");
            }

            const foodData = JSON.parse(jsonMatch[0]);

            const nutrition = [
                { name: "Calories", value: foodData.calories + " kcal", percent: Math.round(foodData.calories/20), daily: Math.round(foodData.calories/20) + "% DV" },
                { name: "Protein", value: foodData.protein + "g", percent: Math.round(foodData.protein*2), daily: Math.round(foodData.protein*2) + "% DV" },
                { name: "Carbs", value: foodData.carbs + "g", percent: Math.round(foodData.carbs/3), daily: Math.round(foodData.carbs/3) + "% DV" },
                { name: "Fat", value: foodData.fat + "g", percent: Math.round(foodData.fat*1.5), daily: Math.round(foodData.fat*1.5) + "% DV" }
            ];
            
            if (foodData.fiber) {
                nutrition.push({ 
                    name: "Fiber", 
                    value: foodData.fiber + "g", 
                    percent: Math.round(foodData.fiber*4), 
                    daily: Math.round(foodData.fiber*4) + "% DV" 
                });
            }

            const analysis = {
                name: foodData.name || "Unknown Food",
                brand: "Gemini AI",
                icon: "🤖",
                score: foodData.healthScore || 75,
                nutrition: nutrition,
                deficiencies: foodData.deficiencies || ["Vitamin D", "Fiber"],
                recommendations: foodData.recommendations || [
                    { icon: "🥗", name: "Add vegetables", desc: "Boost nutrients" }
                ]
            };

            hideLoading();
            renderAnalysis(analysis);
            localStorage.setItem("deficiencies", JSON.stringify(analysis.deficiencies));
            showMessage(`✅ Gemini detected: ${analysis.name}`);

        } catch (error) {
            console.error("❌ Error:", error);
            hideLoading();
            showDemoData();
        }
    }

    function showDemoData() {
        showLoading();
        
        setTimeout(() => {
            hideLoading();
            
            const foods = [
                {
                    name: "Grilled Chicken Salad",
                    brand: "Fresh Bowl",
                    icon: "🥗",
                    score: 88,
                    nutrition: [
                        { name: "Calories", value: "320 kcal", percent: 16, daily: "16% DV" },
                        { name: "Protein", value: "28g", percent: 56, daily: "56% DV" },
                        { name: "Carbs", value: "12g", percent: 4, daily: "4% DV" },
                        { name: "Fat", value: "18g", percent: 23, daily: "23% DV" },
                        { name: "Fiber", value: "6g", percent: 21, daily: "21% DV" }
                    ],
                    deficiencies: ["Vitamin D", "Iron"],
                    recommendations: [
                        { icon: "🥦", name: "Add Broccoli", desc: "Boosts Vitamin C" },
                        { icon: "🥕", name: "Add Carrots", desc: "Great for Vitamin A" }
                    ]
                },
                {
                    name: "Salmon Bowl",
                    brand: "Sea Fresh",
                    icon: "🐟",
                    score: 94,
                    nutrition: [
                        { name: "Calories", value: "450 kcal", percent: 22, daily: "22% DV" },
                        { name: "Protein", value: "34g", percent: 68, daily: "68% DV" },
                        { name: "Carbs", value: "35g", percent: 12, daily: "12% DV" },
                        { name: "Fat", value: "22g", percent: 28, daily: "28% DV" },
                        { name: "Omega-3", value: "3.2g", percent: 100, daily: "100% DV" }
                    ],
                    deficiencies: ["Calcium", "Vitamin D"],
                    recommendations: [
                        { icon: "🥬", name: "Add Spinach", desc: "Boosts iron" },
                        { icon: "🥑", name: "Add Avocado", desc: "Healthy fats" }
                    ]
                },
                {
                    name: "Beef Burger",
                    brand: "Burger House",
                    icon: "🍔",
                    score: 45,
                    nutrition: [
                        { name: "Calories", value: "850 kcal", percent: 42, daily: "42% DV" },
                        { name: "Protein", value: "32g", percent: 64, daily: "64% DV" },
                        { name: "Carbs", value: "65g", percent: 22, daily: "22% DV" },
                        { name: "Fat", value: "48g", percent: 62, daily: "62% DV" },
                        { name: "Sodium", value: "1200mg", percent: 52, daily: "52% DV" }
                    ],
                    deficiencies: ["Vitamin C", "Fiber"],
                    recommendations: [
                        { icon: "🥗", name: "Add Salad", desc: "Adds nutrients" },
                        { icon: "🍎", name: "Apple instead of fries", desc: "More fiber" }
                    ]
                }
            ];
            
            const randomFood = foods[Math.floor(Math.random() * foods.length)];
            renderAnalysis(randomFood);
            localStorage.setItem("deficiencies", JSON.stringify(randomFood.deficiencies));
            showMessage("📱 Demo data (API unavailable)");
        }, 2000);
    }

    function renderAnalysis(data) {
        foodNameEl.textContent = data.name;
        foodBrandEl.textContent = data.brand;
        foodIconEl.textContent = data.icon;
        
        const score = data.score;
        nutritionScoreEl.textContent = score;
        scoreBarEl.style.width = score + "%";
        
        if (score >= 90) {
            scoreGradeEl.textContent = "A+";
            scoreGradeEl.className = "score-grade grade-a";
        } else if (score >= 80) {
            scoreGradeEl.textContent = "A";
            scoreGradeEl.className = "score-grade grade-a";
        } else if (score >= 70) {
            scoreGradeEl.textContent = "B";
            scoreGradeEl.className = "score-grade grade-b";
        } else if (score >= 60) {
            scoreGradeEl.textContent = "C";
            scoreGradeEl.className = "score-grade grade-c";
        } else {
            scoreGradeEl.textContent = "D";
            scoreGradeEl.className = "score-grade grade-d";
        }

        nutritionList.innerHTML = "";
        data.nutrition.forEach(n => {
            const item = document.createElement("div");
            item.className = "nutrition-item";
            item.innerHTML = `
                <div class="nutrition-info">
                    <span class="nutrition-name">${n.name}</span>
                    <span class="nutrition-value">${n.value}</span>
                </div>
                <div class="nutrition-bar-container">
                    <div class="nutrition-bar" style="width: ${n.percent}%"></div>
                </div>
                <div class="nutrition-daily">${n.daily}</div>
            `;
            nutritionList.appendChild(item);
        });

        deficiencyTags.innerHTML = "";
        if (data.deficiencies && data.deficiencies.length > 0) {
            data.deficiencies.forEach(d => {
                const span = document.createElement("span");
                span.className = "deficiency-tag";
                span.textContent = d;
                deficiencyTags.appendChild(span);
            });
            document.getElementById("deficiencyAlert").style.display = "flex";
        } else {
            document.getElementById("deficiencyAlert").style.display = "none";
        }

        recommendationContent.innerHTML = "";
        data.recommendations.forEach(r => {
            const div = document.createElement("div");
            div.className = "recommendation-item";
            div.innerHTML = `
                <div class="rec-icon">${r.icon}</div>
                <div class="rec-content">
                    <span class="rec-title">${r.name}</span>
                    <span class="rec-desc">${r.desc}</span>
                </div>
            `;
            recommendationContent.appendChild(div);
        });

        analysisResult.style.display = "flex";
    }

    function showLoading() {
        if (document.querySelector(".scan-loading")) return;
        const loader = document.createElement("div");
        loader.className = "scan-loading";
        loader.innerHTML = `<div class="loading-spinner"></div><p>Gemini AI analyzing your food...</p>`;
        document.body.appendChild(loader);
    }

    function hideLoading() {
        const loader = document.querySelector(".scan-loading");
        if (loader) loader.remove();
    }

    function showMessage(text) {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            z-index: 3000;
        `;
        msg.textContent = text;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
    }
});