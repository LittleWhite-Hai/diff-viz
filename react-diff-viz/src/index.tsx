import React, { ReactNode, useRef, useMemo, useEffect, useState } from "react";
import { calcDiffWithArrayAlign, applyDiff } from "../../src/index";
import {
  ExtType,
  DataTypeBase,
  IsEqualFuncType,
  VizItems,
  ContentType,
  LabelType,
  VizItem,
} from "./types";
import { headerBlueTipStyle, headerStyle, titleStyle } from "./styles";
import _, { throttle } from "lodash";

function getValueByPath(
  obj: Record<string, any>,
  path: string | undefined
): any {
  if (!path) {
    return obj;
  }
  return path.split(".").reduce((acc, key) => acc && acc[key], obj);
}

function getFieldPathMap<T extends DataTypeBase>(vizItems: VizItems<T>) {
  const isEqualMap: Record<string, IsEqualFuncType> = {};
  const arrayAlignLCSMap: Record<string, string> = {};
  const arrayAlignData2Map: Record<string, string> = {};
  const arrayNoAlignMap: Record<string, true> = {};

  vizItems.forEach((field) => {
    const path: string = field.path ?? "";
    if (field.isEqual && path) {
      isEqualMap[path] = field.isEqual;
    }
    if (typeof field.arrayKey === "string") {
      if (field.arrayAlignType === "data2") {
        arrayAlignData2Map[path + ".*"] = field.arrayKey;
      } else {
        arrayAlignLCSMap[path + ".*"] = field.arrayKey;
      }
    }
    if (field.arrayAlignType === "none") {
      arrayNoAlignMap[path + ".*"] = true;
    }
  });
  return {
    isEqualMap,
    arrayAlignLCSMap,
    arrayAlignData2Map,
    arrayNoAlignMap,
  };
}

function getFieldContent<T extends DataTypeBase>(
  data: any,
  content: ContentType<T>,
  arrayKey: string | undefined,
  ext: ExtType<T>
): ReactNode {
  if (!ext.path && !content) {
    return "";
  }
  if (content) {
    if (typeof arrayKey === "string" && typeof content === "function") {
      const res = content(getValueByPath(data, ext.path), data, ext) as any;
      if (res.map) {
        return res.map((i: any, idx: any) => (
          <div data-path={ext.path + "." + idx} key={ext.path + "." + idx}>
            {i}
          </div>
        ));
      } else {
        return res;
      }
    }
    if (typeof content === "function") {
      return content(getValueByPath(data, ext.path), data, ext);
    } else {
      return content;
    }
  } else {
    return getValueByPath(data, ext.path);
  }
}

// 根据path得到data对应的label
function getPathLabel<T extends DataTypeBase>(
  data: T | undefined,
  label: LabelType<T>,
  arrayKey: string | undefined,
  ext: ExtType<T>
): ReactNode {
  if (!data) {
    return typeof label === "string" ? label : "";
  }
  const curData = ext.path ? getValueByPath(data, ext.path) : undefined;
  if (typeof label === "function") {
    return label(curData, data, ext);
  } else {
    return label;
  }
}

function RenderFieldItem<T extends DataTypeBase>(props: {
  fieldItem: VizItem<T>;
  data: T;
  data1: T;
  data2: T;
  type: "data1" | "data2";
  contentStyle: React.CSSProperties;
  labelStyle: React.CSSProperties;
}): any {
  const { fieldItem, data, data1, data2, type, contentStyle, labelStyle } =
    props;
  const ext = useMemo(
    () => ({
      data1,
      data2,
      type,
      path: fieldItem.path,
    }),
    [data1, data2, type, fieldItem.path]
  );
  const NullContent = useMemo(() => {
    return (
      <div style={{ display: "flex" }}>
        <div
          style={{
            textAlign: "left",
            color: "gray",
            height: "min-content",
            ...labelStyle,
          }}
        ></div>
        <div
          style={{
            marginLeft: "10px",
            minWidth: "30%",
            ...contentStyle,
          }}
        >
          <div
            data-path={fieldItem.path}
            style={{
              textAlign: "left",
              paddingRight: "4px",
              borderRight: "4px solid transparent",
              marginBottom: "15px",
            }}
          ></div>
        </div>
      </div>
    );
  }, [labelStyle, contentStyle, fieldItem.path]);

  const isHeader = !fieldItem.path && !fieldItem.content;
  if (fieldItem.visible === false) {
    return <div data-path={fieldItem.path}></div>;
  }
  if (typeof fieldItem.visible === "function") {
    const visibleRes = fieldItem.visible(
      getValueByPath(data, ext.path),
      data,
      ext
    );
    const visibleRes1 = fieldItem.visible(
      getValueByPath(data1, ext.path),
      data1,
      ext
    );
    const visibleRes2 = fieldItem.visible(
      getValueByPath(data2, ext.path),
      data2,
      ext
    );
    if (!visibleRes1 && !visibleRes2) {
      return <div data-path={fieldItem.path}></div>;
    }
    if (visibleRes === false) {
      return NullContent;
    }
  }

  return isHeader ? (
    <div style={headerStyle}>
      <div style={headerBlueTipStyle}></div>
      {getPathLabel(data, fieldItem.label, fieldItem.arrayKey, ext)}
    </div>
  ) : (
    <div style={{ display: "flex" }}>
      <div
        style={{
          textAlign: "left",
          color: "gray",
          height: "min-content",
          ...labelStyle,
        }}
      >
        {getPathLabel(data, fieldItem.label, fieldItem.arrayKey, ext)}
      </div>
      <div style={{ marginLeft: "10px", ...contentStyle }}>
        <div
          // 染色和对齐高度(如果该dom有子元素也标记了data-path，则不染色和对齐高度)
          data-path={fieldItem.path}
          style={{
            textAlign: "left",
            paddingRight: "4px",
            borderRight: "4px solid transparent",
            marginBottom: "15px",
          }}
        >
          {getFieldContent(data, fieldItem.content, fieldItem.arrayKey, ext)}
        </div>
      </div>
    </div>
  );
}

/**
 * The Diff component is used to compare and display the differences between two sets of data
 *
 * @param
 * @param vizItems - Describes the rendering method and diff calculation method for the data
 * @param data1 - The first set of data for comparison
 * @param data2 - The second set of data for comparison
 * @param strictMode - Strict mode, enabled by default. When disabled, the diff algorithm ignores data type differences, e.g., 0="0"
 * @param singleMode - Only display data2
 * @param showTitle - Whether to display the title at the top
 * @param data1Title - Title for data1
 * @param data2Title - Title for data2
 * @param refreshKey - Change this key to trigger recoloring and height alignment
 * @param labelStyle - Style for each data label
 * @param contentStyle - Style for each data content
 * @param colStyle - Overall style for data1 and data2 columns(width only support px)
 * @param style - Style for the diff component(width only support px)
 * @returns react node component
 */
export default function DiffViz<T extends DataTypeBase>(props: {
  vizItems: VizItems<T>;
  data1?: T;
  data2: T;
  disableDiff?: boolean;
  strictMode?: boolean;
  singleMode?: boolean;
  showTitle?: boolean;
  data1Title?: string;
  data2Title?: string;
  refreshKey?: number;
  colStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
  style?: React.CSSProperties;
}) {
  const {
    vizItems,
    strictMode = true,
    singleMode = false,
    showTitle = false,
    disableDiff = false,
    refreshKey = 0,
    data1Title = "Before Data",
    data2Title = "Current Data",
    colStyle = {},
    labelStyle = { minWidth: "25%" },
    contentStyle = {},
    style = {},
  } = props;
  let { data1, data2 } = props;
  if (singleMode) {
    if (data1 && !data2) {
      data2 = data1;
    } else if (!data1 && data2) {
      data1 = data2;
    }
  }

  const [colWidth, width] = useMemo(() => {
    const width = parseInt(
      String(style.width ?? style.minWidth ?? style.maxWidth)
    );
    const colWidth = parseInt(
      String(colStyle.width ?? colStyle.minWidth ?? colStyle.maxWidth)
    );

    if (!isNaN(width) && width) {
      return [(width - 100) / 2, width];
    } else if (!isNaN(colWidth) && colWidth) {
      return [colWidth, colWidth * 2 + 100];
    }
    return [640, 1350];
  }, [colStyle, style]);

  const { diffRes, alignedData1, alignedData2 } = useMemo(() => {
    const {
      isEqualMap,
      arrayAlignLCSMap,
      arrayAlignData2Map,
      arrayNoAlignMap,
    } = getFieldPathMap(vizItems);
    console.log("arrayAlignLCSMap", arrayAlignLCSMap);
    const res = calcDiffWithArrayAlign({
      data1: data1,
      data2: data2,
      isEqualMap,
      arrayAlignLCSMap,
      arrayAlignData2Map,
      strictMode,
    });
    console.log("diff-res", res);
    return res;
  }, [data1, data2, vizItems, strictMode]);

  const wrapperRef1 = useRef<HTMLDivElement>(null);
  const wrapperRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyDiff({
      diffRes,
      domWrapper1: wrapperRef1.current,
      domWrapper2: wrapperRef2.current,
      disableColoringFather: true,
      disableAligning: disableDiff,
      disableColoring: disableDiff,
    });
  }, [diffRes, disableDiff, refreshKey]);

  const [leftWidth, setLeftWidth] = useState<number>(colWidth);

  const [oldLeftWidth, setOldLeftWidth] = useState<number>(colWidth);

  const [dragStartEvent, setDragStartEvent] =
    useState<React.MouseEvent<HTMLDivElement, MouseEvent>>();

  useEffect(() => {
    const handleMouseUp = () => {
      body!.style.cursor = "unset";
      body!.style.userSelect = "unset";
      setDragStartEvent(undefined);
    };
    const handleMouseMove = throttle((e: MouseEvent) => {
      if (!dragStartEvent) return;
      const leftWidth = oldLeftWidth - (dragStartEvent.clientX - e.clientX);
      setLeftWidth(Math.max(leftWidth, 0));
    }, 16);

    if (dragStartEvent) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragStartEvent]);

  const body = useMemo(() => document.querySelector("body"), []);

  return (
    <div
      style={{
        display: "flex",
        width: width + "px",
        ...style,
      }}
    >
      <div
        style={{
          marginLeft: "16px",
          marginRight: "6px",
          display: singleMode ? "none" : "block",
          minWidth: leftWidth + "px",
          maxWidth: leftWidth + "px",
          overflowX: "scroll",
        }}
      >
        <div
          style={{
            ...colStyle,
            width: colWidth + "px",
          }}
          ref={wrapperRef1}
        >
          {showTitle && <div style={titleStyle}>{data1Title}</div>}
          {data1 &&
            vizItems.map((field) => {
              const label =
                typeof field.label === "string" ? field.label : field.key ?? "";
              return (
                <RenderFieldItem<T>
                  key={field.path + label}
                  data={alignedData1}
                  data1={alignedData1}
                  data2={alignedData2}
                  contentStyle={contentStyle}
                  labelStyle={labelStyle}
                  fieldItem={field}
                  type="data1"
                />
              );
            })}
        </div>
      </div>
      <div
        style={{
          display: singleMode ? "none" : "",
          backgroundColor: dragStartEvent ? "rgb(83, 129, 238)" : "gray",
          cursor: "col-resize",
          flex: "1",
          maxWidth: "4px",
          minWidth: "4px",
        }}
        onMouseDown={(e) => {
          e.persist();
          setDragStartEvent(e);
          body!.style.cursor = "col-resize";
          body!.style.userSelect = "none";
          setOldLeftWidth(leftWidth);
        }}
      ></div>
      <div
        style={{
          marginLeft: "16px",
          marginRight: "6px",
          overflowX: "scroll",
        }}
      >
        <div
          style={{
            ...colStyle,
            width: colWidth + "px",
          }}
          ref={wrapperRef2}
        >
          {showTitle && <div style={titleStyle}>{data2Title}</div>}
          {data2 &&
            vizItems.map((field) => {
              const label =
                typeof field.label === "string" ? field.label : field.key ?? "";
              return (
                <RenderFieldItem
                  key={field.path + label}
                  data={alignedData2}
                  data1={alignedData1}
                  data2={alignedData2}
                  contentStyle={contentStyle}
                  labelStyle={labelStyle}
                  fieldItem={field}
                  type="data2"
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
