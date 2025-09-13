package ocean

import (
	"hackmit/internal/storage"
)

type Handler struct {
	oceanRepository storage.OceanRepository
}

func NewHandler(oceanRepository storage.OceanRepository) *Handler {
	return &Handler{
		oceanRepository,
	}
}
