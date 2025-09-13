package models

import "github.com/google/uuid"

type Ocean struct {
	ID          int        `json:"id"`
	Name        *string    `json:"name,omitempty"`
	Description *string    `json:"description,omitempty"`
	UserID      *uuid.UUID `json:"user_id"`
}

type GetOceansRequest struct {
	IncludeTags []int   `query:"include_tags,omitempty"`
	Name        *string `query:"name,omitempty"`
	Description *string `query:"description,omitempty"`
}
