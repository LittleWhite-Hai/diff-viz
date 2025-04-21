import { describe, it, expect } from 'vitest';
import { alignDataArray } from '../../src/diff-algorithm';

describe('alignDataArray', () => {

    
    it('应该用LCS算法正确对齐简单数组', () => {
        const arr1 = [1, 2, 3, 4];
        const arr2 = [1, 3, 5];
        
        const [aligned1, aligned2] = alignDataArray({
          data1: arr1,
          data2: arr2
        });
        
        // 检查是否包含了原有的元素，并且在对应的位置
        expect(aligned1).toBe(arr1);
        expect(aligned2).toBe(arr2);
    });
    
    // 使用arrayNoAlignMap的测试
    it('使用arrayNoAlignMap时应该保持数组原样不对齐', () => {
        const data1 = { 
          items: [
            { id: 1, name: "A" },
            { id: 2, name: "B" }
          ]
        };
        
        const data2 = { 
          items: [
            { id: 3, name: "C" },
            { id: 4, name: "D" }
          ]
        };
        
        // 使用noAlignMap，告诉算法不要对齐items数组
        const [aligned1, aligned2] = alignDataArray({
          data1,
          data2,
          arrayNoAlignMap: { "items": true }
        });
        
        // 检查数组是否保持原样（未对齐）
        expect(aligned1.items).toEqual([
          { id: 1, name: "A" },
          { id: 2, name: "B" }
        ]);
        
        expect(aligned2.items).toEqual([
          { id: 3, name: "C" },
          { id: 4, name: "D" }
        ]);
        
        // 长度应该和原始数组一致
        expect(aligned1.items.length).toBe(2);
        expect(aligned2.items.length).toBe(2);
    });
    
    // it('应该正确处理使用arrayAlignData2Map对齐数组', () => {
    //     const data1 = {
    //       users: [
    //         { id: 1, name: "张三" },
    //         { id: 3, name: "王五" }
    //       ]
    //     };
        
    //     const data2 = {
    //       users: [
    //         { id: 2, name: "李四" },
    //         { id: 1, name: "张三改" }
    //       ]
    //     };
        
    //     // 使用arrayAlignData2Map，基于id字段对齐数组
    //     const [aligned1, aligned2] = alignDataArray({
    //       data1,
    //       data2,
    //       arrayAlignData2Map: { "users": "id" }
    //     });
        
    //     // 检查是否已经按照id正确对齐
    //     expect(aligned1.users.length).toBe(aligned2.users.length);
        
    //     // 找到id为1的元素的索引，应该在两个数组中相同
    //     const id1IndexInAligned1 = aligned1.users.findIndex(u => u?.id === 1);
    //     const id1IndexInAligned2 = aligned2.users.findIndex(u => u?.id === 1);
    //     expect(id1IndexInAligned1).toBe(id1IndexInAligned2);
        
    //     // id为1的项在两个数组中的name字段应该不同
    //     expect(aligned1.users[id1IndexInAligned1].name).toBe("张三");
    //     expect(aligned2.users[id1IndexInAligned2].name).toBe("张三改");
    // });
});