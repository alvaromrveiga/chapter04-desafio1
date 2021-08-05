import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementRepository = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementRepository,
      inMemoryUsersRepository
    );
  });

  it("Should get balance", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    expect(user.id).not.toBeUndefined();

    await inMemoryStatementRepository.create({
      user_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "Deposit to get balance test",
    });

    await inMemoryStatementRepository.create({
      user_id: user.id!,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw to get balance test",
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(balance.balance).toBe(900);
    expect(balance.statement.length).toBe(2);
  });

  it("Should not get balance if user not found", async () => {
    expect(async () => {
      const balance = await getBalanceUseCase.execute({
        user_id: "Does not exist",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});