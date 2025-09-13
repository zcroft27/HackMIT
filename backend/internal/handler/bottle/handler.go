package bottle

import "hackmit/internal/storage"

type Handler struct {
	bottleRepository storage.BottleRepository
}

func NewHandler(bottleRepository storage.BottleRepository) *Handler {
	return &Handler{
		bottleRepository,
	}
}
