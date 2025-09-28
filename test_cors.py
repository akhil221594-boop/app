#!/usr/bin/env python3
import requests

BACKEND_URL = "https://doctools-6.preview.emergentagent.com/api"

def test_cors():
    """Test CORS headers with a simple GET request"""
    try:
        response = requests.get(f"{BACKEND_URL}/")
        print("Response Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
        
        # Check if CORS headers are present
        cors_origin = response.headers.get('access-control-allow-origin')
        if cors_origin:
            print(f"\n✅ CORS configured - Origin: {cors_origin}")
            return True
        else:
            print("\n❌ No CORS headers found")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_cors()