import { useMemo, useRef, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenShell from '../components/ScreenShell';
import { colors } from '../theme/colors';

const API_BASE = 'https://bible-api.com';
const DEFAULT_TRANSLATION = 'almeida';
const STORAGE_KEY = 'bible:lastSelection';
const MIN_FONT_SIZE = 15;
const MAX_FONT_SIZE = 28;
const DEFAULT_FONT_SIZE = 19;

const TRANSLATIONS = [
  { value: 'almeida', label: 'Almeida (PT)' },
  { value: 'web', label: 'WEB (EN)' },
  { value: 'kjv', label: 'KJV (EN)' },
];

const BOOKS = [
  { id: 'genesis', label: 'Genesis', api: 'Genesis', chapters: 50 },
  { id: 'exodo', label: 'Exodo', api: 'Exodus', chapters: 40 },
  { id: 'levitico', label: 'Levitico', api: 'Leviticus', chapters: 27 },
  { id: 'numeros', label: 'Numeros', api: 'Numbers', chapters: 36 },
  { id: 'deuteronomio', label: 'Deuteronomio', api: 'Deuteronomy', chapters: 34 },
  { id: 'josue', label: 'Josue', api: 'Joshua', chapters: 24 },
  { id: 'juizes', label: 'Juizes', api: 'Judges', chapters: 21 },
  { id: 'rute', label: 'Rute', api: 'Ruth', chapters: 4 },
  { id: '1samuel', label: '1 Samuel', api: '1 Samuel', chapters: 31 },
  { id: '2samuel', label: '2 Samuel', api: '2 Samuel', chapters: 24 },
  { id: '1reis', label: '1 Reis', api: '1 Kings', chapters: 22 },
  { id: '2reis', label: '2 Reis', api: '2 Kings', chapters: 25 },
  { id: '1cronicas', label: '1 Cronicas', api: '1 Chronicles', chapters: 29 },
  { id: '2cronicas', label: '2 Cronicas', api: '2 Chronicles', chapters: 36 },
  { id: 'esdras', label: 'Esdras', api: 'Ezra', chapters: 10 },
  { id: 'neemias', label: 'Neemias', api: 'Nehemiah', chapters: 13 },
  { id: 'ester', label: 'Ester', api: 'Esther', chapters: 10 },
  { id: 'jo', label: 'Jo', api: 'Job', chapters: 42 },
  { id: 'salmos', label: 'Salmos', api: 'Psalms', chapters: 150 },
  { id: 'proverbios', label: 'Proverbios', api: 'Proverbs', chapters: 31 },
  { id: 'eclesiastes', label: 'Eclesiastes', api: 'Ecclesiastes', chapters: 12 },
  { id: 'canticos', label: 'Canticos', api: 'Song of Solomon', chapters: 8 },
  { id: 'isaias', label: 'Isaias', api: 'Isaiah', chapters: 66 },
  { id: 'jeremias', label: 'Jeremias', api: 'Jeremiah', chapters: 52 },
  { id: 'lamentacoes', label: 'Lamentacoes', api: 'Lamentations', chapters: 5 },
  { id: 'ezequiel', label: 'Ezequiel', api: 'Ezekiel', chapters: 48 },
  { id: 'daniel', label: 'Daniel', api: 'Daniel', chapters: 12 },
  { id: 'oseias', label: 'Oseias', api: 'Hosea', chapters: 14 },
  { id: 'joel', label: 'Joel', api: 'Joel', chapters: 3 },
  { id: 'amos', label: 'Amos', api: 'Amos', chapters: 9 },
  { id: 'obadias', label: 'Obadias', api: 'Obadiah', chapters: 1 },
  { id: 'jonas', label: 'Jonas', api: 'Jonah', chapters: 4 },
  { id: 'miqueias', label: 'Miqueias', api: 'Micah', chapters: 7 },
  { id: 'naum', label: 'Naum', api: 'Nahum', chapters: 3 },
  { id: 'habacuque', label: 'Habacuque', api: 'Habakkuk', chapters: 3 },
  { id: 'sofonias', label: 'Sofonias', api: 'Zephaniah', chapters: 3 },
  { id: 'ageu', label: 'Ageu', api: 'Haggai', chapters: 2 },
  { id: 'zacarias', label: 'Zacarias', api: 'Zechariah', chapters: 14 },
  { id: 'malaquias', label: 'Malaquias', api: 'Malachi', chapters: 4 },
  { id: 'mateus', label: 'Mateus', api: 'Matthew', chapters: 28 },
  { id: 'marcos', label: 'Marcos', api: 'Mark', chapters: 16 },
  { id: 'lucas', label: 'Lucas', api: 'Luke', chapters: 24 },
  { id: 'joao', label: 'Joao', api: 'John', chapters: 21 },
  { id: 'atos', label: 'Atos', api: 'Acts', chapters: 28 },
  { id: 'romanos', label: 'Romanos', api: 'Romans', chapters: 16 },
  { id: '1corintios', label: '1 Corintios', api: '1 Corinthians', chapters: 16 },
  { id: '2corintios', label: '2 Corintios', api: '2 Corinthians', chapters: 13 },
  { id: 'galatas', label: 'Galatas', api: 'Galatians', chapters: 6 },
  { id: 'efesios', label: 'Efesios', api: 'Ephesians', chapters: 6 },
  { id: 'filipenses', label: 'Filipenses', api: 'Philippians', chapters: 4 },
  { id: 'colossenses', label: 'Colossenses', api: 'Colossians', chapters: 4 },
  { id: '1tessalonicenses', label: '1 Tessalonicenses', api: '1 Thessalonians', chapters: 5 },
  { id: '2tessalonicenses', label: '2 Tessalonicenses', api: '2 Thessalonians', chapters: 3 },
  { id: '1timoteo', label: '1 Timoteo', api: '1 Timothy', chapters: 6 },
  { id: '2timoteo', label: '2 Timoteo', api: '2 Timothy', chapters: 4 },
  { id: 'tito', label: 'Tito', api: 'Titus', chapters: 3 },
  { id: 'filemom', label: 'Filemom', api: 'Philemon', chapters: 1 },
  { id: 'hebreus', label: 'Hebreus', api: 'Hebrews', chapters: 13 },
  { id: 'tiago', label: 'Tiago', api: 'James', chapters: 5 },
  { id: '1pedro', label: '1 Pedro', api: '1 Peter', chapters: 5 },
  { id: '2pedro', label: '2 Pedro', api: '2 Peter', chapters: 3 },
  { id: '1joao', label: '1 Joao', api: '1 John', chapters: 5 },
  { id: '2joao', label: '2 Joao', api: '2 John', chapters: 1 },
  { id: '3joao', label: '3 Joao', api: '3 John', chapters: 1 },
  { id: 'judas', label: 'Judas', api: 'Jude', chapters: 1 },
  { id: 'apocalipse', label: 'Apocalipse', api: 'Revelation', chapters: 22 },
];

function OptionModal({ visible, title, options, onClose, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable style={styles.modalOption} onPress={() => onSelect(item)}>
                <Text style={styles.modalOptionText}>{item.label}</Text>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function BibleScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 430;
  const isWide = width >= 920;

  const [selectedBook, setSelectedBook] = useState(BOOKS[0]);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedTranslation, setSelectedTranslation] = useState(DEFAULT_TRANSLATION);
  const [referenceInput, setReferenceInput] = useState('');
  const [verses, setVerses] = useState([]);
  const [reference, setReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [chapterModalVisible, setChapterModalVisible] = useState(false);
  const [translationModalVisible, setTranslationModalVisible] = useState(false);
  const [isReaderVisible, setIsReaderVisible] = useState(false);
  const [readerSearchOpen, setReaderSearchOpen] = useState(false);
  const [readerTextControlsOpen, setReaderTextControlsOpen] = useState(false);
  const [readerFontSize, setReaderFontSize] = useState(DEFAULT_FONT_SIZE);
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(1)).current;
  const lastScrollOffset = useRef(0);

  useEffect(() => {
    const parent = navigation.getParent();
    if (!parent) return;

    if (isReaderVisible) {
      parent.setOptions({
        tabBarStyle: {
          display: 'none',
        },
      });
      return;
    }

    parent.setOptions({
      tabBarStyle: {
        backgroundColor: colors.backgroundElevated,
        borderTopColor: colors.border,
        height: isCompact ? 62 : 70,
        paddingTop: isCompact ? 4 : 6,
        paddingBottom: isCompact ? 6 : 8,
      },
    });
  }, [isReaderVisible, navigation, isCompact]);

  const chapterOptions = useMemo(
    () =>
      Array.from({ length: selectedBook.chapters }, (_, idx) => ({
        value: String(idx + 1),
        label: `Capitulo ${idx + 1}`,
      })),
    [selectedBook]
  );

  const bookOptions = useMemo(
    () => BOOKS.map((book) => ({ value: book.id, label: book.label, book })),
    []
  );

  const translationOptions = useMemo(
    () => TRANSLATIONS.map((item) => ({ value: item.value, label: item.label })),
    []
  );

  useEffect(() => {
    const loadSavedSelection = async () => {
      try {
        const rawValue = await AsyncStorage.getItem(STORAGE_KEY);
        if (!rawValue) {
          setIsHydrated(true);
          return;
        }

        const parsed = JSON.parse(rawValue);
        const savedBook = BOOKS.find((book) => book.id === parsed.bookId);
        const savedTranslation = TRANSLATIONS.find((item) => item.value === parsed.translation);

        if (savedBook) {
          setSelectedBook(savedBook);
          const chapter = Number(parsed.chapter || 1);
          setSelectedChapter(Math.min(Math.max(chapter, 1), savedBook.chapters));
        }

        if (savedTranslation) {
          setSelectedTranslation(savedTranslation.value);
        }
      } catch {
        // If storage read fails, continue with defaults.
      } finally {
        setIsHydrated(true);
      }
    };

    loadSavedSelection();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const persistSelection = async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            bookId: selectedBook.id,
            chapter: selectedChapter,
            translation: selectedTranslation,
          })
        );
      } catch {
        // Ignore persist errors to avoid blocking reading flow.
      }
    };

    persistSelection();
  }, [isHydrated, selectedBook, selectedChapter, selectedTranslation]);

  useEffect(() => {
    if (!isHydrated) return;

    const fetchChapter = async () => {
      setIsLoading(true);
      setError('');
      const bibleReference = `${selectedBook.api} ${selectedChapter}`;

      try {
        const url = `${API_BASE}/${encodeURIComponent(
          bibleReference
        )}?translation=${selectedTranslation}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Falha ao carregar capitulo.');
        }

        const data = await response.json();
        if (!data.verses || data.verses.length === 0) {
          throw new Error('Nao foi possivel obter versiculos para este capitulo.');
        }

        setReference(data.reference || `${selectedBook.label} ${selectedChapter}`);
        setVerses(data.verses);
      } catch (err) {
        setVerses([]);
        setReference(`${selectedBook.label} ${selectedChapter}`);
        setError(err.message || 'Ocorreu um erro ao carregar a Biblia.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [isHydrated, selectedBook, selectedChapter, selectedTranslation]);

  const normalizeText = (value) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  const parseReference = (inputValue) => {
    const clean = normalizeText(inputValue);
    if (!clean) return null;

    const match = clean.match(/^(.+?)\s+(\d+)(?::\d+)?$/);
    if (!match) return null;

    const rawBookName = match[1].trim();
    const chapter = Number(match[2]);
    if (!chapter || chapter < 1) return null;

    const parsedBook = BOOKS.find((book) => normalizeText(book.label) === rawBookName);
    if (!parsedBook) return null;
    if (chapter > parsedBook.chapters) return null;

    return { parsedBook, chapter };
  };

  const handleSearchReference = () => {
    const parsed = parseReference(referenceInput);
    if (!parsed) {
      setError('Referencia invalida. Exemplo: Joao 3');
      return;
    }

    setError('');
    setSelectedBook(parsed.parsedBook);
    setSelectedChapter(parsed.chapter);
    setReaderSearchOpen(false);
  };

  const increaseFontSize = () => {
    setReaderFontSize((prev) => Math.min(prev + 1, MAX_FONT_SIZE));
  };

  const decreaseFontSize = () => {
    setReaderFontSize((prev) => Math.max(prev - 1, MIN_FONT_SIZE));
  };

  const onSelectBook = (item) => {
    setSelectedBook(item.book);
    setSelectedChapter(1);
    setBookModalVisible(false);
  };

  const onSelectChapter = (item) => {
    setSelectedChapter(Number(item.value));
    setChapterModalVisible(false);
  };

  const onSelectTranslation = (item) => {
    setSelectedTranslation(item.value);
    setTranslationModalVisible(false);
  };

  const goToPreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter((prev) => prev - 1);
    }
  };

  const goToNextChapter = () => {
    if (selectedChapter < selectedBook.chapters) {
      setSelectedChapter((prev) => prev + 1);
    }
  };

  return (
    <ScreenShell title="Biblia" subtitle="Leitura diaria em Portugues (Almeida)">
      <View style={styles.container}>
        <View style={[styles.selectorRow, isCompact && styles.selectorRowStack]}>
          <Pressable
            style={[styles.selectorButton, isCompact && styles.selectorButtonStack]}
            onPress={() => setBookModalVisible(true)}
          >
            <Ionicons name="book" size={16} color={colors.primary} />
            <Text style={styles.selectorText}>{selectedBook.label}</Text>
          </Pressable>

          <Pressable
            style={[styles.selectorButton, isCompact && styles.selectorButtonStack]}
            onPress={() => setChapterModalVisible(true)}
          >
            <Ionicons name="list" size={16} color={colors.primary} />
            <Text style={styles.selectorText}>Capitulo {selectedChapter}</Text>
          </Pressable>
        </View>

        <Text style={styles.referenceText}>{reference || `${selectedBook.label} ${selectedChapter}`}</Text>

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>A carregar versiculos...</Text>
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <Ionicons name="alert-circle-outline" size={26} color={colors.warning} />
            <Text style={styles.stateText}>{error}</Text>
          </View>
        ) : (
          <View style={[styles.selectionReadyCard, isWide && styles.selectionReadyCardWide]}>
            <Ionicons name="book-outline" size={20} color={colors.primary} />
            <Text style={styles.selectionReadyTitle}>Capitulo pronto para leitura</Text>
            <Text style={styles.selectionReadyText}>
              {reference || `${selectedBook.label} ${selectedChapter}`} carregado. Entra no modo imersivo para ler sem distracoes.
            </Text>

            <Pressable style={styles.startReadingButton} onPress={() => setIsReaderVisible(true)}>
              <Ionicons name="expand" size={16} color="#fff" />
              <Text style={styles.startReadingButtonText}>Abrir Modo de Leitura</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Modal
        visible={isReaderVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsReaderVisible(false)}
      >
        <View style={styles.readerContainer}>
          <Animated.View
            style={[
              styles.readerHeaderWrap,
              {
                transform: [
                  {
                    translateY: headerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-88, 0],
                    }),
                  },
                ],
                opacity: headerAnim,
              },
            ]}
          >
            <View style={styles.readerTopBar}>
              <Text style={styles.readerReference} numberOfLines={1}>
                {reference}
              </Text>
              <View style={styles.readerActions}>
                <Pressable style={styles.iconButton} onPress={() => setReaderSearchOpen((v) => !v)}>
                  <Ionicons name="search" size={16} color={colors.textPrimary} />
                </Pressable>
                <Pressable style={styles.iconButton} onPress={() => setTranslationModalVisible(true)}>
                  <Ionicons name="book" size={16} color={colors.textPrimary} />
                </Pressable>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => setReaderTextControlsOpen((v) => !v)}
                >
                  <Ionicons name="text" size={16} color={colors.textPrimary} />
                </Pressable>
              </View>
            </View>

            {readerSearchOpen ? (
              <View style={styles.readerSearchRow}>
                <TextInput
                  placeholder="Pesquisar referencia (ex: Joao 3)"
                  placeholderTextColor="#8a7350"
                  style={styles.readerSearchInput}
                  value={referenceInput}
                  onChangeText={setReferenceInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={handleSearchReference}
                />
                <Pressable style={styles.readerSearchButton} onPress={handleSearchReference}>
                  <Ionicons name="arrow-forward" size={15} color="#fff" />
                </Pressable>
              </View>
            ) : null}

            {readerTextControlsOpen ? (
              <View style={styles.textControlsRow}>
                <Pressable
                  style={styles.fontButton}
                  onPress={decreaseFontSize}
                  disabled={readerFontSize <= MIN_FONT_SIZE}
                >
                  <Ionicons name="remove" size={16} color={colors.textPrimary} />
                </Pressable>
                <Text style={styles.fontSizeLabel}>Tamanho {readerFontSize}</Text>
                <Pressable
                  style={styles.fontButton}
                  onPress={increaseFontSize}
                  disabled={readerFontSize >= MAX_FONT_SIZE}
                >
                  <Ionicons name="add" size={16} color={colors.textPrimary} />
                </Pressable>
              </View>
            ) : null}
          </Animated.View>

          <Animated.FlatList
            data={verses}
            keyExtractor={(item) => `${item.chapter}-${item.verse}`}
            renderItem={({ item }) => (
              <View style={styles.readerVerseRow}>
                <Text style={styles.readerVerseNumber}>{item.verse}</Text>
                <Text style={[styles.readerVerseText, { fontSize: readerFontSize, lineHeight: readerFontSize * 1.7 }]}>
                  {item.text.trim()}
                </Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.readerListContent,
              isCompact && styles.readerListContentCompact,
              isWide && styles.readerListContentWide,
            ]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: true,
                listener: (event) => {
                  const offsetY = event.nativeEvent.contentOffset.y;
                  if (offsetY > lastScrollOffset.current + 8 && offsetY > 24) {
                    Animated.timing(headerAnim, {
                      toValue: 0,
                      duration: 180,
                      useNativeDriver: true,
                    }).start();
                  } else if (offsetY < lastScrollOffset.current - 8 || offsetY < 12) {
                    Animated.timing(headerAnim, {
                      toValue: 1,
                      duration: 180,
                      useNativeDriver: true,
                    }).start();
                  }
                  lastScrollOffset.current = offsetY;
                },
              }
            )}
            scrollEventThrottle={16}
          />

          <Pressable style={styles.readerCloseFab} onPress={() => setIsReaderVisible(false)}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
            <Text style={styles.readerCloseFabText}>Voltar</Text>
          </Pressable>

          <View style={[styles.readerFooterButtons, isCompact && styles.readerFooterButtonsCompact]}>
            <Pressable
              style={[
                styles.chapterButton,
                isCompact && styles.chapterButtonCompact,
                selectedChapter === 1 && styles.disabledButton,
              ]}
              onPress={goToPreviousChapter}
              disabled={selectedChapter === 1}
            >
              <Ionicons name="chevron-back" size={16} color="#fff" />
              <Text style={[styles.chapterButtonText, isCompact && styles.chapterButtonTextCompact]}>
                Capitulo Anterior
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.chapterButton,
                isCompact && styles.chapterButtonCompact,
                selectedChapter === selectedBook.chapters && styles.disabledButton,
              ]}
              onPress={goToNextChapter}
              disabled={selectedChapter === selectedBook.chapters}
            >
              <Text style={[styles.chapterButtonText, isCompact && styles.chapterButtonTextCompact]}>
                Proximo Capitulo
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      </Modal>

      <OptionModal
        visible={bookModalVisible}
        title="Escolher Livro"
        options={bookOptions}
        onClose={() => setBookModalVisible(false)}
        onSelect={onSelectBook}
      />

      <OptionModal
        visible={chapterModalVisible}
        title="Escolher Capitulo"
        options={chapterOptions}
        onClose={() => setChapterModalVisible(false)}
        onSelect={onSelectChapter}
      />

      <OptionModal
        visible={translationModalVisible}
        title="Escolher Traducao"
        options={translationOptions}
        onClose={() => setTranslationModalVisible(false)}
        onSelect={onSelectTranslation}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  selectorRowStack: {
    flexDirection: 'column',
  },
  selectorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  selectorButtonStack: {
    width: '100%',
  },
  selectorText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  referenceText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  selectionReadyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  selectionReadyCardWide: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 760,
  },
  selectionReadyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6,
  },
  selectionReadyText: {
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 12,
  },
  startReadingButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  startReadingButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 14,
  },
  verseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  verseNumber: {
    color: colors.primary,
    fontWeight: '800',
    width: 24,
    fontSize: 15,
  },
  verseText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 23,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  stateText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  chapterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  disabledButton: {
    opacity: 0.4,
  },
  chapterButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  readerContainer: {
    flex: 1,
    backgroundColor: '#f5f1e8',
  },
  readerHeaderWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#f5f1e8',
    borderBottomWidth: 1,
    borderBottomColor: '#e1d8c7',
  },
  readerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#f5f1e8',
  },
  readerReference: {
    color: '#4b4438',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
  },
  readerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cfc4af',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efe8d7',
  },
  readerSearchRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  readerSearchInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cfc4af',
    backgroundColor: '#f0e8d7',
    color: '#2d2923',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  readerSearchButton: {
    width: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a3329',
  },
  textControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  fontButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cfc4af',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#efe8d7',
  },
  fontSizeLabel: {
    color: '#4b4438',
    fontWeight: '700',
    fontSize: 13,
  },
  readerListContent: {
    paddingHorizontal: 20,
    paddingTop: 92,
    paddingBottom: 110,
  },
  readerListContentCompact: {
    paddingHorizontal: 14,
  },
  readerListContentWide: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 920,
  },
  readerVerseRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  readerVerseNumber: {
    width: 24,
    color: '#9d8a70',
    fontSize: 12,
    fontWeight: '600',
    paddingTop: 6,
  },
  readerVerseText: {
    flex: 1,
    color: '#2d2923',
    letterSpacing: 0.2,
  },
  readerCloseFab: {
    position: 'absolute',
    right: 14,
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    backgroundColor: '#3a3329',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  readerCloseFabText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  readerFooterButtons: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: 'rgba(16,14,11,0.85)',
  },
  readerFooterButtonsCompact: {
    gap: 8,
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  chapterButtonCompact: {
    paddingVertical: 10,
  },
  chapterButtonTextCompact: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 8, 22, 0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '78%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  modalOptionText: {
    color: colors.textPrimary,
    fontSize: 15,
  },
});
