import React from "react";
import { Navbar, Container, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const apiUrl = (import.meta.env.VITE_API_BASE_URL || "") + "/api/timeseries";

const Header = () => {
  const navigate = useNavigate();

  return (
    <Navbar collapseOnSelect expand="lg" className="w-100 p-0 m-0 pb-5">
      <Navbar.Collapse id="responsive-navbar-nav">
        <Container className="justify-content-center">
          <Row>
            <Col>
              <Navbar.Text>
                <Button
                  variant="secondary"
                  className="w-100"
                  onClick={() => navigate("/chart")}
                >
                  Chart
                </Button>
              </Navbar.Text>
            </Col>
            <Col>
              <Navbar.Text>
                <Button
                  variant="secondary"
                  className="w-100"
                  onClick={() => navigate("/latest")}
                >
                  Latest
                </Button>
              </Navbar.Text>
            </Col>
            <Col>
              <Navbar.Text>
                <Button
                  variant="secondary"
                  className="w-100"
                  onClick={() => navigate("/alarms")}
                >
                  Alarms
                </Button>
              </Navbar.Text>
            </Col>
          </Row>
        </Container>
        <Container>
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
