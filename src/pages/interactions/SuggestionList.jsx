import { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { FaTrash, FaEnvelope } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const SuggestionList = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    try {
      const { data } = await api.get('/manga/interactions/suggestions');
      setSuggestions(data);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this suggestion?')) {
      try {
        await api.delete(`/manga/interactions/suggestions/${id}`);
        toast.success('Deleted');
        fetchSuggestions();
      } catch (err) {
        console.error(err);
        toast.error('Error deleting');
      }
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h1>User Suggestions</h1>
        </Col>
      </Row>

      <Row xs={1} md={2} lg={3} className="g-4">
          {suggestions.map(s => (
              <Col key={s._id}>
                  <Card className="h-100 shadow-sm">
                      {s.images && s.images.length > 0 && (
                          <Card.Img variant="top" src={s.images[0].path} style={{ height: '200px', objectFit: 'cover' }} />
                      )}
                      <Card.Body>
                          <Card.Title>{s.title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">{s.genre}</Card.Subtitle>
                          <Card.Text>{s.description}</Card.Text>
                          <hr />
                          <div className="d-flex align-items-center mb-2">
                              <FaEnvelope className="me-2" /> 
                              <a href={`mailto:${s.email}`}>{s.email}</a>
                          </div>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(s._id)}><FaTrash /> Dismiss</Button>
                      </Card.Body>
                  </Card>
              </Col>
          ))}
      </Row>
      {suggestions.length === 0 && !loading && <p>No suggestions found.</p>}
    </Container>
  );
};

export default SuggestionList;
