import dotenv from "dotenv";
dotenv.config();

interface ENVCONFIG {
  PORT: string;
  DB_URL: string;
  NODE_ENV: "development" | "production";
  BCRYPT_SALT_ROUND: string;
  EXPRESS_SESSION_SECRET: string;
  FRONTEND_URL: string;

  JWT: {
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRATION_TIME: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRATION_TIME: string;
  };

  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;

  GOOGLE: {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GOOGLE_CALLBACK_URL: string;
  };
}

const loadEnvVariable = (): ENVCONFIG => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "BCRYPT_SALT_ROUND",
    "EXPRESS_SESSION_SECRET",

    "FRONTEND_URL",

    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRATION_TIME",
    "JWT_REFRESH_SECRET",
    "JWT_REFRESH_EXPIRATION_TIME",

    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",

    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing require environment variable ${key}`);
    }
  });

  return {
    PORT: process.env.PORT as string,
    DB_URL: process.env.DB_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,

    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,

    JWT: {
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
      JWT_ACCESS_EXPIRATION_TIME: process.env
        .JWT_ACCESS_EXPIRATION_TIME as string,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
      JWT_REFRESH_EXPIRATION_TIME: process.env
        .JWT_REFRESH_EXPIRATION_TIME as string,
    },

    GOOGLE: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    },
  };
};

export const envVars = loadEnvVariable();
