package ocean

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// GetOceanByUserID handles GET /api/v1/oceans/:id
func (h *Handler) GetOceanByUserID(c *fiber.Ctx) error {
	userIDStr := c.Params("id")

	// Parse the UUID
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid user ID format",
		})
	}

	ocean, err := h.oceanRepository.GetOceanByUser(c.Context(), userID)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "No ocean found for this user",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve ocean",
			"details": err.Error(),
		})
	}

	return c.JSON(ocean)
}
