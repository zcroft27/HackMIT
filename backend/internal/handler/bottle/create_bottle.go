package bottle

import (
	"fmt"
	"hackmit/internal/errs"
	"hackmit/internal/models"

	"github.com/gofiber/fiber/v2"
)

func (h *Handler) CreateBottle(c *fiber.Ctx) error {
	var filterParams models.CreateBottleRequest

	if err := c.BodyParser(&filterParams); err != nil {
		return errs.BadRequest(fmt.Sprintf("error parsing request body: %v", err))
	}

	if filterParams.Personal != nil && *filterParams.Personal {
		personalTag, tag_err := h.tagRepository.GetPersonalTag(c.Context())
		if tag_err != nil {
			return tag_err
		}

		filterParams.TagID = &personalTag.ID
	} else if filterParams.TagID == nil {
		defaultTag, tag_err := h.tagRepository.GetDefaultTag(c.Context())
		if tag_err != nil {
			return tag_err
		}

		filterParams.TagID = &defaultTag.ID
	} else {
		return errs.BadRequest("Missing tag_id")
	}

	bottle, err := h.bottleRepository.CreateBottle(c.Context(), filterParams)
	if err != nil {
		return err
	}

	return c.Status(fiber.StatusOK).JSON(bottle)
}
