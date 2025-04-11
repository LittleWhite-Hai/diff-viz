import { describe, it, expect } from 'vitest';
import { getObjectPathValueMap } from '../../src/diff-algorithm';

describe('getObjectPathValueMap', () => {
  it('应该正确提取简单对象的路径值映射', () => {
    const obj = { 
      name: "张三", 
      age: 30, 
      active: true 
    };
    
    const { arrayResult, mapResult } = getObjectPathValueMap(obj);
    
    // 检查arrayResult (按字母顺序排序的路径值数组)
    expect(arrayResult).toHaveLength(3);
    
    // 检查特定路径是否存在并有正确的值
    expect(mapResult.get('name')).toBe('张三');
    expect(mapResult.get('age')).toBe(30);
    expect(mapResult.get('active')).toBe(true);
    
    // 检查arrayResult中的路径和值
    const pathValues = new Map(arrayResult.map(item => [item.path, item.value]));
    expect(pathValues.get('name')).toBe('张三');
    expect(pathValues.get('age')).toBe(30);
    expect(pathValues.get('active')).toBe(true);
  });

  it('应该正确处理嵌套对象', () => {
    const obj = { 
      user: { 
        name: "张三", 
        contact: { 
          email: "zhangsan@example.com" 
        } 
      } 
    };
    
    const { arrayResult, mapResult, mapObjectResult } = getObjectPathValueMap(obj);
    
    // 检查叶子节点值
    expect(mapResult.get('user.name')).toBe('张三');
    expect(mapResult.get('user.contact.email')).toBe('zhangsan@example.com');
    
    // 检查非叶子节点对象引用
    expect(mapObjectResult.get('user')).toEqual({ 
      name: "张三", 
      contact: { 
        email: "zhangsan@example.com" 
      } 
    });
    
    expect(mapObjectResult.get('user.contact')).toEqual({ 
      email: "zhangsan@example.com" 
    });
  });

  it('应该正确处理数组', () => {
    const obj = { 
      users: [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" }
      ] 
    };
    
    const { arrayResult, mapResult } = getObjectPathValueMap(obj);
    
    // 检查数组元素路径
    expect(mapResult.get('users.0.id')).toBe(1);
    expect(mapResult.get('users.0.name')).toBe('张三');
    expect(mapResult.get('users.1.id')).toBe(2);
    expect(mapResult.get('users.1.name')).toBe('李四');
  });

  it('应该正确处理空值和特殊值', () => {
    const obj = { 
      nullValue: null,
      undefinedValue: undefined,
      emptyString: "",
      emptyObject: {},
      emptyArray: []
    };
    
    const { mapResult, mapObjectResult } = getObjectPathValueMap(obj);
    
    // 检查特殊值
    expect(mapResult.get('nullValue')).toBeNull();
    expect(mapResult.get('undefinedValue')).toBeUndefined();
    expect(mapResult.get('emptyString')).toBe('');
    
    // 检查空对象和数组作为对象引用
    expect(mapObjectResult.has('emptyObject')).toBe(true);
    expect(mapObjectResult.has('emptyArray')).toBe(true);
  });

  it('应该正确处理日期对象', () => {
    const testDate = new Date('2023-01-01T00:00:00Z');
    const obj = { 
      createdAt: testDate
    };
    
    const { mapResult } = getObjectPathValueMap(obj);
    
    // 日期应该被转换为ISO字符串
    expect(mapResult.get('createdAt')).toBe(testDate.toISOString());
  });

  it('应该按字母顺序排序arrayResult', () => {
    const obj = { 
      c: 3,
      a: 1,
      b: 2,
      nested: {
        z: 26,
        x: 24,
        y: 25
      }
    };
    
    const { arrayResult } = getObjectPathValueMap(obj);
    
    // 检查路径是否按字母顺序排序
    const paths = arrayResult.map(item => item.path);
    const sortedPaths = [...paths].sort();
    expect(paths).toEqual(sortedPaths);
  });
}); 