import React, { useState, useEffect } from 'react';
import { LoaderIcon } from './icons';

interface Article {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

// Mock data to replace the live API call due to NewsAPI's CORS policy
// which blocks requests from browsers on the Developer plan (except from localhost).
const mockArticles: Article[] = [
    {
        source: { id: null, name: 'WebMD' },
        author: 'WebMD Editorial Contributors',
        title: 'Understanding Adult ADHD',
        description: 'Attention deficit hyperactivity disorder (ADHD) in adults can look different than ADHD in children. Learn about the symptoms and how they can affect you.',
        url: 'https://www.webmd.com/add-adhd/adhd-adults',
        urlToImage: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=600&auto=format&fit=crop',
        publishedAt: '2024-05-20T10:00:00Z',
        content: '...'
    },
    {
        source: { id: null, name: 'NPR' },
        author: 'Rhitu Chatterjee',
        title: 'How a later-in-life diagnosis of autism or ADHD can be empowering for women',
        description: 'For many women, getting diagnosed with autism or ADHD as an adult can be life-changing. It can help them understand a lifetime of struggles and feel more self-acceptance.',
        url: 'https://www.npr.org/sections/health-shots/2024/02/12/1229531553/autism-adhd-diagnosis-women-empowerment',
        urlToImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop',
        publishedAt: '2024-05-19T14:30:00Z',
        content: '...'
    },
    {
        source: { id: null, name: 'The Guardian' },
        author: 'Zoe Williams',
        title: '‘I’m not lazy, I have dyslexia’: how the condition masks a world of talent',
        description: 'Dismissed as a modern malady of the middle classes, dyslexia is a serious, lifelong condition that can cause huge anxiety – but it can also bring surprising creative benefits',
        url: 'https://www.theguardian.com/society/2020/feb/04/how-dyslexia-can-mask-world-of-talent-anxiety',
        urlToImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop',
        publishedAt: '2024-05-18T09:00:00Z',
        content: '...'
    },
    {
        source: { id: null, name: 'Forbes' },
        author: 'Jessica Gold, MD, MS',
        title: 'The Importance Of Universal Design For Learning In The Workplace',
        description: 'Universal Design for Learning (UDL) is an educational framework that aims to make learning accessible to all students, but its principles can be applied to the workplace to great effect.',
        url: 'https://www.forbes.com/sites/jessicagold/2023/10/24/the-importance-of-universal-design-for-learning-in-the-workplace/',
        urlToImage: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&auto=format&fit=crop',
        publishedAt: '2024-05-17T18:00:00Z',
        content: '...'
    },
    {
        source: { id: null, name: 'Psychology Today' },
        author: 'Dr. Temple Grandin',
        title: 'The Need for Different Kinds of Minds',
        description: 'The world needs visual thinkers, pattern thinkers, and verbal thinkers to solve its problems. Education should nurture these different types of intelligence.',
        url: 'https://www.psychologytoday.com/us/blog/my-thoughts/202201/the-need-different-kinds-of-minds',
        urlToImage: 'https://images.unsplash.com/photo-1518655048521-f130df041f66?q=80&w=600&auto=format&fit=crop',
        publishedAt: '2024-05-16T11:45:00Z',
        content: '...'
    }
];

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const placeholderImage = "data:image/svg+xml,%3Csvg width='600' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='600' height='400' fill='%23e2e8f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%2394a3b8' text-anchor='middle' dy='.3em'%3EImage Not Available%3C/text%3E%3C/svg%3E";

  return (
    <div className="flex-shrink-0 w-80 snap-start">
      <a 
        href={article.url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="block group bg-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 h-full flex flex-col"
      >
        <div className="relative h-48">
          <img 
            src={article.urlToImage || placeholderImage} 
            alt={`Image for article titled: ${article.title}`} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            onError={(e) => (e.currentTarget.src = placeholderImage)}
          />
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">{article.title}</h3>
          <p className="text-slate-300 text-sm mb-4 flex-grow">{article.description}</p>
          <p className="text-xs text-slate-400 font-medium mt-auto">{article.source.name}</p>
        </div>
      </a>
    </div>
  );
};

export const TrendingArticlesSection: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Using mock data via useEffect to simulate a fetch and handle loading state.
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 1000); // Simulate network delay
  }, []);

  return (
    <section className="py-20 bg-slate-900/40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-100">Trending Articles</h2>
          <p className="text-slate-300 mt-2 text-lg max-w-2xl mx-auto">
            Stay informed with the latest insights and research in cognitive accessibility.
          </p>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center h-64">
            <LoaderIcon className="w-12 h-12 animate-spin text-blue-400" />
            <p className="ml-4 text-slate-300">Loading articles...</p>
          </div>
        )}
        
        {!loading && articles.length > 0 && (
          <div className="flex gap-8 pb-4 snap-x overflow-x-auto">
            {articles.map((article, index) => (
              <ArticleCard key={article.url || index} article={article} />
            ))}
          </div>
        )}

        {!loading && articles.length === 0 && (
            <div className="text-center py-16">
                <p className="text-slate-400 font-semibold">No articles found at the moment.</p>
            </div>
        )}

      </div>
    </section>
  );
};