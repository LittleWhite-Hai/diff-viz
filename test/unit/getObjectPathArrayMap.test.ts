import { describe, it, expect } from 'vitest';
import { getObjectPathArrayMap } from '../../src/diff-algorithm';

describe('getObjectPathArrayMap', () => {
  it('应该正确提取对象中的数组', () => {
    const obj = {
      users: [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" }
      ],
      numbers: [1, 2, 3],
      settings: {
        permissions: ["read", "write"]
      }
    };
    
    const { mapResult } = getObjectPathArrayMap(obj);
    
    // 检查mapResult中的数组路径
    expect(mapResult['users']).toEqual([
      { id: 1, name: "张三" },
      { id: 2, name: "李四" }
    ]);
    
    expect(mapResult['numbers']).toEqual([1, 2, 3]);
    expect(mapResult['settings.permissions']).toEqual(["read", "write"]);
  });

  it('应该忽略非数组值', () => {
    const obj = {
      name: "张三",
      age: 30,
      hobbies: ["阅读", "旅行"],
      address: {
        city: "上海",
        district: "浦东"
      }
    };
    
    const { mapResult } = getObjectPathArrayMap(obj);
    
    // 只有数组应该被提取
    expect(Object.keys(mapResult)).toEqual(['hobbies']);
    expect(mapResult['hobbies']).toEqual(["阅读", "旅行"]);
    
    // 非数组值应该被忽略
    expect(mapResult['name']).toBeUndefined();
    expect(mapResult['age']).toBeUndefined();
    expect(mapResult['address']).toBeUndefined();
    expect(mapResult['address.city']).toBeUndefined();
  });

  it('应该处理嵌套数组', () => {
    const obj = {
      matrix: [
        [1, 2],
        [3, 4]
      ],
      departments: [
        {
          name: "技术部",
          teams: [
            { id: "team1", name: "前端" },
            { id: "team2", name: "后端" }
          ]
        }
      ]
    };
    
    const { mapResult } = getObjectPathArrayMap(obj);
    
    // 只提取顶层数组，不处理嵌套数组
    expect(Object.keys(mapResult).sort()).toEqual(['departments', 'matrix']);
    
    // 验证数组内容
    expect(mapResult['matrix']).toEqual([
      [1, 2],
      [3, 4]
    ]);
    
    expect(mapResult['departments']).toEqual([
      {
        name: "技术部",
        teams: [
          { id: "team1", name: "前端" },
          { id: "team2", name: "后端" }
        ]
      }
    ]);
    
    // 嵌套数组应该作为父数组元素的一部分，而不是单独提取
    expect(mapResult['matrix.0']).toBeUndefined();
    expect(mapResult['departments.0.teams']).toBeUndefined();
  });

  it('应该处理空对象和null值', () => {
    const obj = {
      emptyObject: {},
      nullValue: null,
      undefinedValue: undefined,
      emptyArray: []
    };
    
    const { mapResult } = getObjectPathArrayMap(obj);
    
    // 只有数组应该被提取
    expect(Object.keys(mapResult)).toEqual(['emptyArray']);
    expect(mapResult['emptyArray']).toEqual([]);
    
    // 非数组值应该被忽略
    expect(mapResult['emptyObject']).toBeUndefined();
    expect(mapResult['nullValue']).toBeUndefined();
    expect(mapResult['undefinedValue']).toBeUndefined();
  });

  it('应该将结果按字母顺序排序', () => {
    const obj = {
      c: [3],
      a: [1],
      b: [2],
      nested: {
        z: [26],
        x: [24],
        y: [25]
      }
    };
    
    const { arrayResult } = getObjectPathArrayMap(obj);
    
    // 检查路径是否按字母顺序排序
    const paths = arrayResult.map(item => item.path);
    const sortedPaths = [...paths].sort();
    expect(paths).toEqual(sortedPaths);
  });
}); 