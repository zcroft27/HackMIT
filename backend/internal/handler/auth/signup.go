package auth

import (
	"fmt"
	"hackmit/internal/auth"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func (h *Handler) SignUp(c *fiber.Ctx) error {
	var creds Credentials
	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	response, err := auth.SupabaseSignup(&h.config, creds.Email, creds.Password)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Signup request failed: %v", err)})
	}

	// Parse the string ID to UUID
	userUUID, err := uuid.Parse(response.User.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Invalid user ID from Supabase: %v", err)})
	}

	_, err = h.userRepository.AddUser(c.Context(), userUUID.String(), creds.FirstName, creds.LastName, creds.Email)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": fmt.Sprintf("Adding User request failed: %v", err)})
	}

	// Set cookies with the JWT token
	expiration := time.Now().Add(30 * 24 * time.Hour) // 30 days
	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    response.AccessToken,
		Expires:  expiration,
		Secure:   true,
		SameSite: "Lax",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "user_id",        // Add the cookie name
		Value:    response.User.ID, // This is already a string
		Expires:  expiration,
		Secure:   true,
		SameSite: "Lax",
	})

	return c.Status(fiber.StatusCreated).JSON(response)
}
