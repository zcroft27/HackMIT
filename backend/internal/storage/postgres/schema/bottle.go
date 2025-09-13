package schema

import (
	"context"
	"fmt"
	"hackmit/internal/errs"
	"hackmit/internal/models"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BottleRepository struct {
	db *pgxpool.Pool
}

func (r *BottleRepository) CreateBottle(ctx context.Context, req models.CreateBottleRequest) (*models.Bottle, error) {
	var values []interface{} = []interface{}{req.Content}
	var columns []string = []string{"content"}

	if req.Author != nil {
		values = append(values, *req.Author)
		columns = append(columns, "author")
	}

	if req.TagID != nil {
		values = append(values, *req.TagID)
		columns = append(columns, "tag_id")
	} else {
		return nil, errs.BadRequest("Missing tag_id")
	}

	if req.UserID != nil {
		values = append(values, *req.UserID)
		columns = append(columns, "user_id")
	}

	if req.LocationFrom != nil {
		values = append(values, *req.LocationFrom)
		columns = append(columns, "location_from")
	}

	var numInputs []string
	for i := 1; i <= len(columns); i++ {
		numInputs = append(numInputs, fmt.Sprintf("$%d", i))
	}

	query := `
		INSERT INTO bottle
		(` + strings.Join(columns, ", ") + `)
		VALUES (` + strings.Join(numInputs, ", ") + `)
		RETURNING id, content, author, tag_id, user_id, location_from, created_at;
	`

	rows, _ := r.db.Query(ctx, query, values...)
	bottle, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.Bottle])

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}

	return &bottle, nil
}

func (r *BottleRepository) DeleteBottle(ctx context.Context, bottleId int) (string, error) {
	const query = `DELETE FROM bottle WHERE id = $1`
	_, err := r.db.Exec(ctx, query, bottleId)
	if err != nil {
		return "", fmt.Errorf("error querying database for user: %w", err)
	}
	return "Bottle Deleted Successfully", nil
}

func (r *BottleRepository) GetBottles(ctx context.Context, filterParams models.GetBottlesRequest) ([]models.Bottle, error) {
	const query = `SELECT b.id, b.content, b.author, b.tag_id, b.user_id, b.location_from, b.created_at
		FROM bottle b
		WHERE tag_id in (
			SELECT tag_id FROM tag_ocean
			WHERE ocean_id = $1
		);
	`
	fmt.Println(filterParams.OceanID)
	rows, err := r.db.Query(ctx, query, filterParams.OceanID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bottles, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Bottle])
	if err != nil {
		return nil, err
	}

	return bottles, nil
}

func (r *BottleRepository) GetBottlesByUser(ctx context.Context, userId int) ([]models.Bottle, error) {
	const query = `SELECT b.id, b.content, b.author, b.tag_id, b.user_id, b.location_from, b.created_at
		FROM bottle b
		WHERE user_id = $1
	`

	rows, err := r.db.Query(ctx, query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	bottles, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Bottle])
	if err != nil {
		return nil, err
	}

	return bottles, nil
}

func NewBottleRepository(db *pgxpool.Pool) *BottleRepository {
	return &BottleRepository{
		db,
	}
}
