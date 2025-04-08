#!/usr/bin/env python3
"""
Data processor module for the AI prediction system.
This module processes the data fetched from the database for analysis and prediction.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def calculate_daily_usage(stock_history_df):
    """
    Calculate the daily usage of stock from stock history data.
    
    Args:
        stock_history_df: DataFrame with stock history data
        
    Returns:
        DataFrame with daily usage data
    """
    # Filter only actions that reduce stock (sell, remove)
    usage_df = stock_history_df[stock_history_df['action'].isin(['sell', 'remove'])]
    
    # Convert createdAt to datetime if it's not already
    if usage_df['createdAt'].dtype != 'datetime64[ns]':
        usage_df['createdAt'] = pd.to_datetime(usage_df['createdAt'])
    
    # Add date column (without time)
    usage_df['date'] = usage_df['createdAt'].dt.date
    
    # Group by date and sum the quantities
    daily_usage = usage_df.groupby('date')['quantity'].sum().reset_index()
    
    # Convert date to datetime for compatibility with Prophet
    daily_usage['date'] = pd.to_datetime(daily_usage['date'])
    
    # Fill in missing dates with zero usage
    date_range = pd.date_range(
        start=daily_usage['date'].min(), 
        end=daily_usage['date'].max()
    )
    
    complete_df = pd.DataFrame({'date': date_range})
    daily_usage = pd.merge(complete_df, daily_usage, on='date', how='left')
    daily_usage['usage'] = daily_usage['quantity'].fillna(0).astype(float)
    
    return daily_usage[['date', 'usage']]

def prepare_time_series_data(daily_usage_df, date_column='date', value_column='usage'):
    """
    Prepare time series data for forecasting.
    
    Args:
        daily_usage_df: DataFrame with daily usage data
        date_column: Column name for date
        value_column: Column name for value to predict
        
    Returns:
        DataFrame with prepared time series data for Prophet
    """
    # Ensure date is in datetime format
    if daily_usage_df[date_column].dtype != 'datetime64[ns]':
        daily_usage_df[date_column] = pd.to_datetime(daily_usage_df[date_column])
    
    # Rename columns to Prophet's required format (ds and y)
    prophet_df = daily_usage_df.rename(columns={
        date_column: 'ds',
        value_column: 'y'
    })
    
    # Sort by date
    prophet_df = prophet_df.sort_values('ds')
    
    return prophet_df

def calculate_hourly_distribution(orders_df, stock_history_df):
    """
    Calculate the hourly distribution of orders and stock operations.
    
    Args:
        orders_df: DataFrame with orders data
        stock_history_df: DataFrame with stock history data
        
    Returns:
        DataFrame with hourly distribution data
    """
    # Process orders data
    if orders_df.empty:
        hourly_orders = {}
        hourly_orders_pct = {}
    else:
        # Convert to datetime
        if orders_df['createdAt'].dtype != 'datetime64[ns]':
            orders_df['createdAt'] = pd.to_datetime(orders_df['createdAt'])
        
        # Get hour of day and count
        orders_df['hour'] = orders_df['createdAt'].dt.hour
        hourly_counts = orders_df.groupby('hour').size()
        total_orders = hourly_counts.sum()
        
        # Calculate percentages
        if total_orders > 0:
            hourly_pct = (hourly_counts / total_orders * 100).round(1)
        else:
            hourly_pct = hourly_counts * 0
            
        hourly_orders = hourly_counts.to_dict()
        hourly_orders_pct = hourly_pct.to_dict()
    
    # Process stock operations data
    if stock_history_df.empty:
        hourly_stock_ops = {}
        hourly_stock_ops_pct = {}
    else:
        # Convert to datetime
        if stock_history_df['createdAt'].dtype != 'datetime64[ns]':
            stock_history_df['createdAt'] = pd.to_datetime(stock_history_df['createdAt'])
        
        # Get hour of day and count
        stock_history_df['hour'] = stock_history_df['createdAt'].dt.hour
        hourly_counts = stock_history_df.groupby('hour').size()
        total_ops = hourly_counts.sum()
        
        # Calculate percentages
        if total_ops > 0:
            hourly_pct = (hourly_counts / total_ops * 100).round(1)
        else:
            hourly_pct = hourly_counts * 0
            
        hourly_stock_ops = hourly_counts.to_dict()
        hourly_stock_ops_pct = hourly_pct.to_dict()
    
    return {
        'hourly_orders': hourly_orders,
        'hourly_orders_pct': hourly_orders_pct,
        'hourly_stock_ops': hourly_stock_ops,
        'hourly_stock_ops_pct': hourly_stock_ops_pct
    }

def calculate_weekly_distribution(orders_df, stock_history_df):
    """
    Calculate the weekly distribution of orders and stock operations.
    
    Args:
        orders_df: DataFrame with orders data
        stock_history_df: DataFrame with stock history data
        
    Returns:
        DataFrame with weekly distribution data
    """
    # Days of week mapping
    day_names = {
        0: 'Lunes',
        1: 'Martes',
        2: 'Miércoles',
        3: 'Jueves',
        4: 'Viernes',
        5: 'Sábado',
        6: 'Domingo'
    }
    
    # Process orders data
    if orders_df.empty:
        weekly_orders = {}
        weekly_orders_pct = {}
    else:
        # Convert to datetime
        if orders_df['createdAt'].dtype != 'datetime64[ns]':
            orders_df['createdAt'] = pd.to_datetime(orders_df['createdAt'])
        
        # Get day of week and count
        orders_df['weekday'] = orders_df['createdAt'].dt.weekday
        orders_df['weekday_name'] = orders_df['weekday'].map(day_names)
        weekly_counts = orders_df.groupby('weekday_name').size()
        total_orders = weekly_counts.sum()
        
        # Calculate percentages
        if total_orders > 0:
            weekly_pct = (weekly_counts / total_orders * 100).round(1)
        else:
            weekly_pct = weekly_counts * 0
            
        weekly_orders = weekly_counts.to_dict()
        weekly_orders_pct = weekly_pct.to_dict()
    
    # Process stock operations data
    if stock_history_df.empty:
        weekly_stock_ops = {}
        weekly_stock_ops_pct = {}
    else:
        # Convert to datetime
        if stock_history_df['createdAt'].dtype != 'datetime64[ns]':
            stock_history_df['createdAt'] = pd.to_datetime(stock_history_df['createdAt'])
        
        # Get day of week and count
        stock_history_df['weekday'] = stock_history_df['createdAt'].dt.weekday
        stock_history_df['weekday_name'] = stock_history_df['weekday'].map(day_names)
        weekly_counts = stock_history_df.groupby('weekday_name').size()
        total_ops = weekly_counts.sum()
        
        # Calculate percentages
        if total_ops > 0:
            weekly_pct = (weekly_counts / total_ops * 100).round(1)
        else:
            weekly_pct = weekly_counts * 0
            
        weekly_stock_ops = weekly_counts.to_dict()
        weekly_stock_ops_pct = weekly_pct.to_dict()
    
    return {
        'weekly_orders': weekly_orders,
        'weekly_orders_pct': weekly_orders_pct,
        'weekly_stock_ops': weekly_stock_ops,
        'weekly_stock_ops_pct': weekly_stock_ops_pct
    }

def calculate_monthly_distribution(orders_df, stock_history_df):
    """
    Calculate the monthly distribution of orders and stock operations.
    
    Args:
        orders_df: DataFrame with orders data
        stock_history_df: DataFrame with stock history data
        
    Returns:
        DataFrame with monthly distribution data
    """
    # Month names
    month_names = {
        1: 'Enero',
        2: 'Febrero',
        3: 'Marzo',
        4: 'Abril',
        5: 'Mayo',
        6: 'Junio',
        7: 'Julio',
        8: 'Agosto',
        9: 'Septiembre',
        10: 'Octubre',
        11: 'Noviembre',
        12: 'Diciembre'
    }
    
    # Process orders data
    if orders_df.empty:
        monthly_orders = {}
        monthly_orders_pct = {}
    else:
        # Convert to datetime
        if orders_df['createdAt'].dtype != 'datetime64[ns]':
            orders_df['createdAt'] = pd.to_datetime(orders_df['createdAt'])
        
        # Get month and count
        orders_df['month'] = orders_df['createdAt'].dt.month
        orders_df['month_name'] = orders_df['month'].map(month_names)
        monthly_counts = orders_df.groupby('month_name').size()
        total_orders = monthly_counts.sum()
        
        # Calculate percentages
        if total_orders > 0:
            monthly_pct = (monthly_counts / total_orders * 100).round(1)
        else:
            monthly_pct = monthly_counts * 0
            
        monthly_orders = monthly_counts.to_dict()
        monthly_orders_pct = monthly_pct.to_dict()
    
    # Process stock operations data
    if stock_history_df.empty:
        monthly_stock_ops = {}
        monthly_stock_ops_pct = {}
    else:
        # Convert to datetime
        if stock_history_df['createdAt'].dtype != 'datetime64[ns]':
            stock_history_df['createdAt'] = pd.to_datetime(stock_history_df['createdAt'])
        
        # Get month and count
        stock_history_df['month'] = stock_history_df['createdAt'].dt.month
        stock_history_df['month_name'] = stock_history_df['month'].map(month_names)
        monthly_counts = stock_history_df.groupby('month_name').size()
        total_ops = monthly_counts.sum()
        
        # Calculate percentages
        if total_ops > 0:
            monthly_pct = (monthly_counts / total_ops * 100).round(1)
        else:
            monthly_pct = monthly_counts * 0
            
        monthly_stock_ops = monthly_counts.to_dict()
        monthly_stock_ops_pct = monthly_pct.to_dict()
    
    return {
        'monthly_orders': monthly_orders,
        'monthly_orders_pct': monthly_orders_pct,
        'monthly_stock_ops': monthly_stock_ops,
        'monthly_stock_ops_pct': monthly_stock_ops_pct
    }

def calculate_average_daily_usage(daily_usage_df, last_n_days=30):
    """
    Calculate the average daily usage over the last N days.
    
    Args:
        daily_usage_df: DataFrame with daily usage data
        last_n_days: Number of days to consider for the average
        
    Returns:
        Average daily usage as a float
    """
    if daily_usage_df.empty:
        return 0.0
    
    # Sort by date
    daily_usage_df = daily_usage_df.sort_values('date', ascending=False)
    
    # Get last N days of data
    recent_df = daily_usage_df.head(last_n_days)
    
    # Calculate average
    avg_usage = recent_df['usage'].mean()
    
    return float(avg_usage) if not np.isnan(avg_usage) else 0.0

def predict_days_until_empty(current_stock, avg_daily_usage):
    """
    Predict the number of days until the stock is empty.
    
    Args:
        current_stock: Current unreserved stock
        avg_daily_usage: Average daily usage
        
    Returns:
        Number of days until empty as a float
    """
    if avg_daily_usage <= 0:
        return float('inf')  # Infinite days if no usage
    
    days = current_stock / avg_daily_usage
    return days