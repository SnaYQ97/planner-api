import request from "supertest";

import app, { PATH } from "../index";
import type { CreateBankAccountRequest } from '../types/bankAccount';

const TEST_USERS: Record<string, { email: string; password: string }> = {
  INVALID: {
    email: 'invalid-email',
    password: '123'
  },
  VALID: {
    email: 'testToBeDeleted@example.com',
    password: 'Password123'
  },
  BANK_ACCOUNT: {
    email: 'test@example.com',
    password: 'Password123'
  }
} as const;

const TEST_BANK_ACCOUNT: CreateBankAccountRequest = {
  accountType: 'SAVINGS',
  name: 'Konto oszczędnościowe',
  balance: 1000,
  accountNumber: '11111111111111111111111111',
  interestRate: 3.5,
  interestRateLimit: 10000,
  interestStartDate: new Date().toISOString(),
  interestEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // rok od dziś
  targetAmount: 50000,
  targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // rok od dziś
};

const TEST_DAILY_ACCOUNT: CreateBankAccountRequest = {
  accountType: 'DAILY',
  name: 'Konto główne',
  balance: 5000,
  accountNumber: '22222222222222222222222222',
};

const INVALID_BANK_ACCOUNT: CreateBankAccountRequest = {
  accountType: 'SAVINGS',  // nieprawidłowy typ konta
  name: 'A',  // za krótka nazwa - powinno być odrzucone
  balance: -100,    // ujemne saldo - powinno być odrzucone
  accountNumber: '123', // zły format - powinno być odrzucone
  interestRate: 150,    // za wysokie oprocentowanie - powinno być odrzucone
  interestRateLimit: -1000, // ujemny limit - powinno być odrzucone
  interestStartDate: 'invalid-date', // nieprawidłowa data - powinno być odrzucone
  interestEndDate: 'invalid-date',   // nieprawidłowa data - powinno być odrzucone
  targetAmount: -5000,  // ujemna kwota docelowa - powinno być odrzucone
  targetDate: 'invalid-date', // nieprawidłowa data - powinno być odrzucone
};

describe('App status', () => {
  it('should return 200 for health check', async () => {
    const response = await request(app).get(`${PATH.ROOT}`);
    expect(response.status).toBe(200);
  });
});

describe('Auth API', () => {
  it('should return 401 for unauthenticated user', async () => {
    const response = await request(app).get(`${PATH.AUTH}/status`);
    expect(response.status).toBe(401);
  });
});

describe('User API', () => {
  const createdUserIdsAndEmails: { id: string; email: string }[] = [];

  it('should return 400 for invalid user data', async () => {
    const response = await request(app)
      .post(`${PATH.USER}`)
      .send(TEST_USERS.INVALID);
  
    expect(response.status).toBe(400);
  });

  it('should create user successfully', async () => {
    const response = await request(app)
      .post(`${PATH.USER}/`)
      .send(TEST_USERS.VALID);
    expect(response.statusCode).toBe(201);
    if (response.status === 201 && response.body.user) {
      createdUserIdsAndEmails.push(response.body.user as { id: string; email: string }) 
    }
  });

  it('should delete user successfully', async () => {
    // Tworzymy agenta który zachowa sesję między requestami
    const agent = request.agent(app);

    // Logujemy się
    const loginResponse = await agent
      .post(PATH.AUTH)
      .send(TEST_USERS.VALID);

    expect(loginResponse.statusCode).toBe(200);
    
    // Usuwamy użytkownika używając tego samego agenta
    const response = await agent
      .delete(`${PATH.USER}/${loginResponse.body.user.id}`);

    expect(response.statusCode).toBe(200);
    
    if (response.statusCode !== 200) {
      createdUserIdsAndEmails.push(loginResponse.body.user as { id: string; email: string })
    }
  });

  afterAll(async () => {
    console.log(createdUserIdsAndEmails);
    // promise all for all created users
    await Promise.all(createdUserIdsAndEmails.map((createdUser) => {
      const user = Object.values(TEST_USERS).find(({email}) => email === createdUser.email);
      // at first we need to login
      request(app)
        .post(PATH.AUTH)
        .send(user);

      request(app).delete(`${PATH.USER}/${createdUser.id}`)
    }));
  });
});

describe('Bank Account API', () => {
  let userId: string;
  const agent = request.agent(app);

  beforeAll(async () => {
    // Create test user
    const createResponse = await request(app)
      .post(`${PATH.USER}`)
      .send(TEST_USERS.BANK_ACCOUNT);

    // Login using agent
    const loginResponse = await agent
      .post(PATH.AUTH)
      .send(TEST_USERS.BANK_ACCOUNT);
      
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    // Delete test user using the same agent (zachowujemy sesję)
    await agent
      .delete(`${PATH.USER}/${userId}`);
  });

  describe('Bank Account Operations', () => {
    it('should reject invalid bank account data', async () => {
      const response = await agent
        .post(PATH.BANK_ACCOUNT)
        .send(INVALID_BANK_ACCOUNT);
      
      expect(response.status).toBe(400);
    });

    it('should create savings account with valid data', async () => {
      const response = await agent
        .post(PATH.BANK_ACCOUNT)
        .send(TEST_BANK_ACCOUNT);
      
      expect(response.status).toBe(201);
      expect(response.body.account).toBeDefined();
      expect(response.body.account.accountType).toBe('SAVINGS');
      expect(response.body.account.accountNumber).toBe(TEST_BANK_ACCOUNT.accountNumber);
      expect(response.body.account.interestRate).toBe(TEST_BANK_ACCOUNT.interestRate?.toString());
    });

    it('should create daily account with valid data', async () => {
      const response = await agent
        .post(PATH.BANK_ACCOUNT)
        .send(TEST_DAILY_ACCOUNT);
      
      expect(response.status).toBe(201);
      expect(response.body.account).toBeDefined();
      expect(response.body.account.accountType).toBe('DAILY');
      expect(response.body.account.accountNumber).toBe(TEST_DAILY_ACCOUNT.accountNumber.toString());
      expect(response.body.account.interestRate).toBeNull();
    });

    it('should get all bank accounts', async () => {
      const response = await agent
        .get(PATH.BANK_ACCOUNT)
        .expect(200);

      expect(Array.isArray(response.body.accounts)).toBe(true);
      expect(response.body.accounts.length).toBe(2); // powinny być 2 konta (savings i daily)
      
      // Sprawdzamy czy mamy oba typy kont
      const accountTypes = response.body.accounts.map((acc: any) => acc.accountType);
      expect(accountTypes).toContain('SAVINGS');
      expect(accountTypes).toContain('DAILY');
    });
  });
}); 
