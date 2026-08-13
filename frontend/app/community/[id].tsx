import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, RADIUS } from '../../theme/colors';
import { useCommunityStore, CommunityComment } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    activePost,
    comments,
    isLoading,
    isSubmitting,
    fetchPostById,
    toggleLikePost,
    addComment,
    toggleLikeComment,
    acceptAnswer,
    deletePost,
    deleteComment,
  } = useCommunityStore();

  const [commentText, setCommentText] = useState('');
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPostById(id as string);
    }
  }, [id]);

  const scrollRef = React.useRef<ScrollView>(null);
  const handleBackToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  if (isLoading || !activePost) {
    return (
      <View style={styles.container}>
        <Navbar />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.loadingScrollContent}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Loading question details...</Text>
          </View>
          <Footer />
        </ScrollView>
      </View>
    );
  }

  const isLiked = user ? activePost.likes?.includes(user._id) : false;
  const isPostAuthor = user?._id === activePost.author?._id;

  const handlePostComment = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!commentText.trim()) return;

    const success = await addComment(activePost._id, commentText, isAnonymousComment);
    if (success) {
      setCommentText('');
      setIsAnonymousComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (Platform.OS === 'web') {
      if (confirm('Are you sure you want to delete this question?')) {
        const ok = await deletePost(activePost._id);
        if (ok) router.replace('/community' as any);
      }
    } else {
      Alert.alert('Delete Post', 'Are you sure you want to delete this question?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await deletePost(activePost._id);
            if (ok) router.replace('/community' as any);
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentWrapper}>
          {/* Back Navigation Bar */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/community' as any)}>
            <Ionicons name="arrow-back" size={20} color="#38BDF8" />
            <Text style={styles.backBtnText}>Back to Community</Text>
          </TouchableOpacity>

          {/* Main Question Card */}
          <View style={styles.postCard}>
            {/* Header: Author Info */}
            <View style={styles.postHeader}>
              <View style={styles.authorRow}>
                {activePost.isAnonymous ? (
                  <View style={[styles.avatar, styles.anonymousAvatar]}>
                    <Ionicons name="eye-off-outline" size={20} color="#38BDF8" />
                  </View>
                ) : activePost.author?.avatar ? (
                  <Image source={{ uri: activePost.author.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.initialAvatar]}>
                    <Text style={styles.initialText}>
                      {activePost.author?.name ? activePost.author.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}

                <View style={styles.authorInfo}>
                  <Text style={styles.authorName}>
                    {activePost.isAnonymous ? 'Anonymous Student' : activePost.author?.name || 'Student'}
                  </Text>
                  <Text style={styles.postTime}>
                    {new Date(activePost.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    • {activePost.author?.college || 'Campus'}
                  </Text>
                </View>
              </View>

              <View style={styles.badgeRow}>
                {activePost.status === 'Solved' && (
                  <View style={styles.solvedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={styles.solvedBadgeText}>Solved</Text>
                  </View>
                )}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{activePost.category}</Text>
                </View>
              </View>
            </View>

            {/* Post Title & Description */}
            <Text style={styles.postTitle}>{activePost.title}</Text>
            <Text style={styles.postContent}>{activePost.content}</Text>

            {/* Post Image */}
            {activePost.image ? (
              <Image source={{ uri: activePost.image }} style={styles.postImage} resizeMode="contain" />
            ) : null}

            {/* Tags */}
            {activePost.tags && activePost.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {activePost.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagPill}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Bar */}
            <View style={styles.postFooter}>
              <TouchableOpacity
                style={[styles.actionBtn, isLiked && styles.actionBtnActive]}
                onPress={() => {
                  if (!user) {
                    router.push('/(auth)/login');
                    return;
                  }
                  toggleLikePost(activePost._id, user._id);
                }}
              >
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isLiked ? '#EF4444' : '#94A3B8'}
                />
                <Text style={[styles.actionText, isLiked && { color: '#EF4444', fontWeight: '700' }]}>
                  {activePost.likes?.length || 0} Upvotes
                </Text>
              </TouchableOpacity>

              <View style={styles.actionBtn}>
                <Ionicons name="chatbubble-outline" size={20} color="#94A3B8" />
                <Text style={styles.actionText}>{comments.length} Answers</Text>
              </View>

              <View style={styles.actionBtn}>
                <Ionicons name="eye-outline" size={20} color="#94A3B8" />
                <Text style={styles.actionText}>{activePost.views || 0} Views</Text>
              </View>

              {(isPostAuthor || user?.role === 'admin') && (
                <TouchableOpacity style={styles.deletePostBtn} onPress={handleDeletePost}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Add Answer / Comment Section */}
          <View style={styles.commentComposerBox}>
            <Text style={styles.composerHeader}>Write an Answer / Thought</Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Provide an answer or share your perspective..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
              value={commentText}
              onChangeText={setCommentText}
            />

            <View style={styles.composerControls}>
              <TouchableOpacity
                style={styles.anonymousToggle}
                onPress={() => setIsAnonymousComment(!isAnonymousComment)}
              >
                <Ionicons
                  name={isAnonymousComment ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={isAnonymousComment ? '#38BDF8' : '#64748B'}
                />
                <Text style={styles.anonymousToggleText}>Post Anonymously</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitCommentBtn,
                  (!commentText.trim() || isSubmitting) && styles.disabledSubmitBtn,
                ]}
                disabled={!commentText.trim() || isSubmitting}
                onPress={handlePostComment}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#09090b" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#09090b" />
                    <Text style={styles.submitCommentText}>Post Answer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Answers & Comments List */}
          <View style={styles.answersSection}>
            <Text style={styles.answersTitle}>
              {comments.length} {comments.length === 1 ? 'Answer' : 'Answers'}
            </Text>

            {comments.length === 0 ? (
              <View style={styles.noCommentsBox}>
                <Ionicons name="chatbox-outline" size={36} color="#475569" />
                <Text style={styles.noCommentsText}>No answers yet. Be the first to reply!</Text>
              </View>
            ) : (
              comments.map((comment: CommunityComment) => {
                const isCommentLiked = user ? comment.likes?.includes(user._id) : false;
                const canDeleteComment =
                  user?._id === comment.author?._id || isPostAuthor || user?.role === 'admin';

                return (
                  <View
                    key={comment._id}
                    style={[
                      styles.commentCard,
                      comment.isAcceptedAnswer && styles.acceptedCommentCard,
                    ]}
                  >
                    {comment.isAcceptedAnswer && (
                      <View style={styles.acceptedBanner}>
                        <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                        <Text style={styles.acceptedBannerText}>ACCEPTED SOLUTION</Text>
                      </View>
                    )}

                    <View style={styles.commentHeader}>
                      <View style={styles.authorRow}>
                        {comment.isAnonymous ? (
                          <View style={[styles.commentAvatar, styles.anonymousAvatar]}>
                            <Ionicons name="eye-off-outline" size={16} color="#38BDF8" />
                          </View>
                        ) : comment.author?.avatar ? (
                          <Image source={{ uri: comment.author.avatar }} style={styles.commentAvatar} />
                        ) : (
                          <View style={[styles.commentAvatar, styles.initialAvatar]}>
                            <Text style={styles.initialText}>
                              {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                          </View>
                        )}

                        <View>
                          <Text style={styles.commentAuthorName}>
                            {comment.isAnonymous ? 'Anonymous Student' : comment.author?.name || 'Student'}
                          </Text>
                          <Text style={styles.commentTime}>
                            {new Date(comment.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                        </View>
                      </View>

                      {canDeleteComment && (
                        <TouchableOpacity
                          onPress={() => deleteComment(activePost._id, comment._id)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text style={styles.commentBody}>{comment.content}</Text>

                    <View style={styles.commentFooter}>
                      <TouchableOpacity
                        style={styles.commentLikeBtn}
                        onPress={() => {
                          if (!user) {
                            router.push('/(auth)/login');
                            return;
                          }
                          toggleLikeComment(activePost._id, comment._id, user._id);
                        }}
                      >
                        <Ionicons
                          name={isCommentLiked ? 'heart' : 'heart-outline'}
                          size={16}
                          color={isCommentLiked ? '#EF4444' : '#94A3B8'}
                        />
                        <Text style={[styles.commentLikeText, isCommentLiked && { color: '#EF4444' }]}>
                          {comment.likes?.length || 0} Upvotes
                        </Text>
                      </TouchableOpacity>

                      {isPostAuthor && (
                        <TouchableOpacity
                          style={[
                            styles.acceptBtn,
                            comment.isAcceptedAnswer && styles.acceptBtnActive,
                          ]}
                          onPress={() => acceptAnswer(activePost._id, comment._id)}
                        >
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={16}
                            color={comment.isAcceptedAnswer ? '#10B981' : '#94A3B8'}
                          />
                          <Text
                            style={[
                              styles.acceptBtnText,
                              comment.isAcceptedAnswer && { color: '#10B981', fontWeight: '800' },
                            ]}
                          >
                            {comment.isAcceptedAnswer ? 'Accepted Solution' : 'Accept Solution'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

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
  loadingScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  loadingBox: {
    flex: 1,
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
  },
  contentWrapper: {
    flexGrow: 1,
    flexShrink: 0,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    fontSize: 16,
  },
  authorInfo: {
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 15,
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  categoryBadgeText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 12,
    lineHeight: 30,
  },
  postContent: {
    fontSize: 15.5,
    color: '#CBD5E1',
    lineHeight: 24,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 16,
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
    fontSize: 13.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  deletePostBtn: {
    marginLeft: 'auto',
    padding: 6,
  },
  commentComposerBox: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  composerHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    padding: 14,
    color: '#F8FAFC',
    fontSize: 14.5,
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
  },
  composerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anonymousToggleText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  submitCommentBtn: {
    backgroundColor: '#38BDF8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.round,
    gap: 6,
  },
  disabledSubmitBtn: {
    opacity: 0.5,
  },
  submitCommentText: {
    color: '#09090b',
    fontWeight: '800',
    fontSize: 13.5,
  },
  answersSection: {
    marginTop: 8,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  noCommentsBox: {
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  noCommentsText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 10,
  },
  commentCard: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  acceptedCommentCard: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  acceptedBannerText: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAuthorName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  commentTime: {
    fontSize: 11.5,
    color: '#94A3B8',
  },
  commentBody: {
    fontSize: 14.5,
    color: '#CBD5E1',
    lineHeight: 22,
    marginBottom: 12,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentLikeText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  acceptBtnActive: {},
  acceptBtnText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
