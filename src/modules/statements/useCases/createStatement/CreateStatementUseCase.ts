import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
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
    console.log(data.receiver_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    await this.ifTransfer(data);

    if (
      data.type === OperationType.WITHDRAW ||
      data.type === OperationType.TRANSFER
    ) {
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

  private async ifTransfer(data: ICreateStatementDTO) {
    if (data.type === OperationType.TRANSFER) {
      if (!data.receiver_id) {
        console.log(1);

        throw new CreateStatementError.UserReceiverNotFound();
      }

      const userReceiver = await this.usersRepository.findById(
        data.receiver_id
      );

      if (!userReceiver) {
        console.log(2);

        throw new CreateStatementError.UserReceiverNotFound();
      }
    }
  }
}
