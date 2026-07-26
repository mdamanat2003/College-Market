import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ScrollView,
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  TextInput, 
  Linking, 
  useWindowDimensions, 
  Platform 
} from 'react-native';
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

const EventCard = React.memo(({ item, handleRegister }: { item: any; handleRegister: (link: string) => void }) => {
  const dateObj = new Date(item.date);
  const monthName = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
  const dayNum = dateObj.getDate();

  return (
    <View testID="event-card" style={styles.eventCard}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.eventImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
          </View>
        )}
        <View style={styles.dateBadge}>
          <Text style={styles.dateMonth}>{monthName}</Text>
          <Text style={styles.dateDay}>{dayNum}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category || 'General'}</Text>
        </View>
      </View>
      
      <View style={styles.eventDetails}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.eventOrganizer}>Hosted by {item.organizer || 'Campus Club'}</Text>
        
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={14} color="#94A3B8" />
          <Text style={styles.metaText} numberOfLines={1}>{formatDate(item.date)}</Text>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#94A3B8" />
          <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={[styles.registerBtn, !item.registrationLink && styles.disabledRegisterBtn]}
            onPress={() => item.registrationLink && handleRegister(item.registrationLink)}
            disabled={!item.registrationLink}
            activeOpacity={0.8}
          >
            <Text style={styles.registerBtnText}>{item.registrationLink ? 'Register Now' : 'Details Only'}</Text>
            {item.registrationLink ? <Ionicons name="arrow-forward" size={13} color="#09090b" style={{ marginLeft: 4 }} /> : null}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

export default function EventsList() {
  const router = useRouter();
  const { events, fetchEvents, isLoading } = useEventStore();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');

  const numColumns = width >= 1150 ? 3 : width >= 720 ? 2 : 1;
  const CARD_GAP = 20;

  useEffect(() => {
    fetchEvents({ category: selectedCategory, search: searchInput });
  }, [selectedCategory, searchInput]);

  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return events;
  }, [events]);

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleRegister = React.useCallback((link: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error("Couldn't load page", err));
    }
  }, []);

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <View style={{ flex: 1, margin: CARD_GAP / 2 }}>
      <EventCard item={item} handleRegister={handleRegister} />
    </View>
  ), [handleRegister]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* --- Header Section --- */}
      <View style={styles.headerSection}>
        <View style={styles.titleBox}>
          <Text style={styles.kicker}>Campus Events & Festivals</Text>
          <Text style={styles.pageTitle}>Campus Fests & Events</Text>
          <Text style={styles.subtitle}>
            Discover upcoming cultural fests, tech symposiums, workshops, and sports tournaments across college campuses.
          </Text>
        </View>

        <TouchableOpacity 
          testID="sell-btn"
          style={styles.createBtn} 
          onPress={() => router.push('/events/create')}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-clear" size={18} color="#09090b" />
          <Text style={styles.createBtnText}>Host Event</Text>
        </TouchableOpacity>
      </View>

      {/* --- Search Bar --- */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events by title, organizer, or venue..."
            placeholderTextColor="#CBD5E1"
            value={searchInput}
            onChangeText={setSearchInput}
          />
          {searchInput ? (
            <TouchableOpacity onPress={() => setSearchInput('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* --- Category Filter Card --- */}
      <View style={styles.categoryCard}>
        <Text style={styles.categoryGroupTitle}>EVENT CATEGORIES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat}
              testID="category-chip"
              style={[styles.chip, selectedCategory === cat && styles.activeChip]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.mainContent}>
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#38BDF8" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            style={{ flex: 1, width: '100%' }}
            key={numColumns}
            data={filteredEvents}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            columnWrapperStyle={numColumns > 1 ? [styles.row, filteredEvents.length <= 2 && styles.sparseRow] : undefined}
            showsVerticalScrollIndicator={true}
            removeClippedSubviews={true}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            ListEmptyComponent={
              <View style={[styles.emptyState, { maxWidth: 1440, alignSelf: 'center', width: '100%' }]}>
                <Ionicons name="calendar-outline" size={52} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Upcoming Events</Text>
                <Text style={styles.emptyText}>No campus events match your selected category.</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  row: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },
  sparseRow: {
    justifyContent: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 20,
  },
  titleBox: {
    flex: 1,
    maxWidth: 850,
    gap: 6,
  },
  kicker: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  pageTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#94A3B8',
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
      } as any,
    }),
  },
  createBtnText: {
    color: '#09090b',
    fontWeight: '800',
    fontSize: 14,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  categoryCard: {
    backgroundColor: '#18181b',
    padding: 18,
    borderRadius: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  chipScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeChip: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  chipText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#09090b',
    fontWeight: '800',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  eventCard: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
    height: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      } as any,
    }),
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#09090b',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(9, 9, 11, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    minWidth: 50,
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  eventDetails: {
    padding: 18,
    gap: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 23,
  },
  eventOrganizer: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  registerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  disabledRegisterBtn: {
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
  },
  registerBtnText: {
    color: '#09090b',
    fontSize: 12.5,
    fontWeight: '800',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  footerWrapper: {
    marginTop: 60,
    width: '100%',
    alignSelf: 'stretch',
  },
});