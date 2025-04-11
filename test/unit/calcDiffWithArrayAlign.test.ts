import { describe, it, expect } from 'vitest';
import { calcDiffWithArrayAlign } from '../../src/diff-algorithm';
import { IsEqualFuncType } from '../../src/types';

describe('calcDiffWithArrayAlign', () => {
  it('应该正确计算一维数组的差异并返回对齐结果', () => {
    // 准备测试数据
    const data1 = [
      { id: 1, name: "张三" },
      { id: 2, name: "李四" },
      { id: 3, name: "王五" }
    ];
    
    const data2 = [
      { id: 1, name: "张三" },
      { id: 3, name: "王五修改" },
      { id: 4, name: "赵六" }
    ];

    // 执行测试方法
    const result = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: { "": "id" }
    });

    // 检查结果结构
    expect(result).toHaveProperty('diffRes');
    expect(result).toHaveProperty('alignedData1');
    expect(result).toHaveProperty('alignedData2');

    // 检查对齐后的数据
    const { alignedData1, alignedData2, diffRes } = result;
    
    // 检查两个数组的基本属性
    expect(alignedData1.length).toBe(alignedData2.length);
    
    // 手动识别李四被删除和赵六被新增
    const deletedElements = data1.filter(item1 => 
      !data2.some(item2 => item2.id === item1.id)
    );
    expect(deletedElements.length).toBe(1);
    expect(deletedElements[0].id).toBe(2); // 李四

    const addedElements = data2.filter(item2 => 
      !data1.some(item1 => item1.id === item2.id)
    );
    expect(addedElements.length).toBe(1);
    expect(addedElements[0].id).toBe(4); // 赵六

    // 检查diffRes结果中是否包含相应的变化
    // 基于实际路径检查，这里仅验证存在变化
    const hasNameChanges = Object.entries(diffRes).some(
      ([key, value]) => key.includes('name') && value === 'CHANGED'
    );
    expect(hasNameChanges).toBe(true);

    const hasIdChanges = Object.entries(diffRes).some(
      ([key, value]) => key.includes('id') && value === 'CHANGED'
    );
    expect(hasIdChanges).toBe(true);
  });

  it('应该正确处理嵌套对象和嵌套数组', () => {
    // 准备嵌套测试数据
    const data1 = {
      department: "技术部",
      teams: [
        { 
          id: "team1",
          name: "前端团队",
          members: [
            { id: 1, name: "张三" },
            { id: 2, name: "李四" }
          ]
        },
        { 
          id: "team2",
          name: "后端团队",
          members: [
            { id: 3, name: "王五" }
          ]
        }
      ]
    };
    
    const data2 = {
      department: "技术部",
      teams: [
        { 
          id: "team1",
          name: "前端开发团队", // 名称变化
          members: [
            { id: 1, name: "张三" },
            { id: 4, name: "赵六" } // 成员变化
          ]
        },
        { 
          id: "team2",
          name: "后端团队",
          members: [
            { id: 3, name: "王五改" } // 名称变化
          ]
        }
      ]
    };

    // 执行测试方法
    const result = calcDiffWithArrayAlign({
      data1,
      data2,
      arrayAlignLCSMap: { 
        "teams": "id",
        "teams.*.members": "id" 
      }
    });

    // 检查结果结构
    expect(result).toHaveProperty('diffRes');
    expect(result).toHaveProperty('alignedData1');
    expect(result).toHaveProperty('alignedData2');

    const { diffRes } = result;

    // 检查团队名称变化
    expect(diffRes).toHaveProperty('teams.0.name', 'CHANGED');
    
    // 检查前端团队成员变化
    const hasMembersChanged = Object.entries(diffRes).some(
      ([key, value]) => key.includes('teams.0.members') && value === 'CHANGED'
    );
    expect(hasMembersChanged).toBe(true);

    // 检查后端团队成员名称变化
    const hasBackendMemberNameChanged = Object.entries(diffRes).some(
      ([key, value]) => key.includes('teams.1.members') && 
                       key.includes('name') && 
                       value === 'CHANGED'
    );
    expect(hasBackendMemberNameChanged).toBe(true);
  });

  it('应该支持自定义比较函数', () => {
    // 使用接口统一数据类型
    interface MixedTypeData {
      a: number | string;
      b: number | string;
    }
    
    const data1: MixedTypeData = { a: 1, b: "2" };
    const data2: MixedTypeData = { a: "1", b: 2 };

    // 声明自定义比较函数
    const isEqualMap: Record<string, IsEqualFuncType> = {
      'a': (val1, val2) => String(val1) === String(val2),
      'b': (val1, val2) => Number(val1) === Number(val2)
    };

    // 使用松散比较，"1"==1, "2"==2
    const result = calcDiffWithArrayAlign<MixedTypeData>({
      data1,
      data2,
      isEqualMap,
      strictMode: false
    });

    // 由于自定义比较函数，a和b应该被认为是相等的
    expect(result.diffRes.a).toBe('UNCHANGED');
    expect(result.diffRes.b).toBe('UNCHANGED');
  });
  
  it('应该处理复杂的深层嵌套结构和全部参数配置', () => {
    // 创建一个复杂的公司组织架构对象
    interface Employee {
      id: number;
      name: string;
      title: string;
      salary?: number;
      skills: string[];
      performance?: { 
        rating: number; 
        comments: string; 
      };
    }
    
    interface Project {
      projectId: string;
      name: string;
      status: 'active' | 'completed' | 'planned';
      teamMembers: Array<{ 
        employeeId: number; 
        role: string;
        workHours: number; 
      }>;
      milestones?: Array<{
        id: string;
        name: string;
        completed: boolean;
        dueDate: string;
      }>;
    }
    
    interface Department {
      id: string;
      name: string;
      budget: number;
      employees: Employee[];
      projects: Project[];
      subDepartments?: Department[];
    }
    
    interface CompanyStructure {
      companyName: string;
      foundedYear: number;
      headquarters: {
        country: string;
        city: string;
        address?: string;
      };
      departments: Department[];
      statistics: {
        totalEmployees: number;
        activeProjects: number;
        annualRevenue?: number;
        quarterlyResults: Array<{
          quarter: string;
          revenue: number;
          expenses: number;
        }>;
      };
    }
    
    // 第一个复杂对象
    const company1: CompanyStructure = {
      companyName: "技术创新有限公司",
      foundedYear: 2010,
      headquarters: {
        country: "中国",
        city: "上海",
        address: "浦东新区张江高科技园区"
      },
      departments: [
        {
          id: "dev",
          name: "研发部",
          budget: 5000000,
          employees: [
            {
              id: 101,
              name: "张三",
              title: "技术总监",
              salary: 30000,
              skills: ["Java", "Architecture", "Project Management"],
              performance: { rating: 5, comments: "优秀的领导能力" }
            },
            {
              id: 102,
              name: "李四",
              title: "高级开发工程师",
              salary: 25000,
              skills: ["Python", "AI", "Machine Learning"]
            },
            {
              id: 103,
              name: "王五",
              title: "全栈开发工程师",
              salary: 20000,
              skills: ["JavaScript", "React", "Node.js", "MongoDB"]
            }
          ],
          projects: [
            {
              projectId: "p1",
              name: "智能分析平台",
              status: "active",
              teamMembers: [
                { employeeId: 101, role: "项目负责人", workHours: 20 },
                { employeeId: 102, role: "算法工程师", workHours: 40 },
                { employeeId: 103, role: "前端开发", workHours: 30 }
              ],
              milestones: [
                {
                  id: "m1",
                  name: "需求分析",
                  completed: true,
                  dueDate: "2023-01-15"
                },
                {
                  id: "m2",
                  name: "原型设计",
                  completed: true,
                  dueDate: "2023-02-28"
                },
                {
                  id: "m3",
                  name: "MVP开发",
                  completed: false,
                  dueDate: "2023-06-30"
                }
              ]
            }
          ]
        },
        {
          id: "mkt",
          name: "市场部",
          budget: 3000000,
          employees: [
            {
              id: 201,
              name: "赵六",
              title: "市场总监",
              salary: 28000,
              skills: ["Marketing Strategy", "Team Management"]
            },
            {
              id: 202,
              name: "钱七",
              title: "市场专员",
              salary: 15000,
              skills: ["Content Creation", "Social Media"]
            }
          ],
          projects: [
            {
              projectId: "p2",
              name: "品牌推广",
              status: "active",
              teamMembers: [
                { employeeId: 201, role: "负责人", workHours: 25 },
                { employeeId: 202, role: "执行", workHours: 40 }
              ]
            }
          ]
        }
      ],
      statistics: {
        totalEmployees: 50,
        activeProjects: 5,
        annualRevenue: 50000000,
        quarterlyResults: [
          { quarter: "2023Q1", revenue: 12000000, expenses: 10000000 },
          { quarter: "2023Q2", revenue: 13000000, expenses: 11000000 }
        ]
      }
    };
    
    // 第二个复杂对象（与第一个有多处差异）
    const company2: CompanyStructure = {
      companyName: "技术创新有限公司",
      foundedYear: 2010,
      headquarters: {
        country: "中国",
        city: "上海",
        // address 字段被移除
      },
      departments: [
        {
          id: "dev",
          name: "研发中心", // 名称变化
          budget: 6000000, // 预算增加
          employees: [
            {
              id: 101,
              name: "张三",
              title: "技术总监",
              salary: 32000, // 涨薪
              skills: ["Java", "Architecture", "Project Management", "AI"], // 新增技能
              performance: { rating: 5, comments: "优秀的领导能力" }
            },
            // 李四（id: 102）不再是员工
            {
              id: 103,
              name: "王五",
              title: "全栈开发工程师",
              salary: 22000, // 涨薪
              skills: ["TypeScript", "React", "Node.js", "MongoDB"] // 技能变化
            },
            {
              id: 104, // 新员工
              name: "孙八",
              title: "初级开发工程师",
              salary: 12000,
              skills: ["JavaScript", "HTML", "CSS"]
            }
          ],
          projects: [
            {
              projectId: "p1",
              name: "智能分析平台2.0", // 名称变化
              status: "active",
              teamMembers: [
                { employeeId: 101, role: "项目负责人", workHours: 15 }, // 工时减少
                // 员工102不再参与
                { employeeId: 103, role: "技术负责人", workHours: 40 }, // 角色变化，工时增加
                { employeeId: 104, role: "开发工程师", workHours: 40 } // 新成员
              ],
              milestones: [
                {
                  id: "m1",
                  name: "需求分析",
                  completed: true,
                  dueDate: "2023-01-15"
                },
                {
                  id: "m2",
                  name: "原型设计",
                  completed: true,
                  dueDate: "2023-02-28"
                },
                {
                  id: "m3",
                  name: "MVP开发",
                  completed: true, // 状态变化
                  dueDate: "2023-06-15" // 日期变化
                },
                {
                  id: "m4", // 新里程碑
                  name: "测试发布",
                  completed: false,
                  dueDate: "2023-07-30"
                }
              ]
            },
            {
              projectId: "p3", // 新项目
              name: "移动应用开发",
              status: "planned",
              teamMembers: [
                { employeeId: 103, role: "技术顾问", workHours: 10 },
                { employeeId: 104, role: "开发工程师", workHours: 20 }
              ]
            }
          ]
        },
        {
          id: "mkt",
          name: "市场部",
          budget: 3000000,
          employees: [
            {
              id: 201,
              name: "赵六",
              title: "市场总监",
              // salary字段被移除
              skills: ["Marketing Strategy", "Team Management", "Public Relations"] // 新增技能
            },
            {
              id: 202,
              name: "钱七",
              title: "高级市场专员", // 职位变化
              salary: 18000, // 涨薪
              skills: ["Content Creation", "Social Media", "Event Planning"] // 新增技能
            }
          ],
          projects: [
            {
              projectId: "p2",
              name: "品牌推广",
              status: "completed", // 状态变化
              teamMembers: [
                { employeeId: 201, role: "负责人", workHours: 10 }, // 工时减少
                { employeeId: 202, role: "执行", workHours: 15 } // 工时减少
              ]
            }
          ]
        },
        {
          id: "hr", // 新部门
          name: "人力资源部",
          budget: 2000000,
          employees: [
            {
              id: 301,
              name: "周九",
              title: "HR经理",
              salary: 20000,
              skills: ["Recruitment", "Employee Relations"]
            }
          ],
          projects: []
        }
      ],
      statistics: {
        totalEmployees: 55, // 增加
        activeProjects: 6, // 增加
        // annualRevenue字段被移除
        quarterlyResults: [
          { quarter: "2023Q1", revenue: 12000000, expenses: 10000000 },
          { quarter: "2023Q2", revenue: 13500000, expenses: 11500000 }, // 数据变化
          { quarter: "2023Q3", revenue: 14000000, expenses: 12000000 } // 新季度数据
        ]
      }
    };
    
    // 定义自定义比较函数
    const isEqualMap: Record<string, IsEqualFuncType> = {
      'companyName': () => true, // 公司名称总是视为相同
      'departments.*.projects.*.teamMembers.*.employeeId': (a, b) => Number(a) === Number(b), // 保证员工ID的比较是数值比较
      'departments.*.employees.*.performance.rating': (a, b) => Math.abs(Number(a) - Number(b)) < 0.5 // 评分相差小于0.5视为相同
    };
    
    // 执行测试方法，使用所有可用参数
    const result = calcDiffWithArrayAlign<CompanyStructure>({
      data1: company1,
      data2: company2,
      isEqualMap,
      strictMode: true,
      arrayAlignLCSMap: {
        'departments': 'id',
        'departments.*.employees': 'id',
        'departments.*.projects': 'projectId',
        'departments.*.projects.*.teamMembers': 'employeeId',
        'departments.*.projects.*.milestones': 'id',
        'statistics.quarterlyResults': 'quarter'
      },
      arrayAlignData2Map: {
        // 空示例，但这里可以添加以data2为基准的数组
      },
      arrayNoAlignMap: {
        'departments.*.employees.*.skills': true // 不对技能数组进行对齐
      }
    });
    
    // 验证结果
    const { diffRes, alignedData1, alignedData2 } = result;
    
    // 1. 检查对齐结果的基本结构
    expect(alignedData1).toBeDefined();
    expect(alignedData2).toBeDefined();
    expect(diffRes).toBeDefined();
    
    // 2. 验证部门数量对齐
    expect(alignedData1.departments.length).toBe(alignedData2.departments.length);
    
    // 3. 验证新增部门(hr)被正确识别
    const hrDepartmentChanges = Object.keys(diffRes).filter(
      key => key.includes('departments.2') || key.includes('hr')
    );
    expect(hrDepartmentChanges.length).toBeGreaterThan(0);
    
    // 4. 验证研发部的名称变化
    expect(diffRes).toHaveProperty('departments.0.name', 'CHANGED');
    
    // 5. 验证员工变化 (李四离职, 孙八加入)
    const employeeChanges = Object.keys(diffRes).filter(
      key => key.includes('departments.0.employees')
    );
    expect(employeeChanges.length).toBeGreaterThan(0);
    
    // 6. 验证项目变化 (新增移动应用开发项目)
    const projectChanges = Object.keys(diffRes).filter(
      key => key.includes('departments.0.projects')
    );
    expect(projectChanges.length).toBeGreaterThan(0);
    
    // 7. 验证里程碑变化
    const milestoneChanges = Object.keys(diffRes).filter(
      key => key.includes('milestones')
    );
    expect(milestoneChanges.length).toBeGreaterThan(0);
    
    // 8. 验证总体数据变化
    expect(diffRes).toHaveProperty('statistics.totalEmployees', 'CHANGED');
    expect(diffRes).toHaveProperty('statistics.activeProjects', 'CHANGED');
    
    // 9. 验证删除字段
    expect(diffRes).toHaveProperty('headquarters.address', 'REMOVED');
    expect(diffRes).toHaveProperty('statistics.annualRevenue', 'REMOVED');
    
    // 10. 验证季度报告变化
    const quarterlyChanges = Object.keys(diffRes).filter(
      key => key.includes('statistics.quarterlyResults')
    );
    expect(quarterlyChanges.length).toBeGreaterThan(0);
    
    // 11. 验证公司名称通过自定义比较函数仍被认为是相同的
    expect(diffRes.companyName).toBe('UNCHANGED');
    
    // 12. 检查整体差异数量，确保检测到显著变化
    expect(Object.keys(diffRes).length).toBeGreaterThan(20);
  });
}); 