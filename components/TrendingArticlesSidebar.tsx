
import React from 'react';

const articles = [
  {
    category: 'ADHD',
    title: 'Understanding ADHD: Beyond the Stereotypes',
    source: 'Cognitive Health Weekly',
    imageUrl: 'https://images.unsplash.com/photo-1629752187627-6f893c020e98?q=80&w=200&auto=format&fit=crop',
  },
  {
    category: 'Dyslexia',
    title: 'The Power of Dyslexia-Friendly Fonts',
    source: 'Accessibility Today',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c6f90415ad90?q=80&w=200&auto=format&fit=crop',
  },
  {
    category: 'Autism',
    title: 'Creating Inclusive Workplaces for Autistic Adults',
    source: 'HR Insights',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=200&auto=format&fit=crop',
  },
];

const ArticleSidebarCard: React.FC<typeof articles[0]> = ({ category, title, source, imageUrl }) => (
  <a href="#" className="flex items-center gap-4 group p-3 rounded-lg hover:bg-slate-100 transition-colors">
    <img src={imageUrl} alt={`Image for article: ${title}`} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
    <div>
      <span className="text-xs font-semibold text-blue-500">{category}</span>
      <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 leading-tight">{title}</h4>
      <p className="text-xs text-slate-500 mt-1">{source}</p>
    </div>
  </a>
);

export const TrendingArticlesSidebar: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Trending Articles</h3>
      <div className="space-y-3">
        {articles.map((article, index) => (
          <ArticleSidebarCard key={index} {...article} />
        ))}
      </div>
      <div className="mt-6 text-center">
        <a href="#" className="text-sm font-semibold text-blue-500 hover:underline">
          View All Articles &rarr;
        </a>
      </div>
    </div>
  );
};
