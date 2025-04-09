import _ from "lodash";
import { IsEqualFuncType } from "./types";

export function getValueByPath(
  obj: Record<string, any>,
  path: string | undefined
): any {
  if (!path) {
    return obj;
  }
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
}

// todo: 不借助lodash: 如果子项都一样，则一样，如果子项有任何差异，则不一样
function isSameItem<T>(props: {
  data1: T;
  data2: T;
  listKey: string;
}): boolean {
  const { data1: obj1, data2: obj2, listKey } = props;

  if (listKey) {
    return obj1[listKey as keyof T] === obj2[listKey as keyof T];
  }

  return _.isEqual(obj1, obj2);
}

// 获取两个数组的最长子序列
function getLCS<T>(arr1: T[], arr2: T[], listKey: string): T[] {
  const dp: T[][][] = Array(arr1.length + 1)
    .fill(0)
    .map(() => Array(arr2.length + 1).fill([[]]));

  for (let i = 0; i < arr1.length + 1; i++) {
    for (let j = 0; j < arr2.length + 1; j++) {
      if (i === 0 || j === 0) {
        dp[i][j] = [];
      } else if (
        isSameItem({
          data1: arr1[i - 1],
          data2: arr2[j - 1],
          listKey,
        })
      ) {
        dp[i][j] = [...dp[i - 1][j - 1], arr1[i - 1]];
      } else {
        dp[i][j] =
          dp[i - 1][j].length > dp[i][j - 1].length
            ? dp[i - 1][j]
            : dp[i][j - 1];
      }
    }
  }

  return dp[arr1.length][arr2.length];
}
// 对齐两个数组: 匹配最长子序列，并将两数组内的最长子序列元素 index 对齐
function alignByLCS<T>(props: {
  arr1: T[];
  arr2: T[];
  lcs: T[];
  listKey: string;
  // isEqualMap: Record<string, IsEqualFuncType>;
  // listKeyMap: Record<string, string>;
}): [(T | undefined)[], (T | undefined)[]] {
  const { arr1, arr2, lcs, listKey } = props;

  const alignedArr1: (T | undefined)[] = [];
  const alignedArr2: (T | undefined)[] = [];
  let arrIdx1 = 0;
  let arrOffset1 = 0;
  let arrIdx2 = 0;
  let arrOffset2 = 0;
  let lcsIdx = 0;
  while (lcsIdx < lcs.length) {
    const resI = lcs[lcsIdx];
    while (
      arrIdx1 - arrOffset1 < arr1.length &&
      !isSameItem({
        data1: resI,
        data2: arr1[arrIdx1 - arrOffset1],
        listKey,
      })
    ) {
      alignedArr1.push(arr1[arrIdx1 - arrOffset1]);
      arrIdx1++;
    }
    while (
      arrIdx2 - arrOffset2 < arr2.length &&
      !isSameItem({
        data1: resI,
        data2: arr2[arrIdx2 - arrOffset2],
        listKey,
      })
    ) {
      alignedArr2.push(arr2[arrIdx2 - arrOffset2]);
      arrIdx2++;
    }
    while (arrIdx1 < arrIdx2) {
      alignedArr1.push(undefined);
      arrOffset1++;
      arrIdx1++;
    }
    while (arrIdx2 < arrIdx1) {
      alignedArr2.push(undefined);
      arrOffset2++;
      arrIdx2++;
    }
    alignedArr1.push(arr1[arrIdx1 - arrOffset1]);
    alignedArr2.push(arr2[arrIdx2 - arrOffset2]);
    arrIdx1++;
    arrIdx2++;
    lcsIdx++;
  }
  while (arrIdx1 - arrOffset1 < arr1.length) {
    alignedArr1.push(arr1[arrIdx1 - arrOffset1]);
    arrIdx1++;
  }
  while (arrIdx2 - arrOffset2 < arr2.length) {
    alignedArr2.push(arr2[arrIdx2 - arrOffset2]);
    arrIdx2++;
  }
  while (arrIdx1 < arrIdx2) {
    alignedArr1.push(undefined);
    arrOffset1++;
    arrIdx1++;
  }
  while (arrIdx2 < arrIdx1) {
    alignedArr2.push(undefined);
    arrOffset2++;
    arrIdx2++;
  }
  return [alignedArr1, alignedArr2];
}

function alignByArr2(props: {
  arr1: Record<string, any>[];
  arr2: Record<string, any>[];
  idKey: string;
}) {
  const { arr1, arr2, idKey } = props;

  // 创建 arr1 的映射，用于快速查找
  const map1 = new Map<string, any[]>();
  arr1.forEach((item) => {
    if (!map1.has(item[idKey])) {
      map1.set(item[idKey], []);
    }
    map1.get(item[idKey])?.push(item);
  });
  // 创建 arr2 的映射，用于快速查找
  const map2 = new Map<string, any[]>();
  arr2.forEach((item) => {
    if (!map2.has(item[idKey])) {
      map2.set(item[idKey], []);
    }
    map2.get(item[idKey])?.push(item);
  });

  // 创建结果数组
  const result1: any[] = [];
  const result2: any[] = [];
  const processedKeys = new Set<string>();
  const arr2arr1 = [arr2, arr1].flat();

  // 按照 arr2 的顺序重排 arr1，补足对应key缺少的元素
  for (const item2 of arr2arr1) {
    const k = item2[idKey];
    if (processedKeys.has(k)) {
      continue;
    }
    processedKeys.add(k);
    const subArr1 = map1.get(k) ?? [];
    const subArr2 = map2.get(k) ?? [];
    while (subArr1.length < subArr2.length) {
      subArr1.push(undefined);
    }
    while (subArr1.length > subArr2.length) {
      subArr2.push(undefined);
    }
    result1.push(...subArr1);
    result2.push(...subArr2);
  }

  return [result1, result2];
}

/**
 *
 * @param data1
 * @param data2
 * @param pathPrefix
 * @param arrayAlignLCSMap
 * @param arrayAlignData2Map
 * @param arrayNoAlignMap
 *
 * 递归地对齐对象中的数组，利用align和rearrangeByArr2函数
 * 如果data1和data2的path相同，并且它们都是数组，
 * 则利用alignByLCSMap、alignByData2Map、noAlignMap对应的三种策略，重新排列两个数组
 *
 */

/**
 * 获取对象路径值的映射,仅获取Array的值，如果有数组嵌套，则仅获取最外层的数组
 * @param data
 * @returns
 */
export function getObjectPathArrayMap(data: any) {
  const mapResult: Record<string, Array<any>> = {};

  function traverse(obj: any, path: string = "") {
    if (typeof obj !== "object" || obj === null || obj === undefined) {
      return;
    }
    if (path && Array.isArray(obj)) {
      mapResult[path] = obj;
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (!key) {
        continue;
      } else if (path) {
        traverse(value, `${path}.${key}`);
      } else {
        traverse(value, key);
      }
    }
  }

  traverse(data);
  // 将结果转换成数组，并且按照字母顺序排序，格式是{path:string,value:BaseType}[]
  const arrayResult = Array.from(Object.entries(mapResult))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([path, value]) => ({ path, value }));

  return { mapResult, arrayResult };
}

function getRegPath(path: string) {
  return path+".[]"
}

function getPathKey(fullPath: string, map: Record<string, string | boolean>) {
  const regPath = getRegPath(fullPath);
  return map[fullPath] || map[regPath];
}

// 递归对齐对象中的数组，会修改data1和data2
function innerAlignArray(props: {
  data1: any;
  data2: any;
  pathPrefix?: string;
  arrayAlignLCSMap: Record<string, string>;
  arrayAlignData2Map: Record<string, string>;
  arrayNoAlignMap: Record<string, true>;
}) {
  const {
    data1,
    data2,
    pathPrefix = "",
    arrayAlignLCSMap,
    arrayAlignData2Map,
    arrayNoAlignMap,
  } = props;
  const { mapResult: mapResult1 } = getObjectPathArrayMap(data1);
  const { mapResult: mapResult2 } = getObjectPathArrayMap(data2);

  Object.keys(mapResult1).forEach((path) => {
    if (mapResult2[path]) {
      const fullPath = pathPrefix + path;
      let alignedArr1 = data1[path];
      let alignedArr2 = data2[path];
      if (getPathKey(fullPath, arrayNoAlignMap)) {
        // do nothing
      } else if (getPathKey(fullPath, arrayAlignData2Map)) {
        const listKey = getPathKey(fullPath, arrayAlignData2Map);
        [alignedArr1, alignedArr2] = alignByArr2({
          arr1: mapResult1[path],
          arr2: mapResult2[path],
          // todo:支持boolean
          idKey: String(listKey),
        });
      } else {
        // 默认使用LCS方法
        const listKey = getPathKey(fullPath, arrayAlignLCSMap) as string;
        const lcs = getLCS(mapResult1[path], mapResult2[path], listKey);
           
        [alignedArr1, alignedArr2] = alignByLCS({
          arr1: mapResult1[path],
          arr2: mapResult2[path],
          lcs,
          listKey,
        });
      }

      for (let i = 0; i < alignedArr1.length && i < alignedArr2.length; i++) {
        innerAlignArray({
          ...props,
          data1: alignedArr1[i],
          data2: alignedArr2[i],
          pathPrefix: fullPath + "." + i + ".",
        });
      }

      // 只修改对象内的数组，不创建额外的路径
      const pathParts = path.split('.');
      let current1 = data1;
      let i=0;
      while (i < pathParts.length - 1) {
        if (current1[pathParts[i]]) {
          current1 = current1[pathParts[i]];
          i++;
        } else {
          current1[pathParts[i]] = {};
          break;
        }
      }
      let current2 = data2;
      let j=0;
      while (j < pathParts.length - 1) {
        if (current2[pathParts[j]]) {
          current2 = current2[pathParts[j]];
          j++;
        } else {
          current2[pathParts[j]] = {};
          break;
        }
      }
      
      
      current1[pathParts[i]] = alignedArr1;
      current2[pathParts[j]] = alignedArr2;
    }
  });

  return [data1, data2];
}

type DiffItemType = "CHANGED" | "CREATED" | "REMOVED" | "UNCHANGED";
export type DiffResType = Record<string, DiffItemType>;

type BaseType = string | number | Date | null | undefined | boolean;
/**
 *
 * @param data
 * 获取给定对象路径值的映射,分别获取叶子节点和非叶子节点的值；非叶子节点在mapObjectResult中
 * 例子：
 * 输入：data:{age:2,name:"张三",address:{city:"上海",area:"浦东"}}
 * 输出：{
 *  "age":2,
 *  "name":"张三",
 *  "address.city":"上海",
 *  "address.area":"浦东"
 * }
 */
export function getObjectPathValueMap(data: any) {
  const mapResult = new Map<string, BaseType>();
  const mapObjectResult = new Map<string, any>();

  function traverse(obj: any, path: string = "") {
    if (
      typeof obj !== "object" ||
      obj === null ||
      obj === undefined ||
      obj instanceof Date
    ) {
      if (path === "") {
        return;
      } else if (obj instanceof Date) {
        mapResult.set(path, obj.toISOString());
      } else {
        mapResult.set(path, obj);
      }
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const newPath = path ? `${path}.${key}` : key;
      if (newPath === "" || key === "") {
        continue;
      } else if (
        typeof value === "object" &&
        value !== null &&
        value !== undefined &&
        !(obj instanceof Date)
      ) {
        mapObjectResult.set(newPath, value);
        traverse(value, newPath);
      } else {
        if (obj instanceof Date) {
          mapResult.set(newPath, obj.toISOString());
        } else {
          mapResult.set(newPath, value as BaseType);
        }
      }
    }
  }

  traverse(data);
  // 将结果转换成数组，并且按照字母顺序排序，格式是{path:string,value:BaseType}[]
  const arrayResult = Array.from(mapResult.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([path, value]) => ({ path, value }));

  const arrayObjectResult = Array.from(mapObjectResult.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([path, value]) => ({ path, value }));

  return { mapResult, arrayResult, mapObjectResult, arrayObjectResult };
}

// 根据叶子节点的diff结果，设置父节点的diff结果
function setNodeDiffRes(
  diffRes: DiffResType,
  leafPath: string,
  leafDiffRes: DiffItemType
) {
  diffRes[leafPath] = leafDiffRes;
  const pathArr = leafPath.split(".");
  pathArr.pop();
  if (leafDiffRes === "UNCHANGED") {
    while (pathArr.length) {
      const parentPath = pathArr.join(".");
      if (["CHANGED", "REMOVED", "CREATED"].includes(diffRes[parentPath])) {
        // do nothing
      } else {
        diffRes[parentPath] = "UNCHANGED";
      }
      pathArr.pop();
    }
  } else {
    while (pathArr.length) {
      const parentPath = pathArr.join(".");
      // 如果父节点的diff结果和当前节点的diff结果不一样，则设置为"CHANGED"
      if (diffRes[parentPath] && diffRes[parentPath] !== leafDiffRes) {
        diffRes[parentPath] = "CHANGED";
      } else {
        diffRes[parentPath] = leafDiffRes;
      }
      pathArr.pop();
    }
  }
}

export function calcDiffWithArrayAlign<T = any>(props: {
  data1: T;
  data2: T;
  isEqualMap?: Record<string, IsEqualFuncType>;
  arrayAlignLCSMap?: Record<string, string>;
  arrayAlignData2Map?: Record<string, string>;
  arrayNoAlignMap?: Record<string, true>;
  strictMode?: boolean;
}) {
  const [alignedData1, alignedData2] = alignDataArray({
    ...props,
    arrayAlignLCSMap: props.arrayAlignLCSMap ?? {},
    arrayAlignData2Map: props.arrayAlignData2Map ?? {},
    arrayNoAlignMap: props.arrayNoAlignMap ?? {},
  });
  const diffRes = calcDiff(
    alignedData1,
    alignedData2,
    props.isEqualMap ?? {},
    props.strictMode ?? true
  );
  return { diffRes, alignedData1, alignedData2 };
}

/**
 * Align data
 * @param props An object containing the following properties:
 *   - data1: The first data object to be aligned
 *   - data2: The second data object to be aligned
 *   - isEqualMap: A map of custom equality functions for specific paths
 *   - arrayAlignLCSMap: A map of paths to use LCS alignment for arrays
 *   - arrayAlignData2Map: A map of paths to use current data alignment for arrays
 *   - arrayNoAlignMap: A map of paths where arrays should not be aligned
 * @returns An object containing the aligned versions of arr1 and arr2
 */
export function alignDataArray<T = any>(props: {
  data1: T;
  data2: T;
  arrayAlignLCSMap?: Record<string, string>;
  arrayAlignData2Map?: Record<string, string>;
  arrayNoAlignMap?: Record<string, true>;
}) {
  const {
    data1,
    data2,
    arrayAlignLCSMap = {},
    arrayAlignData2Map = {},
    arrayNoAlignMap = {},
  } = props;
  //alignArray 无法处理恰好是数组情形，所以需要单独处理
  if (Array.isArray(data1) && Array.isArray(data2)) {
    const [newData1, newData2] = innerAlignArray({
      data1: { xx: data1 },
      data2: { xx: data2 },
      arrayAlignLCSMap: Object.fromEntries(
        Object.entries(arrayAlignLCSMap).map(([k, v]) => [`xx.${k}`, v])
      ),
      arrayAlignData2Map: Object.fromEntries(
        Object.entries(arrayAlignData2Map).map(([k, v]) => [`xx.${k}`, v])
      ),
      arrayNoAlignMap: Object.fromEntries(
        Object.entries(arrayNoAlignMap).map(([k, v]) => [`xx.${k}`, v])
      ),
    });
    return [newData1.xx, newData2.xx];
  }

  return innerAlignArray({
    data1: _.cloneDeep(data1),
    data2: _.cloneDeep(data2),
    arrayAlignLCSMap,
    arrayAlignData2Map,
    arrayNoAlignMap,
  });
}

function isNullOrUndefined(value: any) {
  return value === null || value === undefined;
}
/**
 * Compare two data objects and generate a difference result
 * @param data1 The first data object to compare
 * @param data2 The second data object to compare
 * @param isEqualMap A map of custom equality check functions
 * @param strictMode Whether to use strict mode for comparison
 * @returns An object containing the difference status for each data path
 */
export function calcDiff(
  data1: any,
  data2: any,
  isEqualMap?: Record<string, IsEqualFuncType>,
  strictMode?: boolean
) {
  const {
    arrayResult: arrayPathValue1,
    arrayObjectResult: arrayObjectResult1,
    mapObjectResult: mapObjectResult1,
  } = getObjectPathValueMap(data1);
  const {
    arrayResult: arrayPathValue2,
    arrayObjectResult: arrayObjectResult2,
    mapObjectResult: mapObjectResult2,
  } = getObjectPathValueMap(data2);

  // 对于arrayPathValue1和arrayPathValue2，如果path相同，则比较value，如果value不同，则diffRes[path] = "CHANGED"
  // 子节点遍历完成之后，根据子节点的结果，给父节点打diff标记
  // 比如a.b.c.d的结果是"CHANGED"或"REMOVED"或"CREATED"，则diffRes["a.b.c"] = "CHANGED"
  // 比如a.b.c.d和a.b.c.e的结果都是"UNCHANGED"，则diffRes["a.b.c"] = "UNCHANGED"
  const diffRes: DiffResType = {};
  let i = 0,
    j = 0;
  while (i < arrayPathValue1.length && j < arrayPathValue2.length) {
    if (
      i < arrayPathValue1.length &&
      arrayPathValue1[i].path.localeCompare(arrayPathValue2[j].path) < 0
    ) {
      // 数组1追数组2，则数组1的内容被删除了，标记为"REMOVED"
      while (
        i < arrayPathValue1.length &&
        arrayPathValue1[i].path.localeCompare(arrayPathValue2[j].path) < 0
      ) {
        setNodeDiffRes(diffRes, arrayPathValue1[i].path, "REMOVED");
        i++;
      }
    } else if (
      j < arrayPathValue2.length &&
      arrayPathValue1[i].path.localeCompare(arrayPathValue2[j].path) > 0
    ) {
      // 数组2追数组1，则数组2的内容是新增的，标记为"CREATED"
      while (
        j < arrayPathValue2.length &&
        arrayPathValue1[i].path.localeCompare(arrayPathValue2[j].path) > 0
      ) {
        setNodeDiffRes(diffRes, arrayPathValue2[j].path, "CREATED");
        j++;
      }
    } else {
      // 数组1和数组2的path相同，则比较它们的值，相同则为"UNCHANGED"，不同则为"CHANGED"
      if (
        isEqualFundamentalData(
          arrayPathValue1[i].value,
          arrayPathValue2[j].value,
          strictMode ?? true
        )
      ) {
        setNodeDiffRes(diffRes, arrayPathValue1[i].path, "UNCHANGED");
      } else {
        setNodeDiffRes(diffRes, arrayPathValue1[i].path, "CHANGED");
      }
      i++;
      j++;
    }
  }
  while (i < arrayPathValue1.length) {
    setNodeDiffRes(diffRes, arrayPathValue1[i].path, "REMOVED");
    i++;
  }
  while (j < arrayPathValue2.length) {
    setNodeDiffRes(diffRes, arrayPathValue2[j].path, "CREATED");
    j++;
  }

  // 标记父节点的REMOVED和CREATED情况
  const combinedArray = Array.from(
    new Set([
      ...arrayObjectResult1.map((x) => x.path),
      ...arrayObjectResult2.map((x) => x.path),
    ])
  );
  for (let i = 0; i < combinedArray.length; i++) {
    const path = combinedArray[i];
    const d1 = mapObjectResult1.get(path);
    const d2 = mapObjectResult2.get(path);

    if (isNullOrUndefined(d1) && !isNullOrUndefined(d2)) {
      diffRes[path] = "CREATED";
    } else if (!isNullOrUndefined(d1) && isNullOrUndefined(d2)) {
      diffRes[path] = "REMOVED";
    }
  }

  // 用户自定义的isEqual会覆盖原本的diff计算
  Object.entries(isEqualMap ?? {}).forEach(([path, isEqualFunc]) => {
    const a = getValueByPath(data1, path);
    const b = getValueByPath(data2, path);
    const isEqual = isEqualFunc(a, b, {
      data1,
      data2,
      type: "",
      path,
    });
    diffRes[path] = isEqual ? "UNCHANGED" : "CHANGED";
  });

  return diffRes;
}
function isEqualFundamentalData(a: BaseType, b: BaseType, strictMode: boolean) {
  if (strictMode) {
    return a === b;
  }
  if (
    ["", null, undefined, NaN].includes(a as any) &&
    ["", null, undefined, NaN].includes(b as any)
  ) {
    return true;
  }

  return a === b;
}
