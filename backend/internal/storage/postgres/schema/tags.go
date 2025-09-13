package schema

import (
	"context"
	"fmt"
	"hackmit/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TagRepository struct {
	db *pgxpool.Pool
}

func (r *TagRepository) GetTags(ctx context.Context, filterParams models.GetTagsRequest) ([]models.Tag, error) {
	query := `
	SELECT tag.id, name, color
	FROM tag
	WHERE 1=1
	`

	var queryArgs []any

	if filterParams.Name != nil {
		query += ` AND name=$1`
		queryArgs = append(queryArgs, *filterParams.Name)
	}

	if filterParams.IncludeDefault == nil ||
		filterParams.IncludeDefault != nil && !(*filterParams.IncludeDefault) {
		query += `
			AND not name='Default'
		`
	}

	rows, err := r.db.Query(ctx, query, queryArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	tags, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Tag])

	if err != nil {
		return nil, fmt.Errorf("error querying database for tag: %w", err)
	}

	return tags, nil
}

func (r *TagRepository) GetDefaultTag(ctx context.Context) (*models.Tag, error) {
	query := `
	SELECT tag.id, name, color
	FROM tag
	WHERE name='Default'
	LIMIT 1
	`

	row, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer row.Close()
	tag, err := pgx.CollectOneRow(row, pgx.RowToStructByName[models.Tag])

	if err != nil {
		return nil, fmt.Errorf("error querying database for tag: %w", err)
	}

	return &tag, nil

}

func NewTagRepository(db *pgxpool.Pool) *TagRepository {
	return &TagRepository{
		db,
	}
}
