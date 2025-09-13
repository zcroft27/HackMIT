package tag

import (
	"fmt"
	"hackmit/internal/errs"
	"hackmit/internal/models"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) Get(c *fiber.Ctx) error {
	var filterParams models.GetTagsRequest

	if err := c.QueryParser(&filterParams); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	tags, err := h.tagRepository.GetTags(c.Context(), filterParams)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(tags)
}
