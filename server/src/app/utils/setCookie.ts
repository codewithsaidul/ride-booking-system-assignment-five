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
      secure: true, // O
      sameSite: "none",
      maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days expire date
    });
  }

  // Set cookies for refresh tokens
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,  // Safer from XSS
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days expire date
    });
  }
};
