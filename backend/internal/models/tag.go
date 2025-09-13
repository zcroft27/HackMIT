package models

type Tag struct {
	ID    int     `json:"id"`
	Name  *string `json:"name,omitempty"`
	Color *string `json:"color,omitempty"`
}

type GetTagsRequest struct {
	ExcludeDefault *bool   `json:"exclude_default,omitempty"`
	Name           *string `json:"name,omitempty"`
}
