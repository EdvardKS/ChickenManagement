#!/usr/bin/env python3
"""
Prophet predictor module for the AI prediction system.
This module implements a time series forecasting model using Facebook Prophet.
"""

import os
import pandas as pd
import numpy as np
from prophet import Prophet
import joblib
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for headless environment

class ProphetPredictor:
    """Time series forecasting model using Facebook Prophet."""
    
    def __init__(self):
        """Initialize the Prophet predictor."""
        self.model = None
        self.model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                       'outputs', 'models', 'prophet_model.joblib')
        self.plots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                     'outputs', 'plots')
        
        # Create directories if they don't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        os.makedirs(self.plots_dir, exist_ok=True)
    
    def train(self, data_df):
        """
        Train the Prophet model.
        
        Args:
            data_df: DataFrame with columns 'ds' (dates) and 'y' (values)
            
        Returns:
            Trained model
        """
        # Create a new Prophet model
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=True,
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0
        )
        
        # Add custom seasonality: monthly
        self.model.add_seasonality(name='monthly', period=30.5, fourier_order=5)
        
        # Train the model
        self.model.fit(data_df)
        
        # Save the model
        joblib.dump(self.model, self.model_path)
        
        return self.model
    
    def load_model(self):
        """
        Load a previously trained model.
        
        Returns:
            Loaded model or None if no model exists
        """
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            return self.model
        return None
    
    def predict(self, days=30):
        """
        Make predictions for the future.
        
        Args:
            days: Number of days to predict
            
        Returns:
            DataFrame with predictions
        """
        if self.model is None:
            self.load_model()
            
        if self.model is None:
            raise ValueError("No trained model available. Please train the model first.")
        
        # Create future dataframe
        future = self.model.make_future_dataframe(periods=days)
        
        # Make predictions
        forecast = self.model.predict(future)
        
        return forecast
    
    def plot_forecast(self, forecast, history_df=None):
        """
        Plot the forecast and save the plot to a file.
        
        Args:
            forecast: Forecast DataFrame from Prophet
            history_df: Optional DataFrame with historical data
            
        Returns:
            Path to the saved plot file
        """
        # Create a plot
        plt.figure(figsize=(12, 6))
        
        # Plot historical data if provided
        if history_df is not None:
            plt.plot(history_df['ds'], history_df['y'], 'k.', label='Historical Usage')
        
        # Plot forecast
        plt.plot(forecast['ds'], forecast['yhat'], 'b-', label='Forecast')
        plt.fill_between(forecast['ds'], forecast['yhat_lower'], forecast['yhat_upper'],
                        color='blue', alpha=0.2, label='Confidence Interval')
        
        # Format plot
        plt.xlabel('Date')
        plt.ylabel('Stock Usage')
        plt.title('Stock Usage Forecast')
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Save the plot
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"prophet_forecast_{timestamp}.png"
        filepath = os.path.join(self.plots_dir, filename)
        plt.savefig(filepath)
        plt.close()
        
        return filename
    
    def plot_components(self, forecast):
        """
        Plot the components of the forecast and save the plot to a file.
        
        Args:
            forecast: Forecast DataFrame from Prophet
            
        Returns:
            Path to the saved plot file
        """
        # Create a components plot
        fig = self.model.plot_components(forecast)
        
        # Save the plot
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"prophet_components_{timestamp}.png"
        filepath = os.path.join(self.plots_dir, filename)
        fig.savefig(filepath)
        plt.close(fig)
        
        return filename