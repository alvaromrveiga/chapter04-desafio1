import { hash } from "bcryptjs";
import { verify } from "jsonwebtoken";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

interface IPayload {
  iat: number;
  exp: number;
  sub: "string";
}

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should authenticate user", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    user.password = await hash(user.password, 8);

    expect(user.id).not.toBeUndefined();

    const authenticate = await authenticateUserUseCase.execute({
      email: user.email,
      password: "123",
    });

    expect(authenticate.user).not.toContain("password");

    expect(authenticate.user).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
    });

    const payload = verify(
      authenticate.token,
      process.env.JWT_SECRET!
    ) as IPayload;

    expect(payload.sub).toEqual(user.id);
  });

  it("Should not authenticate non-existent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "Does not exist",
        password: "123",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not authenticate user with invalid password", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    user.password = await hash(user.password, 8);

    expect(user.id).not.toBeUndefined();

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "wrong",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
