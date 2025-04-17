import { describe, it, expect } from 'vitest';
import { alignByLCS,getLCS } from '../../src/diff-algorithm';



  describe('alignDataArray', () => {
    it('对齐LCS数组', () => {
        const arr1 = [ { id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' } ];
        const arr2 = [
            { id: 1, name: 'A' },
            { id: 3, name: 'Cc'  },
            { id: 4, name: 'D' }
          ]
        const lcs = getLCS(arr1, arr2,"id")
        console.log('🐲lcs',lcs)
        
        const [alignedObj1, alignedObj2] = alignByLCS({
          arr1,
          arr2,
          lcs,
          listKey: "id"
        });
        console.log('alignedObj1',alignedObj1)
        console.log('alignedObj2',alignedObj2)
    })
    

})