package models

import "github.com/google/uuid"

type Ocean struct {
	ID          int        `json:"id"`
	Name        *string    `json:"name,omitempty"`
	Description *string    `json:"description,omitempty"`
	UserID      *uuid.UUID `json:"user_id"`
}

type GetOceansRequest struct {
	IncludeTags []Tag   `json:"include_tags,omitempty"`
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
}
