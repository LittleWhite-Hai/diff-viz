import _ from 'lodash';
import { IsEqualFuncType } from "./types";

export function getValueByPath(
  obj: Record<string, any>,
  path: string | undefined,
): any {
  if (!path) {
    return obj;
  }
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}

// 把.替换为/dot/  比如{"a.b.c":1}替换为{"a/dot/b/dot/c":1}
function replaceDotInKeys<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => replaceDotInKeys(item)) as T;
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      const newKey = key.replace(/\./g, '/dot/');
      (newObj as Record<string, unknown>)[newKey] = replaceDotInKeys(value);
    }
    return newObj;
  } else {
    return obj;
  }
}

// 把/dot/恢复替换为.  比如{"a/dot/b/dot/c":1}替换为{"a.b.c":1}
function restoreOriginalKeys<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => restoreOriginalKeys(item)) as T;
  } else if (typeof obj === 'object' && obj !== null) {
    const originalObj = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      const originalKey = key.replace(/\/dot\//g, '.');
      (originalObj as Record<string, unknown>)[originalKey] =
        restoreOriginalKeys(value);
    }
    return originalObj;
  } else {
    return obj;
  }
}

function isSameItem<T>(props: {
  data1: T;
  data2: T;
  listKey?: string;
}): boolean {
  const { data1: obj1, data2: obj2, listKey } = props;

  if (listKey) {
    return obj1[listKey as keyof T] === obj2[listKey as keyof T];
  }

  return _.isEqual(obj1, obj2);
}

// 获取两个数组的最长子序列
export function getLCS<T>(arr1: T[], arr2: T[], listKey?: string): T[] {
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
export function alignByLCS<T>(props: {
  arr1: T[];
  arr2: T[];
  lcs: T[];
  listKey?: string;
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
 * 获取对象路径值的映射,仅获取Array的值，如果有数组嵌套，则仅获取最外层的数组
 * @param data
 * @returns
 */
export function getObjectPathArrayMap(data: any) {
  const mapResult: Record<string, Array<any>> = {};

  function traverse(obj: any, path: string = '') {
    if (typeof obj !== 'object' || obj === null || obj === undefined) {
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

/**
 * 匹配函数，用于匹配带有通配符的模板字符串
 * @param templates 模板字符串数组，可能包含通配符 *
 * @param str 待匹配的字符串
 * @returns 匹配到的模板字符串，如果没有匹配则返回 undefined
 */
function matchTemplateKey(
  templates: string[],
  str: string,
): string | undefined {
  if (templates.length === 0) {
    return undefined;
  }
  // 将待匹配字符串按点分割
  const strParts = str.split('.');
  const matches: string[] = [];

  // 遍历所有模板
  for (const template of templates) {
    // 将模板按点分割
    const templateParts = template.split('.');

    // 如果模板和待匹配字符串完全相同，则返回模板
    if (template === str) {
      return template;
    }

    // 如果模板部分数量与待匹配字符串部分数量不同，且模板不包含通配符，则跳过
    if (templateParts.length !== strParts.length && !template.includes('*')) {
      continue;
    }

    // 检查是否匹配
    let isMatch = true;

    // 遍历模板的每一部分
    for (let i = 0; i < Math.max(templateParts.length, strParts.length); i++) {
      // 如果模板部分已经结束，但待匹配字符串还有部分，则不匹配
      if (i >= templateParts.length) {
        isMatch = false;
        break;
      }

      // 如果待匹配字符串部分已经结束，但模板还有部分，则不匹配
      if (i >= strParts.length) {
        isMatch = false;
        break;
      }

      // 如果模板部分是通配符，则匹配任何部分
      if (templateParts[i] === '*') {
        continue;
      }

      // 如果模板部分与待匹配字符串部分不匹配，则不匹配
      if (templateParts[i] !== strParts[i]) {
        isMatch = false;
        break;
      }
    }

    // 如果匹配，则返回模板
    if (isMatch) {
      matches.push(template);
    }
  }
  if (matches.length > 0) {
    // 返回*最少的一个
    let minStarCount: number = Infinity;
    let minStarCountTemplate: string = '';
    for (const template of matches) {
      const starCount = template
        .split('.')
        .filter((part) => part === '*').length;
      if (starCount < minStarCount) {
        minStarCount = starCount;
        minStarCountTemplate = template;
      }
    }
    return minStarCountTemplate;
  }
  return undefined;
}

function isPlainObject(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

function getCustomIsEqualRes(props: {
  isEqualKeyArr: string[];
  path: string;
  isEqualMap: Record<string, IsEqualFuncType>;
  value1: any;
  value2: any;
  ext: { data1: any; data2: any; type: ''; path: string };
}) {
  const { isEqualKeyArr, path, isEqualMap, value1, value2, ext } = props;

  const isEqualKey = matchTemplateKey(isEqualKeyArr, path);
  if (isEqualKey) {
    const isEqualFunc = isEqualMap[isEqualKey];

    const res = isEqualFunc(value1, value2, ext);
    if (res === true) {
      return 'UNCHANGED';
    } else if (res === false) {
      return 'CHANGED';
    }
  }
  return undefined;
}

function isNullOrUndefined(value: any) {
  return value === null || value === undefined;
}

function isEqualFundamentalData(a: BaseType, b: BaseType, strictMode: boolean) {
  if (strictMode) {
    return a === b;
  }
  if (
    ['', null, undefined, NaN].includes(a as any) &&
    ['', null, undefined, NaN].includes(b as any)
  ) {
    return true;
  }

  return a === b;
}

type DiffItemType = 'CHANGED' | 'CREATED' | 'REMOVED' | 'UNCHANGED';
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

  function traverse(obj: any, path: string = '') {
    if (
      typeof obj !== 'object' ||
      obj === null ||
      obj === undefined ||
      obj instanceof Date
    ) {
      if (path === '') {
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
      if (newPath === '' || key === '') {
        continue;
      } else if (
        typeof value === 'object' &&
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
  leafDiffRes: DiffItemType,
) {
  diffRes[leafPath] = leafDiffRes;
  const pathArr = leafPath.split('.');
  pathArr.pop();
  if (leafDiffRes === 'UNCHANGED') {
    while (pathArr.length) {
      const parentPath = pathArr.join('.');
      if (['CHANGED', 'REMOVED', 'CREATED'].includes(diffRes[parentPath])) {
        // do nothing
      } else {
        diffRes[parentPath] = 'UNCHANGED';
      }
      pathArr.pop();
    }
  } else {
    while (pathArr.length) {
      const parentPath = pathArr.join('.');
      // 如果父节点的diff结果和当前节点的diff结果不一样，则设置为"CHANGED"
      if (diffRes[parentPath] && diffRes[parentPath] !== leafDiffRes) {
        diffRes[parentPath] = 'CHANGED';
      } else {
        diffRes[parentPath] = leafDiffRes;
      }
      pathArr.pop();
    }
  }
}

/**
 * Compare two data objects and generate a difference result
 * @param data1 The first data object to compare
 * @param data2 The second data object to compare
 * @param isEqualMap A map of custom equality check functions
 * @param strictMode Whether to use strict mode for comparison
 * @returns An object containing the difference status for each data path
 */
export function calcDiff<T>(
  data1: T,
  data2: T,
  isEqualMap: Record<string, IsEqualFuncType> = {},
  strictMode: boolean = true,
) {
  const isEqualKeyArr: string[] = Object.keys(isEqualMap);
  const noDotData1 = replaceDotInKeys(data1);
  const noDotData2 = replaceDotInKeys(data2);

  const {
    arrayResult: arrayPathValue1,
    arrayObjectResult: arrayObjectResult1,
    mapObjectResult: mapObjectResult1,
  } = getObjectPathValueMap(noDotData1);
  const {
    arrayResult: arrayPathValue2,
    arrayObjectResult: arrayObjectResult2,
    mapObjectResult: mapObjectResult2,
  } = getObjectPathValueMap(noDotData2);

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
        const path = arrayPathValue1[i].path;
        const isEqualRes = getCustomIsEqualRes({
          isEqualKeyArr,
          path,
          isEqualMap,
          value1: arrayPathValue1[i].value,
          value2: undefined,
          ext: {
            data1: noDotData1,
            data2: noDotData2,
            type: '',
            path,
          },
        });
        if (isEqualRes) {
          setNodeDiffRes(diffRes, path, isEqualRes);
        } else if (
          !strictMode &&
          ['', null, undefined, NaN].includes(arrayPathValue1[i].value as any)
        ) {
          setNodeDiffRes(diffRes, path, 'UNCHANGED');
        } else {
          setNodeDiffRes(diffRes, path, 'REMOVED');
        }

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
        const path = arrayPathValue2[j].path;
        const isEqualRes = getCustomIsEqualRes({
          isEqualKeyArr,
          path,
          isEqualMap,
          value1: undefined,
          value2: arrayPathValue2[j].value,
          ext: {
            data1: noDotData1,
            data2: noDotData2,
            type: '',
            path,
          },
        });
        if (isEqualRes) {
          setNodeDiffRes(diffRes, path, isEqualRes);
        } else if (
          !strictMode &&
          ['', null, undefined, NaN].includes(arrayPathValue2[j].value as any)
        ) {
          setNodeDiffRes(diffRes, path, 'UNCHANGED');
        } else {
          setNodeDiffRes(diffRes, path, 'CREATED');
        }
        j++;
      }
    } else {
      const path = arrayPathValue1[i].path;
      const isEqualRes = getCustomIsEqualRes({
        isEqualKeyArr,
        path,
        isEqualMap,
        value1: arrayPathValue1[i].value,
        value2: arrayPathValue2[j].value,
        ext: {
          data1: noDotData1,
          data2: noDotData2,
          type: '',
          path,
        },
      });

      // 数组1和数组2的path相同，则比较它们的值，相同则为"UNCHANGED"，不同则为"CHANGED"
      if (isEqualRes) {
        setNodeDiffRes(diffRes, path, isEqualRes);
      } else if (
        isEqualFundamentalData(
          arrayPathValue1[i].value,
          arrayPathValue2[j].value,
          strictMode ?? true,
        )
      ) {
        setNodeDiffRes(diffRes, path, 'UNCHANGED');
      } else {
        setNodeDiffRes(diffRes, path, 'CHANGED');
      }
      i++;
      j++;
    }
  }
  while (i < arrayPathValue1.length) {
    const isEqualRes = getCustomIsEqualRes({
      isEqualKeyArr,
      path: arrayPathValue1[i].path,
      isEqualMap,
      value1: arrayPathValue1[i].value,
      value2: undefined,
      ext: {
        data1: noDotData1,
        data2: noDotData2,
        type: '',
        path: arrayPathValue1[i].path,
      },
    });
    setNodeDiffRes(diffRes, arrayPathValue1[i].path, isEqualRes ?? 'REMOVED');
    i++;
  }
  while (j < arrayPathValue2.length) {
    const isEqualRes = getCustomIsEqualRes({
      isEqualKeyArr,
      path: arrayPathValue2[j].path,
      isEqualMap,
      value1: arrayPathValue2[j].value,
      value2: undefined,
      ext: {
        data1: noDotData1,
        data2: noDotData2,
        type: '',
        path: arrayPathValue2[j].path,
      },
    });
    setNodeDiffRes(diffRes, arrayPathValue2[j].path, isEqualRes ?? 'CREATED');
    j++;
  }

  // 标记父节点的REMOVED和CREATED情况
  const combinedArray = Array.from(
    new Set([
      ...arrayObjectResult1.map((x) => x.path),
      ...arrayObjectResult2.map((x) => x.path),
    ]),
  );

  for (let i = 0; i < combinedArray.length; i++) {
    const path = combinedArray[i];
    const d1 = mapObjectResult1.get(path);
    const d2 = mapObjectResult2.get(path);
    const isEqualRes = getCustomIsEqualRes({
      isEqualKeyArr,
      path,
      isEqualMap,
      value1: d1,
      value2: d2,
      ext: {
        data1: noDotData1,
        data2: noDotData2,
        type: '',
        path,
      },
    });
    if (isEqualRes) {
      diffRes[path] = isEqualRes;
    } else if (isNullOrUndefined(d1) && !isNullOrUndefined(d2)) {
      diffRes[path] = 'CREATED';
    } else if (!isNullOrUndefined(d1) && isNullOrUndefined(d2)) {
      diffRes[path] = 'REMOVED';
    }
  }
  // 恢复dot
  return restoreOriginalKeys(diffRes);
}

// 如果任意一个不是数组，则返回原值
// 如果两个都是数组，并且用户指定了对齐方式，则对齐
// 如果两个都是数组，并且没有指定对齐方式，则返回原值
function alignArray(props: {
  item1: any;
  item2: any;
  alignArr2Key?: string;
  alignLCSKey?: string;
}): [any, any] | undefined {
  const { item1, item2, alignArr2Key, alignLCSKey } = props;

  if (!Array.isArray(item1) || !Array.isArray(item2)) {
    return undefined;
  }
  if (alignArr2Key !== undefined) {
    // 以data2为准
    const [alignedArr1, alignedArr2] = alignByArr2({
      arr1: item1,
      arr2: item2,
      idKey: alignArr2Key,
    });
    return [alignedArr1, alignedArr2];
  } else if (alignLCSKey !== undefined) {
    // 以LCS为准

    const lcs = getLCS(item1, item2, alignLCSKey);

    const [alignedArr1, alignedArr2] = alignByLCS({
      arr1: item1,
      arr2: item2,
      lcs,
      listKey: alignLCSKey,
    });
    return [alignedArr1, alignedArr2];
  }
  return undefined;
}

/**
 * 递归地对齐子元素中的数组
 * data1和data2已经经过对齐，需要对齐它们的子元素
 */
function recursiveAlignArray(props: {
  data1: any;
  data2: any;
  pathPrefix?: string;
  arrayAlignLCSMap: Record<string, string>;
  arrayAlignData2Map: Record<string, string>;
}) {
  const {
    data1,
    data2,
    pathPrefix = '',
    arrayAlignLCSMap,
    arrayAlignData2Map,
  } = props;
  // 用户填的a.b.c.* 需要转换成a.b.c
  const arrayAlignLCSArr = Object.keys(arrayAlignLCSMap).filter((i) =>
    i.endsWith('.*'),
  );
  const arrayAlignData2Arr = Object.keys(arrayAlignData2Map).filter((i) =>
    i.endsWith('.*'),
  );

  // 如果data1和data2都是数组
  if (Array.isArray(data1) && Array.isArray(data2)) {
    // fullPath是本次要修改的数组，fullPath+".*"是数组元素
    const fullPath = pathPrefix + '*';
    const alignArr2Key = matchTemplateKey(arrayAlignData2Arr, fullPath + '.*');
    const alignLCSKey = matchTemplateKey(arrayAlignLCSArr, fullPath + '.*');

    for (let i = 0; i < data1.length; i++) {
      const alignRes = alignArray({
        item1: data1[i],
        item2: data2[i],
        alignArr2Key: alignArr2Key
          ? arrayAlignData2Map[alignArr2Key]
          : undefined,
        alignLCSKey: alignLCSKey ? arrayAlignLCSMap[alignLCSKey] : undefined,
      });
      if (alignRes) {
        data1[i] = alignRes[0];
        data2[i] = alignRes[1];
      }
      recursiveAlignArray({
        data1: data1[i],
        data2: data2[i],
        pathPrefix: fullPath + '.',
        arrayAlignLCSMap,
        arrayAlignData2Map,
      });
    }
  }
  // 如果data1和data2都是对象
  if (isPlainObject(data1) && isPlainObject(data2)) {
    Object.keys(data1).forEach((path) => {
      // data1和data2都有这个path，才可能需要对齐
      if (data2[path]) {
        const fullPath = pathPrefix + path;
        const alignArr2Key = matchTemplateKey(
          arrayAlignData2Arr,
          fullPath + '.*',
        );
        const alignLCSKey = matchTemplateKey(arrayAlignLCSArr, fullPath + '.*');
        const alignRes = alignArray({
          item1: data1[path],
          item2: data2[path],
          alignArr2Key: alignArr2Key
            ? arrayAlignData2Map[alignArr2Key]
            : undefined,
          alignLCSKey: alignLCSKey ? arrayAlignLCSMap[alignLCSKey] : undefined,
        });

        if (alignRes) {
          data1[path] = alignRes[0];
          data2[path] = alignRes[1];
        }
        // 递归对齐子元素
        recursiveAlignArray({
          arrayAlignLCSMap,
          arrayAlignData2Map,
          data1: data1[path],
          data2: data2[path],
          pathPrefix: fullPath + '.',
        });
      }
    });
  }

  return [data1, data2];
}

/**
 * Align data
 * @param props An object containing the following properties:
 *   - data1: The first data object to be aligned
 *   - data2: The second data object to be aligned
 *   - arrayAlignLCSMap: A map of paths to use LCS alignment for arrays
 *   - arrayAlignData2Map: A map of paths to use current data alignment for arrays
 * @returns An object containing the aligned versions of arr1 and arr2
 */
export function alignDataArray<T = any>(props: {
  data1: T;
  data2: T;
  arrayAlignLCSMap?: Record<string, string>;
  arrayAlignData2Map?: Record<string, string>;
}) {
  const {
    data1,
    data2,
    arrayAlignLCSMap = {},
    arrayAlignData2Map = {},
  } = props;
  // alignArray 无法处理恰好是数组情形，所以需要单独处理
  if (Array.isArray(data1) && Array.isArray(data2)) {
    if (arrayAlignLCSMap['*'] || arrayAlignData2Map['*']) {
      const alignRes = alignArray({
        item1: data1,
        item2: data2,
        alignArr2Key: arrayAlignData2Map['*'],
        alignLCSKey: arrayAlignLCSMap['*'],
      });
      if (alignRes) {
        return recursiveAlignArray({
          data1: alignRes[0],
          data2: alignRes[1],
          arrayAlignLCSMap,
          arrayAlignData2Map,
        });
      }
    }

    return recursiveAlignArray({
      data1,
      data2,
      arrayAlignLCSMap,
      arrayAlignData2Map,
    });
  }

  const result = recursiveAlignArray({
    data1: _.cloneDeep(data1),
    data2: _.cloneDeep(data2),
    arrayAlignLCSMap,
    arrayAlignData2Map,
  });
  return result;
}

export function calcDiffWithArrayAlign<T>(props: {
  data1: T;
  data2: T;
  isEqualMap?: Record<string, IsEqualFuncType>;
  arrayAlignLCSMap?: Record<string, string>;
  arrayAlignData2Map?: Record<string, string>;
  strictMode?: boolean;
}): { diffRes: DiffResType; alignedData1: T; alignedData2: T } {
  const data1 = replaceDotInKeys(props.data1);
  const data2 = replaceDotInKeys(props.data2);
  const [alignedData1, alignedData2] = alignDataArray({
    data1,
    data2,
    arrayAlignLCSMap: props.arrayAlignLCSMap ?? {},
    arrayAlignData2Map: props.arrayAlignData2Map ?? {},
  });
  const diffRes = calcDiff(
    alignedData1,
    alignedData2,
    props.isEqualMap,
    props.strictMode,
  );

  return {
    diffRes,
    alignedData1: restoreOriginalKeys(alignedData1),
    alignedData2: restoreOriginalKeys(alignedData2),
  };
}
