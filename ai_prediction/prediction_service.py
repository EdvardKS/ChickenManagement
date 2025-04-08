#!/usr/bin/env python3
"""
Prediction service module for the AI prediction system.
This module provides a high-level interface to the prediction models.
"""

import os
import json
import pandas as pd
from datetime import datetime
from db_connector import get_connector
from data_processor import (
    calculate_daily_usage, 
    prepare_time_series_data,
    calculate_hourly_distribution,
    calculate_weekly_distribution,
    calculate_monthly_distribution,
    calculate_average_daily_usage,
    predict_days_until_empty
)
from models.prophet_predictor import ProphetPredictor
from models.ml_predictor import MLPredictor

class PredictionService:
    """High-level prediction service using multiple models."""
    
    def __init__(self):
        """Initialize the prediction service."""
        self.db_connector = get_connector()
        self.prophet_predictor = ProphetPredictor()
        self.ml_predictor = MLPredictor()
        self.outputs_dir = os.path.join(os.path.dirname(__file__), 'outputs')
        self.plots_dir = os.path.join(self.outputs_dir, 'plots')
        self.data_dir = os.path.join(self.outputs_dir, 'data')
        
        # Ensure output directories exist
        self.ensure_output_dir()
    
    def ensure_output_dir(self):
        """Ensure the output directory exists."""
        os.makedirs(self.outputs_dir, exist_ok=True)
        os.makedirs(self.plots_dir, exist_ok=True)
        os.makedirs(self.data_dir, exist_ok=True)
    
    def train_models(self, days=None):
        """
        Train all predictive models.
        
        Args:
            days: Optional number of days of data to use for training
            
        Returns:
            Dictionary with training results
        """
        # Fetch stock history data
        stock_history_df = self.db_connector.get_stock_history(days=days)
        
        if stock_history_df.empty:
            return {
                "error": "No stock history data available for training",
                "success": False
            }
        
        # Calculate daily usage from stock history
        daily_usage_df = calculate_daily_usage(stock_history_df)
        
        # Prepare data for time series model
        prophet_data = prepare_time_series_data(daily_usage_df)
        
        # Train models
        prophet_model = self.prophet_predictor.train(prophet_data)
        ml_model, ml_metrics = self.ml_predictor.train(prophet_data)
        
        return {
            "success": True,
            "models_trained": ["prophet", "ml"],
            "data_points": len(daily_usage_df),
            "date_range": {
                "start": daily_usage_df['date'].min().strftime('%Y-%m-%d'),
                "end": daily_usage_df['date'].max().strftime('%Y-%m-%d')
            },
            "ml_metrics": ml_metrics
        }
    
    def predict_stock_usage(self, days=30):
        """
        Predict stock usage for the specified number of days.
        
        Args:
            days: Number of days to predict
            
        Returns:
            Dictionary with prediction results and plots
        """
        # Fetch stock history data (last 90 days)
        stock_history_df = self.db_connector.get_stock_history(days=90)
        
        # Fetch current stock data
        current_stock_df = self.db_connector.get_daily_stock()
        
        if stock_history_df.empty or current_stock_df.empty:
            return {
                "error": "Insufficient data available for prediction",
                "success": False
            }
        
        # Get the most recent stock record
        current_stock = current_stock_df.iloc[0].to_dict()
        
        # Calculate daily usage from stock history
        daily_usage_df = calculate_daily_usage(stock_history_df)
        
        # Prepare data for prediction
        prophet_data = prepare_time_series_data(daily_usage_df)
        
        # Load models or train if not available
        if self.prophet_predictor.load_model() is None:
            self.prophet_predictor.train(prophet_data)
            
        if self.ml_predictor.load_model() is None:
            self.ml_predictor.train(prophet_data)
        
        # Make predictions
        prophet_forecast = self.prophet_predictor.predict(days=days)
        ml_forecast = self.ml_predictor.predict(
            datetime.now().replace(hour=0, minute=0, second=0, microsecond=0),
            days=days
        )
        
        # Calculate historical metrics
        avg_daily_usage = calculate_average_daily_usage(daily_usage_df, last_n_days=30)
        days_until_empty = predict_days_until_empty(
            float(current_stock['unreservedStock']), 
            avg_daily_usage
        )
        
        # Generate plots
        prophet_forecast_plot = self.prophet_predictor.plot_forecast(prophet_forecast, prophet_data)
        prophet_components_plot = self.prophet_predictor.plot_components(prophet_forecast)
        ml_forecast_plot = self.ml_predictor.plot_forecast(ml_forecast, prophet_data)
        
        # Create forecast summary data
        next_7_days = prophet_forecast[prophet_forecast['ds'] < prophet_forecast['ds'].iloc[0] + pd.Timedelta(days=7)]
        next_14_days = prophet_forecast[prophet_forecast['ds'] < prophet_forecast['ds'].iloc[0] + pd.Timedelta(days=14)]
        next_30_days = prophet_forecast[prophet_forecast['ds'] < prophet_forecast['ds'].iloc[0] + pd.Timedelta(days=30)]
        
        # Compile results
        result = {
            "success": True,
            "current_stock": current_stock,
            "historical_analysis": {
                "avg_daily_usage": avg_daily_usage,
                "days_until_empty": days_until_empty,
                "total_usage_last_30_days": daily_usage_df['usage'].sum() if len(daily_usage_df) > 0 else 0
            },
            "forecast_summary": {
                "next_7_days": {
                    "total_usage": next_7_days['yhat'].sum(),
                    "avg_daily_usage": next_7_days['yhat'].mean(),
                    "max_usage": next_7_days['yhat'].max(),
                    "min_usage": next_7_days['yhat'].min()
                },
                "next_14_days": {
                    "total_usage": next_14_days['yhat'].sum(),
                    "avg_daily_usage": next_14_days['yhat'].mean(),
                    "max_usage": next_14_days['yhat'].max(),
                    "min_usage": next_14_days['yhat'].min()
                },
                "next_30_days": {
                    "total_usage": next_30_days['yhat'].sum(),
                    "avg_daily_usage": next_30_days['yhat'].mean(),
                    "max_usage": next_30_days['yhat'].max(),
                    "min_usage": next_30_days['yhat'].min()
                }
            },
            "plots": {
                "prophet_forecast": prophet_forecast_plot,
                "prophet_components": prophet_components_plot,
                "ml_forecast": ml_forecast_plot
            },
            "full_forecast": prophet_forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_dict('records')
        }
        
        # Save prediction to file
        prediction_file = self.save_prediction_to_file(result)
        
        return result
    
    def analyze_patterns(self):
        """
        Analyze patterns in stock usage and orders.
        
        Returns:
            Dictionary with pattern analysis
        """
        # Fetch stock history and orders data (last 180 days for more comprehensive patterns)
        stock_history_df = self.db_connector.get_stock_history(days=180)
        orders_df = self.db_connector.get_orders(days=180)
        
        if stock_history_df.empty:
            return {
                "error": "No stock history data available for pattern analysis",
                "success": False
            }
        
        # Analyze hourly distribution
        hourly_distribution = calculate_hourly_distribution(orders_df, stock_history_df)
        
        # Analyze weekly distribution
        weekly_distribution = calculate_weekly_distribution(orders_df, stock_history_df)
        
        # Analyze monthly distribution
        monthly_distribution = calculate_monthly_distribution(orders_df, stock_history_df)
        
        # Compile results
        result = {
            "success": True,
            "hourly_distribution": hourly_distribution,
            "weekly_distribution": weekly_distribution,
            "monthly_distribution": monthly_distribution
        }
        
        # Save pattern analysis to file
        pattern_file = os.path.join(self.data_dir, f"pattern_analysis_{datetime.now().strftime('%Y%m%d%H%M%S')}.json")
        with open(pattern_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        return result
    
    def save_prediction_to_file(self, prediction_data, file_path=None):
        """
        Save prediction data to a JSON file.
        
        Args:
            prediction_data: Dictionary with prediction data
            file_path: Optional file path
            
        Returns:
            File path
        """
        if file_path is None:
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            file_path = os.path.join(self.data_dir, f"prediction_{timestamp}.json")
        
        # Convert non-serializable values (dates, numpy values) to string representation
        serializable_data = json.loads(
            json.dumps(prediction_data, default=lambda x: str(x) if hasattr(x, 'isoformat') else float(x))
        )
        
        with open(file_path, 'w') as f:
            json.dump(serializable_data, f, indent=2)
        
        return file_path

# Singleton instance of the prediction service
_prediction_service = None

def get_prediction_service():
    """Get the prediction service instance."""
    global _prediction_service
    if _prediction_service is None:
        _prediction_service = PredictionService()
    return _prediction_service