declare module 'express-session' {
  interface SessionData {
    passport: {
      user: Express.User;
    };
  }
}

export {}; 