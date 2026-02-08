# 🏎️ F1 Dashboard Website

A **full-stack Formula 1 website** providing a live-like F1 experience with **driver statistics, team standings, race predictions, and comparisons**. Built with a **Flask (Python) backend**, **HTML/CSS/JS frontend**, and **AI-powered race predictions**.

---

<img width="1882" height="951" alt="Screenshot 2026-02-08 140536" src="https://github.com/user-attachments/assets/a278e935-9f21-4c42-bf74-3bdca1dfbf7e" />
<img width="1866" height="1055" alt="Screenshot 2026-02-08 140546" src="https://github.com/user-attachments/assets/d2183452-be4b-42c8-96ea-15312ea0ea05" />
<img width="1817" height="1011" alt="Screenshot 2026-02-08 140606" src="https://github.com/user-attachments/assets/ff1f930c-86d8-45ac-b094-5427b7bbb2ff" />


## 🔹 Features

- **Driver Cards:** View detailed stats for all F1 drivers.  
- **Standings Table:** Current season driver rankings with points, wins, and average points per race.  
- **Driver Comparison:** Compare two drivers’ statistics side by side.  
- **Race Prediction:** AI-powered predictions for the next race podium using synthetic data.  
- **Team Table:** Detailed team information and standings.  
- **News Section:** Fully static in HTML for quick access.  
- **Sponsor Footer:** Branded footer with sponsor logos.  

---

## 🔹 Technologies

**Frontend:**  
- HTML  
- CSS  
- JavaScript  

**Backend:**  
- Python  
- Flask  
- Flask-CORS  

**AI/ML:**  
- Python `pandas`, `numpy`, `scikit-learn`  
- Random Forest Classifier with synthetic training data  

---

## 🔹 Project Structure

F1-Website/
│
├── app.py # Flask backend
├── services/
│ ├── DataProcessor.py # Driver/standings API
│ └── RacePredictionService.py# ML predictor
├── templates/
│ └── index.html # Frontend pages
├── static/
│ ├── css/
│ ├── js/
│ └── images/
└── README.md
## 🔹 ML Race Prediction

- Uses **Random Forest Classifier** trained on **synthetic F1 driver data**.  
- Key features:  
  - Average points per race  
  - Recent driver form  
  - Team performance  
  - Wins & podiums  
- Predicts **top 10 drivers most likely to podium** in the next race.  

---

## 🔹 Notes

- **News section is static** in the frontend; backend API for news has been removed.  
- All other backend routes (`/api/drivers`, `/api/standings`, `/api/compare`, `/api/predict-podium`) serve dynamic data for the frontend.  
- The project combines **data visualization
- 
