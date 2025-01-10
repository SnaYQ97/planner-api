export declare global {
 namespace Express {
    // Rozszerzamy interfejs User o wymagane pola
    interface User {
      id: string;
      email: string;
    }
  }
} 