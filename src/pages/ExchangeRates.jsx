import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Alert, Button, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { FaSync, FaMoneyBillWave } from 'react-icons/fa';
import api from '../utils/api'; // Assuming api utility exists based on MangaList.jsx

const ExchangeRates = () => {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchRates = async () => {
        try {
            setLoading(true);
            const response = await api.get('/general/exchange-rates', {
                params: { _ts: Date.now() },
                headers: { 'Cache-Control': 'no-cache' },
            });
            setRates(Array.isArray(response.data) ? response.data : []);
            setError(null);
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Failed to fetch exchange rates.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleForceRefresh = async () => {
        try {
            setRefreshing(true);
            const refreshResponse = await api.post('/general/exchange-rates/refresh');
            const updatedCount = refreshResponse?.data?.updatedCount;
            toast.success(
                Number.isFinite(updatedCount)
                    ? `Exchange rates updated: ${updatedCount}`
                    : 'Exchange rates updated successfully!'
            );
            await fetchRates();
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || 'Failed to force refresh rates.';
            setError(message);
            toast.error(message);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    return (
        <Container className="py-4">
            {/* Header & Actions - Matching MangaList Style */}
            <Row className="mb-4 align-items-center">
                <Col md={8}>
                    <h1><FaMoneyBillWave className="me-2" /> Exchange Rates</h1>
                </Col>
                <Col md={4} className="text-end">
                    <Button
                        variant="primary"
                        onClick={handleForceRefresh}
                        disabled={refreshing}
                    >
                        {refreshing ? <Spinner size="sm" animation="border" className="me-2" /> : <FaSync className="me-2" />}
                        {refreshing ? 'Updating...' : 'Force Refresh'}
                    </Button>
                </Col>
            </Row>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Content Card */}
            <Card className="shadow-sm">
                <Card.Body>
                    {loading && rates.length === 0 ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <Table striped hover responsive className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Currency</th>
                                    <th>Rate (to USD)</th>
                                    <th className="text-end">Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rates.length > 0 ? (
                                    rates.map((rate) => (
                                        <tr key={rate._id}>
                                            <td className="fw-bold">{rate.currency}</td>
                                            <td>{rate.rate}</td>
                                            <td className="text-end text-muted">
                                                {new Date(rate.lastUpdated).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-muted">No exchange rates found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ExchangeRates;
