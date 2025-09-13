package models

import "time"

type SeenModels struct {
	UserID   int       `json:"user_id"`
	BottleID int       `json:"bottle_id"`
	SeenAt   time.Time `json:"seen_at"`
}
