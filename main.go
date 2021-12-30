package main

import (
	"context"
	"log"
	"os"

	"github.com/diamondburned/arikawa/v3/api"
	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/state"
	"github.com/joho/godotenv"
	"github.com/team-int/forum-bot/cmd"
	"github.com/team-int/forum-bot/handler"
	"github.com/team-int/forum-bot/utils"
)

// To run, do `GUILD_ID="GUILD ID" BOT_TOKEN="TOKEN HERE" go run .`
func main() {
	godotenv.Load()

	guildID := discord.GuildID(utils.MustSnowflakeEnv("GUILD_ID"))

	token := os.Getenv("BOT_TOKEN")
	if token == "" {
		log.Fatalln("No $BOT_TOKEN given.")
	}

	s := state.New("Bot " + token)

	app, err := s.CurrentApplication()
	if err != nil {
		log.Fatalln("Failed to get application ID:", err)
	}

	cmd.CreateCommands(s, app, guildID)

	s.AddHandler(func(e *gateway.InteractionCreateEvent) {
		var resp api.InteractionResponse

		switch data := e.Data.(type) {
		case *discord.CommandInteraction:
			resp = handler.HandleCommand(s, e, data)

			if err := s.RespondInteraction(e.ID, e.Token, resp); err != nil {
				log.Println("failed to send interaction callback:", err)
			}
			break
		case *discord.ButtonInteraction:

			resp = handler.HandleButton(s, e, guildID, data)
			log.Println("sending callback to button")
			if err := s.RespondInteraction(e.ID, e.Token, resp); err != nil {
				log.Println("failed to send interaction callback:", err)
			}
			break
		}
	})

	s.AddIntents(gateway.IntentGuilds)
	s.AddIntents(gateway.IntentGuildMessages)

	if err := s.Open(context.Background()); err != nil {
		log.Fatalln("failed to open:", err)
	}
	defer s.Close()

	log.Println("Gateway connected")

	// Block forever.
	select {}
}
