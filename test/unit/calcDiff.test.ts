import { describe, it, expect } from 'vitest';
import { calcDiff } from '../../src/diff-algorithm';

describe('calcDiff', () => {
  describe('calcDiff with custom isEqual function', () => {
    it('应该使用自定义比较函数判断两个值是否相等', () => {
      // 测试对象：一个是数字1，一个是字符串"1"
      const obj1 = { a: 1 };
      const obj2 = { a: "1" };
      
      // 自定义比较函数：使用==而不是===，允许不同类型但值相等的情况
      const isEqualMap = {
        'a': (data1, data2) => data1 == data2
      };
      
      // 使用自定义比较函数计算差异
      const result = calcDiff(obj1, obj2, isEqualMap);
      
      // 预期：应该没有差异，因为1=="1"是true
      expect(result.a).toBe('UNCHANGED');
    });
    
    it('自定义比较函数应该覆盖默认的严格相等判断', () => {
      // 测试对象：一个是数字1，一个是字符串"1"
      const obj1 = { a: 1 };
      const obj2 = { a: "1" };
      
      // 不使用自定义比较函数，使用默认的严格相等
      const resultWithoutCustomEqual = calcDiff(obj1, obj2);
      
      // 预期：应该有差异，因为1==="1"是false
      expect(resultWithoutCustomEqual.a).toBe('CHANGED');
      
      // 使用自定义比较函数
      const isEqualMap = {
        'a': (data1, data2) => data1 == data2
      };
      const resultWithCustomEqual = calcDiff(obj1, obj2, isEqualMap);
      
      // 预期：应该没有差异，因为1=="1"是true
      expect(resultWithCustomEqual.a).toBe('UNCHANGED');
    });
  });
}); 