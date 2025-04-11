import { describe, it, expect } from 'vitest';
import { getValueByPath } from '../../src/diff-algorithm';

describe('getValueByPath', () => {
  it('应该正确获取简单对象的属性值', () => {
    const obj = { name: "张三", age: 30 };
    
    expect(getValueByPath(obj, "name")).toBe("张三");
    expect(getValueByPath(obj, "age")).toBe(30);
  });

  it('应该正确获取嵌套对象的属性值', () => {
    const obj = { 
      user: { 
        name: "张三", 
        contact: { 
          email: "zhangsan@example.com",
          phone: "12345678901"
        }
      }
    };
    
    expect(getValueByPath(obj, "user.name")).toBe("张三");
    expect(getValueByPath(obj, "user.contact.email")).toBe("zhangsan@example.com");
    expect(getValueByPath(obj, "user.contact.phone")).toBe("12345678901");
  });

  it('应该正确处理数组中的对象', () => {
    const obj = { 
      users: [
        { id: 1, name: "张三" },
        { id: 2, name: "李四" }
      ]
    };
    
    expect(getValueByPath(obj, "users.0.name")).toBe("张三");
    expect(getValueByPath(obj, "users.1.id")).toBe(2);
  });

  it('应该在path为undefined时返回整个对象', () => {
    const obj = { name: "张三", age: 30 };
    
    expect(getValueByPath(obj, undefined)).toEqual(obj);
  });

  it('应该在path错误时返回undefined', () => {
    const obj = { name: "张三", age: 30 };
    
    expect(getValueByPath(obj, "address")).toBeUndefined();
    expect(getValueByPath(obj, "user.name")).toBeUndefined();
  });

  it('应该处理复杂嵌套结构', () => {
    const obj = {
      company: {
        name: "示例公司",
        departments: [
          {
            name: "技术部",
            teams: [
              {
                name: "前端团队",
                members: [
                  { id: 1, name: "张三" }
                ]
              }
            ]
          }
        ]
      }
    };
    
    expect(getValueByPath(obj, "company.departments.0.teams.0.members.0.name")).toBe("张三");
  });
}); 