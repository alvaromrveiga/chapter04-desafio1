import { validate } from "uuid";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    expect(validate(user.id!)).toBe(true);

    expect(user.password).not.toBe("123");

    expect(user).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    });
  });

  it("Should not create user with already in use email", async () => {
    await createUserUseCase.execute({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    expect(async () => {
      await createUserUseCase.execute({
        name: "User2",
        email: "user@test.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(CreateUserError)
  })
});
