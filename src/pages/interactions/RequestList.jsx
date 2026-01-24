import { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/manga/interactions/requests');
      setRequests(data);
    } catch (error) {
      toast.error('Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this request?')) {
      try {
        await api.delete(`/manga/interactions/requests/${id}`);
        toast.success('Deleted');
        fetchRequests();
      } catch (error) {
        toast.error('Error deleting');
      }
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h1>User Requests</h1>
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r._id}>
              <td>{r.title}</td>
              <td>{r.description}</td>
              <td>{r.status}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(r._id)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
       {requests.length === 0 && !loading && <p>No requests found.</p>}
    </Container>
  );
};

export default RequestList;
