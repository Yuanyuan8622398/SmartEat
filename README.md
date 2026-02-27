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

## 🛠️ Technologies Used

The SmartEat system is composed of several key components:

###Frontend

The frontend is built using HTML and CSS, providing a simple and user-friendly interface where users can upload food images, view nutritional analysis, and receive food recommendations.

###Backend Logic

The application logic is implemented using JavaScript, which handles user interactions, processes AI responses, and manages data communication between the frontend and backend services.

###AI Nutrition Analysis

Food images uploaded by users are sent to Gemini AI, which analyzes the image and returns structured data including:
- Food name
- Nutritional information
- Detected nutrient deficiencies
This AI-driven analysis enables SmartEat to automatically evaluate users’ dietary intake.

###Database and Cloud Services
SmartEat uses Firebase as the backend database and cloud service. Firebase is responsible for:
- Storing user nutrition records
- Saving detected nutrient deficiencies
- Supporting real-time data retrieval for recommendations

###Recommendation Engine
The recommendation system retrieves nutrient deficiency data from Firebase and suggests suitable foods that can help users balance their nutrition intake.

---

## 🖥️ How to Run This Project

### 1️⃣ Download file

### 2️⃣ Run the index.html with live server in VS code

---

## 👥 Team Members

- Chun Zhen Yao
- Chai Xin Yi
- Chai Yi Cheng
- Tan Xin Yu

---


