import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import { User } from "../../entities/User";
import { UsersRepository } from "../../repositories/UsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let connection: Connection;
let user: User;
let token: string;

describe("Show User Profile IntegrationTest", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = new UsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepository
    );

    user = await createUserUseCase.execute({
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

  it("Should show user profile", async () => {
    await request(app)
      .get("/api/v1/profile")
      .set({ Authorization: `Bearer ${token}` })
      .send()
      .expect(200);
  });

  it("Should not show user profile if unauthenticated", async () => {
    await request(app).get("/api/v1/profile").send().expect(401);
  });
});