package models

import (
	"time"

	"github.com/google/uuid"
)

type Bottle struct {
	ID           int        `json:"id"`
	Content      string     `json:"content"`
	Author       *string    `json:"author,omitempty"`
	TagID        int        `json:"tag_id"`
	UserID       *uuid.UUID `json:"user_id,omitempty"`
	LocationFrom *string    `json:"location_from,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
}

type CreateBottleRequest struct {
	Content      string     `json:"content"`
	Author       *string    `json:"author,omitempty"`
	TagID        *int       `json:"tag_id,omitempty"`
	UserID       *uuid.UUID `json:"user_id,omitempty"`
	LocationFrom *string    `json:"location_from,omitempty"`
}

type GetBottlesRequest struct {
	OceanID int `json:"ocean_id"`
}
