import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
// Hapus import email jika sudah tidak digunakan
import { srConfig } from '@config'; 
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledContactSection = styled.section`
  max-width: 600px;
  margin: 0 auto 100px;
  text-align: center;

  @media (max-width: 768px) {
    margin: 0 auto 50px;
  }

  .overline {
    display: block;
    margin-bottom: 20px;
    color: var(--green);
    font-family: var(--font-mono);
    font-size: var(--fz-md);
    font-weight: 400;

    &:before {
      bottom: 0;
      font-size: var(--fz-sm);
    }

    &:after {
      display: none;
    }
  }

  .title {
    font-size: clamp(40px, 5vw, 60px);
  }

  .instagram-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 50px;
    display: inline-block; /* Memastikan styling button tampil sempurna */
  }
`;

const Contact = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Ganti dengan username Instagram kamu
  const instagramUsername = "username_kamu"; 

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, [prefersReducedMotion]);

  return (
    <StyledContactSection id="contact" ref={revealContainer}>
      <h2 className="numbered-heading overline">What’s Next?</h2>

      <h2 className="title">Get In Touch</h2>

      <p>
       My Instagram is always open. Have questions or just want to say hello? I'll do my best to respond!
      </p>

      <a 
        className="instagram-link" 
        href={`https://www.instagram.com/arfnn.a/${instagramUsername}`}
        target="_blank" 
        rel="noopener noreferrer"
      >
        Say Hello
      </a>
    </StyledContactSection>
  );
};

export default Contact;