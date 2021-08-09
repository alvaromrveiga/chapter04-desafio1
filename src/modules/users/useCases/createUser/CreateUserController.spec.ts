import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import { UsersRepository } from "../../repositories/UsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let connection: Connection;

describe("Create User IntegrationTest", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = new UsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);

    await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should create user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "Tester",
        email: "tester@test.com",
        password: "123",
      })
      .expect(201);
  });

  it("Should not create user if email already in use", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "Tester2",
        email: "user@test.com",
        password: "123",
      })
      .expect(400);
  });
});
