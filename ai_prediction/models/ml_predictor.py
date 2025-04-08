#!/usr/bin/env python3
"""
Machine learning predictor module for the AI prediction system.
This module implements a regression model for stock usage prediction.
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for headless environment

class MLPredictor:
    """Machine learning regression model for stock usage prediction."""
    
    def __init__(self):
        """Initialize the ML predictor."""
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                       'outputs', 'models', 'ml_model.joblib')
        self.scaler_path = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                       'outputs', 'models', 'ml_scaler.joblib')
        self.plots_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                     'outputs', 'plots')
        
        # Create directories if they don't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        os.makedirs(self.plots_dir, exist_ok=True)
    
    def _prepare_features(self, dates):
        """
        Prepare feature matrix from dates.
        
        Args:
            dates: List or array of datetime objects
            
        Returns:
            Feature matrix (X)
        """
        # Create features from dates
        X = pd.DataFrame({
            'day_of_week': [d.weekday() for d in dates],
            'day_of_month': [d.day for d in dates],
            'month': [d.month for d in dates],
            'year': [d.year for d in dates],
            'quarter': [((d.month - 1) // 3) + 1 for d in dates],
            'is_weekend': [(d.weekday() >= 5) for d in dates],
            'is_month_start': [(d.day == 1) for d in dates],
            'is_month_end': [(d.day == self._last_day_of_month(d)) for d in dates]
        })
        
        # One-hot encode categorical features
        X_encoded = pd.get_dummies(X, columns=['day_of_week', 'month', 'quarter'], drop_first=True)
        
        return X_encoded
    
    def _last_day_of_month(self, date):
        """Get the last day of the month for a given date."""
        next_month = date.replace(day=28) + timedelta(days=4)
        return (next_month - timedelta(days=next_month.day)).day
    
    def train(self, data_df):
        """
        Train the ML model.
        
        Args:
            data_df: DataFrame with columns 'ds' (dates) and 'y' (values)
            
        Returns:
            Trained model and evaluation metrics
        """
        # Prepare features and target
        X = self._prepare_features(data_df['ds'].dt.to_pydatetime())
        y = data_df['y'].values
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data for training and evaluation
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # Create and train the model
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42
        )
        
        # Train the model
        self.model.fit(X_train, y_train)
        
        # Evaluate the model
        y_pred = self.model.predict(X_test)
        metrics = {
            'mse': mean_squared_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'mae': mean_absolute_error(y_test, y_pred),
            'r2': r2_score(y_test, y_pred)
        }
        
        # Save the model and scaler
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        
        return self.model, metrics
    
    def load_model(self):
        """
        Load a previously trained model.
        
        Returns:
            Loaded model or None if no model exists
        """
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            return self.model
        return None
    
    def predict(self, start_date, days=30):
        """
        Make predictions for future dates.
        
        Args:
            start_date: Start date for predictions
            days: Number of days to predict
            
        Returns:
            DataFrame with dates and predictions
        """
        if self.model is None:
            self.load_model()
            
        if self.model is None:
            raise ValueError("No trained model available. Please train the model first.")
        
        # Generate future dates
        future_dates = [start_date + timedelta(days=i) for i in range(days)]
        
        # Prepare features
        X_future = self._prepare_features(future_dates)
        
        # Scale features
        X_future_scaled = self.scaler.transform(X_future)
        
        # Make predictions
        predictions = self.model.predict(X_future_scaled)
        
        # Create a DataFrame with results
        forecast = pd.DataFrame({
            'ds': future_dates,
            'yhat': predictions,
            # Add some uncertainty bounds based on prediction
            'yhat_lower': np.maximum(0, predictions * 0.8),
            'yhat_upper': predictions * 1.2
        })
        
        return forecast
    
    def plot_forecast(self, forecast, history_df=None):
        """
        Plot the forecast and save the plot to a file.
        
        Args:
            forecast: Forecast DataFrame with 'ds' and 'yhat' columns
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
        plt.plot(forecast['ds'], forecast['yhat'], 'r-', label='ML Forecast')
        plt.fill_between(forecast['ds'], forecast['yhat_lower'], forecast['yhat_upper'],
                        color='red', alpha=0.2, label='Confidence Interval')
        
        # Format plot
        plt.xlabel('Date')
        plt.ylabel('Stock Usage')
        plt.title('Machine Learning Stock Usage Forecast')
        plt.legend()
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Save the plot
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"ml_forecast_{timestamp}.png"
        filepath = os.path.join(self.plots_dir, filename)
        plt.savefig(filepath)
        plt.close()
        
        return filename
    
    def feature_importance(self):
        """
        Plot feature importance and save the plot to a file.
        
        Returns:
            Path to the saved plot file
        """
        if self.model is None:
            self.load_model()
            
        if self.model is None or not hasattr(self.model, 'feature_importances_'):
            raise ValueError("No trained model with feature importances available.")
        
        # Get feature names
        X_dummy = self._prepare_features([datetime.now()])
        feature_names = X_dummy.columns
        
        # Plot feature importance
        plt.figure(figsize=(12, 8))
        
        # Sort importances
        indices = np.argsort(self.model.feature_importances_)
        top_indices = indices[-20:]  # Show top 20 features
        
        plt.barh(range(len(top_indices)), 
                self.model.feature_importances_[top_indices],
                align='center')
        plt.yticks(range(len(top_indices)), 
                [feature_names[i] for i in top_indices])
        plt.xlabel('Feature Importance')
        plt.title('Top 20 Features by Importance')
        plt.tight_layout()
        
        # Save the plot
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"ml_feature_importance_{timestamp}.png"
        filepath = os.path.join(self.plots_dir, filename)
        plt.savefig(filepath)
        plt.close()
        
        return filename