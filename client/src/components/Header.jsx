import React from "react";
import { Navbar, Container } from "react-bootstrap";

const apiUrl = (import.meta.env.VITE_API_BASE_URL || "") + "/api/timeseries";

const Header = () => {
  return (
    <Navbar className="justify-content-end mb-5">
      <Navbar.Text>
        API URL: <a href={apiUrl}>{apiUrl}</a>
      </Navbar.Text>
    </Navbar>
  );
};

export default Header;
