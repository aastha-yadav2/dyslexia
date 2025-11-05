import React from 'react';

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  actionText?: string;
  onActionClick?: () => void;
}> = ({ title, description, icon, actionText, onActionClick }) => (
    <div className="bg-slate-800 p-6 rounded-xl transform transition-transform hover:scale-105 h-full flex flex-col">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-2xl font-bold text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-300 flex-grow mb-4">{description}</p>
        {actionText && onActionClick && (
            <button
                onClick={onActionClick}
                className={`mt-auto font-semibold py-2 px-4 rounded-lg transition-colors self-start bg-blue-500/20 text-blue-300 hover:bg-blue-500/30`}
                aria-label={`${actionText} for ${title}`}
            >
                {actionText}
            </button>
        )}
    </div>
);

export const FeaturesPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    
    const featuresList = [
        {
            icon: "📖",
            title: "AI Text Simplification",
            description: "Converts complex language into easy-to-understand text using Google's Gemini API. Ideal for users with cognitive disabilities, dyslexia, or anyone wanting clearer content.",
            actionText: "Try it Live",
            onActionClick: () => onNavigate('/features/simplification'),
        },
        {
            icon: "🎙️",
            title: "Text-to-Speech Reader",
            description: "Reads any text aloud with customizable voices and speeds. Helps users with visual impairments or reading difficulties consume content audibly.",
            actionText: "Try it Live",
            onActionClick: () => onNavigate('/features/tts'),
        },
        {
            icon: "👓",
            title: "Dyslexia-Friendly Mode",
            description: "Switch to a font optimized for readers with dyslexia. This special font improves letter distinction and spacing to enhance readability and reduce visual strain.",
            actionText: "Try it Live",
            onActionClick: () => onNavigate('/features/dyslexia-font'),
        },
        {
            icon: "🎚️",
            title: "Contrast Adjustment",
            description: "Fine-tune the contrast of page content to reduce glare and improve text clarity, helping users with light sensitivity or certain visual impairments.",
            actionText: "Try it Live",
            onActionClick: () => onNavigate('/features/contrast'),
        },
        {
            icon: "💡",
            title: "Focus Mode",
            description: "Improve focus by highlighting one paragraph at a time. The rest of the text will be dimmed to help you concentrate better.",
            actionText: "Try it Live",
            onActionClick: () => onNavigate('/features/focus-mode'),
        },
        {
            icon: "📏",
            title: "Adjustable Line Spacing",
            description: "Customize the spacing between lines of text to 'normal', 'relaxed', or 'loose' to make reading smoother and more comfortable.",
            actionText: "Try it Live",
            onActionClick: () => onNavigate('/features/line-spacing'),
        },
        {
            icon: "🌐",
            title: "Multilingual Support",
            description: "Translate content and use accessibility tools in multiple languages. Our interface also supports right-to-left (RTL) layouts.",
            actionText: "Try it Live",
            onActionClick: () => onNavigate('/features/multilingual'),
        },
        {
            icon: "🤟",
            title: "Sign Language Assistant",
            description: "Translate text to animated sign language, interpret sign language from video, or engage in real-time conversation between sign and text.",
            actionText: "Explore the Assistant",
            onActionClick: () => onNavigate('/sign-language'),
        },
         {
            icon: "🔍",
            title: "Accessibility Checker",
            description: "Analyze any URL or file to get a quick overview of its accessibility health, identifying issues like missing alt text or poor contrast.",
            actionText: "Try it Live",
            onActionClick: () => onNavigate('/accessibility-checker'),
        },
    ];

    return (
        <div className="container mx-auto px-6 py-12">
            <section className="text-center py-16">
                <h1 className="text-5xl font-extrabold text-blue-400 mb-4">Core Features</h1>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                    A suite of powerful, AI-driven tools designed to make digital content accessible for everyone.
                </p>
            </section>

            <section className="my-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuresList.map((feature) => (
                    <FeatureCard
                        key={feature.title}
                        title={feature.title}
                        description={feature.description}
                        icon={feature.icon}
                        actionText={feature.actionText}
                        onActionClick={feature.onActionClick}
                    />
                ))}
            </section>
        </div>
    );
};