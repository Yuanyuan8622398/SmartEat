let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    const auth = firebase.auth();
    
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadUserProfile();
        } else {
            window.location.href = 'login.html';
        }
    });
    
    document.getElementById("saveProfileBtn").addEventListener("click", saveProfile);
    
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

async function loadUserProfile() {
    try {
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const profile = userData.profile || {};
            
            if (profile.gender) {
                const genderRadio = document.querySelector(`input[name="gender"][value="${profile.gender}"]`);
                if (genderRadio) genderRadio.checked = true;
            }
            
            if (profile.age) document.getElementById("age").value = profile.age;
            if (profile.weight) document.getElementById("kg").value = profile.weight;
            if (profile.height) document.getElementById("height").value = profile.height;
            
            if (profile.diet) {
                const dietRadio = document.querySelector(`input[name="diet"][value="${profile.diet}"]`);
                if (dietRadio) dietRadio.checked = true;
            }
            
            if (profile.foodType) {
                const typeRadio = document.querySelector(`input[name="type"][value="${profile.foodType}"]`);
                if (typeRadio) typeRadio.checked = true;
            }
        }
    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

async function saveProfile() {
    try {
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const age = document.getElementById("age").value;
        const weight = document.getElementById("kg").value;
        const height = document.getElementById("height").value;
        const diet = document.querySelector('input[name="diet"]:checked')?.value;
        const foodType = document.querySelector('input[name="type"]:checked')?.value;
        
        if (!age || !weight || !height) {
            alert("Please fill in all required fields");
            return;
        }
        
        const heightInM = parseFloat(height);
        const weightInKg = parseFloat(weight);
        const bmi = (weightInKg / (heightInM * heightInM)).toFixed(1);
        
        let bmiStatus = '';
        if (bmi < 18.5) bmiStatus = 'Underweight';
        else if (bmi < 25) bmiStatus = 'Healthy';
        else if (bmi < 30) bmiStatus = 'Overweight';
        else bmiStatus = 'Obese';

        const profileData = {
            profile: {
                gender: gender || '',
                age: parseInt(age),
                weight: parseFloat(weight),
                height: parseFloat(height),
                diet: diet || '',
                foodType: foodType || '',
                bmi: bmi,
                bmiStatus: bmiStatus,
                updatedAt: new Date().toISOString()
            },
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        const db = firebase.firestore();
        await db.collection('users').doc(currentUser.uid).update(profileData);
        localStorage.setItem('userProfile', JSON.stringify(profileData.profile));
        
        alert('Profile saved successfully!');
        window.location.href = 'main.html';
        
    } catch (error) {
        console.error("Error saving profile:", error);
        alert('Error saving profile. Please try again.');
    }
}

function logout() {
    if (confirm('Are you sure you want to log out?')) {
        const auth = firebase.auth();
        
        auth.signOut()
            .then(() => {
                console.log('User logged out successfully');
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'login.html';
            })
            .catch((error) => {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            });
    }
}

window.logout = logout;