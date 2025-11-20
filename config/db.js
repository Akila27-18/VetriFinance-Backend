// config/db.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE, // database name
  process.env.MYSQL_USER,     // username
  process.env.MYSQL_PASSWORD, // password
  {
    host: process.env.MYSQL_HOST || "localhost",
    dialect: "mysql",
    logging: false, // set to console.log to debug
    define: {
      freezeTableName: true, // prevents pluralizing table names
    },
  }
);

export default sequelize;
