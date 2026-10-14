import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

export const NetworkBackground = ({ className = '' }) => {
  const canvasRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scale particle count for performance
    const isMobile = width < 768;
    const particleCount = isMobile ? 35 : 70;
    const connectionDistance = isMobile ? 85 : 125;

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.45,
        vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.8 + 1.2,
        color: Math.random() > 0.35 ? '#3B82F6' : '#8B5CF6',
        alpha: Math.random() * 0.45 + 0.3,
      });
    }

    let mouse = { x: null, y: null, maxDist: 140 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle ambient glow spots
      if (isDark) {
        const radGrad1 = ctx.createRadialGradient(width * 0.15, height * 0.2, 0, width * 0.15, height * 0.2, width * 0.45);
        radGrad1.addColorStop(0, 'rgba(59, 130, 246, 0.05)');
        radGrad1.addColorStop(1, 'rgba(59, 130, 246, 0)');
        ctx.fillStyle = radGrad1;
        ctx.fillRect(0, 0, width, height);

        const radGrad2 = ctx.createRadialGradient(width * 0.85, height * 0.4, 0, width * 0.85, height * 0.4, width * 0.4);
        radGrad2.addColorStop(0, 'rgba(139, 92, 246, 0.04)');
        radGrad2.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = radGrad2;
        ctx.fillRect(0, 0, width, height);
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;

          // Gentle mouse reaction
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < mouse.maxDist) {
              const force = (mouse.maxDist - dist) / mouse.maxDist;
              p.x -= (dx / dist) * force * 0.8;
              p.y -= (dy / dist) * force * 0.8;
            }
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? p.color === '#3B82F6'
            ? `rgba(59, 130, 246, ${p.alpha})`
            : `rgba(139, 92, 246, ${p.alpha})`
          : `rgba(59, 130, 246, ${p.alpha * 0.4})`;
        ctx.fill();

        // Draw connections between nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const lineAlpha = (1 - dist / connectionDistance) * (isDark ? 0.22 : 0.08);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = isDark
              ? `rgba(59, 130, 246, ${lineAlpha})`
              : `rgba(100, 116, 139, ${lineAlpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
        isDark ? 'opacity-80' : 'opacity-35'
      } ${className}`}
      aria-hidden="true"
    />
  );
};

export default NetworkBackground;
