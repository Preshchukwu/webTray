import axios from "axios";
import { ApiResponse } from "@/types";

/** Extract backend `responseMessage` from axios errors (e.g. 403 plan limits). */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong"
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data?.responseMessage) return data.responseMessage;
  }

  if (error instanceof Error && error.message) {
    // Avoid showing generic axios status text when we have no API message
    if (!error.message.startsWith("Request failed with status code")) {
      return error.message;
    }
  }

  return fallback;
}
