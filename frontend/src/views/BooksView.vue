<template>
  <div class="space-y-6">
    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="fixed top-4 right-4 z-[100] max-w-md p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <p class="text-sm font-medium">{{ errorMessage }}</p>
        <button
          @click="errorMessage = null"
          class="ml-3 text-red-400 hover:text-red-600 dark:text-red-300 dark:hover:text-red-100">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- User Library -->
    <MediaLibrary
      :media-type="'book'"
      :library-items="userBooks"
      @refresh-library="refreshLibrary"
      @show-details="showBookDetails"
      @update-status="updateStatus"
      @remove-from-library="removeBookFromLibrary" />

    <!-- Floating Action Button for adding books -->
    <AddToLibraryButton
      :media-type="'book'"
      :search-results="searchResults"
      :loading="loading"
      :library-items="userBooks"
      @search="handleSearch"
      @add-to-library="addBookToLibrary"
      @show-details="showBookDetails"
      @refresh-library="refreshLibrary" />

    <!-- Media Details Modal -->
    <MediaDetailsModal
      :is-open="showModal"
      :item="selectedBook"
      :media-type="'book'"
      :is-in-library="isBookInLibrary(selectedBook)"
      :current-status="selectedBook?.status"
      @close="closeModal"
      @add-to-library="addBookToLibraryFromModal"
      @remove-from-library="removeBookFromLibrary"
      @update-item="updateBookItem" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useBooksStore } from "@/stores/books";
import MediaDetailsModal from "@/components/media/MediaDetailsModal.vue";
import MediaLibrary from "@/components/media/MediaLibrary.vue";
import AddToLibraryButton from "@/components/ui/AddToLibraryButton.vue";

const route = useRoute();
const booksStore = useBooksStore();

// Modal state
const showModal = ref(false);
const selectedBook = ref(null);

// Error handling
const errorMessage = ref(null);

const showError = (message) => {
  errorMessage.value = message;
  // Auto-clear error after 5 seconds
  setTimeout(() => {
    errorMessage.value = null;
  }, 5000);
};

// Computed properties
const allUserBooks = computed(() => booksStore.items);
const searchResults = computed(() => booksStore.searchResults);
const loading = computed(() => booksStore.loading);
const searchError = computed(() => booksStore.searchError);

// Watch for search errors
watch(searchError, (newError) => {
  if (newError) {
    showError(newError);
  }
});

// Filtered books based on route query
const userBooks = computed(() => {
  const statusFilter = route.query.status;

  if (!statusFilter || statusFilter === "all") {
    return allUserBooks.value;
  }

  return allUserBooks.value.filter((book) => book.status === statusFilter);
});

const handleSearch = (query) => {
  booksStore.search(query);
};

// Watch route changes to handle status filtering
watch(
  () => route.query.status,
  () => {
    // Filter status changed - no action needed as computed property handles this
  }
);

const showBookDetails = async (book) => {
  // Check if this is a library book or search result
  // Library books have status and hardcover_id fields, search results have hardcoverId but no status
  const isLibraryBook =
    Object.prototype.hasOwnProperty.call(book, "status") &&
    Object.prototype.hasOwnProperty.call(book, "hardcover_id");

  if (isLibraryBook) {
    // For library books, use the stored data directly - do NOT fetch from Hardcover
    selectedBook.value = book;
    showModal.value = true;
  } else {
    // For search results, fetch detailed information from Hardcover
    selectedBook.value = book;
    showModal.value = true;

    const hardcoverId = book.hardcoverId;
    if (hardcoverId && !book.description) {
      const result = await booksStore.getItemDetails(hardcoverId);
      if (result.success) {
        // Merge the detailed data with the current book data
        selectedBook.value = {
          ...selectedBook.value,
          ...result.data,
        };
      }
    }
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedBook.value = null;
};

const addBookToLibrary = async (libraryData) => {

  console.log(libraryData);
  
  const bookData = libraryData.item;
  const status = libraryData.status;
  const quickReview = libraryData.quick_review;
  const notes = libraryData.notes;

  const result = await booksStore.addItem({
    hardcover_id: bookData.hardcoverId,
    title: bookData.title,
    cover_url: bookData.cover_url,
    authors: bookData.authors,
    release_date: bookData.release_date,
    genres: bookData.genres,
    description: bookData.description,
    page_count: bookData.pages,
    alternative_titles: bookData.alternative_titles,
    series_names: bookData.series_names,
    moods: bookData.moods,
    has_audiobook: bookData.has_audiobook,
    has_ebook: bookData.has_ebook,
    status: status,
    quick_review: quickReview,
    notes: notes,
  });

  if (!result.success) {
    showError(result.error);
  }
};

const addBookToLibraryFromModal = async (book) => {
  await addBookToLibrary(book);
  closeModal();
};

const removeBookFromLibrary = async (book) => {
  // Find the book in library by hardcover_id
  const libraryBook = userBooks.value.find(
    (b) => b.hardcover_id === (book.hardcover_id || book.hardcoverId || book.id)
  );

  if (libraryBook) {
    const result = await booksStore.removeItem(libraryBook.id);
    if (!result.success) {
      showError(result.error);
    } else {
      closeModal();
    }
  } else {
    showError("Book not found in your library");
  }
};

const updateStatus = async (bookId, status) => {
  const result = await booksStore.updateItem(bookId, { status });
  if (!result.success) {
    showError(result.error);
  }
};

const updateBookItem = async (bookId, updateData) => {
  const result = await booksStore.updateItem(bookId, updateData);

  if (result.success) {
    // Update local state
    const book = userBooks.value.find((b) => b.id === bookId);
    if (book) {
      Object.keys(updateData).forEach((key) => {
        book[key] = updateData[key];
      });
    }
    if (selectedBook.value && selectedBook.value.id === bookId) {
      Object.keys(updateData).forEach((key) => {
        selectedBook.value[key] = updateData[key];
      });
    }
  } else {
    showError(result.error);
  }
};

const isBookInLibrary = (book) => {
  if (!book) return false;
  return userBooks.value.some(
    (b) => b.hardcover_id === (book.hardcover_id || book.hardcoverId || book.id)
  );
};

const refreshLibrary = () => {
  booksStore.getUserItems();
};

onMounted(() => {
  booksStore.getUserItems();
});
</script>
