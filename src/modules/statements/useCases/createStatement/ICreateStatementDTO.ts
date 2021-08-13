export interface ICreateStatementDTO {
  receiver_id?: string;
  sender_id: string;
  description: string;
  amount: number;
  type: string;
}
