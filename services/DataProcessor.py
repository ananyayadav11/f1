# services/data_processor.py
import pandas as pd
import requests
from datetime import datetime
import json

class DataProcessor:
    """Handles data fetching, processing, and transformation"""
    
    def __init__(self):
        self.ergast_base_url = "https://ergast.com/api/f1"
        self.current_year = datetime.now().year
        
    def get_drivers(self):
        """Fetch all drivers for current season"""
        try:
            # Try Ergast API first
            url = f"{self.ergast_base_url}/{self.current_year}/drivers.json"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                drivers_data = data['MRData']['DriverTable']['Drivers']
                
                # Map to our format
                drivers = []
                for driver in drivers_data:
                    drivers.append({
                        'id': driver['driverId'],
                        'firstName': driver['givenName'],
                        'lastName': driver['familyName'],
                        'nationality': driver['nationality'],
                        'number': driver.get('permanentNumber', 'N/A'),
                        'code': driver.get('code', '')
                    })
                return drivers
            else:
                return self._get_mock_drivers()
                
        except Exception as e:
            print(f"API Error: {e}. Using mock data.")
            return self._get_mock_drivers()
    
    def get_driver_standings(self, year):
        """Fetch driver standings"""
        try:
            url = f"{self.ergast_base_url}/{year}/driverStandings.json"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                standings_list = data['MRData']['StandingsTable']['StandingsLists']
                
                if standings_list:
                    standings = standings_list[0]['DriverStandings']
                    
                    result = []
                    for standing in standings:
                        driver = standing['Driver']
                        result.append({
                            'position': int(standing['position']),
                            'points': float(standing['points']),
                            'wins': int(standing['wins']),
                            'driverId': driver['driverId'],
                            'firstName': driver['givenName'],
                            'lastName': driver['familyName'],
                            'nationality': driver['nationality'],
                            'team': standing['Constructors'][0]['name'] if standing['Constructors'] else 'Unknown'
                        })
                    return result
                else:
                    return self._get_mock_standings()
            else:
                return self._get_mock_standings()
                
        except Exception as e:
            print(f"API Error: {e}. Using mock data.")
            return self._get_mock_standings()
    
    
    
    def get_driver_detail(self, driver_id):
        """Get detailed statistics for a specific driver"""
        try:
            # Get current standings
            standings = self.get_driver_standings(self.current_year)
            driver_standing = next((d for d in standings if d['driverId'] == driver_id), None)
            
            if not driver_standing:
                return None
            
            # Get race results for the driver
            url = f"{self.ergast_base_url}/{self.current_year}/drivers/{driver_id}/results.json"
            response = requests.get(url, timeout=5)
            
            races_data = []
            if response.status_code == 200:
                data = response.json()
                races = data['MRData']['RaceTable']['Races']
                
                for race in races:
                    if race['Results']:
                        result = race['Results'][0]
                        races_data.append({
                            'round': int(race['round']),
                            'name': race['raceName'],
                            'position': result.get('position', 'DNF'),
                            'points': float(result.get('points', 0))
                        })
            
            return {
                **driver_standing,
                'races': races_data,
                'totalRaces': len(races_data),
                'avgPoints': round(driver_standing['points'] / len(races_data), 2) if races_data else 0
            }
            
        except Exception as e:
            print(f"Error fetching driver detail: {e}")
            return None
    
    def compare_drivers(self, driver1_id, driver2_id):
        """Compare statistics between two drivers"""
        driver1 = self.get_driver_detail(driver1_id)
        driver2 = self.get_driver_detail(driver2_id)
        
        if not driver1 or not driver2:
            raise ValueError("One or both drivers not found")
        
        comparison = {
            'driver1': {
                'name': f"{driver1['firstName']} {driver1['lastName']}",
                'team': driver1['team'],
                'points': driver1['points'],
                'wins': driver1['wins'],
                'position': driver1['position'],
                'avgPoints': driver1['avgPoints']
            },
            'driver2': {
                'name': f"{driver2['firstName']} {driver2['lastName']}",
                'team': driver2['team'],
                'points': driver2['points'],
                'wins': driver2['wins'],
                'position': driver2['position'],
                'avgPoints': driver2['avgPoints']
            },
            'differences': {
                'points': driver1['points'] - driver2['points'],
                'wins': driver1['wins'] - driver2['wins'],
                'avgPoints': round(driver1['avgPoints'] - driver2['avgPoints'], 2)
            }
        }
        
        return comparison
    
    def get_points_progression(self, driver_id, year):
        """Get cumulative points progression throughout the season"""
        try:
            url = f"{self.ergast_base_url}/{year}/drivers/{driver_id}/results.json"
            response = requests.get(url, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                races = data['MRData']['RaceTable']['Races']
                
                progression = []
                cumulative_points = 0
                
                for race in races:
                    if race['Results']:
                        result = race['Results'][0]
                        points = float(result.get('points', 0))
                        cumulative_points += points
                        
                        progression.append({
                            'round': int(race['round']),
                            'race': race['raceName'],
                            'points': points,
                            'cumulativePoints': cumulative_points,
                            'position': result.get('position', 'DNF')
                        })
                
                return progression
            else:
                return []
                
        except Exception as e:
            print(f"Error fetching points progression: {e}")
            return []
    
    def _get_mock_drivers(self):
        """Mock driver data for fallback"""
        return [
            {'id': 'piastri', 'firstName': 'Oscar', 'lastName': 'Piastri', 'nationality': 'Australian', 'number': '81', 'code': 'PIA'},
            {'id': 'norris', 'firstName': 'Lando', 'lastName': 'Norris', 'nationality': 'British', 'number': '4', 'code': 'NOR'},
            {'id': 'leclerc', 'firstName': 'Charles', 'lastName': 'Leclerc', 'nationality': 'Monegasque', 'number': '16', 'code': 'LEC'},
            {'id': 'hamilton', 'firstName': 'Lewis', 'lastName': 'Hamilton', 'nationality': 'British', 'number': '44', 'code': 'HAM'},
            {'id': 'russell', 'firstName': 'George', 'lastName': 'Russell', 'nationality': 'British', 'number': '63', 'code': 'RUS'},
            {'id': 'antonelli', 'firstName': 'Kimi', 'lastName': 'Antonelli', 'nationality': 'Italian', 'number': '12', 'code': 'ANT'},
            {'id': 'max_verstappen', 'firstName': 'Max', 'lastName': 'Verstappen', 'nationality': 'Dutch', 'number': '1', 'code': 'VER'},
            {'id': 'tsunoda', 'firstName': 'Yuki', 'lastName': 'Tsunoda', 'nationality': 'Japanese', 'number': '22', 'code': 'TSU'}
        ]
    
    def _get_mock_standings(self):
        """Mock standings data for fallback"""
        return [
            {'position': 1, 'points': 324, 'wins': 5, 'driverId': 'piastri', 'firstName': 'Oscar', 'lastName': 'Piastri', 'nationality': 'Australian', 'team': 'McLaren'},
            {'position': 2, 'points': 293, 'wins': 4, 'driverId': 'norris', 'firstName': 'Lando', 'lastName': 'Norris', 'nationality': 'British', 'team': 'McLaren'},
            {'position': 3, 'points': 230, 'wins': 3, 'driverId': 'max_verstappen', 'firstName': 'Max', 'lastName': 'Verstappen', 'nationality': 'Dutch', 'team': 'Red Bull Racing'},
            {'position': 4, 'points': 194, 'wins': 2, 'driverId': 'russell', 'firstName': 'George', 'lastName': 'Russell', 'nationality': 'British', 'team': 'Mercedes'},
            {'position': 5, 'points': 163, 'wins': 1, 'driverId': 'leclerc', 'firstName': 'Charles', 'lastName': 'Leclerc', 'nationality': 'Monegasque', 'team': 'Ferrari'},
            {'position': 6, 'points': 117, 'wins': 0, 'driverId': 'hamilton', 'firstName': 'Lewis', 'lastName': 'Hamilton', 'nationality': 'British', 'team': 'Ferrari'},
            {'position': 7, 'points': 70, 'wins': 0, 'driverId': 'albon', 'firstName': 'Alexander', 'lastName': 'Albon', 'nationality': 'Thai', 'team': 'Williams'},
            {'position': 8, 'points': 60, 'wins': 0, 'driverId': 'antonelli', 'firstName': 'Kimi', 'lastName': 'Antonelli', 'nationality': 'Italian', 'team': 'Mercedes'}
        ]