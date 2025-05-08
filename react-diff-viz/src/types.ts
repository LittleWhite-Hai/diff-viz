import { ReactNode } from "react";

export type DataTypeBase = {
  [key: string]: any;
};

export type ExtType<T> = {
  data1: T;
  data2: T;
  type: "data1" | "data2" | "";
  path: string | undefined;
  index?: number;
};
export type IsEqualFuncType = (
  data1: any,
  data2: any,
  ext: ExtType<any>
) => boolean;

export type LabelType<T> =
  | undefined
  | string
  | ((data: any, record: T, ext: ExtType<T>) => ReactNode);

export type VisibleType<T> =
  | undefined
  | boolean
  | ((data: any, record: T, ext: ExtType<T>) => boolean | undefined);

export type ContentType<T> =
  | undefined
  | ReactNode
  | ((data: any, record: T, ext: ExtType<T>) => ReactNode);

export type VizItem<T = DataTypeBase> = {
  label: LabelType<T>;
  path?: string;
  key?: string;
  visible?: VisibleType<T>;
  isEqual?: IsEqualFuncType;
  content?: ContentType<T>;
  arrayKey?: string;
  arrayAlignType?: "lcs" | "data2" | "none";
};
/**
 * array of VizItem:
 * label: Title of the data, if only label is provided, it renders a separator title
 * path: Path of the data
 * visible: If false, the item will not be displayed
 * isEqual: User can customize the data diff algorithm
 * content: Rendering method
 * arrayKey: Key for arrays, used to mark this data as array type
 * arrayAlignType: Array alignment method, default is longest common subsequence (lcs) alignment
 */
export type VizItems<T = DataTypeBase> = Array<VizItem<T>>;
