package ocean

import (
	"github.com/gofiber/fiber/v2"
)

// GetDefaultOcean handles GET /api/v1/oceans/default
func (h *Handler) GetDefaultOcean(c *fiber.Ctx) error {
	ocean, err := h.oceanRepository.GetDefaultOcean(c.Context())
	if err != nil {
		if err.Error() == "no default ocean found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "No default ocean configured",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Failed to retrieve default ocean",
			"details": err.Error(),
		})
	}

	return c.JSON(ocean)
}
