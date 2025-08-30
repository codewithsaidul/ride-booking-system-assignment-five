/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query } from "mongoose";
import { excludedFields } from "../constants/global.constants";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, any>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, any>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter = { ...this.query };
    for (const field of excludedFields) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    // 👇 Fare Range-এর জন্য নতুন লজিক
    const fareFilter: { $gte?: number; $lte?: number } = {};
    if (filter.minFare) {
      fareFilter.$gte = Number(filter.minFare);
      delete filter.minFare; // মূল ফিল্টার থেকে মুছে দিন
    }

    if (filter.maxFare) {
      fareFilter.$lte = Number(filter.maxFare);
      delete filter.maxFare; // মূল ফিল্টার থেকে মুছে দিন
    }

    // যদি fareFilter-এ কোনো ডেটা থাকে, তাহলে মূল ফিল্টারে যোগ করুন
    if (Object.keys(fareFilter).length > 0) {
      filter.fare = fareFilter;
    }
    // 👆 Fare Range-এর লজিক শেষ

    this.modelQuery = this.modelQuery.find(filter);

    return this;
  }

  search(searchableFields: string[]): this {
    const searchTerm = this.query.searchTerm || "";
    const searchQuery = {
      $or: searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };

    this.modelQuery = this.modelQuery.find(searchQuery);

    return this;
  }

  sort(): this {
    const sortBy = this.query.sortBy || "createdAt";
    const sortOrder = this.query.sortOrder || "desc";
    const sortObject: Record<string, "asc" | "desc"> = {};
    sortObject[sortBy] = sortOrder as "asc" | "desc";

    this.modelQuery = this.modelQuery.sort(sortObject);

    return this;
  }

  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";
    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  populate(path: string, select?: string): this {
    this.modelQuery = this.modelQuery.populate(path, select);
    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const filterDocuments = this.modelQuery.getFilter()

    const totalDocuments = await this.modelQuery.model.countDocuments(filterDocuments);

    return {
      page,
      limit,
      total: totalDocuments,
      totalPages: Math.ceil(totalDocuments / limit),
    };
  }
}
