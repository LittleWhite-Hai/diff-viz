import { DiffResType } from './diff-algorithm';

export async function wait(millisecond: number) {
  return new Promise((res) => setTimeout(res, millisecond));
}

// 恢复被diff着色和对齐的dom
export function resetApplyDiff(
  domWrapper1: HTMLElement | null | undefined,
  domWrapper2: HTMLElement | null | undefined,
) {
  const allColoredElements1: Array<HTMLElement> = Array.from(
    domWrapper1?.querySelectorAll(`[data-colored-path]`) ?? [],
  );
  const allColoredElements2: Array<HTMLElement> = Array.from(
    domWrapper2?.querySelectorAll(`[data-colored-path]`) ?? [],
  );
  [...allColoredElements1, ...allColoredElements2].forEach((ele) => {
    if (
      ['rgb(253, 226, 226)', 'rgb(217, 245, 214)'].includes(
        ele.style.backgroundColor,
      )
    ) {
      ele.style.backgroundColor = 'unset';
    }
    if (
      ['4px solid rgb(253, 226, 226)', '4px solid rgb(217, 245, 214)'].includes(
        ele.style.borderRight,
      )
    ) {
      ele.style.borderRight = 'unset';
      ele.style.paddingRight = 'unset';
    }
  });

  const allAlignedElements1: Array<HTMLElement> = Array.from(
    domWrapper1?.querySelectorAll('[data-aligned-path]') ?? [],
  );
  const allAlignedElements2: Array<HTMLElement> = Array.from(
    domWrapper2?.querySelectorAll('[data-aligned-path]') ?? [],
  );
  [...allAlignedElements1, ...allAlignedElements2].forEach((ele) => {
    ele.style.height = 'unset';
    ele.removeAttribute('data-aligned-path');
    ele.removeAttribute('data-aligned');
  });
}

// 对齐对应data-path的dom高度
function applyAlign(
  allElements1: Array<HTMLElement>,
  allElements2: Array<HTMLElement>,
) {
  const dataPathMap: Record<
    string,
    { dom1?: HTMLElement; dom2?: HTMLElement }
  > = {};
  allElements1.forEach((ele) => {
    const path = ele.getAttribute('data-path');
    if (path) {
      dataPathMap[path] = {
        ...dataPathMap[path],
        dom1: ele,
      };
    }
  });

  allElements2.forEach((ele) => {
    const path = ele.getAttribute('data-path');
    if (path) {
      dataPathMap[path] = {
        ...dataPathMap[path],
        dom2: ele,
      };
    }
  });

  let allPaths = Object.keys(dataPathMap);
  const restPaths = [...allPaths];

  while (allPaths.length) {
    allPaths.forEach((path) => {
      const { dom1, dom2 } = dataPathMap[path];
      if (!dom1 || !dom2) {
        dom1?.setAttribute('data-aligned', 'true');
        dom2?.setAttribute('data-aligned', 'true');
        restPaths.splice(restPaths.indexOf(path), 1);
        return;
      }
      const dom1Children = dom1?.querySelectorAll(
        '[data-path]:not([data-aligned])',
      );
      const dom2Children = dom2?.querySelectorAll(
        '[data-path]:not([data-aligned])',
      );
      if (!dom1Children?.length && !dom2Children?.length) {
        const rect1 = dom1.getBoundingClientRect();
        const rect2 = dom2.getBoundingClientRect();
        if (rect1.height > rect2.height) {
          dom2.style.height = Math.round(rect1.height) + 'px';
          dom2.setAttribute('data-aligned-path', path);
        } else {
          dom1.style.height = Math.round(rect2.height) + 'px';
          dom1.setAttribute('data-aligned-path', path);
        }
        dom1.setAttribute('data-aligned', 'true');
        dom2.setAttribute('data-aligned', 'true');
        restPaths.splice(restPaths.indexOf(path), 1);
      }
    });
    if (restPaths.length === allPaths.length) {
      const doms: Array<HTMLElement> = Array.from(
        dataPathMap[allPaths[0]].dom1?.querySelectorAll(
          '[data-path]:not([data-aligned])',
        ) || [],
      );
      const dataPath = doms.reduce((pre, cur) => {
        const path = cur.getAttribute('data-path') || '';
        return path?.length > pre.length ? path : pre;
      }, '');
      console.warn(
        `diff高度对齐出错：${dataPath}下可能存在重名data-path，请检查dom结构`,
      );
      allPaths = [];
    } else {
      allPaths = [...restPaths];
    }
  }
}
// 根据diff算法的结果,给对应data-path的dom进行着色
function applyColoring(
  allElements1: Array<HTMLElement>,
  allElements2: Array<HTMLElement>,
  diffRes: DiffResType,
  disableColoringFather: boolean,
) {
  // path对应dom关系
  const data1DomMap: Record<string, HTMLElement[]> = {};
  const data2DomMap: Record<string, HTMLElement[]> = {};

  allElements1.forEach((ele) => {
    const path = ele.getAttribute('data-path');
    if (path) {
      if (data1DomMap[path]) {
        data1DomMap[path].push(ele);
      } else {
        data1DomMap[path] = [ele];
      }
    }
  });
  allElements2.forEach((ele) => {
    const path = ele.getAttribute('data-path');
    if (path) {
      if (data2DomMap[path]) {
        data2DomMap[path].push(ele);
      } else {
        data2DomMap[path] = [ele];
      }
    }
  });

  const getDataColorType = (dom: HTMLElement) => {
    const type = dom.getAttribute('data-color-type');
    if (type) {
      return type;
    }
    if (dom.querySelectorAll(`[data-path]`).length) {
      return disableColoringFather ? 'none' : 'side';
    }
    return 'all';
  };

  // 着色
  Object.entries(diffRes).forEach(([key, val]: [string, string]) => {
    const pathDomList1 = data1DomMap[key];
    const pathDomList2 = data2DomMap[key];

    pathDomList1?.forEach((dom) => {
      if (['CHANGED', 'REMOVED', 'CREATED'].includes(val)) {
        const dataColorType = getDataColorType(dom);
        if (dataColorType === 'all') {
          dom.setAttribute('data-colored-path', key);
          dom.style.backgroundColor = 'rgb(253, 226, 226)';
          return;
        }
        if (dataColorType === 'side') {
          dom.setAttribute('data-colored-path', key);
          dom.style.borderRight = '4px solid rgb(253, 226, 226)';
          dom.style.paddingRight = '4px';
          return;
        }
      }
    });

    pathDomList2?.forEach((dom) => {
      if (['CHANGED', 'CREATED', 'REMOVED'].includes(val)) {
        const dataColorType = getDataColorType(dom);
        if (dataColorType === 'all') {
          dom.setAttribute('data-colored-path', key);
          dom.style.backgroundColor = 'rgb(217, 245, 214)';
          return;
        }
        if (dataColorType === 'side') {
          dom.setAttribute('data-colored-path', key);
          dom.style.borderRight = '4px solid rgb(217, 245, 214)';
          dom.style.paddingRight = '4px';
          return;
        }
      }
    });
  });
}

// 根据diff算法的结果,给对应data-path的dom进行着色和对齐,
// dom操作需要等待渲染，所以是异步函数
export async function applyDiff(props: {
  diffRes: DiffResType;
  domWrapper1: HTMLElement | null | undefined;
  domWrapper2: HTMLElement | null | undefined;
  disableColoring?: boolean;
  disableAligning?: boolean;
  disableColoringFather?: boolean;
}) {
  const {
    diffRes,
    domWrapper1,
    domWrapper2,
    disableColoring = false,
    disableAligning = false,
    disableColoringFather = false,
  } = props;

  const time = String(new Date().getTime());
  domWrapper1?.setAttribute('data-diff-time', time);
  domWrapper2?.setAttribute('data-diff-time', time);

  await wait(200);
  if (
    domWrapper1?.getAttribute('data-diff-time') !== time ||
    domWrapper2?.getAttribute('data-diff-time') !== time
  ) {
    return;
  }

  resetApplyDiff(domWrapper1, domWrapper2);

  // resetDom操作后，需要等待100ms渲染，再继续计算对齐高度
  await wait(100);

  const allElements1: Array<HTMLElement> = Array.from(
    domWrapper1?.querySelectorAll(`[data-path]`) ?? [],
  );
  const allElements2: Array<HTMLElement> = Array.from(
    domWrapper2?.querySelectorAll(`[data-path]`) ?? [],
  );
  if (!disableColoring) {
    applyColoring(allElements1, allElements2, diffRes, disableColoringFather);
  }
  if (!disableAligning) {
    applyAlign(allElements1, allElements2);
  }
}
