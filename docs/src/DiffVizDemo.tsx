import React, { useEffect, useState } from "react";
import "./App.css";
import Form from "./form";
import { Card, Link, Rate } from "@arco-design/web-react";
import _ from "lodash";

// !!!!! replace to: import DiffViz from "react-diff-viz";
import DiffViz from "../../react-diff-viz/dist/react-diff-viz";

const data1 = {
  name: "diff-viz",
  introduction:
    "diff-viz is a tool that compares and renders complex object differences",
  link: "https://github.com/LittleWhite-Hai/diff-viz",
  package_size: 43,
  create_time: [1727765900000, 2897765900000],
  npm_dependencies: ["react", "react-dom", "lodash"],
  build_tool: "rollup",
  tech_stack: ["frontend", "javascript", "react", "vue"],
  stars: 5,
  is_support_array: true,
  other_tools: [
    {
      name: "git diff",
      description: "diff git commits, highlight text changes",
    },
    {
      name: "microdiff",
      description:
        "Microdiff is a tiny, fast json diff tool, only offer diff algorithm",
    },
  ],
  data1: "Data used for comparison (usually the original data)",
  data2: "Data used for comparison (usually the new data)",
  vizItems:
    "Describes the data to be rendered, including diff method and rendering method",
  colStyle: "Overall style for the outer DOM of all data1 and data2",
  labelStyle: "Style for the label of each data item",
  contentStyle: "Style for the content of each data item",
  strictMode:
    "Strict mode, enabled by default. When disabled, the diff algorithm ignores data type differences, e.g., 0=null=undefined=false",
  singleMode: "Only view data2, default is false",
  refreshKey: "Change this key to trigger recoloring and height alignment",

  label:
    "Title of the data, if only label is provided, it renders a separator title",
  path: "Path of the data",
  visible: "If false, the item will not be displayed",
  isEqual: "User can customize the data diff algorithm",
  content: "Rendering method",
  arrayKey: "Key for arrays, used to mark this data as array type",
  arrayAlignType:
    "Array alignment method, default is longest common subsequence (lcs) alignment",
};
const data2 = _.cloneDeep(data1);
data2.create_time[1] = 2897465900000;
data2.stars = 4.5;
data2.other_tools.unshift({
  name: "diff-viz",
  description: "good at custom render",
});

export default function DiffDemo(props: { isZh: boolean }) {
  const [count, setCount] = useState(0);
  const [formVisible, setFormVisible] = useState(false);
  const [editedDataStr1, setEditedDataStr1] = useState(
    JSON.stringify(data1, null, 2)
  );
  const [editedData2, setEditedData2] = useState(data2);
  const [editedDataStr2, setEditedDataStr2] = useState(
    JSON.stringify(data2, null, 2)
  );
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    console.log("formData", editedData2);
    try {
      const res = JSON.parse(editedDataStr2);
      setEditedData2(res);
    } catch (e) {
      console.error(e);
    }
  }, [editedDataStr2]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "end",
          width: "1360px",
          marginBottom: "2px",
        }}
      >
        <div>
          <div style={{ display: "flex", justifyContent: "end" }}></div>

          <div style={{ display: "flex", justifyContent: "end" }}>
            <a
              onClick={(e) => {
                e.preventDefault();
                setFormVisible(!formVisible);
              }}
              style={{
                marginRight: "20px",
                cursor: "pointer",
                color: "#7dba2f",
              }}
            >
              {props.isZh ? "编辑数据" : "Edit Data"}
            </a>
            <a
              style={{
                cursor: "pointer",
                marginRight: "20px",
                color: "#7dba2f",
              }}
              onClick={(e) => {
                e.preventDefault();

                setDisable(!disable);
              }}
            >
              {props.isZh
                ? disable
                  ? "启用DIFF"
                  : "禁用DIFF"
                : disable
                ? "Enable DIFF"
                : "Disable DIFF"}
            </a>
            <a
              href="https://github.com/LittleWhite-Hai/diff-viz/blob/diff-viz/docs/src/DiffVizDemo.tsx"
              target="_blank"
              style={{
                color: "#7dba2f",
              }}
            >
              {props.isZh ? "查看源码" : "View Code"}
            </a>
          </div>
        </div>
      </div>
      <div
        style={{
          display: formVisible ? "flex" : "none",
          backgroundColor: "white",
          height: "800px",
          marginBottom: "4px",
          overflowY: "scroll",
          borderRadius: "8px",
          width: "1360px",
        }}
      >
        <textarea
          style={{
            height: "850px",
            width: "695px",
            marginRight: "4px",
          }}
          value={editedDataStr1}
          onChange={() => {}}
        ></textarea>
        <textarea
          style={{
            height: "850px",
            width: "695px",
          }}
          onChange={(e) => {
            setEditedDataStr2(e.target.value);
          }}
          value={editedDataStr2}
        ></textarea>
        <Form setFormData={setEditedData2} initialValues={data1} />
      </div>
      <DiffViz
        strictMode={false}
        data1={data1}
        data2={editedData2}
        refreshKey={count}
        singleMode={false}
        disableDiff={disable}
        vizItems={[
          { label: "Basic Information" },
          { label: "Component Name", path: "name" },
          { label: "Introduction", path: "introduction" },
          {
            label: "Link",
            path: "link",
            content: (v: any) => (
              <Link
                href={v}
                target="_blank"
                hoverable={false}
                onClick={() => {
                  open(v);
                }}
              >
                Click to Jump
              </Link>
            ),
          },
          {
            label: "Maintenance Time",
            path: "create_time",
            content: (v: any) => {
              if (v) {
                return (
                  <span>
                    <span data-path="create_time.0">
                      {new Date(v[0]).toLocaleDateString()}
                    </span>
                    <span> ~ </span>
                    <span data-path="create_time.1">
                      {new Date(v[1]).toLocaleDateString()}
                    </span>
                  </span>
                );
              }
            },
          },
          {
            label: "Package Size",
            path: "package_size",
            content: (v: any) => v + " kb",
          },
          {
            label: "Stars",
            path: "stars",
            content: (v: any) => <Rate value={v} readonly allowHalf />,
          },
          {
            label: "Npm Dependencies",
            path: "npm_dependencies",
            arrayAlignType: "none",
            content: (v: any) => v.join(", "),
          },
          {
            label: "Support Array Diff",
            path: "is_support_array",
            content: (v: any) => (v ? "Yes" : "No"),
          },
          { label: "Build Tool", path: "build_tool" },
          {
            label: "Tech Stack",
            path: "tech_stack",
            content: (v: any) => v?.join(", "),
          },

          {
            label: "Other Tools",
            path: "other_tools",
            arrayKey: "name",
            content: (v: any) =>
              v.map((item: any, idx: string) => (
                <div>
                  <Card
                    style={{ width: 360 }}
                    title={
                      <div data-path={`other_tools.${idx}.name`}>
                        {item?.name}
                      </div>
                    }
                    key={item?.name}
                    extra={<Link>More</Link>}
                  >
                    <div data-path={`other_tools.${idx}.description`}>
                      {item?.description}
                    </div>
                    <br />
                  </Card>
                  <div style={{ height: 10 }}></div>
                </div>
              )),
          },
          { label: "Diff Component API" },

          {
            label: "data1",
            path: "data1",
          },
          {
            label: "data2",
            path: "data2",
          },
          {
            label: "vizItems",
            path: "vizItems",
          },
          {
            label: "colStyle",
            path: "colStyle",
          },
          {
            label: "labelStyle",
            path: "labelStyle",
          },
          {
            label: "contentStyle",
            path: "contentStyle",
          },
          {
            label: "strictMode",
            path: "strictMode",
          },
          {
            label: "singleMode",
            path: "singleMode",
          },
          {
            label: "refreshKey",
            path: "refreshKey",
          },
          { label: "VizItems API" },
          {
            label: "label",
            path: "label",
          },
          {
            label: "path",
            path: "path",
          },
          {
            label: "visible",
            path: "visible",
          },
          {
            label: "isEqual",
            path: "isEqual",
          },
          {
            label: "content",
            path: "content",
          },
          {
            label: "arrayKey",
            path: "arrayKey",
          },
          {
            label: "arrayAlignType",
            path: "arrayAlignType",
          },
        ]}
        style={{
          border: "6px solid white",
          backgroundColor: "white",
          borderRadius: "8px",
        }}
      />
    </div>
  );
}
