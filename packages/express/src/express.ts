// ExpressAdapter.ts
import express from 'express';
import { BaseQueryConfig } from "@allquery/core";
import qs from "qs";

export class ExpressAdapter<T extends BaseQueryConfig<T>> {
  private app: express.Application;
  private databaseAdapter: any;
  private apiPath: string;

  constructor(app: express.Application, databaseAdapter: any, apiPath: string) {
    this.databaseAdapter = databaseAdapter;
    this.apiPath = apiPath
    this.app = app;
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.app.get(this.apiPath, async (req: any, res: any) => {
      try {
        const queryConfig = qs.parse(req.query);
        const results = await this.databaseAdapter.query(queryConfig);
        res.json(results);
      } catch (error) {
        console.error(error)
        res.status(400).json({ error: error });
      }
    });
  }
}
