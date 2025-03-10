import React from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const apiUrl = (import.meta.env.VITE_API_BASE_URL || "") + "/api/timeseries";

const Header = () => {
  const navigate = useNavigate();

  return (
    <Navbar collapseOnSelect expand="lg">
      <Navbar.Collapse id="responsive-navbar-nav">
        <Container className="justify-content-start mb-5">
          <Navbar.Text>
            <Button
              variant="secondary"
              className="me-4"
              onClick={() => navigate("/chart")}
            >
              Chart
            </Button>
          </Navbar.Text>
          <Navbar.Text>
            <Button
              variant="secondary"
              className="me-4"
              onClick={() => navigate("/latest")}
            >
              Latest
            </Button>
          </Navbar.Text>
          <Navbar.Text>
            <Button
              variant="secondary"
              className="me-4"
              onClick={() => navigate("/alarms")}
            >
              Alarms
            </Button>
          </Navbar.Text>
        </Container>
        <Container className="justify-content-end mb-5">
          <Navbar.Text>
            API URL: <a href={apiUrl}>{apiUrl}</a>
          </Navbar.Text>
        </Container>
      </Navbar.Collapse>
      <Navbar.Toggle aria-controls="responsive-navbar-nav"></Navbar.Toggle>
    </Navbar>
  );
};

export default Header;
