"""
Required python packages:
    - numpy
    - matplotlib
    - requests
    - netCDF4
    - dateutil

Download the landmask (lsmask.nc) from
    https://www.esrl.noaa.gov/psd/data/gridded/data.noaa.oisst.v2.html 

More info on the earthquake catalog:
    https://earthquake.usgs.gov/fdsnws/event/1/
"""
"""
Enhanced earthquake data collector and visualizer
Required python packages:
    - numpy
    - matplotlib
    - requests
    - netCDF4
    - dateutil
    - geojson
"""

import os
import numpy as np
import shutil
import requests
import pickle
import json
import time

from math import cos, sin, pi, sqrt
from matplotlib import cm
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

# Parameters
USGS_ENDPOINT = "https://earthquake.usgs.gov/fdsnws/event/1/"
GEOJSON_ENDPOINT = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/"
DB_FILE = "earthquakes.json"
PLY_FILE = "earthquakes.ply"
MAG_RANGE = [2.5, 9.0]
START = datetime.strptime("2020-01-01", "%Y-%m-%d")
END = datetime.strptime("2025-12-31", "%Y-%m-%d")

class EarthquakeVisualizer:
    """Enhanced earthquake data processor and visualizer"""
    
    def __init__(self):
        self.earthquakes = []
        self.stats = {
            'total_count': 0,
            'max_magnitude': 0,
            'min_magnitude': 10,
            'avg_magnitude': 0,
            'deadliest_year': '',
            'most_active_region': ''
        }
    
    def fetch_recent_earthquakes(self, days=30):
        """Fetch recent earthquakes using GeoJSON feeds"""
        print(f"Fetching earthquakes from last {days} days...")
        
        # Different feed options based on timeframe
        if days <= 1:
            feed_url = f"{GEOJSON_ENDPOINT}all_day.geojson"
        elif days <= 7:
            feed_url = f"{GEOJSON_ENDPOINT}all_week.geojson"
        else:
            feed_url = f"{GEOJSON_ENDPOINT}all_month.geojson"
        
        try:
            response = requests.get(feed_url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            earthquakes = []
            
            for feature in data['features']:
                props = feature['properties']
                coords = feature['geometry']['coordinates']
                
                # Filter by magnitude
                mag = props.get('mag', 0)
                if mag and MAG_RANGE[0] <= mag <= MAG_RANGE[1]:
                    earthquake = {
                        'time': datetime.fromtimestamp(props['time'] / 1000),
                        'lat': coords[1],
                        'lon': coords[0],
                        'depth': coords[2],
                        'mag': mag,
                        'place': props.get('place', 'Unknown'),
                        'type': props.get('type', 'earthquake')
                    }
                    earthquakes.append(earthquake)
            
            print(f"Successfully fetched {len(earthquakes)} earthquakes")
            return earthquakes
            
        except Exception as e:
            print(f"Error fetching recent data: {e}")
            return []
    
    def fetch_historical_earthquakes(self, start_date, end_date, magnitude_range):
        """Fetch historical earthquakes using USGS API"""
        earthquakes = []
        current_date = start_date
        
        while current_date < end_date:
            # Process data in 1-month chunks to avoid API limits
            chunk_end = min(current_date + relativedelta(months=1), end_date)
            
            params = {
                'format': 'geojson',
                'starttime': current_date.strftime('%Y-%m-%d'),
                'endtime': chunk_end.strftime('%Y-%m-%d'),
                'minmagnitude': magnitude_range[0],
                'maxmagnitude': magnitude_range[1],
                'orderby': 'time',
                'limit': 20000  # API limit
            }
            
            print(f"Fetching from {current_date.strftime('%Y-%m-%d')} to {chunk_end.strftime('%Y-%m-%d')}")
            
            try:
                response = requests.get(f"{USGS_ENDPOINT}query", params=params, timeout=60)
                response.raise_for_status()
                
                data = response.json()
                
                for feature in data['features']:
                    props = feature['properties']
                    coords = feature['geometry']['coordinates']
                    
                    earthquake = {
                        'time': datetime.fromtimestamp(props['time'] / 1000),
                        'lat': coords[1],
                        'lon': coords[0],
                        'depth': coords[2] if coords[2] else 0,
                        'mag': props.get('mag', 0),
                        'place': props.get('place', 'Unknown'),
                        'type': props.get('type', 'earthquake')
                    }
                    earthquakes.append(earthquake)
                
                print(f"  -> Found {len(data['features'])} earthquakes")
                
                # Rate limiting
                time.sleep(1)
                
            except Exception as e:
                print(f"Error fetching data for {current_date}: {e}")
                time.sleep(5)
            
            current_date = chunk_end
        
        return earthquakes
    
    def polar_to_xyz(self, lon, lat, depth):
        """Convert lat/lon/depth to 3D coordinates"""
        C = (0, 0, 0)  # Center
        S = 0.01       # Scale factor
        D = 3          # Depth exaggeration
        R = 6400       # Earth radius (km)
        
        # Convert to radians
        rad_lat, rad_lon = lat * pi / 180, lon * pi / 180
        
        # Calculate 3D position
        radius = R - D * depth
        x = C[0] + S * radius * cos(rad_lat) * cos(rad_lon)
        y = C[1] + S * radius * cos(rad_lat) * sin(rad_lon)
        z = C[2] + S * radius * sin(rad_lat)
        
        return (x, y, z)
    
    def magnitude_to_color(self, magnitude):
        """Convert magnitude to RGB color"""
        # Normalize magnitude to 0-1 range
        norm_mag = (magnitude - MAG_RANGE[0]) / (MAG_RANGE[1] - MAG_RANGE[0])
        norm_mag = max(0, min(1, norm_mag))
        
        # Use matplotlib colormap
        color = cm.plasma(norm_mag)
        return (int(255 * color[0]), int(255 * color[1]), int(255 * color[2]))
    
    def calculate_statistics(self):
        """Calculate earthquake statistics"""
        if not self.earthquakes:
            return
        
        magnitudes = [eq['mag'] for eq in self.earthquakes if eq['mag']]
        years = [eq['time'].year for eq in self.earthquakes]
        
        self.stats = {
            'total_count': len(self.earthquakes),
            'max_magnitude': max(magnitudes) if magnitudes else 0,
            'min_magnitude': min(magnitudes) if magnitudes else 0,
            'avg_magnitude': sum(magnitudes) / len(magnitudes) if magnitudes else 0,
            'year_range': f"{min(years)}-{max(years)}" if years else "",
            'major_quakes': len([m for m in magnitudes if m >= 7.0])
        }
        
        print(f"Statistics calculated:")
        print(f"  Total earthquakes: {self.stats['total_count']:,}")
        print(f"  Magnitude range: {self.stats['min_magnitude']:.1f} - {self.stats['max_magnitude']:.1f}")
        print(f"  Average magnitude: {self.stats['avg_magnitude']:.2f}")
        print(f"  Major earthquakes (7.0+): {self.stats['major_quakes']}")
    
    def export_to_ply(self, filename):
        """Export earthquake data to PLY format"""
        print(f"Exporting {len(self.earthquakes)} earthquakes to PLY format...")
        
        with open(filename, 'w') as f:
            # PLY Header
            f.write("ply\n")
            f.write("format ascii 1.0\n")
            f.write(f"element vertex {len(self.earthquakes)}\n")
            f.write("property float x\n")
            f.write("property float y\n")
            f.write("property float z\n")
            f.write("property uchar red\n")
            f.write("property uchar green\n")
            f.write("property uchar blue\n")
            f.write("property float magnitude\n")
            f.write("property float depth\n")
            f.write("end_header\n")
            
            # Write vertex data
            for earthquake in self.earthquakes:
                x, y, z = self.polar_to_xyz(
                    earthquake['lon'], 
                    earthquake['lat'], 
                    earthquake['depth']
                )
                
                r, g, b = self.magnitude_to_color(earthquake['mag'])
                
                f.write(f"{x:.6f} {y:.6f} {z:.6f} {r} {g} {b} {earthquake['mag']:.2f} {earthquake['depth']:.2f}\n")
        
        print(f"PLY file exported: {filename}")
    
    def export_to_json(self, filename):
        """Export earthquake data to JSON format"""
        print(f"Exporting earthquake data to JSON...")
        
        # Convert datetime objects to ISO format strings
        export_data = {
            'earthquakes': [],
            'statistics': self.stats,
            'export_time': datetime.now().isoformat()
        }
        
        for eq in self.earthquakes:
            export_eq = dict(eq)
            export_eq['time'] = eq['time'].isoformat()
            export_data['earthquakes'].append(export_eq)
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        print(f"JSON file exported: {filename}")
    
    def load_from_json(self, filename):
        """Load earthquake data from JSON file"""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            
            self.earthquakes = []
            for eq in data['earthquakes']:
                eq['time'] = datetime.fromisoformat(eq['time'])
                self.earthquakes.append(eq)
            
            self.stats = data.get('statistics', {})
            print(f"Loaded {len(self.earthquakes)} earthquakes from {filename}")
            return True
            
        except Exception as e:
            print(f"Error loading from JSON: {e}")
            return False

def main():
    """Main execution function"""
    visualizer = EarthquakeVisualizer()
    
    # Try to load existing data first
    if os.path.exists(DB_FILE):
        print("Loading existing earthquake data...")
        if visualizer.load_from_json(DB_FILE):
            print("Using cached data. Delete earthquakes.json to fetch new data.")
        else:
            print("Failed to load cached data, fetching new data...")
            # Fetch recent earthquakes (faster)
            visualizer.earthquakes = visualizer.fetch_recent_earthquakes(30)
    else:
        print("No cached data found, fetching earthquake data...")
        
        # Option 1: Fetch recent data (recommended for testing)
        visualizer.earthquakes = visualizer.fetch_recent_earthquakes(30)
        
        # Option 2: Fetch historical data (uncomment for full dataset)
        # visualizer.earthquakes = visualizer.fetch_historical_earthquakes(START, END, MAG_RANGE)
    
    if not visualizer.earthquakes:
        print("No earthquake data available!")
        return
    
    # Calculate statistics
    visualizer.calculate_statistics()
    
    # Export data
    visualizer.export_to_json(DB_FILE)
    visualizer.export_to_ply(PLY_FILE)
    
    print(f"\nFiles generated:")
    print(f"  - {DB_FILE}: JSON data for web application")
    print(f"  - {PLY_FILE}: 3D model for Three.js visualization")
    print(f"\nReady for 3D visualization!")

if __name__ == "__main__":
    main()