import React from 'react';

const StepCard: React.FC<{ number: string; title: string; children: React.ReactNode; }> = ({ number, title, children }) => (
    <div className="flex items-start gap-6">
        <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full text-2xl font-bold">
            {number}
        </div>
        <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-600 text-lg">{children}</p>
        </div>
    </div>
);

export const HowItWorksPage: React.FC = () => {
    return (
        <div className="container mx-auto px-6 py-12">
            <section className="text-center py-16">
                <h1 className="text-5xl font-extrabold text-cyan-700 mb-4">How Includify Works</h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                    Transforming digital content into an accessible experience is simple. Here’s a step-by-step look at our process.
                </p>
            </section>
            
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
            
            <section className="my-20 text-center bg-white p-16 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Ready to try it yourself?</h2>
                <p className="text-slate-600 max-w-2xl mx-auto mb-8">
                    Experience the power of accessible content firsthand. Sign up for free and start simplifying text today.
                </p>
                <button className="bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                    Get Started for Free
                </button>
            </section>
        </div>
    );
};
