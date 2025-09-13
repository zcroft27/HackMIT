package models

type Ocean struct {
	ID          int     `json:"id"`
	Name        *string `json:"first_name,omitempty"`
	Description *string `json:"last_name,omitempty"`
	UserID      int     `json:"user_id"`
}

type GetOceansRequest struct {
	IncludeTags []Tag   `json:"include_tags,omitempty"`
	Name        *string `json:"name,omitempty"`
	Description *string `json:"description,omitempty"`
}
