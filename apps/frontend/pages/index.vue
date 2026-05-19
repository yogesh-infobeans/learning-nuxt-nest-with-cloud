<script setup lang="ts">
type BookSummary = {
  id: string;
  title: string;
  status?: string;
  plainTextContent?: string;
};

type BookDetails = {
  id: string;
  title: string;
  status: string;
  htmlContent: string | null;
  failureReason: string | null;
};

const { apiFetch } = useApi();

const title = ref('');
const xmlContent = ref(`<book>
  <title>Nuxt + Nest Learning Book</title>
  <chapters>
    <chapter>
      <title>Introduction</title>
      <paragraph>Nuxt renders the UI for readers.</paragraph>
      <paragraph>Nest handles upload and parsing in the backend.</paragraph>
    </chapter>
    <chapter>
      <title>Search and Cache</title>
      <paragraph>Elasticsearch makes content searchable.</paragraph>
      <paragraph>Redis caches hot content for fast responses.</paragraph>
    </chapter>
  </chapters>
</book>`);
const searchText = ref('');
const books = ref<BookSummary[]>([]);
const selectedBook = ref<BookDetails | null>(null);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const loading = ref(false);

const fetchBooks = async () => {
  books.value = await apiFetch<BookSummary[]>('/books');
};

const uploadBook = async () => {
  loading.value = true;
  message.value = '';

  try {
    await apiFetch('/books/upload', {
      method: 'POST',
      body: {
        title: title.value,
        xmlContent: xmlContent.value,
      },
    });
    message.value = 'Book uploaded. RabbitMQ worker will parse in background.';
    messageType.value = 'success';
    title.value = '';
    await fetchBooks();
  } catch (error) {
    message.value = 'Upload failed. Make sure you are signed in.';
    messageType.value = 'error';
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const searchBooks = async () => {
  if (!searchText.value) {
    await fetchBooks();
    return;
  }

  books.value = await apiFetch<BookSummary[]>(
    `/books/search?q=${encodeURIComponent(searchText.value)}`,
  );
};

const selectBook = async (bookId: string) => {
  selectedBook.value = await apiFetch<BookDetails>(`/books/${bookId}`);
};

onMounted(() => {
  void fetchBooks();
});
</script>

<template>
  <div>
    <h1 class="text-h4 mb-2">Nuxt + Nest Book Platform</h1>
    <p class="text-body-1 mb-6">
      Upload XML books, process in background, index in Elasticsearch, and read parsed HTML.
    </p>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title>Upload XML Book</v-card-title>
          <v-card-text>
            <v-text-field v-model="title" label="Book title" />
            <v-textarea v-model="xmlContent" label="XML content" rows="10" auto-grow />
            <v-btn color="primary" :loading="loading" @click="uploadBook">
              Queue Book Upload
            </v-btn>
            <v-alert
              v-if="message"
              :type="messageType"
              variant="tonal"
              class="mt-4"
            >
              {{ message }}
            </v-alert>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Search</v-card-title>
          <v-card-text>
            <v-text-field v-model="searchText" label="Search title/content" />
            <v-btn color="secondary" @click="searchBooks">Search</v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="mb-4">
          <v-card-title>Books</v-card-title>
          <v-card-text>
            <v-list v-if="books.length > 0" lines="two">
              <v-list-item
                v-for="book in books"
                :key="book.id"
                :title="book.title"
                :subtitle="`Status: ${book.status ?? 'READY'}`"
              >
                <template #append>
                  <v-btn size="small" variant="tonal" @click="selectBook(book.id)">
                    View
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
            <p v-else class="text-body-2">No books yet.</p>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>Book Content</v-card-title>
          <v-card-text>
            <div v-if="!selectedBook">Select a book to view parsed HTML.</div>
            <div v-else>
              <h3 class="text-h6">{{ selectedBook.title }}</h3>
              <p class="text-body-2 mb-3">Status: {{ selectedBook.status }}</p>
              <v-alert
                v-if="selectedBook.failureReason"
                type="error"
                variant="tonal"
                class="mb-3"
              >
                {{ selectedBook.failureReason }}
              </v-alert>
              <div
                v-if="selectedBook.htmlContent"
                class="book-content pa-3 rounded border"
                v-html="selectedBook.htmlContent"
              />
              <p v-else class="text-body-2">
                Content not ready yet. It may still be processing in RabbitMQ worker.
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.book-content {
  max-height: 480px;
  overflow: auto;
}
</style>
