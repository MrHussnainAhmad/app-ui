import { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col, Modal, Form } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const MangaList = () => {
  const [mangas, setMangas] = useState([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const fetchMangas = async () => {
    try {
      const { data } = await api.get('/');
      setMangas(data);
    } catch (error) {
      toast.error('Error fetching mangas');
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/', { title, description });
      toast.success('Manga created');
      setShow(false);
      setTitle('');
      setDescription('');
      fetchMangas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating manga');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all chapters and files!')) {
      try {
        await api.delete(`/${id}`);
        toast.success('Manga deleted');
        fetchMangas();
      } catch (error) {
        toast.error('Error deleting manga');
      }
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-3">
        <Col>
          <h1>Manga Library</h1>
        </Col>
        <Col className="text-end">
          <Button onClick={() => setShow(true)}>
            <FaPlus /> Add New Manga
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Chapters</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mangas.map((manga) => (
            <tr key={manga._id}>
              <td>{manga.title}</td>
              <td>{manga.slug}</td>
              <td>
                <LinkContainer to={`/manga/${manga._id}`}>
                    <Button variant='info' size='sm'><FaEye/> Manage Chapters</Button>
                </LinkContainer>
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleDelete(manga._id)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Manga</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                required
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MangaList;
