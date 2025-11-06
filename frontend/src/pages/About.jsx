import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section text-center text-white py-5">
        <div className="container">
          <h1 className="display-4 fw-bold mb-4">About BakeryHub</h1>
          <p className="lead mb-4">
            Your ultimate destination for premium bakery products and professional baking education
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4">
              <h2 className="bakery-text-brown fw-bold mb-4">Our Story</h2>
              <p className="text-muted mb-4">
                Founded in 2020, BakeryHub was born from a passion for creating exceptional baked goods
                and sharing the art of baking with the world. What started as a small family bakery has
                grown into a comprehensive platform that combines e-commerce and online education.
              </p>
              <p className="text-muted mb-4">
                We believe that everyone deserves access to high-quality bakery products and the opportunity
                to learn professional baking skills from the comfort of their own kitchen. Our mission is
                to make baking accessible, enjoyable, and rewarding for people of all skill levels.
              </p>
              <Link to="/shop" className="btn bakery-btn-primary">
                <i className="fas fa-shopping-cart me-2"></i>
                Explore Our Products
              </Link>
            </div>
            <div className="col-lg-6">
              <img
                src="https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Our Bakery"
                className="img-fluid rounded shadow"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="bakery-text-brown fw-bold">Our Values</h2>
              <p className="text-muted">What drives us every day</p>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center h-100">
                <div className="feature-icon mb-3">
                  <i className="fas fa-heart fs-1 bakery-text-gold"></i>
                </div>
                <h5 className="bakery-text-brown fw-bold">Quality First</h5>
                <p className="text-muted">
                  We never compromise on quality. Every product is made with the finest ingredients
                  and traditional baking techniques passed down through generations.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center h-100">
                <div className="feature-icon mb-3">
                  <i className="fas fa-users fs-1 bakery-text-gold"></i>
                </div>
                <h5 className="bakery-text-brown fw-bold">Community Focused</h5>
                <p className="text-muted">
                  Building a community of baking enthusiasts where everyone can learn, share,
                  and grow together. Your success is our success.
                </p>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="text-center h-100">
                <div className="feature-icon mb-3">
                  <i className="fas fa-leaf fs-1 bakery-text-gold"></i>
                </div>
                <h5 className="bakery-text-brown fw-bold">Sustainability</h5>
                <p className="text-muted">
                  Committed to sustainable practices, from sourcing local ingredients to
                  eco-friendly packaging, ensuring a better future for our planet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-5">
        <div className="container">
          <div className="row mb-5">
            <div className="col-12 text-center">
              <h2 className="bakery-text-brown fw-bold">Meet Our Team</h2>
              <p className="text-muted">The passionate bakers behind BakeryHub</p>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card team-card text-center h-100 border-0 shadow-sm">
                <div className="card-body">
                  <img
                    src="https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Master Baker"
                    className="rounded-circle mb-3"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                  <h5 className="card-title bakery-text-brown fw-bold">Sarah Johnson</h5>
                  <p className="text-muted mb-2">Master Baker & Founder</p>
                  <p className="card-text small">
                    With over 15 years of experience in professional baking, Sarah leads our team
                    with creativity and precision.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card team-card text-center h-100 border-0 shadow-sm">
                <div className="card-body">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Pastry Chef"
                    className="rounded-circle mb-3"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Pastry Chef"
                    className="rounded-circle mb-3"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                  <h5 className="card-title bakery-text-brown fw-bold">Michael Chen</h5>
                  <p className="text-muted mb-2">Pastry Chef & Instructor</p>
                  <p className="card-text small">
                    Expert in French pastries and cake decoration, Michael brings international
                    techniques to our courses.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-4 col-md-6 mb-4">
              <div className="card team-card text-center h-100 border-0 shadow-sm">
                <div className="card-body">
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80"
                    alt="Operations Manager"
                    className="rounded-circle mb-3"
                    style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                  />
                  <h5 className="card-title bakery-text-brown fw-bold">Emma Rodriguez</h5>
                  <p className="text-muted mb-2">Operations Manager</p>
                  <p className="card-text small">
                    Ensures smooth operations and customer satisfaction, making sure every
                    order exceeds expectations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-5 bg-gradient text-white">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-3 col-md-6 mb-4">
              <h3 className="fw-bold mb-2">5000+</h3>
              <p className="mb-0">Happy Customers</p>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h3 className="fw-bold mb-2">200+</h3>
              <p className="mb-0">Products Baked</p>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h3 className="fw-bold mb-2">50+</h3>
              <p className="mb-0">Expert Courses</p>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h3 className="fw-bold mb-2">4.9/5</h3>
              <p className="mb-0">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-5">
        <div className="container text-center">
          <h2 className="bakery-text-brown fw-bold mb-3">Join Our Baking Community</h2>
          <p className="text-muted mb-4">
            Start your baking journey today with BakeryHub. Whether you're looking for delicious
            treats or want to learn professional baking skills, we're here for you.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register" className="btn bakery-btn-primary btn-lg">
              <i className="fas fa-user-plus me-2"></i>
              Get Started
            </Link>
            <Link to="/courses" className="btn bakery-btn-outline btn-lg">
              <i className="fas fa-graduation-cap me-2"></i>
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
