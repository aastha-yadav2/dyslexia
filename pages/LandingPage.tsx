import React, { useState } from 'react';

const TestimonialCard: React.FC<{ quote: string; name: string; role: string; avatarUrl: string }> = ({ quote, name, role, avatarUrl }) => (
    <figure className="bg-slate-800 p-6 rounded-xl h-full flex flex-col justify-between">
      <blockquote className="text-slate-300 text-lg italic">
        <p>"{quote}"</p>
      </blockquote>
      <figcaption className="flex items-center mt-4 pt-4 border-t border-slate-700">
        <img src={avatarUrl} alt={`Photo of ${name}`} className="w-12 h-12 rounded-full object-cover" />
        <div className="ml-4">
          <cite className="font-semibold text-slate-100 not-italic">{name}</cite>
          <p className="text-slate-400 text-sm">{role}</p>
        </div>
      </figcaption>
    </figure>
);

export const LandingPage: React.FC<{onNavigate: (path: string) => void}> = ({ onNavigate }) => {
  const [transformStyle, setTransformStyle] = useState({
    transform: 'rotateX(0) rotateY(0) scale(1)',
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / (width / 2);
    const y = (e.clientY - top - height / 2) / (height / 2);
    
    const rotateY = x * 15;
    const rotateX = -y * 15;
    
    setTransformStyle({
      transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`,
    });
  };
  
  const handleMouseLeave = () => {
    setTransformStyle({
      transform: 'rotateX(0) rotateY(0) scale(1)',
    });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Interactive Image */}
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            <div 
              className="relative perspective-1000"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <img 
                src="https://i.postimg.cc/hjKX48wx/dyslexia.jpg"
                alt="Artistic representation of neurodiversity, with a brain illustration surrounded by jumbled letters and words related to dyslexia and ADHD."
                className="relative rounded-2xl shadow-2xl w-full transition-transform duration-300 ease-out"
                style={transformStyle}
              />
            </div>
          </div>
          
          {/* Right Column: Hero Text */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-100 mb-4">
              Make the Web Usable for <span className="text-blue-400">Everyone</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 mb-8">
              AI-first accessibility tools that simplify content, improve readability, and add inclusive features — instantly.
            </p>
            <div className="flex justify-center lg:justify-start gap-4">
              <button 
                onClick={() => onNavigate('/demo')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                Try Demo
              </button>
              <button 
                onClick={() => onNavigate('/features')}
                className="bg-slate-700/50 text-slate-200 font-semibold py-3 px-8 rounded-lg border border-slate-600 hover:bg-slate-600/50 transition-colors">
                Explore Features
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials & Stats */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-slate-100">Trusted by Innovators and Educators</h2>
                <p className="text-slate-300 mt-2 text-lg max-w-2xl mx-auto">See what people are saying about their experience with Includify.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                <TestimonialCard
                    quote="Includify helped our students access course content easily — a game changer for our e-learning platform."
                    name="Prof. R. Sharma"
                    role="University Partner"
                    avatarUrl="https://i.pravatar.cc/80?u=sharma"
                />
                <TestimonialCard
                    quote="Fast to integrate, and the TTS voices are surprisingly natural. Made our app WCAG compliant in days."
                    name="Priya K."
                    role="Frontend Developer"
                    avatarUrl="https://i.pravatar.cc/80?u=priya"
                />
                <TestimonialCard
                    quote="The focus mode and dyslexia-friendly font have been incredibly helpful for my reading comprehension."
                    name="Alex Chen"
                    role="User & Advocate"
                    avatarUrl="https://i.pravatar.cc/80?u=alex"
                />
            </div>
            <div className="text-center border-t border-slate-700 pt-16">
                <h2 className="text-4xl font-bold text-slate-100 mb-8">Making a Real Impact</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    <div className="text-center">
                        <p className="text-5xl font-bold text-blue-400">25,000+</p>
                        <p className="text-slate-300 mt-1">Users Served</p>
                    </div>
                    <div className="text-center">
                        <p className="text-5xl font-bold text-blue-400">120+</p>
                        <p className="text-slate-300 mt-1">Sites Improved</p>
                    </div>
                     <div className="text-center">
                        <p className="text-5xl font-bold text-blue-400">98%</p>
                        <p className="text-slate-300 mt-1">Positive Feedback</p>
                    </div>
                     <div className="text-center">
                        <p className="text-5xl font-bold text-blue-400">40%</p>
                        <p className="text-slate-300 mt-1">Faster Comprehension</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-4xl font-bold text-slate-100 mb-4">Stay Updated</h2>
          <p className="text-slate-300 mb-8">Get product updates, accessibility tips, and community highlights.</p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="you@domain.com" 
              className="flex-grow w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-label="Email Address"
            />
            <button type="submit" className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
};