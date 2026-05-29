import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Spinner,
  Table,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCopy, FaPlus, FaSave } from 'react-icons/fa';
import api from '../utils/api';

const Settings = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [newAppName, setNewAppName] = useState('');
  const [newAppVersion, setNewAppVersion] = useState('1.0.0');

  const appBaseUrl = useMemo(() => {
    const configured =
      import.meta.env.VITE_API_DEPLOY_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      'https://app-backend-kappa-sandy.vercel.app';
    return configured.replace(/\/+$/, '').replace(/\/p(\/manga)?$/, '');
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/config/apps');
      setApps(data.map((item) => ({ ...item, draftVersion: item.version || '' })));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load apps.');
      toast.error('Failed to load apps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!newAppName.trim()) {
      toast.error('Please enter app name.');
      return;
    }

    try {
      setCreating(true);
      await api.post('/config/apps', {
        name: newAppName.trim(),
        version: (newAppVersion || '1.0.0').trim(),
      });

      toast.success('App created.');
      setNewAppName('');
      setNewAppVersion('1.0.0');
      fetchApps();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create app.');
    } finally {
      setCreating(false);
    }
  };

  const handleVersionChange = (id, value) => {
    setApps((prev) =>
      prev.map((app) => (app._id === id ? { ...app, draftVersion: value } : app))
    );
  };

  const handleSaveVersion = async (app) => {
    try {
      setSavingId(app._id);
      await api.put(`/config/apps/${app._id}`, { version: app.draftVersion });
      toast.success(`${app.name} version updated.`);
      fetchApps();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update version.');
    } finally {
      setSavingId('');
    }
  };

  const handleCopyApi = async (slug) => {
    const endpoint = `${appBaseUrl}/p/config/apps/${slug}/version`;
    try {
      await navigator.clipboard.writeText(endpoint);
      toast.success('Version API copied.');
    } catch (err) {
      console.error(err);
      toast.error('Copy failed.');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1>App Versions</h1>
          <p className="text-muted mb-0">
            Create apps live here, update versions, and copy version-test APIs for client apps.
          </p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="fw-bold">Create App</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateApp}>
                <Form.Group className="mb-3">
                  <Form.Label>App Name</Form.Label>
                  <Form.Control
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="e.g. My Learning App"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Initial Version</Form.Label>
                  <Form.Control
                    value={newAppVersion}
                    onChange={(e) => setNewAppVersion(e.target.value)}
                    placeholder="e.g. 1.0.0"
                  />
                </Form.Group>

                <Button type="submit" disabled={creating}>
                  {creating ? <Spinner size="sm" animation="border" className="me-2" /> : <FaPlus className="me-2" />}
                  Create App
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="fw-bold">Manage Versions</Card.Header>
        <Card.Body className="p-0">
          <Table responsive className="mb-0 align-middle">
            <thead>
              <tr>
                <th>App Name</th>
                <th>Slug</th>
                <th>Version</th>
                <th>Version API</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {apps.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    No apps yet. Create your first app above.
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr key={app._id}>
                    <td>{app.name}</td>
                    <td>
                      <code>{app.slug}</code>
                    </td>
                    <td style={{ minWidth: 200 }}>
                      <Form.Control
                        value={app.draftVersion || ''}
                        onChange={(e) => handleVersionChange(app._id, e.target.value)}
                        placeholder="1.0.0"
                      />
                    </td>
                    <td style={{ minWidth: 340 }}>
                      <InputGroup>
                        <Form.Control
                          readOnly
                          value={`${appBaseUrl}/p/config/apps/${app.slug}/version`}
                        />
                        <Button variant="outline-secondary" onClick={() => handleCopyApi(app.slug)}>
                          <FaCopy />
                        </Button>
                      </InputGroup>
                    </td>
                    <td>
                      <Button
                        onClick={() => handleSaveVersion(app)}
                        disabled={savingId === app._id}
                      >
                        {savingId === app._id ? (
                          <Spinner size="sm" animation="border" className="me-2" />
                        ) : (
                          <FaSave className="me-2" />
                        )}
                        Save
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Settings;
