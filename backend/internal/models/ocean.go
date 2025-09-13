package models

type Ocean struct {
	ID          int     `json:"id"`
	Name        *string `json:"first_name,omitempty"`
	Description *string `json:"last_name,omitempty"`
	UserID      int     `json:"user_id"`
}
