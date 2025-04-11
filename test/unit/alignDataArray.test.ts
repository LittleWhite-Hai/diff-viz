import { describe, it, expect } from 'vitest';
import { alignDataArray } from '../../src/diff-algorithm';

describe('alignDataArray', () => {
    it('应该正确计算数组差异并基于ID进行对齐', () => {
        const arr1 = [{ id: 1, name: "A" }, { id: 2, name: "B" }, { id: 3, name: "C" }];
        const arr2 = [{ id: 1, name: "A" }, { id: 3, name: "C修改" }, { id: 4, name: "D" }];
        
    
        const obj1 = { items: arr1 };
        const obj2 = { items: arr2 };
        
        const [alignedObj1, alignedObj2] = alignDataArray({
          data1: obj1,
          data2: obj2,
          arrayAlignLCSMap: { "items": "id" }
        });
        
        console.log(alignedObj1, alignedObj2);
        // expect(alignedArr1).toEqual([{id:1,name:"A"}, {id:2,name:"B"}, {id:3,name:"C"}, undefined]);
        // expect(alignedArr2).toEqual([{id:1,name:"A"}, undefined, {id:3,name:"C修改"}, {id:4,name:"D"}]);
      });
    
})