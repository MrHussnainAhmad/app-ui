import { useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Modal, Form, Spinner, ButtonGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaPlus, FaLightbulb, FaQuestionCircle } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const MangaList = () => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMangas = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/manga');
      setMangas(data);
    } catch (error) {
      toast.error('Error fetching mangas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  const handleClose = () => {
      setShow(false);
      setTitle('');
      setDescription('');
      setCoverFile(null);
      setSubmitting(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (coverFile) {
        formData.append('coverImage', coverFile);
    }

    try {
      await api.post('/manga', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Manga created');
      handleClose();
      fetchMangas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating manga');
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all chapters and files!')) {
      try {
        await api.delete(`/manga/${id}`);
        toast.success('Manga deleted');
        fetchMangas();
      } catch (error) {
        toast.error('Error deleting manga');
      }
    }
  };

  return (
    <Container className="py-4">
      {/* Header & Actions */}
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <h1>Manga Library</h1>
        </Col>
        <Col md={6} className="text-end">
            <ButtonGroup className="me-2">
                <LinkContainer to="/manga/suggestions">
                    <Button variant="outline-warning">
                        <FaLightbulb /> Suggestions
                    </Button>
                </LinkContainer>
                <LinkContainer to="/manga/requests">
                    <Button variant="outline-info">
                        <FaQuestionCircle /> Requests
                    </Button>
                </LinkContainer>
            </ButtonGroup>
            <Button onClick={() => setShow(true)} variant="primary">
                <FaPlus /> Add New
            </Button>
        </Col>
      </Row>

      {/* List */}
      {loading ? (
          <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
          <Row xs={1} md={2} lg={4} className="g-4">
            {mangas.map((manga) => (
              <Col key={manga._id}>
                <Card className="h-100 shadow-sm">
                  <div style={{ position: 'relative', paddingTop: '150%', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
                      {manga.coverImage ? (
                          <Card.Img 
                            variant="top" 
                            src={manga.coverImage} 
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                      ) : (
                          <div className="d-flex align-items-center justify-content-center text-muted" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                              No Cover
                          </div>
                      )}
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-truncate" title={manga.title}>{manga.title}</Card.Title>
                    <Card.Text className="text-muted small text-truncate">
                      {manga.description || 'No description'}
                    </Card.Text>
                    <div className="mt-auto d-flex gap-2">
                        <LinkContainer to={`/manga/${manga._id}`}>
                            <Button variant="primary" size="sm" className="flex-grow-1">Manage</Button>
                        </LinkContainer>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(manga._id)}>Delete</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
      )}

      {/* Create Modal */}
      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton={!submitting}>
          <Modal.Title>Create New Manga</Modal.Title>
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
                disabled={submitting}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
                <Form.Label>Cover Image</Form.Label>
                <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files[0])}
                    disabled={submitting}
                />
                <Form.Text className="text-muted">
                    Recommended ratio 2:3 (e.g., 300x450px)
                </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                disabled={submitting}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MangaList;