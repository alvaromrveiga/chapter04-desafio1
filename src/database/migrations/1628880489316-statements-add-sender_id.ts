import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class statementsAddSenderId1628880489316 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "sender_id",
        type: "uuid",
        default: "'642d0553-8cdb-4475-ab81-a6fa66513be7'",
      })
    );

    await queryRunner.query(
      "UPDATE statements SET sender_id = user_id WHERE sender_id = '642d0553-8cdb-4475-ab81-a6fa66513be7'"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("statements", "sender_id");
  }
}
