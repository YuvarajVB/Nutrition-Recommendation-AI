🥗 Personalized Nutrition Recommendation System

An AI-powered web application that analyzes user health data and medical reports to generate personalized diet plans, nutrition insights, and meal recommendations using Machine Learning and OCR.

📌 Project Overview

The Personalized Nutrition Recommendation System is designed to help individuals make informed dietary decisions based on their health conditions, lifestyle, and nutritional requirements.
The system combines OCR-based medical report analysis, machine learning models, and an interactive dashboard to deliver customized nutrition plans without the need for constant human consultation.

✨ Key Features

📄 Medical Report Upload & OCR

Extracts health markers such as blood glucose, cholesterol, hemoglobin, and vitamin levels

🤖 AI & Machine Learning Analysis

Predicts calorie needs and nutritional requirements

🥗 Personalized Diet Plans

Custom meal plans based on health conditions and goals

📊 Nutrition Dashboard

Displays calories, macros, deficiencies, and recommendations

📅 Meal Planner

Breakfast, lunch, snacks, and dinner distribution

📥 Downloadable Nutrition Report

Final personalized recommendation summary

🧠 Algorithms Used

LightGBM (LGBM) – Predicts calorie and nutrition requirements efficiently

BMI Calculation – Classifies weight category

BMR (Mifflin–St Jeor Equation) – Baseline calorie estimation

Rule-Based Filtering – Health-condition-based food filtering

Tesseract OCR – Extracts medical data from uploaded reports

🛠️ Tech Stack
Frontend

Streamlit

HTML/CSS (custom styling)

Backend

Python

Machine Learning & Data

scikit-learn

LightGBM

pandas, numpy

OCR

Tesseract OCR

pytesseract

pdf2image

Database

SQLite / MongoDB

📂 System Workflow

User logs in and enters personal health details

Medical reports are uploaded and processed via OCR

Extracted data is analyzed using ML models

Nutrition profile and health markers are generated

Personalized diet plan and meal recommendations are displayed

Final nutrition report is available for download

🚀 How to Run the Project
1️⃣ Install Dependencies
pip install streamlit pandas numpy scikit-learn lightgbm pytesseract pdf2image

2️⃣ Run the Application
streamlit run app.py

🎯 Use Cases

Personalized diet planning

Managing lifestyle-related diseases (diabetes, obesity, anemia)

Nutrition monitoring for fitness and wellness

Academic and research purposes

📈 Performance Highlights

Accurate calorie and macro prediction

OCR extraction from real medical reports

Fast inference suitable for real-time recommendations

🔮 Future Enhancements

Mobile application integration

Deep learning models for advanced recommendations

IoT and wearable device integration

Multi-language medical report support

📝 Conclusion

This project demonstrates how AI, machine learning, and OCR can be combined to create an intelligent, scalable, and user-friendly nutrition assistant.
It empowers users to take control of their health through data-driven, personalized nutrition planning.
