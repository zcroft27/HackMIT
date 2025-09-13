package ocean

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetRandomPersonalOcean handles GET /api/v1/oceans/personal
func (h *Handler) GetRandomPersonalOcean(c *fiber.Ctx) error {
	// Get user ID from route parameter
	userIDStr := c.Params("userId")
	if userIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "User ID is required",
		})
	}

	currentUserID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID format",
		})
	}

	ocean, err := h.oceanRepository.GetRandomPersonalOcean(c.Context(), currentUserID)
	if err != nil {
		if err.Error() == "no personal oceans found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "No personal oceans available",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve random personal ocean",
			"details": err.Error(),
		})
	}

	return c.JSON(ocean)
}
