package utils

import (
	"log"
	"os"

	"github.com/diamondburned/arikawa/v3/discord"
)

func MustSnowflakeEnv(env string) discord.Snowflake {
	s, err := discord.ParseSnowflake(os.Getenv(env))
	if err != nil {
		log.Fatalf("Invalid snowflake for $%s: %v", env, err)
	}
	return s
}
