package auth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"hackmit/internal/config"
	"hackmit/internal/errs"
	"io"
	"net/http"
)

type Payload struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type userSignupResponse struct {
	ID int `json:"id"`
}

type signupResponse struct {
	AccessToken string             `json:"access_token"`
	User        userSignupResponse `json:"user"`
}

func SupabaseSignup(cfg *config.Supabase, email string, password string) (signupResponse, error) {
	supabaseURL := cfg.URL
	apiKey := cfg.AnonKey

	// Prepare the request payload
	payload := Payload{
		Email:    email,
		Password: password,
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return signupResponse{}, err
	}

	// Create the HTTP POST request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/auth/v1/signup", supabaseURL), bytes.NewBuffer(payloadBytes))
	if err != nil {
		fmt.Println("Error creating request:", err)
		return signupResponse{}, errs.BadRequest(fmt.Sprintf("failed to create request: %v", err))
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", apiKey))

	// Execute the request
	resp, err := Client.Do(req)
	if err != nil {
		fmt.Println("Error executing request:", err)
		return signupResponse{}, errs.BadRequest(fmt.Sprintf("failed to execute request: %v, %s", err, supabaseURL))
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return signupResponse{}, errs.BadRequest("failed to read response body")
	}

	// Check if the response was successful
	if resp.StatusCode != http.StatusOK {
		fmt.Println("Error response:", resp.StatusCode, string(body))
		return signupResponse{}, errs.BadRequest(fmt.Sprintf("failed to login %d, %s", resp.StatusCode, body))
	}

	// Parse the response
	var response signupResponse
	if err := json.Unmarshal(body, &response); err != nil {
		fmt.Println("Error parsing response:", err)
		return signupResponse{}, errs.BadRequest("failed to parse response")
	}

	// Return the access token
	return response, nil
}
