import axios from "axios";

import { Credentials } from "../types/types";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1/",
  timeout: 10000,
});

// AUTH ENDPOINTS
export async function signUp(credentials: Credentials) {
  return await axiosClient.post("/auth/signup", {
    email: credentials.email,
    password: credentials.password,
    first_name: credentials.first_name,
    last_name: credentials.last_name,
  });
}

export async function login(email: string, password: string) {
  return await axiosClient.post("/auth/login", {
    email,
    password,
  });
}

// BOTTLE ENDPOINTS
export async function getBottle(oceanId: number, seenByUserId?: string) {
  const params: any = {
    ocean_id: oceanId,
  };
  
  if (seenByUserId) {
    params.seen_by_user_id = seenByUserId;
  }
  
  return await axiosClient.get("/bottle/random", { params });
}

export async function createBottle() {
  return await axiosClient.post("/bottle", {});
}

export async function deleteBottle(id: number) {
  return await axiosClient.delete("/bottle/" + id);
}

// TAG ENDPOINTS
export async function getTags() {
  return await axiosClient.get("/tags");
}