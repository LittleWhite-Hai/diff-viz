import { describe, it, expect } from 'vitest';
// 由于matchTemplateKey是私有函数，我们需要从diff-algorithm.ts中导出它进行测试
// 以下测试假设函数已被导出，在实际测试前可能需要修改源代码

// 临时解决方案：复制matchTemplateKey的实现用于测试
function matchTemplateKey(
  templates: string[],
  str: string
): string | undefined {
  if (templates.length === 0) {
    return undefined;
  }
  // 将待匹配字符串按点分割
  const strParts = str.split(".");
  const matches: string[] = [];

  // 遍历所有模板
  for (const template of templates) {
    // 将模板按点分割
    const templateParts = template.split(".");

    // 如果模板和待匹配字符串完全相同，则返回模板
    if (template === str) {
      return template;
    }

    // 如果模板部分数量与待匹配字符串部分数量不同，且模板不包含通配符，则跳过
    if (templateParts.length !== strParts.length && !template.includes("*")) {
      continue;
    }

    // 检查是否匹配
    let isMatch = true;

    // 遍历模板的每一部分
    for (let i = 0; i < Math.max(templateParts.length, strParts.length); i++) {
      // 如果模板部分已经结束，但待匹配字符串还有部分，则不匹配
      if (i >= templateParts.length) {
        isMatch = false;
        break;
      }

      // 如果待匹配字符串部分已经结束，但模板还有部分，则不匹配
      if (i >= strParts.length) {
        isMatch = false;
        break;
      }

      // 如果模板部分是通配符，则匹配任何部分
      if (templateParts[i] === "*") {
        continue;
      }

      // 如果模板部分与待匹配字符串部分不匹配，则不匹配
      if (templateParts[i] !== strParts[i]) {
        isMatch = false;
        break;
      }
    }

    // 如果匹配，则返回模板
    if (isMatch) {
      matches.push(template);
    }
  }
  if (matches.length > 0) {
    // 返回*最少的一个
    let minStarCount: number = Infinity;
    let minStarCountTemplate: string = "";
    for (const template of matches) {
      const starCount = template
        .split(".")
        .filter((part) => part === "*").length;
      if (starCount < minStarCount) {
        minStarCount = starCount;
        minStarCountTemplate = template;
      }
    }
    return minStarCountTemplate;
  }
  return undefined;
}

describe('matchTemplateKey', () => {
  it('应该返回undefined当模板数组为空时', () => {
    const templates: string[] = [];
    const str = 'test.path';
    
    expect(matchTemplateKey(templates, str)).toBeUndefined();
  });
  
  it('应该返回完全匹配的模板', () => {
    const templates = ['test.path', 'another.path'];
    const str = 'test.path';
    
    expect(matchTemplateKey(templates, str)).toBe('test.path');
  });
  
  it('应该正确匹配包含通配符的模板', () => {
    const templates = ['test.*.value', 'another.path'];
    const str = 'test.some.value';
    
    expect(matchTemplateKey(templates, str)).toBe('test.*.value');
  });
  
  it('当有多个匹配时，应该返回星号最少的模板', () => {
    const templates = [
      'items.*.id',           // 1个*
      'items.*.*',            // 2个*
      'items.*.users.*.name'  // 2个*
    ];
    const str = 'items.1.id';
    
    // 应该返回'items.*.id'，因为它只有1个*
    expect(matchTemplateKey(templates, str)).toBe('items.*.id');
  });
  
  it('当两个模板都完全匹配时，应该返回第一个', () => {
    const templates = ['test.path', 'test.path'];
    const str = 'test.path';
    
    expect(matchTemplateKey(templates, str)).toBe('test.path');
  });
  
  it('当有多个包含相同数量星号的匹配时，应该返回第一个匹配的', () => {
    const templates = [
      'users.*.profile',
      'items.*.detail'
    ];
    const str = 'users.123.profile';
    
    expect(matchTemplateKey(templates, str)).toBe('users.*.profile');
  });
  
  it('应该处理不同层级数的路径', () => {
    const templates = ['a.b.c', 'x.y'];
    
    // 层级数不匹配且没有通配符，应该不匹配
    expect(matchTemplateKey(templates, 'a.b')).toBeUndefined();
    expect(matchTemplateKey(templates, 'a.b.c.d')).toBeUndefined();
    
    // 层级数匹配但内容不匹配，应该不匹配
    expect(matchTemplateKey(templates, 'a.b.d')).toBeUndefined();
  });
}); 