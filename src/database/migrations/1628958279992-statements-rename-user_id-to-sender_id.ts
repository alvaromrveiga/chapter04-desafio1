import { MigrationInterface, QueryRunner } from "typeorm";

export class statementsRenameUserIdToReceiverId1628882759094
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn("statements", "user_id", "sender_id");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn("statements", "sender_id", "user_id");
  }
}
