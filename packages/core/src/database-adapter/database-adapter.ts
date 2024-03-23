import { BaseQueryConfig } from "../query";

export class DatabaseAdapter<T extends BaseQueryConfig<T>> {
    protected attributes: string[] = [];
    protected operatorValidators: Record<string, (value: any, path: string) => void> = {
        $eq: this.validateValueObject,
        $ne: this.validateValueObject,
        $gt: this.validateValueObject,
        $gte: this.validateValueObject,
        $lt: this.validateValueObject,
        $lte: this.validateValueObject,
        $in: this.validateValueArray,
        $nin: this.validateValueArray,
        $or: this.validateLogicalOperator,
        $and: this.validateLogicalOperator,
        $skip: this.validateValueNumber,
        $limit: this.validateValueNumber,
        $sort: this.validateSort,
    };
    private validOperators: Set<string> = new Set(Object.keys(this.operatorValidators));

    public validateQuery(config: T): void {
        this.validateBaseQueryConfig(config);
    }

    private validateBaseQueryConfig(config: T, path: string = ""): void {
        if (typeof config !== "object" || config === null || Array.isArray(config)) {
            throw new Error(`Invalid query config at ${path}: expected an object.`);
        }

        for (const [key, operatorConfig] of Object.entries(config)) {
            const currentPath = path ? `${path}.${key}` : key;
            if (this.validOperators.has(key)) {
                const validator = this.operatorValidators[key];
                if (typeof operatorConfig == 'object') {
                    for (const attribute in operatorConfig) {
                        if (this.attributes.includes(attribute)) {
                            const operatorValue = operatorConfig[attribute];
                            validator.call(this, operatorValue, currentPath);
                        } else {
                            throw new Error(`Invalid attribute: ${key} is not a valid attribute of the model.`);
                        }
                    }
                } else {
                    validator.call(this, operatorConfig, currentPath);
                }
            } else {
                this.validateModelAttributes(key, operatorConfig, currentPath);
            }
        }
    }

    private validateValueObject(value: any, path: string): void {
        if (typeof value !== "object" || value === null) {
            throw new Error(`Invalid value for operator ${path}: expected an object.`);
        }
    }

    private validateValueArray(value: any, path: string): void {
        if (!Array.isArray(value)) {
            throw new Error(`Invalid value for operator ${path}: expected an array.`);
        }
    }

    private validateLogicalOperator(value: any, path: string): void {
        if (!Array.isArray(value) && typeof value !== "object") {
            throw new Error(`Invalid value for operator ${path}: expected an array or an object.`);
        }

        if (Array.isArray(value)) {
            value.forEach((subConfig, index) => this.validateBaseQueryConfig(subConfig, `${path}[${index}]`));
        } else {
            this.validateBaseQueryConfig(value, path);
        }
    }

    private validateValueNumber(value: any, path: string): void {
        if (typeof value !== "number") {
            throw new Error(`Invalid value for operator ${path}: expected a number.`);
        }
    }

    private validateSort(value: any, path: string): void {
        if (typeof value !== "string" && !Array.isArray(value) && typeof value !== "object") {
            throw new Error(`Invalid value for operator ${path}: expected a string, an array, or an object.`);
        }
    }

    private validateModelAttributes(key: string, value: any, path: string): void {
        if (!this.attributes.includes(key)) {
            throw new Error(`Invalid attribute: ${key} is not a valid attribute of the model., value: ${value}, path: ${path}`);
        }
    }
}
