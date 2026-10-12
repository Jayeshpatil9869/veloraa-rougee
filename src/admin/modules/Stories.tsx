import React, { useEffect, useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Sparkles,
  FileText,
  CheckCircle,
  Clock,
  Search,
  X,
  Image as ImageIcon,
  Tag as TagIcon,
  Globe,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  DataTable,
  FilterTabs,
  Notice,
  PageHeader,
  PrimaryButton,
  SearchInput,
  StatCard,
  StatusBadge,
  inputClass,
} from '../ui';

interface StoryItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  author: string;
  category: string;
  tags: string[];
  kicker: string;
  chips: string[];
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const BEAUTY_TEMPLATES = [
  {
    title: 'The Art of Lip Care: Nourishing Formulas, Peptides & Long-Wearing Hydration',
    slug: 'the-art-of-lip-care',
    kicker: 'LIPCARE SCIENCE',
    category: 'Formulation Focus',
    excerpt: 'Discover why high-grade cosmetic waxes and bioactive emollients are the foundation of plump, all-day conditioned lips.',
    content: `Achieving supple, radiant lips requires more than surface moisture—it demands a deliberate synergy of conditioning lipids, botanical waxes, and moisture-locking barrier protectors.\n\nAt Veloraa Rougee, our lip treatments are meticulously developed in Milan, combining natural candelilla wax and rich shea esters to nourish beneath the surface while leaving a luminous, non-sticky finish.\n\nFor effortless day-to-night beauty, apply our Lip Balm generously as an overnight restorative ritual or lightly before your favorite satin rouge.`,
    tags: ['lip care', 'cosmetics', 'hydrating balm', 'clean beauty', 'skincare routine'],
    chips: ['Hydration', 'Clean Formulation', 'Milan Craftsmanship'],
    cover_image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: 'Clean Beauty Formulations: Why Velvet Pigments and Non-Toxic Waxes Matter',
    slug: 'clean-beauty-formulations-guide',
    kicker: 'EDITORIAL JOURNAL',
    category: 'Beauty Philosophy',
    excerpt: 'An insider look at cosmetic chemistry: how luxury aesthetics and cruelty-free clean ethics merge into flawless wear.',
    content: `Modern cosmetic lovers no longer have to choose between rich color payoff and clean, non-toxic formulations. The breakthrough lies in micro-milled mineral pigments suspended in ultra-light conditioning plant oils.\n\nOur artisans blend hypoallergenic botanical extracts that allow intense pigment payoff while ensuring sensitive skin remains calm and protected throughout the day.\n\nExplore our latest collections to experience velvet matte textures that never dry out or settle into fine lines.`,
    tags: ['clean cosmetics', 'cruelty-free makeup', 'luxury beauty', 'matte lips', 'beauty advice'],
    chips: ['Cruelty-Free', 'Italian Formulations', 'Pigment Guide'],
    cover_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const StoriesModule: React.FC = () => {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [kicker, setKicker] = useState('');
  const [category, setCategory] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [author, setAuthor] = useState('Veloraa Rougee');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [isSaving, setIsSaving] = useState(false);

  const loadStories = () => {
    setIsLoading(true);
    api<StoryItem[]>('/admin/stories')
      .then((data) => setStories(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stories'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadStories();
  }, []);

  const openNewEditor = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setKicker('EDITORIAL SPOTLIGHT');
    setCategory('Cosmetics');
    setExcerpt('');
    setContent('');
    setCoverImage('');
    setAuthor('Veloraa Rougee');
    setTagsInput('luxury cosmetics, clean beauty, lip care');
    setStatus('published');
    setError('');
    setSuccess('');
    setIsEditorOpen(true);
  };

  const openEditEditor = (item: StoryItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSlug(item.slug);
    setKicker(item.kicker || '');
    setCategory(item.category || '');
    setExcerpt(item.excerpt || '');
    setContent(item.content || '');
    setCoverImage(item.cover_image || '');
    setAuthor(item.author || 'Veloraa Rougee');
    setTagsInput(item.tags ? item.tags.join(', ') : '');
    setStatus(item.status);
    setError('');
    setSuccess('');
    setIsEditorOpen(true);
  };

  const applyTemplate = (tmpl: typeof BEAUTY_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setSlug(tmpl.slug);
    setKicker(tmpl.kicker);
    setCategory(tmpl.category);
    setExcerpt(tmpl.excerpt);
    setContent(tmpl.content);
    setCoverImage(tmpl.cover_image);
    setTagsInput(tmpl.tags.join(', '));
    setStatus('published');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      kicker,
      category,
      excerpt,
      content,
      coverImage: coverImage || undefined,
      author: author || 'Veloraa Rougee',
      tags: parsedTags,
      chips: parsedTags.slice(0, 3),
      status,
    };

    try {
      if (editingId) {
        await api(`/admin/stories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess('Article successfully updated!');
      } else {
        await api('/admin/stories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccess('New article published successfully!');
      }
      setIsEditorOpen(false);
      loadStories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, articleTitle: string) => {
    if (!window.confirm(`Delete article "${articleTitle}"?`)) return;
    try {
      await api(`/admin/stories/${id}`, { method: 'DELETE' });
      setSuccess('Article deleted.');
      loadStories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete article.');
    }
  };

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [stories, searchQuery, statusFilter]);

  const publishedCount = stories.filter((s) => s.status === 'published').length;
  const draftCount = stories.filter((s) => s.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Editorial Articles & Cosmetic Journals"
          subtitle="Publish high-ranking cosmetic guides and SEO stories to increase Google visibility and brand reach."
        />
        <PrimaryButton onClick={openNewEditor} className="w-fit flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </PrimaryButton>
      </div>

      {error && <Notice variant="error">{error}</Notice>}
      {success && <Notice variant="success">{success}</Notice>}

      {/* Metrics */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Articles"
          value={String(stories.length)}
          trendLabel="all editorial content"
          icon={BookOpen}
        />
        <StatCard
          label="Published on Live Store"
          value={String(publishedCount)}
          trendLabel="indexed for Google SEO"
          icon={Globe}
        />
        <StatCard
          label="Drafts in Progress"
          value={String(draftCount)}
          trendLabel="unlisted articles"
          icon={FileText}
        />
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[var(--card-bg)] border border-[var(--border-subtle)] rounded-[0.3rem] shadow-xs">
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by title, category, or SEO tags..."
          className="w-full sm:w-80"
        />

        <FilterTabs
          tabs={[
            { id: 'all', label: 'All Stories', count: stories.length },
            { id: 'published', label: 'Published Live', count: publishedCount },
            { id: 'draft', label: 'Drafts', count: draftCount },
          ]}
          activeTab={statusFilter}
          onChange={(id) => setStatusFilter(id as 'all' | 'published' | 'draft')}
        />
      </div>

      {/* Articles Table */}
      <DataTable
        columns={['Cover & Article Title', 'Category', 'SEO Keywords', 'Status', 'Updated', 'Actions']}
        rows={filteredStories.map((story) => [
          <div key="title" className="flex items-center gap-3">
            {story.cover_image ? (
              <img
                src={story.cover_image}
                alt={story.title}
                className="w-12 h-12 object-cover rounded-md border border-[#F0DEF7] shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-md bg-[#FAF5F8] border border-[#F0DEF7] flex items-center justify-center text-[#A06A98] shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="font-bold text-xs text-[#333333] line-clamp-1">{story.title}</p>
              <p className="text-[11px] text-[#888888] font-mono mt-0.5">/stories/{story.slug}</p>
            </div>
          </div>,
          <span key="cat" className="text-xs font-semibold text-[#76416F]">
            {story.kicker || story.category || 'Cosmetics'}
          </span>,
          <div key="tags" className="flex flex-wrap gap-1 max-w-xs">
            {(story.tags || []).slice(0, 3).map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF5F8] text-[#76416F] border border-[#F0DEF7]"
              >
                #{t}
              </span>
            ))}
          </div>,
          <StatusBadge key="stat" value={story.status} />,
          <span key="date" className="text-xs text-[#666666]">
            {new Date(story.updated_at || story.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>,
          <div key="acts" className="flex items-center justify-end gap-1.5">
            <a
              href={`/en/stories`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#666666] hover:text-[#A06A98] hover:bg-[#FAF5F8] rounded transition-colors"
              title="Preview on Boutique"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => openEditEditor(story)}
              className="p-1.5 text-[#666666] hover:text-[#A06A98] hover:bg-[#FAF5F8] rounded transition-colors"
              title="Edit Article"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(story.id, story.title)}
              className="p-1.5 text-[#666666] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Delete Article"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          </div>,
        ])}
        emptyMessage={
          isLoading ? 'Loading stories...' : 'No articles found. Click "Write New Article" to publish your first post!'
        }
      />

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--card-bg)] rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[var(--border-subtle)] shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-5">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {editingId ? 'Edit Article' : 'Publish Cosmetic Article'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Optimize your content with rich beauty advice to rank on Google.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selector for Fast Publishing */}
            {!editingId && (
              <div className="mb-5 p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl">
                <p className="text-xs font-bold text-[var(--accent-primary)] flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>Quick SEO Templates:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {BEAUTY_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(tmpl)}
                      className="text-xs px-2.5 py-1 bg-[var(--card-bg)] hover:bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:text-[var(--accent-primary)] rounded-md transition-colors"
                    >
                      {tmpl.category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. The Science of Hydrating Lip Balms and Mineral Pigments"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="science-of-lip-balms"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Kicker / Tagline
                  </label>
                  <input
                    type="text"
                    value={kicker}
                    onChange={(e) => setKicker(e.target.value)}
                    placeholder="e.g. INGREDIENT SPOTLIGHT"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Clean Cosmetics"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                    Publish Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className={inputClass}
                  >
                    <option value="published">Published (Visible on site)</option>
                    <option value="draft">Draft (Saved privately)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                  Excerpt / Meta Description (for Google Ranking)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Compelling 1-2 sentence overview shown in Google search results and article headers..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                  Article Body &amp; Cosmetics Advice *
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write the full cosmetic article here. Separate paragraphs with double newlines..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                  SEO Keywords &amp; Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="lip balm, cosmetics, natural waxes, matte lipstick, beauty routine"
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#CCCCCC] text-xs font-semibold text-[#666666] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit" disabled={isSaving}>
                  {isSaving ? 'Publishing...' : editingId ? 'Update Article' : 'Publish Article'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
