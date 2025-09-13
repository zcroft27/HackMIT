package schema

import (
	"context"
	"database/sql"
	"fmt"
	"hackmit/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OceanRepository struct {
	db *pgxpool.Pool
}

func (r *OceanRepository) GetOceans(ctx context.Context, filterParams models.GetOceansRequest) ([]models.Ocean, error) {
	query := `
        SELECT o.id, o.name, o.description, o.user_id
        FROM ocean o
        WHERE 1=1
    `
	args := []interface{}{}
	argCount := 0

	// Add filters based on GetOceansRequest
	if filterParams.Name != nil && *filterParams.Name != "" {
		argCount++
		query += fmt.Sprintf(" AND o.name ILIKE $%d", argCount)
		args = append(args, "%"+*filterParams.Name+"%")
	}

	if filterParams.Description != nil && *filterParams.Description != "" {
		argCount++
		query += fmt.Sprintf(" AND o.description ILIKE $%d", argCount)
		args = append(args, "%"+*filterParams.Description+"%")
	}

	// Handle IncludeTags if needed
	if len(filterParams.IncludeTags) > 0 {
		tagIDs := make([]int, len(filterParams.IncludeTags))
		for i, tag := range filterParams.IncludeTags {
			tagIDs[i] = tag.ID
		}

		query = `
            SELECT DISTINCT o.id, o.name, o.description, o.user_id
            FROM ocean o
            JOIN tag_ocean to ON o.id = to.ocean_id
            WHERE 1=1
        `

		// Re-add previous filters
		if filterParams.Name != nil && *filterParams.Name != "" {
			query += fmt.Sprintf(" AND o.name ILIKE $%d", argCount)
		}

		if filterParams.Description != nil && *filterParams.Description != "" {
			query += fmt.Sprintf(" AND o.description ILIKE $%d", argCount)
		}

		argCount++
		query += fmt.Sprintf(" AND to.tag_id = ANY($%d)", argCount)
		args = append(args, tagIDs)
	}

	query += " ORDER BY o.id DESC"

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("error querying oceans: %w", err)
	}
	defer rows.Close()

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
        WHERE user_id IS NULL 
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
