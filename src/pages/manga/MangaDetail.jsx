import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Table, Button, Container, Row, Col, Modal, Form, ProgressBar, Alert } from 'react-bootstrap';
import { FaTrash, FaArrowLeft, FaEdit } from 'react-icons/fa';
import api from '../../utils/api';
import axios from 'axios';
import { toast } from 'react-toastify';

const MangaDetail = () => {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  
  // Modal State
  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const mangaRes = await api.get(`/manga/${id}`);
      setManga(mangaRes.data);
      
      const chaptersRes = await api.get(`/manga/${id}/chapters`);
      setChapters(chaptersRes.data);
    } catch (error) {
      toast.error('Error fetching data');
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleClose = () => {
    setShow(false);
    setEditMode(false);
    setTitle('');
    setChapterNumber('');
    setFiles([]);
    setUploadProgress(0);
    setUploading(false);
  };

  const handleShowCreate = () => {
      setEditMode(false);
      setShow(true);
  };

  const handleShowEdit = (chapter) => {
      setEditMode(true);
      setSelectedChapterId(chapter._id);
      setTitle(chapter.title);
      setChapterNumber(chapter.chapterNumber || '');
      setShow(true);
  };

  const handleFileChange = (e) => {
      setFiles(Array.from(e.target.files));
  };

  const uploadToCloudinary = async (file, signatureData, folderPath, index) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('signature', signatureData.signature);
      // Skip folder to avoid signature issues on client upload
      
      const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`;
      
      const { data } = await axios.post(url, formData);
      return {
          path: data.secure_url,
          publicId: data.public_id,
          filename: file.name,
          originalName: file.name,
          mimetype: file.type,
          size: file.size,
          index: index
      };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);

    try {
        let uploadedFilesData = [];

        // 1. If files selected, Upload to Cloudinary DIRECTLY
        if (files.length > 0) {
            // Get Signature
            const { data: signatureData } = await api.get('/manga/upload-signature');
            
            // Upload in Parallel
            const totalFiles = files.length;
            let completed = 0;

            const uploadPromises = files.map(async (file, index) => {
                const result = await uploadToCloudinary(file, signatureData, '', index);
                completed++;
                setUploadProgress(Math.round((completed / totalFiles) * 100));
                return result;
            });

            uploadedFilesData = await Promise.all(uploadPromises);
        }

        // 2. Send Metadata to Backend
        const payload = {
            title,
            chapterNumber,
            files: uploadedFilesData.length > 0 ? uploadedFilesData : undefined // Only send if new files
        };

        if (editMode) {
            await api.put(`/manga/chapter/${selectedChapterId}`, payload);
            toast.success('Chapter updated');
        } else {
            await api.post(`/manga/${id}/chapter`, payload);
            toast.success('Chapter created');
        }

        handleClose();
        fetchData();
    } catch (error) {
        console.error(error);
        toast.error('Error uploading chapter: ' + (error.response?.data?.message || error.message));
        setUploading(false);
    }
  };

  const handleDelete = async (chapterId) => {
      if (window.confirm('Delete this chapter?')) {
          try {
              await api.delete(`/manga/chapter/${chapterId}`);
              toast.success('Chapter deleted');
              fetchData();
          } catch (error) {
              toast.error('Error deleting chapter');
          }
      }
  };

  if (!manga) return <Container className="py-4">Loading...</Container>;

  return (
    <Container className="py-4">
      <Link to="/" className='btn btn-outline-secondary mb-3'><FaArrowLeft /> Back</Link>
      
      <Row className="mb-4">
        <Col>
          <h2>{manga.title}</h2>
          <p className="text-muted">{manga.description}</p>
        </Col>
        <Col className="text-end">
            <Button onClick={handleShowCreate}>Add Chapter</Button>
        </Col>
      </Row>

      <Table striped bordered hover>
          <thead>
              <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Files</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              {chapters.map(chapter => (
                  <tr key={chapter._id}>
                      <td>{chapter.chapterNumber}</td>
                      <td>{chapter.title}</td>
                      <td>{chapter.contentType}</td>
                      <td>{chapter.files?.length || 0}</td>
                      <td>
                          <Button variant="warning" size="sm" className="me-2" onClick={() => handleShowEdit(chapter)}>
                              <FaEdit />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(chapter._id)}>
                              <FaTrash />
                          </Button>
                      </td>
                  </tr>
              ))}
              {chapters.length === 0 && <tr><td colSpan="5" className="text-center">No chapters found</td></tr>}
          </tbody>
      </Table>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={!uploading}>
        <Modal.Header closeButton={!uploading}>
          <Modal.Title>{editMode ? 'Edit Chapter' : 'Add Chapter'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Chapter Title</Form.Label>
              <Form.Control 
                required
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Chapter Number</Form.Label>
              <Form.Control 
                type="number" 
                value={chapterNumber} 
                onChange={(e) => setChapterNumber(e.target.value)}
                disabled={uploading}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
                <Form.Label>Content (PDF or Images)</Form.Label>
                <Form.Control 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    disabled={uploading}
                />
                <Form.Text className="text-muted">
                    {editMode ? 'Uploading new files will replace existing content.' : 'Select one PDF or multiple images.'}
                </Form.Text>
            </Form.Group>

            {uploading && (
                <div className="mt-3">
                    <p>Uploading... {uploadProgress}%</p>
                    <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} animated />
                    <Alert variant="info" className="mt-2">Please do not close this window.</Alert>
                </div>
            )}

          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={uploading}>
              {editMode ? 'Update' : 'Upload'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default MangaDetail;
