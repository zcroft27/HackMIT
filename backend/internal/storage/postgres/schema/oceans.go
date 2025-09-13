package schema

import (
	"context"
	"database/sql"
	"fmt"
	"hackmit/internal/models"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OceanRepository struct {
	db *pgxpool.Pool
}

func (r *OceanRepository) GetOceans(ctx context.Context, filterParams models.GetOceansRequest) ([]models.Ocean, error) {
	query := `
        SELECT DISTINCT o.id, o.name, o.description, o.user_id
        FROM ocean o
    `

	args := []interface{}{}
	conditions := []string{}
	argCount := 0

	// Join with tag_ocean if filtering by tags
	if len(filterParams.IncludeTags) > 0 {
		query += " INNER JOIN tag_ocean ON o.id = tag_ocean.ocean_id"

		placeholders := make([]string, len(filterParams.IncludeTags))
		for i, tagID := range filterParams.IncludeTags {
			argCount++
			placeholders[i] = fmt.Sprintf("$%d", argCount)
			args = append(args, tagID)
		}
		conditions = append(conditions, fmt.Sprintf("tag_ocean.tag_id IN (%s)", strings.Join(placeholders, ",")))
	}

	// Add name filter
	if filterParams.Name != nil && *filterParams.Name != "" {
		argCount++
		conditions = append(conditions, fmt.Sprintf("o.name ILIKE $%d", argCount))
		args = append(args, "%"+*filterParams.Name+"%")
	}

	// Add description filter
	if filterParams.Description != nil && *filterParams.Description != "" {
		argCount++
		conditions = append(conditions, fmt.Sprintf("o.description ILIKE $%d", argCount))
		args = append(args, "%"+*filterParams.Description+"%")
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}

	//query += " ORDER BY o.created_at DESC"

	// Execute query
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying oceans: %w", err)
	}
	defer rows.Close()

	// Collect oceans
	oceans, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Ocean])
	if err != nil {
		return nil, fmt.Errorf("error collecting ocean rows: %w", err)
	}

	return oceans, nil
}

func (r *OceanRepository) GetDefaultOcean(ctx context.Context) (*models.Ocean, error) {
	const query = `
        SELECT id, name, description, user_id
        FROM ocean
        WHERE user_id IS NULL and name = 'Default'
        ORDER BY id ASC
        LIMIT 1
    `

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("error querying default ocean: %w", err)
	}
	defer rows.Close()

	ocean, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.Ocean])
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("no default ocean found")
		}
		return nil, fmt.Errorf("error collecting ocean row: %w", err)
	}

	return &ocean, nil
}

func (r *OceanRepository) GetRandomPersonalOcean(ctx context.Context, currentUserId uuid.UUID) (*models.Ocean, error) {
	const query = `
        SELECT id, name, description, user_id
        FROM ocean
        WHERE user_id IS NOT NULL 
        AND user_id != $1::uuid
        ORDER BY RANDOM()
        LIMIT 1
    `

	rows, err := r.db.Query(ctx, query, currentUserId)
	if err != nil {
		return nil, fmt.Errorf("error querying random personal ocean: %w", err)
	}
	defer rows.Close()

	ocean, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.Ocean])
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("no personal oceans found")
		}
		return nil, fmt.Errorf("error collecting ocean row: %w", err)
	}

	return &ocean, nil
}

func (r *OceanRepository) GetOceanByUser(ctx context.Context, userId uuid.UUID) (*models.Ocean, error) {
	const query = `
        SELECT id, name, description, user_id
        FROM ocean
        WHERE user_id = $1::uuid
        LIMIT 1
    `

	rows, err := r.db.Query(ctx, query, userId)
	if err != nil {
		return nil, fmt.Errorf("error querying ocean by user: %w", err)
	}
	defer rows.Close()

	ocean, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.Ocean])
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, sql.ErrNoRows // Return standard no rows error
		}
		return nil, fmt.Errorf("error collecting ocean row: %w", err)
	}

	return &ocean, nil
}

func (r *OceanRepository) CreateOcean(ctx context.Context, name *string, description *string, userId uuid.UUID) (*models.Ocean, error) {
	const query = `
				INSERT INTO ocean (name, description, user_id)
				VALUES ($1, $2, $3::uuid)
				RETURNING id, name, description, user_id
			`

	var ocean models.Ocean
	err := r.db.QueryRow(ctx, query, name, description, userId).Scan(
		&ocean.ID,
		&ocean.Name,
		&ocean.Description,
		&ocean.UserID,
	)

	if err != nil {
		return nil, fmt.Errorf("error creating ocean: %w", err)
	}

	return &ocean, nil
}

func NewOceanRepository(db *pgxpool.Pool) *OceanRepository {
	return &OceanRepository{
		db: db,
	}
}
