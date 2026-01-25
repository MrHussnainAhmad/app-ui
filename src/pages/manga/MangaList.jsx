import { useCallback, useEffect, useState } from 'react';
import { Card, Button, Container, Row, Col, Modal, Form, Spinner, ButtonGroup, InputGroup } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaPlus, FaLightbulb, FaQuestionCircle, FaStar, FaEdit } from 'react-icons/fa';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const MangaList = () => {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genresList, setGenresList] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');

  // Modal State
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [badge, setBadge] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchGenres = useCallback(async () => {
    try {
      const { data } = await api.get('/manga/genres');
      setGenresList(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchMangas = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedGenre ? `/manga?genre=${encodeURIComponent(selectedGenre)}` : '/manga';
      const { data } = await api.get(url);
      setMangas(data);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching mangas');
    } finally {
      setLoading(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  useEffect(() => {
    fetchMangas();
  }, [fetchMangas]);

  const handleClose = () => {
    setShow(false);
    setTitle('');
    setDescription('');
    setGenres('');
    setBadge('');
    setCoverFile(null);
    setSubmitting(false);
    setEditId(null);
  };

  const handleEdit = (manga) => {
    setEditId(manga._id);
    setTitle(manga.title);
    setDescription(manga.description || '');
    setGenres(manga.genres ? manga.genres.join(', ') : '');
    setBadge(manga.badge || '');
    setShow(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('genres', genres);
    formData.append('badge', badge);
    if (coverFile) {
      formData.append('coverImage', coverFile);
    }

    try {
      if (editId) {
        await api.put(`/manga/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Manga updated');
      } else {
        await api.post('/manga', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Manga created');
      }
      handleClose();
      fetchMangas();
      fetchGenres();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error saving manga');
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all chapters and files!')) {
      try {
        await api.delete(`/manga/${id}`);
        toast.success('Manga deleted');
        fetchMangas();
      } catch (err) {
        console.error(err);
        toast.error('Error deleting manga');
      }
    }
  };

  return (
    <Container className="py-4">
      {/* Header & Actions */}
      <Row className="mb-4 align-items-center">
        <Col md={4}>
          <h1>Manga Library</h1>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genresList.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4} className="text-end">
          <ButtonGroup className="me-2">
            <LinkContainer to="/manga/suggestions">
              <Button variant="outline-warning" size="sm">
                <FaLightbulb /> Suggestions
              </Button>
            </LinkContainer>
            <LinkContainer to="/manga/requests">
              <Button variant="outline-info" size="sm">
                <FaQuestionCircle /> Requests
              </Button>
            </LinkContainer>
          </ButtonGroup>
          <Button onClick={() => setShow(true)} variant="primary" size="sm">
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
                  <div className="d-flex justify-content-between align-items-start">
                    <Card.Title className="text-truncate" title={manga.title}>{manga.title}</Card.Title>
                    {manga.badge && <span className="badge bg-warning text-dark ms-2">{manga.badge}</span>}
                  </div>
                  <div className="mb-2">
                    {manga.genres && manga.genres.map(g => (
                      <span key={g} className="badge bg-secondary me-1" style={{ fontSize: '0.65rem' }}>{g}</span>
                    ))}
                  </div>
                  <div className="mb-2 text-warning d-flex align-items-center" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <FaStar className="me-1" />
                    {manga.rating ? manga.rating.toFixed(1) : 'New'}
                    <span className="text-muted ms-1 fw-normal">({manga.numReviews || 0} reviews)</span>
                  </div>
                  <Card.Text className="text-muted small text-truncate">
                    {manga.description || 'No description'}
                  </Card.Text>
                  <div className="mt-auto d-flex gap-2">
                    <Button variant="outline-primary" size="sm" onClick={() => handleEdit(manga)}>
                      <FaEdit />
                    </Button>
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
          <Modal.Title>{editId ? 'Edit Manga' : 'Create New Manga'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
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
            </Form.Group>



            <Form.Group className="mb-3">
              <Form.Label>Badge (Optional)</Form.Label>
              <Form.Select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                disabled={submitting}
              >
                <option value="">None</option>
                <option value="New">New</option>
                <option value="Featured">Featured</option>
                <option value="Best Read">Best Read</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Genres (comma separated)</Form.Label>
              <Form.Control
                type="text"
                value={genres}
                placeholder="Action, Isekai, Romance"
                onChange={(e) => setGenres(e.target.value)}
                disabled={submitting}
              />
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
