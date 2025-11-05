import React, { useState } from 'react';
import { 
    MicrophoneIcon, ShieldCheckIcon, SparklesIcon,
    InstagramIcon, RedditIcon, FacebookIcon, BrainIcon, BookOpenIcon,
    LinkIcon, UsersIcon, LinkedInIcon, LightbulbIcon
} from '../components/icons';

// --- DATA ---
const cognitiveFeatures = [
  {
    title: "Voice-Enabled Navigation",
    description: "Browse and interact with the interface using simple speech commands.",
    imageUrl: 'https://i.postimg.cc/x1kxgM6m/Gemini-Generated-Image-sn90fwsn90fwsn90.png'
  },
  {
    title: "Visual & Symbol Support",
    description: "Uses icons, color cues, and pictorial content for better comprehension.",
    imageUrl: 'https://i.postimg.cc/kXRp9LS7/Gemini-Generated-Image-3t67k3t67k3t67k3.png'
  },
  {
    title: "Simplified Forums",
    description: "Share thoughts, ask questions, and interact in moderated communities.",
    imageUrl: 'https://i.postimg.cc/85GvYfST/Gemini-Generated-Image-yvs2fsyvs2fsyvs2.png'
  },
  {
    title: "Personalized Content Feed",
    description: "AI-based recommendations tailored to your comfort level and interests.",
    imageUrl: 'https://i.postimg.cc/kGBWN3CB/Gemini-Generated-Image-inircfinircfinir.png'
  },
  {
    icon: <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />,
    title: "Safe & Supportive",
    description: "Ensures privacy, moderation, and a safe environment for all users.",
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop'
  },
];

const communityResources = [
  {
    category: "Global Organizations",
    icon: <UsersIcon className="w-8 h-8 text-blue-400" />,
    items: [
      { name: "Understood (US)", description: "Nonprofit for people who learn and think differently (dyslexia, ADHD, etc.).", platform: "Web", handle: "understood.org", url: "https://www.understood.org/" },
      { name: "CHADD (US)", description: "Advocacy, support groups, and training for Children & Adults with ADHD.", platform: "Web", handle: "chadd.org", url: "https://chadd.org/" },
      { name: "ADDA (US)", description: "Peer groups and resources for adults with ADHD.", platform: "Web", handle: "add.org", url: "https://add.org/" },
      { name: "British Dyslexia Association (BDA)", description: "UK-based charity with guidance, research summaries, and awareness campaigns.", platform: "Web", handle: "bdadyslexia.org.uk", url: "https://www.bdadyslexia.org.uk/" },
      { name: "Learning Ally", description: "US nonprofit focusing on audiobooks and literacy support for dyslexia.", platform: "Web", handle: "learningally.org", url: "https://learningally.org/" }
    ]
  },
  {
    category: "Social Media Accounts",
    icon: <InstagramIcon className="w-8 h-8 text-slate-300" />,
    items: [
      { name: "Understood (Instagram)", description: "Short reels, parent/teacher tips.", platform: "Instagram", handle: "@understoodorg", url: "https://www.instagram.com/understoodorg/?hl=en" },
      { name: "British Dyslexia Association (Instagram)", description: "Awareness campaigns & guides.", platform: "Instagram", handle: "@bdadyslexia", url: "https://www.instagram.com/bdadyslexia/?hl=en" },
      { name: "CHADD (LinkedIn)", description: "Professional resources & updates for ADHD.", platform: "LinkedIn", handle: "CHADD", url: "https://www.linkedin.com/company/chadd" },
      { name: "r/dyslexia", description: "Peer stories, tips, and resources.", platform: "Reddit", handle: "r/dyslexia", url: "https://www.reddit.com/r/dyslexia/" },
      { name: "r/ADHD", description: "Community for adults & teens with ADHD.", platform: "Reddit", handle: "r/ADHD", url: "https://www.reddit.com/r/ADHD/" },
      { name: "Facebook Support Groups", description: "Search for local and condition-specific groups for community support.", platform: "Facebook" }
    ]
  },
  {
    category: "Peer & Support Communities",
    icon: <UsersIcon className="w-8 h-8 text-blue-400" />,
    items: [
        { name: "CHADD local chapters", description: "Local meetups and virtual support, searchable on their website." },
        { name: "ADDA online peer support", description: "Targeted groups for women 50+, parents, LGBTQIA+, and more." },
    ]
  }
];

const techResources = [
  {
    category: "Reading & Text Tools",
    icon: <BookOpenIcon className="w-8 h-8 text-emerald-400" />,
    items: [
      { name: "Microsoft Immersive Reader", description: "Integrated into Word/Edge. Features read aloud, focus mode, and syllable highlighting. Widely adopted in schools." },
      { name: "Kurzweil 3000", description: "Long-established assistive learning platform with text-to-speech, study tools, and dyslexia-support features." },
      { name: "OpenDyslexic / Dyslexie Font", description: "Specially-designed fonts to improve readability. Easy to install and used in many apps." },
    ]
  },
  {
    category: "Handheld & AI Reading Devices",
    icon: <BrainIcon className="w-8 h-8 text-slate-300" />,
    items: [
      { name: "OrCam Read / OrCam Learn", description: "Handheld AI reader that scans text and reads it aloud, increasing independence for users with reading difficulties." },
      { name: "Ghotit & Read&Write", description: "Commercial software offering spelling help, word prediction, text-to-speech, and grammar aids for dyslexia." },
    ]
  },
  {
    category: "Neurofeedback & Wearables (ADHD)",
    icon: <BrainIcon className="w-8 h-8 text-blue-400" />,
    items: [
      { name: "Wearable EEG & Neurofeedback Headsets", description: "Consumer and clinical headsets providing real-time brainwave feedback for attention training. Lightweight wearables for home use are a growing market." },
      { name: "Home Neurofeedback Apps", description: "A growing market of apps and devices (e.g., Muse headband) for brain training. Often used as adjuncts to clinical care." },
    ]
  },
  {
    category: "Emerging Research",
    icon: <LightbulbIcon className="w-8 h-8 text-amber-400" />,
    items: [
        { name: "Augmented Reality (AR) Reading Helpers", description: "University labs are testing AR overlays and AI summarizers to reduce cognitive load while reading." },
    ]
  }
];


// --- SUB-COMPONENTS ---

const CognitiveFeatureCard: React.FC<{ feature: (typeof cognitiveFeatures)[number] }> = ({ feature }) => (
    <div className="bg-slate-800 group rounded-xl shadow-lg transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden flex flex-col">
        <div className="h-48">
             <img src={feature.imageUrl} alt={`Illustration for ${feature.title}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            {'icon' in feature && feature.icon && <div className="mb-4">{feature.icon}</div>}
            <h3 className="text-xl font-bold text-slate-100 mb-2">{feature.title}</h3>
            <p className="text-slate-300 flex-grow">{feature.description}</p>
        </div>
    </div>
);

const ResourceCard: React.FC<{ item: { name: string, description: string, platform?: string, handle?: string, url?: string } }> = ({ item }) => {
    const platformIcons: { [key: string]: React.ReactNode } = {
        Instagram: <InstagramIcon className="w-4 h-4" />,
        LinkedIn: <LinkedInIcon className="w-4 h-4" />,
        Reddit: <RedditIcon className="w-4 h-4" />,
        Facebook: <FacebookIcon className="w-4 h-4" />,
        Web: <LinkIcon className="w-4 h-4" />,
    };

    const platformContent = item.platform && (
        <div className="mt-4 pt-3 border-t border-slate-700">
            {item.url ? (
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {platformIcons[item.platform.split('/')[0]]}
                    <span>{item.handle ? item.handle : 'Visit Link'}</span>
                </a>
            ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    {platformIcons[item.platform.split('/')[0]]}
                    <span>{item.handle ? item.handle : item.platform}</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="bg-slate-800 p-4 rounded-lg h-full flex flex-col transition-shadow duration-200 hover:shadow-md hover:shadow-blue-500/20">
            <h4 className="font-bold text-slate-100">{item.name}</h4>
            <p className="text-sm text-slate-300 flex-grow mt-1">{item.description}</p>
            {platformContent}
        </div>
    );
};


// --- MAIN COMPONENT ---
export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'communities' | 'tech'>('communities');
  
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="bg-slate-900">
        <div className="container mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 mb-4">Join the Includify Community</h1>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-8">
            Empowering accessibility through technology and inclusion.
          </p>
        </div>
      </section>
      
      {/* Cognitive Accessibility Section */}
      <section className="py-20 bg-slate-900/40">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-extrabold text-slate-100 mb-4">A Space Designed for Every Mind</h2>
                  <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                      Our community hub includes features specifically built to support individuals with cognitive disabilities, ensuring a safe, understandable, and empowering experience.
                  </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {cognitiveFeatures.map((feature, index) => (
                      <CognitiveFeatureCard key={index} feature={feature} />
                  ))}
              </div>
          </div>
      </section>
      
      {/* Connect & Discover Section */}
      <section className="py-20">
          <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-extrabold text-slate-100 mb-4">Connect & Discover</h2>
                  <p className="text-lg text-slate-300 max-w-3xl mx-auto">
                      Explore communities, follow advocates, and learn about the latest assistive technologies making a difference.
                  </p>
              </div>

              <div className="max-w-5xl mx-auto bg-slate-800 p-1.5 rounded-full flex space-x-1.5 mb-12 border border-slate-700">
                  <button
                      onClick={() => setActiveTab('communities')}
                      className={`w-1/2 py-3 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                          activeTab === 'communities' ? 'bg-slate-200 text-blue-900 shadow' : 'text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                      Communities & Accounts
                  </button>
                  <button
                      onClick={() => setActiveTab('tech')}
                      className={`w-1/2 py-3 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                          activeTab === 'tech' ? 'bg-slate-200 text-blue-900 shadow' : 'text-slate-300 hover:bg-slate-700'
                      }`}
                  >
                      Assistive Technologies
                  </button>
              </div>

              {activeTab === 'communities' && (
                  <div className="space-y-16 max-w-5xl mx-auto">
                      {communityResources.map(section => (
                          <div key={section.category}>
                              <div className="flex items-center gap-4 mb-6">
                                  {section.icon}
                                  <h3 className="text-2xl font-bold text-slate-100">{section.category}</h3>
                              </div>
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {section.items.map(item => <ResourceCard key={item.name} item={item} />)}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
              
              {activeTab === 'tech' && (
                   <div className="space-y-12 max-w-5xl mx-auto">
                      {techResources.map(section => (
                          <div key={section.category}>
                              <div className="flex items-center gap-4 mb-6">
                                  {section.icon}
                                  <h3 className="text-2xl font-bold text-slate-100">{section.category}</h3>
                              </div>
                              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {section.items.map(item => <ResourceCard key={item.name} item={item} />)}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </section>
    </div>
  );
};