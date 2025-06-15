import "server-only";

import {
  DEFAULT_SERVER_ERROR,
  NOT_FOUND_SERVER_ERROR,
  SERVER_VALIDATION_ERROR,
  ServerError,
  ServerErrorCode,
} from "@/shared/lib/error";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { logResponseBody, logResponseStatus, logResponseURL } from "./logger";
import { fromError } from "zod-validation-error";

type RequestMethod = "POST" | "DELETE" | "PATCH" | "PUT";

type Success<T> = {
  success: true;
  data: T;
  error?: never;
};

type Failure = {
  success: false;
  data?: never;
  error: ServerError;
};

// The ApiResponse is now a union type of Success or Failure
type ApiResponse<T> = Success<T> | Failure;

type ApiRequestConfig<T, R> = {
  endpoint: string | ((params: T) => string);
  method: RequestMethod;
  schema: z.ZodType<T>;
  transformResponse?: (data: any) => R;
};

/**
 * Generic client for server actions
 * @important Don't use it in the try/catch block, there is a redirect in the handleError method
 */
export const serverAction = {
  /**
   * Execute a validated API request with authentication
   */
  async execute<T, R>(
    config: ApiRequestConfig<T, R>,
    inputData: any
  ): Promise<ApiResponse<R>> {
    try {
      const { getToken } = await auth.protect();

      // 1. Validate input data
      const validationResult = config.schema.safeParse(inputData);
      if (!validationResult.success) {
        console.error(validationResult.error);
        throw new Error("Invalid data");
      }

      // 2. Get auth token
      const token = await getToken();

      // 3. Build endpoint if it's a function
      const endpoint =
        typeof config.endpoint === "function"
          ? config.endpoint(validationResult.data)
          : config.endpoint;

      // 4. Make the API request
      const response = await this.makeRequest({
        endpoint,
        data: validationResult.data,
        method: config.method,
        accessToken: token,
      });

      // 5. Process the API response
      return await this.processResponse(response, config.transformResponse);
    } catch (error) {
      return this.handleError(error);
    }
  },

  async makeRequest({
    endpoint,
    data,
    method,
    accessToken,
  }: {
    endpoint: string;
    data: any;
    method: RequestMethod;
    accessToken: string | null;
  }) {
    return await fetch(`${process.env.API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
  },

  async processResponse<R>(
    response: Response,
    transformer?: (data: any) => R
  ): Promise<ApiResponse<R>> {
    const isNoContent = response.status === 204;
    if (response.ok && isNoContent) {
      return {
        success: true,
        data: {} as R,
      };
    }

    const responseData = await response.json();

    if (!response.ok) {
      logResponseStatus(response);
      logResponseURL(response);

      if (response.status === NOT_FOUND_SERVER_ERROR.status) {
        return {
          success: false,
          error: NOT_FOUND_SERVER_ERROR,
        };
      }

      const validationErrors:
        | Array<{
            message: string;
            field: string;
          }>
        | undefined = responseData?.errors;
      if (validationErrors && validationErrors.length > 0) {
        return {
          success: false,
          error: SERVER_VALIDATION_ERROR(validationErrors[0].message),
        };
      }

      await logResponseBody(response);
      throw new Error("Server error");
    }

    const transformedData = transformer
      ? transformer(responseData)
      : responseData;

    return {
      success: true,
      data: transformedData,
    };
  },

  handleError(error: unknown): Failure {
    console.error(fromError(error));

    return {
      success: false,
      error: DEFAULT_SERVER_ERROR,
    };
  },
};
