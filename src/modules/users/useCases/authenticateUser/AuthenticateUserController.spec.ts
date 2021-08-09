import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { User } from "../../entities/User";

let user: User;
let connection: Connection;

describe("Authenticate User IntegrationTest", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const usersRepository = new UsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);

    user = await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should authenticate user", async () => {
    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: "123",
      })
      .expect(200);
  });

  it("Should not authenticate user with wrong password", async () => {
    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: user.email,
        password: "wrong",
      })
      .expect(401);
  });

  it("Should not authenticate user with wrong email", async () => {
    await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "wrong",
        password: "123",
      })
      .expect(401);
  });
});
