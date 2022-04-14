import "./App.css";
import Graph from "./components/Graph";
import { useState, useEffect, createRef } from "react";

function App() {
  const [graphs, setGraphs] = useState([]);

  let graphRefs = {};

  useEffect(() => {
    const sse = new EventSource(
      "https://xcosblocks.fossee.org/api/instructions/get",
      { withCredentials: false }
    );
    sse.addEventListener("instruction", function (event) {
      let d = event.data.split(" ");
      console.log(event.data);
      if (d[0] == "reset") {
        setGraphs([]);
        graphRefs = {};
        return;
      }
      if (d[0] == "addData") {
        let id = d[1].split("=")[1];
        let x = d[2].split("=")[1];
        let y = d[3].split("=")[1];
        console.log(graphRefs);
        graphRefs[id].current.addPointToQueue(0, [0, x, y]);
        return;
      }
      if (d[0] == "addChart") {
        let id = d[1].split("=")[1];
        let type = d[2].split("=")[1];
        let xMin = d[3].split("=")[1];
        let xMax = d[4].split("=")[1];
        let yMin = d[5].split("=")[1];
        let yMax = d[6].split("=")[1];
        let data = {
          id: id,
          datapointType: type,
          // datapointTitle: "Chart 1",
          datapointXMin: xMin,
          datapointXMax: xMax,
          datapointYMin: yMin,
          datapointYMax: yMax,
        };
        addGraph(data);
        return;
      }
    });
    sse.addEventListener("done", function (event) {
      console.log("End the event source");
      sse.close();
    });
    sse.onerror = function (err) {
      console.error("EventSource failed:", err);
      sse.close();
    };
  }, []);

  const addGraph = (data) => {
    const myref = createRef(null);
    graphRefs[data.id] = myref;
    setGraphs((prev) => {
      return [
        ...prev,
        <Graph key={data.id} ref={myref} datapoint={data}></Graph>,
      ];
    });
  };

  return <div className="App">{graphs.map((graph) => graph)}</div>;
}

export default App;
