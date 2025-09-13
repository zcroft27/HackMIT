package bottle

import (
	"fmt"
	"hackmit/internal/errs"
	"hackmit/internal/models"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) GetBottles(c *fiber.Ctx) error {
	var filterParams models.GetBottlesRequest

	if err := c.QueryParser(&filterParams); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	var bottles []models.Bottle
	var err error
	if filterParams.UserID != nil {
		bottles, err = h.bottleRepository.GetBottlesByUser(c.Context(), *filterParams.UserID)
		if err != nil {
			return err
		}
	} else {
		bottles, err = h.bottleRepository.GetBottles(c.Context(), filterParams)
		if err != nil {
			return err
		}
	}

	return c.Status(fiber.StatusOK).JSON(bottles)
}
