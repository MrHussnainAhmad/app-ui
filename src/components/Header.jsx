import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { LinkContainer } from 'react-router-bootstrap';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <LinkContainer to="/">
            <Navbar.Brand>Platform Admin</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <Button variant="outline-light" onClick={logout}>
                Logout
              </Button>
            ) : (
                <Nav.Link href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
