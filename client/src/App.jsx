import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React from "react";
import Header from "./components/Header";
import DataChart from "./components/DataChart";
import LatestDataTable from "./components/LatestDataTable";
import Alarms from "./components/Alarms";

import { BrowserRouter, Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Header></Header>
        <Routes>
          <Route path="/chart" Component={DataChart}></Route>
          <Route path="/latest" Component={LatestDataTable}></Route>
          <Route path="/alarms" Component={Alarms}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
