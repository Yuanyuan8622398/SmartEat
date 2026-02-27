const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;
let authCheckCount = 0;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Main.js loaded");
    
    checkAuth();
    
    auth.onAuthStateChanged(user => {
        console.log("Main auth state changed:", user ? `✅ ${user.email}` : "❌ Logged out");
        handleUser(user);
    });
    
    setTimeout(checkAuth, 500);
    setTimeout(checkAuth, 1000);
    
    setupButtons();
});

function checkAuth() {
    authCheckCount++;
    const user = auth.currentUser;
    console.log(`Main auth check #${authCheckCount}:`, user ? `✅ ${user.email}` : "❌ No user");
    
    if (user && !currentUser) {
        handleUser(user);
    } else if (!user && currentUser) {
        handleUser(null);
    }
}

function handleUser(user) {
    currentUser = user;
    
    if (user) {
        console.log("Loading health report for:", user.email);
        loadHealthReport();
    } else {
        showLoggedOutState();
    }
}

function showLoggedOutState() {
    document.querySelector(".bmi-value").textContent = "--";
    document.querySelector(".bmi-status").textContent = "Not logged in";
    document.querySelector(".bmi-range").textContent = "Please login to see your data";
    
    document.querySelector(".nutrients-list").innerHTML = `
        <li style="text-align:center;padding:20px;">
            Please login to see your deficiencies
        </li>
    `;
}

async function loadHealthReport() {
    try {
        if (!currentUser) return;
        
        console.log("Loading health report for:", currentUser.email);
        
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const profile = userData.profile || {};
            
            const displayProfile = {
                name: profile.name || 'User',
                age: profile.age || 25,
                weight: profile.weight || 70,
                height: profile.height || 170,
                bmi: profile.bmi || '--',
                bmiStatus: profile.bmiStatus || 'Unknown',
                goal: profile.goal || 'maintenance'
            };
            
            const deficiencies = userData.deficiencies || [];
            
            updateBMIDisplay(displayProfile);
            renderDeficiencies(deficiencies);
            
            localStorage.setItem('userProfile', JSON.stringify(displayProfile));
            localStorage.setItem('deficiencies', JSON.stringify(deficiencies));
            
        } else {
            console.log("No user document found, using fallback");
            useLocalStorageFallback();
        }
        
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        useLocalStorageFallback();
    }
}

function updateBMIDisplay(profile) {
    const bmiValueEl = document.querySelector(".bmi-value");
    const bmiStatusEl = document.querySelector(".bmi-status");
    const bmiRangeEl = document.querySelector(".bmi-range");

    if (!profile || Object.keys(profile).length === 0 || profile.bmi === '--') {
        bmiValueEl.textContent = "--";
        bmiStatusEl.textContent = "No profile found";
        bmiRangeEl.textContent = "Please complete your profile";
        return;
    }

    bmiValueEl.textContent = profile.bmi;
    bmiStatusEl.textContent = profile.bmiStatus || "Unknown";
    bmiRangeEl.textContent = "Healthy BMI range: 18.5 - 24.9";
}

function renderDeficiencies(list) {
    const nutrientsList = document.querySelector(".nutrients-list");

    if (!list || list.length === 0) {
        nutrientsList.innerHTML = `
            <li style="text-align:center;padding:20px;">
                No deficiencies detected 🎉
            </li>
        `;
        return;
    }

    nutrientsList.innerHTML = "";

    list.forEach(nutrient => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "12px 0";
        li.style.borderBottom = "1px solid rgba(43, 95, 58, 0.1)";
        
        li.innerHTML = `
            <span class="nutrient-name">${nutrient}</span>
            <span class="nutrient-level low">Low</span>
        `;
        nutrientsList.appendChild(li);
    });
}

function setupButtons() {
    const updateBtn = document.querySelector(".bmi-card .health-btn");
    const detailBtn = document.querySelector(".nutrients-card .health-btn");

    if (updateBtn) {
        updateBtn.addEventListener("click", () => {
            window.location.href = "profile.html";
        });
    }

    if (detailBtn) {
        detailBtn.addEventListener("click", () => {
            window.location.href = "recommendedFood.html";
        });
    }
}

async function saveProfile(profileData) {
    try {
        if (!currentUser) {
            throw new Error('No user logged in');
        }
        
        if (profileData.weight && profileData.height) {
            const heightInM = profileData.height / 100;
            profileData.bmi = (profileData.weight / (heightInM * heightInM)).toFixed(1);
            
            if (profileData.bmi < 18.5) profileData.bmiStatus = "Underweight";
            else if (profileData.bmi < 25) profileData.bmiStatus = "Healthy";
            else if (profileData.bmi < 30) profileData.bmiStatus = "Overweight";
            else profileData.bmiStatus = "Obese";
        }
        
        profileData.updatedAt = new Date().toISOString();
        
        await db.collection('users').doc(currentUser.uid).set({
            profile: profileData
        }, { merge: true });
        
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        
        console.log('Profile saved to Firebase');
        return { success: true };
        
    } catch (error) {
        console.error('Error saving profile:', error);
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        throw error;
    }
}

async function getDietHistory() {
    try {
        if (!currentUser) return [];
        
        const scansSnapshot = await db.collection('users').doc(currentUser.uid)
            .collection('scans')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();
        
        const foodLogs = [];
        scansSnapshot.forEach(doc => {
            foodLogs.push({ id: doc.id, ...doc.data() });
        });
        
        return foodLogs;
        
    } catch (error) {
        console.error('Error getting diet history:', error);
        return JSON.parse(localStorage.getItem('foodLogs') || '[]');
    }
}

async function saveFoodScan(scanData) {
    try {
        if (!currentUser) return;
        
        const scanWithTimestamp = {
            ...scanData,
            timestamp: new Date().toISOString()
        };
        
        await db.collection('users').doc(currentUser.uid)
            .collection('scans')
            .add(scanWithTimestamp);
        
        if (scanData.deficiencies && scanData.deficiencies.length > 0) {
            await db.collection('users').doc(currentUser.uid).update({
                deficiencies: scanData.deficiencies
            });
            
            localStorage.setItem('deficiencies', JSON.stringify(scanData.deficiencies));
        }
        
        const foodLogs = JSON.parse(localStorage.getItem('foodLogs') || '[]');
        foodLogs.unshift(scanWithTimestamp);
        localStorage.setItem('foodLogs', JSON.stringify(foodLogs.slice(0, 50)));
        
    } catch (error) {
        console.error('Error saving food scan:', error);
    }
}

async function updateDeficiencies(deficiencies) {
    try {
        if (!currentUser) return;
        
        await db.collection('users').doc(currentUser.uid).update({
            deficiencies: deficiencies,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        localStorage.setItem('deficiencies', JSON.stringify(deficiencies));
        console.log('Deficiencies updated in Firebase');
        
    } catch (error) {
        console.error('Error updating deficiencies:', error);
    }
}

async function updateMealPlan(mealPlan) {
    try {
        if (!currentUser) return;
        
        await db.collection('users').doc(currentUser.uid).update({
            mealPlan: mealPlan,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        console.log('Meal plan updated in Firebase');
        
    } catch (error) {
        console.error('Error updating meal plan:', error);
    }
}

async function addToMealPlan(foodItem) {
    try {
        if (!currentUser) return;
        
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        
        let currentMealPlan = [];
        if (userDoc.exists) {
            currentMealPlan = userDoc.data().mealPlan || [];
        }
        
        const exists = currentMealPlan.some(item => item.name === foodItem.name);
        
        if (!exists) {
            const newItem = {
                ...foodItem,
                addedAt: new Date().toISOString()
            };
            currentMealPlan.push(newItem);
            
            await userRef.update({
                mealPlan: currentMealPlan
            });
            
            localStorage.setItem('mealPlan', JSON.stringify(currentMealPlan));
            console.log('Added to meal plan in Firebase');
        }
        
        return currentMealPlan;
        
    } catch (error) {
        console.error('Error adding to meal plan:', error);
    }
}

async function removeFromMealPlan(foodName) {
    try {
        if (!currentUser) return;
        
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
            let currentMealPlan = userDoc.data().mealPlan || [];
            currentMealPlan = currentMealPlan.filter(item => item.name !== foodName);
            
            await userRef.update({
                mealPlan: currentMealPlan
            });
            
            localStorage.setItem('mealPlan', JSON.stringify(currentMealPlan));
            console.log('Removed from meal plan in Firebase');
        }
        
    } catch (error) {
        console.error('Error removing from meal plan:', error);
    }
}

async function recognizeFood(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_GEMINI_KEY', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Analyze this food and return JSON with name, calories, protein, carbs, fat, healthScore, and deficiencies array" },
                        { inline_data: { mime_type: "image/jpeg", data: await fileToBase64(imageFile) } }
                    ]
                }]
            })
        });
        
        const data = await response.json();
        const result = parseGeminiResponse(data);
        
        if (result) {
            await saveFoodScan(result);
        }
        
        return result;
        
    } catch (error) {
        console.error('Error recognizing food:', error);
        
        const mockResult = {
            name: "Grilled Chicken Salad",
            calories: 320,
            protein: 28,
            carbs: 12,
            fat: 18,
            healthScore: 85,
            deficiencies: ["Vitamin D", "Iron"]
        };
        
        await saveFoodScan(mockResult);
        
        return mockResult;
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function parseGeminiResponse(data) {
    try {
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('Error parsing Gemini response:', e);
    }
    return null;
}

function useLocalStorageFallback() {
    console.log('Using localStorage fallback');
    const profile = JSON.parse(localStorage.getItem("userProfile"));
    const deficiencies = JSON.parse(localStorage.getItem("deficiencies") || '[]');
    
    updateBMIDisplay(profile);
    renderDeficiencies(deficiencies);
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        auth.signOut().then(() => {
            localStorage.clear();
            window.location.href = 'login.html';
        }).catch(error => {
            console.error('Logout error:', error);
            alert('Error logging out. Please try again.');
        });
    }
}

function displayFoodResults(data) {
    console.log('Food analysis:', data);
    
    const analysisResult = document.getElementById('analysisResult');
    if (analysisResult) {
        document.getElementById('foodName').textContent = data.name || 'Unknown Food';
        document.getElementById('nutritionScore').textContent = data.healthScore || 85;
        analysisResult.style.display = 'flex';
    }
}

window.saveProfile = saveProfile;
window.recognizeFood = recognizeFood;
window.updateDeficiencies = updateDeficiencies;
window.updateMealPlan = updateMealPlan;
window.addToMealPlan = addToMealPlan;
window.removeFromMealPlan = removeFromMealPlan;
window.logout = logout;