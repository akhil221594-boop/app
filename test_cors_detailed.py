#!/usr/bin/env python3
import requests

BACKEND_URL = "https://doctools-6.preview.emergentagent.com/api"

def test_cors_with_origin():
    """Test CORS headers with Origin header"""
    try:
        headers = {'Origin': 'https://example.com'}
        response = requests.get(f"{BACKEND_URL}/", headers=headers)
        
        print("Response Headers:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")
        
        # Check specific CORS headers
        cors_origin = response.headers.get('access-control-allow-origin')
        cors_methods = response.headers.get('access-control-allow-methods')
        cors_headers = response.headers.get('access-control-allow-headers')
        
        print(f"\nCORS Headers:")
        print(f"  Access-Control-Allow-Origin: {cors_origin}")
        print(f"  Access-Control-Allow-Methods: {cors_methods}")
        print(f"  Access-Control-Allow-Headers: {cors_headers}")
        
        if cors_origin == '*':
            print("\n✅ CORS properly configured")
            return True
        else:
            print(f"\n❌ CORS not properly configured - Expected '*', got '{cors_origin}'")
            return False
            
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_cors_with_origin()