"""
Initialization module for the AI prediction system.
"""

import os

# Create output directory if it doesn't exist
output_dir = os.path.join(os.path.dirname(__file__), 'output')
if not os.path.exists(output_dir):
    os.makedirs(output_dir)