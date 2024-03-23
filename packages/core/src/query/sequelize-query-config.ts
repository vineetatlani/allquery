import { Model, ModelAttributes, WhereOptions } from "sequelize";
import { BaseQueryConfig } from "./base-query-config";

export interface SequelizeAdapterQueryConfig extends BaseQueryConfig<SequelizeAdapterQueryConfig> {
  $like?: { [key: string]: any };
  $notlike?: { [key: string]: any };
}
