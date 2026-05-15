import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function ChatRoomScreen() {
  const { id } = useLocalSearchParams(); // conversationId
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchMessages, currentMessages, sendMessage } = useChatStore();
  
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (id) {
      fetchMessages(id as string);
    }
  }, [id]);

  const handleSend = () => {
    if (!text.trim()) return;

    // Temporary logic: Hamein receiverId chahiye hoga, jo ideally backend se aana chahiye
    // Abhi ke liye hum send message trigger kar rahe hain
    sendMessage(id as string, 'RECEIVER_ID_HERE', user?._id as string, text);
    setText('');
    
    // Auto scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isOwn = item.sender === user?._id;

    return (
      <View style={[styles.messageWrapper, isOwn ? styles.messageOwn : styles.messageOther]}>
        <View style={[styles.messageBubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.messageText, isOwn ? styles.textOwn : styles.textOther]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isOwn ? styles.timeOwn : styles.timeOther]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Chat</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Messages Area */}
      <FlatList
        ref={flatListRef}
        data={currentMessages}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message or offer..."
          placeholderTextColor={COLORS.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} 
          onPress={handleSend}
          disabled={!text.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  chatArea: { padding: SPACING.md, flexGrow: 1, justifyContent: 'flex-end' },
  messageWrapper: { marginBottom: SPACING.md, flexDirection: 'row' },
  messageOwn: { justifyContent: 'flex-end' },
  messageOther: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 16, elevation: 1 },
  bubbleOwn: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  textOwn: { color: '#fff' },
  textOther: { color: COLORS.text },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeOwn: { color: 'rgba(255,255,255,0.7)' },
  timeOther: { color: COLORS.textMuted },
  inputContainer: { flexDirection: 'row', padding: SPACING.md, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, alignItems: 'center' },
  input: { flex: 1, backgroundColor: COLORS.surface, minHeight: 40, maxHeight: 100, borderRadius: 20, paddingHorizontal: SPACING.md, paddingTop: 10, paddingBottom: 10, fontSize: 15, color: COLORS.text },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.sm },
  sendBtnDisabled: { opacity: 0.5 }
});