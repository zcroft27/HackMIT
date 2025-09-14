package bottle

import (
	"fmt"
	"hackmit/internal/errs"
	"hackmit/internal/models"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetRandom(c *fiber.Ctx) error {
	var filterParams models.GetRandomBottleRequest

	if err := c.QueryParser(&filterParams); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	ocean, err := h.oceanRepository.GetOceanById(c.Context(), filterParams.OceanID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	bottle, err := h.bottleRepository.GetRandomBottle(c.Context(), filterParams, *ocean)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(bottle)
}
