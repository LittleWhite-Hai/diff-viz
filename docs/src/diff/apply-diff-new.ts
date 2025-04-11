import { DiffResType } from './diff-algorithm';

export async function wait(millisecond: number) {
  return new Promise(res => setTimeout(res, millisecond));
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
  [...allColoredElements1, ...allColoredElements2].forEach(ele => {
    if (['rgb(253, 226, 226)', 'rgb(217, 245, 214)'].includes(ele.style.backgroundColor)) {
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
    domWrapper1?.querySelectorAll(`[data-aligned-path]`) ?? [],
  );
  const allAlignedElements2: Array<HTMLElement> = Array.from(
    domWrapper2?.querySelectorAll(`[data-aligned-path]`) ?? [],
  );
  [...allAlignedElements1, ...allAlignedElements2].forEach(ele => {
    ele.style.height = 'unset';
  });
}

// 对齐对应data-path的dom高度
function applyAlign(allElements1: Array<HTMLElement>, allElements2: Array<HTMLElement>) {
  // path对应的最高dom
  const pathMaxHeightMap: Record<string, number> = {};
  const pathElement1Map: Record<string, HTMLElement> = {};
  const pathElement2Map: Record<string, HTMLElement> = {};
  // 如果只有一边的path有子元素，另一边没有，则对齐他们本身，子元素高度不需要对齐

  // 统计container1里的path对应dom关系和max高度
  allElements1.forEach(ele => {
    const path = ele.getAttribute('data-path');
    if (path) {
      const rect = ele.getBoundingClientRect();
      if (path === 'workflowConfig.sortNodeList.2') {
        console.log('rect1', rect);
      }
      pathMaxHeightMap[path] = Math.max(pathMaxHeightMap[path] ?? 0, rect.height);
      pathElement1Map[path] = ele;
    }
  });

  // 统计container2里的path对应dom关系和max高度
  allElements2.forEach(ele => {
    const path = ele.getAttribute('data-path');
    if (path) {
      const rect = ele.getBoundingClientRect();
      if (path === 'workflowConfig.sortNodeList.2') {
        console.log('rect2', rect);
      }
      pathMaxHeightMap[path] = Math.max(pathMaxHeightMap[path] ?? 0, rect.height);
      pathElement2Map[path] = ele;
    }
  });

  const eleHeightChangedArray: Array<string> = [];

  Object.keys(pathMaxHeightMap)
    .sort((a, b) => a.length - b.length)
    .forEach(path => {
      if (eleHeightChangedArray.some(ele => path.includes(ele))) {
        // 如果父亲元素已经对齐过，则子元素不需要对齐
        return;
      }

      const ele1 = pathElement1Map[path]?.getBoundingClientRect();
      const ele2 = pathElement2Map[path]?.getBoundingClientRect();
      if (ele1 && ele1.height !== pathMaxHeightMap[path]) {
        pathElement1Map[path].style.height = pathMaxHeightMap[path] + 'px';
        eleHeightChangedArray.push(path);
        pathElement1Map[path].setAttribute('data-aligned-path', path);
      }
      if (ele2 && ele2.height !== pathMaxHeightMap[path]) {
        pathElement2Map[path].style.height = pathMaxHeightMap[path] + 'px';
        eleHeightChangedArray.push(path);
        pathElement2Map[path].setAttribute('data-aligned-path', path);
      }
    });
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

  allElements1.forEach(ele => {
    const path = ele.getAttribute('data-path');
    if (path) {
      if (data1DomMap[path]) {
        data1DomMap[path].push(ele);
      } else {
        data1DomMap[path] = [ele];
      }
    }
  });
  allElements2.forEach(ele => {
    const path = ele.getAttribute('data-path');
    if (path) {
      if (data2DomMap[path]) {
        data2DomMap[path].push(ele);
      } else {
        data2DomMap[path] = [ele];
      }
    }
  });

  // 着色
  Object.entries(diffRes).forEach(([key, val]: [string, string]) => {
    const pathDomList1 = data1DomMap[key];
    const pathDomList2 = data2DomMap[key];

    pathDomList1?.forEach(dom => {
      if (['CHANGED', 'REMOVED', 'CREATED'].includes(val)) {
        if (dom.querySelectorAll(`[data-path]`).length) {
          if (!disableColoringFather) {
            dom.setAttribute('data-colored-path', key);
            dom.style.borderRight = '4px solid rgb(253, 226, 226)';
            dom.style.paddingRight = '4px';
          }
        } else if (['CHANGED', 'REMOVED'].includes(val)) {
          dom.setAttribute('data-colored-path', key);
          dom.style.backgroundColor = 'rgb(253, 226, 226)';
        }
      }
    });

    pathDomList2?.forEach(dom => {
      if (['CHANGED', 'CREATED', 'REMOVED'].includes(val)) {
        if (dom.querySelectorAll(`[data-path]`).length) {
          if (!disableColoringFather) {
            dom.setAttribute('data-colored-path', key);
            dom.style.borderRight = '4px solid rgb(217, 245, 214)';
            dom.style.paddingRight = '4px';
          }
        } else if (['CHANGED', 'CREATED'].includes(val)) {
          dom.setAttribute('data-colored-path', key);
          dom.style.backgroundColor = 'rgb(217, 245, 214)';
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
  if (!disableAligning) {
    applyAlign(allElements1, allElements2);
  }
  if (!disableColoring) {
    applyColoring(allElements1, allElements2, diffRes, disableColoringFather);
  }
}
