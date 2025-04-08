#!/usr/bin/env python3
"""
Database connector module for the AI prediction system.
This module connects to the PostgreSQL database and provides functions to fetch data.
"""

import os
import pandas as pd
import psycopg2
from datetime import datetime, timedelta

class DatabaseConnector:
    """Class to connect to the PostgreSQL database and fetch data."""
    
    def __init__(self):
        """Initialize the database connector."""
        self.conn = None
        self.database_url = os.environ.get('DATABASE_URL', '')
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable not set")
    
    def connect(self):
        """Connect to the PostgreSQL database."""
        try:
            self.conn = psycopg2.connect(self.database_url)
            return self.conn
        except Exception as e:
            print(f"Error connecting to database: {e}")
            raise
    
    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def get_stock_history(self, days=None):
        """
        Fetch stock history data from the database.
        
        Args:
            days: Optional number of days to fetch data for (from today)
            
        Returns:
            Pandas DataFrame with stock history data
        """
        try:
            self.connect()
            cursor = self.conn.cursor()
            
            query = """
                SELECT
                    "id",
                    "stockId",
                    "action",
                    "quantity",
                    "newStock",
                    "description",
                    "createdAt",
                    "createdBy"
                FROM "stockHistory"
                WHERE "deleted" = false
            """
            
            if days:
                date_limit = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
                query += f" AND \"createdAt\" >= '{date_limit}'"
                
            query += " ORDER BY \"createdAt\" DESC"
            
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            
            data = cursor.fetchall()
            df = pd.DataFrame(data, columns=columns)
            
            self.close()
            return df
        except Exception as e:
            print(f"Error fetching stock history: {e}")
            self.close()
            raise
    
    def get_daily_stock(self, days=None):
        """
        Fetch daily stock data from the database.
        
        Args:
            days: Optional number of days to fetch data for (from today)
            
        Returns:
            Pandas DataFrame with daily stock data
        """
        try:
            self.connect()
            cursor = self.conn.cursor()
            
            query = """
                SELECT
                    "id",
                    "date",
                    "initialStock",
                    "currentStock",
                    "reservedStock",
                    "unreservedStock",
                    "lastUpdated"
                FROM "stock"
            """
            
            if days:
                date_limit = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
                query += f" WHERE \"date\" >= '{date_limit}'"
                
            query += " ORDER BY \"date\" DESC"
            
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            
            data = cursor.fetchall()
            df = pd.DataFrame(data, columns=columns)
            
            self.close()
            return df
        except Exception as e:
            print(f"Error fetching daily stock: {e}")
            self.close()
            raise
    
    def get_orders(self, days=None):
        """
        Fetch orders data from the database.
        
        Args:
            days: Optional number of days to fetch data for (from today)
            
        Returns:
            Pandas DataFrame with orders data
        """
        try:
            self.connect()
            cursor = self.conn.cursor()
            
            query = """
                SELECT
                    "id",
                    "customerName",
                    "quantity",
                    "pickupTime",
                    "status",
                    "totalAmount",
                    "createdAt",
                    "updatedAt"
                FROM "orders"
                WHERE "deleted" = false
            """
            
            if days:
                date_limit = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
                query += f" AND \"createdAt\" >= '{date_limit}'"
                
            query += " ORDER BY \"createdAt\" DESC"
            
            cursor.execute(query)
            columns = [desc[0] for desc in cursor.description]
            
            data = cursor.fetchall()
            df = pd.DataFrame(data, columns=columns)
            
            self.close()
            return df
        except Exception as e:
            print(f"Error fetching orders: {e}")
            self.close()
            raise

_connector = None

def get_connector():
    """Get the database connector instance."""
    global _connector
    if _connector is None:
        _connector = DatabaseConnector()
    return _connector