import requests

class AuthService:
    AUTH_URL = "http://localhost:5000/auth/login"  
    @staticmethod
    def authenticate(email: str, password: str) -> str:
        """Authenticate user and return an access token."""
        response = requests.post(AuthService.AUTH_URL, json={"email": email, "password": password})
        if response.status_code == 200:
            return response.json().get("accessToken")  
        raise Exception("Authentication failed")

    @staticmethod
    def get_headers(email: str, password: str):
        """Generate authentication headers for API requests."""
        token = AuthService.authenticate(email, password)
        return {"Authorization": f"Bearer {token}"}
