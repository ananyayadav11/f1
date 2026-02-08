from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import requests
from services.DataProcessor import DataProcessor
from services.RacePredictionService import RacePredictionService


app = Flask(__name__)
CORS(app)

# Initialize services
data_processor = DataProcessor()
ml_predictor = RacePredictionService()

@app.route('/api/drivers', methods=['GET'])
def get_drivers():
    """Fetch all F1 drivers with their details"""
    try:
        drivers = data_processor.get_drivers()
        return jsonify({
            'success': True,
            'data': drivers,
            'count': len(drivers)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/standings', methods=['GET'])
def get_standings():
    """Fetch current driver standings"""
    try:
        year = request.args.get('year', datetime.now().year)
        standings = data_processor.get_driver_standings(year)
        return jsonify({
            'success': True,
            'data': standings,
            'year': year
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/news', methods=['GET'])
def get_news():
    """Fetch latest F1 news"""
    try:
        news = data_processor.get_news()
        return jsonify({
            'success': True,
            'data': news
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/driver/<driver_id>', methods=['GET'])
def get_driver_detail(driver_id):
    """Fetch detailed stats for a specific driver"""
    try:
        driver_data = data_processor.get_driver_detail(driver_id)
        return jsonify({
            'success': True,
            'data': driver_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/compare', methods=['POST'])
def compare_drivers():
    """Compare two drivers' statistics"""
    try:
        data = request.get_json()
        driver1_id = data.get('driver1')
        driver2_id = data.get('driver2')
        
        if not driver1_id or not driver2_id:
            return jsonify({
                'success': False,
                'error': 'Both driver IDs are required'
            }), 400
        
        comparison = data_processor.compare_drivers(driver1_id, driver2_id)
        return jsonify({
            'success': True,
            'data': comparison
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/points-progression/<driver_id>', methods=['GET'])
def get_points_progression(driver_id):
    """Get points progression throughout the season for a driver"""
    try:
        year = request.args.get('year', datetime.now().year)
        progression = data_processor.get_points_progression(driver_id, year)
        return jsonify({
            'success': True,
            'data': progression,
            'driver_id': driver_id,
            'year': year
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/predict-podium', methods=['GET'])
def predict_podium():
    """ML-based prediction for next race podium"""
    try:
        predictions = ml_predictor.predict_next_race_podium()
        return jsonify({
            'success': True,
            'data': predictions,
            'model': 'Random Forest Classifier',
            'features_used': ['avg_points_per_race', 'recent_form', 'team_performance', 'wins', 'podiums']
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)