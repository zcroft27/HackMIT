package auth

import (
	"fmt"
	"hackmit/internal/config"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

// Middleware validates the JWT using Supabase's auth API
func Middleware(cfg *config.Supabase) fiber.Handler {
	return func(c *fiber.Ctx) error {
		token := c.Cookies("jwt", "")

		if token == "" {
			fmt.Println("JWT not found in middleware")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token not found"})
		}

		// Validate token with Supabase
		req, err := http.NewRequest("GET", fmt.Sprintf("%s/auth/v1/user", cfg.URL), nil)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create request"})
		}

		// Set headers
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("apikey", cfg.AnonKey)

		resp, err := Client.Do(req)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to validate token"})
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired token"})
		}

		// If validation is successful, proceed to the next middleware
		return c.Next()
	}
}
