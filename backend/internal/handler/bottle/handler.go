package bottle

import "hackmit/internal/storage"

type Handler struct {
	bottleRepository storage.BottleRepository
	tagRepository    storage.TagRepository
}

func NewHandler(bottleRepository storage.BottleRepository, tagRepository storage.TagRepository) *Handler {
	return &Handler{
		bottleRepository,
		tagRepository,
	}
}
