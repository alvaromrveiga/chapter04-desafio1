import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("Should show user profile", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "User",
      email: "user@test.com",
      password: "123",
    });

    expect(user.id).not.toBeUndefined();

    const profile = await showUserProfileUseCase.execute(user.id!);

    expect(profile).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  });

  it("Should not show non-existent user profile", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("Invalid id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
