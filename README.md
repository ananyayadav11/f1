🏎️ F1 Dashboard Website

A full-stack Formula 1 website providing live-like F1 experience with driver statistics, team standings, race predictions, and comparisons. Built with Flask (Python) backend, HTML/CSS/JS frontend, and AI-powered race predictions.

🔹 Features

Driver Cards: View detailed stats for all F1 drivers.

Standings Table: Current season driver rankings with points and wins.

Driver Comparison: Compare two drivers’ stats side by side.

Race Prediction: AI-powered predictions for next race podium using synthetic data.

Team Table: Information about all F1 teams.

News Section: Optional (can use static HTML news).

Sponsor Footer: Official F1 feel with sponsors and branding.

🔹 Tech Stack

Frontend:

HTML

CSS

JavaScript

Backend:

Python

Flask

Flask-CORS

AI/ML:

Python pandas, numpy, scikit-learn

Random Forest Classifier with synthetic data

🔹 Project Structure
F1-Website/
│
├── app.py                      # Flask backend
├── services/
│   ├── DataProcessor.py        # Driver/standings API
│   └── RacePredictionService.py# ML predictor
├── templates/
│   └── index.html              # Frontend pages
├── static/
│   ├── css/
│   ├── js/
│   └── images/
└── README.md

🔹 ML Race Prediction

Uses Random Forest Classifier trained on synthetic F1 driver data.

Features used:

Average points per race

Recent driver form

Team performance

Wins & podiums

Predicts top 10 drivers most likely to podium next race.
