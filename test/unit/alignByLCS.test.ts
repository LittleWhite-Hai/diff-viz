import { describe, it, expect } from "vitest";
import { alignByLCS2, getLCS } from "../../src/diff-algorithm.js";
import { cloneDeep } from "lodash";

describe("alignDataArray", () => {
  it("arr2删除两个元素:[1, 2, 3, 4], [1, 4]", () => {
    const result1 = alignByLCS2([1, 2, 3, 4], [1, 4]);
    expect(result1[0]).toEqual([1, 2, 3, 4]);
    expect(result1[1]).toEqual([1, undefined, undefined, 4]);
  });
  it("arr2新增两个元素:[1, 4], [1, 2, 3, 4]", () => {
    const result2 = alignByLCS2([1, 4], [1, 2, 3, 4]);
    expect(result2[0]).toEqual([1, undefined, undefined, 4]);
    expect(result2[1]).toEqual([1, 2, 3, 4]);
  });
  it("arr2为空:[1, 2, 3, 4], []", () => {
    const result3 = alignByLCS2([1, 2, 3, 4], []);
    expect(result3[0]).toEqual([1, 2, 3, 4]);
    expect(result3[1]).toEqual([undefined, undefined, undefined, undefined]);
  });
  it("有一个元素不一样，数组长度一样:[1, 2, 3, 4], [1, 0, 3, 4]", () => {
    const result4 = alignByLCS2([1, 2, 3, 4], [1, 0, 3, 4]);
    expect(result4[0]).toEqual([1, 2, undefined, 3, 4]);
    expect(result4[1]).toEqual([1, undefined, 0, 3, 4]);
  });
  it("有三个元素不一样，数组长度不一样:[1, 2, 3, 4], [1, 0, 4]", () => {
    const result5 = alignByLCS2([1, 2, 3, 4], [1, 0, 4]);
    expect(result5[0]).toEqual([1, 2, 3, undefined, 4]);
    expect(result5[1]).toEqual([1, undefined, undefined, 0, 4]);
  });
  it("两个数组完全相同:[1,2,3,4], [1,2,3,4]", () => {
    const result6 = alignByLCS2([1, 2, 3, 4], [1, 2, 3, 4]);
    expect(result6[0]).toEqual([1, 2, 3, 4]);
    expect(result6[1]).toEqual([1, 2, 3, 4]);
  });
  it("两个数组没有共同元素:[1,2,3,4], [5,6,7,8]", () => {
    const result7 = alignByLCS2([1, 2, 3, 4], [5, 6, 7, 8]);
    expect(result7[0]).toEqual([
      1,
      2,
      3,
      4,
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(result7[1]).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
      5,
      6,
      7,
      8,
    ]);
  });
  it("有多个连续的共同元素:[1,2,3,4,5], [1,2,6,7]", () => {
    const result8 = alignByLCS2([1, 2, 3, 4, 5], [1, 2, 6, 7]);
    expect(result8[0]).toEqual([1, 2, 3, 4, 5, undefined, undefined]);
    expect(result8[1]).toEqual([1, 2, undefined, undefined, undefined, 6, 7]);
  });
  it("有非连续的共同元素:[1,3,5,7], [2,3,4,7]", () => {
    const result9 = alignByLCS2([1, 3, 5, 7], [2, 3, 4, 7]);
    expect(result9[0]).toEqual([1, undefined, 3, 5, undefined, 7]);
    expect(result9[1]).toEqual([undefined, 2, 3, undefined, 4, 7]);
  });
  it("包含重复元素的情况1:[1,2,2,3], [1,2,3,3]", () => {
    const result10 = alignByLCS2([1, 2, 2, 3], [1, 2, 3, 3]);
    expect(result10[0]).toEqual([1, 2, 2, undefined, 3]);
    expect(result10[1]).toEqual([1, undefined, 2, 3, 3]);
  });
  it("包含重复元素的情况2:[1,2,8,2,3], [1,2,3,3]", () => {
    const result11 = alignByLCS2([1, 2, 8, 2, 3], [1, 2, 3, 3]);
    expect(result11[0]).toEqual([1, 2, 8, 2, undefined, 3]);
    expect(result11[1]).toEqual([1, undefined, undefined, 2, 3, 3]);
  });
  it("对象数组测试1", () => {
    const objArr1 = [
      { id: 1, name: "张三" },
      { id: 2, name: "李四" },
      { id: 3, name: "王五" },
    ];
    const objArr2 = [
      { id: 1, name: "张三" },
      { id: 4, name: "赵六" },
      { id: 3, name: "王五修改版" },
    ];
    const result12 = alignByLCS2(objArr1, objArr2, "id");
    expect(result12[0]).toEqual([
      { id: 1, name: "张三" },
      { id: 2, name: "李四" },
      undefined,
      { id: 3, name: "王五" },
    ]);
    expect(result12[1]).toEqual([
      { id: 1, name: "张三" },
      undefined,
      { id: 4, name: "赵六" },
      { id: 3, name: "王五修改版" },
    ]);
  });
  it("对象数组测试2", () => {
    const objArr1 = [
      { id: 1, name: "张三" },
      { id: 2, name: "李四" },
      { id: 3, name: "王五" },
    ];
    const objArr2 = [
      { id: 1, name: "张三" },
      { id: 2, name: "李四四四四" },
      { id: 3, name: "王五修改版" },
    ];
    const result12 = alignByLCS2(objArr1, objArr2, "id");
    expect(result12[0]).toEqual([
      { id: 1, name: "张三" },
      { id: 2, name: "李四" },
      { id: 3, name: "王五" },
    ]);
    expect(result12[1]).toEqual([
      { id: 1, name: "张三" },
      { id: 2, name: "李四四四四" },
      { id: 3, name: "王五修改版" },
    ]);
  });
  it("对象数组测试3", () => {
    const objArr1 = [
      { id: 1, name: "张三" },
      { id: 2, name: "李四" },
      { id: 3, name: "王五" },
    ];
    const objArr2 = [
      { id: 1, name: "张三" },
      { id: 2, name: "李四四四四" },
      { id: 3, name: "王五" },
    ];
    const result12 = alignByLCS2(objArr1, objArr2);
    expect(result12[0]).toEqual([
      { id: 1, name: "张三" },
      { id: 2, name: "李四" },
      undefined,
      { id: 3, name: "王五" },
    ]);
    expect(result12[1]).toEqual([
      { id: 1, name: "张三" },
      undefined,
      { id: 2, name: "李四四四四" },
      { id: 3, name: "王五" },
    ]);
  });
  it("二维数组测试1: 修改", () => {
    const data1 = [
      [1, 2, 3], // 第一个子数组
      [4, 5, 6], // 第二个子数组
      [7, 8, 9], // 第三个子数组
      ["a", "b", "c"], // 第四个子数组，不同类型
    ];
    const data2 = cloneDeep(data1);
    // 修改1: 改变第一个子数组中的值
    data2[0][1] = 22; // 将2改为22

    const [alignData1, alignData2] = alignByLCS2(data1, data2);
    expect(alignData1).toEqual([ [ 1, 2, 3 ], undefined, [ 4, 5, 6 ], [ 7, 8, 9 ], [ 'a', 'b', 'c' ] ]);
    expect(alignData2).toEqual([
      undefined,
      [ 1, 22, 3 ],
      [ 4, 5, 6 ],
      [ 7, 8, 9 ],
      [ 'a', 'b', 'c' ]
    ]);

  });
  it("二维数组测试2: 删除", () => {
    const data1:any[] = [
      [1, 2, 3], // 第一个子数组
      [4, 5, 6], // 第二个子数组
      [7, 8, 9], // 第三个子数组
      ["a", "b", "c"], // 第四个子数组，不同类型
    ];
    const data2 = cloneDeep(data1);
    // 加了一个元素
    data2.splice(2, 0,'xx');

    const [alignData1, alignData2] = alignByLCS2(data1, data2);
    console.log("alignData1", alignData1);
    console.log("alignData2", alignData2);
    expect(alignData1).toEqual([ [ 1, 2, 3 ], [ 4, 5, 6 ], undefined, [ 7, 8, 9 ], [ 'a', 'b', 'c' ] ]);
    expect(alignData2).toEqual([ [ 1, 2, 3 ], [ 4, 5, 6 ], 'xx', [ 7, 8, 9 ], [ 'a', 'b', 'c' ] ]);

  });
});
