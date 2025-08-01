/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs";
import passport from "passport";
// import {
//   Strategy as GoogleStrategy,
//   Profile,
//   VerifyCallback,
// } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { IsActive } from "../Modules/user/user.interface";
import { User } from "../Modules/user/user.model";
// import { envVars } from "./env";

// This configures Passport.js for user authentication using the Local Strategy.
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done: any) => {
      try {
        const isUserExist = await User.findOne({ email });

        if (!isUserExist) {
          return done(null, false, { message: "User not found" });
        }

        // check if user verified or unVerified
        if (!isUserExist.isVerified) {
          return done(null, false, {
            message: "You're not verified yet, please verify your email first",
          });
        }

        // check if user is InActive or Blocked
        if (
          isUserExist.isActive === IsActive.INACTIVE ||
          isUserExist.isActive === IsActive.BLOCKED
        ) {
          return done(null, false, {
            message: `User is ${isUserExist.isActive}, please contact our support team.`,
          });
        }

        // check if user is deleted
        if (isUserExist.isDeleted) {
          return done(null, false, { message: "User is deleted." });
        }

        const isGoogleAuthenticatior = isUserExist?.auths?.some(
          (providerObject) => providerObject.provider === "google"
        );

        // if user is created with google and password is not set
        if (isGoogleAuthenticatior && !isUserExist.password) {
          return done(
            "Your account was created using Google. To log in, please click the 'Continue with Google' button. If you'd like to log in with a password, please set one first by using the 'Set Password?' option in your account."
          );
        }

        const isPasswordMatch = await bcrypt.compare(
          password as string,
          isUserExist?.password as string
        );

        if (!isPasswordMatch) {
          return done(null, false, { message: "Incorrect password" });
        }

        return done(null, isUserExist, { message: "Login successful" });
      } catch (error) {
        done(error);
      }
    }
  )
);

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: envVars.GOOGLE.GOOGLE_CLIENT_ID,
//       clientSecret: envVars.GOOGLE.GOOGLE_CLIENT_SECRET,
//       callbackURL: envVars.GOOGLE.GOOGLE_CALLBACK_URL,
//     },
//     async (
//       accessToken: string,
//       refreshToken: string,
//       profile: Profile,
//       done: VerifyCallback
//     ) => {
//       try {
//         const email = profile.emails?.[0]?.value;

//         if (!email) {
//           return done(new Error("No email found"));
//         }

//         let isUserExist = await User.findOne({ email });

//         if (isUserExist && !isUserExist.isVerified) {
//           return done(null, false, {
//             message: "You're not verified. please verify your email first",
//           });
//         }

//         // check if user is InActive or Blocked
//         if (
//           isUserExist &&
//           (isUserExist.isActive === IsActive.INACTIVE ||
//             isUserExist.isActive === IsActive.BLOCKED)
//         ) {
//           return done(null, false, {
//             message: `User is ${isUserExist.isActive}, please contact our support team.`,
//           });
//         }

//         // check if user is deleted
//         if (isUserExist && isUserExist.isDeleted) {
//           return done(null, false, { message: "User is deleted." });
//         }

//         if (!isUserExist) {
//           isUserExist = await User.create({
//             name: profile.displayName || "Google User",
//             email,
//             profilePicture: profile?.photos?.[0]?.value,
//             role: Role.RIDER,
//             isActive: IsActive.ACTIVE,
//             isVerified: true,
//             isDeleted: false,
//             auths: [
//               {
//                 provider: "google",
//                 providerId: profile.emails?.[0]?.value,
//               },
//             ],
//           });
//         }

//         return done(null, isUserExist);
//       } catch (error) {
//         done(error);
//       }
//     }
//   )
// );

// Serialize and deserialize user for session management
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
