import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaCogs, FaSave } from 'react-icons/fa';
import api from '../utils/api';

const Settings = () => {
    const [config, setConfig] = useState({
        mangaAppVersion: '',
        exchangeRatesAppVersion: '',
        letscodeCppVersion: '',
        letscodePythonBasicsVersion: '',
        letscodePythonBasics2Version: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/config');
            setConfig({
                mangaAppVersion: data.mangaAppVersion || '',
                exchangeRatesAppVersion: data.exchangeRatesAppVersion || '',
                letscodeCppVersion: data.letscodeCppVersion || '',
                letscodePythonBasicsVersion: data.letscodePythonBasicsVersion || '',
                letscodePythonBasics2Version: data.letscodePythonBasics2Version || ''
            });
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch settings.');
            toast.error('Failed to fetch settings.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setConfig({
            ...config,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.put('/config', config);
            toast.success('Settings updated successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to update settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <h1><FaCogs className="me-2" /> Settings</h1>
                </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={6}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white fw-bold">App Versions</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3" controlId="mangaAppVersion">
                                    <Form.Label>Manga App Version</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="mangaAppVersion"
                                        value={config.mangaAppVersion}
                                        onChange={handleChange}
                                        placeholder="e.g. 1.0.0"
                                    />
                                    <Form.Text className="text-muted">
                                        Version for the Manga application.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="exchangeRatesAppVersion">
                                    <Form.Label>Exchange Rates App Version</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="exchangeRatesAppVersion"
                                        value={config.exchangeRatesAppVersion}
                                        onChange={handleChange}
                                        placeholder="e.g. 1.2.0"
                                    />
                                    <Form.Text className="text-muted">
                                        Version for the Exchange Rates application.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="letscodeCppVersion">
                                    <Form.Label>Letscode C++ Version</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="letscodeCppVersion"
                                        value={config.letscodeCppVersion}
                                        onChange={handleChange}
                                        placeholder="e.g. 1.0.0"
                                    />
                                    <Form.Text className="text-muted">
                                        Version for the Letscode C++ application.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="letscodePythonBasicsVersion">
                                    <Form.Label>Letscode Python Basics Version</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="letscodePythonBasicsVersion"
                                        value={config.letscodePythonBasicsVersion}
                                        onChange={handleChange}
                                        placeholder="e.g. 1.0.0"
                                    />
                                    <Form.Text className="text-muted">
                                        Version for the Letscode Python Basics application.
                                    </Form.Text>
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="letscodePythonBasics2Version">
                                    <Form.Label>Letscode Python Basics 2 Version</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="letscodePythonBasics2Version"
                                        value={config.letscodePythonBasics2Version}
                                        onChange={handleChange}
                                        placeholder="e.g. 1.0.0"
                                    />
                                    <Form.Text className="text-muted">
                                        Version for the Letscode Python Basics 2 application.
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-grid">
                                    <Button variant="primary" type="submit" disabled={saving}>
                                        {saving ? <Spinner size="sm" animation="border" className="me-2" /> : <FaSave className="me-2" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Settings;
