import request from "supertest";
import { app } from "../../../../app";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import createConnection from "../../../../database/index";
import { Connection } from "typeorm";

let token: string;
let connection: Connection;

describe("Create Statement IntegrationTest", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = new UsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepository
    );

    await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    const authenticate = await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "123",
    });

    token = authenticate.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should create deposit statement", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: "Deposit test",
      })
      .expect(201);
  });

  it("Should create withdraw statement", async () => {
    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 50,
        description: "Withdraw test",
      })
      .expect(201);
  });

  it("Should not create withdraw statement if funds are insufficient", async () => {
    await request(app)
      .post("/api/v1/statements/withdraw")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 50000,
        description: "Withdraw test",
      })
      .expect(400);
  });

  it("Should not create statement if user is unauthenticated", async () => {
    await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit test",
      })
      .expect(401);
  });
});
