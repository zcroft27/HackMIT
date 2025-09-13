package ocean

import (
	"hackmit/internal/models"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetOceans(c *fiber.Ctx) error {
	var filterParams models.GetOceansRequest

	// Parse query parameters
	if name := c.Query("name"); name != "" {
		filterParams.Name = &name
	}

	if description := c.Query("description"); description != "" {
		filterParams.Description = &description
	}

	// Parse tag IDs for filtering
	// Example: /api/v1/oceans?tag_ids=1,2,3
	if tagIDsStr := c.Query("tag_ids"); tagIDsStr != "" {
		tagIDStrings := strings.Split(tagIDsStr, ",")
		tagIDs := make([]int, 0, len(tagIDStrings))

		for _, idStr := range tagIDStrings {
			id, err := strconv.Atoi(strings.TrimSpace(idStr))
			if err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error":   "Invalid tag ID format",
					"details": err.Error(),
				})
			}
			tagIDs = append(tagIDs, id)
		}

		filterParams.IncludeTags = tagIDs
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
