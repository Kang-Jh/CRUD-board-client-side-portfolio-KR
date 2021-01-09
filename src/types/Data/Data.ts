export type ID = string;

export interface BaseData {
  _id: ID;
  createdAt: Date;
  updatedAt?: Date;
}
