package auth

import (
	"fmt"
	"hackmit/internal/service/auth"
	"time"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) Login(c *fiber.Ctx) error {
	var creds Credentials
	var cookieExp time.Time

	if err := c.BodyParser(&creds); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Call SupabaseLogin function
	signInResponse, err := auth.SupabaseLogin(&h.config, creds.Email, creds.Password)
	if err != nil {
		fmt.Println("Supabase login error:", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	fmt.Println(creds.RememberMe)

	if creds.RememberMe {
		cookieExp = time.Now().Add(7 * 24 * time.Hour)
	} else {
		cookieExp = time.Time{}
	}

	// Set cookies
	c.Cookie(&fiber.Cookie{
		Name:     "userID",
		Value:    fmt.Sprintf("%d", signInResponse.User.ID),
		Expires:  cookieExp,
		Secure:   true,
		SameSite: "Lax",
	})

	c.Cookie(&fiber.Cookie{
		Name:     "jwt",
		Value:    signInResponse.AccessToken,
		Expires:  cookieExp,
		Secure:   true,
		SameSite: "Lax",
	})

	return c.Status(fiber.StatusOK).JSON(signInResponse)
}
