import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledGallerySection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
  }

  .gallery-grid {
    ${({ theme }) => theme.mixins.resetList};
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    grid-gap: 25px;
    position: relative;
    margin-top: 50px;
    width: 100%;

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }

  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 80px auto 0;
  }
`;

const StyledGalleryItem = styled.li`
  position: relative;
  cursor: default;
  transition: var(--transition);
  list-style: none;

  @media (prefers-reduced-motion: no-preference) {
    &:hover,
    &:focus-within {
      .gallery-inner {
        transform: translateY(-7px);
      }
      
      .gallery-image img {
        transform: scale(1.05);
      }
    }
  }

  .gallery-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
    overflow: hidden;
  }

  .gallery-image {
    width: 100%;
    height: 270px; /* Ukuran sertifikat landscape (rasio ~1.4:1) */
    overflow: hidden;
    position: relative;
    background-color: var(--navy); /* Warna background saat gambar loading */
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0, 0, 0, 0.6) 100%
      );
      pointer-events: none;
    }
  }

  .gallery-content {
    padding: 1.25rem 1.5rem 1.5rem; /* Padding lebih kecil di atas */
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .gallery-category {
    font-family: var(--font-mono);
    font-size: var(--fz-xs);
    color: var(--green);
    margin-bottom: 0.4rem; /* Lebih kecil */
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .gallery-title {
    margin: 0 0 8px; /* Margin lebih kecil */
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);
    font-weight: 600;
    line-height: 1.3;
  }

  .gallery-description {
    color: var(--light-slate);
    font-size: 14px; /* Diperkecil dari 16px */
    line-height: 1.5;
    margin-bottom: 0.75rem; /* Lebih kecil */
    flex-grow: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* Maksimal 3 baris */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .gallery-tags {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    margin: 10px 0 0 0; /* Margin lebih kecil */
    list-style: none;
    gap: 6px; /* Gap lebih kecil */

    li {
      font-family: var(--font-mono);
      font-size: 11px; /* Diperkecil */
      padding: 2px 8px; /* Padding lebih kecil */
      background-color: rgba(100, 255, 218, 0.1);
      color: var(--green);
      border-radius: 20px;
      line-height: 1.5;
    }
  }

  .gallery-actions {
    display: flex;
    gap: 8px; /* Gap lebih kecil */
    margin-top: 15px; /* Margin lebih kecil */
    
    a {
      ${({ theme }) => theme.mixins.flexCenter};
      padding: 6px 14px; /* Padding lebih kecil */
      border-radius: var(--border-radius);
      font-size: var(--fz-xs); /* Ukuran font lebih kecil */
      font-family: var(--font-mono);
      text-decoration: none;
      transition: var(--transition);
      
      &.primary {
        background-color: var(--green);
        color: var(--navy);
        
        &:hover {
          background-color: var(--green-tint);
        }
      }
      
      &.secondary {
        border: 1px solid var(--green);
        color: var(--green);
        
        &:hover {
          background-color: var(--green-tint);
          color: var(--navy);
        }
      }
    }
  }
`;

// Styling untuk modal
const ModalStyles = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;

  .modal-content {
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    
    img {
      width: auto;
      height: auto;
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      border-radius: var(--border-radius);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .close-button {
      position: absolute;
      top: -40px;
      right: -40px;
      background: none;
      border: none;
      color: white;
      font-size: 48px;
      cursor: pointer;
      padding: 10px;
      line-height: 1;
      transition: var(--transition);
      
      &:hover {
        color: var(--green);
        transform: scale(1.1);
      }
      
      @media (max-width: 768px) {
        top: -50px;
        right: 0;
      }
    }
  }
`;

const Gallery = () => {
  // Data gambar statis dengan ukuran sertifikat
  const galleryData = [
    {
      id: 1,
      title: "Guide to Learn R with AI",
      category: "R with AI",
      description: "Certificate DQlab",
      image: "/r ai.jpg", // Ukuran sertifikat ~1.4:1
      tags: ["R", "Code",],
      link: "/gallery/sunset",
      fullImage: "/r ai.jpg"
    },
    {
      id: 2,
      title: "Cashier Application",
      category: "UJIKOM",
      description: "Creat cashier application using Java programming language",
      image: "/bonet.jpeg",
      tags: ["Java", "Programming", "sql"],
      link: "/gallery/architecture",
      fullImage: "/bonet.jpeg"
    },
    {
      id: 3,
      title: "Security Course",
      category: "Cyber",
      description: "Has completed a Introduction to Cyber Security course.",
      image: "cyber.jpg",
      tags: ["Cyber", "Security", "Course"],
      link: "/gallery/street",
      fullImage: "/cyber.jpg"
    },
    {
      id: 4,
      title: "Git",
      category: "Git",
      description: "Completed Git course.",
      image: "/git.jpg",
      tags: ["Git", "Version Control", "Programming"],
      link: "/gallery/mountain",
      fullImage: "/git.jpg"
    },
    {
      id: 5,
      title: "apprenticeship",
      category: "pt sewiwi",
      description: "Completed apprenticeship at PT Sewiwi.",
      image: "/sewiwi.jpg",
      tags: ["Network", "Programming", "Troubleshooting"],
      link: "/gallery/food",
      fullImage: "sewiwi.jpg"
    },
    {
      id: 6,
      title: "Guide to Learn SQL with AI",
      category: "AI with SQL",
      description: "Completed a course on learning SQL with AI.",
      image: "/sql ai.jpg",
      tags: ["SQL", "AI", "Database"],
      link: "/gallery/art",
      fullImage: "/sql ai.jpg"
    }
  ];

  const [showMore, setShowMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const revealTitle = useRef(null);
  const revealItems = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealTitle.current, srConfig());
    revealItems.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const GRID_LIMIT = 6;
  const firstSix = galleryData.slice(0, GRID_LIMIT);
  const itemsToShow = showMore ? galleryData : firstSix;

  const openImageModal = (image) => {
    setSelectedImage(image);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <StyledGallerySection>
      <h2 ref={revealTitle}>Gallery   </h2>

      <ul className="gallery-grid">
        {prefersReducedMotion ? (
          <>
            {itemsToShow.map((item) => (
              <StyledGalleryItem key={item.id}>
                <div className="gallery-inner">
                  <div className="gallery-image">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      onClick={() => openImageModal(item)}
                      loading="lazy"
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="image-overlay" />
                  </div>
                  
                  <div className="gallery-content">
                    <div className="gallery-category">{item.category}</div>
                    <h3 className="gallery-title">{item.title}</h3>
                    <p className="gallery-description">{item.description}</p>
                    
                    {item.tags && (
                      <ul className="gallery-tags">
                        {item.tags.map((tag, idx) => (
                          <li key={idx}>{tag}</li>
                        ))}
                      </ul>
                    )}
                    
                    <div className="gallery-actions">
                    
                      <a href={item.fullImage} className="secondary" target="_blank" rel="noreferrer">
                        Full Size
                      </a>
                    </div>
                  </div>
                </div>
              </StyledGalleryItem>
            ))}
          </>
        ) : (
          <TransitionGroup component={null}>
            {itemsToShow.map((item, i) => (
              <CSSTransition
                key={item.id}
                classNames="fadeup"
                timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                exit={false}>
                <StyledGalleryItem
                  ref={el => (revealItems.current[i] = el)}
                  style={{
                    transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                  }}>
                  <div className="gallery-inner">
                    <div className="gallery-image">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        onClick={() => openImageModal(item)}
                        loading="lazy"
                        style={{ cursor: 'pointer' }}
                      />
                      <div className="image-overlay" />
                    </div>
                    
                    <div className="gallery-content">
                      <div className="gallery-category">{item.category}</div>
                      <h3 className="gallery-title">{item.title}</h3>
                      <p className="gallery-description">{item.description}</p>
                      
                      {item.tags && (
                        <ul className="gallery-tags">
                          {item.tags.map((tag, idx) => (
                            <li key={idx}>{tag}</li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="gallery-actions">
                      
                        <a href={item.fullImage} className="secondary" target="_blank" rel="noreferrer">
                          Full Size
                        </a>
                      </div>
                    </div>
                  </div>
                </StyledGalleryItem>
              </CSSTransition>
            ))}
          </TransitionGroup>
        )}
      </ul>

      {galleryData.length > GRID_LIMIT && (
        <button className="more-button" onClick={() => setShowMore(!showMore)}>
          Tampilkan {showMore ? 'Lebih Sedikit' : 'Lebih Banyak'}
        </button>
      )}

      {/* Modal untuk preview gambar */}
      {selectedImage && (
        <ModalStyles onClick={closeImageModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.fullImage} alt={selectedImage.title} />
            <button className="close-button" onClick={closeImageModal}>×</button>
          </div>
        </ModalStyles>
      )}
    </StyledGallerySection>
  );
};

export default Gallery;