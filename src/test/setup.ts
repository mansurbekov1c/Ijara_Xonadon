import { vi } from "vitest";

// Testlar haqiqiy baza va admin sozlamalariga murojaat qilmaydi.
vi.stubEnv("APPWRITE_API_KEY", "");
vi.stubEnv("APPWRITE_ENDPOINT", "");
vi.stubEnv("APPWRITE_PROJECT_ID", "");
vi.stubEnv("ADMIN_PAROL", "");
