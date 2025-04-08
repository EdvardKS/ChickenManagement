#!/usr/bin/env python3
"""
Main module for the AI prediction system.
This module provides a command-line interface to the prediction services.
"""

import os
import sys
import argparse
from api import start_api

def main():
    """Main function for the AI prediction system."""
    parser = argparse.ArgumentParser(description='AI Prediction System')
    parser.add_argument('--port', type=int, default=5000,
                        help='Port to run the API server on')
    parser.add_argument('--debug', action='store_true',
                        help='Run in debug mode')
    parser.add_argument('--host', type=str, default='0.0.0.0',
                        help='Host to run the API server on')
    
    args = parser.parse_args()
    
    # Create output directories if they don't exist
    os.makedirs(os.path.join(os.path.dirname(__file__), 'outputs', 'models'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), 'outputs', 'plots'), exist_ok=True)
    os.makedirs(os.path.join(os.path.dirname(__file__), 'outputs', 'data'), exist_ok=True)
    
    # Start the API server
    start_api(host=args.host, port=args.port, debug=args.debug)

if __name__ == '__main__':
    main()