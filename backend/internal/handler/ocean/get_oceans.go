package ocean

import (
	"hackmit/internal/models"

	"github.com/gofiber/fiber/v2"
)

// GetOceans handles GET /api/v1/oceans
func (h *Handler) GetOceans(c *fiber.Ctx) error {
	var filterParams models.GetOceansRequest

	// Parse query parameters
	if name := c.Query("name"); name != "" {
		filterParams.Name = &name
	}

	if description := c.Query("description"); description != "" {
		filterParams.Description = &description
	}

	// Parse include_tags if provided
	if tagIDsStr := c.Query("include_tags"); tagIDsStr != "" {
		// You'll need to parse the tag IDs from the query string
		// This is a simplified version - adjust based on how you pass tags
	}

	oceans, err := h.oceanRepository.GetOceans(c.Context(), filterParams)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve oceans",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"oceans": oceans,
		"count":  len(oceans),
	})
}
