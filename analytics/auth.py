import jwt
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.status import HTTP_401_UNAUTHORIZED, HTTP_403_FORBIDDEN
import os
from datetime import datetime, timedelta

# JWT Secret key - should be loaded from environment variable in production
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"
JWT_AUDIENCE = "finance-management-analytics"

security = HTTPBearer()

class AuthHandler:
    def __init__(self):
        self.secret = JWT_SECRET
        self.algorithm = JWT_ALGORITHM
        self.audience = JWT_AUDIENCE

    def decode_token(self, token):
        try:
            # Decode with audience validation
            payload = jwt.decode(
                token,
                self.secret,
                algorithms=[self.algorithm],
                audience=self.audience
            )
            if datetime.fromtimestamp(payload['exp']) < datetime.now():
                raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Token has expired")
            return payload
        except jwt.InvalidTokenError as e:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {str(e)}")

    def auth_wrapper(self, auth: HTTPAuthorizationCredentials = Security(security)):
        return self.decode_token(auth.credentials)

    def get_user_id(self, auth: HTTPAuthorizationCredentials = Security(security)):
        payload = self.decode_token(auth.credentials)
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="User ID not found in token")
        return user_id

auth_handler = AuthHandler()
get_user_id = auth_handler.get_user_id
