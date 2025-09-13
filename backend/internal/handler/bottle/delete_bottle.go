package bottle

import (
	"hackmit/internal/errs"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) DeleteBottle(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return errs.BadRequest("Invalid bottle ID")
	}

	bottle, err := h.bottleRepository.DeleteBottle(c.Context(), id)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(bottle)
}
