# services/ml_predictor.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from datetime import datetime

class RacePredictionService:
    """ML-based service for predicting race outcomes"""
    
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.accuracy = 0.0  
        
    def predict_next_race_podium(self):
        """
        Predict podium probabilities for the next race
        Uses simplified features: recent performance, season stats, team performance
        """
        
        # Mock training data (in production, this would be historical race data)
        training_data = self._generate_training_data()
        
        # Train the model if not already trained
        if not self.is_trained:
            self._train_model(training_data)
        
        # Current season driver performance data
        current_drivers = self._get_current_driver_features()
        
        # Make predictions
        predictions = []
        for driver in current_drivers:
            features = self._extract_features(driver)
            
            # Predict podium probability
            probability = self.model.predict_proba([features])[0][1]  # Probability of podium
            
            predictions.append({
                'driver': driver['name'],
                'team': driver['team'],
                'podiumProbability': round(float(probability) * 100, 2),
                'recentForm': driver['recent_form'],
                'avgPointsPerRace': driver['avg_points'],
                'confidence': 'high' if probability > 0.7 else 'medium' if probability > 0.4 else 'low'
            })
        
        # Sort by probability
        predictions.sort(key=lambda x: x['podiumProbability'], reverse=True)
        
        return predictions[:10]  # Return top 10
    
    
    def _generate_training_data(self):
        """Generate synthetic training data with realistic variance and noise"""
        np.random.seed(42)
        data = []
        
        # TOP-TIER DRIVERS (High performers - 85% podium rate)
        # These represent drivers like Verstappen, Hamilton in their prime
        for _ in range(100):
            # Not ALL top drivers get podium every race (crashes, bad luck, strategy fails)
            # So we use 85% podium rate instead of 100%
            podium = 1 if np.random.random() < 0.85 else 0
            
            data.append({
                'avg_points': np.random.uniform(8, 18),      # High points per race
                'recent_form': np.random.uniform(0.6, 1.0),   # Good recent performance
                'team_performance': np.random.uniform(0.7, 1.0),  # Strong team (Mercedes, Red Bull, etc.)
                'wins': np.random.randint(1, 10),             # Multiple wins
                'podiums': np.random.randint(3, 20),          # Frequent podiums
                'podium': podium
            })
        
        # MID-FIELD DRIVERS (Occasional podium finishers - 20% podium rate)
        # Represents drivers like Albon, Gasly - can get podium but rare
        for _ in range(100):
            # Sometimes mid-field drivers get lucky (rain, crashes ahead, great strategy)
            podium = 1 if np.random.random() < 0.20 else 0
            
            data.append({
                'avg_points': np.random.uniform(2, 8),        # Moderate points
                'recent_form': np.random.uniform(0.3, 0.7),   # Average form
                'team_performance': np.random.uniform(0.4, 0.7),  # Mid-field teams
                'wins': np.random.randint(0, 3),              # Very few wins
                'podiums': np.random.randint(0, 5),           # Few podiums
                'podium': podium
            })
        
        # BACK-MARKERS (Almost never podium - 3% podium rate)
        # Represents Williams, Haas type teams - podium is extremely rare
        for _ in range(100):
            # Very rare cases like Perez at Sakhir 2020 or Gasly at Monza 2020
            podium = 1 if np.random.random() < 0.03 else 0
            
            data.append({
                'avg_points': np.random.uniform(0, 3),        # Low/no points
                'recent_form': np.random.uniform(0, 0.4),     # Poor form
                'team_performance': np.random.uniform(0, 0.5),    # Weak cars
                'wins': 0,                                     # No wins
                'podiums': np.random.randint(0, 2),           # 0-1 podiums max
                'podium': podium
            })
        
        return pd.DataFrame(data)
    
    def _train_model(self, training_data):
        """Train the Random Forest model and calculate accuracy"""
        X = training_data[['avg_points', 'recent_form', 'team_performance', 'wins', 'podiums']]
        y = training_data['podium']
        
        # Split data into training and test sets (80/20 split)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Calculate accuracy on test set
        y_pred = self.model.predict(X_test_scaled)
        self.accuracy = accuracy_score(y_test, y_pred)
        
        print(f"✓ Model trained with {self.accuracy * 100:.1f}% accuracy")
        self.is_trained = True
        
        return self.accuracy
    
    def _get_current_driver_features(self):
        """Get current driver performance features - balanced for realistic predictions"""
        return [
            # Elite drivers - 70-85% range
            {'name': 'Max Verstappen', 'team': 'Red Bull Racing', 'avg_points': 10.8, 'recent_form': 0.68, 'team_performance': 0.80, 'wins': 4, 'podiums': 10},
            {'name': 'Oscar Piastri', 'team': 'McLaren', 'avg_points': 10.2, 'recent_form': 0.66, 'team_performance': 0.78, 'wins': 3, 'podiums': 9},
            {'name': 'Lando Norris', 'team': 'McLaren', 'avg_points': 9.8, 'recent_form': 0.64, 'team_performance': 0.78, 'wins': 3, 'podiums': 9},
            
            # Strong contenders - 50-65% range
            {'name': 'George Russell', 'team': 'Mercedes', 'avg_points': 8.2, 'recent_form': 0.60, 'team_performance': 0.72, 'wins': 2, 'podiums': 7},
            {'name': 'Charles Leclerc', 'team': 'Ferrari', 'avg_points': 7.2, 'recent_form': 0.56, 'team_performance': 0.68, 'wins': 1, 'podiums': 6},
            
            # Mid-tier - 25-45% range
            {'name': 'Lewis Hamilton', 'team': 'Ferrari', 'avg_points': 5.2, 'recent_form': 0.50, 'team_performance': 0.68, 'wins': 0, 'podiums': 4},
            {'name': 'Kimi Antonelli', 'team': 'Mercedes', 'avg_points': 3.6, 'recent_form': 0.44, 'team_performance': 0.72, 'wins': 0, 'podiums': 1},
            {'name': 'Fernando Alonso', 'team': 'Aston Martin', 'avg_points': 3.8, 'recent_form': 0.46, 'team_performance': 0.56, 'wins': 0, 'podiums': 2},
            
            # Lower tier - 5-20% range
            {'name': 'Yuki Tsunoda', 'team': 'RB', 'avg_points': 2.0, 'recent_form': 0.36, 'team_performance': 0.48, 'wins': 0, 'podiums': 0},
            {'name': 'Alexander Albon', 'team': 'Williams', 'avg_points': 1.4, 'recent_form': 0.32, 'team_performance': 0.42, 'wins': 0, 'podiums': 0}
        ]
    def _extract_features(self, driver):
        """Extract feature vector for prediction"""
        features = [
            driver['avg_points'],
            driver['recent_form'],
            driver['team_performance'],
            driver['wins'],
            driver['podiums']
        ]
        
        # Scale features
        features_scaled = self.scaler.transform([features])[0]
        return features_scaled