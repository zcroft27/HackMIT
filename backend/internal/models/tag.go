package models

type Tag struct {
	ID    int     `json:"id"`
	Name  *string `json:"name,omitempty"`
	Color *string `json:"color,omitempty"`
}
