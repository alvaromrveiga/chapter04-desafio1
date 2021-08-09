import request from "supertest";
import { app } from "../../../../app";
import { UsersRepository } from "../../../users/repositories/UsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import createConnection from "../../../../database/index";
import { Connection } from "typeorm";
import { StatementsRepository } from "../../repositories/StatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { OperationType, Statement } from "../../entities/Statement";

let token: string;
let connection: Connection;
let statement: Statement;

describe("Get Statement Operation IntegrationTest", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();    

    const usersRepository = new UsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepository
    );

    const createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      new StatementsRepository()
    );

    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    const authenticate = await authenticateUserUseCase.execute({
      email: "user@test.com",
      password: "123",
    });

    token = authenticate.token;

    statement = await createStatementUseCase.execute({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 300,
      description: "Deposit test",
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should get a statement", async () => {
    await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send()
      .expect(200);
  });

  it("Should not get a statement if user is unauthenticated", async () => {
    await request(app)
      .get(`/api/v1/statements/${statement.id}`)
      .send()
      .expect(401);
  });

  it("Should not get an invalid statement", async () => {
    await request(app)
      .get(`/api/v1/statements/85a5704d-816a-4990-8003-c872dbb0061b`)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send()
      .expect(404);
  });
});
