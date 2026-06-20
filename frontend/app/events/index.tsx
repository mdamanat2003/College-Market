import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useEventStore } from '../../store/eventStore';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';

const CATEGORIES = ['All', 'Cultural', 'Technical', 'Sports', 'Workshop', 'Other'];

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const EventCard = React.memo(({ item, handleRegister }: { item: any; handleRegister: (link: string) => void }) => (
  <View style={styles.eventCard}>
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.eventImage} />
    ) : (
      <View style={styles.placeholderImage}>
        <Ionicons name="calendar" size={48} color={COLORS.primaryLight} />
      </View>
    )}
    
    <View style={styles.eventInfo}>
      <View style={styles.dateBadge}>
        <Text style={styles.dateMonth}>{new Date(item.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
        <Text style={styles.dateDay}>{new Date(item.date).getDate()}</Text>
      </View>

      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.eventOrganizer}>By {item.organizer}</Text>
        
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.metaText}>{item.location}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          
          {item.registrationLink && (
            <TouchableOpacity 
              style={styles.registerBtn}
              onPress={() => handleRegister(item.registrationLink!)}
            >
              <Text style={styles.registerBtnText}>Register</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  </View>
));

export default function EventsList() {
  const router = useRouter();
  const { events, fetchEvents, isLoading } = useEventStore();
  const listRef = useRef<FlatList>(null);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchEvents({ category: selectedCategory, search });
  }, [selectedCategory, search]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleRegister = React.useCallback((link: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error("Couldn't load page", err));
    }
  }, []);

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <EventCard item={item} handleRegister={handleRegister} />
  ), [handleRegister]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Campus Fests & Events</Text>
          <TouchableOpacity 
            style={styles.createBtn} 
            onPress={() => router.push('/events/create')}
          >
            <Ionicons name="add" size={20} color={COLORS.background} />
            <Text style={styles.createBtnText}>Host Event</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Categories */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, organizers..."
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
          />
        </View>

        <View style={styles.categoryScroll}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.chip, selectedCategory === item && styles.activeChip]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.chipText, selectedCategory === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chipList}
          />
        </View>

        {/* Events List */}
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={events}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            removeClippedSubviews={true}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No upcoming events found.</Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footerWrapper}>
                <Footer onBackToTop={handleBackToTop} />
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.heading },
  createBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, gap: 6, alignItems: 'center' },
  createBtnText: { color: COLORS.background, fontWeight: '600' },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, paddingHorizontal: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  searchInput: { flex: 1, height: 44, color: COLORS.text, paddingLeft: 8 },

  categoryScroll: { marginBottom: SPACING.lg },
  chipList: { gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  activeChipText: { color: COLORS.background },

  listContent: { flexGrow: 1, gap: SPACING.lg, paddingBottom: 0 },
  eventCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  eventImage: { width: '100%', height: 160, resizeMode: 'cover' },
  placeholderImage: { width: '100%', height: 160, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  
  eventInfo: { flexDirection: 'row', padding: SPACING.md, gap: SPACING.md },
  dateBadge: { alignItems: 'center', backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#BAE6FD', height: 60 },
  dateMonth: { fontSize: 12, fontWeight: '700', color: '#0369A1' },
  dateDay: { fontSize: 20, fontWeight: '800', color: '#0284C7' },
  
  eventDetails: { flex: 1 },
  eventTitle: { fontSize: 18, fontWeight: '700', color: COLORS.heading, marginBottom: 2 },
  eventOrganizer: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaText: { fontSize: 13, color: COLORS.textMuted },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  categoryBadge: { backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: COLORS.border },
  categoryText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  registerBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.md },
  registerBtnText: { color: COLORS.background, fontSize: 13, fontWeight: '700' },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
  footerWrapper: { marginHorizontal: -SPACING.lg, marginTop: 40 },
});