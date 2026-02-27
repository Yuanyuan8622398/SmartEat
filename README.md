# 🍎 SmartEat AI  
Welcome to AI-Powered Food Recognition & Nutrition Analysis System

---

## 📌 Project Overview

Our SmartEat is an AI-powered application that analyzes food images and provides detailed nutritional information.  
The system helps users make informed food decisions and encourages healthier eating habits.

---

## 🎯 Problem Statement

Malaysia is facing a rising obesity problem, with an increasing percentage of adults having BMI ≥ 25.  
Many people lack awareness of the nutritional content in their daily meals.

SmartEat aims to solve this by providing instant food nutrition analysis using AI.

---

## 🚀 Features

- 📸 Food image upload
- 🤖 AI-based food recognition
- 📊 Nutrition analysis (calories, protein, fat, carbs and others)
- 🧠 Personalized dietary guidance
- ⚡ Fast and easy decision-making support

---

## 💡 Implementation Details

1. User uploads or scans a food image

2. Image is sent to Gemini AI for analysis

3. Gemini returns food name, nutrition data, and nutrient deficiencies

4. Deficiency data is stored in Firebase

5. Recommendation system retrieves deficiency data

6. SmartEat displays personalized food recommendations

---

## 🛠️ Technical architecture

The SmartEat system is composed of several key components:

### Frontend

The frontend is built using HTML and CSS, providing a simple and user-friendly interface where users can upload food images, view nutritional analysis, and receive food recommendations.

### Backend Logic

The application logic is implemented using JavaScript, which handles user interactions, processes AI responses, and manages data communication between the frontend and backend services.

### AI Nutrition Analysis

Food images uploaded by users are sent to Gemini AI, which analyzes the image and returns structured data including:
- Food name
- Nutritional information
- Detected nutrient deficiencies
This AI-driven analysis enables SmartEat to automatically evaluate users’ dietary intake.

### Database and Cloud Services
SmartEat uses Firebase as the backend database and cloud service. Firebase is responsible for:
- Storing user nutrition records
- Saving detected nutrient deficiencies
- Supporting real-time data retrieval for recommendations

### Recommendation Engine
The recommendation system retrieves nutrient deficiency data from Firebase and suggests suitable foods that can help users balance their nutrition intake.

---

## Challenges Faced
### 🎨 UI Design and Styling Iterations

During the early development stage, the team did not finalize the UI design before implementing the frontend. As a result, the CSS styling had to be repeatedly modified whenever the layout or design changed.

To resolve this issue, the team decided to finalize the UI design collaboratively before implementing the CSS, which significantly reduced unnecessary rework and improved development efficiency.

### 🔗 API Integration and Debugging

Another challenge occurred during the implementation of external APIs. Initially, the application produced incorrect outputs due to improper API integration and response handling.

To overcome this, additional time was spent researching and understanding the correct implementation methods for APIs such as Gemini AI for food analysis and Google Maps for location-based restaurant searching. After adjusting the request structure and response parsing, the system was able to return accurate and consistent results.

---

## 🚀 Future Roadmap

In the future, SmartEat aims to enhance its AI-powered food analysis by improving food recognition accuracy and expanding the nutrition database to support a wider variety of dishes, especially local Malaysian cuisine. We also plan to refine the nutrient analysis pipeline to provide more precise dietary insights and better detection of nutrient deficiencies. Additionally, SmartEat could integrate real-time restaurant menu data and location services to deliver more accurate and context-aware food recommendations.

Beyond the current prototype, SmartEat has the potential to evolve into a comprehensive personal nutrition assistant platform. Future developments may include a mobile application, a personal nutrition tracking dashboard, and integration with wearable health devices to monitor users’ dietary patterns over time. These improvements would allow SmartEat to provide smarter recommendations and help users maintain healthier lifestyles through continuous data-driven guidance.

---

## 🖥️ How to Run This Project

### 1️⃣ Download file

### 2️⃣ Run the index.html with live server in VS code

---

## 👥 Our Team

### Team Name : jet2holiday

### Team Member:
- Chun Zhen Yao
- Chai Xin Yi
- Chai Yi Cheng (GDGoC Member from UM)
- Tan Xin Yu (GDGoC Member from TARUMT)

---


