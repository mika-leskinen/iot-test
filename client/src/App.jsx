import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import React from "react";
import LatestDataTable from "./components/LatestDataTable";
import Header from "./components/Header";

const App = () => {
  return (
    <>
      <Header></Header>
      <LatestDataTable></LatestDataTable>
    </>
  );
};

export default App;
