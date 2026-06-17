import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import Footer from '../components/layout/Footer';
import { PlaceholderImage } from '../components/ui/PlaceholderImage';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

export default function MessagesInboxScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { conversations, fetchConversations } = useChatStore();
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // Helper function: Conversation me se dusre bande (Buyer/Seller) ka data nikalna
  const getOtherParticipant = (participants: any[]) => {
    return participants.find((p) => p._id !== user?._id);
  };

  const renderItem = ({ item }: { item: any }) => {
    const otherUser = getOtherParticipant(item.participants);
    const productImg = item.product?.images?.[0];

    return (
      <TouchableOpacity 
        style={styles.chatItem} 
        activeOpacity={0.7}
        onPress={() => router.push(`/chat/${item._id}`)} // Agla step: Chat Room par bhejna
      >
        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {otherUser?.name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>

        {/* Chat Details */}
        <View style={styles.chatDetails}>
          <View style={styles.headerRow}>
            <Text style={styles.userName} numberOfLines={1}>{otherUser?.name}</Text>
            {/* Optional Date formatting could go here */}
          </View>
          
          <Text style={styles.productName} numberOfLines={1}>
            Discussing: {item.product?.title}
          </Text>
          
          <Text 
            style={[styles.lastMessage, item.unreadCount > 0 && styles.unreadText]} 
            numberOfLines={1}
          >
            {item.lastMessage || 'Tap to start conversation'}
          </Text>
        </View>

        {/* Product Thumbnail & Unread Badge */}
        <View style={styles.rightSection}>
          {productImg ? (
            <Image source={{ uri: productImg }} style={styles.productThumb} />
          ) : (
            <PlaceholderImage style={styles.productThumb} label="" size={18} />
          )}
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} /> {/* Balance for centering */}
      </View>

      {/* List */}
      <View style={styles.content}>
        {!conversations ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="chatbubbles-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No messages yet.</Text>
            <Text style={styles.emptySubtext}>When you contact sellers or buyers contact you, chats will appear here.</Text>
            <View style={styles.footerWrapper}>
              <Footer onBackToTop={handleBackToTop} />
            </View>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={conversations}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <View style={styles.footerWrapper}>
                <Footer onBackToTop={handleBackToTop} />
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 60,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  content: {
    flex: 1,
    maxWidth: 800, // Good for web readability
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    flexGrow: 1, // 👈 Added to push footer down
    padding: SPACING.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: 40,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  chatDetails: {
    flex: 1,
    marginRight: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  productName: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  unreadText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  productThumb: {
    width: 45,
    height: 45,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  footerWrapper: {
    marginTop: 'auto',
    width: '100%',
  },
});
