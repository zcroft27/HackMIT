package schema

import (
	"context"
	"fmt"
	"hackmit/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func (r *UserRepository) AddUser(ctx context.Context, userID string, firstName *string, lastName *string) (*models.User, error) {
	const query = `Insert into public.user (id, first_name, last_name) Values ($1, $2, $3)RETURNING id, first_name, last_name;
	`
	var user models.User
	err := r.db.QueryRow(ctx, query, userID, firstName, lastName).Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName)

	if err != nil {
		return nil, fmt.Errorf("error querying database: %w", err)
	}

	return &user, nil
}

func (c *UserRepository) GetUserProfile(ctx context.Context, userId string) (*models.User, error) {

	const query = `
		SELECT user.id, first_name, last_name,  email
		FROM user join auth.users as u on user.id = u.id
		WHERE user.id = $1
		LIMIT 1
	`

	rows, err := c.db.Query(ctx, query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	user, err := pgx.CollectOneRow(rows, pgx.RowToStructByName[models.User])

	if err != nil {
		return nil, fmt.Errorf("error querying database for user: %w", err)
	}

	return &user, nil

}

func (c *UserRepository) DeleteUser(ctx context.Context, userId string) (string, error) {
	const query = `DELETE FROM user WHERE id = $1`
	_, err := c.db.Exec(ctx, query, userId)
	if err != nil {
		return "", fmt.Errorf("error querying database for user: %w", err)
	}
	return "User Deleted Successfully", nil
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{
		db,
	}
}
