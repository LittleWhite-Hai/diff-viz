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
  it("对象嵌套单层数组", () => {
    const data1 = {
      name: "用户信息",
      version: "1.0",
      users: [
        { id: 1, name: "张三", age: 25 },
        { id: 2, name: "李四", age: 30 },
        { id: 3, name: "王五", age: 35 },
        { id: 4, name: "赵六", age: 40 },
        { id: 5, name: "钱七", age: 45 }
      ],
      settings: {
        language: "zh-CN",
        theme: "dark"
      }
    };
    const data2 = cloneDeep(data1);
    // 修改：修改张三的年龄
    data2.users[0].age = 26;
    // 删除：删除李四的记录
    data2.users.splice(1, 1);
    // 添加：添加一个新用户
    data2.users.push({ id: 6, name: "周八", age: 50 });
    // 修改对象本身的属性
    data2.version = "1.1";
    // 执行测试
    const result = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: { "users.*": "id" }
    });
    // 检查结果
    expect(result.diffRes["version"]).toBe("CHANGED");
    expect(result.diffRes["settings"]).toBe("UNCHANGED");
    expect(result.diffRes["name"]).toBe("UNCHANGED");
    
    // 检查用户数组的变化
    expect(result.diffRes["users"]).toBe("CHANGED");
    expect(result.diffRes["users.0.age"]).toBe("CHANGED"); // 张三的年龄改变
    expect(result.diffRes["users.1"]).toBe("REMOVED");     // 李四被删除
    expect(result.diffRes["users.2"]).toBe("UNCHANGED");   // 王五未变
    expect(result.diffRes["users.3"]).toBe("UNCHANGED");   // 赵六未变
    expect(result.diffRes["users.4"]).toBe("UNCHANGED");   // 钱七未变
    expect(result.diffRes["users.5"]).toBe("CREATED");     // 周八被添加
    
    // 检查对齐后的数据
    expect(result.alignedData1.users.length).toBe(result.alignedData2.users.length);
    expect(result.alignedData1.users[1]).not.toBeUndefined(); // 原始数据中李四的位置
    expect(result.alignedData2.users[1]).toBeUndefined();     // 对齐后李四的位置应为undefined
    
    // 检查最后一个元素
    const lastIndex = result.alignedData1.users.length - 1;
    expect(result.alignedData1.users[lastIndex]).toBeUndefined(); // 原始数据中没有周八
    expect(result.alignedData2.users[lastIndex].name).toBe("周八"); // 新增的周八
  });
  it("外层对象，嵌套多层数组", () => {
    // 简化的多层嵌套数据结构
    const data1 = {
      groups: [
        {
          id: "g1",
          items: [
            { id: "i1", values: [1, 2, 3] },
            { id: "i2", values: [4, 5, 6] }
          ]
        },
        {
          id: "g2",
          items: [
            { id: "i3", values: [7, 8, 9] }
          ]
        }
      ]
    };
    
    const data2 = cloneDeep(data1);
    
    // 修改1: 给第一个组添加新项
    data2.groups[0].items.push({ id: "i4", values: [10, 11, 12] });
    
    // 修改2: 删除第一个组的第一个项
    data2.groups[0].items.splice(0, 1);
    
    // 修改3: 修改第二个组的项的值数组
    data2.groups[1].items[0].values = [7, 99, 9];
    
    // 修改4: 添加新的组
    data2.groups.push({
      id: "g3",
      items: [
        { id: "i5", values: [13, 14, 15] }
      ]
    });
    
    // 执行测试，使用LCS对齐
    const result = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: {
        "groups.*": "id",
        "groups.*.items.*": "id"
      }
    });
    
    // 验证差异
    // 组和项数组的变化
    expect(result.diffRes["groups"]).toBe("CHANGED");
    expect(result.diffRes["groups.0"]).toBe("CHANGED");
    expect(result.diffRes["groups.1"]).toBe("CHANGED");
    expect(result.diffRes["groups.2"]).toBe("CREATED");
    
    // 项的变化
    expect(result.diffRes["groups.0.items"]).toBe("CHANGED");
    expect(result.diffRes["groups.0.items.0"]).toBe("REMOVED");    // i1被删除
    expect(result.diffRes["groups.0.items.1"]).toBe("UNCHANGED");  // i2未变
    expect(result.diffRes["groups.0.items.2"]).toBe("CREATED");    // i4被添加
    
    // 值数组的变化
    expect(result.diffRes["groups.1.items.0.values"]).toBe("CHANGED");
    expect(result.diffRes["groups.1.items.0.values.1"]).toBe("CHANGED");
    
    // 验证数组对齐
    // 第一组的项应该对齐
    const items1 = result.alignedData1.groups[0].items;
    const items2 = result.alignedData2.groups[0].items;
    
    // 数组长度应相同
    expect(items1.length).toBe(items2.length);
    
    // i1在data1中存在，在data2中被删除
    expect(items1[0].id).toBe("i1");
    expect(items2[0]).toBeUndefined();
    
    // i2在两者中都存在且位置一致
    expect(items1[1].id).toBe("i2");
    expect(items2[1].id).toBe("i2");
    
    // i4在data1中不存在，在data2中被添加
    expect(items1[2]).toBeUndefined();
    expect(items2[2].id).toBe("i4");
    
    // 确保g3被正确添加
    expect(result.alignedData1.groups[2]).toBeUndefined();
    expect(result.alignedData2.groups[2].id).toBe("g3");
  });
  it("外层对象，嵌套多维数组修改", () => {
    // 创建测试数据：二维数组结构
    const data1 = [
      [1, 2, 3],         // 第一个子数组
      [4, 5, 6],         // 第二个子数组
      [7, 8, 9],         // 第三个子数组
      ["a", "b", "c"]    // 第四个子数组，不同类型
    ];
    const data2 = cloneDeep(data1);
    // 修改1: 改变第一个子数组中的值
    data2[0][1] = 22;  // 将2改为22
    const result = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: {
        "*": ""  // 对顶层数组使用LCS对齐，但不指定键（纯数组没有键）
      }
    });
    // 检查子数组变化
    expect(result.diffRes["0"]).toBe("REMOVED");
    expect(result.diffRes["1"]).toBe("CREATED");
    
    // 验证对齐后的数据
    const alignedData1 = result.alignedData1;
    const alignedData2 = result.alignedData2;
    // 数组长度应该匹配
    expect(alignedData1.length).toBe(alignedData2.length);
    // 第一个子数组的对齐 - 只有元素值变化
    expect(alignedData1[0][0]).toBe(1);
    expect(alignedData1[0][1]).toBe(2);
    expect(alignedData2[1][1]).toBe(22);
    expect(alignedData1[1]).toBeUndefined();
    expect(alignedData2[0]).toBeUndefined();
    
    // 验证第二层数组内部元素的变化也能被检测到
    expect(result.diffRes["0.1"]).toBe("REMOVED");
    expect(result.diffRes["0.0"]).toBe("REMOVED");
    expect(result.diffRes["1.2"]).toBe("CREATED");
  });
  it("外层对象，嵌套多维数组新增", () => {
    // 创建测试数据：二维数组结构
    const data1:any[] = [
      [1, 2, 3],         // 第一个子数组
      [4, 5, 6],         // 第二个子数组
      [7, 8, 9],         // 第三个子数组
      ["a", "b", "c"]    // 第四个子数组，不同类型
    ];
    const data2 = cloneDeep(data1);
    // 修改1: 改变第一个子数组中的值
    data2.splice(1, 0, 'xx');
    const result = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: {
        "*": ""  // 对顶层数组使用LCS对齐，但不指定键（纯数组没有键）
      }
    });
    console.log(result)
    // 检查子数组变化
    expect(result.diffRes["0"]).toBe("UNCHANGED");
    // expect(result.diffRes["1"]).toBe("CREATED");
    
    // 验证对齐后的数据
    const alignedData1 = result.alignedData1;
    const alignedData2 = result.alignedData2;
    // 数组长度应该匹配
    expect(alignedData1.length).toBe(alignedData2.length);
    // 第一个子数组的对齐 - 只有元素值变化
    expect(alignedData1[1]).toBeUndefined();
    expect(alignedData2[1]).toBe('xx');
  });
});

