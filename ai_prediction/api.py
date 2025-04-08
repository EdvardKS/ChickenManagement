#!/usr/bin/env python3
"""
API module for the AI prediction system.
This module provides API endpoints to access prediction services.
"""

import os
from flask import Flask, request, jsonify, send_file
from prediction_service import get_prediction_service

app = Flask(__name__)

@app.route('/train', methods=['POST'])
def train_models():
    """API endpoint to train the prediction models."""
    try:
        # Get days from request, default to 90 days
        data = request.json or {}
        days = data.get('days', 90)
        
        # Train models
        prediction_service = get_prediction_service()
        result = prediction_service.train_models(days=days)
        
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error training models: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/predict-stock-usage', methods=['GET'])
def predict_stock_usage():
    """API endpoint to predict stock usage."""
    try:
        # Get prediction days from query parameters, default to 30 days
        days = request.args.get('days', 30, type=int)
        
        # Predict stock usage
        prediction_service = get_prediction_service()
        result = prediction_service.predict_stock_usage(days=days)
        
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error predicting stock usage: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze-patterns', methods=['GET'])
def analyze_patterns():
    """API endpoint to analyze patterns in stock usage and orders."""
    try:
        # Analyze patterns
        prediction_service = get_prediction_service()
        result = prediction_service.analyze_patterns()
        
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error analyzing patterns: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/plots/<filename>', methods=['GET'])
def get_plot(filename):
    """API endpoint to get generated plots."""
    try:
        # Get plot file
        plots_dir = os.path.join(os.path.dirname(__file__), 'outputs', 'plots')
        file_path = os.path.join(plots_dir, filename)
        
        if not os.path.exists(file_path):
            return jsonify({"error": "Plot not found"}), 404
        
        return send_file(file_path, mimetype='image/png')
    except Exception as e:
        app.logger.error(f"Error getting plot: {str(e)}")
        return jsonify({"error": str(e)}), 500

def start_api(host='0.0.0.0', port=5000, debug=False):
    """Start the API server."""
    app.run(host=host, port=port, debug=debug)