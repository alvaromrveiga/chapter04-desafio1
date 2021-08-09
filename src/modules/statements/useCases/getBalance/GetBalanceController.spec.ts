import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";

let token: string;
let connection: Connection;

describe("Get Balance IntegrationTest", () => {
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

  it("Should get balance", async () => {
    await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send()
      .expect(200);
  });

  it("Should not get balance if unauthenticated", async () => {
    await request(app)
      .get("/api/v1/statements/balance")
      .send()
      .expect(401);
  });
});
