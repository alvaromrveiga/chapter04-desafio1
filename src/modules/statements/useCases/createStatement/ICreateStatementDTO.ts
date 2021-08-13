import { Statement } from "../../entities/Statement";

type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> & Pick<T, TRequired>

export type ICreateStatementDTO =
OptionalExceptFor<
  Statement,
  'sender_id' |
  'description' |
  'amount' |
  'type'
>