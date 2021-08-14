import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute(data: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(data.sender_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (data.type === "withdraw") {
      const { balance } = await this.statementsRepository.getUserBalance({
        user_id: data.sender_id,
      });

      if (balance < data.amount) {
        throw new CreateStatementError.InsufficientFunds();
      }
    }

    const statementOperation = await this.statementsRepository.create(data);

    return statementOperation;
  }
}
