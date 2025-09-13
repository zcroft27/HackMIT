package models

import "time"

type Bottle struct {
	ID           int       `json:"id"`
	Content      *string   `json:"content,omitempty"`
	Author       *string   `json:"author,omitempty"`
	TagID        int       `json:"tag_id"`
	UserID       *int      `json:"user_id,omitempty"`
	LocationFrom *string   `json:"location_from,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}
