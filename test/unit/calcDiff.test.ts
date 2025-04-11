import { describe, it, expect } from "vitest";
import { calcDiff } from "../../src/diff-algorithm";

describe("calcDiff", () => {
  describe("calcDiff with custom isEqual function", () => {
    it("测试末端为*的isEqual情况", () => {
      const obj1 = {
        a: {
          b: [
            { xx: "feasef", jj: "jlfeij", id: "1" },
            { xx: "fea123sef", jj: "jlfeij", id: "2" },
            { xx: "fe123asef", jj: "jlfe23123ij", id: "3" },
          ],
        },
      };
      const obj2 = {
        a: {
          b: [
            { xx: "1212", jj: "1212", id: "1" },
            { xx: "12f", jj: "fesf", id: "2" },
            { xx: "feas3", jj: "3fsfa", id: "4" },
          ],
        },
      };

      // 自定义比较函数：使用==而不是===，允许不同类型但值相等的情况
      const isEqualMap = {
        "a.b.*": (a, b) => {
          return a?.id===b?.id;
        },
      };

      // 使用自定义比较函数计算差异
      const result = calcDiff(obj1, obj2, isEqualMap);

      expect(result["a.b.0"]).toBe("UNCHANGED");
      expect(result["a.b.1"]).toBe("UNCHANGED");
      expect(result["a.b.2"]).toBe("CHANGED");
    });

    it("应该使用自定义比较函数判断两个值是否相等", () => {
      // 测试对象：一个是数字1，一个是字符串"1"
      const obj1 = { a: 1 };
      const obj2 = { a: "1" };

      // 自定义比较函数：使用==而不是===，允许不同类型但值相等的情况
      const isEqualMap = {
        a: (data1, data2) => data1 == data2,
      };

      // 使用自定义比较函数计算差异
      const result = calcDiff(obj1, obj2, isEqualMap);

      // 预期：应该没有差异，因为1=="1"是true
      expect(result.a).toBe("UNCHANGED");
    });

    it("自定义比较函数应该覆盖默认的严格相等判断", () => {
      // 测试对象：一个是数字1，一个是字符串"1"
      const obj1 = { a: 1 };
      const obj2 = { a: "1" };

      // 不使用自定义比较函数，使用默认的严格相等
      const resultWithoutCustomEqual = calcDiff(obj1, obj2);

      // 预期：应该有差异，因为1==="1"是false
      expect(resultWithoutCustomEqual.a).toBe("CHANGED");

      // 使用自定义比较函数
      const isEqualMap = {
        a: (data1, data2) => {
          return data1 == data2},
      };
      const resultWithCustomEqual = calcDiff(obj1, obj2, isEqualMap);

      // 预期：应该没有差异，因为1=="1"是true
      expect(resultWithCustomEqual.a).toBe("UNCHANGED");
    });
  });

  // 新增测试用例：测试父节点标记
  describe("父节点差异标记测试", () => {
    it("当子节点被标记为REMOVED时，父节点应被标记为REMOVED或CHANGED", () => {
      const obj1 = {
        parent: {
          child1: "value1",
          child2: "value2",
        },
      };
      const obj2 = {
        parent: {
          child1: "value1",
          // child2被移除了
        },
      };

      const result = calcDiff(obj1, obj2);

      // child2被移除
      expect(result["parent.child2"]).toBe("REMOVED");

      // 由于parent的一个子节点被移除，parent应该被标记为CHANGED或REMOVED
      // 在这个情况下，应该是CHANGED，因为还有一个子节点存在
      expect(result["parent"]).toBe("CHANGED");
    });

    it("当所有子节点都被标记为UNCHANGED时，父节点应该是UNCHANGED", () => {
      const obj1 = {
        parent: {
          child1: "value1",
          child2: "value2",
        },
      };
      const obj2 = {
        parent: {
          child1: "value1",
          child2: "value2",
        },
      };

      const result = calcDiff(obj1, obj2);

      // 所有子节点都未改变
      expect(result["parent.child1"]).toBe("UNCHANGED");
      expect(result["parent.child2"]).toBe("UNCHANGED");

      // 父节点也应该是未改变的
      expect(result["parent"]).toBe("UNCHANGED");
    });

    it("当所有子节点都被REMOVED时，父节点应该是REMOVED", () => {
      const obj1 = {
        parent: {
          child1: "value1",
          child2: "value2",
        },
        other: "value",
      };
      const obj2 = {
        // parent完全被移除
        other: "value",
      };

      const result = calcDiff(obj1, obj2);

      // parent节点应该被标记为REMOVED
      expect(result["parent"]).toBe("REMOVED");
    });

    it("当子节点被CREATED时，父节点应该被标记为CREATED或CHANGED", () => {
      const obj1 = {
        parent: {},
      };
      const obj2 = {
        parent: {
          newChild: "new value",
        },
      };

      const result = calcDiff(obj1, obj2);

      // newChild被创建
      expect(result["parent.newChild"]).toBe("CREATED");

      // 父节点应该被标记为CHANGED
      expect(["CHANGED", "CREATED"]).toContain(result["parent"]);
    });

    it("当一个对象节点完全是新创建的，其父节点也应该被标记为CREATED", () => {
      const obj1 = {};
      const obj2 = {
        newParent: {
          child: "value",
        },
      };

      const result = calcDiff(obj1, obj2);

      // newParent节点应该被标记为CREATED
      expect(result["newParent"]).toBe("CREATED");
      expect(result["newParent.child"]).toBe("CREATED");
    });

    it("当父节点的某些子节点被移除，某些被创建时，应该被标记为CHANGED", () => {
      const obj1 = {
        parent: {
          child1: "value1",
          child2: "value2",
        },
      };

      const obj2 = {
        parent: {
          child2: "value2",
          child3: "value3",
        },
      };

      const result = calcDiff(obj1, obj2);

      // 子节点的变化
      expect(result["parent.child1"]).toBe("REMOVED");
      expect(result["parent.child3"]).toBe("CREATED");
      expect(result["parent.child2"]).toBe("UNCHANGED");

      // 父节点应该被标记为CHANGED
      expect(result["parent"]).toBe("CHANGED");
    });
  });

  // 新增测试用例：测试非严格模式下的空值比较
  describe("非严格模式下的空值比较", () => {
    it("在非严格模式下，null、undefined、空字符串和NaN应该被视为相等", () => {
      const obj1 = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: "",
        nanValue: NaN,
      };

      const obj2 = {
        nullValue: undefined,
        undefinedValue: null,
        emptyString: null,
        nanValue: NaN,
      };

      // 使用非严格模式
      const result = calcDiff(obj1, obj2, {}, false);

      // 所有这些值在非严格模式下应该被视为相等
      expect(result["nullValue"]).toBe("UNCHANGED");
      expect(result["undefinedValue"]).toBe("UNCHANGED");
      expect(result["emptyString"]).toBe("UNCHANGED");
      expect(result["nanValue"]).toBe("UNCHANGED");
    });

    it("在严格模式下，null、undefined和空字符串应该被视为不同", () => {
      const obj1 = {
        nullValue: null,
        undefinedValue: undefined,
        emptyString: "",
      };

      const obj2 = {
        nullValue: undefined,
        undefinedValue: null,
        emptyString: null,
      };

      // 使用严格模式（默认）
      const result = calcDiff(obj1, obj2);

      // 在严格模式下，这些值应该被视为不同
      expect(result["nullValue"]).toBe("CHANGED");
      expect(result["undefinedValue"]).toBe("CHANGED");
      expect(result["emptyString"]).toBe("CHANGED");
    });

    it("在非严格模式下，普通值仍然应该被正确地进行比较", () => {
      const obj1 = {
        numValue: null,
        strValue: "test",
      };

      const obj2 = {
        numValue: undefined,
        strValue: "test2", // 不同的值
      };

      // 使用非严格模式
      const result = calcDiff(obj1, obj2, {}, false);

      // 数字值相同，应该是UNCHANGED
      expect(result["numValue"]).toBe("UNCHANGED");

      // 字符串值不同，应该是CHANGED
      expect(result["strValue"]).toBe("CHANGED");
    });
  });
});
