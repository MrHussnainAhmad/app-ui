import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaBookOpen, FaFilm, FaMoneyBillWave } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <Container className="py-5">
      <h1 className="mb-4">Project Dashboard</h1>
      <Row className="g-4">
        {/* Manga Manager */}
        <Col md={4}>
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <FaBookOpen size={50} className="mb-3 text-primary" />
              <Card.Title>Manga Manager</Card.Title>
              <Card.Text>
                Manage manga titles, chapters, and user interactions.
              </Card.Text>
              <LinkContainer to="/manga">
                <Button variant="primary">Go to Manga</Button>
              </LinkContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Exchange Rates */}
        <Col md={4}>
          <Card className="h-100 text-center shadow-sm">
            <Card.Body>
              <FaMoneyBillWave size={50} className="mb-3 text-success" />
              <Card.Title>Exchange Rates</Card.Title>
              <Card.Text>
                View and update currency exchange rates.
              </Card.Text>
              <LinkContainer to="/exchange-rates">
                <Button variant="success">View Rates</Button>
              </LinkContainer>
            </Card.Body>
          </Card>
        </Col>

        {/* Placeholder for future MovieBox */}
        <Col md={4}>
          <Card className="h-100 text-center shadow-sm opacity-50">
            <Card.Body>
              <FaFilm size={50} className="mb-3 text-secondary" />
              <Card.Title>MovieBox</Card.Title>
              <Card.Text>
                Manage movies and series (Coming Soon).
              </Card.Text>
              <Button variant="secondary" disabled>Coming Soon</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
