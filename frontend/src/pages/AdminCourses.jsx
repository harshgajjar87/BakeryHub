import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    price: '',
    type: 'recorded',
    videoUrl: '',
    meetLink: '',
    duration: '',
    schedule: '',
    modules: [{ title: '', link: '', duration: '' }],
    materials: '',
    isActive: true
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/api/courses?page=${currentPage}&limit=10&search=${searchTerm}`);
      setCourses(response.data.courses);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleThumbnailChange = (e) => {
    setThumbnailFile(e.target.files[0]);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      instructor: '',
      price: '',
      type: 'recorded',
      videoUrl: '',
      meetLink: '',
      duration: '',
      schedule: '',
      modules: [{ title: '', link: '', duration: '' }],
      materials: '',
      isActive: true
    });
    setThumbnailFile(null);
    setEditingCourse(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      price: course.price,
      type: course.type,
      videoUrl: course.content?.videoUrl || '',
      meetLink: course.content?.meetLink || '',
      duration: course.content?.duration || '',
      schedule: course.content?.schedule || '',
      modules: course.modules || [{ title: '', link: '', duration: '' }],
      materials: course.materials || '',
      isActive: course.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'modules') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    if (thumbnailFile) {
      data.append('thumbnail', thumbnailFile);
    }

    try {
      if (editingCourse) {
        await axios.put(`/api/courses/${editingCourse._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Course updated successfully');
      } else {
        await axios.post('/api/courses', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Course created successfully');
      }

      setShowModal(false);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await axios.delete(`/api/courses/${courseId}`);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
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
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h1>Manage Courses</h1>
          <button className="btn btn-primary" onClick={openAddModal}>
            <i className="fas fa-plus me-2"></i>Add Course
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Courses Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Thumbnail</th>
                      <th>Title</th>
                      <th>Instructor</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course._id}>
                        <td>
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            className="rounded"
                          />
                        </td>
                        <td>{course.title}</td>
                        <td>{course.instructor}</td>
                        <td>
                          <span className={`badge ${course.type === 'live' ? 'bg-success' : 'bg-info'}`}>
                            {course.type}
                          </span>
                        </td>
                        <td>{formatCurrency(course.price)}</td>
                        <td>
                          <span className={`badge ${course.isActive ? 'bg-success' : 'bg-danger'}`}>
                            {course.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openEditModal(course)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(course._id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-3">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev - 1)}
                      >
                        Previous
                      </button>
                    </li>
                    {[...Array(totalPages)].map((_, index) => (
                      <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Title *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Description *</label>
                        <textarea
                          className="form-control"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          required
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Instructor *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="instructor"
                          value={formData.instructor}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Price *</label>
                        <input
                          type="number"
                          className="form-control"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Type *</label>
                        <select
                          className="form-control"
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="recorded">Recorded</option>
                          <option value="live">Live</option>
                        </select>
                      </div>
                      {formData.type === 'recorded' && (
                        <div className="mb-3">
                          <label className="form-label">Video URL</label>
                          <input
                            type="url"
                            className="form-control"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                      {formData.type === 'live' && (
                        <>
                          <div className="mb-3">
                            <label className="form-label">Meet Link</label>
                            <input
                              type="url"
                              className="form-control"
                              name="meetLink"
                              value={formData.meetLink}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Schedule</label>
                            <input
                              type="text"
                              className="form-control"
                              name="schedule"
                              value={formData.schedule}
                              onChange={handleInputChange}
                              placeholder="e.g., Every Monday 7 PM"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Duration</label>
                        <input
                          type="text"
                          className="form-control"
                          name="duration"
                          value={formData.duration}
                          onChange={handleInputChange}
                          placeholder="e.g., 2 hours"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Materials (Google Drive Link)</label>
                        <input
                          type="url"
                          className="form-control"
                          name="materials"
                          value={formData.materials}
                          onChange={handleInputChange}
                          placeholder="https://drive.google.com/..."
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Modules</label>
                        {formData.modules.map((module, index) => (
                          <div key={index} className="row mb-2">
                            <div className="col-md-4">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Module Title"
                                value={module.title}
                                onChange={(e) => {
                                  const newModules = [...formData.modules];
                                  newModules[index].title = e.target.value;
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                }}
                              />
                            </div>
                            <div className="col-md-4">
                              <input
                                type="url"
                                className="form-control"
                                placeholder="Module Link"
                                value={module.link}
                                onChange={(e) => {
                                  const newModules = [...formData.modules];
                                  newModules[index].link = e.target.value;
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                }}
                              />
                            </div>
                            <div className="col-md-3">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Duration"
                                value={module.duration}
                                onChange={(e) => {
                                  const newModules = [...formData.modules];
                                  newModules[index].duration = e.target.value;
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                }}
                              />
                            </div>
                            <div className="col-md-1">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  const newModules = formData.modules.filter((_, i) => i !== index);
                                  setFormData(prev => ({ ...prev, modules: newModules }));
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              modules: [...prev.modules, { title: '', link: '', duration: '' }]
                            }));
                          }}
                        >
                          <i className="fas fa-plus me-1"></i>Add Module
                        </button>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Thumbnail *</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          required={!editingCourse}
                        />
                      </div>
                      <div className="mb-3 form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label">Active</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCourse ? 'Update' : 'Create'} Course
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
