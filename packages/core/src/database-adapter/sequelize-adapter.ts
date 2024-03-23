import { Op } from "sequelize";
import { Operator } from "../query/operators";
import { DatabaseAdapter } from "./database-adapter";
import { SequelizeAdapterQueryConfig } from "../query";

export class SequelizeAdapter extends DatabaseAdapter<SequelizeAdapterQueryConfig> {
    private model: any;

    constructor(model: any) {
        super();
        this.model = model;
        this.attributes = Object.keys(this.model.getAttributes());
    }

    public async query(config: SequelizeAdapterQueryConfig): Promise<any> {
        this.validateQuery(config);
        const findOptions = this.buildFindOptions(config);
        const results = await this.model.findAll(findOptions);
        return results;
    }

    private buildFindOptions(config: SequelizeAdapterQueryConfig): any {
        const where = this.buildWhereOptions(config);
        const findOptions: any = { where: where };
        
        if (config.$skip !== undefined) {
            findOptions.offset = config.$skip;
        }
        if (config.$limit !== undefined) {
            findOptions.limit = config.$limit;
        }
        if (config.$sort !== undefined) {
            findOptions.order = this.buildOrderOption(config.$sort);
        }

        return findOptions;
    }

    private buildOrderOption(sortConfig: any): any[] {
        if (typeof sortConfig === "string") {
            return [[sortConfig, "ASC"]];
        } else if (Array.isArray(sortConfig)) {
            return sortConfig.map((attribute) => [attribute, "ASC"]);
        } else {
            return Object.entries(sortConfig).map(([attribute, order]) => {
                if (!this.attributes.includes(attribute)) {
                    throw new Error(`Invalid attribute: ${attribute} is not a valid attribute of the model.`);
                }
                return [attribute, order === 1 ? "ASC" : "DESC"];
            });
        }
    }

    private buildWhereOptions(config: SequelizeAdapterQueryConfig): any {
        const where: any = {};
        const keys = Object.keys(config);

        for (const key of keys) {
            if (this.attributes.includes(key)) {
                where[key] = config[key];
            }
        }

        const handleOperator = (operator: string, sequelizeOp: any) => {
            const operatorConfig = config[operator];
            if (operatorConfig) {
                if (operatorConfig && typeof operatorConfig === "object") {
                    for (const key in operatorConfig) {
                        if (this.attributes.includes(key)) {
                            const value = operatorConfig[key];
                            if (
                                Array.isArray(value) ||
                                (operator !== Operator.In && operator !== Operator.Nin)
                            ) {
                                if (where[key]) {
                                    Object.assign(where[key], { [sequelizeOp]: value });
                                } else {
                                    where[key] = { [sequelizeOp]: value };
                                }
                            } else {
                                throw new Error(`Invalid value for ${operator}: ${key} must be an array.`);
                            }
                        } else {
                            throw new Error(`Invalid attribute: ${key} is not a valid attribute of the model.`);
                        }
                    }
                }
            }
        };

        handleOperator(Operator.Eq, Op.eq);
        handleOperator(Operator.Ne, Op.ne);
        handleOperator(Operator.Gt, Op.gt);
        handleOperator(Operator.Gte, Op.gte);
        handleOperator(Operator.Lt, Op.lt);
        handleOperator(Operator.Lte, Op.lte);
        handleOperator(Operator.In, Op.in);
        handleOperator(Operator.Nin, Op.notIn);
        handleOperator(Operator.Like, Op.like);
        handleOperator(Operator.NotLike, Op.notLike);

        if (config.$or) {
            if (Array.isArray(config.$or)) {
                const orConditions = config.$or.map((orCondition) => this.buildWhereOptions(orCondition));
                Object.assign(where, { [Op.or]: orConditions });
            } else {
                const orConditions = this.buildWhereOptions(config.$or);
                Object.assign(where, { [Op.or]: orConditions });
            }
        }

        if (config.$and) {
            const andConditions = this.buildWhereOptions(config.$and);
            Object.assign(where, { [Op.and]: andConditions });
        }

        return where;
    }
}
