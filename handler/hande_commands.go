package handler

import (
	"github.com/diamondburned/arikawa/v3/api"
	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/state"
	"github.com/jcdea/discordbotthing/cmd"
)

func HandleCommand(s *state.State, e *gateway.InteractionCreateEvent, data *discord.CommandInteraction) api.InteractionResponse {
	switch data.Name {
	case "ping":
		return cmd.HandlePing(s, e)

	case "admin":
		return adminHandler(s, e, data)

	default:
		return cmd.CommandNotFound(data)

	}

}
