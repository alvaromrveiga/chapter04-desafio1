import { Connection, createConnection, getConnectionOptions } from "typeorm";

export default async (host = "database_chapter04"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();
  console.log(defaultOptions.database);

  return createConnection(
    Object.assign(defaultOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      database:
        process.env.NODE_ENV === "test"
          ? defaultOptions.database + "_test"
          : defaultOptions.database,
    })
  );
};