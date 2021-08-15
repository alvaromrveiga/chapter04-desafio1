import { validate } from "uuid";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      new InMemoryStatementsRepository()
    );
  });

  it("Should create a new deposit statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User name",
      email: "user@test.com",
      password: "123",
    });

    expect(user.id).not.toBeUndefined();

    const depositStatement = await createStatementUseCase.execute({
      sender_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit description",
    });

    expect(validate(depositStatement.id!)).toBe(true);

    expect(depositStatement).toMatchObject({
      id: depositStatement.id,
      sender_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit description",
    });
  });

  it("Should create a new withdraw statement", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User name",
      email: "user@test.com",
      password: "123",
    });

    expect(user.id).not.toBeUndefined();

    await createStatementUseCase.execute({
      sender_id: user.id!,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit description",
    });

    const withdrawStatement = await createStatementUseCase.execute({
      sender_id: user.id!,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw description",
    });

    expect(validate(withdrawStatement.id!)).toBe(true);

    expect(withdrawStatement).toMatchObject({
      id: withdrawStatement.id,
      sender_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: "Withdraw description",
    });
  });

  it("Should not create a new statement for invalid user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        sender_id: "invalid id",
        type: OperationType.DEPOSIT,
        amount: 500,
        description: "Deposit description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not create a new statement if funds are insufficient", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User name",
      email: "user@test.com",
      password: "123",
    });

    expect(user.id).not.toBeUndefined();

    expect(async () => {
      await createStatementUseCase.execute({
        sender_id: user.id!,
        type: OperationType.WITHDRAW,
        amount: 50,
        description: "Withdraw description",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("Should create a new transfer statement", async () => {
    const sender = await inMemoryUsersRepository.create({
      name: "Sender user",
      email: "sender@test.com",
      password: "123",
    });

    const receiver = await inMemoryUsersRepository.create({
      name: "Receiver user",
      email: "receiver@test.com",
      password: "123",
    });

    await createStatementUseCase.execute({
      sender_id: sender.id!,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit description",
    });

    const transferStatement = await createStatementUseCase.execute({
      sender_id: sender.id!,
      receiver_id: receiver.id,
      type: OperationType.TRANSFER,
      amount: 100,
      description: "Transfer description",
    });

    expect(validate(transferStatement.id!)).toBe(true);

    expect(transferStatement).toMatchObject({
      id: transferStatement.id,
      sender_id: sender.id,
      receiver_id: receiver.id,
      type: "transfer",
      amount: 100,
      description: "Transfer description",
    });
  });

  it("Should not create a new transfer statement if receiver is invalid", async () => {
    const sender = await inMemoryUsersRepository.create({
      name: "Sender user",
      email: "sender@test.com",
      password: "123",
    });

    await createStatementUseCase.execute({
      sender_id: sender.id!,
      type: OperationType.DEPOSIT,
      amount: 500,
      description: "Deposit description",
    });

    await expect(
      createStatementUseCase.execute({
        sender_id: sender.id!,
        receiver_id: "Invalid",
        type: OperationType.TRANSFER,
        amount: 100,
        description: "Transfer description",
      })
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
