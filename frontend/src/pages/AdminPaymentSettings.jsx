import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminPaymentSettings = () => {
  const [paymentQRs, setPaymentQRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPaymentQRs();
  }, []);

  const fetchPaymentQRs = async () => {
    try {
      const response = await axios.get('/api/admin/payment-qrs');
      setPaymentQRs(response.data);
    } catch (error) {
      console.error('Error fetching payment QRs:', error);
      toast.error('Failed to load payment QR settings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('qrImage', file);

    setUploading(true);
    try {
      await axios.post('/api/admin/payment-qrs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Payment QR uploaded successfully');
      fetchPaymentQRs();
    } catch (error) {
      console.error('Error uploading QR:', error);
      toast.error('Failed to upload payment QR');
    } finally {
      setUploading(false);
    }
  };

  const deleteQR = async (id) => {
    if (!window.confirm('Are you sure you want to delete this QR code?')) return;

    try {
      await axios.delete(`/api/admin/payment-qrs/${id}`);
      toast.success('Payment QR deleted successfully');
      fetchPaymentQRs();
    } catch (error) {
      console.error('Error deleting QR:', error);
      toast.error('Failed to delete payment QR');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="mb-4">Payment Settings</h1>
        </div>
      </div>

      {/* Upload Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Upload Payment QR Code</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="qrUpload" className="form-label">
                  Select QR Code Image
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="qrUpload"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="mt-2">
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Uploading...</span>
                    </div>
                    <span className="ms-2">Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing QRs */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Existing Payment QR Codes</h5>
            </div>
            <div className="card-body">
              {paymentQRs.length === 0 ? (
                <p className="text-muted">No payment QR codes uploaded yet.</p>
              ) : (
                <div className="row">
                  {paymentQRs.map((qr) => (
                    <div key={qr._id} className="col-md-4 mb-3">
                      <div className="card">
                        <div className="card-body text-center">
                          <img
                            src={qr.imageUrl}
                            alt="Payment QR"
                            className="img-fluid mb-3"
                            style={{ maxHeight: '200px' }}
                          />
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteQR(qr._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
