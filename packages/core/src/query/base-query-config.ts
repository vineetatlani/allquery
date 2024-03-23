export interface BaseQueryConfig<T extends BaseQueryConfig<T>> {
  $eq?: { [key: string]: any };
  $ne?: { [key: string]: any };
  $gt?: { [key: string]: any };
  $gte?: { [key: string]: any };
  $lt?: { [key: string]: any };
  $lte?: { [key: string]: any };
  $in?: { [key: string]: any[] };
  $nin?: { [key: string]: any[] };
  $or?: T | T[]
  $and?: T
  $skip?: number;
  $sort?: string | string[] | { [key: string]: number };
  $limit?: number;
  [key: string]: any;
}