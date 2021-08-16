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

    const userTwo = await inMemoryUsersRepository.create({
      name: "User2",
      email: "user2@test.com",
      password: "123",
    });

    expect(user.id).not.toBeUndefined();
    expect(userTwo.id).not.toBeUndefined();

    await inMemoryStatementRepository.create({
      sender_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 1000,
      description: "Deposit to get balance test",
    });

    await inMemoryStatementRepository.create({
      sender_id: user.id!,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw to get balance test",
    });

    await inMemoryStatementRepository.create({
      sender_id: user.id!,
      receiver_id: userTwo.id,
      type: OperationType.TRANSFER,
      amount: 200,
      description: "Transfer to get balance test",
    });

    const balance = await getBalanceUseCase.execute({ user_id: user.id! });

    expect(balance.balance).toBe(700);
    expect(balance.statement.length).toBe(3);

    const userTwoBalance = await getBalanceUseCase.execute({
      user_id: userTwo.id!,
    });

    expect(userTwoBalance.balance).toBe(200);
  });

  it("Should not get balance if user not found", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "Does not exist",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
