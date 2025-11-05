import React, { useState, useEffect, useRef } from 'react';

const TeamMemberCard: React.FC<{ name: string; role: string; description: string; imageUrl?: string; imageClassName?: string; }> = ({ name, role, description, imageUrl, imageClassName = '' }) => (
  <div className="bg-slate-800 rounded-xl p-8 text-center transition-all duration-300 transform hover:scale-105 hover:border-blue-400/80 shadow-lg shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-400/30 h-full">
    <div className="w-40 h-40 rounded-full mx-auto mb-6 bg-slate-700/50 flex items-center justify-center overflow-hidden ring-4 ring-blue-500/30">
      {imageUrl ? (
        <img src={imageUrl} alt={`Photo of ${name}`} className={`w-full h-full object-cover ${imageClassName}`} />
      ) : (
        <span className="text-slate-400 text-sm">Team Member</span>
      )}
    </div>
    <h3 className="text-3xl font-bold text-white">{name}</h3>
    <p className="text-blue-400 font-medium mt-1">{role}</p>
    <p className="text-slate-300 mt-4 text-base">{description}</p>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; children: React.ReactNode; }> = ({ number, title, children }) => (
    <div className="flex items-start gap-6">
        <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-blue-500/20 text-blue-300 rounded-full text-2xl font-bold">
            {number}
        </div>
        <div>
            <h3 className="text-2xl font-bold text-slate-100 mb-2">{title}</h3>
            <p className="text-slate-300 text-lg">{children}</p>
        </div>
    </div>
);

const slides = [
    {
      title: 'Empowerment Through AI',
      description: 'We leverage cutting-edge AI to break down barriers, providing tools that empower users to consume digital content in a way that works best for them.',
      imageUrl: 'https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Clarity & Simplicity',
      description: 'Complexity is the enemy of accessibility. Our core mission is to simplify the digital world, making information clear, concise, and easy to understand for everyone.',
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Inclusive by Design',
      description: 'Accessibility isn’t an afterthought; it’s at the heart of everything we build. We design with empathy, ensuring our tools are intuitive and effective for all abilities.',
      imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Community & Collaboration',
      description: 'We believe in the power of community. Includify is built with feedback from users, advocates, and developers to create tools that truly make a difference for everyone.',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Innovation for All',
      description: 'Our commitment is to continuous innovation. We explore new technologies like sign language interpretation to push the boundaries of digital accessibility.',
      imageUrl: 'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?q=80&w=800&auto=format&fit=crop',
    },
];

const InspirationSlider: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const timeoutRef = useRef<number | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = window.setTimeout(
            () => setCurrentSlide((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1)),
            5000 // Change slide every 5 seconds
        );
        return () => {
            resetTimeout();
        };
    }, [currentSlide]);

    return (
        <div className="relative overflow-hidden rounded-2xl shadow-xl border border-slate-700 h-96 md:h-[30rem]">
            {/* Slides Container */}
            <div className="flex transition-transform ease-in-out duration-700 h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {slides.map((slide, index) => (
                    <div key={index} className="w-full flex-shrink-0 h-full relative text-white">
                        {/* Background Image */}
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover absolute inset-0" />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30"></div>
                        {/* Text Content */}
                        <div className="relative h-full flex flex-col justify-center p-8 md:p-16 md:w-3/5">
                            <h3 className="text-3xl md:text-4xl font-extrabold mb-4">{slide.title}</h3>
                            <p className="text-lg md:text-xl leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.8)]">{slide.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            currentSlide === index ? 'w-6 bg-white' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};


export const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'about' | 'howItWorks'>('about');
  
  return (
    <div className="container mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="text-center py-16">
          <h1 className="text-5xl font-extrabold text-slate-100 mb-4">
            {activeTab === 'about' ? 'About Includify' : 'How Includify Works'}
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {activeTab === 'about' 
              ? 'Making Technology Inclusive for Everyone' 
              : 'Transforming digital content into an accessible experience is simple. Here’s a step-by-step look at our process.'}
          </p>
      </section>

      {/* Tab Selector */}
      <div className="max-w-sm mx-auto bg-slate-800 p-1.5 rounded-full flex space-x-1.5 mb-16 border border-slate-700">
        <button
          onClick={() => setActiveTab('about')}
          className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            activeTab === 'about' ? 'bg-slate-200 text-blue-900 shadow' : 'text-slate-300 hover:bg-slate-700'
          }`}
        >
          About Us
        </button>
        <button
          onClick={() => setActiveTab('howItWorks')}
          className={`w-1/2 py-2 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
            activeTab === 'howItWorks' ? 'bg-slate-200 text-blue-900 shadow' : 'text-slate-300 hover:bg-slate-700'
          }`}
        >
          How It Works
        </button>
      </div>

      {activeTab === 'about' && (
        <>
          {/* Introduction */}
          <section className="my-16 bg-slate-800 p-10 rounded-xl shadow-lg">
              <p className="text-lg leading-relaxed text-slate-200 text-center max-w-4xl mx-auto">
              Includify is an accessibility-first platform built to empower people with cognitive, visual, and hearing disabilities through AI-driven assistive tools. Our mission is to make digital spaces usable, understandable, and enjoyable for everyone.
              </p>
          </section>

          {/* Mission & Vision Slider */}
          <section className="my-16">
              <h2 className="text-4xl font-bold text-slate-100 text-center mb-10">Our Vision</h2>
              <InspirationSlider />
          </section>

          {/* Why Inclusion Matters */}
          <section className="my-16 bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white p-12 rounded-xl shadow-xl">
              <h2 className="text-4xl font-bold text-center mb-6">Why Inclusion Matters</h2>
              <p className="text-lg text-center max-w-4xl mx-auto leading-relaxed">
              Over 1 billion people worldwide experience some form of disability. Yet, most digital tools are not designed with accessibility in mind. This limits participation, education, and opportunities. Includify was created to change that — by turning accessibility into an integrated, effortless experience for all.
              </p>
          </section>

          {/* Team Section */}
          <section className="my-20 py-20 px-4 sm:px-8 bg-slate-900 rounded-2xl border border-slate-700">
              <h2 className="text-5xl font-bold text-center text-white mb-20">Meet the Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-screen-xl mx-auto">
                <div className="animate-fadeInUp" style={{ animationDelay: '100ms' }}>
                  <TeamMemberCard name="Aastha Yadav" role="Prototype Developer" description="Develops front-end and back-end integration with Google AI Studio and Firebase." imageUrl="https://i.postimg.cc/9QyxsG0p/aastha.jpg" imageClassName="object-top" />
                </div>
                <div className="animate-fadeInUp" style={{ animationDelay: '250ms' }}>
                  <TeamMemberCard name="Niharika Dubey" role="API Key & User Research" description="Leads user research and the accessibility strategy for Includify." imageUrl="https://i.postimg.cc/Gm6M5XbQ/niharika.jpg" />
                </div>
                <div className="animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                  <TeamMemberCard name="Saloni" role="Prompt Engineer & AI Trainer" description="Designs and optimizes prompts for inclusive AI interaction." imageUrl="https://i.postimg.cc/5y9QgWGX/saloni.jpg" imageClassName="object-top" />
                </div>
                <div className="animate-fadeInUp" style={{ animationDelay: '550ms' }}>
                  <TeamMemberCard name="Payal Pal" role="UI/UX Designer" description="Focuses on soft color schemes and accessibility-friendly design components." imageUrl="https://i.postimg.cc/4xXtNtBX/payal.jpg" imageClassName="object-top" />
                </div>
              </div>
          </section>
          
          {/* Collaborations Section */}
          <section className="my-20 text-center">
                  <h2 className="text-4xl font-bold text-slate-100 mb-6">Collaborations & Partners</h2>
                  <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-10">
                  We collaborate with accessibility advocates, open-source contributors, and educational institutions to make digital inclusion a standard practice.
                  </p>
                  <div className="flex flex-wrap justify-center items-center gap-8 text-lg">
                  <div className="bg-slate-800 py-3 px-6 rounded-full font-semibold text-slate-200">Google AI Studio</div>
                  <div className="bg-slate-800 py-3 px-6 rounded-full font-semibold text-slate-200">Firebase</div>
                  <div className="bg-slate-800 py-3 px-6 rounded-full font-semibold text-slate-200">Open-Source Community</div>
                  </div>
          </section>

          {/* CTA Section */}
          <section className="my-20 text-center bg-slate-800 p-16 rounded-xl">
              <h2 className="text-3xl font-bold text-slate-100 mb-4">Join us in creating an inclusive digital future.</h2>
              <a
                href="https://cbmindia.org/donate-for-education/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                  Contribute Now
              </a>
          </section>
        </>
      )}

      {activeTab === 'howItWorks' && (
        <>
            <section className="my-16 max-w-4xl mx-auto space-y-12">
                <StepCard number="01" title="Input Your Text">
                    Simply copy and paste any text into the input area. This can be anything from a complex article or a simple paragraph to an email.
                </StepCard>
                <StepCard number="02" title="AI-Powered Simplification">
                    Our system, powered by Google's Gemini API, analyzes the text for complex vocabulary, long sentences, and passive voice. It then rewrites it into clear, simple language.
                </StepCard>
                <StepCard number="03" title="Customize Your View">
                    Use the accessibility panel to tailor the experience. Enable dyslexia-friendly fonts, switch to high-contrast mode, adjust line spacing, or activate focus mode to highlight one paragraph at a time.
                </StepCard>
                <StepCard number="04" title="Listen with Text-to-Speech">
                    Engage the Text-to-Speech feature to have the simplified text read aloud. You can choose from different languages and voices for a comfortable listening experience.
                </StepCard>
            </section>
            
            <section className="my-20 text-center bg-slate-800 p-16 rounded-xl">
                <h2 className="text-3xl font-bold text-slate-100 mb-4">Ready to try it yourself?</h2>
                <p className="text-slate-300 max-w-2xl mx-auto mb-8">
                    Experience the power of accessible content firsthand. Sign up for free and start simplifying text today.
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    Get Started for Free
                </button>
            </section>
        </>
      )}
    </div>
  );
};