import { cloneDeep } from "lodash";
import { it, expect, describe } from "vitest";
import { calcDiffWithArrayAlign } from "../../src/diff-algorithm";

describe("calcDiffWithArrayAlign", () => {
  it("外层纯数组，简单对象", () => {
    const data1 = [
      { id: 1, name: "张三" },
      { id: 2, name: "李四" },
      { id: 3, name: "王五" },
      { id: 4, name: "赵六" },
      { id: 5, name: "孙七" },
      { id: 6, name: "周八" },
      { id: 7, name: "吴九" },
      { id: 8, name: "郑十" },
    ];
    const data2 = cloneDeep(data1);

    data2[0].name = "张三修改";
    //在王五前面插入钱十一
    data2.splice(2, 0, { id: 22, name: "钱十一" });
    // 删除孙七和周八
    data2.splice(5, 2);

    const result1 = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: { "*": "id" },
    });
    const result2 = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: { "*": "id" },
      isEqualMap: {
        "*": (a, b) => a?.id === b?.id,
      },
    });

    expect(result2.diffRes["0"]).toEqual("UNCHANGED");
    expect(result1.diffRes["0"]).toEqual("CHANGED");
    expect(result1.diffRes["1"]).toEqual("UNCHANGED");
    expect(result1.diffRes["2"]).toEqual("CREATED");
    expect(result1.diffRes["3"]).toEqual("UNCHANGED");
    expect(result1.diffRes["4"]).toEqual("UNCHANGED");
    expect(result1.diffRes["5"]).toEqual("REMOVED");
    expect(result1.diffRes["6"]).toEqual("REMOVED");
    expect(result1.diffRes["7"]).toEqual("UNCHANGED");
    expect(result1.diffRes["8"]).toEqual("UNCHANGED");

    expect(result1.alignedData1[2]).toEqual(undefined);
    expect(result1.alignedData1[3].name).toEqual("王五");
    expect(result1.alignedData2[3].name).toEqual("王五");
    expect(result1.alignedData2[5]).toEqual(undefined);
    expect(result1.alignedData2[6]).toEqual(undefined);
  });
  it("外层纯数组，复杂嵌套对象", () => {
    const data1 = [
      { id: 1, name: "张三", address: { city: "上海", area: ["浦东", "浦西","浦北"] } },
      { id: 2, name: "李四", address: { city: "北京", area: ["海淀", "朝阳","昌平"] } },
      { id: 3, name: "王五", address: { city: "广州", area: ["越秀", "天河","白云"] } },
      { id: 4, name: "赵六", address: { city: "深圳", area: ["南山区", "福田区"] } },
      { id: 5, name: "孙七", address: { city: "阜阳", area: ["颍州区", "颍泉区"] } },
    ];
    const data2 = cloneDeep(data1);

    // 王五地址新增一条area
    data2[2].address.area.splice(0, 0, "白云山");
    // 修改孙七名字
    data2[4].name = "孙七修改";
    // 删除李四
    data2.splice(1, 1);

    const result = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: { "*": "id" ,"*.address.area.*":""},
    });
    expect(result.diffRes["0"]).toEqual("UNCHANGED");
    expect(result.diffRes["1"]).toEqual("REMOVED");
    expect(result.diffRes["2"]).toEqual("CHANGED");
    expect(result.diffRes["3"]).toEqual("UNCHANGED");
    expect(result.diffRes["4"]).toEqual("CHANGED");
    expect(result.alignedData1["2"].address.area).toEqual([
      undefined,
      "越秀",
      "天河",
      "白云"
    ]);
  });
});
