package tag

import (
	"hackmit/internal/storage"
)

type Handler struct {
	tagRepository storage.TagRepository
}

func NewHandler(tagRepository storage.TagRepository) *Handler {
	return &Handler{
		tagRepository,
	}
}
