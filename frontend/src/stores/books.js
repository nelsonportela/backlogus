import { defineStore } from "pinia";
import { booksApi } from "../services/api.js";
import { useMediaStoreFactory } from "./useMediaStoreFactory";

export const useBooksStore = defineStore("books", () =>
  useMediaStoreFactory(
    {
      search: booksApi.search,
      getUserItems: booksApi.getUserBooks,
      addItem: booksApi.addBook,
      updateItem: booksApi.updateBook,
      removeItem: booksApi.removeBook,
      getItemDetails: booksApi.getBookDetails,
      getStats: () => ({ success: true, data: {} }), // Placeholder until stats endpoint exists
    },
    "book"
  )
);
