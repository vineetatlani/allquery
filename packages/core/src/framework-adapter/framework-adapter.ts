// FrameworkAdapter.ts
import { BaseQueryConfig } from "../query";

export abstract class FrameworkAdapter<T extends BaseQueryConfig<T>> {
  protected databaseAdapter: any;
  protected apiPath: string;

  constructor(databaseAdapter: any, apiPath: string) {
    if (new.target === FrameworkAdapter) {
      throw new Error("FrameworkAdapter is an abstract class and cannot be instantiated directly.");
    }
    this.databaseAdapter = databaseAdapter;
    this.apiPath = apiPath;
  }

  abstract start(port: number): void;
}
