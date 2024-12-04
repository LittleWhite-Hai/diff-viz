import DiffDemo from "./DiffVizDemo.tsx";
// import DiffFuncDemo from "./DiffFuncDemo.tsx";
import "./index.css";
import React, { useEffect, useState } from "react";
import { Card, Typography } from "antd";
import { DiffVizFQA, DiffFuncFQA } from "./FQA.tsx";
import CodeExample from "./CodeExample.tsx";
const { Title } = Typography;

export default function Demo() {
  const [count, setCount] = useState(0);
  const [showDiffFunc, setShowDiffFunc] = useState(false);
  useEffect(() => {
    setCount(count + 1);
  }, [showDiffFunc]);
  return (
    <div style={{ width: "100%", margin: "0 auto" }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "95%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <h1 style={{ marginTop: "10px" }}> </h1>
            <div style={{ marginTop: "10px", display: "flex" }}>
              <div style={{ marginLeft: "30px" }}>
                <a
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    open("https://github.com/LittleWhite-Hai/diff-viz");
                  }}
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 496 512"
                    focusable="false"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      marginTop: "8px",
                      width: "35px",
                      height: "35px",
                      display: "inline-block",
                      lineHeight: "1em",
                      flexShrink: 0,
                      marginRight: "30px",
                      color: "ButtonText",
                    }}
                  >
                    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                  </svg>
                </a>
                <a
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.preventDefault();
                    open("https://www.npmjs.com/package/diff-viz");
                  }}
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 576 512"
                    focusable="false"
                    style={{
                      marginTop: "8px",
                      width: "35px",
                      height: "35px",
                      display: "inline-block",
                      lineHeight: "1em",
                      flexShrink: 0,
                      color: "ButtonText",
                    }}
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M288 288h-32v-64h32v64zm288-128v192H288v32H160v-32H0V160h576zm-416 32H32v128h64v-96h32v96h32V192zm160 0H192v160h64v-32h64V192zm224 0H352v128h64v-96h32v96h32v-96h32v96h32V192z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          width: "1350px",
          margin: "auto",
          display: "flex",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontWeight: "400",
            marginRight: "22%",
          }}
        >
          <Title level={2} style={{ marginTop: "0px" }}>
            Diff-Viz
          </Title>
          <Card
            title="组件式接入: <DiffViz />"
            bordered={false}
            style={{
              marginBottom: "20px",
              background: showDiffFunc ? "" : "#b6d78e",
              cursor: "pointer",
            }}
            onClick={() => setShowDiffFunc(false)}
          >
            React 组件，使用方式较简单，会接管总体布局样式，并允许调整样式
          </Card>
          <Card
            title="函数式接入: calcDiff() + applyDiff()"
            bordered={false}
            style={{
              marginBottom: "20px",
              cursor: "pointer",
              background: showDiffFunc ? "#b6d78e" : "",
            }}
            onClick={() => setShowDiffFunc(true)}
          >
            需要在 dom 上标记数据路径，好处是你可以完全控制布局， React 和 Vue
            都适用
          </Card>
        </div>
        <Title level={2} style={{ marginTop: "150px", width: "400px" }}>
          自定义样式的同时
          <br />
          渲染 JSON 差异
        </Title>
      </div>
      <div
        style={{
          display: showDiffFunc ? "none" : "block",
          width: "1350px",
          margin: "auto",
        }}
      >
        <DiffDemo />

        <Title level={2} style={{ marginTop: "80px" }}>
          接入方式
        </Title>
        <div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                width: "400px",
                marginRight: "20px",
              }}
            >
              <Title level={4}>第一步</Title>
              <div style={{ fontSize: "20px" }}>
                定义vizItems
                <br />
                描述待渲染的数据，以及自定义的渲染方法
              </div>
            </div>
            <CodeExample1 />
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div
            style={{
              width: "400px",
              marginRight: "20px",
            }}
          >
            <Title level={4}>第二步</Title>
            <div style={{ fontSize: "20px" }}>
              将data1，data2，及vizItems传入Diff组件
              <br />
              <br />
              <br />
              完成！
            </div>
          </div>
          <CodeExample2 />
        </div>

        <Title level={2}>FAQ</Title>
        <DiffVizFQA />
      </div>
      <div
        style={{
          display: showDiffFunc ? "block" : "none",
          width: "1410px",
          margin: "auto",
        }}
      >
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          {/* <DiffFuncDemo count={count} /> */}
        </div>

        <div style={{ display: "flex", marginTop: "80px" }}>
          <div
            style={{
              paddingLeft: "20px",
              paddingRight: "20px",
              width: "400px",
            }}
          >
            <Title level={2} style={{}}>
              接入方式
            </Title>

            <Title level={4}>
              第一步
              <br />
            </Title>
            <div style={{ fontSize: "20px" }}>使用calcDiff函数计算数据差异</div>
            <Title level={4}>
              第二步
              <br />
            </Title>
            <div style={{ fontSize: "20px" }}>
              给dom标注染色及对齐高度
              <br />
              需要在你的组件整体绑定ref，将ref传给applyDiff函数
            </div>
          </div>
          <CodeExample3 />
        </div>
        <div>
          <div style={{ display: "flex" }}>
            <div
              style={{
                paddingLeft: "20px",
                paddingRight: "20px",
                width: "400px",
              }}
            >
              <Title level={4}>
                第三步
                <br />
              </Title>
              <div style={{ fontSize: "20px" }}>
                调整渲染数据的组件，在数据dom上标注对应的data-path
                <br />
                <br />
                <br />
                <br />
                完成！
              </div>
            </div>
            <CodeExample4 />
          </div>
          <Title level={2}>FAQ</Title>
          <DiffFuncFQA />
        </div>
      </div>
    </div>
  );
}
function CodeExample1() {
  return (
    <CodeExample
      code={`const vizItems = [
  { label: 'Basic Information' },
  { label: 'Component Name', path: 'name' },
  { label: 'Introduction', path: 'info.introduction' },
  {
    label: 'Link',
    path: 'link',
    content: (v: any) => <Link href={v}>Click to Jump</Link>,
  },
];`}
    />
  );
}
function CodeExample2() {
  return (
    <CodeExample
      code={`const data1 = {
  "name": "Jack",
  "info": {
      "introduction": "is a tool"
  },
  "link": "www.xxx.com"
}
const data2 = {...data1, name:"Tom"}

import DiffViz from 'diff-viz';

return <DiffViz data1={data1} data2={data2} vizItems={vizItems} />;
`}
    />
  );
}

function CodeExample3() {
  return (
    <CodeExample
      lineProps={(lineNumber) => ({
        style: {
          display: "block",
          backgroundColor:
            lineNumber == 6 || lineNumber == 7 ? "#ffeb3b40" : "", // 这里设置你想要高亮的行号范围
        },
      })}
      code={`import { diff, applyDiff } from "diff-viz";
const ref1 = useRef<HTMLDivElement>(null)
const ref2 = useRef<HTMLDivElement>(null)

useEffect(() => {
  const diffRes = calcDiff({ data1, data2 });
  applyDiff({ diffRes, ref1, ref2 });
}, [data1, data2]);

return (
  <>
    <div ref={ref1}>
      <RenderData data={data1} /> {/* 你的业务代码,渲染数据1 */}
    </div>
    <div ref={ref2}>
      <RenderData data={data2} /> {/* 你的业务代码,渲染数据2 */}
    </div>
  </>
);`}
    />
  );
}
function CodeExample4() {
  return (
    <CodeExample
      lineProps={(lineNumber) => ({
        style: {
          display: "block",
          backgroundColor:
            lineNumber == 6 || lineNumber == 9 || lineNumber == 12
              ? "#ffeb3b40"
              : "", // 这里设置你想要高亮的行号范围
        },
      })}
      code={`// 假设<RenderData />是你的渲染数据的组件
  function RenderData(props) {
    return (
      <div>
        ...
        <div data-path="cardData">
          {RenderCard(props.data.cardData)}
        </div>
        <div data-path="table.tableData">
          {RenderTable(props.data.table.tableData)}
        </div>
        <div data-path="dateData">
          {RenderDate(props.data.dateData)}
        </div>
        ...
      </div>
    );
  }`}
    />
  );
}
