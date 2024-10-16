import {
  ReactNode,
  useRef,
  useMemo,
  useEffect,
  CSSProperties,
  useCallback,
  useState,
} from "react";
import { throttle } from "lodash"; // 确保已安装并导入lodash

import { Path } from "../path-type";
import { diff } from "../diff-algorithm";

export type DataTypeBase = {
  [key: string]: any;
};

export enum DiffStatus {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  UNCHANGED = "UNCHANGED",
}

type ExtType<T> = {
  beforeData: T;
  currentData: T;
  type: "before" | "current";
  path: PathType<T>;
  index?: number;
};

type LabelType<T> =
  | undefined
  | string
  | ((data: any, record: T, ext: ExtType<T>) => ReactNode);
type PathType<T> = undefined | Path<T> | "";

type VisibleType<T> =
  | undefined
  | boolean
  | ((data: any, record: T, ext: ExtType<T>) => boolean | undefined);

type IsEqualFuncType = (data1: any, data2: any, ext: ExtType<any>) => boolean;

type ContentType<T> =
  | undefined
  | ReactNode
  | ((data: any, record: T, ext: ExtType<T>) => ReactNode);

type FieldItem<T extends DataTypeBase> = {
  label: LabelType<T>;
  separator?: boolean;
  path?: PathType<T>;
  key?: string;
  visible?: VisibleType<T>;
  foldable?: boolean;
  isEqual?: IsEqualFuncType;
  colPadding?: number;
  content?: ContentType<T>;
  colorDataPath?: boolean;
  arrNeedAlignByLCS?: boolean;
  arrNeedAlignByAfterKey?: string;
  labelWidth?: number;
  index?: number;
};
type FieldItems<T extends DataTypeBase> = Array<FieldItem<T>>;

function getIsEqualMap(fieldItems: any) {
  return {};
}

function calcDiff(
  beforeData: any,
  currentData: any,
  fieldItems: any
): {
  diffRes: Record<string, string>;
  alignedData1: any;
  alignedData2: any;
} {
  return diff(beforeData, currentData);
}

function getFieldContent<T extends DataTypeBase>(
  data: any,
  content: ContentType<T>,
  ext: {
    beforeData: T;
    currentData: T;
    type: "before" | "current";
    path: PathType<T>;
    index?: number;
  }
): ReactNode {
  if (content) {
    if (typeof content === "function") {
      return content(getPathValue(data, ext.path), data, ext);
    } else {
      return content;
    }
  } else {
    return getPathValue(data, ext.path);
  }
}

// 根据path得到data中对应的原始数据
function getPathValue<T extends DataTypeBase>(
  data: T,
  path: string | undefined
): any {
  if (path === undefined) {
    return data;
  } else {
    // path是string
    const pathArr = path.split(".") ?? [];
    let curData = data;
    for (const tmpIdx of pathArr) {
      curData = (curData as T)?.[tmpIdx];
    }
    return curData;
  }
}

// 根据path得到data对应的label
function getPathLabel<T extends DataTypeBase>(
  data: T | undefined,
  label: LabelType<T>,
  ext: ExtType<T>
): ReactNode {
  if (!data) {
    return typeof label === "string" ? label : "";
  }
  const curData = ext.path ? getPathValue(data, ext.path) : undefined;
  if (typeof label === "function") {
    return label(curData, data, ext);
  } else {
    return label;
  }
}

function RenderFieldItem<T extends DataTypeBase>(props: {
  fieldItem: FieldItem<T>;
  data: T;
  beforeData: T;
  currentData: T;
  type: "before" | "current";
  contentStyle: CSSProperties;
  labelStyle: CSSProperties;
}): any {
  const {
    fieldItem,
    data,
    beforeData,
    currentData,
    type,
    contentStyle,
    labelStyle,
  } = props;
  const ext = useMemo(
    () => ({
      beforeData,
      currentData,
      type,
      path: fieldItem.path,
    }),
    [beforeData, currentData, type, fieldItem.path]
  );

  return (
    <div data-path={fieldItem.path} style={{ display: "flex" }}>
      <div style={labelStyle}>{getPathLabel(data, fieldItem.label, ext)}</div>
      <div style={contentStyle}>
        {getFieldContent(data, fieldItem.content, ext)}
      </div>
    </div>
  );
}

export default function Diff<T extends DataTypeBase>(props: {
  fieldItems: FieldItems<T>;
  beforeData: T;
  currentData: T;
  refreshKey?: number;
  colStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  style?: CSSProperties;
}) {
  const {
    fieldItems,
    beforeData,
    currentData,
    refreshKey = 0,
    colStyle = { width: "45%" },
    labelStyle = { width: "30%" },
    contentStyle = { width: "65%" },
    style,
  } = props;

  const isEqualMap = useMemo(() => {
    return getIsEqualMap(fieldItems);
  }, [fieldItems]);

  const { diffRes, alignedData1, alignedData2 } = useMemo(() => {
    return calcDiff(beforeData, currentData, isEqualMap);
  }, [beforeData, currentData, isEqualMap]);

  const beforeWrapperRef = useRef<HTMLDivElement>(null);
  const currentWrapperRef = useRef<HTMLDivElement>(null);

  const alignAndColorDoms = useCallback(() => {
    // 所有的path元素
    const beforeAllElements: NodeListOf<HTMLElement> =
      beforeWrapperRef.current?.querySelectorAll(`[data-path]`) ?? ([] as any);
    const currentAllElements: NodeListOf<HTMLElement> =
      currentWrapperRef.current?.querySelectorAll(`[data-path]`) ?? ([] as any);

    // path对应dom关系
    const beforeDataDomMap: Record<string, HTMLElement[]> = {};
    const currentDataDomMap: Record<string, HTMLElement[]> = {};

    // path对应的最高dom
    const pathMaxHeightMap: Record<string, number> = {};

    {
      // 统计beforeContainer里的path对应dom关系和max高度
      beforeAllElements.forEach((ele) => {
        const path = ele.getAttribute("data-path");
        if (path) {
          // 如果有子元素也需要diff对齐，则不对齐父亲高度
          const rect = ele.getBoundingClientRect();
          pathMaxHeightMap[path] = Math.max(
            pathMaxHeightMap[path] ?? 0,
            rect.height
          );

          if (beforeDataDomMap[path]) {
            beforeDataDomMap[path].push(ele);
          } else {
            beforeDataDomMap[path] = [ele];
          }
        }
      });
    }

    {
      // 统计currentContainer里的path对应dom关系和max高度
      currentAllElements.forEach((ele) => {
        const path = ele.getAttribute("data-path");
        if (path) {
          const rect = ele.getBoundingClientRect();
          pathMaxHeightMap[path] = Math.max(
            pathMaxHeightMap[path] ?? 0,
            rect.height
          );

          if (currentDataDomMap[path]) {
            currentDataDomMap[path].push(ele);
          } else {
            currentDataDomMap[path] = [ele];
          }
        }
      });
    }

    // 着色
    Object.entries(diffRes).forEach(([key, val]: [string, string]) => {
      const beforePathDomList = beforeDataDomMap[key];
      const currentPathDomList = currentDataDomMap[key];
      console.log("beforePathDomList", beforePathDomList);
      beforePathDomList?.forEach((dom) => {
        if (["CHANGED", "CREATED", "DELETED"].includes(val)) {
          dom.style.backgroundColor = "rgb(253, 226, 226)";
        }
      });
      currentPathDomList?.forEach((dom) => {
        if (["CHANGED", "CREATED", "DELETED"].includes(val)) {
          dom.style.backgroundColor = "rgb(217, 245, 214)";
        }
      });
    });
    // 对齐before高度
    beforeAllElements.forEach((ele) => {
      const path = ele.dataset.dataPath;
      // 如果有子元素也需要diff对齐，则不对齐父亲高度
      if (path && !ele.querySelectorAll(`[data-path]`).length) {
        const rect = ele.getBoundingClientRect();

        if (pathMaxHeightMap[path] > rect.height) {
          ele.style.paddingBottom =
            Number(getComputedStyle(ele).paddingBottom.slice(0, -2)) +
            pathMaxHeightMap[path] -
            rect.height +
            "px";
        }
      }
    });
    // 对齐current高度
    currentAllElements.forEach((ele) => {
      const path = ele.dataset.dataPath;
      // 如果有子元素也需要diff对齐，则不对齐父亲高度
      if (path && !ele.querySelectorAll(`[data-path]`).length) {
        const rect = ele.getBoundingClientRect();
        if (pathMaxHeightMap[path] > rect.height) {
          ele.style.paddingBottom =
            Number(getComputedStyle(ele).paddingBottom.slice(0, -2)) +
            pathMaxHeightMap[path] -
            rect.height +
            "px";
        }
      }
    });
  }, [diffRes, beforeWrapperRef, currentWrapperRef]);

  useEffect(() => {
    alignAndColorDoms();
  }, [diffRes, beforeWrapperRef, currentWrapperRef, refreshKey]);

  const [leftWidth, setLeftWidth] = useState<number>(500);
  const [oldLeftWidth, setOldLeftWidth] = useState<number>(500);
  const [dragStartEvent, setDragStartEvent] =
    useState<React.MouseEvent<HTMLDivElement, MouseEvent>>();
  const [isDragging, setIsDragging] = useState(false);
  const mainRef = useRef<any>(null);
  const handleMouseMove = throttle((e: MouseEvent) => {
    if (!isDragging || !dragStartEvent) return;
    setLeftWidth(oldLeftWidth - (dragStartEvent?.clientX - e.clientX));
  }, 16);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div style={{ ...style, display: "flex", border: "1px dashed gray" }}>
      <div
        style={{ marginRight: "4%", ...colStyle, width: leftWidth + "px" }}
        ref={beforeWrapperRef}
      >
        {fieldItems.map((field) => {
          return (
            <RenderFieldItem<T>
              key={field.path ?? "" + field.key}
              data={alignedData1}
              beforeData={alignedData1}
              currentData={alignedData2}
              contentStyle={contentStyle}
              labelStyle={labelStyle}
              fieldItem={field}
              type="before"
            />
          );
        })}
      </div>
      <div
        style={{
          backgroundColor: isDragging ? "blue" : "black",
          width: "5px",
          height: "50px",
          cursor: "col-resize",
          // flex: "1",
        }}
        ref={mainRef}
        onMouseDown={(e) => {
          setDragStartEvent(e);
          setIsDragging(true);
          setOldLeftWidth(leftWidth);
        }}
      ></div>
      <div style={{ ...colStyle, flex: 1 }} ref={currentWrapperRef}>
        {fieldItems.map((field) => {
          return (
            <RenderFieldItem
              key={field.path ?? "" + field.key}
              data={alignedData2}
              beforeData={alignedData1}
              currentData={alignedData2}
              contentStyle={contentStyle}
              labelStyle={labelStyle}
              fieldItem={field}
              type="current"
            />
          );
        })}
      </div>
    </div>
  );
}