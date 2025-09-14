package bottle

import "hackmit/internal/storage"

type Handler struct {
	bottleRepository storage.BottleRepository
	tagRepository    storage.TagRepository
	oceanRepository  storage.OceanRepository
}

func NewHandler(bottleRepository storage.BottleRepository, tagRepository storage.TagRepository, oceanRepository storage.OceanRepository) *Handler {
	return &Handler{
		bottleRepository,
		tagRepository,
		oceanRepository,
	}
}
