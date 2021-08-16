import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateStatementError {
  export class UserNotFound extends AppError {
    constructor() {
      super("User not found", 404);
    }
  }

  export class UserReceiverNotFound extends AppError {
    constructor() {
      super("User receiver not found", 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient funds", 400);
    }
  }

  export class TransferToYourself extends AppError {
    constructor() {
      super("You can't send a transfer to yourself", 400);
    }
  }
}
