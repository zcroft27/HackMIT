package models

import (
	"time"

	"github.com/google/uuid"
)

type SeenModels struct {
	UserID   uuid.UUID `json:"user_id"`
	BottleID int       `json:"bottle_id"`
	SeenAt   time.Time `json:"seen_at"`
}
