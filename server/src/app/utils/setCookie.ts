import { envVars } from "../config/env";
import { TResponse } from "../types/global";

interface AuthToken {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: TResponse, tokenInfo: AuthToken) => {
  // Set cookies for access tokens
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true, // Safer from XSS
      secure: envVars.NODE_ENV === "production", // Only sends over HTTPS on production
      sameSite: "none"
    });
  }

  // Set cookies for refresh tokens
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,  // Safer from XSS
      secure: envVars.NODE_ENV === "production", // Only sends over HTTPS on production
      sameSite: "none"
    });
  }
};
