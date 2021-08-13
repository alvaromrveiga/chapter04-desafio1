import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should get statement operation", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    expect(user.id).not.toBeUndefined();

    const deposit = await inMemoryStatementsRepository.create({
      sender_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: "Deposit to get operation test",
    });

    expect(deposit.id).not.toBeUndefined();

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id!,
      statement_id: deposit.id!,
    });

    expect(statementOperation).toEqual(deposit);
  });

  it("Should not get statement operation if user is invalid", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "Does not exist",
        statement_id: "Also does not exist",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not get statement operation if statement is invalid", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id!,
        statement_id: "Does not exist",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
