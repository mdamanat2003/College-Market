import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { useCommunityStore, CommunityPost } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const CATEGORIES = [
  'All',
  'Academic & Exam Prep',
  'Campus Life & Advice',
  'Career & Internships',
  'Tech & Coding',
  'General Discussion',
  'Confessions & Opinions',
];

export default function CommunityFeedScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { user } = useAuthStore();
  const {
    posts,
    isLoading,
    selectedCategory,
    searchQuery,
    sortBy,
    setCategory,
    setSearchQuery,
    setSortBy,
    fetchPosts,
    toggleLikePost,
  } = useCommunityStore();

  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearchSubmit = () => {
    setSearchQuery(localSearch);
  };

  const renderPostCard = ({ item }: { item: CommunityPost }) => {
    const isLiked = user ? item.likes?.includes(user._id) : false;

    return (
      <TouchableOpacity
        style={styles.postCard}
        activeOpacity={0.88}
        onPress={() => router.push(`/community/${item._id}` as any)}
      >
        {/* Header: Author & Category */}
        <View style={styles.postHeader}>
          <View style={styles.authorRow}>
            {item.isAnonymous ? (
              <View style={[styles.avatar, styles.anonymousAvatar]}>
                <Ionicons name="eye-off-outline" size={18} color="#38BDF8" />
              </View>
            ) : item.author?.avatar ? (
              <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.initialAvatar]}>
                <Text style={styles.initialText}>
                  {item.author?.name ? item.author.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}

            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {item.isAnonymous ? 'Anonymous Student' : item.author?.name || 'Student'}
              </Text>
              <Text style={styles.postTime}>
                {new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}{' '}
                • {item.author?.college || 'Campus'}
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            {item.status === 'Solved' && (
              <View style={styles.solvedBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                <Text style={styles.solvedBadgeText}>Solved</Text>
              </View>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          </View>
        </View>

        {/* Post Title & Content */}
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent} numberOfLines={3}>
          {item.content}
        </Text>

        {/* Optional Image */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.postImagePreview} resizeMode="cover" />
        ) : null}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer Actions: Likes, Answers/Comments, Views */}
        <View style={styles.postFooter}>
          <TouchableOpacity
            style={[styles.actionBtn, isLiked && styles.actionBtnActive]}
            onPress={(e) => {
              e.stopPropagation();
              if (!user) {
                router.push('/(auth)/login');
                return;
              }
              toggleLikePost(item._id, user._id);
            }}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? '#EF4444' : '#94A3B8'}
            />
            <Text style={[styles.actionText, isLiked && { color: '#EF4444', fontWeight: '700' }]}>
              {item.likes?.length || 0} Upvotes
            </Text>
          </TouchableOpacity>

          <View style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={18} color="#94A3B8" />
            <Text style={styles.actionText}>{item.answersCount || 0} Answers</Text>
          </View>

          <View style={styles.actionBtn}>
            <Ionicons name="eye-outline" size={18} color="#94A3B8" />
            <Text style={styles.actionText}>{item.views || 0} Views</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const scrollRef = React.useRef<ScrollView>(null);
  const handleBackToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  return (
    <View style={styles.container}>
      <Navbar />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchPosts} tintColor="#38BDF8" />
        }
      >
        {/* Banner Section */}
        <View style={styles.heroBanner}>
          <View style={styles.heroTextContainer}>
            <View style={styles.heroBadge}>
              <Ionicons name="people" size={14} color="#38BDF8" />
              <Text style={styles.heroBadgeText}>Student Q&A & Forum</Text>
            </View>
            <Text style={styles.heroTitle}>College Community</Text>
            <Text style={styles.heroSubtitle}>
              Ask questions, share opinions, discuss exam prep, and solve campus problems together!
            </Text>
          </View>

          <TouchableOpacity
            style={styles.askBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (!user) {
                router.push('/(auth)/login');
                return;
              }
              router.push('/community/create' as any);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#09090b" />
            <Text style={styles.askBtnText}>+ Ask Question / Share Thought</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Sort Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search topics, questions, or tags..."
              placeholderTextColor="#64748B"
              value={localSearch}
              onChangeText={setLocalSearch}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {localSearch ? (
              <TouchableOpacity
                onPress={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Sort Selector */}
          <View style={styles.sortContainer}>
            {[
              { id: 'latest', label: 'Latest', icon: 'time-outline' },
              { id: 'popular', label: 'Popular', icon: 'flame-outline' },
              { id: 'unanswered', label: 'Unanswered', icon: 'help-circle-outline' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.sortPill, sortBy === option.id && styles.sortPillActive]}
                onPress={() => setSortBy(option.id as any)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={14}
                  color={sortBy === option.id ? '#38BDF8' : '#94A3B8'}
                />
                <Text
                  style={[styles.sortPillText, sortBy === option.id && styles.sortPillTextActive]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Post Feed */}
        {isLoading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Loading discussion feed...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={56} color="#475569" />
            <Text style={styles.emptyTitle}>No posts found</Text>
            <Text style={styles.emptySubtitle}>
              Be the first student to ask a question or start a discussion in this topic!
            </Text>
            <TouchableOpacity
              style={styles.emptyAskBtn}
              onPress={() => router.push('/community/create' as any)}
            >
              <Text style={styles.emptyAskBtnText}>Ask First Question</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.feedContainer}>
            <FlatList
              data={posts}
              keyExtractor={(item) => item._id}
              renderItem={renderPostCard}
              scrollEnabled={false} // Nested inside main ScrollView
            />
          </View>
        )}

        <Footer onBackToTop={handleBackToTop} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  heroBanner: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  heroTextContainer: {
    maxWidth: 600,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    gap: 6,
    marginBottom: 8,
  },
  heroBadgeText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14.5,
    color: '#94A3B8',
    lineHeight: 22,
  },
  askBtn: {
    backgroundColor: '#38BDF8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: RADIUS.round,
    gap: 8,
    alignSelf: 'center',
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)' } as any,
    }),
  },
  askBtnText: {
    color: '#09090b',
    fontWeight: '800',
    fontSize: 14.5,
  },
  controlsRow: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBar: {
    flex: 1,
    minWidth: 260,
    height: 44,
    backgroundColor: '#18181b',
    borderRadius: RADIUS.round,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  sortContainer: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    padding: 4,
    borderRadius: RADIUS.round,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    gap: 4,
  },
  sortPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  sortPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  sortPillTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  categoryTextActive: {
    color: '#09090b',
    fontWeight: '800',
  },
  feedContainer: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  postCard: {
    width: '100%',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  initialAvatar: {
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  anonymousAvatar: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    color: '#fff',
    fontWeight: '700',
  },
  authorInfo: {
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  postTime: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },
  solvedBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  categoryBadgeText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    color: '#38BDF8',
    fontSize: 11.5,
    fontWeight: '600',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnActive: {},
  actionText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    minHeight: 300,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    minHeight: 300,
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 400,
  },
  emptyAskBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.round,
    marginTop: 20,
  },
  emptyAskBtnText: {
    color: '#09090b',
    fontWeight: '800',
  },
});
